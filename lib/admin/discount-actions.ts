"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeDiscountCode } from "@/lib/discounts";
import type { DiscountCodeRow, DiscountType } from "@/lib/types";

// Same pattern as lib/admin/pricing-actions.ts: every write here calls
// requireAdmin() first and goes through the service-role client — there is
// no RLS write (or read) policy for discount_codes/discount_code_redemptions
// at all (see supabase/migrations/0010_discount_codes.sql). usage_count is
// NEVER written here — it's only ever incremented by the
// apply_discount_redemption() Postgres function, called from
// lib/discounts.ts's redeemDiscountCode() after a confirmed payment.

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

/** Parses a plain "43000" / "43,000" / "43000.50" Naira amount into minor units (kobo). Same logic as lib/admin/pricing-actions.ts's helper. */
function majorAmountToMinorUnits(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

/** A `datetime-local` input value ("YYYY-MM-DDTHH:mm"), treated as UTC. Same logic as lib/admin/pricing-actions.ts's helper. */
function parseUtcDatetimeLocal(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const iso = trimmed.length === 16 ? `${trimmed}:00Z` : `${trimmed}Z`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function parsePositiveInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

interface ParsedDiscountForm {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number | null;
  max_uses_per_customer: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

/** Returns null on any invalid input — callers refuse to save rather than guess. */
function parseDiscountForm(formData: FormData): ParsedDiscountForm | null {
  const code = normalizeDiscountCode(String(formData.get("code") || ""));
  if (!code) return null;

  const discount_type = String(formData.get("discount_type") || "") as DiscountType;
  if (discount_type !== "percentage" && discount_type !== "fixed") return null;

  let discount_value: number;
  if (discount_type === "percentage") {
    const raw = String(formData.get("discount_value_percent") || "").trim();
    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 100) return null;
    discount_value = n;
  } else {
    const minorUnits = majorAmountToMinorUnits(String(formData.get("discount_value_fixed") || ""));
    if (minorUnits == null) return null;
    discount_value = minorUnits;
  }

  const maxUsesRaw = String(formData.get("max_uses") || "").trim();
  const max_uses = maxUsesRaw ? parsePositiveInt(maxUsesRaw) : null;
  if (maxUsesRaw && max_uses == null) return null; // non-blank but invalid — refuse rather than silently treat as unlimited

  const maxUsesPerCustomerRaw = String(formData.get("max_uses_per_customer") || "").trim();
  const max_uses_per_customer = maxUsesPerCustomerRaw ? parsePositiveInt(maxUsesPerCustomerRaw) : null;
  if (maxUsesPerCustomerRaw && max_uses_per_customer == null) return null;

  const starts_at = parseUtcDatetimeLocal(String(formData.get("starts_at") || ""));
  const ends_at = parseUtcDatetimeLocal(String(formData.get("ends_at") || ""));
  if (starts_at && ends_at && new Date(ends_at) <= new Date(starts_at)) return null;

  const is_active = checkbox(formData, "is_active");

  return { code, discount_type, discount_value, max_uses, max_uses_per_customer, starts_at, ends_at, is_active };
}

export async function createDiscountCodeAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();
  const parsed = parseDiscountForm(formData);
  if (!parsed) {
    redirect(`/admin/discount-codes?error=${encodeURIComponent("Please check the form — one or more fields are invalid.")}`);
  }

  const db = createAdminClient();
  const { error } = await db.from("discount_codes").insert({
    ...parsed,
    // max_uses_per_customer defaults to 1 at the DB level, but an explicit
    // null here (the field left blank) means "unlimited per customer" and
    // must be written as null, not omitted (omitting would fall back to the
    // column default of 1 instead of the admin's actual choice).
    max_uses_per_customer: parsed.max_uses_per_customer,
    created_by: admin.id,
    updated_by: admin.id,
  });

  if (error) {
    const message = error.code === "23505" ? "A discount code with that code already exists." : "Could not create the discount code.";
    redirect(`/admin/discount-codes?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/discount-codes");
  redirect("/admin/discount-codes");
}

export async function updateDiscountCodeAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const parsed = parseDiscountForm(formData);
  if (!parsed) {
    redirect(
      `/admin/discount-codes/${encodeURIComponent(id)}/edit?error=${encodeURIComponent(
        "Please check the form — one or more fields are invalid."
      )}`
    );
  }

  const db = createAdminClient();
  const { error } = await db
    .from("discount_codes")
    .update({ ...parsed, updated_by: admin.id })
    .eq("id", id);

  if (error) {
    const message = error.code === "23505" ? "A discount code with that code already exists." : "Could not save the discount code.";
    redirect(`/admin/discount-codes/${encodeURIComponent(id)}/edit?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/discount-codes");
  revalidatePath(`/admin/discount-codes/${id}/edit`);
  redirect("/admin/discount-codes");
}

export async function setDiscountCodeActiveAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const is_active = checkbox(formData, "is_active");

  const db = createAdminClient();
  await db.from("discount_codes").update({ is_active, updated_by: admin.id }).eq("id", id);

  revalidatePath("/admin/discount-codes");
}

/**
 * A code that has already been redeemed at least once is never hard-deleted
 * — doing so would either cascade-delete or orphan its
 * discount_code_redemptions rows (the historical record of real orders that
 * used it), and those orders' own discount_code_id would be left dangling
 * (the FK is ON DELETE SET NULL, which would silently blank out an
 * otherwise-accurate order record). Instead it's simply deactivated, which
 * has the same practical effect (it can no longer be applied) while keeping
 * every past redemption and order fully intact and explainable.
 */
export async function deleteDiscountCodeAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const db = createAdminClient();
  const { data: row } = await db
    .from("discount_codes")
    .select("usage_count")
    .eq("id", id)
    .maybeSingle<Pick<DiscountCodeRow, "usage_count">>();

  if (!row) return;

  if (row.usage_count > 0) {
    await db.from("discount_codes").update({ is_active: false, updated_by: admin.id }).eq("id", id);
  } else {
    await db.from("discount_codes").delete().eq("id", id);
  }

  revalidatePath("/admin/discount-codes");
}

export async function listDiscountCodes(): Promise<DiscountCodeRow[]> {
  await requireAdmin();
  const db = createAdminClient();
  const { data } = await db.from("discount_codes").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function getDiscountCode(id: string): Promise<DiscountCodeRow | null> {
  await requireAdmin();
  const db = createAdminClient();
  const { data } = await db.from("discount_codes").select("*").eq("id", id).maybeSingle<DiscountCodeRow>();
  return data;
}
