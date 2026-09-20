import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, getAdjacentLessons } from "@/lib/course-content";
import { requireCourseAccess } from "@/lib/access";
import { isLessonCompleted, markLessonCompleteAction } from "@/lib/progress/actions";
import { RecordLessonView } from "@/components/learn/RecordLessonView";
import { MarkdownBlocks } from "@/lib/markdown/render";
import { IconCheckCircle } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}): Promise<Metadata> {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const found = getLesson(moduleSlug, lessonSlug);
  return { title: found ? found.lesson.title : "Lesson" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const found = getLesson(moduleSlug, lessonSlug);
  if (!found) notFound();

  const { module: mod, lesson } = found;
  const { prev, next } = getAdjacentLessons(moduleSlug, lessonSlug);

  const { user } = await requireCourseAccess();
  const completed = await isLessonCompleted(user.id, moduleSlug, lessonSlug);

  return (
    <article>
      <RecordLessonView moduleSlug={moduleSlug} lessonSlug={lessonSlug} />

      <p className="text-sm text-ink-500">
        <Link href="/learn" className="hover:text-ink-800">
          Course
        </Link>{" "}
        /{" "}
        <Link href={`/learn/${mod.slug}`} className="hover:text-ink-800">
          Module {mod.order}
        </Link>{" "}
        / Lesson {lesson.order}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">{lesson.title}</h1>

      <div className="mt-8 max-w-[70ch]">
        <MarkdownBlocks blocks={lesson.blocks} />
      </div>

      <div className="mt-8 max-w-[70ch] border-t border-ink-100 pt-6">
        {completed ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
            <IconCheckCircle className="h-4 w-4" /> Lesson completed
          </p>
        ) : (
          <form action={markLessonCompleteAction}>
            <input type="hidden" name="module" value={moduleSlug} />
            <input type="hidden" name="lesson" value={lessonSlug} />
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Mark Lesson Complete
            </button>
          </form>
        )}
      </div>

      <nav className="mt-8 flex items-center justify-between gap-4 border-t border-ink-100 pt-6 text-sm">
        {prev ? (
          <Link href={`/learn/${prev.moduleSlug}/${prev.lessonSlug}`} className="text-ink-600 hover:text-ink-900">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${next.moduleSlug}/${next.lessonSlug}`}
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            {next.title} →
          </Link>
        ) : (
          <Link href={`/learn/${mod.slug}`} className="font-medium text-brand-600 hover:text-brand-700">
            Back to module →
          </Link>
        )}
      </nav>
    </article>
  );
}
