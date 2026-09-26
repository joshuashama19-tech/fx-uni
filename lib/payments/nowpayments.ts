import "server-only";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRow } from "@/lib/types";

// Thin NOWPayments REST adapter — the crypto-rail counterpart to
// lib/payments/paystack.ts/korapay.ts, kept completely separate from both
// (same reasoning as those files: adding/swapping a provider should only
// ever touch one adapter file). No SDK dependency; plain HTTPS + JSON,
// signature verification via Node's built-in `crypto`.
//
// Integration surface used: NOWPayments' Invoice API (POST /v1/invoice),
// which returns a hosted `invoice_url` to redirect the browser to — the
// same "server creates the charge, browser is redirected to a
// provider-hosted page" shape as Paystack's /transaction/initialize and
// Korapay's /charges/initialize, deliberately chosen over the plain
// Payment API (POST /v1/payment) so the crypto-currency choice (USDT vs
// USDC vs others) is left entirely to NOWPayments' own hosted page — this
// app never renders a coin picker of its own (confirmed with Josh before
// implementation).
//
// Sourced from NOWPayments' current documentation (help.nowpayments.io /
// nowpayments.zendesk.com, fetched during implementation — see the
// implementation-plan's "Open items" section for exactly what was
// confirmed): POST /v1/invoice's request/response fields, GET
// /v1/payment/{id}'s payment_status enum, and the x-nowpayments-sig IPN
// signature recipe. Nothing about NOWPayments' API is assumed beyond what
// that documentation stated.

const NOWPAYMENTS_API_BASE = "https://api.nowpayments.io/v1";

function getApiKey(): string {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) {
    throw new Error("NOWPAYMENTS_API_KEY is not set. Payment operations cannot proceed without it — see .env.example.");
  }
  return key;
}

function getIpnSecret(): string {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) {
    throw new Error(
      "NOWPAYMENTS_IPN_SECRET is not set. IPN verification cannot proceed without it — see .env.example."
    );
  }
  return secret;
}

function toMajorUnits(amountMinorUnits: number): number {
  return Math.round(amountMinorUnits) / 100;
}

export interface InitializePaymentParams {
  amountMinorUnits: number;
  currency: string;
  orderId: string; // our own order reference — same value as orders.paystack_reference
  orderDescription?: string;
  successUrl: string;
  cancelUrl: string;
  ipnCallbackUrl: string;
}

export interface InitializePaymentResult {
  invoiceId: string;
  checkoutUrl: string;
}

/**
 * POST /v1/invoice — creates a hosted crypto-invoice. Returns the URL to
 * redirect the browser to; NOWPayments collects the crypto-currency choice
 * and deposit address on its own hosted page, so this codebase never
 * touches wallet addresses or private keys.
 *
 * price_amount/price_currency are this order's own authoritative fiat
 * amount (from lib/pricing.ts via lib/payments/checkout-action.ts's
 * baseAmountMinorUnits/amountMinorUnits — the same values every other
 * provider adapter is called with) — never a hard-coded or separately
 * re-resolved amount. pay_currency is deliberately omitted: NOWPayments'
 * hosted invoice page itself lets the payer pick from its supported
 * cryptocurrencies (USDT, USDC, and others), matching the "USDT/USDC/
 * supported cryptocurrencies" copy on /get-started without this app
 * building its own coin picker.
 */
export async function initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
  const res = await fetch(`${NOWPAYMENTS_API_BASE}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: toMajorUnits(params.amountMinorUnits),
      price_currency: params.currency.toLowerCase(),
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: params.ipnCallbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.id || !json?.invoice_url) {
    throw new Error(`NOWPayments invoice creation failed: ${json?.message ?? res.statusText}`);
  }

  return {
    invoiceId: String(json.id),
    checkoutUrl: json.invoice_url,
  };
}

export interface GenericVerifyResultShape {
  success: boolean;
  status: string;
  amountMinorUnits: number;
  currency: string;
}

// Statuses that mean "no final outcome yet" — NOWPayments' documented
// lifecycle for a crypto payment (waiting -> confirming -> confirmed ->
// sending -> finished), plus partially_paid/failed/expired/refunded as the
// terminal outcomes. See mapFailureStatus() in
// lib/payments/access-activation.ts for how the terminal failure statuses
// map onto this app's own OrderStatus, and confirmSuccessfulPayment()'s own
// non-terminal check for why this set matters: unlike Paystack/Korapay/Test
// (whose verify APIs only ever report a final state by the time the
// student's browser reaches /get-started/verify), a NOWPayments payment can
// still be waiting/confirming/confirmed/sending when the student returns
// from the hosted invoice page, and that must never be treated as a final
// failure OR silently deduped into a premature grant on a repeat visit.
export const NOWPAYMENTS_NONTERMINAL_STATUSES = new Set(["waiting", "confirming", "confirmed", "sending"]);

/**
 * Re-verifies a NOWPayments payment directly against GET
 * /v1/payment/{payment_id} — the trusted, server-side source of truth,
 * exactly like verifyTransaction()/verifyCharge() for the other two real
 * providers. Called both from the checkout-return page and from the
 * NOWPayments webhook handler; neither ever trusts the IPN payload's own
 * payment_status on its own (see lib/payments/access-activation.ts).
 *
 * Looked up by this order's own paystack_reference (== the order_id this
 * app passed to NOWPayments at invoice-creation time) — the internal order
 * remains the source of truth for matching, never NOWPayments' own id in
 * the other direction.
 *
 * A wrinkle specific to the Invoice API: at invoice-creation time there is
 * no payment yet — only an invoice — so checkout-action.ts records the
 * invoice's own id as a placeholder (see set_order_nowpayments_reference()
 * in supabase/migrations/0014_nowpayments.sql), which is not a valid
 * payment_id to query GET /v1/payment/{id} with. orders.nowpayments_payment_id
 * only becomes a real, queryable payment id once NOWPayments' first IPN for
 * this order reports one — app/api/webhooks/nowpayments/route.ts overwrites
 * it via recordNowPaymentsReference() (below), using the admin client,
 * before any verification happens. If this function is called (e.g. the
 * student's browser returns from the hosted invoice page) before that has
 * happened yet, either the id is still the placeholder invoice id (the GET
 * below 404s) or genuinely unset — both are reported as the neutral,
 * non-terminal "waiting" status rather than an error, since the practical
 * meaning is identical: NOWPayments hasn't matched a payment to this
 * invoice yet.
 * amountMinorUnits/currency compare against the FIAT side of NOWPayments'
 * response (price_amount/price_currency — what the student was quoted),
 * never the crypto-denominated pay_amount/pay_currency, which is a
 * different number entirely.
 */
export async function verifyNowPaymentsPayment(reference: string): Promise<GenericVerifyResultShape> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("nowpayments_payment_id, amount_minor_units, currency")
    .eq("paystack_reference", reference)
    .maybeSingle<Pick<OrderRow, "nowpayments_payment_id" | "amount_minor_units" | "currency">>();

  if (!order?.nowpayments_payment_id) {
    // No payment matched to this invoice yet (see doc comment above) — not
    // an error, just not started/confirmed on NOWPayments' side yet.
    return {
      success: false,
      status: "waiting",
      amountMinorUnits: order?.amount_minor_units ?? 0,
      currency: order?.currency ?? "",
    };
  }

  const res = await fetch(`${NOWPAYMENTS_API_BASE}/payment/${encodeURIComponent(order.nowpayments_payment_id)}`, {
    method: "GET",
    headers: { "x-api-key": getApiKey() },
    cache: "no-store",
  });

  if (res.status === 404) {
    // The stored id doesn't (yet) resolve to a real payment — same
    // "nothing to verify yet" case as above, most likely because we only
    // ever saw the invoice's own id and no payment has actually started.
    return {
      success: false,
      status: "waiting",
      amountMinorUnits: order.amount_minor_units,
      currency: order.currency,
    };
  }

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.payment_status) {
    throw new Error(`NOWPayments verify failed: ${json?.message ?? res.statusText}`);
  }

  return {
    success: json.payment_status === "finished",
    status: json.payment_status,
    amountMinorUnits: Math.round(Number(json.price_amount) * 100),
    currency: String(json.price_currency ?? "").toUpperCase(),
  };
}

/**
 * Verifies the `x-nowpayments-sig` header. Per NOWPayments' own documented
 * scheme ("IPN and how to setup"): the callback body is sorted alphabetically
 * by key at every nesting level, JSON-serialized with no extra whitespace,
 * then hashed with HMAC-SHA512 keyed with the IPN secret — deliberately
 * different from both Paystack (HMAC-SHA512 of the RAW body) and Korapay
 * (HMAC-SHA256 of only the `data` sub-object): NOWPayments signs the
 * *entire*, key-sorted body.
 */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function verifyIpnSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return false;
  }

  const sortedJson = JSON.stringify(sortKeysDeep(parsed));
  const expected = crypto.createHmac("sha512", getIpnSecret()).update(sortedJson).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const givenBuf = Buffer.from(signatureHeader, "hex");
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

/**
 * Overwrites NOWPayments' own payment id (and, once known, the crypto asset
 * used) onto this order — called from app/api/webhooks/nowpayments/route.ts,
 * using the admin client, the first time an IPN reports a real payment_id
 * for this order. lib/payments/checkout-action.ts already records the
 * invoice's own id right after creation (via the set_order_nowpayments_reference
 * RPC — see supabase/migrations/0014_nowpayments.sql — since that action
 * runs as the authenticated user, never the admin client), but there is no
 * actual *payment* yet at that point (see verifyNowPaymentsPayment()'s doc
 * comment above), so this function's job is specifically to replace that
 * placeholder with the real, queryable payment_id the moment one exists —
 * before any verification happens, so verifyNowPaymentsPayment()'s GET
 * /v1/payment/{id} call always has a real id to query from then on. Never
 * called from anything reachable by the browser; the admin client already
 * bypasses RLS, so no RPC/SECURITY DEFINER function is needed for this
 * particular write.
 *
 * Throws — rather than silently ignoring a failed or no-op write — on
 * either a Supabase error OR on the update matching zero rows. This
 * matters specifically because the caller
 * (app/api/webhooks/nowpayments/route.ts) calls this BEFORE dispatching to
 * confirmSuccessfulPayment()/handleNowPaymentsRefund(): if the real
 * payment_id from this IPN never actually gets persisted, a later
 * verifyNowPaymentsPayment() call would keep querying the stale
 * invoice-id placeholder (or nothing at all) and could never re-discover
 * the correct payment to verify against. Letting that failure pass
 * silently would let the webhook route go on to acknowledge (200) an IPN
 * whose payment reference was never actually stored — throwing here
 * instead propagates up to that route's own catch block, which returns
 * 500 so NOWPayments retries the same IPN rather than the event being
 * lost. A zero-row match (order not found for this reference, or found
 * but not payment_provider = 'nowpayments') is treated the same as a
 * database error for this same reason — this function's whole job is
 * "this specific reference now has this payment_id on record", and it must
 * not return successfully unless that's actually true.
 */
export async function recordNowPaymentsReference(params: {
  reference: string;
  paymentId: string;
  payCurrency?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({
      nowpayments_payment_id: params.paymentId,
      ...(params.payCurrency ? { pay_currency: params.payCurrency } : {}),
    })
    .eq("paystack_reference", params.reference)
    .eq("payment_provider", "nowpayments")
    .select("id");

  if (error) {
    throw new Error(
      `recordNowPaymentsReference: failed to persist NOWPayments payment_id for order reference "${params.reference}": ${error.message}`
    );
  }

  if (!data || data.length === 0) {
    throw new Error(
      `recordNowPaymentsReference: no pending nowpayments order matched reference "${params.reference}" — payment_id "${params.paymentId}" was NOT recorded. Refusing to treat this as a successful write.`
    );
  }
}
