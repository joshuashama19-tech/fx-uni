import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, getModuleDocument } from "@/lib/course-content";
import { prepareExerciseBlocks } from "@/lib/course-content-activities";
import { requireCourseAccess } from "@/lib/access";
import { isExercisesCompleted, markExercisesCompleteAction } from "@/lib/progress/activity-actions";
import { MarkdownBlocks } from "@/lib/markdown/render";
import { IconCheckCircle } from "@/components/icons";

export const metadata: Metadata = { title: "Exercises" };

export default async function ExercisesPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  const doc = getModuleDocument(moduleSlug, "exercises");
  if (!mod || !doc) notFound();

  const { user } = await requireCourseAccess();
  const completed = await isExercisesCompleted(user.id, moduleSlug);
  const blocks = prepareExerciseBlocks(doc.blocks);

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
        / Exercises
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">Exercises</h1>

      <div className="mt-8 max-w-[70ch]">
        <MarkdownBlocks blocks={blocks} />
      </div>

      <div className="mt-8 max-w-[70ch] border-t border-ink-100 pt-6">
        {completed ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
            <IconCheckCircle className="h-4 w-4" /> Exercises complete
          </p>
        ) : (
          <form action={markExercisesCompleteAction}>
            <input type="hidden" name="module" value={moduleSlug} />
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              ✓ Mark Exercises Complete
            </button>
          </form>
        )}
      </div>

      <nav className="mt-12 border-t border-ink-100 pt-6 text-sm">
        <Link href={`/learn/${mod.slug}`} className="font-medium text-brand-600 hover:text-brand-700">
          ← Back to Module {mod.order}
        </Link>
      </nav>
    </article>
  );
}
