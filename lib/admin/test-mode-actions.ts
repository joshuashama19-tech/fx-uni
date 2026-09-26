"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getCourseId } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRow, ProfileRow } from "@/lib/types";

// Everything in this file is the ONLY place a test account is created,
// reset, or deleted — see supabase/migrations/0013_test_mode.sql's file
// header for the full design. Every function calls requireAdmin() itself as
// its first step (never relies on the calling page having already checked),
// and every write that targets an existing user re-verifies
// profiles.is_test = true for that user immediately before acting — so this
// file can never be used, however it's called, to create real admin access,
// or to reset/delete a real student's account.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface TestAccountRow {
  id: string;
  email: string;
  full_name: string | null;
  access_status: "active" | "revoked" | "none";
  granted_at: string | null;
  revoked_at: string | null;
  latest_order_reference: string | null;
  latest_order_status: string | null;
  created_at: string;
}

export async function listTestAccounts(): Promise<TestAccountRow[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("is_test", true)
    .order("created_at", { ascending: false })
    .limit(100);

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
      created_at: p.created_at,
      access_status: access ? (access.status as "active" | "revoked") : "none",
      granted_at: access?.granted_at ?? null,
      revoked_at: access?.revoked_at ?? null,
      latest_order_reference: latestOrder?.paystack_reference ?? null,
      latest_order_status: latestOrder?.status ?? null,
    };
  });
}

export async function listTestOrders(): Promise<(OrderRow & { email: string | null })[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .eq("is_test", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!orders || orders.length === 0) return [];

  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const { data: profiles } = await admin.from("profiles").select("id, email").in("id", userIds);

  return orders.map((o) => ({
    ...o,
    email: profiles?.find((p) => p.id === o.user_id)?.email ?? null,
  }));
}

/**
 * The only path that ever sets profiles.is_test = true — done in the same
 * service-role operation that creates the auth user, never after the fact
 * and never by a public signup. Mirrors lib/auth/actions.ts's signUpAction()
 * validation, but creates the user directly via the admin API (email
 * pre-confirmed — an admin creating a test account shouldn't have to click
 * an email link) instead of the public supabase.auth.signUp() flow.
 */
export async function createTestAccountAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!EMAIL_RE.test(email) || password.length < 8) {
    // Same minimums as the public signup form (lib/auth/actions.ts). No
    // error-message plumbing back to the form for this admin-only tool —
    // just refuse the write.
    return;
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || null },
  });

  if (createError || !created.user) {
    return;
  }

  // handle_new_user() (supabase/migrations/0001_init.sql) already inserted a
  // profiles row for this new auth user with is_test defaulting to false —
  // this is the one and only place that ever flips it to true, in this same
  // service-role operation, never reachable from the authenticated role
  // (prevent_self_admin_grant() pins it against that role regardless).
  await admin.from("profiles").update({ is_test: true }).eq("id", created.user.id);

  revalidatePath("/admin/test-mode");
}

async function isTestAccount(admin: ReturnType<typeof createAdminClient>, userId: string): Promise<boolean> {
  const { data } = await admin.from("profiles").select("is_test").eq("id", userId).maybeSingle<
    Pick<ProfileRow, "is_test">
  >();
  return data?.is_test === true;
}

/**
 * Resets a test account back to a clean slate so its owner can re-run the
 * signup → checkout → payment flow from the top: revokes any active test
 * course_access and cancels any still-pending test order. Refuses outright
 * (no-op) unless the target is actually a test account — this can never
 * touch a real student's access or orders, whatever userId is passed.
 */
export async function resetTestAccountAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId) return;

  const admin = createAdminClient();
  if (!(await isTestAccount(admin, userId))) return;

  await admin
    .from("course_access")
    .update({ status: "revoked", revoked_at: new Date().toISOString(), notes: "Reset by admin (Test Mode)" })
    .eq("user_id", userId)
    .eq("course_id", getCourseId())
    .eq("is_test", true);

  await admin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("is_test", true)
    .eq("status", "pending");

  revalidatePath("/admin/test-mode");
}

/**
 * Permanently deletes a test account (auth user + profile), which cascades
 * to that user's own orders/course_access/test_payment_simulations rows via
 * their existing "on delete cascade" foreign keys. Refuses outright unless
 * the target is actually a test account.
 */
export async function deleteTestAccountAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId) return;

  const admin = createAdminClient();
  if (!(await isTestAccount(admin, userId))) return;

  await admin.auth.admin.deleteUser(userId);

  revalidatePath("/admin/test-mode");
}
