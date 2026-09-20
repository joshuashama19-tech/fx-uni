import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TestimonialRow } from "@/lib/types";
import {
  createTestimonialAction,
  updateTestimonialAction,
  toggleTestimonialActiveAction,
  deleteTestimonialAction,
} from "@/lib/admin/content-actions";

export const metadata: Metadata = { title: "Admin — Testimonials" };

async function getAllTestimonials(): Promise<TestimonialRow[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
}

// Public visibility rule (enforced independently by RLS — see
// supabase/migrations/0005_admin_cms.sql — this label is just so the admin
// can see it at a glance): a testimonial only ever appears on /course when
// is_active is true AND is_placeholder is false. Every row this page shows
// that isn't both of those is visible here, in the admin, only.
function visibilityLabel(t: TestimonialRow): { text: string; className: string } {
  if (t.is_placeholder) return { text: "Placeholder — never public", className: "bg-ink-100 text-ink-600" };
  if (t.is_active) return { text: "Public", className: "bg-green-100 text-green-800" };
  return { text: "Hidden", className: "bg-ink-100 text-ink-600" };
}

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  const testimonials = await getAllTestimonials();

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-ink-950">Testimonials</h1>
        <p className="mt-1 text-sm text-ink-500">
          Only testimonials marked Public (active, not a placeholder) ever show on /course. Never mark a
          placeholder as public — add the student&apos;s real name and quote first.
        </p>

        <details className="mt-8 rounded-xl border border-ink-100 bg-white p-5 open:pb-6">
          <summary className="cursor-pointer text-sm font-semibold text-ink-900">Add a testimonial</summary>
          <form action={createTestimonialAction} className="mt-4 grid gap-3">
            <TestimonialFields />
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
              >
                Add testimonial
              </button>
            </div>
          </form>
        </details>

        <div className="mt-6 space-y-4">
          {testimonials.length === 0 ? (
            <p className="text-sm text-ink-500">No testimonials yet.</p>
          ) : (
            testimonials.map((t) => {
              const visibility = visibilityLabel(t);
              return (
                <div key={t.id} className="rounded-xl border border-ink-100 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink-900">
                        {t.student_name}
                        {t.role_title ? <span className="font-normal text-ink-500"> — {t.role_title}</span> : null}
                      </p>
                      <p className="mt-1 text-sm text-ink-600">&ldquo;{t.quote}&rdquo;</p>
                      <p className="mt-2 text-xs text-ink-400">Order {t.display_order}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${visibility.className}`}>
                      {visibility.text}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <details>
                      <summary className="cursor-pointer rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                        Edit
                      </summary>
                      <form action={updateTestimonialAction} className="mt-3 grid gap-3">
                        <input type="hidden" name="id" value={t.id} />
                        <TestimonialFields testimonial={t} />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="rounded-lg bg-ink-900 px-4 py-2 text-xs font-semibold text-white hover:bg-ink-800"
                          >
                            Save changes
                          </button>
                        </div>
                      </form>
                    </details>

                    {!t.is_placeholder ? (
                      <form action={toggleTestimonialActiveAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="next_active" value={(!t.is_active).toString()} />
                        <button className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                          {t.is_active ? "Hide from /course" : "Publish to /course"}
                        </button>
                      </form>
                    ) : null}

                    <form action={deleteTestimonialAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <button className="rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

function TestimonialFields({ testimonial }: { testimonial?: TestimonialRow }) {
  return (
    <>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-ink-700">Student name</span>
        <input
          type="text"
          name="student_name"
          required
          defaultValue={testimonial?.student_name}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-ink-700">Role / description (optional)</span>
        <input
          type="text"
          name="role_title"
          defaultValue={testimonial?.role_title ?? ""}
          placeholder="e.g. Module 6 graduate"
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-ink-700">Quote</span>
        <textarea
          name="quote"
          required
          rows={3}
          defaultValue={testimonial?.quote}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
      <label className="grid max-w-[8rem] gap-1 text-sm">
        <span className="font-medium text-ink-700">Display order</span>
        <input
          type="number"
          name="display_order"
          defaultValue={testimonial?.display_order ?? 0}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" name="is_active" defaultChecked={testimonial?.is_active ?? false} />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" name="is_placeholder" defaultChecked={testimonial?.is_placeholder ?? true} />
          This is a placeholder, not a real student quote
        </label>
      </div>
      <p className="text-xs text-ink-400">
        A testimonial only shows on /course if Active is checked AND Placeholder is unchecked.
      </p>
    </>
  );
}
