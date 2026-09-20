"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_CONTENT_DEFAULTS, type SiteContentKey } from "@/lib/content";

// Same pattern as lib/admin/actions.ts: every exported action calls
// requireAdmin() itself as its first line (never trusts that the calling
// page already checked), and every write goes through the service-role
// client — never through an RLS policy for the authenticated role, because
// no such write policy exists for these tables (see
// supabase/migrations/0005_admin_cms.sql). revalidatePath() covers both the
// admin list page (so the change shows up immediately) and /course (belt
// and suspenders — the whole app already renders force-dynamic via
// app/layout.tsx's `export const dynamic = "force-dynamic"`, so /course
// never serves a cached response anyway, but this keeps the actions correct
// even if that ever changes).

function parseDisplayOrder(formData: FormData): number {
  const raw = String(formData.get("display_order") ?? "");
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function checkbox(formData: FormData, name: string): boolean {
  // Standard unchecked-checkbox-omits-the-field HTML form behavior.
  return formData.get(name) === "on" || formData.get(name) === "true";
}

// -----------------------------------------------------------------------
// Testimonials
// -----------------------------------------------------------------------

export async function createTestimonialAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const student_name = String(formData.get("student_name") || "").trim();
  const quote = String(formData.get("quote") || "").trim();
  if (!student_name || !quote) return;

  const role_title = String(formData.get("role_title") || "").trim() || null;
  const display_order = parseDisplayOrder(formData);
  // New testimonials default to inactive + placeholder unless the admin
  // explicitly marks them otherwise, per the "never invent/auto-publish a
  // testimonial" instruction — an admin has to make a deliberate choice to
  // flip is_placeholder off and is_active on for a quote to ever go public.
  const is_active = checkbox(formData, "is_active");
  const is_placeholder = checkbox(formData, "is_placeholder");

  const db = createAdminClient();
  await db.from("testimonials").insert({
    student_name,
    role_title,
    quote,
    display_order,
    is_active,
    is_placeholder,
    created_by: admin.id,
    updated_by: admin.id,
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/course");
}

export async function updateTestimonialAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const id = String(formData.get("id") || "");
  const student_name = String(formData.get("student_name") || "").trim();
  const quote = String(formData.get("quote") || "").trim();
  if (!id || !student_name || !quote) return;

  const role_title = String(formData.get("role_title") || "").trim() || null;
  const display_order = parseDisplayOrder(formData);
  const is_active = checkbox(formData, "is_active");
  const is_placeholder = checkbox(formData, "is_placeholder");

  const db = createAdminClient();
  await db
    .from("testimonials")
    .update({
      student_name,
      role_title,
      quote,
      display_order,
      is_active,
      is_placeholder,
      updated_by: admin.id,
    })
    .eq("id", id);

  revalidatePath("/admin/testimonials");
  revalidatePath("/course");
}

export async function toggleTestimonialActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const nextActive = String(formData.get("next_active") || "") === "true";
  if (!id) return;

  const db = createAdminClient();
  await db.from("testimonials").update({ is_active: nextActive }).eq("id", id);

  revalidatePath("/admin/testimonials");
  revalidatePath("/course");
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) return;

  const db = createAdminClient();
  await db.from("testimonials").delete().eq("id", id);

  revalidatePath("/admin/testimonials");
  revalidatePath("/course");
}

// -----------------------------------------------------------------------
// FAQs
// -----------------------------------------------------------------------

export async function createFaqAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  if (!question || !answer) return;

  const display_order = parseDisplayOrder(formData);
  const is_active = checkbox(formData, "is_active");

  const db = createAdminClient();
  await db.from("faqs").insert({
    question,
    answer,
    display_order,
    is_active,
    created_by: admin.id,
    updated_by: admin.id,
  });

  revalidatePath("/admin/faqs");
  revalidatePath("/course");
}

export async function updateFaqAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const id = String(formData.get("id") || "");
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  if (!id || !question || !answer) return;

  const display_order = parseDisplayOrder(formData);
  const is_active = checkbox(formData, "is_active");

  const db = createAdminClient();
  await db
    .from("faqs")
    .update({ question, answer, display_order, is_active, updated_by: admin.id })
    .eq("id", id);

  revalidatePath("/admin/faqs");
  revalidatePath("/course");
}

export async function toggleFaqActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const nextActive = String(formData.get("next_active") || "") === "true";
  if (!id) return;

  const db = createAdminClient();
  await db.from("faqs").update({ is_active: nextActive }).eq("id", id);

  revalidatePath("/admin/faqs");
  revalidatePath("/course");
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) return;

  const db = createAdminClient();
  await db.from("faqs").delete().eq("id", id);

  revalidatePath("/admin/faqs");
  revalidatePath("/course");
}

// -----------------------------------------------------------------------
// site_content (small, fixed key set — see lib/content.ts)
// -----------------------------------------------------------------------

export async function updateSiteContentAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const key = String(formData.get("key") || "");
  // Only the fixed keys lib/content.ts knows how to read are writable —
  // this deliberately rejects an arbitrary key rather than letting the
  // table silently accumulate rows nothing on the site ever reads.
  if (!(key in SITE_CONTENT_DEFAULTS)) return;

  const value = String(formData.get("value") ?? "").trim();
  if (!value) return;

  const db = createAdminClient();
  await db
    .from("site_content")
    .upsert({ key: key as SiteContentKey, value, updated_by: admin.id }, { onConflict: "key" });

  revalidatePath("/admin/content");
  revalidatePath("/course");
}
