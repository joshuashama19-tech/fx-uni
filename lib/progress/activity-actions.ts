"use server";

import { revalidatePath } from "next/cache";
import { requireCourseAccess, getCourseId } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { getModule } from "@/lib/course-content";
import { getChecklist, getQuiz, type QuizQuestionType } from "@/lib/course-content-activities";

// Module-level activity progress: exercises, checklist, and the interactive
// quiz — see supabase/migrations/0007_module_activities.sql for the schema
// and RLS. Kept in a separate file from lib/progress/actions.ts (lesson
// view/completion) on purpose: lessons and activities are tracked
// independently, never conflated into one "lessons" count.
//
// Same defense-in-depth as every other protected write in this codebase:
// requireCourseAccess() runs first in every action below, and the
// migration's RLS policies independently re-require an active course_access
// row on every insert/update, so a bug in this file alone could never let
// an unpaid user or another student's session write activity progress.
//
// The quiz's correct answers/explanations (from getQuiz(), which reads
// 04-answer-key.md) are never persisted to the database and never returned
// from an action until the student has actually submitted that question —
// see submitQuizAction/buildQuizResult below.

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

/** The student's "Mark Exercises Complete" action. Idempotent — clicking twice never duplicates. */
export async function markExercisesCompleteAction(formData: FormData): Promise<void> {
  const { user } = await requireCourseAccess();
  const moduleSlug = String(formData.get("module") || "");
  if (!getModule(moduleSlug)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("module_exercise_completions").upsert(
    { user_id: user.id, course_id: getCourseId(), module_slug: moduleSlug },
    { onConflict: "user_id,course_id,module_slug", ignoreDuplicates: true }
  );
  // Every write in this file now checks {error} and throws rather than
  // silently continuing — found during the checklist-persistence
  // investigation that NONE of them did, which meant a denied/failed write
  // (RLS, a dropped connection, anything) would still return as if it had
  // succeeded, and the calling page would go on to render a "Complete"
  // state that the database never actually recorded. Throwing here lets
  // the Server Action's caller (a plain <form>, so Next.js's own error
  // boundary) surface the failure instead of silently lying to the student.
  if (error) throw new Error(`Couldn't save exercise completion: ${error.message}`);

  revalidatePath(`/learn/${moduleSlug}/exercises`);
  revalidatePath(`/learn/${moduleSlug}`);
  revalidatePath("/learn");
}

export async function isExercisesCompleted(userId: string, moduleSlug: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("module_exercise_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", getCourseId())
    .eq("module_slug", moduleSlug)
    .maybeSingle();
  return data !== null;
}

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

export interface ChecklistProgress {
  checkedItems: Set<string>;
  completedAt: string | null;
}

export async function getChecklistProgress(userId: string, moduleSlug: string): Promise<ChecklistProgress> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("module_checklist_progress")
    .select("checked_items, completed_at")
    .eq("user_id", userId)
    .eq("course_id", getCourseId())
    .eq("module_slug", moduleSlug)
    .maybeSingle();
  return { checkedItems: new Set(data?.checked_items ?? []), completedAt: data?.completed_at ?? null };
}

/**
 * Checks or unchecks one item. Re-validates the item id against the real,
 * parsed checklist (getChecklist()) before writing — an id that doesn't
 * exist in this module's checklist is rejected, never recorded. Auto-sets
 * completed_at once every item is checked, and clears it again the moment
 * one is unchecked — an honest, always-current signal rather than a
 * one-way flag, matching how this checklist works everywhere else in the
 * app (revisiting shows the real current state, not a stale snapshot).
 */
export async function toggleChecklistItemAction(
  moduleSlug: string,
  itemId: string,
  checked: boolean
): Promise<ChecklistProgress> {
  const { user } = await requireCourseAccess();
  const checklist = getChecklist(moduleSlug);
  if (!checklist) throw new Error("Unknown module");

  const validIds = new Set(checklist.groups.flatMap((g) => g.items.map((i) => i.id)));
  if (!validIds.has(itemId)) throw new Error("Unknown checklist item");

  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("module_checklist_progress")
    .select("checked_items")
    .eq("user_id", user.id)
    .eq("course_id", getCourseId())
    .eq("module_slug", moduleSlug)
    .maybeSingle();
  // A failed read must not be treated as "no items checked yet" — that
  // would silently drop every other item the student already checked the
  // next time they toggle one.
  if (readError) throw new Error(`Couldn't load checklist progress: ${readError.message}`);

  const current = new Set<string>(existing?.checked_items ?? []);
  if (checked) current.add(itemId);
  else current.delete(itemId);

  const checkedItems = [...current];
  const completedAt = checkedItems.length === checklist.totalItems ? new Date().toISOString() : null;

  const { error: writeError } = await supabase.from("module_checklist_progress").upsert(
    {
      user_id: user.id,
      course_id: getCourseId(),
      module_slug: moduleSlug,
      checked_items: checkedItems,
      completed_at: completedAt,
    },
    { onConflict: "user_id,course_id,module_slug" }
  );
  if (writeError) throw new Error(`Couldn't save checklist progress: ${writeError.message}`);

  revalidatePath(`/learn/${moduleSlug}/checklist`);
  revalidatePath(`/learn/${moduleSlug}`);
  revalidatePath("/learn");

  return { checkedItems: current, completedAt };
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

interface StoredAnswer {
  num: number;
  type: QuizQuestionType;
  selectedLetter: string | null;
  selectedBool: boolean | null;
  autoCorrect: boolean | null;
  selfCorrect: boolean | null;
}

export interface QuizAnswerInput {
  num: number;
  selectedLetter?: string;
  selectedBool?: boolean;
}

export interface QuizReviewQuestion {
  num: number;
  type: QuizQuestionType;
  prompt: string;
  options?: { letter: string; text: string }[];
  correctLetter?: string;
  correctBool?: boolean;
  explanation: string;
  studentSelectedLetter?: string;
  studentSelectedBool?: boolean;
  autoCorrect: boolean | null;
  selfCorrect: boolean | null;
}

export interface QuizResult {
  score: number;
  total: number;
  questions: QuizReviewQuestion[];
}

/** Fired once (best-effort) when the student opens an unsubmitted quiz. Never overwrites an existing started_at/submitted_at. */
export async function startQuizAttemptAction(moduleSlug: string): Promise<void> {
  const { user } = await requireCourseAccess();
  if (!getQuiz(moduleSlug)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("quiz_attempts").upsert(
    { user_id: user.id, course_id: getCourseId(), module_slug: moduleSlug },
    { onConflict: "user_id,course_id,module_slug", ignoreDuplicates: true }
  );
  // Genuinely best-effort (the caller already wraps this call in .catch(() => {})
  // — a missed "started_at" timestamp isn't worth surfacing to the student),
  // but still throw on error for consistency with every other write in this
  // file and so the failure is at least visible in server logs.
  if (error) throw new Error(`Couldn't record quiz attempt start: ${error.message}`);
}

/**
 * Grades multiple-choice/true-false answers server-side against the
 * authoritative answer key (never trusts a client-reported "correct" flag)
 * and persists the attempt. Open-ended questions (short answer,
 * calculation, scenario) can't be auto-graded — they start ungraded
 * (autoCorrect: null) and the student self-assesses each one afterward via
 * selfAssessQuizAnswerAction, exactly like this course's own answer keys
 * already frame these checkpoints ("this isn't pass/fail — it's a
 * signal"). Returns the full graded review (correct answers + explanations
 * included) — safe here because this only ever runs after the student's
 * own submission of their own attempt.
 */
export async function submitQuizAction(moduleSlug: string, answers: QuizAnswerInput[]): Promise<QuizResult> {
  const { user } = await requireCourseAccess();
  const quiz = getQuiz(moduleSlug);
  if (!quiz) throw new Error("Unknown module");

  const answerByNum = new Map(answers.map((a) => [a.num, a]));
  const stored: StoredAnswer[] = quiz.questions.map((q) => {
    const a = answerByNum.get(q.num);
    let autoCorrect: boolean | null = null;
    if (q.type === "mc") autoCorrect = a?.selectedLetter != null && a.selectedLetter === q.correctLetter;
    else if (q.type === "tf") autoCorrect = a?.selectedBool != null && a.selectedBool === q.correctBool;
    return {
      num: q.num,
      type: q.type,
      selectedLetter: a?.selectedLetter ?? null,
      selectedBool: a?.selectedBool ?? null,
      autoCorrect,
      selfCorrect: null,
    };
  });

  const score = stored.filter((s) => s.autoCorrect === true).length;
  const total = quiz.questions.length;

  const supabase = await createClient();
  const { error } = await supabase.from("quiz_attempts").upsert(
    {
      user_id: user.id,
      course_id: getCourseId(),
      module_slug: moduleSlug,
      submitted_at: new Date().toISOString(),
      score,
      total,
      answers: stored,
    },
    { onConflict: "user_id,course_id,module_slug" }
  );
  // If this write fails, the student must NOT be shown a score/review that
  // was never actually saved — throw so QuizRunner's submit handler surfaces
  // an error instead of quietly moving to a review screen that won't still
  // be there on the next visit.
  if (error) throw new Error(`Couldn't save your quiz submission: ${error.message}`);

  revalidatePath(`/learn/${moduleSlug}/quiz`);
  revalidatePath(`/learn/${moduleSlug}`);
  revalidatePath("/learn");

  return buildQuizResult(quiz.questions, stored);
}

/** The student's own "I got this right" / "I need to review this" self-mark for one open-ended question, after submission. */
export async function selfAssessQuizAnswerAction(
  moduleSlug: string,
  num: number,
  selfCorrect: boolean
): Promise<QuizResult> {
  const { user } = await requireCourseAccess();
  const quiz = getQuiz(moduleSlug);
  if (!quiz) throw new Error("Unknown module");
  const question = quiz.questions.find((q) => q.num === num);
  if (!question || question.type === "mc" || question.type === "tf") {
    throw new Error("This question is graded automatically and can't be self-assessed");
  }

  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("quiz_attempts")
    .select("answers, submitted_at")
    .eq("user_id", user.id)
    .eq("course_id", getCourseId())
    .eq("module_slug", moduleSlug)
    .maybeSingle();
  if (readError) throw new Error(`Couldn't load your quiz attempt: ${readError.message}`);

  if (!existing?.submitted_at) throw new Error("Submit the quiz before self-assessing an answer");

  const answers: StoredAnswer[] = (existing.answers as StoredAnswer[] | null) ?? [];
  const updated = answers.map((a) => (a.num === num ? { ...a, selfCorrect } : a));
  const score = updated.filter((a) => a.autoCorrect === true || a.selfCorrect === true).length;

  const { error: writeError } = await supabase
    .from("quiz_attempts")
    .update({ answers: updated, score })
    .eq("user_id", user.id)
    .eq("course_id", getCourseId())
    .eq("module_slug", moduleSlug);
  if (writeError) throw new Error(`Couldn't save your self-assessment: ${writeError.message}`);

  revalidatePath(`/learn/${moduleSlug}/quiz`);
  revalidatePath(`/learn/${moduleSlug}`);
  revalidatePath("/learn");

  return buildQuizResult(quiz.questions, updated);
}

function buildQuizResult(
  questions: {
    num: number;
    type: QuizQuestionType;
    prompt: string;
    options?: { letter: string; text: string }[];
    correctLetter?: string;
    correctBool?: boolean;
    explanation: string;
  }[],
  stored: StoredAnswer[]
): QuizResult {
  const byNum = new Map(stored.map((s) => [s.num, s]));
  const reviewQuestions: QuizReviewQuestion[] = questions.map((q) => {
    const s = byNum.get(q.num);
    return {
      num: q.num,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      correctLetter: q.correctLetter,
      correctBool: q.correctBool,
      explanation: q.explanation,
      studentSelectedLetter: s?.selectedLetter ?? undefined,
      studentSelectedBool: s?.selectedBool ?? undefined,
      autoCorrect: s?.autoCorrect ?? null,
      selfCorrect: s?.selfCorrect ?? null,
    };
  });
  const score = stored.filter((s) => s.autoCorrect === true || s.selfCorrect === true).length;
  return { score, total: questions.length, questions: reviewQuestions };
}

/** Read-only summary for the module page's completion panel — never includes answers/explanations. */
export async function getQuizAttemptSummary(
  userId: string,
  moduleSlug: string
): Promise<{ submitted: boolean; score: number | null; total: number | null }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("submitted_at, score, total")
    .eq("user_id", userId)
    .eq("course_id", getCourseId())
    .eq("module_slug", moduleSlug)
    .maybeSingle();
  return { submitted: !!data?.submitted_at, score: data?.score ?? null, total: data?.total ?? null };
}

/** The already-submitted attempt's full review data (for re-visiting the quiz page after submission) — RLS-scoped to the caller's own attempt. */
export async function getQuizReview(userId: string, moduleSlug: string): Promise<QuizResult | null> {
  const quiz = getQuiz(moduleSlug);
  if (!quiz) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("answers, submitted_at")
    .eq("user_id", userId)
    .eq("course_id", getCourseId())
    .eq("module_slug", moduleSlug)
    .maybeSingle();
  if (!data?.submitted_at) return null;
  return buildQuizResult(quiz.questions, (data.answers as StoredAnswer[] | null) ?? []);
}

// ---------------------------------------------------------------------------
// Combined read for the module page's "Module Completion" panel
// ---------------------------------------------------------------------------

export interface ModuleActivityStatus {
  exercisesComplete: boolean;
  checklistCheckedCount: number;
  checklistTotalItems: number;
  checklistComplete: boolean;
  quizSubmitted: boolean;
  quizScore: number | null;
  quizTotal: number | null;
}

export async function getModuleActivityStatus(userId: string, moduleSlug: string): Promise<ModuleActivityStatus> {
  const checklist = getChecklist(moduleSlug);
  const [exercisesComplete, checklistProgress, quizSummary] = await Promise.all([
    isExercisesCompleted(userId, moduleSlug),
    getChecklistProgress(userId, moduleSlug),
    getQuizAttemptSummary(userId, moduleSlug),
  ]);
  return {
    exercisesComplete,
    checklistCheckedCount: checklistProgress.checkedItems.size,
    checklistTotalItems: checklist?.totalItems ?? 0,
    checklistComplete: checklistProgress.completedAt !== null,
    quizSubmitted: quizSummary.submitted,
    quizScore: quizSummary.score,
    quizTotal: quizSummary.total,
  };
}
