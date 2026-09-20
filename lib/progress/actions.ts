"use server";

import { revalidatePath } from "next/cache";
import { requireCourseAccess, getCourseId } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getTotalLessonCount, resolveLessonRef, lessonKey, type LessonRef } from "@/lib/course-content";

// Persistent course progress: "last viewed lesson" (course_progress) and
// explicit lesson completions (lesson_completions) — see
// supabase/migrations/0006_course_progress.sql for the schema and RLS.
//
// Every write below calls requireCourseAccess() first, same as every other
// protected action in this codebase — never trusts that the calling page
// already checked. Writes go through the ordinary (non-admin) Supabase
// client, so they're RLS-scoped to the caller's own session; the
// migration's RLS policies independently re-require active course_access
// too, so a bug here alone could never let an unpaid user or another
// student's session write progress. Module/lesson values are always
// validated against the real course content (lib/course-content.ts) before
// any write — a request naming a module/lesson that doesn't exist is
// silently dropped, never recorded.

/** True for an authenticated, paying student opening a real lesson page. Never marks it completed. */
export async function recordLessonViewedAction(moduleSlug: string, lessonSlug: string): Promise<void> {
  const { user } = await requireCourseAccess();

  if (!getLesson(moduleSlug, lessonSlug)) return;

  const supabase = await createClient();
  await supabase.from("course_progress").upsert(
    {
      user_id: user.id,
      course_id: getCourseId(),
      last_module_slug: moduleSlug,
      last_lesson_slug: lessonSlug,
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" }
  );
}

/** The student's explicit "Mark Lesson Complete" action. Idempotent — clicking twice never creates a duplicate row. */
export async function markLessonCompleteAction(formData: FormData): Promise<void> {
  const { user } = await requireCourseAccess();

  const moduleSlug = String(formData.get("module") || "");
  const lessonSlug = String(formData.get("lesson") || "");
  if (!getLesson(moduleSlug, lessonSlug)) return;

  const supabase = await createClient();
  await supabase.from("lesson_completions").upsert(
    {
      user_id: user.id,
      course_id: getCourseId(),
      module_slug: moduleSlug,
      lesson_slug: lessonSlug,
    },
    { onConflict: "user_id,course_id,module_slug,lesson_slug", ignoreDuplicates: true }
  );

  revalidatePath(`/learn/${moduleSlug}/${lessonSlug}`);
  revalidatePath(`/learn/${moduleSlug}`);
  revalidatePath("/learn");
}

/**
 * A single targeted lookup for "is this one lesson completed" — used on the
 * lesson page itself (the highest-traffic read here, once per lesson view),
 * so it doesn't have to pull every completed row just to answer a yes/no
 * question. getStudentProgress() below is for the views that actually need
 * the whole set (the module nav's checkmarks, the dashboard's counts).
 */
export async function isLessonCompleted(userId: string, moduleSlug: string, lessonSlug: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", getCourseId())
    .eq("module_slug", moduleSlug)
    .eq("lesson_slug", lessonSlug)
    .maybeSingle();
  return data !== null;
}

export interface StudentProgress {
  completedCount: number;
  totalCount: number;
  percentage: number;
  /** "<moduleSlug>/<lessonSlug>" keys — cheap membership checks for lesson-nav checkmarks. */
  completedKeys: Set<string>;
  /** Where "Continue Learning" should go — never null; falls back to the course's first lesson. */
  continueTo: LessonRef | null;
}

/**
 * Reads everything the /learn dashboard, module nav, and lesson page need in
 * two small, indexed queries (at most 135 completion rows; one progress
 * row). Callers are always pages that already ran requireCourseAccess()
 * themselves for this same `userId` — RLS restricts the actual rows
 * returned to the caller's own session regardless, so a mismatched id here
 * can only ever yield fewer rows, never someone else's.
 */
export async function getStudentProgress(userId: string): Promise<StudentProgress> {
  const supabase = await createClient();
  const courseId = getCourseId();

  const [{ data: completions }, { data: progressRow }] = await Promise.all([
    supabase.from("lesson_completions").select("module_slug, lesson_slug").eq("user_id", userId).eq("course_id", courseId),
    supabase
      .from("course_progress")
      .select("last_module_slug, last_lesson_slug")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle(),
  ]);

  const completedKeys = new Set((completions ?? []).map((c) => lessonKey(c.module_slug, c.lesson_slug)));
  const totalCount = getTotalLessonCount();
  const completedCount = completedKeys.size;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const continueTo = resolveLessonRef(progressRow?.last_module_slug, progressRow?.last_lesson_slug);

  return { completedCount, totalCount, percentage, completedKeys, continueTo };
}
