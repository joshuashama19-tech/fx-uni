import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/payments/paystack";
import { getCourseId } from "@/lib/access";
import type { OrderRow, OrderStatus } from "@/lib/types";

// The single place that turns a payment signal into an actual state change
// (order.status, course_access.status). Called from two places:
//   - app/get-started/verify/page.tsx, right after Paystack redirects the
//     student back from its hosted checkout page (the "did my payment go
//     through" moment the student actually sees)
//   - app/api/webhooks/paystack/route.ts, on a `charge.success` event (the
//     durable confirmation path — works even if the student's browser never
//     makes it back to the callback URL)
// Both paths re-verify with Paystack's server-side /transaction/verify
// endpoint here — neither trusts its own trigger (a redirect query string,
// or a webhook payload's own "status" field) as sufficient on its own. This
// is what "trusted server-side verification" (section 8) means concretely:
// the thing that activates access is Paystack's API telling OUR server the
// transaction succeeded, never the browser or the webhook body alone.
//
// Idempotency: every processing attempt first tries to INSERT its
// payment_events row with a unique dedupe_key; a duplicate webhook delivery
// or a student refreshing the return page produces a second attempt with
// the SAME dedupe_key, which the table's unique constraint rejects
// (ON CONFLICT DO NOTHING) — so processing (and any further side effect)
// only actually happens once. course_access itself is additionally an
// upsert on unique(user_id, course_id), so even a genuine race between the
// webhook and the return-page verify path just converges on the same final
// state rather than erroring or double-granting.

export type PaymentSource = "webhook" | "return";

interface ConfirmResult {
  outcome: "granted" | "already_processed" | "order_not_found" | "verification_failed" | "mismatch";
  orderId?: string;
}

export async function confirmSuccessfulPayment(params: {
  reference: string;
  source: PaymentSource;
  eventType?: string; // the Paystack event name when called from the webhook, e.g. "charge.success"
  rawPayload?: unknown;
}): Promise<ConfirmResult> {
  const admin = createAdminClient();
  const dedupeKey = `${params.source}:${params.eventType ?? "verify"}:${params.reference}`;

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("paystack_reference", params.reference)
    .maybeSingle<OrderRow>();

  if (!order) {
    // No order we created matches this reference — never act on an
    // unrecognized reference (guards against a forged/replayed reference
    // that doesn't correspond to a checkout we actually initiated).
    await logPaymentEvent(admin, {
      dedupeKey,
      orderId: null,
      reference: params.reference,
      eventType: params.eventType ?? "verify",
      status: "order_not_found",
      rawPayload: params.rawPayload ?? {},
    });
    return { outcome: "order_not_found" };
  }

  // Re-verify with Paystack directly — the actual trusted confirmation.
  const verification = await verifyTransaction(params.reference);

  // The order row is itself the authoritative record of what this specific
  // checkout was for: it was written server-side, at checkout-initiation
  // time, from resolvePricing()'s output (lib/payments/checkout-action.ts),
  // and students have no RLS write access to it afterward (no update policy
  // exists on orders for the authenticated role — see
  // supabase/migrations/0001_init.sql). So the only thing that needs
  // checking here is that Paystack's own verified amount matches what THIS
  // order was created for — never a freshly re-resolved "current" price,
  // which could legitimately have moved (a promotion starting, ending, or
  // being edited by an admin) in the minutes between checkout and this
  // confirmation. Re-checking against a moving target would risk disputing
  // a perfectly legitimate payment purely because the price changed while
  // the student was on Paystack's hosted checkout page.
  const matchesExpectedAmount = verification.amountMinorUnits === order.amount_minor_units;
  const matchesExpectedCurrency = verification.currency === order.currency;

  const inserted = await logPaymentEvent(admin, {
    dedupeKey,
    orderId: order.id,
    reference: params.reference,
    eventType: params.eventType ?? "verify",
    status: verification.status,
    rawPayload: params.rawPayload ?? { verification },
  });

  if (!inserted) {
    // This exact (source, eventType, reference) was already processed —
    // course_access/order state is already whatever it should be.
    return { outcome: "already_processed", orderId: order.id };
  }

  if (!verification.success) {
    if (order.status === "pending") {
      await admin.from("orders").update({ status: mapFailureStatus(verification.status) }).eq("id", order.id);
    }
    return { outcome: "verification_failed", orderId: order.id };
  }

  if (!matchesExpectedAmount || !matchesExpectedCurrency) {
    // Verified as "successful" by Paystack, but for a different
    // amount/currency than what this order was created for — never grant
    // access on a mismatch; flag it for manual review instead.
    await admin
      .from("orders")
      .update({ status: "disputed", metadata: { ...order.metadata, amount_mismatch: true } })
      .eq("id", order.id);
    return { outcome: "mismatch", orderId: order.id };
  }

  if (order.status !== "successful") {
    await admin.from("orders").update({ status: "successful" }).eq("id", order.id);
  }

  await grantCourseAccess(order.user_id, order.id);

  return { outcome: "granted", orderId: order.id };
}

export async function handlePaystackRefundOrDispute(params: {
  reference: string;
  eventType: string; // e.g. "refund.processed", "charge.dispute.create"
  rawPayload: unknown;
}): Promise<{ outcome: "revoked" | "already_processed" | "order_not_found" }> {
  const admin = createAdminClient();
  const dedupeKey = `webhook:${params.eventType}:${params.reference}`;

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("paystack_reference", params.reference)
    .maybeSingle<OrderRow>();

  if (!order) {
    await logPaymentEvent(admin, {
      dedupeKey,
      orderId: null,
      reference: params.reference,
      eventType: params.eventType,
      status: "order_not_found",
      rawPayload: params.rawPayload,
    });
    return { outcome: "order_not_found" };
  }

  const inserted = await logPaymentEvent(admin, {
    dedupeKey,
    orderId: order.id,
    reference: params.reference,
    eventType: params.eventType,
    status: null,
    rawPayload: params.rawPayload,
  });

  if (!inserted) {
    return { outcome: "already_processed" };
  }

  const newStatus: OrderStatus = params.eventType.startsWith("refund.") ? "refunded" : "disputed";
  await admin.from("orders").update({ status: newStatus }).eq("id", order.id);

  await revokeCourseAccess(order.user_id, `paystack_${params.eventType}`);

  return { outcome: "revoked" };
}

async function grantCourseAccess(userId: string, orderId: string) {
  const admin = createAdminClient();
  await admin
    .from("course_access")
    .upsert(
      {
        user_id: userId,
        course_id: getCourseId(),
        status: "active",
        order_id: orderId,
        granted_at: new Date().toISOString(),
        revoked_at: null,
      },
      { onConflict: "user_id,course_id" }
    );
}

/** Manual grant by an admin (e.g. a payment handled outside Paystack) — not tied to any order. */
export async function grantCourseAccessManually(userId: string, adminId: string, notes: string) {
  const admin = createAdminClient();
  await admin
    .from("course_access")
    .upsert(
      {
        user_id: userId,
        course_id: getCourseId(),
        status: "active",
        granted_at: new Date().toISOString(),
        revoked_at: null,
        granted_by: adminId,
        notes,
      },
      { onConflict: "user_id,course_id" }
    );
}

export async function revokeCourseAccess(userId: string, reason: string) {
  const admin = createAdminClient();
  await admin
    .from("course_access")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      notes: reason,
    })
    .eq("user_id", userId)
    .eq("course_id", getCourseId());
}

export async function restoreCourseAccess(userId: string, grantedByAdminId: string) {
  const admin = createAdminClient();
  await admin
    .from("course_access")
    .upsert(
      {
        user_id: userId,
        course_id: getCourseId(),
        status: "active",
        granted_at: new Date().toISOString(),
        revoked_at: null,
        granted_by: grantedByAdminId,
        notes: "Restored by admin",
      },
      { onConflict: "user_id,course_id" }
    );
}

function mapFailureStatus(paystackStatus: string): OrderStatus {
  if (paystackStatus === "abandoned") return "cancelled";
  return "failed";
}

async function logPaymentEvent(
  admin: ReturnType<typeof createAdminClient>,
  event: {
    dedupeKey: string;
    orderId: string | null;
    reference: string;
    eventType: string;
    status: string | null;
    rawPayload: unknown;
  }
): Promise<boolean> {
  const { error } = await admin.from("payment_events").insert({
    dedupe_key: event.dedupeKey,
    order_id: event.orderId,
    paystack_reference: event.reference,
    event_type: event.eventType,
    status: event.status,
    raw_payload: event.rawPayload as Record<string, unknown>,
  });
  // A unique-violation on dedupe_key means this exact event was already
  // recorded — that's the expected, successful "duplicate, skip" path, not
  // an error condition.
  if (error) {
    if (error.code === "23505") return false;
    throw error;
  }
  return true;
}
