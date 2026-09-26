-- =============================================================================
-- FX University — Persistent course progress (last viewed lesson + completions)
-- =============================================================================
-- Two tables, same security model as every other student-owned table in this
-- schema (orders/course_access in 0001_init.sql):
--   - course_progress    — one row per (user, course): where they last were.
--   - lesson_completions — one row per lesson a student has explicitly marked
--                          complete. A row existing IS the completion; there
--                          is no boolean to flip back and forth.
--
-- Unlike the admin CMS tables (0005_admin_cms.sql), these are ordinary
-- student-owned data — the same category as `orders`, where
-- orders_insert_own_pending already lets an authenticated student write
-- their OWN row directly under RLS. Progress follows that same pattern
-- rather than routing through the service-role client: a student's own
-- Server Action (lib/progress/actions.ts) still calls requireCourseAccess()
-- first (defense in depth, same principle used everywhere else in this
-- codebase — "never trust that the caller already checked"), and RLS
-- independently re-enforces the same course_access requirement on every
-- write below, so a bug in the Server Action layer alone could never let an
-- unpaid or another student's session write progress.
--
-- Module/lesson identity uses the same slugs the app already routes on
-- (/learn/[module]/[lesson] — see lib/course-content.ts), not numeric
-- indexes, so this never has to be kept in sync with lesson reordering by
-- hand.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- course_progress
-- ---------------------------------------------------------------------------
create table if not exists public.course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null default 'fx-university',
  last_module_slug text not null,
  last_lesson_slug text not null,
  last_viewed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

comment on table public.course_progress is
  'One row per (user, course): the lesson they most recently opened ("Continue Learning"). Written by recordLessonViewedAction (lib/progress/actions.ts) whenever an authenticated, paying student actually opens a lesson page — opening a lesson never marks it complete; see lesson_completions for that. Both requireCourseAccess() in the Server Action and this table''s own RLS policies require an active course_access row before a write is allowed.';

alter table public.course_progress enable row level security;

create policy "course_progress_select_own"
  on public.course_progress for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "course_progress_insert_own"
  on public.course_progress for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid()) and ca.course_id = course_id and ca.status = 'active'
    )
  );

create policy "course_progress_update_own"
  on public.course_progress for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid()) and ca.course_id = course_id and ca.status = 'active'
    )
  );

-- No delete policy — nothing in the app deletes progress.

create trigger course_progress_set_updated_at
  before update on public.course_progress
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- lesson_completions
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null default 'fx-university',
  module_slug text not null,
  lesson_slug text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, course_id, module_slug, lesson_slug)
);

comment on table public.lesson_completions is
  'One row per lesson a student has explicitly marked complete via markLessonCompleteAction (lib/progress/actions.ts) — opening a lesson does NOT insert a row here (see course_progress for that). The unique constraint is what makes repeated "Mark Lesson Complete" clicks safe: the action upserts with ignoreDuplicates, so a lesson can never have more than one completion row per student. Row existing = completed; there is no separate boolean and nothing in this app deletes a completion.';

-- The unique constraint above already provides a covering index for the
-- "all of this student''s completions" query pattern (user_id, course_id
-- lead it), so no separate index is added here.

alter table public.lesson_completions enable row level security;

create policy "lesson_completions_select_own"
  on public.lesson_completions for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "lesson_completions_insert_own"
  on public.lesson_completions for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid()) and ca.course_id = course_id and ca.status = 'active'
    )
  );

-- No update/delete policy — a completion is immutable once created; there is
-- no "un-complete" feature.
