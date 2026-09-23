import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DiscountCodeRow } from "@/lib/types";

// -----------------------------------------------------------------------
// Discount code validation + redemption.
//
// Mirrors lib/pricing.ts's core rule: the browser is never trusted for the
// amount. A discount code is looked up and re-validated server-side EVERY
// time it matters — once (as a preview) when the student clicks "Apply" on
// /get-started, and again, independently, inside initializeCheckoutAction
// right before the order is created and Paystack is charged. The "Apply"
// preview is never itself sufficient to get a discount applied to a charge;
// it's just a convenience redirect that carries the code in the query
// string (see applyDiscountCodeAction in app/get-started/page.tsx) — the
// checkout action re-runs validateDiscountCode() from scratch.
//
// discount_codes/discount_code_redemptions have NO RLS read policy for
// anon/authenticated at all (see supabase/migrations/0010_discount_codes.sql)
// — a student can never enumerate or directly query codes. Every read here
// goes through the service-role client, gated by the fact that this module
// only ever returns a yes/no validation result (and, on success, the
// resolved discount amount) — never the raw row or any other code's data.
//
// usage_count is NEVER incremented by validateDiscountCode() (an "Apply"
// click, or a checkout-time re-validation, is not a redemption) — only
// redeemDiscountCode() increments it, and only after a payment has been
// confirmed successful (called from lib/payments/access-activation.ts).
// -----------------------------------------------------------------------

/** A discount can never take the payable amount below this floor (₦1). */
export const MIN_PAYABLE_MINOR_UNITS = 100;

export function normalizeDiscountCode(raw: string): string {
  return raw.trim().toUpperCase();
}

/**
 * Computes the discount amount for a given base price, in minor units.
 * Pure function — no DB access — so it's unit-testable and reused by both
 * validateDiscountCode() (preview) and the checkout action (final amount).
 *
 * Always clamps so the resulting discount is between 0 and
 * (baseAmountMinorUnits - MIN_PAYABLE_MINOR_UNITS) inclusive — a discount
 * can never zero out, go negative, or exceed what would leave less than the
 * floor payable.
 */
export function computeDiscountAmount(
  discount: Pick<DiscountCodeRow, "discount_type" | "discount_value">,
  baseAmountMinorUnits: number
): number {
  const rawDiscount =
    discount.discount_type === "percentage"
      ? Math.round((baseAmountMinorUnits * discount.discount_value) / 100)
      : discount.discount_value;

  const maxDiscount = Math.max(0, baseAmountMinorUnits - MIN_PAYABLE_MINOR_UNITS);
  return Math.min(Math.max(rawDiscount, 0), maxDiscount);
}

export function isWithinWindow(
  row: Pick<DiscountCodeRow, "starts_at" | "ends_at">,
  now: Date
): "before_start" | "after_end" | "within" {
  if (row.starts_at && now < new Date(row.starts_at)) return "before_start";
  if (row.ends_at && now > new Date(row.ends_at)) return "after_end";
  return "within";
}

export type DiscountValidationFailureReason =
  | "not_found"
  | "inactive"
  | "not_started"
  | "expired"
  | "max_uses_reached"
  | "max_uses_per_customer_reached"
  | "service_unavailable";

export type DiscountValidationResult =
  | {
      valid: true;
      discount: DiscountCodeRow;
      discountAmountMinorUnits: number;
      finalAmountMinorUnits: number;
    }
  | { valid: false; reason: DiscountValidationFailureReason };

export function discountErrorMessage(reason: DiscountValidationFailureReason): string {
  switch (reason) {
    case "not_found":
      return "That discount code isn't valid.";
    case "inactive":
      return "That discount code is no longer active.";
    case "not_started":
      return "That discount code isn't active yet.";
    case "expired":
      return "That discount code has expired.";
    case "max_uses_reached":
      return "That discount code has reached its usage limit.";
    case "max_uses_per_customer_reached":
      return "You've already used that discount code.";
    case "service_unavailable":
      return "Couldn't check that discount code right now. Please try again.";
  }
}

/**
 * Looks up `code`, re-validates every rule (active, window, total usage,
 * per-customer usage), and — only if every check passes — returns the
 * resolved discount/final amount for `baseAmountMinorUnits`. Never mutates
 * anything (no usage_count change here); see redeemDiscountCode() for that.
 */
export async function validateDiscountCode(
  rawCode: string,
  userId: string,
  baseAmountMinorUnits: number,
  now: Date = new Date()
): Promise<DiscountValidationResult> {
  const code = normalizeDiscountCode(rawCode);
  if (!code) return { valid: false, reason: "not_found" };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { valid: false, reason: "service_unavailable" };
  }

  const { data: discount, error } = await admin
    .from("discount_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle<DiscountCodeRow>();

  if (error) return { valid: false, reason: "service_unavailable" };
  if (!discount) return { valid: false, reason: "not_found" };
  if (!discount.is_active) return { valid: false, reason: "inactive" };

  const windowState = isWithinWindow(discount, now);
  if (windowState === "before_start") return { valid: false, reason: "not_started" };
  if (windowState === "after_end") return { valid: false, reason: "expired" };

  if (discount.max_uses != null && discount.usage_count >= discount.max_uses) {
    return { valid: false, reason: "max_uses_reached" };
  }

  if (discount.max_uses_per_customer != null) {
    const { count, error: countError } = await admin
      .from("discount_code_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("discount_code_id", discount.id)
      .eq("user_id", userId);

    if (countError) return { valid: false, reason: "service_unavailable" };
    if ((count ?? 0) >= discount.max_uses_per_customer) {
      return { valid: false, reason: "max_uses_per_customer_reached" };
    }
  }

  const discountAmountMinorUnits = computeDiscountAmount(discount, baseAmountMinorUnits);
  const finalAmountMinorUnits = baseAmountMinorUnits - discountAmountMinorUnits;

  return { valid: true, discount, discountAmountMinorUnits, finalAmountMinorUnits };
}

/**
 * Records a redemption and increments usage_count — ONLY ever called from
 * lib/payments/access-activation.ts, after a payment has been confirmed
 * successful. Idempotent per order_id via the atomic
 * apply_discount_redemption() Postgres function (row-locks the discount_codes
 * row, INSERTs the redemption with ON CONFLICT (order_id) DO NOTHING, and
 * only increments usage_count if that insert actually happened) — safe to
 * call more than once for the same order (a retried webhook, or both the
 * webhook and the return-page verify path reaching the grant step).
 */
export async function redeemDiscountCode(params: {
  discountCodeId: string;
  userId: string;
  orderId: string;
  code: string;
  discountAmountMinorUnits: number;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("apply_discount_redemption", {
    p_discount_code_id: params.discountCodeId,
    p_user_id: params.userId,
    p_order_id: params.orderId,
    p_code: params.code,
    p_discount_amount: params.discountAmountMinorUnits,
  });

  if (error) {
    // Never throw from here into the payment-confirmation flow — a failure
    // to record a redemption must never block granting course access for a
    // payment that already succeeded. Surface it loudly in server logs
    // instead, for manual reconciliation.
    console.error("redeemDiscountCode: apply_discount_redemption failed", {
      orderId: params.orderId,
      code: params.code,
      error,
    });
  }
}
