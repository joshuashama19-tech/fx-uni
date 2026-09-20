import { redirect } from "next/navigation";

// The answer key is deliberately not an ordinary, directly-navigable
// student page — per the product requirement, it must never be presented
// as a normal course-navigation item before the student takes the quiz.
// Its content is only ever revealed through the Knowledge Check's own
// review flow (app/learn/[module]/quiz/page.tsx, via getQuizReview()),
// which only returns explanations for a question the student has actually
// submitted their own attempt on. Anyone who still reaches this URL
// directly (an old link, a bookmark) is sent to the quiz instead of a 404.
export default async function AnswerKeyRedirect({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  redirect(`/learn/${moduleSlug}/quiz`);
}
