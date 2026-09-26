-- =============================================================================
-- FX University — Test Mode
-- =============================================================================
-- Adds an isolated, server-enforced Test Mode so the full signup → checkout
-- → payment success/failure → course access flow can be exercised without
-- real money and without ever touching Production's own numbers.
--
-- Design summary (see the approved design for the full rationale):
--   - profiles.is_test marks an account as a test account. It is set exactly
--     once, at account-creation time, only by the service-role client (the
--     new admin-only "create test account" action) — never by a public
--     signup, never by the user themselves. The existing
--     prevent_self_admin_grant trigger (which already pins is_admin against
--     self-edits by the authenticated role) is extended to pin is_test the
--     same way, so this is enforced at the database layer, not just by
--     which code paths happen to call it.
--   - orders.is_test and course_access.is_test mark rows created through
--     that flow. Both are set server-side only, copied from the acting
--     user's own profiles.is_test at write time — never client input.
--   - orders.payment_provider gains a third value, 'test', alongside the
--     existing 'paystack'/'korapay'. A test order's payment_provider is
--     always 'test' — it is never routed through payment_settings/
--     resolvePaymentProvider() at all, so Production's and Preview's own
--     active-provider selection (0012_payment_provider_settings.sql) is
--     completely unaffected by this migration.
--   - test_payment_simulations is the test counterpart to what Korapay's/
--     Paystack's own hosted checkout + verify API provide for a real
--     payment: a durable, reference-keyed record of what a simulated
--     "charge" resolved to, written once (by the owning test user's own
--     simulate action, after that action re-verifies ownership) and read
--     back by the test provider adapter's verifyCharge()-shaped function —
--     never trusted from a query string or request body directly.
--   - payment_events.is_test lets test webhook/verification-equivalent
--     events be filtered out of that table's own reads without a join,
--     matching the other is_test columns.
--   - discount_code_redemptions.is_test, and apply_discount_redemption()
--     extended with a p_is_test parameter: a test account can still
--     validate and apply a real discount code end-to-end (its own
--     redemption row is still recorded, so its own max_uses_per_customer
--     limit is still enforced against itself), but discount_codes.usage_count
--     — the only aggregate figure the admin Discount Codes page displays —
--     is never incremented for one. A Test Mode transaction can never move
--     a real discount code's public usage/statistics.
--
-- Same security model as every other privileged table in this schema
-- (payment_settings, discount_codes, payment_events itself): RLS enabled,
-- no policies for anon/authenticated on test_payment_simulations — every
-- read and write goes through the service-role client, after its own
-- authorization check in application code. Everything here is purely
-- additive (new nullable-defaulted columns, a new table, a widened CHECK
-- constraint) — no existing row's meaning changes, and every pre-existing
-- order/course_access/payment_events row backfills to is_test = false,
-- which is exactly what it already was implicitly.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles.is_test
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_test boolean not null default false;

comment on column public.profiles.is_test is
  'True only for a dedicated test account created via the admin-only "create test account" action (lib/admin/test-mode-actions.ts), which sets this in the same service-role operation that creates the auth user — never after the fact, never by the user themselves, never by a public signup. Pinned against changes from the authenticated role by prevent_self_admin_grant() below, the same mechanism that already protects is_admin.';

-- Extends the existing self-grant guard (previously is_admin only) to also
-- pin is_test against the authenticated role. auth.role() is 'service_role'
-- for the admin client this app uses everywhere test-mode/admin writes
-- happen, so this trigger never blocks those — only a direct write attempt
-- from an authenticated user's own session.
create or replace function public.prevent_self_admin_grant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' then
    if new.is_admin is distinct from old.is_admin then
      new.is_admin := old.is_admin;
    end if;
    if new.is_test is distinct from old.is_test then
      new.is_test := old.is_test;
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- orders: is_test, and 'test' as a recognized payment_provider
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists is_test boolean not null default false;

comment on column public.orders.is_test is
  'True only for an order created by a test account (copied from profiles.is_test at checkout-initiation time in lib/payments/checkout-action.ts — never client input). Every normal Admin read (Dashboard counts, Orders list, Students lookups) filters this to false; test orders are visible only through /admin/test-mode.';

create index if not exists orders_is_test_idx on public.orders (is_test);

alter table public.orders drop constraint if exists orders_payment_provider_check;
alter table public.orders
  add constraint orders_payment_provider_check check (payment_provider in ('paystack', 'korapay', 'test'));

comment on column public.orders.payment_provider is
  'Which payment provider this order used — paystack, korapay, or test. ''test'' is set only for a test account''s order (is_test = true) and is never reachable through payment_settings/resolvePaymentProvider() — a test order''s provider is decided directly in checkout-action.ts from the acting user''s own profiles.is_test, before that resolution ever runs. lib/payments/access-activation.ts dispatches ''test'' to lib/payments/test-provider.ts, which makes no network call to Korapay or Paystack under any circumstance.';

-- Belt-and-suspenders: an order can never be both is_test = true and use a
-- real provider, or is_test = false while using the test provider. This is
-- already guaranteed by the application code (checkout-action.ts sets both
-- together, from the same is-test-user check), but making it a real
-- constraint means a future bug in that code fails loudly (an insert/update
-- error) instead of silently producing a test order that could reach a real
-- provider, or a real order that silently used the test provider.
alter table public.orders drop constraint if exists orders_test_provider_consistency;
alter table public.orders
  add constraint orders_test_provider_consistency check (
    (is_test = true and payment_provider = 'test')
    or
    (is_test = false and payment_provider in ('paystack', 'korapay'))
  );

-- ---------------------------------------------------------------------------
-- course_access.is_test
-- ---------------------------------------------------------------------------
alter table public.course_access
  add column if not exists is_test boolean not null default false;

comment on column public.course_access.is_test is
  'True only when this access was granted from a test order (set in lib/payments/access-activation.ts''s grantCourseAccess(), copied from the granting order''s own is_test — which that function additionally cross-checks against the user''s current profiles.is_test before granting at all, refusing on any mismatch). lib/access.ts''s checkCourseAccessInternal() independently re-checks this against the requesting user''s own profiles.is_test on every /learn request, so a course_access row can never authorize a user whose own is_test flag disagrees with it — this is what keeps a production user from ever being authorized by a test order, and a test user''s access from ever being silently treated as a real paid enrollment, enforced at the actual authorization boundary, not only at write time.';

create index if not exists course_access_is_test_idx on public.course_access (is_test);

-- ---------------------------------------------------------------------------
-- payment_events.is_test
-- ---------------------------------------------------------------------------
alter table public.payment_events
  add column if not exists is_test boolean not null default false;

comment on column public.payment_events.is_test is
  'Copied from the order this event is for, at the same insert that already happens in logPaymentEvent() (lib/payments/access-activation.ts) — lets this append-only log be filtered without a join, matching every other is_test column.';

create index if not exists payment_events_is_test_idx on public.payment_events (is_test);

-- ---------------------------------------------------------------------------
-- test_payment_simulations
-- ---------------------------------------------------------------------------
-- The test counterpart to Korapay's/Paystack's own hosted checkout +
-- server-side verify API. lib/payments/test-provider.ts's initializeCharge()
-- sends the student to an in-app page (app/get-started/test-checkout) instead
-- of an off-site hosted page; that page's own server action
-- (lib/payments/test-checkout-actions.ts) re-verifies the requesting
-- session owns the order AND that the order is actually is_test/
-- payment_provider='test'/still pending before writing a row here — the
-- same "never trust the trigger alone" posture the real webhook routes
-- already have toward their own payloads. verifyCharge() then reads this
-- row back, in the same {success, status, amountMinorUnits, currency}
-- shape verifyTransaction()/verifyCharge() (Korapay) already return, so
-- confirmSuccessfulPayment() in lib/payments/access-activation.ts needs
-- only one added dispatch branch to treat a test order exactly like a real
-- one from that point on.
create table if not exists public.test_payment_simulations (
  reference text primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  outcome text not null check (outcome in ('success', 'failed', 'cancelled')),
  amount_minor_units integer not null,
  currency text not null,
  simulated_at timestamptz not null default now(),
  simulated_by uuid not null references public.profiles (id) on delete cascade
);

comment on table public.test_payment_simulations is
  'One row per simulated test "charge" outcome, keyed by the order''s own reference. Written once, only by the service-role client, only after lib/payments/test-checkout-actions.ts has independently re-verified the acting session owns a pending, is_test, payment_provider=''test'' order for that reference. RLS is enabled with no policies for anon/authenticated at all — every read and write goes through the service-role client, exactly like payment_events and payment_settings.';
comment on column public.test_payment_simulations.outcome is
  'What the test account chose on the in-app simulated checkout page. ''success'' is the only outcome verifyCharge() (lib/payments/test-provider.ts) reports as success = true; ''failed''/''cancelled'' both report success = false, exactly mirroring a declined or abandoned real charge.';
comment on column public.test_payment_simulations.amount_minor_units is
  'Snapshot of the order''s own amount_minor_units/currency at simulation time, so verifyCharge() can return them without a second lookup — this is what confirmSuccessfulPayment() compares against the order''s recorded amount, same amount/currency match check a real payment goes through.';

create index if not exists test_payment_simulations_order_id_idx on public.test_payment_simulations (order_id);

alter table public.test_payment_simulations enable row level security;
-- Intentionally no policies for anon/authenticated — see table comment.

-- ---------------------------------------------------------------------------
-- Discount-code isolation: a Test Mode transaction must never move a real
-- discount code's public usage/statistics
-- ---------------------------------------------------------------------------
-- validateDiscountCode() (lib/discounts.ts) is read-only already, so a test
-- account previewing/applying a code at checkout needs no change at all —
-- nothing is mutated until a payment is confirmed successful. The one place
-- that ever writes is apply_discount_redemption() (0010_discount_codes.sql),
-- called from redeemDiscountCode() only after that point. This section
-- extends it, rather than restricting discount codes out of Test Mode
-- entirely: a test account CAN still exercise the discount-code path
-- end-to-end (own redemption row, own max_uses_per_customer check still
-- enforced against itself), but discount_codes.usage_count — the only
-- aggregate figure app/admin/discount-codes/page.tsx ever displays — is
-- never incremented for one, so it can never move what an admin sees as a
-- code's real usage or push it into "Used up".
alter table public.discount_code_redemptions
  add column if not exists is_test boolean not null default false;

comment on column public.discount_code_redemptions.is_test is
  'Copied from the order this redemption is for (lib/payments/access-activation.ts, via redeemDiscountCode() in lib/discounts.ts). A test redemption is still recorded here — so a test account''s own max_uses_per_customer limit is still enforced against its own prior test redemptions — but apply_discount_redemption() below never increments discount_codes.usage_count for one, so it can never be mistaken for, or count toward, a real customer''s usage of the code.';

-- The 5-argument overload below is a distinct signature from the original
-- 4-argument function created in 0010_discount_codes.sql (Postgres
-- overloads on argument types, so `create or replace` with an added
-- parameter would otherwise leave BOTH versions callable) — drop the old
-- one explicitly so there is only ever one apply_discount_redemption() to
-- reason about, matching this file's own comment on
-- prevent_self_admin_grant() doing the equivalent thing for is_admin/is_test.
drop function if exists public.apply_discount_redemption(uuid, uuid, uuid, text, integer);

create or replace function public.apply_discount_redemption(
  p_discount_code_id uuid,
  p_user_id uuid,
  p_order_id uuid,
  p_code text,
  p_discount_amount integer,
  p_is_test boolean default false
)
returns boolean
language plpgsql
as $$
declare
  v_row_count integer;
begin
  perform 1 from public.discount_codes where id = p_discount_code_id for update;

  insert into public.discount_code_redemptions (discount_code_id, user_id, order_id, code, discount_amount, is_test)
  values (p_discount_code_id, p_user_id, p_order_id, p_code, p_discount_amount, p_is_test)
  on conflict (order_id) do nothing;

  get diagnostics v_row_count = row_count;

  -- The strict Test Mode requirement this exists to satisfy: a Test Mode
  -- transaction must not increment or otherwise mutate production
  -- discount-code usage/statistics. usage_count is that statistic, so this
  -- is the one gate that actually matters.
  if v_row_count > 0 and not p_is_test then
    update public.discount_codes set usage_count = usage_count + 1 where id = p_discount_code_id;
  end if;

  return v_row_count > 0;
end;
$$;

comment on function public.apply_discount_redemption is
  'Called only from lib/discounts.ts''s redeemDiscountCode(), only after a payment has been confirmed successful. Idempotent per order_id (see discount_code_redemptions.order_id''s unique constraint). usage_count is incremented only when p_is_test is false: a Test Mode transaction can still validate and apply a discount code, and its own redemption is still recorded (for that same test account''s own max_uses_per_customer check), but it can never move a real discount code''s public usage_count or "Used up" status — see supabase/migrations/0013_test_mode.sql''s own header for the full Test Mode design.';

revoke all on function public.apply_discount_redemption(uuid, uuid, uuid, text, integer, boolean) from public;
