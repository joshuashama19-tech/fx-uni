import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { updatePaymentProviderAction } from "@/lib/admin/payment-provider-actions";
import { resolvePaymentEnvironment } from "@/lib/payments/provider";
import type { PaymentEnvironment, PaymentProvider, PaymentSettingsRow } from "@/lib/types";

export const metadata: Metadata = { title: "Admin — Payment Provider" };

const PROVIDER_LABEL: Record<PaymentProvider, string> = {
  paystack: "Paystack",
  korapay: "Korapay",
};

const ENVIRONMENT_LABEL: Record<PaymentEnvironment, string> = {
  production: "Production",
  preview: "Preview",
};

async function getActiveProvider(environment: PaymentEnvironment): Promise<PaymentProvider> {
  const db = createAdminClient();
  const { data } = await db
    .from("payment_settings")
    .select("*")
    .eq("environment", environment)
    .maybeSingle<PaymentSettingsRow>();
  // Same safe-default philosophy as resolvePaymentProvider() itself
  // (lib/payments/provider.ts) — an unreadable/missing row is shown as
  // Paystack here too, never left ambiguous or shown as Korapay.
  return data?.active_provider === "korapay" ? "korapay" : "paystack";
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
  searchParams: Promise<{ confirm?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const environment = resolvePaymentEnvironment();
  const activeProvider = await getActiveProvider(environment);
  const environmentLabel = ENVIRONMENT_LABEL[environment];

  const pendingConfirm: PaymentProvider | null =
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

        <div className="mt-8 rounded-xl border border-ink-100 bg-ink-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Environment</p>
          <p className="mt-1 text-lg font-semibold text-ink-950">{environmentLabel}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">Active provider</p>
          <p className="mt-1 text-2xl font-semibold text-ink-950">{PROVIDER_LABEL[activeProvider]}</p>
        </div>

        {pendingConfirm && pendingConfirm !== activeProvider ? (
          <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
            <p className="text-sm font-semibold text-brand-700">
              Switch {environmentLabel} to {PROVIDER_LABEL[pendingConfirm]}?
            </p>
            <p className="mt-1.5 text-sm text-brand-700">
              This affects new checkouts in this environment only. {environmentLabel} checkouts will start using{" "}
              {PROVIDER_LABEL[pendingConfirm]} immediately after you confirm. This does not change the other
              environment&apos;s setting, and no existing order is affected — each one keeps the provider it was
              created with.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={updatePaymentProviderAction}>
                <input type="hidden" name="active_provider" value={pendingConfirm} />
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
      </div>
    </main>
  );
}
