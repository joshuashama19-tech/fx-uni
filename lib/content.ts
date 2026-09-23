import "server-only";
import { createClient } from "@/lib/supabase/server";

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

// The displayed price used to be derived here from env vars — it's now
// admin-controlled, database-driven pricing. See lib/pricing.ts's
// resolvePricing(), which is the single source of truth PricingSection,
// PricingCard, app/get-started/page.tsx, and the actual Paystack checkout
// amount (lib/payments/checkout-action.ts) all read from directly — kept
// deliberately out of this file so there's exactly one place ("the price")
// rather than two systems that could drift apart.
