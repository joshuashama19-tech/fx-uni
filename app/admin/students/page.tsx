import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { findStudents, grantAccessAction, revokeAccessAction, restoreAccessAction } from "@/lib/admin/actions";

export const metadata: Metadata = { title: "Admin — Students" };

// Deliberately minimal per spec: find a student, see payment/access status,
// grant/revoke/restore access. No course editor, no grading, no analytics.
// Gated by requireAdmin() (profiles.is_admin, checked server-side — see
// lib/access.ts) — there is no separate "admin login"; a non-admin hitting
// this URL is redirected to "/" with no signal that it exists.
export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const students = q ? await findStudents(q) : [];

  return (
    <main className="min-h-screen bg-ink-50 px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-ink-950">Students</h1>
        <p className="mt-1 text-sm text-ink-500">Search by email to view payment and course-access status.</p>

        <form action="/admin/students" method="GET" className="mt-6 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="student@email.com"
            className="w-full max-w-sm rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
          >
            Search
          </button>
        </form>

        {q ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-ink-100 bg-white">
            {students.length === 0 ? (
              <p className="p-6 text-sm text-ink-500">No students matched &quot;{q}&quot;.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Access</th>
                    <th className="px-4 py-3">Last order</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-t border-ink-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-900">{s.full_name || "—"}</p>
                        <p className="text-ink-500">{s.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <AccessBadge status={s.access_status} />
                        {s.revoked_at ? (
                          <p className="mt-1 text-xs text-ink-400">
                            Revoked {new Date(s.revoked_at).toLocaleDateString()}
                          </p>
                        ) : s.granted_at ? (
                          <p className="mt-1 text-xs text-ink-400">
                            Since {new Date(s.granted_at).toLocaleDateString()}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-ink-600">
                        {s.latest_order_reference ? (
                          <>
                            <p className="font-mono text-xs">{s.latest_order_reference}</p>
                            <p className="text-xs text-ink-400">{s.latest_order_status}</p>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {s.access_status !== "active" ? (
                            <form action={s.access_status === "revoked" ? restoreAccessAction : grantAccessAction}>
                              <input type="hidden" name="userId" value={s.id} />
                              <button className="rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-800">
                                {s.access_status === "revoked" ? "Restore access" : "Grant access"}
                              </button>
                            </form>
                          ) : (
                            <form action={revokeAccessAction}>
                              <input type="hidden" name="userId" value={s.id} />
                              <button className="rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                                Revoke access
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}

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
