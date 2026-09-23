import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import {
  listDiscountCodes,
  createDiscountCodeAction,
  setDiscountCodeActiveAction,
  deleteDiscountCodeAction,
} from "@/lib/admin/discount-actions";
import { isWithinWindow } from "@/lib/discounts";
import type { DiscountCodeRow } from "@/lib/types";

export const metadata: Metadata = { title: "Admin — Discount Codes" };

function formatValue(row: DiscountCodeRow): string {
  if (row.discount_type === "percentage") return `${row.discount_value}%`;
  const major = row.discount_value / 100;
  return `₦${major.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

function formatUsage(row: DiscountCodeRow): string {
  return row.max_uses != null ? `${row.usage_count} / ${row.max_uses}` : `${row.usage_count} / unlimited`;
}

function statusLabel(row: DiscountCodeRow, now: Date): { label: string; className: string } {
  if (!row.is_active) return { label: "Inactive", className: "bg-ink-100 text-ink-600" };
  const windowState = isWithinWindow(row, now);
  if (windowState === "before_start") return { label: "Scheduled", className: "bg-amber-100 text-amber-800" };
  if (windowState === "after_end") return { label: "Expired", className: "bg-ink-100 text-ink-600" };
  if (row.max_uses != null && row.usage_count >= row.max_uses) {
    return { label: "Used up", className: "bg-ink-100 text-ink-600" };
  }
  return { label: "Active", className: "bg-green-100 text-green-800" };
}

/** Stored UTC ISO timestamp -> "YYYY-MM-DDTHH:mm" for a datetime-local input's defaultValue. */
function toDatetimeLocalUtc(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default async function AdminDiscountCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const [codes, now] = [await listDiscountCodes(), new Date()];

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-ink-950">Discount codes</h1>
        <p className="mt-1 text-sm text-ink-500">
          Codes students can apply at checkout on /get-started. Every code is re-validated server-side at the moment
          of checkout — never trusted from what the browser previously showed. Usage counts only increase after a
          payment is confirmed successful, never when a code is merely applied/previewed.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{params.error}</p>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-xl border border-ink-100 bg-white">
          {codes.length === 0 ? (
            <p className="p-6 text-sm text-ink-500">No discount codes yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Per customer</th>
                    <th className="px-4 py-3">Window (UTC)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((row) => {
                    const status = statusLabel(row, now);
                    return (
                      <tr key={row.id} className="border-t border-ink-100 align-top">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-900">{row.code}</td>
                        <td className="px-4 py-3 text-ink-700">{formatValue(row)}</td>
                        <td className="px-4 py-3 text-ink-700">{formatUsage(row)}</td>
                        <td className="px-4 py-3 text-ink-700">{row.max_uses_per_customer ?? "unlimited"}</td>
                        <td className="px-4 py-3 text-xs text-ink-500">
                          {row.starts_at ? new Date(row.starts_at).toLocaleString() : "no start"}
                          {" – "}
                          {row.ends_at ? new Date(row.ends_at).toLocaleString() : "no end"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/discount-codes/${row.id}/edit`}
                              className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
                            >
                              Edit
                            </Link>
                            <form action={setDiscountCodeActiveAction}>
                              <input type="hidden" name="id" value={row.id} />
                              <input type="hidden" name="is_active" value={row.is_active ? "false" : "true"} />
                              <button
                                type="submit"
                                className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
                              >
                                {row.is_active ? "Deactivate" : "Activate"}
                              </button>
                            </form>
                            <form action={deleteDiscountCodeAction}>
                              <input type="hidden" name="id" value={row.id} />
                              <button
                                type="submit"
                                className="rounded-lg border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                              >
                                {row.usage_count > 0 ? "Deactivate & remove from list" : "Delete"}
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form action={createDiscountCodeAction} className="mt-8 space-y-6 rounded-xl border border-ink-100 bg-white p-5">
          <h2 className="text-base font-semibold text-ink-950">Create a discount code</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Code</span>
              <input
                type="text"
                name="code"
                required
                placeholder="e.g. LAUNCH10"
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm uppercase focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Type</span>
              <select
                name="discount_type"
                defaultValue="percentage"
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
                placeholder="e.g. 10"
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
                placeholder="e.g. 5000"
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
                defaultValue="1"
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
                defaultValue={toDatetimeLocalUtc(null)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Ends (UTC, optional)</span>
              <input
                type="datetime-local"
                name="ends_at"
                defaultValue={toDatetimeLocalUtc(null)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
          </div>
          <p className="-mt-3 text-xs text-ink-500">Leave either blank for no limit on that side. Times are in UTC.</p>

          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            Active
          </label>

          <div className="flex justify-end border-t border-ink-100 pt-4">
            <button
              type="submit"
              className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
            >
              Create discount code
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
