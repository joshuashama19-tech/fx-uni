// Centralized production HTTP security headers, applied to every response
// in middleware.ts (the only place able to set headers on every route,
// including ones no shared layout wraps). Kept in one file so the policy
// is easy to audit and to revisit once real deployment specifics are
// known — see the notes below and the implementation report's security
// section for what should be re-checked after the first deploy.
//
// Why a genuinely strict Content-Security-Policy is possible here at all
// (this was verified by reading the code, not assumed): this app makes
// ZERO direct browser-to-Supabase and ZERO direct browser-to-Paystack
// network calls. Every auth operation (lib/auth/actions.ts) and every
// payment operation (lib/payments/*.ts) runs in a Server Action or Route
// Handler — the Supabase browser client (lib/supabase/client.ts) exists
// but is never imported anywhere, and Paystack's checkout is reached via
// a full top-level `redirect(authorizationUrl)` (lib/payments/checkout-
// action.ts), not a client-side fetch, popup, or embedded/inline widget.
// A server-issued redirect is an ordinary browser navigation, which CSP's
// resource directives (connect-src, frame-src, etc.) do not govern — so
// neither Supabase's nor Paystack's domains need to appear in this policy
// for the app to work as built. Fonts are self-hosted via next/font
// (Montserrat), so no Google Fonts network host is needed either.
//
// If the payment integration is ever changed to Paystack's inline/popup
// JS SDK instead of the current redirect flow, this policy WILL need
// updating: script-src would need `https://js.paystack.co`, frame-src
// would need `https://checkout.paystack.com`, and connect-src would need
// `https://api.paystack.co`. Not needed today — not added today.

/**
 * Builds the Content-Security-Policy header value for one request.
 *
 * Uses Next.js's own documented nonce + 'strict-dynamic' pattern for
 * script-src (see
 * https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
 * rather than 'unsafe-inline', so App Router's inline RSC-payload
 * bootstrap scripts keep working while an attacker-injected <script> (no
 * matching nonce) is still blocked. 'unsafe-eval' is added only outside
 * production because `next dev`'s Fast Refresh relies on eval(); a
 * production build does not need it.
 *
 * style-src intentionally carries 'unsafe-inline' with NO nonce. CSP has
 * no nonce mechanism for the HTML style="" attribute (nonces only cover
 * <style> elements/<link>), and this app has two React `style={{...}}`
 * usages (components/ui/Reveal.tsx, components/CoursePreviewSection.tsx)
 * that would otherwise break. This is a deliberate, narrow, documented
 * tradeoff — not an oversight — and is why style-src and script-src are
 * built separately below rather than sharing a nonce.
 */
export function buildContentSecurityPolicy(nonce: string, isProduction: boolean): string {
  const directives: [string, string[]][] = [
    ["default-src", ["'self'"]],
    [
      "script-src",
      ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isProduction ? [] : ["'unsafe-eval'"])],
    ],
    ["style-src", ["'self'", "'unsafe-inline'"]],
    ["img-src", ["'self'", "data:"]],
    ["font-src", ["'self'", "data:"]],
    // Nothing here needs to be reachable — see file header.
    ["connect-src", ["'self'"]],
    // Nothing on this site embeds a frame; the PDF in particular must
    // never be reachable this way (see check-pdf-not-exposed.mjs).
    ["frame-src", ["'none'"]],
    // Modern equivalent of X-Frame-Options: DENY — nothing may embed any
    // page of this site in a frame (course reader included).
    ["frame-ancestors", ["'none'"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    // Every <form> in this app (auth, checkout, admin actions) submits to
    // a same-origin Server Action/route — never directly to Paystack or
    // anywhere else.
    ["form-action", ["'self'"]],
  ];

  if (isProduction) {
    // Only meaningful over HTTPS, which is what every real deployment
    // target here (production or a Vercel preview) actually is. Left out
    // of dev so `next dev` on plain http://localhost is never affected.
    directives.push(["upgrade-insecure-requests", []]);
  }

  return directives
    .map(([key, values]) => (values.length > 0 ? `${key} ${values.join(" ")}` : key))
    .join("; ");
}

/** Headers with a single fixed value, applied to every response alongside the CSP above. */
export const staticSecurityHeaders: Record<string, string> = {
  // Legacy fallback for browsers that don't honor frame-ancestors yet;
  // functionally redundant with it today, costs nothing to include.
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Denies browser features this app never uses. Notably `payment=()`
  // disables the browser's native Payment Request API — unrelated to (and
  // safe alongside) the Paystack integration, which never uses it.
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
    "interest-cohort=()",
    "browsing-topics=()",
  ].join(", "),
};

/**
 * Strict-Transport-Security: only ever sent in production. Browsers
 * ignore HSTS response headers received over plain HTTP anyway (per
 * spec), so this is technically safe to always send — but gating it
 * explicitly keeps local `next dev` output unambiguous and matches how
 * every other production-only header here is handled.
 *
 * `preload` is included because the directive requires it for submission
 * to browsers' built-in HSTS preload lists, but submitting is a separate,
 * manual, one-way step (https://hstspreload.org) — do NOT submit until
 * the production domain is final and everything on it is confirmed to
 * serve over HTTPS only; removal from the preload list afterward is slow
 * and affects every browser that shipped it.
 */
export const HSTS_HEADER_VALUE = "max-age=63072000; includeSubDomains; preload";
