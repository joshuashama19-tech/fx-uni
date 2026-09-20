import "server-only";
import crypto from "node:crypto";

// Thin Paystack REST adapter. Deliberately has no SDK dependency — Paystack's
// entire API surface used here is plain HTTPS + JSON, and signature
// verification is Node's built-in `crypto` module, so this needs nothing
// beyond what Node already provides. Keeping payments behind this one
// module (rather than calling `fetch("https://api.paystack.co/...")`
// scattered through route handlers) is what "provider-adapter structure"
// (implementation prompt section 8) means in practice: swapping providers
// later only touches this file.

const PAYSTACK_API_BASE = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Payment operations cannot proceed without it — see .env.example."
    );
  }
  return key;
}

export interface InitializeTransactionParams {
  email: string;
  amountMinorUnits: number;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeTransactionResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

/**
 * POST /transaction/initialize — starts a hosted-checkout transaction.
 * Returns the URL to redirect the browser to; Paystack collects card/bank
 * details on its own hosted page, so this codebase never touches card data.
 */
export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResult> {
  const res = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: String(params.amountMinorUnits),
      currency: params.currency,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || !json?.status) {
    throw new Error(`Paystack initialize failed: ${json?.message ?? res.statusText}`);
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export interface VerifyTransactionResult {
  success: boolean;
  gatewayResponse: string;
  status: string; // Paystack's raw status string: "success" | "failed" | "abandoned" | ...
  amountMinorUnits: number;
  currency: string;
  reference: string;
  paidAt: string | null;
  channel: string | null;
  customerEmail: string | null;
}

/**
 * GET /transaction/verify/:reference — the trusted, server-side source of
 * truth for whether a payment actually succeeded. Called both from the
 * checkout-return page AND from the webhook handler (defense in depth: a
 * webhook's own payload is never enough on its own — see
 * lib/payments/access-activation.ts).
 */
export async function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  const res = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getSecretKey()}` },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || !json?.status) {
    throw new Error(`Paystack verify failed: ${json?.message ?? res.statusText}`);
  }

  const data = json.data;
  return {
    success: data.status === "success",
    gatewayResponse: data.gateway_response ?? "",
    status: data.status,
    amountMinorUnits: data.amount,
    currency: data.currency,
    reference: data.reference,
    paidAt: data.paid_at ?? null,
    channel: data.channel ?? null,
    customerEmail: data.customer?.email ?? null,
  };
}

/**
 * Verifies the `x-paystack-signature` header: HMAC-SHA512 of the RAW request
 * body, keyed with the Paystack secret key. Must run against the raw,
 * unparsed body — not a re-serialized JSON.stringify(parsedBody), which can
 * legitimately produce a different byte sequence than what Paystack signed.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha512", getSecretKey()).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const givenBuf = Buffer.from(signatureHeader, "hex");
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

export function generateOrderReference(): string {
  return `fxuni_${crypto.randomUUID().replace(/-/g, "")}`;
}
