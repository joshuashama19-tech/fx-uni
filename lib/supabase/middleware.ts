import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session cookie on every matched request.
 *
 * This is a UX/reliability nicety (keeps users logged in, avoids stale
 * session cookies) — it is NOT the security boundary. The real
 * authorization check (is this user logged in, do they have active course
 * access) happens server-side inside the protected route/layout itself via
 * requireCourseAccess() (lib/access.ts), which calls supabase.auth.getUser()
 * (a live round-trip, not the cached getClaims()) plus a fresh course_access
 * query. Middleware alone must never be trusted to gate access.
 *
 * `requestHeaders`, if given, is what every `NextResponse.next()` call below
 * forwards as the request's headers for downstream rendering, instead of
 * `request.headers` itself. middleware.ts uses this to thread its per-request
 * CSP nonce through (see lib/security-headers.ts) without this function ever
 * needing to know about that — it just forwards whatever it's handed. A
 * freshly-constructed `Headers` object is used there rather than mutating
 * `request.headers` in place, since a request's headers can carry an
 * "immutable" guard in some runtimes that throws on `.set()`; building a new
 * `Headers` (seeded from the original) sidesteps that risk entirely. Omitting
 * this parameter preserves the exact original behavior.
 */
export async function updateSession(request: NextRequest, requestHeaders?: Headers) {
  const headersForResponse = requestHeaders ?? request.headers;
  let supabaseResponse = NextResponse.next({ request: { headers: headersForResponse } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request: { headers: headersForResponse } });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touches Supabase Auth, which refreshes the session cookie if the access
  // token has expired. Do not remove — without this, sessions silently stop
  // refreshing and users get logged out.
  await supabase.auth.getUser();

  return supabaseResponse;
}
