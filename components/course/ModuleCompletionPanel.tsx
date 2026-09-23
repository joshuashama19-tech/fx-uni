import Link from "next/link";
import type { Block } from "@/lib/markdown/types";
import { MarkdownBlocks } from "@/lib/markdown/render";
import { ModuleActivityCard } from "@/components/course/ModuleActivityCard";
import { IconCheckCircle, IconArrowRight } from "@/components/icons";

function StatusRow({ label, complete, detail }: { label: string; complete: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-100 py-3 last:border-b-0">
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
          complete ? "text-brand-700" : "text-ink-700"
        }`}
      >
        {complete ? <IconCheckCircle className="h-4 w-4 flex-none" /> : null}
        {label}: <span className="font-semibold">{detail}</span>
      </span>
    </div>
  );
}

export function ModuleCompletionPanel({
  moduleSlug,
  moduleOrder,
  lessonsCompleted,
  lessonsTotal,
  exercisesComplete,
  quizSubmitted,
  quizScore,
  quizTotal,
  quizQuestionCount,
  checklistComplete,
  checklistCheckedCount,
  checklistTotalItems,
  beforeList,
  afterList,
  nextModuleHref,
  nextModuleTitle,
}: {
  moduleSlug: string;
  moduleOrder: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  exercisesComplete: boolean;
  quizSubmitted: boolean;
  quizScore: number | null;
  quizTotal: number | null;
  /** Total question count for this module's Knowledge Check, known even before the student has submitted an attempt (unlike quizTotal, which only exists once an attempt is stored) — used so the status row can show "0 / 15" instead of "0 / 0" pre-submission. */
  quizQuestionCount: number;
  checklistComplete: boolean;
  checklistCheckedCount: number;
  checklistTotalItems: number;
  /** Content before/after the module's own file-instruction list, already split and humanized by splitModuleWrapUp() — see that function's doc comment for why the split matters (a dangling "...three things to complete:" lead-in otherwise). The activity cards below are spliced in exactly where that instruction list used to be, so beforeList's lead-in sentence still reads naturally into them. */
  beforeList: Block[];
  afterList: Block[];
  nextModuleHref: string | null;
  nextModuleTitle: string | null;
}) {
  const lessonsComplete = lessonsTotal > 0 && lessonsCompleted === lessonsTotal;
  const moduleComplete = lessonsComplete && exercisesComplete && quizSubmitted && checklistComplete;
  const quizDenominator = quizTotal ?? quizQuestionCount;

  return (
    <section className="mt-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-6 sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight text-ink-950">Before You Move On</h2>

      {beforeList.length > 0 ? (
        <div className="mt-3 max-w-[70ch] text-sm text-ink-600">
          <MarkdownBlocks blocks={beforeList} />
        </div>
      ) : null}

      {/* Real, clickable activity cards — not a generated text list — so
          "Before You Move On" links straight to each activity instead of
          just describing it. This is the module's only set of activity
          links (there's no separate "Practice & Assessment" grid elsewhere
          on the page), so nothing here duplicates content shown above. */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ModuleActivityCard
          href={`/learn/${moduleSlug}/exercises`}
          title="📝 Exercises"
          description="Applied practice for this module"
          status={{ complete: exercisesComplete }}
        />
        <ModuleActivityCard
          href={`/learn/${moduleSlug}/quiz`}
          title="🧠 Knowledge Check"
          description="Interactive checkpoint quiz"
          status={quizSubmitted ? { complete: true, label: `${quizScore ?? 0}/${quizTotal ?? 0}` } : { complete: false }}
        />
        <ModuleActivityCard
          href={`/learn/${moduleSlug}/checklist`}
          title="☑ Completion Checklist"
          description="Confirm you're ready to continue"
          status={{
            complete: checklistComplete,
            label: checklistComplete ? undefined : `${checklistCheckedCount}/${checklistTotalItems} items`,
          }}
        />
      </div>

      {afterList.length > 0 ? (
        <div className="mt-4 max-w-[70ch] text-sm text-ink-600">
          <MarkdownBlocks blocks={afterList} />
        </div>
      ) : null}

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-500">Module Completion</h3>
      <div className="mt-2 rounded-xl border border-ink-100 bg-white px-5">
        <StatusRow label="Lessons" complete={lessonsComplete} detail={`${lessonsCompleted} / ${lessonsTotal}`} />
        <StatusRow label="Exercises" complete={exercisesComplete} detail={exercisesComplete ? "Complete" : "Not complete"} />
        <StatusRow
          label="Knowledge Check"
          complete={quizSubmitted}
          detail={`${quizScore ?? 0} / ${quizDenominator}`}
        />
        <StatusRow label="Checklist" complete={checklistComplete} detail={`${checklistCheckedCount} / ${checklistTotalItems}`} />
      </div>

      <div className="mt-5">
        {moduleComplete ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
              <IconCheckCircle className="h-4 w-4" /> Module {moduleOrder} Complete
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
          <p className="text-sm text-ink-500">Complete the remaining activities above to finish this module.</p>
        )}
      </div>
    </section>
  );
}
