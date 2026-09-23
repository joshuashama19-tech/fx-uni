import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { getDiscountCode, updateDiscountCodeAction } from "@/lib/admin/discount-actions";

export const metadata: Metadata = { title: "Admin — Edit Discount Code" };

/** Stored UTC ISO timestamp -> "YYYY-MM-DDTHH:mm" for a datetime-local input's defaultValue. */
function toDatetimeLocalUtc(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function toMajorAmountString(minorUnits: number): string {
  const major = minorUnits / 100;
  return major % 1 === 0 ? String(major) : major.toFixed(2);
}

export default async function EditDiscountCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const searchParamsResolved = await searchParams;
  const row = await getDiscountCode(id);

  if (!row) notFound();

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/discount-codes" className="text-sm text-ink-500 underline underline-offset-2 hover:text-ink-800">
          ← Back to discount codes
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink-950">
          Edit <span className="font-mono">{row.code}</span>
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {row.usage_count > 0
            ? `Used ${row.usage_count} time${row.usage_count === 1 ? "" : "s"} so far. The code, type and value can still be changed, but changes only affect future redemptions — orders already placed keep the discount amount they were charged.`
            : "Not used yet."}
        </p>

        {searchParamsResolved.error ? (
          <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{searchParamsResolved.error}</p>
        ) : null}

        <form
          action={updateDiscountCodeAction}
          className="mt-8 space-y-6 rounded-xl border border-ink-100 bg-white p-5"
        >
          <input type="hidden" name="id" value={row.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Code</span>
              <input
                type="text"
                name="code"
                required
                defaultValue={row.code}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm uppercase focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Type</span>
              <select
                name="discount_type"
                defaultValue={row.discount_type}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Percentage value (1–100, used only if type is Percentage)</span>
              <input
                type="number"
                name="discount_value_percent"
                min="1"
                max="100"
                step="1"
                defaultValue={row.discount_type === "percentage" ? row.discount_value : ""}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Fixed value, NGN (used only if type is Fixed amount)</span>
              <input
                type="number"
                name="discount_value_fixed"
                min="1"
                step="0.01"
                defaultValue={row.discount_type === "fixed" ? toMajorAmountString(row.discount_value) : ""}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Max total uses (optional)</span>
              <input
                type="number"
                name="max_uses"
                min="1"
                step="1"
                defaultValue={row.max_uses ?? ""}
                placeholder="Leave blank for unlimited"
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Max uses per customer (optional)</span>
              <input
                type="number"
                name="max_uses_per_customer"
                min="1"
                step="1"
                defaultValue={row.max_uses_per_customer ?? ""}
                placeholder="Leave blank for unlimited"
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Starts (UTC, optional)</span>
              <input
                type="datetime-local"
                name="starts_at"
                defaultValue={toDatetimeLocalUtc(row.starts_at)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Ends (UTC, optional)</span>
              <input
                type="datetime-local"
                name="ends_at"
                defaultValue={toDatetimeLocalUtc(row.ends_at)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
          </div>
          <p className="-mt-3 text-xs text-ink-500">Leave either blank for no limit on that side. Times are in UTC.</p>

          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={row.is_active}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            Active
          </label>

          <div className="flex justify-end border-t border-ink-100 pt-4">
            <button
              type="submit"
              className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
