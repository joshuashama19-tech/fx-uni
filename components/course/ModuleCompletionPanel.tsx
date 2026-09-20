import Link from "next/link";
import type { Block } from "@/lib/markdown/types";
import { MarkdownBlocks } from "@/lib/markdown/render";
import { IconCheckCircle, IconArrowRight } from "@/components/icons";

function StatusRow({ label, complete, detail }: { label: string; complete: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-100 py-3 last:border-b-0">
      <span className="text-sm font-medium text-ink-800">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
          complete ? "text-brand-700" : "text-ink-400"
        }`}
      >
        {complete ? <IconCheckCircle className="h-4 w-4" /> : null}
        {detail}
      </span>
    </div>
  );
}

export function ModuleCompletionPanel({
  lessonsCompleted,
  lessonsTotal,
  exercisesComplete,
  quizSubmitted,
  quizScore,
  quizTotal,
  checklistComplete,
  checklistCheckedCount,
  checklistTotalItems,
  beforeYouMoveOn,
  nextModuleHref,
  nextModuleTitle,
}: {
  lessonsCompleted: number;
  lessonsTotal: number;
  exercisesComplete: boolean;
  quizSubmitted: boolean;
  quizScore: number | null;
  quizTotal: number | null;
  checklistComplete: boolean;
  checklistCheckedCount: number;
  checklistTotalItems: number;
  beforeYouMoveOn: Block[] | null;
  nextModuleHref: string | null;
  nextModuleTitle: string | null;
}) {
  const lessonsComplete = lessonsTotal > 0 && lessonsCompleted === lessonsTotal;
  const moduleComplete = lessonsComplete && exercisesComplete && quizSubmitted && checklistComplete;

  return (
    <section className="mt-10 rounded-2xl border border-ink-100 bg-ink-50/60 p-6 sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight text-ink-950">Module Completion</h2>

      {beforeYouMoveOn && beforeYouMoveOn.length > 0 ? (
        <div className="mt-3 max-w-[70ch] text-sm">
          <MarkdownBlocks blocks={beforeYouMoveOn} />
        </div>
      ) : null}

      <div className="mt-4 rounded-xl border border-ink-100 bg-white px-5">
        <StatusRow label="Lessons" complete={lessonsComplete} detail={`${lessonsCompleted} / ${lessonsTotal}`} />
        <StatusRow label="Exercises" complete={exercisesComplete} detail={exercisesComplete ? "Complete" : "Not started"} />
        <StatusRow
          label="Knowledge Check"
          complete={quizSubmitted}
          detail={quizSubmitted ? `Complete — ${quizScore ?? 0}/${quizTotal ?? 0}` : "Not started"}
        />
        <StatusRow
          label="Checklist"
          complete={checklistComplete}
          detail={checklistComplete ? "Complete" : `${checklistCheckedCount} / ${checklistTotalItems}`}
        />
      </div>

      <div className="mt-5">
        {moduleComplete ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
              <IconCheckCircle className="h-4 w-4" /> Module Complete
            </p>
            {nextModuleHref && nextModuleTitle ? (
              <Link
                href={nextModuleHref}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Continue to {nextModuleTitle} <IconArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <p className="text-sm text-ink-600">You&apos;ve completed the final module of the core curriculum.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-500">
            Complete the lessons, exercises, knowledge check, and checklist above to finish this module.
          </p>
        )}
      </div>
    </section>
  );
}
