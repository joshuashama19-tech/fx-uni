import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCoursePricing } from "@/lib/payments/access-activation";

/**
 * Admin-editable marketing copy (supabase/migrations/0005_admin_cms.sql,
 * table site_content). A deliberately small, fixed set of keys — NOT a
 * general "every string on the page is a database row" system. Each key
 * has a hardcoded fallback (the copy that shipped before this table
 * existed) so a missing row, a typo'd key, or a database error never
 * blanks out part of the page — it just silently falls back to the
 * original copy.
 *
 * To add a new editable field: add its key + fallback here, read it with
 * getSiteContent() wherever it's rendered, and add a row for it in
 * /admin/content. Do not wire up a new key for content that changes
 * rarely and isn't worth an admin round-trip — most of the page is meant
 * to stay in code (see the file header of TestimonialsSection.tsx/
 * FAQSection.tsx for the two exceptions that DO get a full CRUD system).
 */
export const SITE_CONTENT_DEFAULTS = {
  final_cta_headline: "Start learning Forex the structured way.",
  final_cta_subheadline:
    "Understand the market, build real skills, and develop a disciplined approach — one module at a time.",
  final_cta_button_label: "Get Course Access",
  pricing_billing_note: "One-time payment",
} as const;

export type SiteContentKey = keyof typeof SITE_CONTENT_DEFAULTS;

/**
 * Reads every site_content row in one query and returns the fixed key set
 * above with each value replaced by its DB override, if one exists.
 * Fails closed to the hardcoded defaults on any error (never lets a
 * database hiccup take copy off the page).
 */
export async function getSiteContent(): Promise<Record<SiteContentKey, string>> {
  const result: Record<SiteContentKey, string> = { ...SITE_CONTENT_DEFAULTS };

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_content").select("key, value");
    for (const row of data ?? []) {
      if (row.key in SITE_CONTENT_DEFAULTS) {
        result[row.key as SiteContentKey] = row.value;
      }
    }
  } catch {
    // Fall back to defaults — see function comment.
  }

  return result;
}

/**
 * The single source of truth for the price shown to visitors is the same
 * env vars that gate what Paystack actually charges and what server-side
 * verification checks against (lib/payments/access-activation.ts). This is
 * deliberate: the marketing page's displayed price and the actual charged
 * price must never be able to drift apart, which is exactly what could
 * happen if the display price were a separately-editable CMS field. If you
 * need to change the price, change COURSE_PRICE_MINOR_UNITS /
 * COURSE_PRICE_CURRENCY in Vercel's environment variables — everywhere
 * that shows a price (this function, and the checkout itself) picks it up
 * automatically, and it affects new checkouts only (see
 * getCoursePricing()'s own comment).
 */
export function getDisplayPrice(): { formatted: string; currency: string | null; amountMajorUnits: number | null } {
  let amountMinorUnits: number;
  let currency: string;
  try {
    ({ amountMinorUnits, currency } = getCoursePricing());
  } catch {
    // getCoursePricing() throws if COURSE_PRICE_MINOR_UNITS /
    // COURSE_PRICE_CURRENCY aren't set — which would already mean checkout
    // itself is broken, so this should never happen in a correctly
    // configured production deployment. But the public marketing page must
    // never crash over it (unlike checkout, a thrown error here has no
    // error boundary of its own), so this fails closed to the same
    // "confirmed at checkout" placeholder app/get-started/page.tsx already
    // falls back to when it can't compute a price.
    return { formatted: "Confirmed at checkout", currency: null, amountMajorUnits: null };
  }

  const amountMajorUnits = amountMinorUnits / 100;

  let formatted: string;
  try {
    formatted = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: amountMajorUnits % 1 === 0 ? 0 : 2,
    }).format(amountMajorUnits);
  } catch {
    // Intl.NumberFormat throws on an unrecognized ISO currency code —
    // fall back to a plain "<CODE> <amount>" rather than letting the
    // whole page fail to render over a formatting nicety.
    formatted = `${currency} ${amountMajorUnits.toLocaleString("en-NG")}`;
  }

  return { formatted, currency, amountMajorUnits };
}
