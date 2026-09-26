-- =============================================================================
-- FX University — payment_provider on orders (Korapay as a second provider)
-- =============================================================================
-- Adds the one column needed for an order to record which payment
-- provider's API was used to initialize/verify it. This is purely a
-- record-keeping column: it does not change how amount_minor_units,
-- currency, base_amount_minor_units, discount_* or any other existing
-- orders column behaves, and no RLS policy needs to change (orders already
-- has no update policy for authenticated/anon — see 0001_init.sql and
-- 0010_discount_codes.sql).
--
-- Every order that existed before this migration was necessarily a
-- Paystack order (Korapay didn't exist as an option yet), so the backfill
-- below is unconditionally correct, not a guess.
-- =============================================================================

alter table public.orders
  add column if not exists payment_provider text;

update public.orders set payment_provider = 'paystack' where payment_provider is null;

alter table public.orders alter column payment_provider set not null;
alter table public.orders alter column payment_provider set default 'paystack';

alter table public.orders
  add constraint orders_payment_provider_check check (payment_provider in ('paystack', 'korapay'));

comment on column public.orders.payment_provider is
  'Which payment provider''s API was used for this order — paystack or korapay. Set once at checkout time (lib/payments/checkout-action.ts, via lib/payments/provider.ts''s resolvePaymentProvider()) and read by lib/payments/access-activation.ts to decide which provider''s verify API to re-check the order against. Backfilled to paystack for every pre-existing order.';

create index if not exists orders_payment_provider_idx on public.orders (payment_provider);
