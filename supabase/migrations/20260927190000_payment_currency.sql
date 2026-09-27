-- =============================================================================
-- FX University — Admin-controlled payment currency (NGN / USD)
-- =============================================================================
-- Adds currency as a fourth, independent payment-settings axis alongside the
-- existing active_provider (0012_payment_provider_settings.sql), crypto_enabled
-- (0014_nowpayments.sql), and local_enabled
-- (20260927140054_local_payments_toggle.sql). Same per-environment,
-- service-role-only table (payment_settings) — changing Production's
-- active_currency can never affect Preview's, and vice versa, for the exact
-- same reason those other three settings are already split by environment.
--
-- Also extends pricing_settings with a SEPARATE, independently-configurable
-- USD price (usd_regular_price_minor_units / usd_offer_price_minor_units),
-- alongside its existing NGN price (regular_price_minor_units /
-- offer_price_minor_units / currency, which remains exactly as-is — the NGN
-- side of pricing is completely unchanged by this migration). Per Josh's
-- explicit instruction, USD is never DERIVED from the NGN price via an
-- exchange rate — it's its own admin-set amount, or NULL ("not configured
-- yet"). The existing promotion fields (promotion_active/title/subtext/
-- window/countdown_enabled) are shared by both currencies' offer prices —
-- one time-boxed campaign, expressed in whichever currency is active — kept
-- this way deliberately to avoid doubling the promotion schema for a
-- currency toggle Josh described as a single "Active Currency" switch, not
-- two independent promotions.
--
-- Which price a NEW checkout actually uses is decided by
-- lib/payments/provider.ts's resolveActiveCurrency() (reads THIS table, this
-- environment's row) feeding lib/pricing.ts's resolvePricing(currency) — see
-- those files for the full resolution logic. An order's own orders.currency/
-- amount_minor_units columns (already free-text/integer, already with no
-- update policy for authenticated — see 0001_init.sql) already capture
-- whichever currency/amount applied AT CHECKOUT TIME and are never rewritten
-- by a later admin currency change — no orders migration is needed for that
-- invariant, it already holds.
--
-- Purely additive: one new column with a safe default on payment_settings,
-- two new nullable columns on pricing_settings. No existing row's meaning
-- changes, no destructive operation, no change to any existing column's
-- constraint or values. Both existing payment_settings rows (production,
-- preview) pick up active_currency = 'NGN' automatically via the column
-- default — the Nigerian funnel keeps working exactly as it does today with
-- zero behavior change until an admin explicitly switches to USD.
--
-- Per Josh's instruction: migration 20260927140054_local_payments_toggle is
-- already applied remotely and is NOT touched by this file.
-- =============================================================================

alter table public.payment_settings
  add column if not exists active_currency text not null default 'NGN' check (active_currency in ('NGN', 'USD'));

comment on column public.payment_settings.active_currency is
  'Which currency NEW checkouts in this environment use — ''NGN'' or ''USD''. Read by lib/payments/provider.ts''s resolveActiveCurrency(), which fails closed to ''NGN'' on any error, missing row, or unrecognized environment (mirroring active_provider''s own fail-closed default) — an outage must never silently switch the Nigerian funnel to USD. Independent of active_provider/local_enabled/crypto_enabled/default_checkout_method: changing currency never changes any of those, and changing any of those never changes currency (see lib/admin/payment-provider-actions.ts, which writes each setting through its own narrowly-scoped upsert). Changing this only affects checkouts initialized after the change — an existing order keeps the currency/amount it was created with (orders.currency/amount_minor_units), exactly like an existing order keeps the provider it was created with.';

alter table public.pricing_settings
  add column if not exists usd_regular_price_minor_units integer
    check (usd_regular_price_minor_units is null or usd_regular_price_minor_units > 0),
  add column if not exists usd_offer_price_minor_units integer
    check (usd_offer_price_minor_units is null or usd_offer_price_minor_units > 0);

comment on column public.pricing_settings.usd_regular_price_minor_units is
  'The USD course price, in cents — a SEPARATE, independently admin-set amount from regular_price_minor_units (NGN), never derived from it via an exchange rate. NULL means "USD pricing not configured yet": lib/pricing.ts''s resolvePricing("USD") throws a clear error in that case rather than guessing or converting, which lib/payments/checkout-action.ts and app/get-started/page.tsx already handle by failing checkout safely (same fail-closed pattern as an unreadable pricing_settings row). Editable from /admin/pricing alongside the existing NGN fields.';
comment on column public.pricing_settings.usd_offer_price_minor_units is
  'Optional USD promotional offer price, in cents — the USD counterpart to offer_price_minor_units (NGN). NULL means no USD promotion configured. Shares this row''s single promotion_active/window/countdown_enabled campaign with the NGN offer price (one time-boxed campaign, expressed in whichever currency is active) — must be a positive amount strictly below usd_regular_price_minor_units to ever be considered active, enforced the same way the NGN pair already is (lib/pricing.ts, lib/admin/pricing-actions.ts, and the check constraint above).';
