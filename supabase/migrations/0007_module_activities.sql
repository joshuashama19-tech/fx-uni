-- =============================================================================
-- FX University — Module activity progress (exercises, checklist, quiz)
-- =============================================================================
-- Three more student-owned tables, extending the same pattern established in
-- 0006_course_progress.sql (itself following orders_insert_own_pending in
-- 0001_init.sql): direct-RLS student writes, gated by an active course_access
-- row on every INSERT/UPDATE policy, on top of requireCourseAccess() already
-- being checked in the calling Server Action (lib/progress/actions.ts).
--
-- These are deliberately separate from course_progress/lesson_completions —
-- lessons and module activities (exercises/quiz/checklist) are tracked
-- independently per the product requirement that "42/135 lessons" must never
-- be conflated with activity completion.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- module_exercise_completions — one row per (student, module) once the
-- student clicks "Mark Exercises Complete". Immutable, same as
-- lesson_completions — a row existing IS the completion.
-- ---------------------------------------------------------------------------
create table if not exists public.module_exercise_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null default 'fx-university',
  module_slug text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, course_id, module_slug)
);

comment on table public.module_exercise_completions is
  'One row per (user, course, module) once a student clicks "Mark Exercises Complete" on that module''s Exercises page. Immutable — no update/delete policy, matching lesson_completions.';

alter table public.module_exercise_completions enable row level security;

create policy "module_exercise_completions_select_own"
  on public.module_exercise_completions for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "module_exercise_completions_insert_own"
  on public.module_exercise_completions for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid()) and ca.course_id = course_id and ca.status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- module_checklist_progress — one row per (student, module): which checklist
-- items are currently checked. checked_items holds the stable item ids
-- lib/course-content.ts derives from the checklist markdown (e.g.
-- "core-understanding-0") — never free-form/user-supplied text.
-- completed_at is set once every item in the module's checklist is checked,
-- and cleared again if the student unchecks one — an honest, always-current
-- signal rather than a one-way flag.
-- ---------------------------------------------------------------------------
create table if not exists public.module_checklist_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null default 'fx-university',
  module_slug text not null,
  checked_items text[] not null default '{}',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id, module_slug)
);

comment on table public.module_checklist_progress is
  'One row per (user, course, module): which of that module''s checklist items (by stable id, e.g. "core-understanding-0") the student has checked. completed_at is set when every item is checked and cleared if one is unchecked again.';

alter table public.module_checklist_progress enable row level security;

create policy "module_checklist_progress_select_own"
  on public.module_checklist_progress for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "module_checklist_progress_insert_own"
  on public.module_checklist_progress for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid()) and ca.course_id = course_id and ca.status = 'active'
    )
  );

create policy "module_checklist_progress_update_own"
  on public.module_checklist_progress for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid()) and ca.course_id = course_id and ca.status = 'active'
    )
  );

create trigger module_checklist_progress_set_updated_at
  before update on public.module_checklist_progress
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- quiz_attempts — one row per (student, module): the student's current
-- knowledge-checkpoint attempt. Overwritten on retake, same "latest state,
-- not full history" pattern as course_progress — this course has no
-- requirement to keep multiple historical attempts.
--
-- `answers` holds one entry per question: {num, type, selectedLetter?,
-- selectedBool?, autoCorrect?, selfCorrect?} — never the correct answer or
-- explanation text itself (that lives only in the static course content,
-- read server-side from 03-quiz.md/04-answer-key.md, never persisted to the
-- database). score/total are computed server-side from autoCorrect/
-- selfCorrect, never trusted from the client directly.
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null default 'fx-university',
  module_slug text not null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score integer,
  total integer,
  answers jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id, module_slug)
);

comment on table public.quiz_attempts is
  'One row per (user, course, module): the student''s current knowledge-checkpoint attempt (started_at, submitted_at, score, total, and a per-question answers array). Retaking a quiz overwrites this row rather than keeping history. Never stores the correct answers or explanations themselves — only the student''s own responses and the derived score.';

alter table public.quiz_attempts enable row level security;

create policy "quiz_attempts_select_own"
  on public.quiz_attempts for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "quiz_attempts_insert_own"
  on public.quiz_attempts for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid()) and ca.course_id = course_id and ca.status = 'active'
    )
  );

create policy "quiz_attempts_update_own"
  on public.quiz_attempts for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid()) and ca.course_id = course_id and ca.status = 'active'
    )
  );

create trigger quiz_attempts_set_updated_at
  before update on public.quiz_attempts
  for each row
  execute function public.set_updated_at();
