"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { checkCourseAccess, getCourseId } from "@/lib/access";
import { resolvePricing } from "@/lib/pricing";
import { initializeTransaction, generateOrderReference } from "@/lib/payments/paystack";
import { validateDiscountCode, discountErrorMessage, normalizeDiscountCode } from "@/lib/discounts";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

/**
 * Starts checkout: creates a `pending` order row as the authenticated user
 * (respecting the orders_insert_own_pending RLS policy — this action never
 * uses the admin client), then asks Paystack to initialize a transaction
 * and redirects the browser to Paystack's own hosted checkout page.
 *
 * Nothing here marks the order paid or grants access — that only ever
 * happens in lib/payments/access-activation.ts, after Paystack's own
 * server-side verification, triggered either by the student's return to
 * /get-started/verify or by the webhook.
 *
 * `formData`'s optional `discount_code` field (a hidden input on the
 * checkout form, populated from the `?discount=` query string set by
 * applyDiscountCodeAction — see app/get-started/page.tsx) is re-validated
 * from scratch here via validateDiscountCode(), exactly like the "Apply"
 * preview was, and completely independently of it. The browser is never
 * trusted to say a code is valid or what it's worth — only this
 * server-side re-check decides the amount actually charged.
 */
export async function initializeCheckoutAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/get-started");
  }

  const access = await checkCourseAccess();
  if (access.authorized) {
    redirect("/learn");
  }

  const rl = rateLimit(`checkout:${user.id}`, 10, 15 * 60);
  if (!rl.allowed) {
    redirect(`/get-started?error=${encodeURIComponent("Too many attempts. Please try again in a few minutes.")}`);
  }

  // The ONLY place the base payable amount is decided: re-derived
  // server-side, right now, from pricing_settings + the server's own clock
  // (lib/pricing.ts) — never from anything the browser sent. Whatever this
  // resolves to is the base that a discount (if any) is applied on top of.
  let baseAmountMinorUnits: number;
  let currency: string;
  try {
    const state = await resolvePricing();
    baseAmountMinorUnits = state.payableMinorUnits;
    currency = state.currency;
  } catch {
    redirect(
      `/get-started?error=${encodeURIComponent(
        "Checkout isn't fully configured yet. Please try again shortly, or contact support."
      )}`
    );
  }

  const rawDiscountCode = String(formData.get("discount_code") || "").trim();
  let discountCodeId: string | null = null;
  let discountCode: string | null = null;
  let discountAmountMinorUnits = 0;
  let amountMinorUnits = baseAmountMinorUnits;

  if (rawDiscountCode) {
    const validation = await validateDiscountCode(rawDiscountCode, user.id, baseAmountMinorUnits);
    if (!validation.valid) {
      // The code was valid at "Apply" time but no longer is (used up, expired,
      // deactivated, or never was valid — e.g. a hand-edited query string).
      // Never silently drop it and charge full price — send the student back
      // to re-enter/reconsider it, with an explanation.
      redirect(`/get-started?discount_error=${encodeURIComponent(discountErrorMessage(validation.reason))}`);
    }
    discountCodeId = validation.discount.id;
    discountCode = validation.discount.code;
    discountAmountMinorUnits = validation.discountAmountMinorUnits;
    amountMinorUnits = validation.finalAmountMinorUnits;
  }

  const reference = generateOrderReference();

  const { data: insertedOrder, error: insertError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      course_id: getCourseId(),
      amount_minor_units: amountMinorUnits,
      currency,
      status: "pending",
      paystack_reference: reference,
      base_amount_minor_units: baseAmountMinorUnits,
      discount_code_id: discountCodeId,
      discount_code: discountCode,
      discount_amount_minor_units: discountAmountMinorUnits,
    })
    .select("id")
    .single();

  if (insertError || !insertedOrder) {
    redirect(`/get-started?error=${encodeURIComponent("Could not start checkout. Please try again.")}`);
  }

  let authorizationUrl: string;
  try {
    const result = await initializeTransaction({
      email: user.email!,
      amountMinorUnits,
      currency,
      reference,
      callbackUrl: `${getSiteUrl()}/get-started/verify`,
      metadata: {
        user_id: user.id,
        course_id: getCourseId(),
        // order_id/discount fields let Paystack's dashboard and any manual
        // reconciliation see the discount context without a DB lookup. The
        // secret key itself is never included here or anywhere in
        // metadata — this object only ever holds identifiers, never
        // credentials (see lib/payments/paystack.ts, which is the only
        // place PAYSTACK_SECRET_KEY is read, always server-side, and only
        // ever sent as an Authorization header, never in a request body).
        // None of this metadata is trusted back — access-activation.ts
        // always re-derives everything it acts on from the `orders` row
        // itself (looked up by paystack_reference) and Paystack's own
        // /transaction/verify response, never from metadata echoed back in
        // a webhook payload or the return-page query string.
        order_id: insertedOrder.id,
        order_reference: reference,
        discount_code: discountCode,
        discount_amount_minor_units: discountAmountMinorUnits,
        base_amount_minor_units: baseAmountMinorUnits,
      },
    });
    authorizationUrl = result.authorizationUrl;
  } catch {
    redirect(
      `/get-started?error=${encodeURIComponent("Payment could not be started right now. Please try again shortly.")}`
    );
  }

  redirect(authorizationUrl);
}

/**
 * Handles the "Apply" button next to the discount-code field on
 * /get-started. This is a PREVIEW only — it validates the code and, if
 * valid, redirects back with `?discount=<CODE>` so GetStartedPage can show
 * a price breakdown; it never creates an order, never charges anything, and
 * never touches usage_count. The real charge amount is decided completely
 * independently, a second time, inside initializeCheckoutAction when the
 * student actually submits the checkout form — this preview is a
 * convenience, not a source of truth. Follows the same
 * no-client-JS/query-param-driven-state convention as the rest of this page
 * (e.g. `status=verify-email`).
 */
export async function applyDiscountCodeAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/get-started");
  }

  const rawCode = String(formData.get("discount_code") || "").trim();
  if (!rawCode) {
    redirect("/get-started");
  }

  let baseAmountMinorUnits: number;
  try {
    const state = await resolvePricing();
    baseAmountMinorUnits = state.payableMinorUnits;
  } catch {
    redirect(
      `/get-started?discount_error=${encodeURIComponent("Couldn't check that discount code right now. Please try again.")}`
    );
  }

  const validation = await validateDiscountCode(rawCode, user.id, baseAmountMinorUnits);
  if (!validation.valid) {
    redirect(`/get-started?discount_error=${encodeURIComponent(discountErrorMessage(validation.reason))}`);
  }

  redirect(`/get-started?discount=${encodeURIComponent(normalizeDiscountCode(rawCode))}`);
}
