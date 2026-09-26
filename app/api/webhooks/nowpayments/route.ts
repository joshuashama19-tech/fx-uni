import { NextRequest, NextResponse } from "next/server";
import { verifyIpnSignature, recordNowPaymentsReference } from "@/lib/payments/nowpayments";
import { confirmSuccessfulPayment, handleNowPaymentsRefund } from "@/lib/payments/access-activation";

// Needs Node's crypto module and the service-role Supabase client — not
// Edge-runtime compatible, same as app/api/webhooks/paystack/route.ts and
// app/api/webhooks/korapay/route.ts.
export const runtime = "nodejs";

interface NowPaymentsIpnEvent {
  payment_id?: string | number;
  invoice_id?: string | number;
  order_id?: string;
  payment_status?: string;
  pay_currency?: string;
}

/**
 * NOWPayments IPN receiver — the crypto-rail counterpart to
 * app/api/webhooks/paystack/route.ts and app/api/webhooks/korapay/route.ts,
 * same structure and same security model, adapted to NOWPayments' own
 * documented scheme:
 *
 * Security model: the ONLY thing that authenticates this request as really
 * coming from NOWPayments is the x-nowpayments-sig header (HMAC-SHA512 of
 * the entire callback body, sorted alphabetically by key at every nesting
 * level, keyed with our IPN secret) — verified in
 * lib/payments/nowpayments.ts's verifyIpnSignature() before anything in the
 * payload is acted on. Even after that check passes, this handler does not
 * trust the payload's own payment_status to decide anything by itself:
 * confirmSuccessfulPayment() re-verifies directly against NOWPayments' own
 * GET /v1/payment/{id} endpoint before granting access — exactly the same
 * "trusted server-side verification" principle as the Paystack/Korapay
 * webhooks, and the same shared function (lib/payments/access-activation.ts),
 * not a parallel copy.
 *
 * order_id is the value THIS APP generated and passed to NOWPayments at
 * invoice-creation time (lib/payments/checkout-action.ts) — the same value
 * stored as orders.paystack_reference for every provider. Never NOWPayments'
 * own payment_id/invoice_id in that role; those exist purely to know which
 * NOWPayments payment to re-query (see recordNowPaymentsReference() below
 * and lib/payments/nowpayments.ts's verifyNowPaymentsPayment()).
 *
 * NOWPayments' documented payment_status values: waiting, confirming,
 * confirmed, sending, partially_paid, finished, failed, expired, refunded.
 * Every one of them is routed into the same confirmSuccessfulPayment() call
 * (which now internally knows which are non-terminal — see
 * NOWPAYMENTS_NONTERMINAL_STATUSES in lib/payments/nowpayments.ts — and
 * which terminal statuses map onto this app's own OrderStatus — see
 * mapFailureStatus() in lib/payments/access-activation.ts) EXCEPT
 * "refunded", which goes to handleNowPaymentsRefund() instead, matching how
 * the Korapay route separates charge.success from refund.success.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-nowpayments-sig");

  if (!verifyIpnSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: NowPaymentsIpnEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    // Signed but not valid JSON — acknowledge so NOWPayments doesn't retry
    // a payload that will never parse, but do nothing with it.
    return NextResponse.json({ received: true });
  }

  const eventType = event.payment_status;
  const reference = event.order_id;

  if (!eventType || !reference) {
    return NextResponse.json({ received: true });
  }

  try {
    // Record the real payment_id the moment this IPN reports one — before
    // any verification happens — so verifyNowPaymentsPayment()'s later GET
    // /v1/payment/{id} call always has a real id to query. This is the
    // first time orders.nowpayments_payment_id is ever written for this
    // order: checkout-action.ts deliberately leaves it NULL at
    // invoice-creation time (the invoice's own id is a different
    // identifier and is never stored there). See
    // lib/payments/nowpayments.ts's own doc comments for the full
    // invoice-vs-payment-id reasoning.
    if (event.payment_id) {
      await recordNowPaymentsReference({
        reference,
        paymentId: String(event.payment_id),
        payCurrency: event.pay_currency ?? null,
      });
    }

    if (eventType === "refunded") {
      await handleNowPaymentsRefund({ reference, eventType, rawPayload: event });
    } else {
      // waiting / confirming / confirmed / sending / partially_paid /
      // finished / failed / expired all route through the one shared
      // confirmSuccessfulPayment() dispatch.
      await confirmSuccessfulPayment({ reference, source: "webhook", eventType, rawPayload: event });
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    // An unexpected error while processing (not a duplicate — that's
    // handled internally and returns normally) — return 500 so NOWPayments'
    // own retry schedule gets another attempt, rather than silently losing
    // the event. Logs the message only, never NOWPAYMENTS_API_KEY/
    // NOWPAYMENTS_IPN_SECRET, which never appear in this error to begin
    // with (see lib/payments/nowpayments.ts).
    console.error("[nowpayments webhook] processing error", eventType, reference, err);
    return NextResponse.json({ error: "processing error" }, { status: 500 });
  }
}
