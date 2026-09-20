import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { buildContentSecurityPolicy, staticSecurityHeaders, HSTS_HEADER_VALUE } from "@/lib/security-headers";

// Next.js 15 (this project's version) invokes middleware.ts / `middleware`.
// Next.js 16 renames this to proxy.ts / `proxy` — do not rename this file
// unless the project is upgraded past Next 16, or sessions will silently
// stop refreshing.
export async function middleware(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === "production";

  // A fresh nonce per request, used only by script-src below. Threading it
  // to Next.js's own App Router rendering (not just the eventual response)
  // is required for Next to nonce the inline scripts it injects for
  // RSC-payload hydration — it reads the nonce back out of the
  // Content-Security-Policy value on the REQUEST it renders with. Built as
  // a fresh Headers object (seeded from the incoming request) rather than
  // mutating request.headers directly, since request headers can carry an
  // "immutable" guard that throws on .set() in some runtimes. See
  // lib/security-headers.ts for the full policy and reasoning.
  const nonce = crypto.randomUUID();
  const csp = buildContentSecurityPolicy(nonce, isProduction);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  // updateSession() forwards requestHeaders on every NextResponse.next() it
  // issues internally for cookie refresh (see lib/supabase/middleware.ts).
  const response = await updateSession(request, requestHeaders);

  response.headers.set("Content-Security-Policy", csp);
  for (const [key, value] of Object.entries(staticSecurityHeaders)) {
    response.headers.set(key, value);
  }
  if (isProduction) {
    response.headers.set("Strict-Transport-Security", HSTS_HEADER_VALUE);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every route except static assets and image optimization files,
     * so the session cookie stays fresh everywhere (including the public
     * marketing pages, which read auth state to decide nav CTAs).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
