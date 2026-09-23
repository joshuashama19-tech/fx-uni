import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PricingSettingsRow } from "@/lib/types";

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
      maximumFractionDigits: majorUnits % 1 === 0 ? 0 : 2,
    }).format(majorUnits);
  } catch {
    // Intl.NumberFormat throws on an unrecognized ISO currency code.
    return `${currency} ${majorUnits.toLocaleString("en-NG")}`;
  }
}

/**
 * A promotion is only ever "active" when ALL of: the admin flag is on, a
 * valid offer price is configured (positive, strictly below the regular
 * price — never a "discount" that charges more), and the current time falls
 * inside the configured start/end window (an unset bound means "no limit on
 * that side", not "always active" — the admin flag still gates it).
 */
function isPromotionCurrentlyActive(row: PricingSettingsRow, now: Date): boolean {
  if (!row.promotion_active) return false;
  if (row.offer_price_minor_units == null || row.offer_price_minor_units <= 0) return false;
  if (row.offer_price_minor_units >= row.regular_price_minor_units) return false;
  if (row.promotion_starts_at && now < new Date(row.promotion_starts_at)) return false;
  if (row.promotion_ends_at && now > new Date(row.promotion_ends_at)) return false;
  return true;
}

/**
 * Resolves the current pricing/promotion state. `now` is only a parameter
 * for testability — every real call site uses the default (the server's
 * actual clock at request time), never a client-supplied time.
 */
export async function resolvePricing(now: Date = new Date()): Promise<PricingState> {
  const row = await getPricingSettings();
  const isPromoActive = isPromotionCurrentlyActive(row, now);
  const payableMinorUnits = isPromoActive ? row.offer_price_minor_units! : row.regular_price_minor_units;

  const discountPercent = isPromoActive
    ? Math.round(
        ((row.regular_price_minor_units - row.offer_price_minor_units!) / row.regular_price_minor_units) * 100
      )
    : null;
  const savingsMinorUnits = isPromoActive ? row.regular_price_minor_units - row.offer_price_minor_units! : null;

  return {
    regularPriceMinorUnits: row.regular_price_minor_units,
    offerPriceMinorUnits: row.offer_price_minor_units,
    currency: row.currency,
    isPromoActive,
    payableMinorUnits,
    discountPercent,
    savingsMinorUnits,
    promotionTitle: row.promotion_title,
    promotionSubtext: row.promotion_subtext,
    endsAt: isPromoActive ? row.promotion_ends_at : null,
    countdownEnabled: isPromoActive && row.countdown_enabled && Boolean(row.promotion_ends_at),
    regularPriceFormatted: formatMinorUnits(row.regular_price_minor_units, row.currency),
    offerPriceFormatted: isPromoActive ? formatMinorUnits(row.offer_price_minor_units!, row.currency) : null,
    payableFormatted: formatMinorUnits(payableMinorUnits, row.currency),
    savingsFormatted: isPromoActive ? formatMinorUnits(savingsMinorUnits!, row.currency) : null,
  };
}
