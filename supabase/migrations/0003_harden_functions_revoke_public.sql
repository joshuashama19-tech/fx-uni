-- =============================================================================
-- Follow-up to 0002_harden_functions.sql.
--
-- 0002 ran `revoke execute on function ... from anon, authenticated;` for
-- handle_new_user() and prevent_self_admin_grant(), intending to stop those
-- SECURITY DEFINER trigger functions from being directly callable via
-- PostgREST's /rest/v1/rpc/<function> by anon/authenticated clients.
--
-- Re-running Supabase's security advisor afterward showed the
-- anon_security_definer_function_executable /
-- authenticated_security_definer_function_executable findings unchanged.
-- Root cause: Postgres grants EXECUTE on a new function to the PUBLIC
-- pseudo-role by default, and anon/authenticated inherit EXECUTE through
-- that PUBLIC grant regardless of what is revoked from them by name —
-- revoking from the named roles alone is a no-op as long as PUBLIC still
-- has the grant. The actual fix is to revoke from PUBLIC itself.
--
-- Applied live to the "FX uni" project on 2026-09-20 as its own migration
-- (harden_functions_revoke_public); added here so the checked-in migration
-- history matches what is actually deployed.
-- =============================================================================

revoke all on function public.handle_new_user() from public;
revoke all on function public.prevent_self_admin_grant() from public;
