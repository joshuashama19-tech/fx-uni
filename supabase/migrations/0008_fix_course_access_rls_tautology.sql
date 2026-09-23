-- Fixes a real bug found while investigating the reported "checklist
-- doesn't persist" issue: every course_access existence check added so far
-- (migration 0006's course_progress/lesson_completions policies, and this
-- module's own 0007 module_exercise_completions/module_checklist_progress/
-- quiz_attempts policies) wrote `and ca.course_id = course_id` intending to
-- compare the course_access row to the row being written — but inside an
-- `EXISTS (SELECT ... FROM course_access ca WHERE ...)` subquery, an
-- unqualified `course_id` resolves to the *subquery's own* `ca.course_id`
-- (course_access has a column of that name too), not the outer table's
-- row. So every one of these checks was actually `ca.course_id =
-- ca.course_id` — a tautology, always true — silently dropping the "is
-- this course_access row actually for this course" half of the check.
--
-- Confirmed by reading back pg_policies' stored with_check expression after
-- an initial attempt that still wrote unqualified `course_id`: Postgres had
-- resolved it to `ca.course_id = ca.course_id` again, proving the
-- resolution — not a copy-paste slip in this file — was the actual bug.
-- Fixed by qualifying the outer table's column with the table's own name
-- (e.g. `course_progress.course_id`), which is unambiguous from inside the
-- subquery.
--
-- This never caused a legitimate write to be wrongly *rejected* — that
-- would look like exactly the "toggle doesn't persist" symptom being
-- investigated, and the real cause of that turned out to be unrelated (see
-- lib/progress/activity-actions.ts, which never checked Supabase write
-- results for an error before this pass). With only one course_id in
-- production today ("fx-university") the practical impact of this bug has
-- been nil, but it silently over-widened every one of these eight
-- policies, and is fixed here rather than left in place.
--
-- ALTER POLICY only changes the check expression; nothing else about these
-- eight policies (their table, command, or role) changes.

alter policy "course_progress_insert_own" on public.course_progress
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid())
        and ca.course_id = course_progress.course_id
        and ca.status = 'active'
    )
  );

alter policy "course_progress_update_own" on public.course_progress
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid())
        and ca.course_id = course_progress.course_id
        and ca.status = 'active'
    )
  );

alter policy "lesson_completions_insert_own" on public.lesson_completions
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid())
        and ca.course_id = lesson_completions.course_id
        and ca.status = 'active'
    )
  );

alter policy "module_exercise_completions_insert_own" on public.module_exercise_completions
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid())
        and ca.course_id = module_exercise_completions.course_id
        and ca.status = 'active'
    )
  );

alter policy "module_checklist_progress_insert_own" on public.module_checklist_progress
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid())
        and ca.course_id = module_checklist_progress.course_id
        and ca.status = 'active'
    )
  );

alter policy "module_checklist_progress_update_own" on public.module_checklist_progress
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid())
        and ca.course_id = module_checklist_progress.course_id
        and ca.status = 'active'
    )
  );

alter policy "quiz_attempts_insert_own" on public.quiz_attempts
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid())
        and ca.course_id = quiz_attempts.course_id
        and ca.status = 'active'
    )
  );

alter policy "quiz_attempts_update_own" on public.quiz_attempts
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.course_access ca
      where ca.user_id = (select auth.uid())
        and ca.course_id = quiz_attempts.course_id
        and ca.status = 'active'
    )
  );
