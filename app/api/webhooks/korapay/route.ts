import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/korapay";
import { confirmSuccessfulPayment, handleKorapayRefund, handleKorapayChargebackLoss } from "@/lib/payments/access-activation";

// Needs Node's crypto module and the service-role Supabase client — not
// Edge-runtime compatible, same as app/api/webhooks/paystack/route.ts.
export const runtime = "nodejs";

/**
 * Korapay webhook receiver — the Korapay counterpart to
 * app/api/webhooks/paystack/route.ts, same structure and same security
 * model, adapted to Korapay's own documented scheme
 * (https://developers.korapay.com/docs/webhooks):
 *
 * Security model: the ONLY thing that authenticates this request as really
 * coming from Korapay is the x-korapay-signature header (HMAC-SHA256 of the
 * JSON-serialized `data` object, keyed with our Korapay secret key) —
 * verified in lib/payments/korapay.ts's verifyWebhookSignature() before
 * anything in the payload is acted on. Even after that check passes, this
 * handler does not trust the payload's own "status"/"event" fields to
 * decide anything by itself: confirmSuccessfulPayment() re-verifies the
 * charge directly against Korapay's GET /charges/:reference endpoint
 * before granting access — exactly the same "trusted server-side
 * verification" principle as the Paystack webhook, and the same shared
 * function (lib/payments/access-activation.ts), not a parallel copy.
 *
 * Korapay's own documented webhook events used here: charge.success,
 * refund.success (see handleKorapayRefund's own comment for why
 * refund.failed is deliberately not routed anywhere), and two of the five
 * documented chargeback events — chargeback.lost and
 * chargeback.auto_accepted (see handleKorapayChargebackLoss's own comment
 * for exactly why those two and not chargeback.pending/declined/partial).
 * charge.failed, refund.failed, transfer.success, transfer.failed, and the
 * three non-loss chargeback events are all acknowledged and ignored, same
 * pattern as the Paystack route.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-korapay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: { reference?: string; payment?: { reference?: string } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    // Signed but not valid JSON — acknowledge so Korapay doesn't retry a
    // payload that will never parse, but do nothing with it.
    return NextResponse.json({ received: true });
  }

  const eventType = event.event;

  if (!eventType) {
    return NextResponse.json({ received: true });
  }

  try {
    if (eventType === "chargeback.lost" || eventType === "chargeback.auto_accepted") {
      // Chargeback payloads carry TWO references: data.reference is the
      // chargeback's own id (e.g. "KPY-CHG-..."), and data.payment.reference
      // is the ORIGINAL order's reference (the one this app generated at
      // checkout) — see handleKorapayChargebackLoss's own comment. Only
      // data.payment.reference identifies an order; data.reference is used
      // solely for idempotency.
      const orderReference = event.data?.payment?.reference;
      const chargebackReference = event.data?.reference;
      if (!orderReference || !chargebackReference) {
        return NextResponse.json({ received: true });
      }
      await handleKorapayChargebackLoss({ orderReference, chargebackReference, eventType, rawPayload: event });
      return NextResponse.json({ received: true });
    }

    // Every other handled event type (charge.success, refund.success)
    // carries the order's own reference directly at data.reference — see
    // the Checkout Redirect docs' sample payload:
    // "reference": "merchant-payment-referece-001". The same value this
    // app generated via generateOrderReference() and stored as
    // orders.paystack_reference at checkout time (see
    // lib/payments/checkout-action.ts). Never Korapay's own internal id.
    const reference = event.data?.reference;
    if (!reference) {
      return NextResponse.json({ received: true });
    }

    if (eventType === "charge.success") {
      await confirmSuccessfulPayment({ reference, source: "webhook", eventType, rawPayload: event });
    } else if (eventType === "refund.success") {
      await handleKorapayRefund({ reference, eventType, rawPayload: event });
    }
    // charge.failed, refund.failed, transfer.*, chargeback.pending,
    // chargeback.declined, chargeback.partial and any other event type are
    // intentionally acknowledged and ignored.
    return NextResponse.json({ received: true });
  } catch (err) {
    // An unexpected error while processing (not a duplicate — that's
    // handled internally and returns normally) — return 500 so Korapay's
    // own retry schedule ("we retry the request periodically within 72
    // hours") gets another attempt, rather than silently losing the event.
    // Recomputed from `event` (still in scope) rather than reusing the
    // `reference`/`orderReference` consts above, which are block-scoped to
    // their respective branches and not visible here.
    const debugReference = event.data?.reference ?? event.data?.payment?.reference;
    console.error("[korapay webhook] processing error", eventType, debugReference, err);
    return NextResponse.json({ error: "processing error" }, { status: 500 });
  }
}
