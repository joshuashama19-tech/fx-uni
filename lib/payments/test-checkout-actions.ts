"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRow, TestPaymentOutcome } from "@/lib/types";

// Backs the three buttons on app/get-started/test-checkout (Success / Failed
// / Cancelled). This is the test-mode counterpart to what Korapay's/
// Paystack's own hosted checkout page does when a real card is charged —
// except here the "charge" is just this app deciding, at the test account's
// own request, what test_payment_simulations should say happened.
//
// Never trusts formData alone: re-verifies, directly against the database,
// that the requesting session owns a still-pending, is_test,
// payment_provider='test' order for this reference before writing anything —
// the same "never trust the trigger alone" posture the real webhook routes
// already have toward their own payloads (see lib/payments/access-activation.ts).

const VALID_OUTCOMES: readonly TestPaymentOutcome[] = ["success", "failed", "cancelled"];

function isValidOutcome(value: string): value is TestPaymentOutcome {
  return (VALID_OUTCOMES as readonly string[]).includes(value);
}

export async function simulateTestPaymentAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/get-started");
  }

  const reference = String(formData.get("reference") || "").trim();
  const rawOutcome = String(formData.get("outcome") || "").trim();

  if (!reference || !isValidOutcome(rawOutcome)) {
    redirect("/get-started");
  }
  const outcome = rawOutcome;

  const admin = createAdminClient();

  // The re-verification: looked up by reference alone (never trusting an
  // order id from the form), then checked against every invariant a
  // legitimate test-checkout session must satisfy. Any mismatch — wrong
  // owner, not actually a test order, not actually pending — is treated as
  // "this session is no longer valid" rather than acted upon.
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("paystack_reference", reference)
    .maybeSingle<OrderRow>();

  if (
    !order ||
    order.user_id !== user.id ||
    !order.is_test ||
    order.payment_provider !== "test" ||
    order.status !== "pending"
  ) {
    redirect(`/get-started?error=${encodeURIComponent("This test checkout session is no longer valid.")}`);
  }

  // Snapshot the order's own amount/currency at simulation time — see
  // test_payment_simulations.amount_minor_units's own comment in
  // 0013_test_mode.sql. Written once per reference (the table's primary
  // key); a duplicate click (double-submit, browser back-button replay)
  // hits the unique-violation branch below and is treated as already
  // recorded, not an error — same idempotency posture as
  // payment_events.dedupe_key.
  const { error: insertError } = await admin.from("test_payment_simulations").insert({
    reference,
    order_id: order.id,
    outcome,
    amount_minor_units: order.amount_minor_units,
    currency: order.currency,
    simulated_by: user.id,
  });

  if (insertError && insertError.code !== "23505") {
    redirect(
      `/get-started?error=${encodeURIComponent("Could not record the simulated payment. Please try again.")}`
    );
  }

  // From here on, this is indistinguishable to the rest of the app from a
  // real provider redirecting the browser back after checkout — the same
  // /get-started/verify page, which calls confirmSuccessfulPayment()
  // (lib/payments/access-activation.ts) exactly as it would for Paystack or
  // Korapay. That function dispatches to lib/payments/test-provider.ts's
  // verifyCharge() for a 'test' order, which reads back the row just written
  // above.
  redirect(`/get-started/verify?reference=${encodeURIComponent(reference)}`);
}
