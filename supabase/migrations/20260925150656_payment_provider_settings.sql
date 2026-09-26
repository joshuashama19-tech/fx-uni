-- =============================================================================
-- FX University — Admin-controlled active payment provider (per environment)
-- =============================================================================
-- Replaces the temporary PAYMENT_PROVIDER env var (lib/payments/provider.ts)
-- with a real, admin-controlled setting.
--
-- ONE ROW PER DEPLOYMENT ENVIRONMENT, NOT A SINGLETON. Preview and
-- Production deployments of this app share this same Supabase database —
-- so a single global "active provider" row would mean switching the
-- provider for Preview testing would silently also switch it for
-- Production. This table has one row per environment ('production',
-- 'preview') specifically to prevent that: lib/payments/provider.ts's
-- resolvePaymentProvider() determines which environment the CURRENT server
-- is running as (from Vercel's own VERCEL_ENV, never from anything a
-- browser sends) and reads ONLY that environment's row. Changing Preview's
-- row can never affect Production's, and vice versa, because they are
-- different rows read by different servers.
--
-- Same RLS/access-control model as discount_codes (0010_discount_codes.sql)
-- and the original single-row design this replaces: RLS is enabled, and
-- there is NO select/insert/update/delete policy for anon/authenticated at
-- all — every read and write goes through the service-role client
-- (lib/supabase/admin.ts), from either resolvePaymentProvider()
-- (server-only, called before any checkout is initialized) or the admin
-- payment-provider page (requireAdmin()-gated,
-- lib/admin/payment-provider-actions.ts), never through RLS policies for
-- the authenticated role and never from the browser.
--
-- This table only ever decides which provider a NEW checkout uses. An
-- existing order's own orders.payment_provider column (added in
-- 0011_payment_provider.sql) — set once, at order-creation time, from
-- whatever this table resolved to right then — remains the sole source of
-- truth for which provider's verify API an already-created order is
-- checked against. Changing this setting later never touches existing
-- orders; see lib/payments/access-activation.ts, which reads the order's
-- own column and never re-derives it.
-- =============================================================================

create table if not exists public.payment_settings (
  environment text primary key check (environment in ('production', 'preview')),
  active_provider text not null default 'paystack' check (active_provider in ('paystack', 'korapay')),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.payment_settings is
  'One row per deployment environment (''production'', ''preview'') holding the admin-controlled active payment provider for NEW checkouts in that environment. Preview and Production share this database, so this per-environment split (not a singleton row) is what keeps a Preview provider switch from ever affecting Production. RLS is enabled with no policies for anon/authenticated at all — every read and write goes through the service-role client, either from resolvePaymentProvider() (lib/payments/provider.ts, server-only, fails closed to ''paystack'' if the current environment''s row is missing or unreadable) or from the admin payment-provider page (requireAdmin()-gated), which only ever writes the row for the environment the admin is currently viewing the app from. Changing one environment''s active_provider only affects checkouts initialized in that environment after the change — an existing order keeps the provider recorded on its own orders.payment_provider column at the time it was created (see 0011_payment_provider.sql).';
comment on column public.payment_settings.environment is
  'Which Vercel deployment environment this row governs. Determined server-side from process.env.VERCEL_ENV (see resolvePaymentEnvironment() in lib/payments/provider.ts) — never from client/browser input, and never selectable from a form field.';
comment on column public.payment_settings.active_provider is
  'Which payment provider lib/payments/provider.ts''s resolvePaymentProvider() hands new checkouts in this environment. ''paystack'' is the safe default (also the schema default and the in-app fallback on any read error) for every environment — Korapay is never the default for Production or Preview.';
comment on column public.payment_settings.updated_by is
  'The admin (profiles.id) who last changed this environment''s active provider, for an audit trail. Set from requireAdmin()''s returned user id in lib/admin/payment-provider-actions.ts.';

drop trigger if exists trg_payment_settings_updated_at on public.payment_settings;
create trigger trg_payment_settings_updated_at
  before update on public.payment_settings
  for each row
  execute function public.set_updated_at();

-- Seed both environments with the safe default so a fresh environment
-- already has an explicit 'paystack' row rather than relying solely on the
-- application-level fallback (defense in depth — resolvePaymentProvider()
-- still falls back to 'paystack' even if these inserts had never run or a
-- row were later deleted). Preview is seeded to 'paystack' too, NOT
-- 'korapay' — Korapay is only ever activated for Preview after an admin
-- explicitly switches it from /admin/payment-provider while viewing the
-- Preview deployment.
insert into public.payment_settings (environment, active_provider)
values
  ('production', 'paystack'),
  ('preview', 'paystack')
on conflict (environment) do nothing;

alter table public.payment_settings enable row level security;
-- Intentionally no policies for anon/authenticated at all — see file header.
-- Every read and write goes through the service-role client from
-- server-only code (resolvePaymentProvider(), or an admin action gated by
-- requireAdmin()), never through RLS policies for the authenticated role
-- and never from the browser.
