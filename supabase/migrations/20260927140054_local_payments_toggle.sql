-- =============================================================================
-- FX University — Local Payments ON/OFF
-- =============================================================================
-- Extends the existing payment_settings table (0012_payment_provider_settings.sql,
-- widened for crypto in 0014_nowpayments.sql) with a third, independent axis:
-- whether the LOCAL rail (whichever of Paystack/Korapay active_provider
-- currently selects) is offered to students at checkout at all. This does not
-- replace or duplicate any existing setting:
--   - active_provider (this table) still only ever decides WHICH local
--     provider is used, and is completely untouched by this migration —
--     same column, same check constraint, same values.
--   - crypto_enabled/default_checkout_method (0014_nowpayments.sql) remain
--     the separate crypto axis, also completely untouched here.
--   - local_enabled (new) is a third, independent boolean: whether the local
--     rail is available at all in this environment, orthogonal to which
--     provider it resolves to when it is.
--
-- Defaults to TRUE, the opposite of crypto_enabled's default-false — local
-- payment has always been the guaranteed-available rail, so both existing
-- seeded rows ('production', 'preview') pick this column up with ZERO
-- behavior change: every checkout continues to see Local Payment exactly as
-- it does today, until an admin explicitly turns it off from
-- /admin/payment-provider. See lib/payments/provider.ts's
-- resolveCheckoutMethodSettings(), which reads this alongside crypto_enabled
-- and fails closed to TRUE (never false) on any error/missing row/
-- unrecognized environment — an outage must never accidentally take away the
-- one rail that's always worked, mirroring how crypto_enabled fails closed
-- to false so an outage never accidentally exposes/enables crypto.
--
-- Purely additive: one new boolean column, safe-defaulted. No existing row's
-- meaning changes, no destructive operation, no change to active_provider's
-- or crypto_enabled's/default_checkout_method's columns, constraints, or
-- values, no change to any other table.
-- =============================================================================

alter table public.payment_settings
  add column if not exists local_enabled boolean not null default true;

comment on column public.payment_settings.local_enabled is
  'Whether the local rail (whichever of Paystack/Korapay active_provider currently selects) is offered to students at checkout at all in this environment. Defaults to true — local payment has always been the guaranteed-available rail, so existing checkouts are completely unaffected until an admin turns this off from /admin/payment-provider. Independent of active_provider (which still only ever decides WHICH local provider is used when this is true) and of crypto_enabled/default_checkout_method (the separate crypto axis, 0014_nowpayments.sql). See lib/payments/provider.ts''s resolveCheckoutMethodSettings(), which fails closed to true (never false) on any error, so an outage never disables the one rail that has always worked. When this is false and crypto_enabled is also false for this environment, lib/payments/checkout-action.ts blocks checkout entirely rather than creating an order or calling any payment provider — see that file for the enforcement.';
