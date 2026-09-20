-- =============================================================================
-- Performance hardening — addresses findings from Supabase's performance
-- advisor run after 0001_init.sql/0002_harden_functions.sql/
-- 0003_harden_functions_revoke_public.sql:
--
--   1. unindexed_foreign_keys: course_access.granted_by and
--      course_access.order_id had no covering index.
--   2. auth_rls_initplan: RLS policies calling auth.uid() directly get it
--      re-evaluated once per row; wrapping it as (select auth.uid()) lets
--      Postgres evaluate it once per query instead. Standard Supabase RLS
--      performance guidance.
--
-- (The third finding, "unused_index", is expected — every table is empty at
-- migration time, so Postgres hasn't had a chance to use them yet. Not
-- addressed here; the indexes are correct to keep.)
-- =============================================================================

create index if not exists course_access_granted_by_idx on public.course_access (granted_by);
create index if not exists course_access_order_id_idx on public.course_access (order_id);

alter policy "profiles_select_own"
  on public.profiles
  using (id = (select auth.uid()));

alter policy "profiles_update_own"
  on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

alter policy "orders_select_own"
  on public.orders
  using (user_id = (select auth.uid()));

alter policy "orders_insert_own_pending"
  on public.orders
  with check (user_id = (select auth.uid()) and status = 'pending');

alter policy "course_access_select_own"
  on public.course_access
  using (user_id = (select auth.uid()));
