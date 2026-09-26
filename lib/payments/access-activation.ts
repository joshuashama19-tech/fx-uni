import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/payments/paystack";
import { verifyCharge as verifyKorapayCharge } from "@/lib/payments/korapay";
import { verifyCharge as verifyTestCharge } from "@/lib/payments/test-provider";
import { verifyNowPaymentsPayment, NOWPAYMENTS_NONTERMINAL_STATUSES } from "@/lib/payments/nowpayments";
import { getCourseId } from "@/lib/access";
import { redeemDiscountCode } from "@/lib/discounts";
import type { OrderRow, OrderStatus, PaymentProvider, ProfileRow } from "@/lib/types";

// The single place that turns a payment signal into an actual state change
// (order.status, course_access.status) — shared by every payment provider,
// not just Paystack. Called from two places:
//   - app/get-started/verify/page.tsx, right after the provider redirects
//     the student back from its hosted checkout page (the "did my payment
//     go through" moment the student actually sees)
//   - app/api/webhooks/paystack/route.ts and app/api/webhooks/korapay/route.ts,
//     on that provider's own "charge succeeded" event (the durable
//     confirmation path — works even if the student's browser never makes
//     it back to the callback/redirect URL)
// Both paths re-verify server-side against whichever provider this specific
// order actually used (order.payment_provider — see verifyPayment() below
// and lib/payments/provider.ts) — neither trusts its own trigger (a
// redirect query string, or a webhook payload's own "status" field) as
// sufficient on its own. This is what "trusted server-side verification"
// means concretely: the thing that activates access is the PROVIDER'S own
// API telling OUR server the payment succeeded, never the browser or the
// webhook body alone. This is also why an order's provider is always read
// from the order row itself, never re-resolved via
// lib/payments/provider.ts's resolvePaymentProvider() — that function only
// ever decides what a *new* checkout uses; re-deriving it here could
// disagree with what a given order actually used if the default is ever
// changed later.
//
// Idempotency: every processing attempt first tries to INSERT its
// payment_events row with a unique dedupe_key; a duplicate webhook delivery
// or a student refreshing the return page produces a second attempt with
// the SAME dedupe_key, which the table's unique constraint rejects
// (ON CONFLICT DO NOTHING) — so processing (and any further side effect)
// only actually happens once. course_access itself is additionally an
// upsert on unique(user_id, course_id), so even a genuine race between the
// webhook and the return-page verify path just converges on the same final
// state rather than erroring or double-granting. None of this changed for
// Korapay — it's exactly why requirement #10 ("reuse the existing
// provider-neutral successful-payment/access-activation flow") is
// satisfiable with this one dispatch point rather than a parallel copy.

export type PaymentSource = "webhook" | "return";

interface GenericVerifyResult {
  success: boolean;
  status: string;
  amountMinorUnits: number;
  currency: string;
}

/**
 * Re-verifies a reference against whichever provider actually processed
 * it. Both lib/payments/paystack.ts's verifyTransaction() and
 * lib/payments/korapay.ts's verifyCharge() already return results shaped
 * with the same success/status/amountMinorUnits/currency fields this
 * function's callers need, so this is a pure dispatch — no
 * provider-specific logic lives here.
 */
async function verifyPayment(provider: PaymentProvider, reference: string): Promise<GenericVerifyResult> {
  if (provider === "test") {
    return verifyTestCharge(reference);
  }
  if (provider === "korapay") {
    return verifyKorapayCharge(reference);
  }
  if (provider === "nowpayments") {
    return verifyNowPaymentsPayment(reference);
  }
  return verifyTransaction(reference);
}

interface ConfirmResult {
  outcome:
    | "granted"
    | "already_processed"
    | "order_not_found"
    | "verification_failed"
    | "mismatch"
    // NOWPayments-only: the payment is still waiting/confirming/confirmed/
    // sending on the blockchain — never granted, and deliberately never
    // routed through the dedupe-then-"already_processed" path below either
    // (see confirmSuccessfulPayment's own non-terminal check), since that
    // would incorrectly tell a student who reloads mid-confirmation that
    // their payment is done. See NOWPAYMENTS_NONTERMINAL_STATUSES in
    // lib/payments/nowpayments.ts.
    | "pending_confirmation";
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
      isTest: false,
    });
    return { outcome: "order_not_found" };
  }

  // Re-verify directly with whichever provider this order actually used —
  // the actual trusted confirmation. See verifyPayment() above.
  const verification = await verifyPayment(order.payment_provider, params.reference);

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

  // NOWPayments-only: unlike Paystack/Korapay/Test, whose verify APIs only
  // ever report a FINAL state by the time either call site reaches this
  // function, a NOWPayments payment can still be waiting/confirming/
  // confirmed/sending — genuinely "not decided yet", not a failure. This
  // must be checked, and returned as its own outcome, BEFORE the
  // dedupe-gated logPaymentEvent() call below: that call's dedupe_key is
  // fixed per (source, eventType, reference) for the return-page path
  // (eventType is always "verify" there), so a student reloading
  // /get-started/verify while still "confirming" would otherwise hit the
  // EXISTING dedupe row from their first visit and get back
  // "already_processed" — which the verify page treats as grant-equivalent
  // and redirects to /learn, incorrectly telling them they have access
  // before they've actually paid. Logged under a status-suffixed key
  // instead (so a waiting -> confirming transition is two distinct log
  // rows, while repeated polls at the SAME status correctly collapse to
  // one), and never proceeds past this point — no order/course_access
  // mutation happens for a non-terminal NOWPayments status.
  if (order.payment_provider === "nowpayments" && NOWPAYMENTS_NONTERMINAL_STATUSES.has(verification.status)) {
    await logPaymentEvent(admin, {
      dedupeKey: `${dedupeKey}:${verification.status}`,
      orderId: order.id,
      reference: params.reference,
      eventType: params.eventType ?? "verify",
      status: verification.status,
      rawPayload: params.rawPayload ?? { verification },
      isTest: order.is_test,
    });
    return { outcome: "pending_confirmation", orderId: order.id };
  }

  const inserted = await logPaymentEvent(admin, {
    dedupeKey,
    orderId: order.id,
    reference: params.reference,
    eventType: params.eventType ?? "verify",
    status: verification.status,
    rawPayload: params.rawPayload ?? { verification },
    isTest: order.is_test,
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

  const granted = await grantCourseAccess(order.user_id, order.id, order.is_test);
  if (!granted) {
    // grantCourseAccess() itself refused (order.is_test disagreed with the
    // user's current profiles.is_test) — the order is recorded as successful
    // above (an accurate record of what was verified), but access was
    // deliberately not granted. Surface this the same way a genuine mismatch
    // is surfaced elsewhere in this function, for manual review.
    return { outcome: "mismatch", orderId: order.id };
  }

  // Record the redemption (and increment the discount code's usage_count)
  // only now — after payment has been confirmed successful and access has
  // been granted, never at "Apply" time. Idempotent per order.id via
  // apply_discount_redemption()'s ON CONFLICT (order_id) DO NOTHING (see
  // supabase/migrations/0010_discount_codes.sql), so it's safe for this to
  // run again for the same order from a different dedupe key (e.g. the
  // webhook and the student's return-page verify both independently
  // reaching this point for the same payment) — only the first call ever
  // actually records a redemption or increments usage_count.
  if (order.discount_code_id && order.discount_code) {
    await redeemDiscountCode({
      discountCodeId: order.discount_code_id,
      userId: order.user_id,
      orderId: order.id,
      code: order.discount_code,
      discountAmountMinorUnits: order.discount_amount_minor_units,
      isTest: order.is_test,
    });
  }

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
      isTest: false,
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
    isTest: order.is_test,
  });

  if (!inserted) {
    return { outcome: "already_processed" };
  }

  const newStatus: OrderStatus = params.eventType.startsWith("refund.") ? "refunded" : "disputed";
  await admin.from("orders").update({ status: newStatus }).eq("id", order.id);

  await revokeCourseAccess(order.user_id, `paystack_${params.eventType}`);

  return { outcome: "revoked" };
}

/**
 * Korapay counterpart to handlePaystackRefundOrDispute() above, called only
 * from app/api/webhooks/korapay/route.ts on a `refund.success` event.
 * Deliberately narrower than the Paystack version: Korapay's own documented
 * webhook events (https://developers.korapay.com/docs/webhooks) for
 * refunds are just refund.success/refund.failed, and `refund.failed` means
 * a refund ATTEMPT failed (nothing actually changed about the original
 * successful charge), so it is intentionally not routed here at all — see
 * the webhook route, which only calls this for refund.success. Korapay's
 * separate chargeback event family (chargeback.pending/declined/partial/
 * lost/auto_accepted — see https://developers.korapay.com/docs/chargebacks)
 * is handled by handleKorapayChargebackLoss() below instead, not here — a
 * chargeback is a different lifecycle from a merchant-initiated refund.
 */
export async function handleKorapayRefund(params: {
  reference: string;
  eventType: string; // "refund.success"
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
      isTest: false,
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
    isTest: order.is_test,
  });

  if (!inserted) {
    return { outcome: "already_processed" };
  }

  const newStatus: OrderStatus = "refunded";
  await admin.from("orders").update({ status: newStatus }).eq("id", order.id);

  await revokeCourseAccess(order.user_id, `korapay_${params.eventType}`);

  return { outcome: "revoked" };
}

/**
 * Handles a Korapay chargeback that has actually resulted in the merchant
 * losing the disputed funds — called only from
 * app/api/webhooks/korapay/route.ts on `chargeback.lost` or
 * `chargeback.auto_accepted`.
 *
 * Korapay's chargeback event family
 * (https://developers.korapay.com/docs/chargebacks) is
 * chargeback.pending, chargeback.declined, chargeback.partial,
 * chargeback.lost and chargeback.auto_accepted. Korapay's own docs do not
 * give prose definitions for these beyond the event names themselves and
 * one sample payload (for chargeback.pending) — there is no
 * "chargeback.won"/"chargeback.accepted" event documented either. Per the
 * plain, industry-standard meaning of the two event names actually being
 * handled here: `lost` is the terminal "merchant lost the dispute" outcome,
 * and `auto_accepted` is Korapay/the scheme automatically resolving the
 * chargeback against the merchant (typically a missed response deadline)
 * — both mean the disputed funds are gone. `chargeback.pending` is not
 * terminal (nothing has been decided yet) and `chargeback.declined` is
 * left undocumented as to WHO declined (the merchant declining to contest,
 * or the claim being declined in the merchant's favor) — neither of those
 * two, nor `chargeback.partial` (a split outcome that isn't a clean "funds
 * lost"), is treated as a loss here. This intentionally does NOT assume
 * every chargeback event means lost funds — only the two whose names
 * unambiguously indicate that outcome are wired up; the rest are
 * acknowledged and ignored by the webhook route.
 *
 * Reference handling: a chargeback payload carries TWO references —
 * `data.reference` (the chargeback's own id, e.g. "KPY-CHG-...") and
 * `data.payment.reference` (the ORIGINAL order's reference, e.g.
 * "fxuni_..." — the same value this app generated at checkout and stored
 * as orders.paystack_reference). Only `data.payment.reference` identifies
 * which order is affected; `data.reference` is used purely to keep the
 * idempotency dedupe key unique per chargeback instance (see below) and is
 * never used to look up an order.
 *
 * Safety, matching the same principles as handlePaystackRefundOrDispute()
 * and handleKorapayRefund() above:
 *   - the affected order is identified by orderReference
 *     (data.payment.reference) alone — an unrecognized reference never
 *     touches any order (guards against acting on a chargeback for an
 *     order this app never created);
 *   - access is revoked ONLY when that order's current status is
 *     "successful" — a chargeback notification for an order that was
 *     never actually paid out (still pending, already failed/cancelled,
 *     or already refunded/disputed by an earlier event) is recorded for
 *     the audit trail but does not touch course_access or order.status
 *     again, so this can never revoke access for an order that wasn't
 *     granted access via a successful payment in the first place;
 *   - idempotent via the same payment_events.dedupe_key mechanism as
 *     every other handler in this file — keyed on the chargeback's OWN
 *     reference (not the order's), so a retried/duplicate delivery of the
 *     same chargeback.lost webhook is a no-op, while a separate later
 *     chargeback against the same order (a different data.reference)
 *     would still be recorded rather than silently swallowed;
 *   - never touches any order other than the one identified by
 *     orderReference.
 */
export async function handleKorapayChargebackLoss(params: {
  orderReference: string; // data.payment.reference
  chargebackReference: string; // data.reference — Korapay's own chargeback id
  eventType: string; // "chargeback.lost" | "chargeback.auto_accepted"
  rawPayload: unknown;
}): Promise<{
  outcome: "revoked" | "already_processed" | "order_not_found" | "not_previously_successful";
}> {
  const admin = createAdminClient();
  const dedupeKey = `webhook:${params.eventType}:${params.chargebackReference}`;

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("paystack_reference", params.orderReference)
    .maybeSingle<OrderRow>();

  if (!order) {
    await logPaymentEvent(admin, {
      dedupeKey,
      orderId: null,
      reference: params.orderReference,
      eventType: params.eventType,
      status: "order_not_found",
      rawPayload: params.rawPayload,
      isTest: false,
    });
    return { outcome: "order_not_found" };
  }

  const inserted = await logPaymentEvent(admin, {
    dedupeKey,
    orderId: order.id,
    reference: params.orderReference,
    eventType: params.eventType,
    status: null,
    rawPayload: params.rawPayload,
    isTest: order.is_test,
  });

  if (!inserted) {
    return { outcome: "already_processed" };
  }

  if (order.status !== "successful") {
    // Never actually granted access via a successful payment (still
    // pending, already failed/cancelled, or already moved to
    // refunded/disputed by an earlier event) — nothing to revoke. The
    // payment_events row above still records that this chargeback was
    // seen, for the audit trail.
    return { outcome: "not_previously_successful" };
  }

  const newStatus: OrderStatus = "disputed";
  await admin.from("orders").update({ status: newStatus }).eq("id", order.id);

  await revokeCourseAccess(order.user_id, `korapay_${params.eventType}`);

  return { outcome: "revoked" };
}

/**
 * NOWPayments counterpart to handleKorapayRefund() above, called only from
 * app/api/webhooks/nowpayments/route.ts when an IPN reports payment_status
 * = "refunded". NOWPayments' own documentation describes refunds as
 * support-initiated (there is no merchant-triggered refund API this app
 * calls) — this handler exists purely to react correctly if/when a
 * "refunded" status is ever delivered via the same IPN endpoint as every
 * other status, revoking access exactly like a Paystack/Korapay refund
 * does. Idempotent via the same payment_events.dedupe_key mechanism as
 * every other handler in this file.
 */
export async function handleNowPaymentsRefund(params: {
  reference: string;
  eventType: string; // "refunded" (NOWPayments' own payment_status value)
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
      isTest: false,
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
    isTest: order.is_test,
  });

  if (!inserted) {
    return { outcome: "already_processed" };
  }

  const newStatus: OrderStatus = "refunded";
  await admin.from("orders").update({ status: newStatus }).eq("id", order.id);

  await revokeCourseAccess(order.user_id, `nowpayments_${params.eventType}`);

  return { outcome: "revoked" };
}

/**
 * Grants access from a verified order. Before writing anything, cross-checks
 * the order's own is_test against the user's CURRENT profiles.is_test —
 * refusing on any mismatch — so a course_access row can never authorize a
 * user whose own is_test flag disagrees with it. This is what keeps a
 * production user from ever being authorized by a test order (or the
 * reverse) even if some future bug let an inconsistent order slip through
 * checkout-action.ts. Returns false (and grants nothing) on that mismatch;
 * true once course_access is written.
 */
async function grantCourseAccess(userId: string, orderId: string, isTest: boolean): Promise<boolean> {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("is_test")
    .eq("id", userId)
    .maybeSingle<Pick<ProfileRow, "is_test">>();

  if (!profile || profile.is_test !== isTest) {
    console.error(
      "[access-activation] refusing to grant course access: order.is_test does not match the user's current profiles.is_test",
      { userId, orderId, orderIsTest: isTest, profileIsTest: profile?.is_test ?? null }
    );
    return false;
  }

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
        is_test: isTest,
      },
      { onConflict: "user_id,course_id" }
    );
  return true;
}

/**
 * Manual grant by an admin (e.g. a payment handled outside Paystack) — not
 * tied to any order. This is the general Students-page grant path
 * (lib/admin/actions.ts's grantAccessAction), never the Test Mode one — it
 * refuses outright on a test account (findStudents() already excludes test
 * accounts from that page's search, so this is a second, independent guard
 * against a crafted request bypassing that): without it, an is_test: false
 * course_access row could be written for a test profile, which would then
 * wrongly count toward the Dashboard's real "Active course access" number
 * even though checkCourseAccessInternal()'s own is_test cross-check
 * (lib/access.ts) would still correctly keep that test account from actually
 * being authorized. Use /admin/test-mode's resetTestAccountAction to
 * manage a test account's access instead.
 */
export async function grantCourseAccessManually(userId: string, adminId: string, notes: string) {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("is_test")
    .eq("id", userId)
    .maybeSingle<Pick<ProfileRow, "is_test">>();

  if (profile?.is_test) {
    console.error(
      "[access-activation] refusing manual course_access grant: target is a test account — use /admin/test-mode instead",
      { userId }
    );
    return;
  }

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
        is_test: false,
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

  const { data: profile } = await admin
    .from("profiles")
    .select("is_test")
    .eq("id", userId)
    .maybeSingle<Pick<ProfileRow, "is_test">>();

  if (profile?.is_test) {
    console.error(
      "[access-activation] refusing course_access restore: target is a test account — use /admin/test-mode instead",
      { userId }
    );
    return;
  }

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
        is_test: false,
      },
      { onConflict: "user_id,course_id" }
    );
}

function mapFailureStatus(providerStatus: string): OrderStatus {
  // "abandoned" is Paystack's own status string for an abandoned checkout.
  // "cancelled" is never produced by Paystack or Korapay — it's only ever
  // returned by lib/payments/test-provider.ts's verifyCharge(), when a test
  // account clicks "Simulate cancelled checkout" (as distinct from "Simulate
  // failed payment", which reports "failed" — see test-provider.ts). Without
  // this, a simulated cancellation would collapse into the same
  // OrderStatus "failed" as a simulated decline, losing the distinction the
  // three separate buttons on app/get-started/test-checkout exist to
  // preserve.
  if (providerStatus === "abandoned" || providerStatus === "cancelled") return "cancelled";
  // NOWPayments-only, both confirmed against its own documented status
  // meanings (see lib/payments/nowpayments.ts): "expired" means the
  // customer never sent funds within NOWPayments' payment window — no money
  // ever moved, so this is treated the same as "cancelled" rather than
  // "failed" (an attempted-but-declined charge), matching the distinction
  // this function already draws between the two for Paystack/Test.
  // "partially_paid" means the customer sent LESS than the full amount —
  // access must never be granted (this app's finished-only success check
  // already guarantees that, since partially_paid !== "finished"), and is
  // deliberately mapped to "disputed" rather than a plain "failed": it's a
  // fundamentally different case (funds DID arrive, just not enough) that
  // needs a human to look at and decide — reusing "disputed" rather than
  // growing OrderStatus with a NOWPayments-specific value, per a decision
  // confirmed with Josh during planning.
  if (providerStatus === "expired") return "cancelled";
  if (providerStatus === "partially_paid") return "disputed";
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
    // Copied by every call site from the order this event is for (false when
    // no order was found at all) — lets this append-only log be filtered
    // without a join, matching every other is_test column.
    isTest: boolean;
  }
): Promise<boolean> {
  const { error } = await admin.from("payment_events").insert({
    dedupe_key: event.dedupeKey,
    order_id: event.orderId,
    paystack_reference: event.reference,
    event_type: event.eventType,
    status: event.status,
    raw_payload: event.rawPayload as Record<string, unknown>,
    is_test: event.isTest,
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
