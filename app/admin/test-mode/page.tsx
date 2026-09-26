import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { formatMinorUnits } from "@/lib/pricing";
import {
  listTestAccounts,
  listTestOrders,
  createTestAccountAction,
  resetTestAccountAction,
  deleteTestAccountAction,
} from "@/lib/admin/test-mode-actions";

export const metadata: Metadata = { title: "Admin — Test Mode" };

// The dedicated, isolated area for everything Test Mode — see
// supabase/migrations/0013_test_mode.sql for the full design. Nothing shown
// or created here ever appears on the normal Dashboard/Orders/Students pages
// (those all filter is_test = false), and nothing on this page can ever
// touch a real account or order (every action re-verifies profiles.is_test
// = true for its target before doing anything — see
// lib/admin/test-mode-actions.ts).
export default async function AdminTestModePage() {
  await requireAdmin();
  const [accounts, orders] = await Promise.all([listTestAccounts(), listTestOrders()]);

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-ink-950">Test Mode</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Test accounts, orders, and course access here are completely isolated from Production: no real payment
          provider is ever called, no money moves, and none of this data appears on the Dashboard, Orders, or
          Students pages. A test checkout can validate and apply a real discount code, but it will never increment
          that code&apos;s usage count or move it toward &quot;Used up&quot; — that statistic only ever changes from a
          real payment.
        </p>

        <section className="mt-8 rounded-xl border border-ink-100 bg-white p-6">
          <h2 className="text-base font-semibold text-ink-950">Create a test account</h2>
          <p className="mt-1 text-sm text-ink-500">
            Creates a pre-confirmed account with <code className="font-mono text-xs">is_test = true</code>. Sign in
            with it on the public site to exercise the full checkout flow — it will always use the in-app simulated
            checkout, never Korapay or Paystack.
          </p>
          <form action={createTestAccountAction} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              name="name"
              placeholder="Full name (optional)"
              className="rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              type="email"
              name="email"
              placeholder="test@example.com"
              required
              className="rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              minLength={8}
              required
              className="rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              className="sm:col-span-3 rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 sm:w-fit"
            >
              Create test account
            </button>
          </form>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-ink-100 bg-white">
          <div className="border-b border-ink-100 px-6 py-4">
            <h2 className="text-base font-semibold text-ink-950">Test accounts</h2>
          </div>
          {accounts.length === 0 ? (
            <p className="p-6 text-sm text-ink-500">No test accounts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Access</th>
                    <th className="px-4 py-3">Last order</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.id} className="border-t border-ink-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-900">{a.full_name || "—"}</p>
                        <p className="text-ink-500">{a.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <AccessBadge status={a.access_status} />
                      </td>
                      <td className="px-4 py-3 text-ink-600">
                        {a.latest_order_reference ? (
                          <>
                            <p className="font-mono text-xs">{a.latest_order_reference}</p>
                            <p className="text-xs text-ink-400">{a.latest_order_status}</p>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={resetTestAccountAction}>
                            <input type="hidden" name="userId" value={a.id} />
                            <button className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                              Reset
                            </button>
                          </form>
                          <form action={deleteTestAccountAction}>
                            <input type="hidden" name="userId" value={a.id} />
                            <button className="rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-ink-100 bg-white">
          <div className="border-b border-ink-100 px-6 py-4">
            <h2 className="text-base font-semibold text-ink-950">Test orders</h2>
            <p className="mt-1 text-sm text-ink-500">Most recent 50 test orders, newest first.</p>
          </div>
          {orders.length === 0 ? (
            <p className="p-6 text-sm text-ink-500">No test orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Test account</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-ink-100">
                      <td className="px-4 py-3 text-ink-700">{o.email ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-600">{o.paystack_reference}</td>
                      <td className="px-4 py-3 text-ink-900">{formatMinorUnits(o.amount_minor_units, o.currency)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-500">{new Date(o.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const STATUS_STYLES: Record<string, string> = {
  successful: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-brand-100 text-brand-700",
  cancelled: "bg-ink-100 text-ink-600",
  refunded: "bg-ink-100 text-ink-600",
  disputed: "bg-brand-100 text-brand-700",
};

function AccessBadge({ status }: { status: "active" | "revoked" | "none" }) {
  const styles: Record<typeof status, string> = {
    active: "bg-green-100 text-green-800",
    revoked: "bg-brand-100 text-brand-700",
    none: "bg-ink-100 text-ink-600",
  };
  const labels: Record<typeof status, string> = { active: "Active", revoked: "Revoked", none: "No access" };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
