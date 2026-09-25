import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TestPaymentSimulationRow } from "@/lib/types";

// Test-mode counterpart to lib/payments/paystack.ts / lib/payments/korapay.ts
// — same two-function shape (initializeCharge / verifyCharge) so
// lib/payments/checkout-action.ts and lib/payments/access-activation.ts need
// only one added dispatch branch each to treat a test order exactly like a
// real one from that point on. Makes NO network call to Korapay or Paystack
// under any circumstance — see supabase/migrations/0013_test_mode.sql's file
// header for the full design rationale.
//
// initializeCharge() doesn't start anything with a third party; it just
// hands back the path of this app's own in-app simulated-checkout page
// (app/get-started/test-checkout), which is where the actual "charge" is
// decided by the test account clicking Success/Failed/Cancelled. verifyCharge()
// is the trusted read-back of whatever that page's server action
// (lib/payments/test-checkout-actions.ts) already wrote to
// test_payment_simulations — this function never writes that table itself,
// only reads it, mirroring how verifyTransaction()/verifyCharge() (Korapay)
// only ever read the real provider's own verify API.

export interface InitializeChargeParams {
  reference: string;
}

export interface InitializeChargeResult {
  checkoutUrl: string;
  reference: string;
}

/**
 * Returns the in-app test-checkout URL for this reference. Synchronous in
 * spirit (no I/O) but kept async to match initializeTransaction()/
 * initializeCharge()'s signatures exactly, so checkout-action.ts's dispatch
 * doesn't need special-casing beyond which branch it calls.
 */
export async function initializeCharge(params: InitializeChargeParams): Promise<InitializeChargeResult> {
  return {
    checkoutUrl: `/get-started/test-checkout?reference=${encodeURIComponent(params.reference)}`,
    reference: params.reference,
  };
}

export interface VerifyChargeResult {
  success: boolean;
  status: string; // 'success' | 'failed' | 'cancelled' | 'not_simulated'
  amountMinorUnits: number;
  currency: string;
  reference: string;
  customerEmail: string | null;
}

/**
 * Trusted read-back for a test order — the test-mode equivalent of
 * verifyTransaction()/verifyCharge() actually asking Paystack/Korapay's own
 * API. Reads test_payment_simulations (service-role only; no RLS policy
 * grants anon/authenticated access — see that table's own comment in
 * 0013_test_mode.sql) by reference, never trusting a query string or request
 * body directly. No row yet (the test account hasn't clicked a button on the
 * simulated checkout page) reports success:false / status:'not_simulated' —
 * the same "not actually confirmed yet" outcome as a real provider that has
 * no record of the charge.
 */
export async function verifyCharge(reference: string): Promise<VerifyChargeResult> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("test_payment_simulations")
    .select("*")
    .eq("reference", reference)
    .maybeSingle<TestPaymentSimulationRow>();

  if (!data) {
    return {
      success: false,
      status: "not_simulated",
      amountMinorUnits: 0,
      currency: "",
      reference,
      customerEmail: null,
    };
  }

  return {
    // 'success' is the only outcome that reports success:true — 'failed' and
    // 'cancelled' both report false, exactly mirroring a declined or
    // abandoned real charge (see confirmSuccessfulPayment in
    // lib/payments/access-activation.ts, which treats both the same way).
    success: data.outcome === "success",
    status: data.outcome,
    amountMinorUnits: data.amount_minor_units,
    currency: data.currency,
    reference,
    customerEmail: null,
  };
}
