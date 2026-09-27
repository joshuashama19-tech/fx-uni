import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckoutMethod, Currency, PaymentEnvironment, PaymentProvider, PaymentSettingsRow } from "@/lib/types";

export type { PaymentProvider, PaymentEnvironment, CheckoutMethod, Currency };

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
  // Added alongside supabase/migrations/20260927140054_local_payments_toggle.sql.
  // Whether the local rail (whichever provider active_provider selects) is
  // offered at all — a third, independent axis from both cryptoEnabled and
  // resolvePaymentProvider()'s own active_provider value. See that
  // migration's file header and DEFAULT_CHECKOUT_METHOD_SETTINGS below for
  // why this one fails closed to true, the opposite of cryptoEnabled.
  localEnabled: boolean;
}

// Crypto off, local by default and local ON — the same safe values
// payment_settings' own columns default to (0014_nowpayments.sql,
// 20260927140054_local_payments_toggle.sql), so an unreadable/missing row
// behaves identically to a freshly-seeded one that no admin has touched yet:
// crypto is never accidentally exposed, and local — the rail that has always
// been guaranteed available — is never accidentally taken away, by an
// outage or a missing row.
const DEFAULT_CHECKOUT_METHOD_SETTINGS: CheckoutMethodSettings = {
  cryptoEnabled: false,
  defaultMethod: "local",
  localEnabled: true,
};

/**
 * Decides whether Crypto Payment (NOWPayments) is offered at all in this
 * environment, whether the local rail (Paystack/Korapay, whichever
 * active_provider selects) is offered at all, and which payment-method card
 * is preselected — genuinely separate axes from resolvePaymentProvider()
 * above, which continues to decide only WHICH local provider is used and
 * knows nothing about either on/off setting. Called from
 * app/get-started/page.tsx (to render the right card(s)/preselection, or the
 * "checkout unavailable" state when both are off) and from
 * lib/payments/checkout-action.ts (to re-validate the student's submitted
 * payment_method server-side before deciding a new order's actual provider,
 * or to block checkout entirely).
 *
 * Reads the same payment_settings row resolvePaymentProvider() reads (one
 * per PaymentEnvironment, service-role-only), so Preview's and Production's
 * settings are independent of each other exactly like their active_provider
 * settings already are. Fails closed to DEFAULT_CHECKOUT_METHOD_SETTINGS on
 * any error, a missing row, or an unrecognized environment — same
 * fail-closed philosophy as resolvePaymentProvider(): an outage must never
 * accidentally expose/default to crypto, and must never accidentally take
 * away local, the rail that has always worked.
 *
 * Callers are responsible for applying the "crypto disabled overrides a
 * crypto default" fallback (effective default = defaultMethod === "crypto"
 * && cryptoEnabled ? "crypto" : "local") — kept here as raw settings rather
 * than pre-resolved, so both call sites can share the exact same one-line
 * rule instead of this function baking in an implicit second layer of
 * fallback logic. Callers are likewise responsible for the "both off"
 * checkout-blocking behavior (!localEnabled && !cryptoEnabled) — this
 * function only ever reports the two independent settings, never decides
 * what to do about their combination.
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
      // Fails closed to true (never false) — only an explicit `false` in
      // the row disables local. A row that predates this column reading as
      // undefined/null (should not happen once the migration backfills
      // every existing row via its NOT NULL DEFAULT true, but defended here
      // anyway) must never be read as "local disabled".
      localEnabled: data.local_enabled !== false,
    };
  } catch {
    return DEFAULT_CHECKOUT_METHOD_SETTINGS;
  }
}

// Added alongside supabase/migrations/20260927190000_payment_currency.sql.
// 'NGN' is the safe default/fallback for the exact same reason Paystack is
// DEFAULT_PAYMENT_PROVIDER above: it's what every environment already runs
// as today, so an unreadable/missing row or an unrecognized environment must
// never silently move the Nigerian funnel to USD.
const DEFAULT_CURRENCY: Currency = "NGN";

/**
 * Decides which currency a NEW checkout uses in THIS environment — a fourth,
 * independent axis from resolvePaymentProvider() (which local rail),
 * resolveCheckoutMethodSettings()'s cryptoEnabled (whether crypto is offered
 * at all) and localEnabled (whether the local rail is offered at all). Reads
 * the same per-environment payment_settings row those two functions read,
 * so Production's and Preview's currency are independent of each other
 * exactly like their other three settings already are.
 *
 * Fails closed to 'NGN' on any error, a missing row, an unrecognized
 * environment, or an unrecognized stored value — never anything else. This
 * is what "the existing Nigerian checkout must continue working exactly as
 * before when currency is NGN" means concretely: an outage here can only
 * ever produce the currency every environment already runs as today, never
 * accidentally expose USD pricing/checkout nobody configured.
 *
 * Called from lib/payments/checkout-action.ts (to decide a NEW order's
 * actual amount/currency — never trusted from the browser) and
 * app/get-started/page.tsx / app/admin/pricing/page.tsx (to display the
 * right price). An already-created order's own orders.currency remains the
 * sole source of truth for what THAT order was for — this function is never
 * consulted again once an order exists (mirrors resolvePaymentProvider()'s
 * own doc comment on this point exactly).
 */
export async function resolveActiveCurrency(): Promise<Currency> {
  if (!isRecognizedPaymentEnvironment()) {
    return DEFAULT_CURRENCY;
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
      return DEFAULT_CURRENCY;
    }

    return data.active_currency === "USD" ? "USD" : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

/**
 * Which currencies each payment provider's integration, AS ACTUALLY WIRED UP
 * IN THIS CODEBASE, is treated as able to process. This is deliberately a
 * static allowlist, not a runtime capability probe (none of these providers
 * expose one) — checked BEFORE a provider is ever called, so an unsupported
 * combination fails safely (no order row inserted, no provider adapter
 * called — see lib/payments/checkout-action.ts) instead of surfacing only as
 * a confusing provider-side error after an order already exists.
 *
 * What's behind each entry (verified against each provider's current public
 * documentation during implementation, never assumed):
 *   - 'test': every currency. Never a real network call (lib/payments/
 *     test-provider.ts) — nothing to actually support or fail on.
 *   - 'paystack': NGN always. USD is a real, documented Paystack capability
 *     (the `currency` field this adapter already sends accepts it) but is
 *     NOT automatically enabled on a Nigerian merchant account — Paystack
 *     requires the merchant to separately request/enable international
 *     payments and add a USD settlement (domiciliary) account before USD
 *     transactions actually work. This codebase cannot verify from here
 *     whether Josh's specific Paystack account has that enabled, so USD is
 *     listed as supported (the integration itself does the right thing —
 *     sends 'USD' through unchanged, nothing hardcoded to NGN) but this MUST
 *     be confirmed on the live Paystack account before relying on it — see
 *     the admin-UI warning in app/admin/payment-provider/page.tsx.
 *   - 'korapay': NGN only. Korapay's own Checkout Redirect documentation
 *     (https://developers.korapay.com/docs/checkout-redirect) documents its
 *     `currency` field with NGN/GHS/KES examples and does not document USD
 *     as a supported checkout currency anywhere in that flow. Rather than
 *     guess, USD is treated as unsupported for Korapay — checkout fails
 *     safely (see below) instead of attempting a charge Korapay may reject
 *     or mishandle.
 *   - 'nowpayments': NGN and USD. The `price_currency` field this adapter
 *     already sends accepts arbitrary standard fiat codes; 'ngn' is the
 *     exact value this integration has been sending in production since
 *     0014_nowpayments.sql shipped (pricing_settings.currency has always
 *     been 'NGN'), so NGN support is proven, not assumed. USD is NOWPayments'
 *     most commonly documented fiat price_currency and is supported on the
 *     same code path — if this is ever wrong for a specific NOWPayments
 *     account configuration, initializePayment()'s existing error handling
 *     (lib/payments/nowpayments.ts) already fails the checkout safely rather
 *     than silently mischarging.
 */
const CURRENCY_PROVIDER_SUPPORT: Record<PaymentProvider, ReadonlySet<Currency> | "all"> = {
  test: "all",
  paystack: new Set<Currency>(["NGN", "USD"]),
  korapay: new Set<Currency>(["NGN"]),
  nowpayments: new Set<Currency>(["NGN", "USD"]),
};

/** True if `provider`'s integration, as wired up in this codebase, can process `currency` — see CURRENCY_PROVIDER_SUPPORT's doc comment above for what each answer is actually based on. */
export function providerSupportsCurrency(provider: PaymentProvider, currency: Currency): boolean {
  const supported = CURRENCY_PROVIDER_SUPPORT[provider];
  return supported === "all" || supported.has(currency);
}
