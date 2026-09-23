import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, listModules, lessonKey } from "@/lib/course-content";
import { splitModuleWrapUp, humanizeBlocks } from "@/lib/course-content-activities";
import { requireCourseAccess } from "@/lib/access";
import { getStudentProgress } from "@/lib/progress/actions";
import { getModuleActivityStatus } from "@/lib/progress/activity-actions";
import { MarkdownBlocks } from "@/lib/markdown/render";
import { ModuleActivityCard } from "@/components/course/ModuleActivityCard";
import { ModuleCompletionPanel } from "@/components/course/ModuleCompletionPanel";
import { IconArrowRight, IconCheckCircle } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  return { title: mod ? mod.title : "Module" };
}

export default async function ModuleOverviewPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  if (!mod) notFound();

  const { user } = await requireCourseAccess();
  const [progress, activity] = await Promise.all([
    getStudentProgress(user.id),
    getModuleActivityStatus(user.id, moduleSlug),
  ]);

  const modules = listModules();
  const modIndex = modules.findIndex((m) => m.slug === moduleSlug);
  const nextModule = modIndex >= 0 && modIndex < modules.length - 1 ? modules[modIndex + 1] : null;

  const lessonsCompletedInModule = mod.lessons.filter((l) => progress.completedKeys.has(lessonKey(mod.slug, l.slug))).length;
  const { keepSections, beforeList, afterList } = splitModuleWrapUp(mod);

  return (
    <div>
      <p className="text-sm text-ink-500">
        <Link href="/learn" className="hover:text-ink-800">
          Course
        </Link>{" "}
        / Module {mod.order}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">{mod.title}</h1>
      {mod.subtitle ? <p className="mt-1 text-base italic text-ink-500">{mod.subtitle}</p> : null}

      {mod.introBlocks.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-ink-950">Module Introduction</h2>
          <MarkdownBlocks blocks={humanizeBlocks(mod.introBlocks)} />
        </section>
      ) : null}

      {mod.objectivesBlocks.length > 0 ? (
        <section className="mt-6 rounded-xl border border-ink-100 bg-ink-50 p-5">
          <h2 className="text-lg font-semibold text-ink-950">Learning Objectives</h2>
          <MarkdownBlocks blocks={humanizeBlocks(mod.objectivesBlocks)} />
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-950">Lessons</h2>
          <span className="text-sm text-ink-500">
            {lessonsCompletedInModule} / {mod.lessons.length}
          </span>
        </div>
        <ol className="mt-4 space-y-2">
          {mod.lessons.map((lesson) => {
            const completed = progress.completedKeys.has(lessonKey(mod.slug, lesson.slug));
            return (
              <li key={lesson.slug}>
                <Link
                  href={`/learn/${mod.slug}/${lesson.slug}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-ink-100 px-4 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
                >
                  <span className="flex items-center gap-2 text-sm text-ink-800">
                    {completed ? (
                      <IconCheckCircle className="h-4 w-4 flex-none text-brand-600" aria-label="Completed" />
                    ) : (
                      <span className="w-4 flex-none text-ink-400">{lesson.order}.</span>
                    )}
                    {lesson.title}
                  </span>
                  <IconArrowRight className="h-4 w-4 flex-none text-ink-400" />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink-950">Practice &amp; Assessment</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ModuleActivityCard
            href={`/learn/${mod.slug}/exercises`}
            title="Exercises"
            description="Applied practice for this module"
            status={{ complete: activity.exercisesComplete }}
          />
          <ModuleActivityCard
            href={`/learn/${mod.slug}/quiz`}
            title="Knowledge Check"
            description="Interactive checkpoint quiz"
            status={
              activity.quizSubmitted
                ? { complete: true, label: `${activity.quizScore ?? 0}/${activity.quizTotal ?? 0}` }
                : { complete: false }
            }
          />
          <ModuleActivityCard
            href={`/learn/${mod.slug}/checklist`}
            title="Completion Checklist"
            description="Confirm you're ready to continue"
            status={{
              complete: activity.checklistComplete,
              label: activity.checklistComplete ? undefined : `${activity.checklistCheckedCount}/${activity.checklistTotalItems} items`,
            }}
          />
        </div>
      </section>

      {keepSections.map((section) => (
        <section key={section.title} className="mt-10">
          <h2 className="text-lg font-semibold text-ink-950">{section.title}</h2>
          <MarkdownBlocks blocks={humanizeBlocks(section.blocks)} />
        </section>
      ))}

      <ModuleCompletionPanel
        moduleOrder={mod.order}
        lessonsCompleted={lessonsCompletedInModule}
        lessonsTotal={mod.lessons.length}
        exercisesComplete={activity.exercisesComplete}
        quizSubmitted={activity.quizSubmitted}
        quizScore={activity.quizScore}
        quizTotal={activity.quizTotal}
        checklistComplete={activity.checklistComplete}
        checklistCheckedCount={activity.checklistCheckedCount}
        checklistTotalItems={activity.checklistTotalItems}
        beforeList={beforeList}
        afterList={afterList}
        nextModuleHref={nextModule ? `/learn/${nextModule.slug}` : null}
        nextModuleTitle={nextModule ? `Module ${nextModule.order}` : null}
      />

      <nav className="mt-8 flex items-center justify-between border-t border-ink-100 pt-6 text-sm">
        {modIndex > 0 ? (
          <Link href={`/learn/${modules[modIndex - 1].slug}`} className="text-ink-600 hover:text-ink-900">
            ← {modules[modIndex - 1].title}
          </Link>
        ) : (
          <span />
        )}
        {nextModule ? (
          <Link href={`/learn/${nextModule.slug}`} className="font-medium text-brand-600 hover:text-brand-700">
            {nextModule.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
