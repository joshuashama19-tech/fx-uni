import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule } from "@/lib/course-content";
import { getQuiz, toPublicQuiz } from "@/lib/course-content-activities";
import { requireCourseAccess } from "@/lib/access";
import { getQuizReview } from "@/lib/progress/activity-actions";
import { QuizRunner } from "@/components/course/QuizRunner";

export const metadata: Metadata = { title: "Knowledge Check" };

export default async function QuizPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  const quiz = getQuiz(moduleSlug);
  if (!mod || !quiz) notFound();

  const { user } = await requireCourseAccess();
  // Already-submitted attempts render straight into review mode; an
  // unsubmitted student only ever receives toPublicQuiz() below — no
  // correct answers or explanations reach the browser before submission.
  const existingReview = await getQuizReview(user.id, moduleSlug);

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
        / Knowledge Check
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">{quiz.title}</h1>
      <p className="mt-2 max-w-[70ch] text-sm text-ink-600">
        {quiz.questions.length} questions covering this module. Answer each one, then submit to see your score and
        review every answer.
      </p>

      <div className="mt-8 max-w-[70ch]">
        <QuizRunner moduleSlug={moduleSlug} questions={toPublicQuiz(quiz)} initialResult={existingReview} />
      </div>

      <nav className="mt-8 max-w-[70ch] border-t border-ink-100 pt-6 text-sm">
        <Link href={`/learn/${mod.slug}`} className="font-medium text-brand-600 hover:text-brand-700">
          ← Back to Module {mod.order}
        </Link>
      </nav>
    </article>
  );
}
