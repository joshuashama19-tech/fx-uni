import "server-only";
import crypto from "node:crypto";

// Server-side Meta Conversions API (CAPI) client — the Purchase-event
// counterpart to the browser-side Pixel calls in
// components/analytics/{PixelPageviewTracker,ViewContentTracker,
// InitiateCheckoutTracker,PurchaseTracker}.tsx. Deliberately isolated in its
// own file, "server-only", with no dependency on anything payment-specific:
// its only caller is lib/payments/access-activation.ts's
// maybeSendPurchaseCapiEvent(), which decides WHEN/WHETHER to call it
// (idempotency, is_test exclusion) — this file's only job is HOW to
// actually send one Purchase event to Meta's Graph API, correctly.
//
// Never throws: every failure (missing config, network error, non-2xx
// response) is caught internally and logged — a Meta API problem must never
// surface as, or be confused with, a payment/checkout problem. Callers do
// not need their own try/catch around sendPurchaseEvent().

const META_GRAPH_VERSION = "v21.0";

function getPixelId(): string | null {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || null;
}

function getAccessToken(): string | null {
  return process.env.META_CAPI_ACCESS_TOKEN?.trim() || null;
}

// Optional. Only ever set temporarily, while actively verifying events in
// Meta Events Manager's Test Events tool — see .env.example. Left unset in
// normal production operation, so real conversions are never accidentally
// routed into the test-events stream instead of counting normally.
function getTestEventCode(): string | undefined {
  return process.env.META_CAPI_TEST_EVENT_CODE?.trim() || undefined;
}

// Meta's documented normalization for a hashed `em` (email) field:
// lowercase + trim whitespace, then SHA-256, sent as a hex digest. No other
// transformation (e.g. stripping "+" aliases) is part of Meta's documented
// spec, so none is applied here.
function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export interface SendPurchaseEventParams {
  // Same value as the browser-side Purchase pixel call's `eventID` option
  // (see components/analytics/PurchaseTracker.tsx) — order.paystack_reference.
  // This is the field Meta's deduplication keys on (event_name + event_id),
  // pairing this CAPI call with the browser Pixel Purchase call for the same
  // order into a single reported conversion.
  eventId: string;
  email: string | null;
  amountMinorUnits: number;
  currency: string;
  eventSourceUrl: string;
  contentName: string;
  contentIds: string[];
  // Only ever populated by the return-page call site (app/get-started/verify/page.tsx),
  // which has real request context (cookies/headers) for the student's own
  // browser. Webhook-triggered calls have no browser context at all — a
  // payment provider's server, not the student's browser, made that
  // request — and correctly omit this rather than fabricate it.
  browserSignals?: {
    fbp?: string;
    fbc?: string;
    clientIp?: string;
    userAgent?: string;
  };
}

/**
 * POST {pixelId}/events — sends one Purchase event to Meta's Conversions
 * API. See this file's header comment for the never-throws contract and
 * lib/payments/access-activation.ts's maybeSendPurchaseCapiEvent() for the
 * idempotency/is_test gating that decides whether/when this gets called at
 * all.
 */
export async function sendPurchaseEvent(params: SendPurchaseEventParams): Promise<void> {
  const pixelId = getPixelId();
  const accessToken = getAccessToken();

  if (!pixelId || !accessToken) {
    // Fails closed/silent, same philosophy as app/layout.tsx's own
    // NEXT_PUBLIC_META_PIXEL_ID check: an unconfigured Meta integration must
    // never block or alter checkout — this is purely an analytics send.
    console.error(
      "[meta-capi] Purchase event not sent: NEXT_PUBLIC_META_PIXEL_ID or META_CAPI_ACCESS_TOKEN is not set"
    );
    return;
  }

  const userData: Record<string, unknown> = {};
  if (params.email) userData.em = [hashEmail(params.email)];
  if (params.browserSignals?.fbp) userData.fbp = params.browserSignals.fbp;
  if (params.browserSignals?.fbc) userData.fbc = params.browserSignals.fbc;
  if (params.browserSignals?.clientIp) userData.client_ip_address = params.browserSignals.clientIp;
  if (params.browserSignals?.userAgent) userData.client_user_agent = params.browserSignals.userAgent;

  const testEventCode = getTestEventCode();

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        action_source: "website",
        event_source_url: params.eventSourceUrl,
        user_data: userData,
        custom_data: {
          currency: params.currency,
          value: Math.round(params.amountMinorUnits) / 100,
          content_name: params.contentName,
          content_type: "product",
          content_ids: params.contentIds,
        },
      },
    ],
    // access_token is sent in the body, not the URL query string, so it
    // never appears in any URL-based logging (e.g. Vercel's own function
    // request logs) — unlike Meta's own quick-start examples, which put it
    // in the query string.
    access_token: accessToken,
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  try {
    const res = await fetch(`https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      // Logs Meta's own error response only — access_token is never
      // included in this error (it's a request field, never echoed back by
      // Meta in an error body) and is never logged anywhere in this file.
      console.error("[meta-capi] Purchase event send failed", res.status, json);
    }
  } catch (err) {
    console.error("[meta-capi] Purchase event send threw", err);
  }
}
