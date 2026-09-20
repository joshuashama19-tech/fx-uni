import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { CourseAccessRow, ProfileRow } from "@/lib/types";

// The course-authorization boundary. Every protected /learn request must go
// through requireCourseAccess() (or, for admin routes, requireAdmin()) —
// this is the ONLY place that decides whether a request gets protected
// course content. It is called fresh on every request (no caching of the
// authorization decision itself), so a revoked student loses access on
// their very next request, not just their next login.
//
// Deliberately uses supabase.auth.getUser() — a live round-trip to Supabase
// Auth — rather than the faster local-only getClaims()/getSession(),
// because getClaims() only verifies the JWT's signature/expiry and would
// NOT notice a server-side-revoked session. That gap matters here.
//
// Fail-closed: if the database or auth service errors for any reason, this
// treats the user as NOT authorized rather than granting access. See
// AccessDenialReason "service_unavailable" and requireCourseAccess()'s
// handling of it below.

export function getCourseId(): string {
  return process.env.COURSE_ID?.trim() || "fx-university";
}

export class ServiceUnavailableError extends Error {
  constructor(message = "The course service is temporarily unavailable.") {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}

type AccessCheckResult =
  | { authorized: true; user: User; profile: ProfileRow | null }
  | { authorized: false; reason: "unauthenticated" }
  | { authorized: false; reason: "no_access" }
  | { authorized: false; reason: "revoked" }
  | { authorized: false; reason: "service_unavailable" };

async function checkCourseAccessInternal(): Promise<AccessCheckResult> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { authorized: false, reason: "service_unavailable" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    // Distinguish "no session" (expected, not an outage) from a genuine
    // service error would require inspecting error codes that aren't
    // stable across supabase-js versions; failing closed either way is the
    // correct behavior per section 32 ("do not fail open").
    return { authorized: false, reason: "unauthenticated" };
  }
  if (!user) {
    return { authorized: false, reason: "unauthenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  const { data: access, error: accessError } = await supabase
    .from("course_access")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", getCourseId())
    .maybeSingle<CourseAccessRow>();

  if (accessError) {
    return { authorized: false, reason: "service_unavailable" };
  }

  if (!access) {
    return { authorized: false, reason: "no_access" };
  }
  if (access.status === "revoked") {
    return { authorized: false, reason: "revoked" };
  }
  if (access.status !== "active") {
    return { authorized: false, reason: "no_access" };
  }

  return { authorized: true, user, profile: profile ?? null };
}

/** Read-only check — does NOT redirect. Used by /get-started to branch UI. */
export async function checkCourseAccess() {
  return checkCourseAccessInternal();
}

/**
 * The enforcement point for every /learn route. Redirects unauthenticated
 * or unauthorized requests to the appropriate place; throws
 * ServiceUnavailableError (caught by app/learn/layout.tsx, which renders an
 * inline "temporary error, try again" state) when authorization genuinely
 * cannot be confirmed — it never falls through to granting access.
 */
export async function requireCourseAccess(): Promise<{ user: User; profile: ProfileRow | null }> {
  const result = await checkCourseAccessInternal();

  if (result.authorized) {
    return { user: result.user, profile: result.profile };
  }

  switch (result.reason) {
    case "unauthenticated":
      redirect("/login?next=%2Flearn");
    case "no_access":
      redirect("/get-started?status=no-access");
    case "revoked":
      redirect("/get-started?status=revoked");
    case "service_unavailable":
      throw new ServiceUnavailableError();
  }
}

/**
 * Admin authorization: requires a logged-in user whose profiles.is_admin is
 * true. is_admin can only be set by a service-role query (see
 * supabase/migrations/0001_init.sql — a trigger blocks the authenticated
 * role from changing it, including on itself), so this is a real
 * server-side check, not the "insecure hidden /admin page" the spec warns
 * against.
 */
export async function requireAdmin(): Promise<{ user: User; profile: ProfileRow }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=%2Fadmin");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error || !profile || !profile.is_admin) {
    // Deliberately redirect to home rather than a 403/"not authorized"
    // page, so a non-admin gets no signal that /admin exists at all.
    redirect("/");
  }

  return { user, profile };
}
