import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, listModules, lessonKey, DOC_LABELS, type ModuleDocKind } from "@/lib/course-content";
import { requireCourseAccess } from "@/lib/access";
import { getStudentProgress } from "@/lib/progress/actions";
import { MarkdownBlocks } from "@/lib/markdown/render";
import { IconArrowRight, IconCheck, IconCheckCircle } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  return { title: mod ? mod.title : "Module" };
}

const DOC_KINDS: ModuleDocKind[] = ["exercises", "quiz", "answer-key", "checklist"];

export default async function ModuleOverviewPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  if (!mod) notFound();

  const { user } = await requireCourseAccess();
  const progress = await getStudentProgress(user.id);

  const modules = listModules();
  const modIndex = modules.findIndex((m) => m.slug === moduleSlug);

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
          <MarkdownBlocks blocks={mod.introBlocks} />
        </section>
      ) : null}

      {mod.objectivesBlocks.length > 0 ? (
        <section className="mt-6 rounded-xl border border-ink-100 bg-ink-50 p-5">
          <h2 className="text-lg font-semibold text-ink-950">Learning Objectives</h2>
          <MarkdownBlocks blocks={mod.objectivesBlocks} />
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink-950">Lessons</h2>
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
        <h2 className="text-lg font-semibold text-ink-950">Practice &amp; Review</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DOC_KINDS.map((kind) => (
            <Link
              key={kind}
              href={`/learn/${mod.slug}/${kind}`}
              className="flex items-center gap-3 rounded-lg border border-ink-100 px-4 py-3.5 text-sm font-medium text-ink-800 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
            >
              <IconCheck className="h-4 w-4 flex-none text-brand-600" />
              {DOC_LABELS[kind]}
            </Link>
          ))}
        </div>
      </section>

      {mod.wrapUpSections.map((section) => (
        <section key={section.title} className="mt-10">
          <h2 className="text-lg font-semibold text-ink-950">{section.title}</h2>
          <MarkdownBlocks blocks={section.blocks} />
        </section>
      ))}

      <nav className="mt-12 flex items-center justify-between border-t border-ink-100 pt-6 text-sm">
        {modIndex > 0 ? (
          <Link href={`/learn/${modules[modIndex - 1].slug}`} className="text-ink-600 hover:text-ink-900">
            ← {modules[modIndex - 1].title}
          </Link>
        ) : (
          <span />
        )}
        {modIndex < modules.length - 1 ? (
          <Link href={`/learn/${modules[modIndex + 1].slug}`} className="font-medium text-brand-600 hover:text-brand-700">
            {modules[modIndex + 1].title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
