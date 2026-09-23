import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRow, OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Admin — Orders" };

const PAGE_SIZE = 50;

async function getRecentOrders(): Promise<(OrderRow & { email: string | null })[]> {
  const db = createAdminClient();

  const { data: orders } = await db
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (!orders || orders.length === 0) return [];

  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const { data: profiles } = await db.from("profiles").select("id, email").in("id", userIds);

  return orders.map((o) => ({
    ...o,
    email: profiles?.find((p) => p.id === o.user_id)?.email ?? null,
  }));
}

function formatAmount(minorUnits: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(minorUnits / 100);
  } catch {
    return `${currency} ${(minorUnits / 100).toLocaleString("en-NG")}`;
  }
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  successful: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-brand-100 text-brand-700",
  cancelled: "bg-ink-100 text-ink-600",
  refunded: "bg-ink-100 text-ink-600",
  disputed: "bg-brand-100 text-brand-700",
};

// Read-only by design — order status changes only through the Paystack
// webhook / verification flow (lib/payments/*) or an admin's explicit grant
// /revoke of course_access on the Students page, never by hand-editing an
// order row here. That keeps the payment ledger an accurate record of what
// Paystack actually reported.
export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getRecentOrders();

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-ink-950">Orders</h1>
        <p className="mt-1 text-sm text-ink-500">
          Most recent {PAGE_SIZE} orders, newest first. Status reflects Paystack&apos;s own verification result.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-ink-100 bg-white">
          {orders.length === 0 ? (
            <p className="p-6 text-sm text-ink-500">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-ink-100">
                      <td className="px-4 py-3 text-ink-700">{o.email ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-600">{o.paystack_reference}</td>
                      <td className="px-4 py-3 text-ink-900">
                        {o.discount_code ? (
                          <>
                            <span className="text-xs text-ink-400 line-through">
                              {formatAmount(o.base_amount_minor_units, o.currency)}
                            </span>{" "}
                            {formatAmount(o.amount_minor_units, o.currency)}
                          </>
                        ) : (
                          formatAmount(o.amount_minor_units, o.currency)
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-600">
                        {o.discount_code ? (
                          <>
                            <span className="font-mono font-medium text-ink-800">{o.discount_code}</span>
                            <br />
                            −{formatAmount(o.discount_amount_minor_units, o.currency)}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
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
        </div>
      </div>
    </main>
  );
}
