import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule } from "@/lib/course-content";
import { getChecklist } from "@/lib/course-content-activities";
import { requireCourseAccess } from "@/lib/access";
import { getChecklistProgress } from "@/lib/progress/activity-actions";
import { MarkdownBlocks } from "@/lib/markdown/render";
import { ChecklistRunner } from "@/components/course/ChecklistRunner";

export const metadata: Metadata = { title: "Completion Checklist" };

export default async function ChecklistPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  const checklist = getChecklist(moduleSlug);
  if (!mod || !checklist) notFound();

  const { user } = await requireCourseAccess();
  const progress = await getChecklistProgress(user.id, moduleSlug);

  return (
    <article>
      <p className="text-sm text-ink-500">
        <Link href="/learn" className="hover:text-ink-800">
          Course
        </Link>{" "}
        /{" "}
        <Link href={`/learn/${mod.slug}`} className="hover:text-ink-800">
          Module {mod.order}: {mod.title}
        </Link>{" "}
        / Checklist
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">Completion Checklist</h1>

      {checklist.intro.length > 0 ? (
        <div className="mt-4 max-w-[70ch] text-sm">
          <MarkdownBlocks blocks={checklist.intro} />
        </div>
      ) : null}

      <div className="mt-8 max-w-[70ch]">
        <ChecklistRunner
          moduleSlug={moduleSlug}
          groups={checklist.groups}
          initialCheckedIds={[...progress.checkedItems]}
          initialComplete={progress.completedAt !== null}
        />
      </div>

      {checklist.outro.length > 0 ? (
        <div className="mt-6 max-w-[70ch] border-t border-ink-100 pt-6 text-sm text-ink-600">
          <MarkdownBlocks blocks={checklist.outro} />
        </div>
      ) : null}

      <nav className="mt-4 border-t border-ink-100 pt-6 text-sm">
        <Link href={`/learn/${mod.slug}`} className="font-medium text-brand-600 hover:text-brand-700">
          ← Back to Module {mod.order}
        </Link>
      </nav>
    </article>
  );
}
