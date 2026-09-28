import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Currency, PricingSettingsRow } from "@/lib/types";

// -----------------------------------------------------------------------
// THE single source of truth for what a student pays right now.
//
// lib/payments/checkout-action.ts (the actual Paystack charge) and every
// display surface (PricingSection, PricingCard, the get-started page) all
// call resolvePricing() and use its numbers directly — never a separately
// computed or client-supplied amount. That's what makes
//   displayed price == checkout price == Paystack charge amount
// an actual invariant instead of a convention two different code paths
// could drift out of. The browser is never trusted for the payable amount:
// resolvePricing() always re-derives it server-side from the database and
// the server's own clock (see supabase/migrations/0009_pricing_promotion.sql).
// -----------------------------------------------------------------------

// PricingSettingsRow itself lives in lib/types.ts — the single place every
// hand-written table row type is defined (OrderRow, TestimonialRow, etc.) —
// rather than being redefined here.

// Fail-closed fallback if the pricing_settings row can't be read (DB error,
// row somehow missing). Regular price only, no promotion — an outage should
// never accidentally apply a discount nobody configured. This mirrors the
// same fail-closed philosophy as getSiteContent() in lib/content.ts, and
// matches the amount the 0009 migration seeds pricing_settings with.
const FALLBACK_SETTINGS: PricingSettingsRow = {
  id: 1,
  regular_price_minor_units: 4_300_000,
  currency: "NGN",
  offer_price_minor_units: null,
  promotion_active: false,
  promotion_title: "Special Enrollment Offer",
  promotion_subtext: null,
  promotion_starts_at: null,
  promotion_ends_at: null,
  countdown_enabled: true,
  updated_at: new Date(0).toISOString(),
  updated_by: null,
  // Added alongside supabase/migrations/20260927190000_payment_currency.sql.
  // Null here too — an unreadable row must fail USD resolution closed
  // exactly like a genuinely unconfigured USD price does (see
  // resolvePricing() below), never fall back to some guessed amount.
  usd_regular_price_minor_units: null,
  usd_offer_price_minor_units: null,
};

export async function getPricingSettings(): Promise<PricingSettingsRow> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("pricing_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return FALLBACK_SETTINGS;
    return data as PricingSettingsRow;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export interface PricingState {
  regularPriceMinorUnits: number;
  offerPriceMinorUnits: number | null;
  currency: string;
  /** Whether the promotion is configured AND currently within its window, right now. */
  isPromoActive: boolean;
  /** The amount that will actually be charged if checkout starts right now. */
  payableMinorUnits: number;
  discountPercent: number | null;
  savingsMinorUnits: number | null;
  promotionTitle: string;
  promotionSubtext: string | null;
  /** Only set when the promotion is active AND has a real end date. */
  endsAt: string | null;
  /** Only true when the promotion is active, has an end date, and the admin left the countdown on. */
  countdownEnabled: boolean;
  regularPriceFormatted: string;
  offerPriceFormatted: string | null;
  payableFormatted: string;
  savingsFormatted: string | null;
}

export function formatMinorUnits(minorUnits: number, currency: string): string {
  const majorUnits = minorUnits / 100;
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      // "en-NG"'s default currencyDisplay ("symbol") renders USD as the
      // disambiguated "US$" — CLDR's usual treatment for a dollar currency
      // that isn't the locale's own (the same reason en-US shows CAD as
      // "CA$"). NGN is unaffected either way since ₦ has no such alternate
      // form. "narrowSymbol" is the standard Intl option for exactly this:
      // it drops the disambiguating prefix and renders the bare symbol
      // ("$30"/"$65") — display only, does not touch the numeric amount,
      // the currency code stored/resolved anywhere, or NGN's own "₦"
      // formatting (verified: NGN output is byte-identical either way).
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: majorUnits % 1 === 0 ? 0 : 2,
    }).format(majorUnits);
  } catch {
    // Intl.NumberFormat throws on an unrecognized ISO currency code.
    return `${currency} ${majorUnits.toLocaleString("en-NG")}`;
  }
}

/**
 * A promotion is only ever "active" when ALL of: the admin flag is on, a
 * valid offer price is configured for THIS currency (positive, strictly
 * below the regular price for this same currency — never a "discount" that
 * charges more), and the current time falls inside the configured
 * start/end window (an unset bound means "no limit on that side", not
 * "always active" — the admin flag still gates it). The promotion
 * on/off flag and window are shared across both currencies (one time-boxed
 * campaign — see supabase/migrations/20260927190000_payment_currency.sql's
 * file header); only the regular/offer AMOUNTS are currency-specific.
 */
function isPromotionCurrentlyActive(
  regularPriceMinorUnits: number,
  offerPriceMinorUnits: number | null,
  row: Pick<PricingSettingsRow, "promotion_active" | "promotion_starts_at" | "promotion_ends_at">,
  now: Date
): boolean {
  if (!row.promotion_active) return false;
  if (offerPriceMinorUnits == null || offerPriceMinorUnits <= 0) return false;
  if (offerPriceMinorUnits >= regularPriceMinorUnits) return false;
  if (row.promotion_starts_at && now < new Date(row.promotion_starts_at)) return false;
  if (row.promotion_ends_at && now > new Date(row.promotion_ends_at)) return false;
  return true;
}

/**
 * Resolves the current pricing/promotion state for `currency`. Defaults to
 * 'NGN' — every existing call site that doesn't pass a currency (the public
 * landing page's PricingSection, the admin pricing page's "Right now"
 * summary) keeps behaving exactly as it did before this function became
 * currency-aware, since NGN was the only currency that ever existed until
 * now. `now` is only a parameter for testability — every real call site
 * uses the default (the server's actual clock at request time), never a
 * client-supplied time.
 *
 * When `currency` is 'USD' and no USD regular price has been configured
 * (usd_regular_price_minor_units is null — see
 * supabase/migrations/20260927190000_payment_currency.sql), this THROWS
 * rather than silently converting the NGN price or falling back to it —
 * Josh's explicit instruction was that USD must be independently
 * configurable, never derived from an exchange rate, and a misconfigured
 * "active currency = USD but no USD price set" admin state must fail
 * checkout closed rather than charge something nobody actually configured.
 * Every real call site (lib/payments/checkout-action.ts,
 * app/get-started/page.tsx) already wraps its resolvePricing() call in a
 * try/catch that redirects/renders safely on any thrown error — this reuses
 * that exact same existing fail-closed path rather than adding a new one.
 */
export async function resolvePricing(currency: Currency = "NGN", now: Date = new Date()): Promise<PricingState> {
  const row = await getPricingSettings();

  const regularPriceMinorUnits = currency === "USD" ? row.usd_regular_price_minor_units : row.regular_price_minor_units;
  const offerPriceMinorUnits = currency === "USD" ? row.usd_offer_price_minor_units : row.offer_price_minor_units;

  if (regularPriceMinorUnits == null) {
    // Only reachable for currency === "USD" — the NGN column is NOT NULL at
    // the database level, so regularPriceMinorUnits can never be null when
    // currency is "NGN" (barring getPricingSettings()'s own FALLBACK_SETTINGS,
    // which always sets a real NGN amount too).
    throw new Error(
      `resolvePricing: no ${currency} price has been configured yet (pricing_settings.${
        currency === "USD" ? "usd_regular_price_minor_units" : "regular_price_minor_units"
      } is null). Set it from /admin/pricing before checkout can use ${currency}.`
    );
  }

  const isPromoActive = isPromotionCurrentlyActive(regularPriceMinorUnits, offerPriceMinorUnits, row, now);
  const payableMinorUnits = isPromoActive ? offerPriceMinorUnits! : regularPriceMinorUnits;

  const discountPercent = isPromoActive
    ? Math.round(((regularPriceMinorUnits - offerPriceMinorUnits!) / regularPriceMinorUnits) * 100)
    : null;
  const savingsMinorUnits = isPromoActive ? regularPriceMinorUnits - offerPriceMinorUnits! : null;

  return {
    regularPriceMinorUnits,
    offerPriceMinorUnits,
    currency,
    isPromoActive,
    payableMinorUnits,
    discountPercent,
    savingsMinorUnits,
    promotionTitle: row.promotion_title,
    promotionSubtext: row.promotion_subtext,
    endsAt: isPromoActive ? row.promotion_ends_at : null,
    countdownEnabled: isPromoActive && row.countdown_enabled && Boolean(row.promotion_ends_at),
    regularPriceFormatted: formatMinorUnits(regularPriceMinorUnits, currency),
    offerPriceFormatted: isPromoActive ? formatMinorUnits(offerPriceMinorUnits!, currency) : null,
    payableFormatted: formatMinorUnits(payableMinorUnits, currency),
    savingsFormatted: isPromoActive ? formatMinorUnits(savingsMinorUnits!, currency) : null,
  };
}
