"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { checkCourseAccess, getCourseId } from "@/lib/access";
import { getCoursePricing } from "@/lib/payments/access-activation";
import { initializeTransaction, generateOrderReference } from "@/lib/payments/paystack";

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
 */
export async function initializeCheckoutAction(): Promise<void> {
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

  let pricing: { amountMinorUnits: number; currency: string };
  try {
    pricing = getCoursePricing();
  } catch {
    redirect(
      `/get-started?error=${encodeURIComponent(
        "Checkout isn't fully configured yet. Please try again shortly, or contact support."
      )}`
    );
  }

  const reference = generateOrderReference();

  const { error: insertError } = await supabase.from("orders").insert({
    user_id: user.id,
    course_id: getCourseId(),
    amount_minor_units: pricing.amountMinorUnits,
    currency: pricing.currency,
    status: "pending",
    paystack_reference: reference,
  });

  if (insertError) {
    redirect(`/get-started?error=${encodeURIComponent("Could not start checkout. Please try again.")}`);
  }

  let authorizationUrl: string;
  try {
    const result = await initializeTransaction({
      email: user.email!,
      amountMinorUnits: pricing.amountMinorUnits,
      currency: pricing.currency,
      reference,
      callbackUrl: `${getSiteUrl()}/get-started/verify`,
      metadata: { user_id: user.id, course_id: getCourseId() },
    });
    authorizationUrl = result.authorizationUrl;
  } catch {
    redirect(
      `/get-started?error=${encodeURIComponent("Payment could not be started right now. Please try again shortly.")}`
    );
  }

  redirect(authorizationUrl);
}
