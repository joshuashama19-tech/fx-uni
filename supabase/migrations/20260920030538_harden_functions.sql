-- =============================================================================
-- Security hardening — addresses findings from Supabase's advisor lints run
-- immediately after 0001_init.sql:
--
--   1. function_search_path_mutable: set_updated_at() had no fixed
--      search_path (its sibling trigger functions already did).
--   2. anon_security_definer_function_executable /
--      authenticated_security_definer_function_executable: handle_new_user()
--      and prevent_self_admin_grant() are SECURITY DEFINER trigger
--      functions — they should only ever run as triggers (where `new`/`old`
--      are defined), never be directly callable via PostgREST's
--      /rest/v1/rpc/<function> by anon/authenticated clients. Revoking
--      EXECUTE closes that off explicitly rather than relying on the call
--      simply erroring outside a trigger context.
--
-- (The third finding, "payment_events has RLS enabled but no policies", is
-- intentional — see the comment on that table in 0001_init.sql — and is not
-- addressed here.)
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.prevent_self_admin_grant() from anon, authenticated;
