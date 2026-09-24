import "server-only";
import crypto from "node:crypto";

// Thin Korapay REST adapter — the Korapay-specific counterpart to
// lib/payments/paystack.ts, kept completely separate from it (see that
// file's own header comment on why: swapping/adding providers should only
// ever touch one adapter file). No SDK dependency, same reasoning as
// paystack.ts: plain HTTPS + JSON, signature verification via Node's
// built-in `crypto`.
//
// Integration surface used: Korapay's "Checkout Redirect" API
// (https://developers.korapay.com/docs/checkout-redirect) — a pure
// server-to-server POST that returns a hosted `checkout_url` to redirect
// the browser to, deliberately NOT Korapay's "Checkout Standard" client-
// side JS modal (https://developers.korapay.com/docs/checkout-standard),
// which would require loading a script in the browser and would need new
// script-src/connect-src/frame-src entries in lib/security-headers.ts's
// CSP. The Checkout Redirect flow mirrors exactly how Paystack is already
// integrated here (see lib/payments/checkout-action.ts's existing
// `redirect(authorizationUrl)` and security-headers.ts's comment on why
// that keeps the CSP simple) — same shape, so no CSP change is needed for
// Korapay either.
//
// IMPORTANT unit difference from Paystack: Korapay's `amount` field is in
// the currency's MAJOR unit (naira, e.g. 29900 = ₦29,900.00), not minor
// units (kobo) like Paystack. This app's money convention is minor units
// everywhere else (orders.amount_minor_units, lib/pricing.ts, Paystack's
// own `amount`) — toMajorUnits/toMinorUnits below are the ONLY place that
// conversion happens, in both directions, so every other file in this
// codebase keeps working in minor units without knowing Korapay is
// different. Verified against Korapay's own documented examples (a 10 NGN
// pre-authorization shown as `"amount": 10`, a 3 NGN capture as
// `"amount": "3"` — see
// https://developers.korapay.com/docs/accept-flexible-card-payments-with-api),
// not assumed.

const KORAPAY_API_BASE = "https://api.korapay.com/merchant/api/v1";

function getSecretKey(): string {
  const key = process.env.KORAPAY_SECRET_KEY;
  if (!key) {
    throw new Error("KORAPAY_SECRET_KEY is not set. Payment operations cannot proceed without it — see .env.example.");
  }
  return key;
}

function toMajorUnits(amountMinorUnits: number): number {
  return Math.round(amountMinorUnits) / 100;
}

function toMinorUnits(amountMajorUnits: number): number {
  return Math.round(amountMajorUnits * 100);
}

export interface InitializeChargeParams {
  email: string;
  amountMinorUnits: number;
  currency: string;
  reference: string;
  redirectUrl: string;
  customerName?: string | null;
  /**
   * Korapay's initialize endpoint documents a hard limit of max 5 fields
   * with field names up to 20 characters — unlike Paystack's metadata,
   * which this app doesn't otherwise constrain. Keep whatever is passed
   * here well under that, and remember access-activation.ts never trusts
   * this back anyway (see confirmSuccessfulPayment in
   * lib/payments/access-activation.ts) — it only ever re-derives state
   * from the `orders` row itself, looked up by reference, and from
   * verifyCharge()'s own response. Metadata here is a convenience for
   * Korapay's dashboard, nothing more.
   */
  metadata?: Record<string, string | number | null>;
}

export interface InitializeChargeResult {
  checkoutUrl: string;
  reference: string;
}

/**
 * POST /charges/initialize — starts a hosted-checkout charge. Returns the
 * URL to redirect the browser to; Korapay collects card/bank/mobile-money
 * details on its own hosted page, so this codebase never touches payment
 * instrument data, exactly like the existing Paystack flow.
 */
export async function initializeCharge(params: InitializeChargeParams): Promise<InitializeChargeResult> {
  const res = await fetch(`${KORAPAY_API_BASE}/charges/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: toMajorUnits(params.amountMinorUnits),
      currency: params.currency,
      reference: params.reference,
      redirect_url: params.redirectUrl,
      customer: {
        email: params.email,
        name: params.customerName || undefined,
      },
      metadata: params.metadata,
    }),
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || !json?.status) {
    throw new Error(`Korapay initialize failed: ${json?.message ?? res.statusText}`);
  }

  return {
    checkoutUrl: json.data.checkout_url,
    reference: json.data.reference,
  };
}

export interface VerifyChargeResult {
  success: boolean;
  status: string; // Korapay's raw status string: "success" | "failed" | ...
  amountMinorUnits: number;
  currency: string;
  reference: string;
  customerEmail: string | null;
}

/**
 * GET /charges/:reference — the trusted, server-side source of truth for
 * whether a charge actually succeeded, mirroring Paystack's
 * verifyTransaction() exactly in role and in the shape of what it returns
 * (see lib/payments/access-activation.ts, which calls whichever of the two
 * an order's own payment_provider says to use). Called both from the
 * checkout-return page and from the Korapay webhook handler — same
 * defense-in-depth reasoning as Paystack: a webhook payload's own "status"
 * field is never enough on its own.
 *
 * Amount comparison: prefers `amount_accepted` over `amount_paid` over
 * `amount`. Korapay's own documentation
 * (https://developers.korapay.com/docs/handling-underpayments-and-overpayments)
 * is explicit that a bank-transfer charge can settle with `status: "success"`
 * while having been under- or over-paid relative to what was requested, and
 * that `amount_accepted` — not `amount` or `amount_paid` — is "the field
 * you're expected to use to credit value to your customer". Whichever
 * field this resolves to, access-activation.ts still independently
 * requires it to exactly equal the order's own amount_minor_units before
 * granting access (requirement: exact expected amount, not just a
 * "success" status), so an under-accepted amount here correctly still
 * fails that check rather than under-crediting a course seat.
 */
export async function verifyCharge(reference: string): Promise<VerifyChargeResult> {
  const res = await fetch(`${KORAPAY_API_BASE}/charges/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getSecretKey()}` },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || !json?.status) {
    throw new Error(`Korapay verify failed: ${json?.message ?? res.statusText}`);
  }

  const data = json.data ?? {};
  const verifiedMajorUnits = data.amount_accepted ?? data.amount_paid ?? data.amount;

  return {
    success: data.status === "success",
    status: data.status,
    amountMinorUnits: toMinorUnits(Number(verifiedMajorUnits)),
    currency: data.currency,
    reference: data.reference,
    customerEmail: data.customer?.email ?? null,
  };
}

/**
 * Verifies the `x-korapay-signature` header. Per Korapay's own
 * documentation (https://developers.korapay.com/docs/webhooks), this is
 * HMAC-SHA256 of the JSON-serialized `data` object ONLY (not the full
 * envelope, and not the raw request body the way Paystack's signature
 * works) — keyed with the Korapay secret key. This is the officially
 * documented verification method; note it depends on
 * JSON.stringify(JSON.parse(rawBody).data) reproducing byte-identical
 * output to what Korapay signed, which holds for standard JSON key
 * ordering under Node's JSON parser/serializer but is inherently a little
 * more fragile than signing the raw bytes directly (which is why Paystack's
 * own verifyWebhookSignature in lib/payments/paystack.ts signs the raw
 * body instead — that file is unchanged, this is Korapay's own documented
 * scheme, not a choice made here).
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  let parsed: { data?: unknown };
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", getSecretKey())
    .update(JSON.stringify(parsed?.data ?? {}))
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const givenBuf = Buffer.from(signatureHeader, "hex");
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}
