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
--   - orders.nowpayments_payment_id is deliberately left NULL by
--     lib/payments/checkout-action.ts when it creates the order (it only
--     ever knows the NOWPayments invoice's own id at that point, which is a
--     different identifier from a real payment id — see
--     lib/payments/nowpayments.ts's file header comment). It is written
--     exactly once, by lib/payments/nowpayments.ts's recordNowPaymentsReference(),
--     called from app/api/webhooks/nowpayments/route.ts using the
--     service-role/admin client (which already bypasses RLS) the first time
--     a signed IPN reports a real payment_id for this order — so no RPC or
--     SECURITY DEFINER function is needed for this write.
--
-- Purely additive: new nullable/safe-defaulted columns and two widened
-- CHECK constraints. No existing row's meaning changes, no destructive
-- operation, no change to payment_settings.active_provider's values or
-- constraint, no change to any other provider's behavior.
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
  'NOWPayments'' own payment id for this order''s crypto checkout. NULL from order creation (lib/payments/checkout-action.ts never writes the invoice''s own id here — that is a different identifier) until NOWPayments'' first signed IPN for this order reports a real payment_id, at which point lib/payments/nowpayments.ts''s recordNowPaymentsReference() (called from app/api/webhooks/nowpayments/route.ts) sets it. Null for every order that isn''t payment_provider = ''nowpayments'', and null here too until that IPN arrives. This is what lib/payments/nowpayments.ts''s verifyNowPaymentsPayment() looks up (by this order''s own paystack_reference) to know which NOWPayments payment to re-query — the internal order/reference stays the source of truth for matching, never this id in the other direction.';
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

-- Note: no RPC/SECURITY DEFINER function is defined here for writing
-- orders.nowpayments_payment_id. An earlier draft of this migration
-- included set_order_nowpayments_reference(), a SECURITY DEFINER function
-- for lib/payments/checkout-action.ts (running as the authenticated user)
-- to record the NOWPayments invoice's own id onto the order it had just
-- created, as a placeholder until the real payment_id arrived. That
-- placeholder architecture has been removed: checkout-action.ts no longer
-- writes anything onto nowpayments_payment_id at order-creation time (it
-- stays NULL, which lib/payments/nowpayments.ts's verifyNowPaymentsPayment()
-- already treats as a normal, non-terminal "waiting" state). The column is
-- written exactly once, by recordNowPaymentsReference() in
-- lib/payments/nowpayments.ts, called from
-- app/api/webhooks/nowpayments/route.ts using the service-role/admin client
-- — which already bypasses RLS — the first time a signed IPN reports a real
-- payment_id. No RPC is needed for that write, so none is defined.
