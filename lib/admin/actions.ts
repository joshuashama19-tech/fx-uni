"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  grantCourseAccessManually,
  revokeCourseAccess,
  restoreCourseAccess,
} from "@/lib/payments/access-activation";

// Every function here calls requireAdmin() itself as its first step — never
// relies on the calling page having already checked. These are the only
// code paths (besides the Paystack webhook / return-verify flow) that can
// write to course_access, and they always run through the service-role
// client, never through RLS-restricted student access.

export async function grantAccessAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId) return;
  await grantCourseAccessManually(userId, admin.id, "Manually granted by admin");
  revalidatePath("/admin/students");
}

export async function revokeAccessAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId) return;
  await revokeCourseAccess(userId, "manual_admin_revocation");
  revalidatePath("/admin/students");
}

export async function restoreAccessAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId) return;
  await restoreCourseAccess(userId, admin.id);
  revalidatePath("/admin/students");
}

export interface StudentRow {
  id: string;
  email: string;
  full_name: string | null;
  access_status: "active" | "revoked" | "none";
  granted_at: string | null;
  revoked_at: string | null;
  latest_order_reference: string | null;
  latest_order_status: string | null;
}

export async function findStudents(query: string): Promise<StudentRow[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, full_name")
    .ilike("email", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(25);

  if (!profiles || profiles.length === 0) return [];

  const ids = profiles.map((p) => p.id);

  const { data: accessRows } = await admin
    .from("course_access")
    .select("user_id, status, granted_at, revoked_at")
    .in("user_id", ids);

  const { data: orderRows } = await admin
    .from("orders")
    .select("user_id, paystack_reference, status, created_at")
    .in("user_id", ids)
    .order("created_at", { ascending: false });

  return profiles.map((p) => {
    const access = accessRows?.find((a) => a.user_id === p.id);
    const latestOrder = orderRows?.find((o) => o.user_id === p.id);
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      access_status: access ? (access.status as "active" | "revoked") : "none",
      granted_at: access?.granted_at ?? null,
      revoked_at: access?.revoked_at ?? null,
      latest_order_reference: latestOrder?.paystack_reference ?? null,
      latest_order_status: latestOrder?.status ?? null,
    };
  });
}
