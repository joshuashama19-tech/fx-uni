-- =============================================================================
-- FX University — NOWPayments crypto checkout
-- =============================================================================
-- Adds a second, parallel payment rail — crypto payment via NOWPayments —
-- alongside the existing local rail (whichever of Paystack/Korapay
-- payment_settings.active_provider currently selects; see
-- 0012_payment_provider_settings.sql). Crypto is a genuinely separate axis
-- from that setting, not a third value inside it: the admin keeps the
-- existing local-provider switch exactly as-is, and separately controls
-- whether crypto is offered at all (crypto_enabled) and which method is
-- preselected for the student (default_checkout_method). See
-- lib/payments/provider.ts's resolveCheckoutMethodSettings() and
-- lib/payments/checkout-action.ts for how these two independent settings
-- combine, and lib/payments/nowpayments.ts for the provider adapter itself.
--
-- Design summary:
--   - orders.payment_provider gains a fourth value, 'nowpayments', alongside
--     the existing 'paystack'/'korapay'/'test'. A test account's order is,
--     and remains, always 'test' — orders_test_provider_consistency below is
--     widened only on its non-test branch, so a test account can still never
--     reach 'nowpayments' (or any real provider), exactly as it can never
--     reach 'paystack'/'korapay' today.
--   - orders.nowpayments_payment_id/pay_currency record NOWPayments' own
--     payment id (used to re-query its status) and the crypto asset actually
--     used. Both nullable — irrelevant for every other provider's orders.
--   - payment_settings.crypto_enabled/default_checkout_method are the new,
--     separate axis described above. Both default to the safe "crypto off,
--     local by default" state, so the two existing seeded rows
--     (production, preview) pick this up with zero behavior change until an
--     admin explicitly opts in from /admin/payment-provider.
--     payment_settings.active_provider's own check constraint is untouched.
--   - set_order_nowpayments_reference() is a narrowly-scoped SECURITY
--     DEFINER RPC that lets lib/payments/checkout-action.ts (which runs as
--     the authenticated user, deliberately never the service-role client —
--     see that file's own header comment) record the NOWPayments payment id
--     onto the order it just created. This exists because orders has no
--     RLS UPDATE policy for the authenticated role at all (only
--     orders_select_own and orders_insert_own_pending — see
--     0001_init.sql/0004_performance_hardening.sql), so a direct table
--     update from that action would simply do nothing. The function is
--     scoped tight enough that it can never touch any row other than the
--     caller's own, freshly-created, still-pending, nowpayments order.
--
-- Purely additive: new nullable/safe-defaulted columns, one new function,
-- two widened CHECK constraints. No existing row's meaning changes, no
-- destructive operation, no change to payment_settings.active_provider's
-- values or constraint, no change to any other provider's behavior.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- orders: 'nowpayments' as a recognized payment_provider, plus its own
-- reference columns
-- ---------------------------------------------------------------------------
alter table public.orders drop constraint if exists orders_payment_provider_check;
alter table public.orders
  add constraint orders_payment_provider_check check (payment_provider in ('paystack', 'korapay', 'test', 'nowpayments'));

comment on column public.orders.payment_provider is
  'Which payment provider this order used — paystack, korapay, test, or nowpayments. ''test'' is set only for a test account''s order and is never reachable through payment_settings/resolvePaymentProvider() (see 0013_test_mode.sql). ''nowpayments'' is set only when the student chose Crypto Payment at checkout while payment_settings.crypto_enabled was true for this environment (lib/payments/checkout-action.ts) — a test account can never reach it, enforced both in application code and by orders_test_provider_consistency below.';

-- Belt-and-suspenders, widened from 0013_test_mode.sql's version: a test
-- order must still never use a real provider (including the new one), and a
-- real order must still never use the test provider.
alter table public.orders drop constraint if exists orders_test_provider_consistency;
alter table public.orders
  add constraint orders_test_provider_consistency check (
    (is_test = true and payment_provider = 'test')
    or
    (is_test = false and payment_provider in ('paystack', 'korapay', 'nowpayments'))
  );

alter table public.orders
  add column if not exists nowpayments_payment_id text,
  add column if not exists pay_currency text;

comment on column public.orders.nowpayments_payment_id is
  'NOWPayments'' own payment id for this order''s crypto checkout, set once by set_order_nowpayments_reference() right after lib/payments/nowpayments.ts''s initializePayment() creates the hosted invoice. Null for every order that isn''t payment_provider = ''nowpayments''. This is what lib/payments/nowpayments.ts''s verifyNowPaymentsPayment() looks up (by this order''s own paystack_reference) to know which NOWPayments payment to re-query — the internal order/reference stays the source of truth for matching, never this id in the other direction.';
comment on column public.orders.pay_currency is
  'The crypto asset actually used for this order''s NOWPayments checkout (e.g. ''usdttrc20''), recorded for support/audit/receipt display only. Null for every other provider, and null here too until NOWPayments reports it (the coin choice happens on NOWPayments'' own hosted invoice page, not in this app — see lib/payments/nowpayments.ts).';

create index if not exists orders_nowpayments_payment_id_idx on public.orders (nowpayments_payment_id);

-- ---------------------------------------------------------------------------
-- payment_settings: crypto as a separate axis from active_provider
-- ---------------------------------------------------------------------------
alter table public.payment_settings
  add column if not exists crypto_enabled boolean not null default false,
  add column if not exists default_checkout_method text not null default 'local'
    check (default_checkout_method in ('local', 'crypto'));

comment on column public.payment_settings.crypto_enabled is
  'Whether Crypto Payment (NOWPayments) is offered at all to students checking out in this environment. Defaults to false, so existing checkouts are completely unaffected until an admin turns this on from /admin/payment-provider. Independent of active_provider, which continues to control only the local Paystack/Korapay rail.';
comment on column public.payment_settings.default_checkout_method is
  '''local'' or ''crypto'' — which payment-method card is preselected on /get-started. Resolved together with crypto_enabled by lib/payments/provider.ts''s resolveCheckoutMethodSettings(): if this is ''crypto'' but crypto_enabled is false, the EFFECTIVE default silently falls back to ''local'' — a broken/disabled crypto option is never preselected or shown. Defaults to ''local''.';

-- ---------------------------------------------------------------------------
-- set_order_nowpayments_reference(): the one way checkout-action.ts (running
-- as the authenticated user, never the admin client) can record NOWPayments'
-- payment id onto the order it just created — see this file's own header
-- comment for why a direct table UPDATE from that action isn't possible at
-- all today. SECURITY DEFINER so it runs with the function owner's
-- privileges (bypassing the missing UPDATE policy on orders), but scoped by
-- its own WHERE clause — not by RLS — to exactly one row: the row matching
-- BOTH the given order id AND auth.uid() AND status = 'pending' AND
-- payment_provider = 'nowpayments'. A caller can never use this to touch any
-- order other than their own freshly-created, still-pending, nowpayments
-- order, regardless of what p_order_id is set to.
-- ---------------------------------------------------------------------------
create or replace function public.set_order_nowpayments_reference(
  p_order_id uuid,
  p_payment_id text,
  p_pay_currency text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row_count integer;
begin
  update public.orders
  set nowpayments_payment_id = p_payment_id,
      pay_currency = p_pay_currency
  where id = p_order_id
    and user_id = auth.uid()
    and status = 'pending'
    and payment_provider = 'nowpayments';

  get diagnostics v_row_count = row_count;
  return v_row_count > 0;
end;
$$;

comment on function public.set_order_nowpayments_reference is
  'Called once, from lib/payments/checkout-action.ts, immediately after initializePayment() creates the NOWPayments hosted invoice for a new order. See this file''s own header comment for why this RPC exists instead of a direct table UPDATE. Returns false (writing nothing) if p_order_id does not match a pending, nowpayments order owned by the calling user — never throws, so a caller can''t learn anything about another user''s orders from the response shape.';

revoke all on function public.set_order_nowpayments_reference(uuid, text, text) from public;
grant execute on function public.set_order_nowpayments_reference(uuid, text, text) to authenticated;
