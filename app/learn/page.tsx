import type { Metadata } from "next";
import Link from "next/link";
import { listModules } from "@/lib/course-content";
import { requireCourseAccess } from "@/lib/access";
import { getStudentProgress } from "@/lib/progress/actions";
import { ContinueLearningCard } from "@/components/learn/ContinueLearningCard";
import { ProgressSummary } from "@/components/learn/ProgressSummary";
import { IconArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Course" };

export default async function LearnDashboardPage() {
  // Re-checked independently of the layout, same principle used everywhere
  // else in this codebase — this page never trusts that requireCourseAccess()
  // already ran upstream, and it needs `user.id` for the progress lookup
  // regardless.
  const { user } = await requireCourseAccess();
  const modules = listModules();
  const progress = await getStudentProgress(user.id);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Your course</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
        FX University — Forex Trading Course
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
        Ten modules, in order. Each module includes lessons, exercises, a quiz with an answer key, and a
        completion checklist.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {progress.continueTo ? <ContinueLearningCard target={progress.continueTo} /> : null}
        <ProgressSummary
          completedCount={progress.completedCount}
          totalCount={progress.totalCount}
          percentage={progress.percentage}
        />
      </div>

      <ol className="mt-8 space-y-3">
        {modules.map((m) => (
          <li key={m.slug}>
            <Link
              href={`/learn/${m.slug}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 px-5 py-4 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink-50 text-sm font-semibold text-ink-700">
                  {String(m.order).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-medium text-ink-900">{m.title}</p>
                  <p className="text-sm text-ink-500">{m.lessonCount} lessons</p>
                </div>
              </div>
              <IconArrowRight className="h-4 w-4 flex-none text-ink-400" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
