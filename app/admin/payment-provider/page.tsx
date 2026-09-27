import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  updatePaymentProviderAction,
  updateCheckoutMethodSettingsAction,
  updateCurrencySettingsAction,
} from "@/lib/admin/payment-provider-actions";
import { resolvePaymentEnvironment, resolveCheckoutMethodSettings, providerSupportsCurrency } from "@/lib/payments/provider";
import type { Currency, PaymentEnvironment, PaymentSettingsRow, PricingSettingsRow } from "@/lib/types";

export const metadata: Metadata = { title: "Admin — Payment Provider" };

// Deliberately narrower than the full PaymentProvider union (which also
// includes 'test' as of supabase/migrations/0013_test_mode.sql, and
// 'nowpayments' as of 0014_nowpayments.sql) — this page only ever
// shows/switches Production's or Preview's REAL LOCAL active provider;
// neither 'test' nor 'nowpayments' is ever reachable here (see
// lib/payments/provider.ts's resolvePaymentProvider(), which never returns
// either, and lib/admin/payment-provider-actions.ts's
// updatePaymentProviderAction, which refuses any value other than
// 'paystack'/'korapay'). Crypto is a separate setting, shown in its own
// section below via updateCheckoutMethodSettingsAction — this Record and
// that action deliberately stay this narrow even though neither check is
// type-driven (TypeScript won't flag either if it were ever wrong).
const PROVIDER_LABEL: Record<"paystack" | "korapay", string> = {
  paystack: "Paystack",
  korapay: "Korapay",
};

const ENVIRONMENT_LABEL: Record<PaymentEnvironment, string> = {
  production: "Production",
  preview: "Preview",
};

const CURRENCY_LABEL: Record<Currency, string> = {
  NGN: "NGN ₦",
  USD: "USD $",
};

/**
 * Single read of this environment's payment_settings row, shared by the
 * Local Payments/Active Provider section, the Crypto Payments section
 * (checkoutMethodSettings comes from resolveCheckoutMethodSettings()
 * separately, which does its own read — unchanged from before this file was
 * touched), and the new Payment currency section below — added so the new
 * section doesn't need a second round-trip for a row this page already
 * fetches. Same safe-default philosophy as resolvePaymentProvider()/
 * resolveActiveCurrency() (lib/payments/provider.ts) — an unreadable/missing
 * row is shown as Paystack/NGN here too, never left ambiguous.
 */
async function getPaymentSettings(
  environment: PaymentEnvironment
): Promise<{ activeProvider: "paystack" | "korapay"; activeCurrency: Currency }> {
  const db = createAdminClient();
  const { data } = await db
    .from("payment_settings")
    .select("*")
    .eq("environment", environment)
    .maybeSingle<PaymentSettingsRow>();
  return {
    activeProvider: data?.active_provider === "korapay" ? "korapay" : "paystack",
    activeCurrency: data?.active_currency === "USD" ? "USD" : "NGN",
  };
}

/** Whether a USD regular price has been configured at all (/admin/pricing) — used only to warn, never to block the currency switch itself. */
async function isUsdPricingConfigured(): Promise<boolean> {
  const db = createAdminClient();
  const { data } = await db
    .from("pricing_settings")
    .select("usd_regular_price_minor_units")
    .eq("id", 1)
    .maybeSingle<Pick<PricingSettingsRow, "usd_regular_price_minor_units">>();
  return data?.usd_regular_price_minor_units != null;
}

/**
 * Confirmation step, driven entirely by a `?confirm=` query param —
 * same no-client-JS, query-param-driven-state convention used by
 * /get-started's discount code preview (see
 * lib/payments/checkout-action.ts's applyDiscountCodeAction). Choosing a
 * provider below navigates here with `?confirm=<provider>`; nothing is
 * written until the admin submits the actual confirmation form, which
 * posts to updatePaymentProviderAction — the only function that ever
 * writes payment_settings.
 *
 * There is deliberately no environment selector anywhere on this page:
 * `environment` always comes from resolvePaymentEnvironment(), i.e. which
 * deployment (Production or Preview) is actually serving this page right
 * now. Viewing this page on the Preview deployment can only ever show and
 * change Preview's row; viewing it on Production can only ever show and
 * change Production's. There is no form field or link on this page that
 * can target the other environment.
 */
export default async function AdminPaymentProviderPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string; confirmCurrency?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const environment = resolvePaymentEnvironment();
  const { activeProvider, activeCurrency } = await getPaymentSettings(environment);
  const checkoutMethodSettings = await resolveCheckoutMethodSettings();
  const usdPricingConfigured = await isUsdPricingConfigured();
  const environmentLabel = ENVIRONMENT_LABEL[environment];

  const pendingCurrency: Currency | null =
    params.confirmCurrency === "NGN" || params.confirmCurrency === "USD" ? params.confirmCurrency : null;

  const pendingConfirm: "paystack" | "korapay" | null =
    params.confirm === "paystack" || params.confirm === "korapay" ? params.confirm : null;

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink-950">Payment provider</h1>
        <p className="mt-1 text-sm text-ink-500">
          Controls which payment provider new checkouts use in this environment. This affects new checkouts in this
          environment only — an order already created keeps the provider it was created with, and Production and
          Preview each have their own setting, so changing one never changes the other.
        </p>

        {/* LOCAL PAYMENTS — groups the Local Payments ON/OFF toggle with the
            existing Active Provider switcher, per
            supabase/migrations/20260927140054_local_payments_toggle.sql.
            Independent of the Crypto Payments section below: turning local
            on/off never changes active_provider, crypto_enabled, or
            default_checkout_method, and vice versa. */}
        <h2 className="mt-8 text-lg font-semibold text-ink-950">Local payments</h2>

        <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Environment</p>
          <p className="mt-1 text-lg font-semibold text-ink-950">{environmentLabel}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">Active provider</p>
          <p className="mt-1 text-2xl font-semibold text-ink-950">{PROVIDER_LABEL[activeProvider]}</p>
        </div>

        {/* Local Payments ON/OFF. Submits to the same updatePaymentProviderAction
            that already writes active_provider — the hidden active_provider
            field below always carries the CURRENT provider forward
            unchanged, so toggling this checkbox alone never switches
            Paystack/Korapay. Enforced server-side in
            lib/payments/checkout-action.ts, not only by hiding this UI. */}
        <form
          action={updatePaymentProviderAction}
          className="mt-4 rounded-xl border border-ink-100 bg-white p-5"
        >
          <input type="hidden" name="active_provider" value={activeProvider} />
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-medium text-ink-900">Local Payments</span>
              <span className="block text-xs text-ink-500">
                {checkoutMethodSettings.localEnabled
                  ? "On — shown to students at checkout"
                  : "Off — never shown to students"}
              </span>
            </span>
            <input
              type="checkbox"
              name="local_enabled"
              defaultChecked={checkoutMethodSettings.localEnabled}
              className="h-5 w-5 accent-brand-600"
            />
          </label>
          {!checkoutMethodSettings.localEnabled && !checkoutMethodSettings.cryptoEnabled ? (
            <p className="mt-3 text-xs font-medium text-brand-700">
              Crypto Payments is also off — students will see no payment method and checkout is blocked until one
              is turned on.
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-4 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Save local payments setting
          </button>
        </form>

        {pendingConfirm && pendingConfirm !== activeProvider ? (
          <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
            <p className="text-sm font-semibold text-brand-700">
              Switch {environmentLabel} to {PROVIDER_LABEL[pendingConfirm]}?
            </p>
            <p className="mt-1.5 text-sm text-brand-700">
              This affects new checkouts in this environment only. {environmentLabel} checkouts will start using{" "}
              {PROVIDER_LABEL[pendingConfirm]} immediately after you confirm. This does not change the other
              environment&apos;s setting, and no existing order is affected — each one keeps the provider it was
              created with. Your current Local Payments ON/OFF setting is not affected by this switch.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={updatePaymentProviderAction}>
                <input type="hidden" name="active_provider" value={pendingConfirm} />
                {/* Carries the current Local Payments setting forward
                    unchanged — switching the local provider must never also
                    flip local_enabled. */}
                <input
                  type="hidden"
                  name="local_enabled"
                  value={checkoutMethodSettings.localEnabled ? "on" : "off"}
                />
                <button
                  type="submit"
                  className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Confirm switch to {PROVIDER_LABEL[pendingConfirm]}
                </button>
              </form>
              <Link
                href="/admin/payment-provider"
                className="inline-flex items-center rounded-full border border-ink-200 px-5 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
              >
                Cancel
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-ink-100 bg-white p-5">
            <p className="text-sm font-medium text-ink-700">Switch provider for {environmentLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["paystack", "korapay"] as const).map((provider) => (
                <Link
                  key={provider}
                  href={
                    provider === activeProvider ? "/admin/payment-provider" : `/admin/payment-provider?confirm=${provider}`
                  }
                  aria-current={provider === activeProvider ? "true" : undefined}
                  className={`rounded-full px-5 py-2 text-sm font-semibold ${
                    provider === activeProvider
                      ? "bg-ink-900 text-white"
                      : "border border-ink-200 text-ink-700 hover:bg-ink-50"
                  }`}
                >
                  {PROVIDER_LABEL[provider]}
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-500">
              Paystack is the safe default for every environment — if this setting is ever unreadable, checkout
              falls back to Paystack rather than breaking.
            </p>
          </div>
        )}

        {/* A separate axis from the local-provider switcher above — see
            supabase/migrations/0014_nowpayments.sql and
            lib/payments/provider.ts's resolveCheckoutMethodSettings(). This
            never changes activeProvider, and switching Paystack/Korapay
            above never changes these two settings. */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-ink-950">Crypto payments</h2>
          <p className="mt-1 text-sm text-ink-500">
            Offers NOWPayments as a second checkout option (&quot;Pay with Crypto&quot;) alongside{" "}
            {environmentLabel}&apos;s local provider above. Independent of the local-provider setting — turning
            crypto on or off never changes which of Paystack/Korapay is active, and vice versa.
          </p>

          <form action={updateCheckoutMethodSettingsAction} className="mt-4 rounded-xl border border-ink-100 bg-white p-5">
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-medium text-ink-900">Crypto Payments</span>
                <span className="block text-xs text-ink-500">
                  {checkoutMethodSettings.cryptoEnabled ? "On — shown to students at checkout" : "Off — never shown to students"}
                </span>
              </span>
              <input
                type="checkbox"
                name="crypto_enabled"
                defaultChecked={checkoutMethodSettings.cryptoEnabled}
                className="h-5 w-5 accent-brand-600"
              />
            </label>

            <div className="mt-5 border-t border-ink-100 pt-5">
              <p className="text-sm font-medium text-ink-900">Default checkout method</p>
              <p className="mt-1 text-xs text-ink-500">
                Which option is preselected on the checkout page. If Crypto is chosen here but Crypto Payments is
                off, students automatically get the local provider instead — a disabled option is never preselected
                or shown.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700">
                  <input
                    type="radio"
                    name="default_checkout_method"
                    value="local"
                    defaultChecked={checkoutMethodSettings.defaultMethod === "local"}
                  />
                  Local Payment
                </label>
                <label className="flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700">
                  <input
                    type="radio"
                    name="default_checkout_method"
                    value="crypto"
                    defaultChecked={checkoutMethodSettings.defaultMethod === "crypto"}
                  />
                  Crypto
                  {!checkoutMethodSettings.cryptoEnabled ? (
                    <span className="text-xs font-normal text-ink-400">(enable crypto payments above first)</span>
                  ) : null}
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="mt-5 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Save crypto settings
            </button>
          </form>
        </div>

        {/* PAYMENT CURRENCY — a fourth, independent axis from Active
            Provider/Local Payments above and Crypto Payments above that,
            per supabase/migrations/20260927190000_payment_currency.sql.
            Switching NGN/USD here never changes active_provider,
            local_enabled, crypto_enabled, or default_checkout_method, and
            none of those settings change this. Only affects NEW checkouts
            in this environment from the moment of confirmation — an
            existing order keeps the currency/amount it was created with
            forever (orders.currency/amount_minor_units are immutable; see
            lib/payments/access-activation.ts's verification-time currency
            match check). NGN Price / USD Price themselves are set on
            /admin/pricing, not here — this only chooses which of the two
            configured prices new checkouts use. */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-ink-950">Payment currency</h2>
          <p className="mt-1 text-sm text-ink-500">
            Controls which price — NGN or USD, set on{" "}
            <Link href="/admin/pricing" className="underline hover:text-ink-700">
              /admin/pricing
            </Link>{" "}
            — new checkouts in {environmentLabel} use. Existing orders are never affected: each keeps the currency
            and amount it was created with.
          </p>

          <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Active currency</p>
            <p className="mt-1 text-2xl font-semibold text-ink-950">{CURRENCY_LABEL[activeCurrency]}</p>
          </div>

          {/* Warnings about the CURRENT active currency — shown regardless
              of whether the admin is mid-switch, so a bad combination
              never goes unnoticed just because nobody happened to visit
              the confirm step. These never block anything by themselves;
              lib/payments/checkout-action.ts's providerSupportsCurrency()
              gate is what actually prevents a broken checkout attempt. */}
          {activeCurrency === "USD" && !providerSupportsCurrency(activeProvider, "USD") ? (
            <p className="mt-3 text-xs font-medium text-red-700">
              {PROVIDER_LABEL[activeProvider]} does not support USD in this integration — Local Payment checkouts
              will be hidden in USD until you switch the active provider to one that supports it, or switch back to
              NGN. Crypto Payments (NOWPayments), if enabled, is unaffected.
            </p>
          ) : null}
          {activeCurrency === "USD" && activeProvider === "paystack" && providerSupportsCurrency("paystack", "USD") ? (
            <p className="mt-3 text-xs font-medium text-amber-700">
              Paystack USD support depends on your Paystack account having international payments enabled with a
              USD settlement account — this is not something this app can verify. If that isn&apos;t set up yet,
              Paystack will reject USD charges even though this app is configured to attempt them.
            </p>
          ) : null}
          {activeCurrency === "USD" && !usdPricingConfigured ? (
            <p className="mt-3 text-xs font-medium text-red-700">
              No USD price is configured yet on /admin/pricing — USD checkouts will fail safely with a
              &quot;checkout isn&apos;t fully configured&quot; message until a USD price is set.
            </p>
          ) : null}

          {pendingCurrency && pendingCurrency !== activeCurrency ? (
            <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
              <p className="text-sm font-semibold text-brand-700">
                Switch {environmentLabel} to {CURRENCY_LABEL[pendingCurrency]}?
              </p>
              <p className="mt-1.5 text-sm text-brand-700">
                New checkouts in {environmentLabel} will use the {pendingCurrency} price immediately after you
                confirm. This does not change Active Provider, Local Payments, or Crypto Payments, and no existing
                order is affected.
              </p>
              {pendingCurrency === "USD" && !providerSupportsCurrency(activeProvider, "USD") ? (
                <p className="mt-2 text-sm font-medium text-red-700">
                  Warning: {PROVIDER_LABEL[activeProvider]} does not support USD in this integration. Local Payment
                  will be hidden in USD — only Crypto Payments (if enabled) would remain available.
                </p>
              ) : null}
              {pendingCurrency === "USD" && !usdPricingConfigured ? (
                <p className="mt-2 text-sm font-medium text-red-700">
                  Warning: no USD price is set on /admin/pricing yet. Set one first, or USD checkouts will fail
                  safely rather than charge anything.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={updateCurrencySettingsAction}>
                  <input type="hidden" name="active_currency" value={pendingCurrency} />
                  <button
                    type="submit"
                    className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Confirm switch to {CURRENCY_LABEL[pendingCurrency]}
                  </button>
                </form>
                <Link
                  href="/admin/payment-provider"
                  className="inline-flex items-center rounded-full border border-ink-200 px-5 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                >
                  Cancel
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-ink-100 bg-white p-5">
              <p className="text-sm font-medium text-ink-700">Switch currency for {environmentLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["NGN", "USD"] as const).map((currency) => (
                  <Link
                    key={currency}
                    href={
                      currency === activeCurrency
                        ? "/admin/payment-provider"
                        : `/admin/payment-provider?confirmCurrency=${currency}`
                    }
                    aria-current={currency === activeCurrency ? "true" : undefined}
                    className={`rounded-full px-5 py-2 text-sm font-semibold ${
                      currency === activeCurrency
                        ? "bg-ink-900 text-white"
                        : "border border-ink-200 text-ink-700 hover:bg-ink-50"
                    }`}
                  >
                    {CURRENCY_LABEL[currency]}
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-500">
                NGN is the safe default for every environment — if this setting is ever unreadable, checkout falls
                back to NGN rather than breaking.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
