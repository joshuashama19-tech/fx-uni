"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { checkCourseAccess } from "@/lib/access";

// Server Actions backing every auth form (/get-started, /login,
// /forgot-password, /reset-password). Plain <form action={...}> submissions
// with no client-side auth JS — Supabase's own server-side session
// lifecycle (via @supabase/ssr, see lib/supabase/server.ts and
// middleware.ts) handles everything; this file never touches a JWT
// directly.
//
// Errors are reported by redirecting back to the originating page with an
// `error` query param rather than a thrown exception the page has to catch
// — keeps every form a plain server-rendered page.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

/** Only ever redirect to a path on this site — never follow an attacker-supplied absolute/scheme-relative "next". */
function sanitizeNextPath(next: string | null | undefined, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

function redirectWithError(path: string, error: string, extra?: Record<string, string>): never {
  const params = new URLSearchParams({ error, ...extra });
  redirect(`${path}?${params.toString()}`);
}

/** True for "/learn" and any path under it — the only destinations that actually require course_access. */
function isLearnPath(path: string): boolean {
  return path === "/learn" || path.startsWith("/learn/");
}

export async function signUpAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = sanitizeNextPath(String(formData.get("next") || ""), "/get-started");

  if (!name || name.length > 200) {
    redirectWithError("/get-started", "Please enter your full name.", { mode: "signup" });
  }
  if (!EMAIL_RE.test(email)) {
    redirectWithError("/get-started", "Please enter a valid email address.", { mode: "signup" });
  }
  if (password.length < 8) {
    redirectWithError("/get-started", "Password must be at least 8 characters.", { mode: "signup" });
  }

  const ip = await getClientIp();
  const rl = rateLimit(`signup:${ip}`, 8, 15 * 60);
  if (!rl.allowed) {
    redirectWithError("/get-started", "Too many attempts. Please try again in a few minutes.", {
      mode: "signup",
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    const message = /already registered|already exists/i.test(error.message)
      ? "An account with this email already exists. Try logging in instead."
      : "We couldn't create your account. Please check your details and try again.";
    redirectWithError("/get-started", message, { mode: "signup" });
  }

  if (data.session) {
    // Email confirmation is disabled on this Supabase project — the user is
    // already signed in.
    redirect(next);
  }

  redirect(`/get-started?status=verify-email&email=${encodeURIComponent(email)}`);
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = sanitizeNextPath(String(formData.get("next") || ""), "/get-started");
  // Where to send the user back to on failure — /login or /get-started,
  // whichever form this submission came from.
  const redirectPath = sanitizeNextPath(String(formData.get("redirectPath") || ""), "/get-started");

  if (!EMAIL_RE.test(email) || password.length === 0) {
    redirectWithError(redirectPath, "Incorrect email or password.", { mode: "login", next });
  }

  const ip = await getClientIp();
  const rl = rateLimit(`login:${ip}:${email}`, 10, 15 * 60);
  if (!rl.allowed) {
    redirectWithError(redirectPath, "Too many attempts. Please try again in a few minutes.", {
      mode: "login",
      next,
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithError(redirectPath, "Incorrect email or password.", { mode: "login", next });
  }

  // Being authenticated is never enough on its own to reach /learn — only
  // an active course_access row is (checkCourseAccess() / requireCourseAccess()
  // in lib/access.ts is still the one source of truth this reads, and
  // /learn's own layout re-checks it independently regardless of what
  // happens here). This check only applies when `next` actually targets
  // /learn: a login that's returning the user somewhere else entirely (e.g.
  // /account, which doesn't require payment) still honors that destination
  // as before, exactly like it did prior to this check existing.
  if (isLearnPath(next)) {
    const access = await checkCourseAccess();
    redirect(access.authorized ? next : "/get-started");
  }

  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    redirectWithError("/forgot-password", "Please enter a valid email address.");
  }

  const ip = await getClientIp();
  const rl = rateLimit(`reset:${ip}`, 5, 15 * 60);
  if (!rl.allowed) {
    redirectWithError("/forgot-password", "Too many attempts. Please try again in a few minutes.");
  }

  const supabase = await createClient();
  // Always show the same "check your email" result whether or not this
  // address has an account — never reveal account existence through this
  // form's response.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  redirect(`/forgot-password?status=sent`);
}

export async function updatePasswordAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (password.length < 8) {
    redirectWithError("/reset-password", "Password must be at least 8 characters.");
  }
  if (password !== confirmPassword) {
    redirectWithError("/reset-password", "Passwords do not match.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirectWithError("/reset-password", "Could not update your password. Please request a new reset link.");
  }

  redirect("/login?status=password-updated");
}
