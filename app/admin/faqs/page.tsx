import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FaqRow } from "@/lib/types";
import { createFaqAction, updateFaqAction, toggleFaqActiveAction, deleteFaqAction } from "@/lib/admin/content-actions";

export const metadata: Metadata = { title: "Admin — FAQs" };

async function getAllFaqs(): Promise<FaqRow[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export default async function AdminFaqsPage() {
  await requireAdmin();
  const faqs = await getAllFaqs();

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-ink-950">FAQ</h1>
        <p className="mt-1 text-sm text-ink-500">Only questions marked Active show in the /course FAQ accordion.</p>

        <details className="mt-8 rounded-xl border border-ink-100 bg-white p-5 open:pb-6">
          <summary className="cursor-pointer text-sm font-semibold text-ink-900">Add a question</summary>
          <form action={createFaqAction} className="mt-4 grid gap-3">
            <FaqFields />
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
              >
                Add question
              </button>
            </div>
          </form>
        </details>

        <div className="mt-6 space-y-4">
          {faqs.length === 0 ? (
            <p className="text-sm text-ink-500">No FAQ items yet.</p>
          ) : (
            faqs.map((f) => (
              <div key={f.id} className="rounded-xl border border-ink-100 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink-900">{f.question}</p>
                    <p className="mt-1 text-sm text-ink-600">{f.answer}</p>
                    <p className="mt-2 text-xs text-ink-400">Order {f.display_order}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      f.is_active ? "bg-green-100 text-green-800" : "bg-ink-100 text-ink-600"
                    }`}
                  >
                    {f.is_active ? "Public" : "Hidden"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <details>
                    <summary className="cursor-pointer rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                      Edit
                    </summary>
                    <form action={updateFaqAction} className="mt-3 grid gap-3">
                      <input type="hidden" name="id" value={f.id} />
                      <FaqFields faq={f} />
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

                  <form action={toggleFaqActiveAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="next_active" value={(!f.is_active).toString()} />
                    <button className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                      {f.is_active ? "Hide from /course" : "Publish to /course"}
                    </button>
                  </form>

                  <form action={deleteFaqAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <button className="rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function FaqFields({ faq }: { faq?: FaqRow }) {
  return (
    <>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-ink-700">Question</span>
        <input
          type="text"
          name="question"
          required
          defaultValue={faq?.question}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-ink-700">Answer</span>
        <textarea
          name="answer"
          required
          rows={4}
          defaultValue={faq?.answer}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
      <label className="grid max-w-[8rem] gap-1 text-sm">
        <span className="font-medium text-ink-700">Display order</span>
        <input
          type="number"
          name="display_order"
          defaultValue={faq?.display_order ?? 0}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" name="is_active" defaultChecked={faq?.is_active ?? true} />
        Active
      </label>
    </>
  );
}
