"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";

// Same pattern as lib/admin/content-actions.ts: the only writer for
// pricing_settings, calls requireAdmin() first, and goes through the
// service-role client — there is no RLS write policy for this table at all
// (see supabase/migrations/0009_pricing_promotion.sql).

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

/** Parses a plain "43000" / "43,000" / "43000.50" Naira amount into minor units (kobo). */
function majorAmountToMinorUnits(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

/** A `datetime-local` input value ("YYYY-MM-DDTHH:mm"), treated as UTC — see the admin form's "(UTC)" labels. */
function parseUtcDatetimeLocal(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const iso = trimmed.length === 16 ? `${trimmed}:00Z` : `${trimmed}Z`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function updatePricingSettingsAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const regularMinorUnits = majorAmountToMinorUnits(String(formData.get("regular_price") || ""));
  if (regularMinorUnits == null) return; // regular price is required — refuse to save an invalid value

  const offerRaw = String(formData.get("offer_price") || "").trim();
  const offerMinorUnits = offerRaw ? majorAmountToMinorUnits(offerRaw) : null;
  // An offer price must be a valid, positive amount strictly below the
  // regular price — never save a "discount" that would charge the same or
  // more than the regular price (defense-in-depth alongside the DB check
  // constraint and lib/pricing.ts's own runtime check).
  if (offerRaw && (offerMinorUnits == null || offerMinorUnits >= regularMinorUnits)) return;

  const promotion_active = checkbox(formData, "promotion_active");
  const promotion_title = String(formData.get("promotion_title") || "").trim() || "Special Enrollment Offer";
  const promotion_subtext = String(formData.get("promotion_subtext") || "").trim() || null;
  const promotion_starts_at = parseUtcDatetimeLocal(String(formData.get("promotion_starts_at") || ""));
  const promotion_ends_at = parseUtcDatetimeLocal(String(formData.get("promotion_ends_at") || ""));
  const countdown_enabled = checkbox(formData, "countdown_enabled");

  const db = createAdminClient();
  await db.from("pricing_settings").upsert(
    {
      id: 1,
      regular_price_minor_units: regularMinorUnits,
      offer_price_minor_units: offerMinorUnits,
      promotion_active,
      promotion_title,
      promotion_subtext,
      promotion_starts_at,
      promotion_ends_at,
      countdown_enabled,
      updated_by: admin.id,
    },
    { onConflict: "id" }
  );

  revalidatePath("/admin/pricing");
  revalidatePath("/course");
  revalidatePath("/get-started");
}
