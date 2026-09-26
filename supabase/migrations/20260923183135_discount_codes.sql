-- =============================================================================
-- FX University — Admin discount codes
-- =============================================================================
-- Adds admin-controlled discount codes that can be applied at /get-started
-- checkout, plus an append-only ledger of successful redemptions, and the
-- two new order columns needed to record what a discounted order actually
-- charged versus its undiscounted base price.
--
-- Same security model as every other admin-editable table in this schema
-- (pricing_settings, testimonials, faqs — see 0005/0009): RLS is enabled on
-- both new tables, and there is NO select/insert/update/delete policy for
-- anon/authenticated at all. Unlike pricing_settings (public price info), a
-- discount code's existence and rules are not meant to be publicly
-- listable or enumerable, so even SELECT is service-role-only here — every
-- read and write goes through the service-role client (lib/supabase/admin.ts),
-- from either an admin-gated Server Action (lib/admin/discount-actions.ts)
-- or server-only checkout/validation code (lib/discounts.ts), never through
-- RLS policies for the authenticated role and never from the browser.
--
-- discount_code_redemptions.order_id is UNIQUE, which is what makes
-- apply_discount_redemption() below safe to call twice for the same order —
-- a retried Paystack webhook, or the webhook and the student's return to
-- /get-started/verify both reaching the "grant access" step for the same
-- payment (see lib/payments/access-activation.ts, which already relies on
-- this same kind of idempotency for course_access). The second call's
-- insert is a no-op and usage_count is only ever incremented once per order.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- discount_codes
-- ---------------------------------------------------------------------------
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (length(trim(code)) > 0),
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  -- percentage: whole percent, 1-100 (enforced below). fixed: minor units
  -- (kobo for NGN), matching orders.amount_minor_units and
  -- pricing_settings.*_minor_units — the app's established money convention.
  discount_value integer not null,
  max_uses integer check (max_uses is null or max_uses > 0),
  max_uses_per_customer integer default 1 check (max_uses_per_customer is null or max_uses_per_customer > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  constraint discount_codes_value_valid check (
    (discount_type = 'percentage' and discount_value > 0 and discount_value <= 100)
    or
    (discount_type = 'fixed' and discount_value > 0)
  ),
  constraint discount_codes_window_valid check (
    starts_at is null or ends_at is null or ends_at > starts_at
  )
);

comment on table public.discount_codes is
  'Admin-controlled discount codes applied at /get-started checkout. Every read and write goes through the service-role client — no RLS policy exists for anon/authenticated, so a code''s existence and rules are never directly queryable by a student, only validated by exact code match in lib/discounts.ts. usage_count is only ever incremented by apply_discount_redemption() after a confirmed successful payment, never when a code is merely applied/previewed at checkout.';
comment on column public.discount_codes.discount_value is
  'Percentage: whole percent (10 = 10%). Fixed: minor units (kobo), same convention as orders.amount_minor_units.';
comment on column public.discount_codes.max_uses is
  'Null = unlimited total redemptions.';
comment on column public.discount_codes.max_uses_per_customer is
  'Null = unlimited redemptions per customer. Defaults to 1 (one use per customer) — the common case.';

-- code is always stored normalized (trimmed, uppercased) regardless of how
-- it was entered, so the unique constraint and every lookup match on the
-- canonical form. Defense-in-depth alongside lib/discounts.ts's own
-- normalizeDiscountCode(), which normalizes before every query anyway.
create or replace function public.normalize_discount_code()
returns trigger
language plpgsql
as $$
begin
  new.code := upper(trim(new.code));
  return new;
end;
$$;

drop trigger if exists trg_discount_codes_normalize_code on public.discount_codes;
create trigger trg_discount_codes_normalize_code
  before insert or update on public.discount_codes
  for each row
  execute function public.normalize_discount_code();

drop trigger if exists trg_discount_codes_updated_at on public.discount_codes;
create trigger trg_discount_codes_updated_at
  before update on public.discount_codes
  for each row
  execute function public.set_updated_at();

create index if not exists discount_codes_active_idx on public.discount_codes (is_active);

alter table public.discount_codes enable row level security;
-- Intentionally no policies for anon/authenticated at all — see file header.

-- ---------------------------------------------------------------------------
-- discount_code_redemptions
-- ---------------------------------------------------------------------------
create table if not exists public.discount_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_code_id uuid not null references public.discount_codes (id),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- unique: one redemption per order. This is the idempotency guard — see
  -- apply_discount_redemption() below and the file header.
  order_id uuid not null unique references public.orders (id) on delete cascade,
  -- Denormalized copy of the code string at redemption time, kept even if
  -- the discount_codes row is later edited (or, when usage_count = 0 at
  -- delete time, removed) — see lib/admin/discount-actions.ts.
  code text not null,
  discount_amount integer not null check (discount_amount >= 0),
  created_at timestamptz not null default now()
);

comment on table public.discount_code_redemptions is
  'One row per order that successfully used a discount code — written only by apply_discount_redemption() after a payment is confirmed successful (lib/payments/access-activation.ts), never merely because a code was applied/previewed at checkout. order_id is UNIQUE, which is what makes crediting a redemption safe to attempt twice for the same order (a retried webhook, or both the webhook and the return-page verify path reaching the grant step).';

create index if not exists discount_code_redemptions_code_id_idx on public.discount_code_redemptions (discount_code_id);
create index if not exists discount_code_redemptions_user_code_idx on public.discount_code_redemptions (user_id, discount_code_id);

alter table public.discount_code_redemptions enable row level security;
-- Intentionally no policies for anon/authenticated at all — see file header.
-- Written only by apply_discount_redemption(), called only from server-only
-- payment-confirmation code using the service-role client.

-- ---------------------------------------------------------------------------
-- apply_discount_redemption — the one place usage_count is ever incremented
-- ---------------------------------------------------------------------------
-- Locks the discount_codes row for the duration of the call, so two
-- concurrent redemption attempts for the SAME code serialize against each
-- other (redemptions of different codes proceed independently). Returns
-- true if this call actually recorded a new redemption, false if this
-- order already had one (the idempotent no-op case).
--
-- Deliberately does NOT re-validate is_active/window/max_uses here: by the
-- time this is called, the order has already been created at a specific
-- discounted amount (lib/payments/checkout-action.ts re-validates the code
-- immediately before creating that order) and payment has already been
-- confirmed successful — re-checking eligibility now could only ever
-- refuse to log a redemption for a discount the customer legitimately
-- already received, which would just make usage_count under-count reality.
create or replace function public.apply_discount_redemption(
  p_discount_code_id uuid,
  p_user_id uuid,
  p_order_id uuid,
  p_code text,
  p_discount_amount integer
)
returns boolean
language plpgsql
as $$
declare
  v_row_count integer;
begin
  perform 1 from public.discount_codes where id = p_discount_code_id for update;

  insert into public.discount_code_redemptions (discount_code_id, user_id, order_id, code, discount_amount)
  values (p_discount_code_id, p_user_id, p_order_id, p_code, p_discount_amount)
  on conflict (order_id) do nothing;

  get diagnostics v_row_count = row_count;

  if v_row_count > 0 then
    update public.discount_codes set usage_count = usage_count + 1 where id = p_discount_code_id;
  end if;

  return v_row_count > 0;
end;
$$;

comment on function public.apply_discount_redemption is
  'Called only from lib/discounts.ts''s redeemDiscountCode(), only after a payment has been confirmed successful. Idempotent per order_id (see discount_code_redemptions.order_id''s unique constraint) — safe to call more than once for the same order.';

-- Same hardening as every other privileged function in this schema (see
-- 0002_harden_functions.sql / 0003_harden_functions_revoke_public.sql):
-- revoke from PUBLIC so anon/authenticated cannot invoke it directly via
-- PostgREST's /rest/v1/rpc/apply_discount_redemption, even though the only
-- real caller is the service-role client, which bypasses grants entirely.
revoke all on function public.apply_discount_redemption(uuid, uuid, uuid, text, integer) from public;

-- ---------------------------------------------------------------------------
-- orders — record base price vs. discount vs. final charged amount
-- ---------------------------------------------------------------------------
-- amount_minor_units keeps its exact existing meaning (the actual final
-- amount charged, what Paystack is told to charge, and what payment
-- verification in lib/payments/access-activation.ts compares against) —
-- completely unchanged. These new columns add the "how we got there"
-- context without touching that existing, already-correct invariant.
alter table public.orders
  add column if not exists discount_code_id uuid references public.discount_codes (id) on delete set null,
  add column if not exists discount_code text,
  add column if not exists discount_amount_minor_units integer not null default 0 check (discount_amount_minor_units >= 0),
  add column if not exists base_amount_minor_units integer;

-- Backfill: no discount system existed before this migration, so every
-- pre-existing order's base price is exactly what it charged.
update public.orders set base_amount_minor_units = amount_minor_units where base_amount_minor_units is null;

alter table public.orders alter column base_amount_minor_units set not null;
alter table public.orders add constraint orders_base_amount_minor_units_check check (base_amount_minor_units > 0);

comment on column public.orders.base_amount_minor_units is
  'The server-resolved course price (resolvePricing()) at checkout time, before any discount code. base_amount_minor_units - discount_amount_minor_units = amount_minor_units (the actual charged amount, unchanged in meaning).';
comment on column public.orders.discount_code is
  'Denormalized copy of the discount code applied at checkout (if any) — kept even if the discount_codes row is later edited or deleted, for an accurate historical order record.';

create index if not exists orders_discount_code_id_idx on public.orders (discount_code_id);
