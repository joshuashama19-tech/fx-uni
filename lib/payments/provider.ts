import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckoutMethod, PaymentEnvironment, PaymentProvider, PaymentSettingsRow } from "@/lib/types";

export type { PaymentProvider, PaymentEnvironment, CheckoutMethod };

// Paystack stays the safe default provider for every new checkout, in
// every environment: the schema default on payment_settings.active_provider
// (see supabase/migrations/0012_payment_provider_settings.sql), the seed
// value for both the 'production' and 'preview' rows, and — critically —
// what this module falls back to if a row can't be read at all. Korapay
// must never be reachable as a default; it's only ever active in an
// environment because an admin viewing that environment explicitly chose
// it there.
const DEFAULT_PAYMENT_PROVIDER: PaymentProvider = "paystack";

/**
 * Determines which deployment environment the CURRENTLY RUNNING server is
 * in — entirely from Vercel's own server-only VERCEL_ENV variable, which
 * Vercel sets automatically for every deployment ("production", "preview",
 * or "development") and which nothing in a request (query string, header,
 * cookie, form field) can influence. This is what the admin payment-provider
 * page/action (both requireAdmin()-gated) use to know which row to show and
 * write — see lib/admin/payment-provider-actions.ts.
 *
 * Explicitly recognizes only Vercel's two payment-relevant values —
 * VERCEL_ENV === "production" -> "production", VERCEL_ENV === "preview" ->
 * "preview" — and defaults anything else (Vercel's own "development", or
 * VERCEL_ENV being unset entirely, e.g. running locally) to "preview" for
 * DISPLAY/ADMIN-WRITE purposes. That default is safe here specifically
 * because both callers are already requireAdmin()-gated: at worst it lets
 * an authenticated admin view/edit the already-clearly-labeled 'preview'
 * row from an unusual deployment context, never affects real checkout
 * traffic. Checkout's own provider resolution (resolvePaymentProvider(),
 * below) does NOT rely on this default — it has its own, stricter check
 * that refuses to read any row at all for an unrecognized environment; see
 * isRecognizedPaymentEnvironment().
 */
export function resolvePaymentEnvironment(): PaymentEnvironment {
  switch (process.env.VERCEL_ENV) {
    case "production":
      return "production";
    case "preview":
      return "preview";
    default:
      return "preview";
  }
}

/**
 * True only when VERCEL_ENV is exactly "production" or exactly "preview" —
 * Vercel's own two payment-relevant values. False for "development", an
 * unset VERCEL_ENV (e.g. local `next dev`, which has no VERCEL_ENV at all),
 * or any other/unexpected value.
 *
 * This is the actual safety gate for CHECKOUT provider resolution
 * (resolvePaymentProvider(), below) — deliberately stricter than
 * resolvePaymentEnvironment()'s own "default to preview" behavior above.
 * An unrecognized deployment environment must never end up reading (and
 * silently acting on) the 'preview' row's Korapay setting just because
 * resolvePaymentEnvironment() defaults ambiguous cases to "preview" for
 * admin-display purposes — checkout has to fail closed to Paystack
 * *without ever reading any row* when the environment itself isn't one of
 * the two Vercel actually reports.
 */
function isRecognizedPaymentEnvironment(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
}

/**
 * Decides which payment provider a NEW checkout uses. Called once, from
 * lib/payments/checkout-action.ts, before either provider adapter
 * (lib/payments/paystack.ts / lib/payments/korapay.ts) is touched — this
 * is what "the selected provider is determined server-side" means: the
 * browser has no say in this (there is no request input read here at all),
 * and there is intentionally no automatic failover between providers.
 *
 * Reads the admin-controlled payment_settings row for THIS server's own
 * environment (resolvePaymentEnvironment() above) via the service-role
 * client — the same table an admin edits from /admin/payment-provider
 * (lib/admin/payment-provider-actions.ts), which likewise only ever
 * touches the row for the environment it's running in. RLS grants
 * anon/authenticated no access to this table at all, so this service-role
 * read is the only way it's ever consulted; a student or anonymous
 * visitor cannot influence it. Because Preview and Production each read
 * and write their own row, switching Preview's provider (e.g. to Korapay,
 * for testing) can never change what Production resolves to, even though
 * both environments share the same Supabase database.
 *
 * Fails closed to DEFAULT_PAYMENT_PROVIDER ("paystack") on any error, a
 * missing row, or an unrecognized value — mirroring the same fail-closed
 * philosophy as lib/pricing.ts's getPricingSettings(). Production
 * continuing to work with only a Paystack secret configured (no Korapay
 * secret required) depends on this: an unreadable or absent settings row
 * must never accidentally route checkout to a provider that isn't
 * configured, in either environment. The same fail-closed rule extends to
 * the environment itself: if VERCEL_ENV isn't recognized as exactly
 * "production" or "preview" (see isRecognizedPaymentEnvironment() above —
 * covers local `next dev`, Vercel's own "development", or any unexpected
 * value), this never even queries payment_settings; it returns Paystack
 * immediately, so an unrecognized environment can never end up reading a
 * possibly Korapay-enabled 'preview' row.
 *
 * An already-existing order's provider is never re-derived by calling this
 * again — it's read from the order's own `payment_provider` column
 * instead (see lib/payments/access-activation.ts), since resolving it
 * fresh at verification time could disagree with what a checkout actually
 * used if the admin setting changes in between.
 */
export async function resolvePaymentProvider(): Promise<PaymentProvider> {
  if (!isRecognizedPaymentEnvironment()) {
    return DEFAULT_PAYMENT_PROVIDER;
  }

  try {
    const environment = resolvePaymentEnvironment();
    const db = createAdminClient();
    const { data, error } = await db
      .from("payment_settings")
      .select("*")
      .eq("environment", environment)
      .maybeSingle<PaymentSettingsRow>();

    if (error || !data) {
      return DEFAULT_PAYMENT_PROVIDER;
    }

    if (data.active_provider === "korapay") {
      return "korapay";
    }
    return DEFAULT_PAYMENT_PROVIDER;
  } catch {
    return DEFAULT_PAYMENT_PROVIDER;
  }
}

export interface CheckoutMethodSettings {
  cryptoEnabled: boolean;
  defaultMethod: CheckoutMethod;
}

// Crypto off, local by default — the same safe value payment_settings'
// own column defaults to (0014_nowpayments.sql), so an unreadable/missing
// row behaves identically to a freshly-seeded one that no admin has touched
// yet: crypto is never accidentally exposed by an outage or a missing row.
const DEFAULT_CHECKOUT_METHOD_SETTINGS: CheckoutMethodSettings = { cryptoEnabled: false, defaultMethod: "local" };

/**
 * Decides whether Crypto Payment (NOWPayments) is offered at all in this
 * environment, and which payment-method card is preselected — a genuinely
 * separate axis from resolvePaymentProvider() above, which continues to
 * decide only the LOCAL rail (Paystack vs Korapay) and knows nothing about
 * crypto. Called from app/get-started/page.tsx (to render the right
 * card(s) and preselection) and from lib/payments/checkout-action.ts (to
 * re-validate the student's submitted payment_method server-side before
 * deciding a new order's actual provider).
 *
 * Reads the same payment_settings row resolvePaymentProvider() reads (one
 * per PaymentEnvironment, service-role-only), so Preview's and Production's
 * crypto settings are independent of each other exactly like their
 * active_provider settings already are. Fails closed to
 * DEFAULT_CHECKOUT_METHOD_SETTINGS on any error, a missing row, or an
 * unrecognized environment — same fail-closed philosophy as
 * resolvePaymentProvider(): an outage must never accidentally expose or
 * default to crypto.
 *
 * Callers are responsible for applying the "crypto disabled overrides a
 * crypto default" fallback (effective default = defaultMethod === "crypto"
 * && cryptoEnabled ? "crypto" : "local") — kept here as raw settings rather
 * than pre-resolved, so both call sites can share the exact same one-line
 * rule instead of this function baking in an implicit second layer of
 * fallback logic.
 */
export async function resolveCheckoutMethodSettings(): Promise<CheckoutMethodSettings> {
  if (!isRecognizedPaymentEnvironment()) {
    return DEFAULT_CHECKOUT_METHOD_SETTINGS;
  }

  try {
    const environment = resolvePaymentEnvironment();
    const db = createAdminClient();
    const { data, error } = await db
      .from("payment_settings")
      .select("*")
      .eq("environment", environment)
      .maybeSingle<PaymentSettingsRow>();

    if (error || !data) {
      return DEFAULT_CHECKOUT_METHOD_SETTINGS;
    }

    return {
      cryptoEnabled: data.crypto_enabled === true,
      defaultMethod: data.default_checkout_method === "crypto" ? "crypto" : "local",
    };
  } catch {
    return DEFAULT_CHECKOUT_METHOD_SETTINGS;
  }
}
