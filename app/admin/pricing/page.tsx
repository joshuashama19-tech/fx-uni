import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePricing } from "@/lib/pricing";
import { updatePricingSettingsAction } from "@/lib/admin/pricing-actions";
import type { PricingSettingsRow } from "@/lib/types";

export const metadata: Metadata = { title: "Admin — Pricing" };

async function getRawSettings(): Promise<PricingSettingsRow | null> {
  const db = createAdminClient();
  const { data } = await db.from("pricing_settings").select("*").eq("id", 1).maybeSingle<PricingSettingsRow>();
  return data;
}

/** minor units (kobo) -> a plain "43000" / "29900.50" string for the number input. */
function toMajorAmountString(minorUnits: number | null): string {
  if (minorUnits == null) return "";
  const major = minorUnits / 100;
  return major % 1 === 0 ? String(major) : major.toFixed(2);
}

/** Stored UTC ISO timestamp -> "YYYY-MM-DDTHH:mm" for a datetime-local input's defaultValue (UTC, not the browser's local time — see the field labels). */
function toDatetimeLocalUtc(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default async function AdminPricingPage() {
  await requireAdmin();
  const [settings, pricing] = await Promise.all([getRawSettings(), resolvePricing()]);

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink-950">Pricing &amp; promotion</h1>
        <p className="mt-1 text-sm text-ink-500">
          Controls the regular price, an optional time-boxed special enrollment offer, and the countdown shown on
          the landing page. This is the actual price charged at checkout — the landing page, the get-started page,
          and Paystack all read the same values from here in real time.
        </p>

        {/* Live summary — exactly what a customer would be charged right now */}
        <div className="mt-8 rounded-xl border border-ink-100 bg-ink-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Right now</p>
          <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-4">
            <dt className="text-ink-500">Regular price</dt>
            <dd className="text-ink-900">{pricing.regularPriceFormatted}</dd>
            <dt className="text-ink-500">Current offer</dt>
            <dd className="text-ink-900">{pricing.offerPriceFormatted ?? "—"}</dd>
            <dt className="text-ink-500">Discount</dt>
            <dd className="text-ink-900">{pricing.discountPercent != null ? `${pricing.discountPercent}%` : "—"}</dd>
            <dt className="text-ink-500">Savings</dt>
            <dd className="text-ink-900">{pricing.savingsFormatted ?? "—"}</dd>
            <dt className="text-ink-500">Promotion</dt>
            <dd className={pricing.isPromoActive ? "font-medium text-brand-700" : "text-ink-600"}>
              {pricing.isPromoActive ? "Active" : settings?.promotion_active ? "Configured, not in window" : "Inactive"}
            </dd>
            <dt className="text-ink-500">Ends</dt>
            <dd className="text-ink-900">
              {settings?.promotion_ends_at ? new Date(settings.promotion_ends_at).toLocaleString() : "—"}
            </dd>
            <dt className="text-ink-500">Payable now</dt>
            <dd className="font-semibold text-ink-950">{pricing.payableFormatted}</dd>
          </dl>
        </div>

        <form action={updatePricingSettingsAction} className="mt-8 space-y-6 rounded-xl border border-ink-100 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Regular price ({settings?.currency ?? "NGN"})</span>
              <input
                type="number"
                name="regular_price"
                min="1"
                step="0.01"
                required
                defaultValue={toMajorAmountString(settings?.regular_price_minor_units ?? null)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Offer price ({settings?.currency ?? "NGN"}, optional)</span>
              <input
                type="number"
                name="offer_price"
                min="1"
                step="0.01"
                defaultValue={toMajorAmountString(settings?.offer_price_minor_units ?? null)}
                placeholder="Leave blank for no promotion"
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input
              type="checkbox"
              name="promotion_active"
              defaultChecked={settings?.promotion_active ?? false}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            Promotion active
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-ink-700">Promotion title</span>
            <input
              type="text"
              name="promotion_title"
              defaultValue={settings?.promotion_title ?? "Special Enrollment Offer"}
              className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-ink-700">Promotional subtext (optional)</span>
            <textarea
              name="promotion_subtext"
              rows={2}
              defaultValue={settings?.promotion_subtext ?? ""}
              placeholder='e.g. "Once the offer ends, the course returns to its regular price."'
              className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Start (UTC)</span>
              <input
                type="datetime-local"
                name="promotion_starts_at"
                defaultValue={toDatetimeLocalUtc(settings?.promotion_starts_at ?? null)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">End (UTC)</span>
              <input
                type="datetime-local"
                name="promotion_ends_at"
                defaultValue={toDatetimeLocalUtc(settings?.promotion_ends_at ?? null)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
          </div>
          <p className="-mt-3 text-xs text-ink-500">
            Leave either blank for no limit on that side. Times are in UTC, not your local timezone.
          </p>

          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input
              type="checkbox"
              name="countdown_enabled"
              defaultChecked={settings?.countdown_enabled ?? true}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            Show countdown on the landing page
          </label>

          <div className="flex justify-end border-t border-ink-100 pt-4">
            <button
              type="submit"
              className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
            >
              Save pricing
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-ink-500">
          An offer price is only ever applied if it&apos;s a positive amount strictly below the regular price — this
          is enforced on save and again every time the price is resolved, so a promotion can never accidentally
          charge more than the regular price.
        </p>
      </div>
    </main>
  );
}
