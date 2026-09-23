import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { getSiteContent } from "@/lib/content";
import { updateSiteContentAction } from "@/lib/admin/content-actions";

export const metadata: Metadata = { title: "Admin — Content" };

// The small, fixed set of editable marketing strings (see lib/content.ts).
// Deliberately NOT every string on the page — layout and most copy stay in
// code. The price itself is intentionally absent from this list — it's
// managed at /admin/pricing (lib/pricing.ts), which is also what the
// actual Paystack charge reads, so price and promotion changes always stay
// in one place rather than being editable from two different screens.
const FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "final_cta_headline", label: "Final call-to-action headline" },
  { key: "final_cta_subheadline", label: "Final call-to-action subheadline", multiline: true },
  { key: "final_cta_button_label", label: "Final call-to-action button label" },
  { key: "pricing_billing_note", label: "Pricing card billing note (e.g. \"One-time payment\")" },
];

export default async function AdminContentPage() {
  await requireAdmin();
  const content = await getSiteContent();

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink-950">Marketing content</h1>
        <p className="mt-1 text-sm text-ink-500">
          A small set of editable strings on /course. To change the price or the special enrollment offer, use{" "}
          <a href="/admin/pricing" className="underline underline-offset-2 hover:text-ink-800">
            Pricing
          </a>{" "}
          instead — it&apos;s not editable here.
        </p>

        <div className="mt-8 space-y-4">
          {FIELDS.map((field) => (
            <form
              key={field.key}
              action={updateSiteContentAction}
              className="rounded-xl border border-ink-100 bg-white p-5"
            >
              <input type="hidden" name="key" value={field.key} />
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-ink-700">{field.label}</span>
                {field.multiline ? (
                  <textarea
                    name="value"
                    required
                    rows={3}
                    defaultValue={content[field.key as keyof typeof content]}
                    className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                ) : (
                  <input
                    type="text"
                    name="value"
                    required
                    defaultValue={content[field.key as keyof typeof content]}
                    className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                )}
              </label>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-ink-900 px-4 py-2 text-xs font-semibold text-white hover:bg-ink-800"
                >
                  Save
                </button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}
