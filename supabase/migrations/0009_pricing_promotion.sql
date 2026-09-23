-- =============================================================================
-- FX University — Admin-controlled pricing + special enrollment promotion
-- =============================================================================
-- Adds a single-row settings table so the course price (and an optional,
-- time-boxed promotional offer price) can be changed by an admin without a
-- code/env-var deploy. This becomes the ONE source of truth for what a
-- student is charged: lib/pricing.ts's resolvePricing() reads this table and
-- the server's own clock to decide the current payable price, and that same
-- function drives both the landing-page display AND the actual Paystack
-- checkout amount (lib/payments/checkout-action.ts) — never two separate
-- numbers that could drift apart.
--
-- Same security model as every other admin-editable table in this schema
-- (see 0005_admin_cms.sql): RLS is enabled, anon/authenticated get a narrow
-- read-only SELECT policy (this is public marketing/pricing data — exactly
-- what's shown on the page), and there is NO insert/update/delete policy for
-- them at all. Every write goes through the service-role client from a
-- Server Action that calls requireAdmin() first (lib/admin/pricing-actions.ts).
-- =============================================================================

create table if not exists public.pricing_settings (
  -- Singleton row: always id = 1. Enforced by the primary key + check
  -- constraint, so there is exactly one settings row, ever.
  id smallint primary key default 1 check (id = 1),

  regular_price_minor_units integer not null check (regular_price_minor_units > 0),
  currency text not null default 'NGN',

  -- Null / not-set means "no promotion configured" — resolvePricing()
  -- requires a positive offer_price_minor_units strictly below the regular
  -- price before a promotion can ever be considered active, so a
  -- half-configured promotion can never accidentally charge more than the
  -- regular price.
  offer_price_minor_units integer check (offer_price_minor_units is null or offer_price_minor_units > 0),

  promotion_active boolean not null default false,
  promotion_title text not null default 'Special Enrollment Offer',
  promotion_subtext text,

  -- Both stored as UTC timestamps. Null start = active as soon as
  -- promotion_active is true; null end = no fixed end date (countdown
  -- simply won't render — see countdown_enabled). A real, admin-set pair of
  -- these is what makes the promotion a genuine time-boxed offer rather
  -- than fake/indefinite urgency.
  promotion_starts_at timestamptz,
  promotion_ends_at timestamptz,

  countdown_enabled boolean not null default true,

  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.pricing_settings is
  'Single-row (id=1) admin-controlled pricing + promotion configuration. The single source of truth for what a student is charged — read by lib/pricing.ts''s resolvePricing(), which both the landing page and the actual Paystack checkout amount are derived from. Writes go through the service-role client from an admin-gated Server Action (lib/admin/pricing-actions.ts), never through RLS policies for the authenticated role.';
comment on column public.pricing_settings.offer_price_minor_units is
  'Null = no promotion configured. Must be a positive amount strictly below regular_price_minor_units for a promotion to ever be considered active (enforced in application code in lib/pricing.ts, defense-in-depth alongside the check constraint here) — a promotion can never charge more than the regular price.';

alter table public.pricing_settings enable row level security;

create policy "pricing_settings_select_all"
  on public.pricing_settings for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policy for anon/authenticated — see file header.

create trigger pricing_settings_set_updated_at
  before update on public.pricing_settings
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed: the current intended pricing, from the "FX University — Final
-- Promotion + Social Proof Pass" brief. Fully editable afterward at
-- /admin/pricing — these are starting values, not hardcoded constants.
-- ---------------------------------------------------------------------------
insert into public.pricing_settings (
  id,
  regular_price_minor_units,
  currency,
  offer_price_minor_units,
  promotion_active,
  promotion_title,
  promotion_subtext,
  promotion_starts_at,
  promotion_ends_at,
  countdown_enabled
)
values (
  1,
  4300000,  -- ₦43,000
  'NGN',
  2990000,  -- ₦29,900 (30% off, save ₦13,100 — both computed, never hardcoded, at read time)
  true,
  'Special Enrollment Offer',
  'Once the offer ends, the course returns to its regular price.',
  now(),
  now() + interval '14 days',
  true
)
on conflict (id) do nothing;
