import type { Metadata } from "next";
import { requireAdmin, getCourseId } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin — Dashboard" };

// Deliberately just three counts, per spec ("keep it simple, no unnecessary
// analytics"): total orders, paid (successful) students, and active course
// access. All three are simple counted queries against the service-role
// client — no new tables, no background jobs, nothing to keep in sync.
async function getDashboardCounts() {
  const db = createAdminClient();
  const courseId = getCourseId();

  // is_test = false on every query here: Test Mode data (supabase/migrations/
  // 0013_test_mode.sql) must never appear in these counts — see
  // /admin/test-mode for the isolated equivalent view.
  const [{ count: totalOrders }, { count: paidOrders }, { count: activeAccess }] = await Promise.all([
    db.from("orders").select("id", { count: "exact", head: true }).eq("is_test", false),
    db.from("orders").select("id", { count: "exact", head: true }).eq("status", "successful").eq("is_test", false),
    db
      .from("course_access")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("status", "active")
      .eq("is_test", false),
  ]);

  return {
    totalOrders: totalOrders ?? 0,
    paidOrders: paidOrders ?? 0,
    activeAccess: activeAccess ?? 0,
  };
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const { totalOrders, paidOrders, activeAccess } = await getDashboardCounts();

  const cards = [
    { label: "Total orders", value: totalOrders },
    { label: "Paid students", value: paidOrders },
    { label: "Active course access", value: activeAccess },
  ];

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-ink-950">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">A quick snapshot — see Students and Orders for detail.</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-ink-100 bg-white p-6">
              <p className="text-3xl font-semibold text-ink-950">{c.value}</p>
              <p className="mt-1 text-sm text-ink-500">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
