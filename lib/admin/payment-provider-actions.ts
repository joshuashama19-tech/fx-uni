"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePaymentEnvironment } from "@/lib/payments/provider";
import type { CheckoutMethod, Currency, PaymentProvider } from "@/lib/types";

// Same pattern as lib/admin/pricing-actions.ts: the only writer for
// payment_settings, calls requireAdmin() first, and goes through the
// service-role client — there is no RLS write policy for this table at all
// (see supabase/migrations/0012_payment_provider_settings.sql), so this
// action is the ONLY way an environment's active provider is ever changed.
// A student or anonymous visitor has no path to this function: it's a
// Server Action only reachable from the /admin/payment-provider form, and
// requireAdmin() redirects anyone who isn't an authenticated admin before
// any write is attempted.
//
// Which environment's row gets written is NEVER taken from the form or any
// other client-supplied input — there is no environment field on the form
// at all. It's always resolvePaymentEnvironment()'s own determination of
// which environment THIS SERVER is currently running as (Vercel's
// VERCEL_ENV). That's what makes Preview/Production isolation hold even
// against a tampered request: an admin viewing the Preview deployment's
// /admin/payment-provider can only ever cause this function to write the
// 'preview' row, because that's the only row the Preview server is capable
// of resolving itself to be. The same admin viewing the Production
// deployment can only ever write the 'production' row. Neither can reach
// the other's row through this action, however the request is crafted.
//
// Changing the active provider here only affects checkouts initialized
// after this runs, in this same environment — lib/payments/checkout-action.ts
// records whichever provider resolvePaymentProvider() returns onto the new
// order's own payment_provider column at creation time, and every
// already-existing order (in any environment) keeps that recorded value
// forever (see 0011_payment_provider.sql). This action never touches the
// orders table.
export async function updatePaymentProviderAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const requested = String(formData.get("active_provider") || "");
  if (requested !== "paystack" && requested !== "korapay") {
    // Not a recognized provider (a tampered form, or no selection) —
    // refuse to write anything rather than guess.
    return;
  }
  const active_provider: PaymentProvider = requested;

  // Local Payments ON/OFF — grouped with Active Provider in the admin UI
  // (see supabase/migrations/20260927140054_local_payments_toggle.sql), and
  // written by this same action for the same reason active_provider is: an
  // independent, admin-only, per-environment setting on payment_settings.
  // Both forms that post here (app/admin/payment-provider/page.tsx's
  // provider-switch confirmation form and its separate Local Payments
  // toggle form) always include this field — the provider-switch form
  // carries the CURRENT local_enabled value forward unchanged (switching
  // Paystack/Korapay must never flip this), and the toggle form carries the
  // admin's new choice. That lets this upsert always name local_enabled
  // explicitly and correctly, while still never naming
  // crypto_enabled/default_checkout_method — those remain
  // updateCheckoutMethodSettingsAction's own columns below, untouched here,
  // exactly as active_provider is never touched by that action.
  const local_enabled = formData.get("local_enabled") === "on";

  const environment = resolvePaymentEnvironment();

  const db = createAdminClient();
  const { error } = await db.from("payment_settings").upsert(
    {
      environment,
      active_provider,
      local_enabled,
      updated_by: admin.id,
    },
    { onConflict: "environment" }
  );

  if (error) {
    // Same convention as lib/progress/activity-actions.ts's service-role
    // writes: throw on a failed write rather than falling through. Without
    // this check, a failed upsert here would silently reach the
    // revalidatePath() calls below and the admin-facing form would behave
    // as though the switch had gone through, even though payment_settings
    // was never actually written — for a setting that controls which
    // provider real money moves through, that's not an acceptable failure
    // mode. requireAdmin() above is untouched; this only guards the write
    // itself.
    throw new Error(`Couldn't update local payment settings: ${error.message}`);
  }

  revalidatePath("/admin/payment-provider");
  revalidatePath("/get-started");
}

// The Crypto Payments toggle + default-checkout-method setting — a
// deliberately separate action from updatePaymentProviderAction above, on a
// separate axis (supabase/migrations/0014_nowpayments.sql): this one never
// touches active_provider, and the upsert below only names the columns it
// actually sets, so Postgres's ON CONFLICT DO UPDATE leaves
// active_provider exactly as updatePaymentProviderAction last set it — and,
// symmetrically, that action's own upsert (which doesn't name these two
// columns) leaves crypto_enabled/default_checkout_method untouched. Same
// requireAdmin()-first, service-role-only, current-environment-only
// pattern as the rest of this file.
export async function updateCheckoutMethodSettingsAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const cryptoEnabled = formData.get("crypto_enabled") === "on";

  const requestedDefault = String(formData.get("default_checkout_method") || "");
  if (requestedDefault !== "local" && requestedDefault !== "crypto") {
    // Not a recognized method (a tampered form, or no selection) — refuse
    // to write anything rather than guess. Same defensive pattern as
    // updatePaymentProviderAction's own provider check above — worth
    // flagging for review the same way: this is a runtime check, not a
    // type-driven one, so a future third method value added to
    // CheckoutMethod wouldn't be caught here by the compiler either.
    return;
  }
  const default_checkout_method: CheckoutMethod = requestedDefault;

  const environment = resolvePaymentEnvironment();

  const db = createAdminClient();
  const { error } = await db.from("payment_settings").upsert(
    {
      environment,
      crypto_enabled: cryptoEnabled,
      default_checkout_method,
      updated_by: admin.id,
    },
    { onConflict: "environment" }
  );

  if (error) {
    throw new Error(`Couldn't update crypto checkout settings: ${error.message}`);
  }

  revalidatePath("/admin/payment-provider");
  revalidatePath("/get-started");
}

// Payment currency (NGN/USD) — added alongside
// supabase/migrations/20260927190000_payment_currency.sql. A fourth,
// independent axis from active_provider/local_enabled (above) and
// crypto_enabled/default_checkout_method (updateCheckoutMethodSettingsAction
// above): this upsert only ever names active_currency (+ updated_by), so it
// can never touch any of those three other settings, and none of their own
// upserts (which never name active_currency) can ever touch this one. Same
// requireAdmin()-first, service-role-only, current-environment-only pattern
// as the rest of this file — there is no currency selector on the form
// either; the environment always comes from resolvePaymentEnvironment().
export async function updateCurrencySettingsAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const requested = String(formData.get("active_currency") || "");
  if (requested !== "NGN" && requested !== "USD") {
    // Not a recognized currency (a tampered form, or no selection) — refuse
    // to write anything rather than guess. Same defensive pattern as
    // updatePaymentProviderAction's own provider check above.
    return;
  }
  const active_currency: Currency = requested;

  const environment = resolvePaymentEnvironment();

  const db = createAdminClient();
  const { error } = await db.from("payment_settings").upsert(
    {
      environment,
      active_currency,
      updated_by: admin.id,
    },
    { onConflict: "environment" }
  );

  if (error) {
    throw new Error(`Couldn't update payment currency: ${error.message}`);
  }

  revalidatePath("/admin/payment-provider");
  revalidatePath("/admin/pricing");
  revalidatePath("/get-started");
  // /course's PricingSection now derives its price from resolveActiveCurrency()
  // + resolvePricing(activeCurrency) (see components/PricingSection.tsx,
  // added alongside this file's currency support) so a currency switch must
  // invalidate it too, exactly like updatePricingSettingsAction
  // (lib/admin/pricing-actions.ts) already does for a price-value change —
  // otherwise the public landing page keeps serving its previously cached
  // currency/price after an admin switches active_currency here.
  revalidatePath("/course");
}
