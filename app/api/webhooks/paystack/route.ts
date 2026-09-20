import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/paystack";
import { confirmSuccessfulPayment, handlePaystackRefundOrDispute } from "@/lib/payments/access-activation";

// Needs Node's crypto module and the service-role Supabase client — not
// Edge-runtime compatible, and doesn't need to be.
export const runtime = "nodejs";

/**
 * Paystack webhook receiver.
 *
 * Security model: the ONLY thing that authenticates this request as really
 * coming from Paystack is the x-paystack-signature header (HMAC-SHA512 of
 * the raw body, keyed with our secret key) — verified against the raw text
 * body, before any JSON parsing. Even after that check passes, this handler
 * does not trust the payload's own "status" field to decide anything by
 * itself: confirmSuccessfulPayment() re-verifies the transaction directly
 * against Paystack's /transaction/verify endpoint before granting access.
 * The webhook's real job is durability (it fires even if the student's
 * browser never returns to our callback URL), not being the sole source of
 * truth.
 *
 * There is no charge.failed webhook in Paystack's event set — a
 * pending/failed/abandoned transaction is only ever observed through the
 * checkout-return verify flow (app/get-started/verify), not here.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    // Signed but not valid JSON — acknowledge so Paystack doesn't retry a
    // payload that will never parse, but do nothing with it.
    return NextResponse.json({ received: true });
  }

  const eventType = event.event;
  const reference = event.data?.reference;

  if (!eventType || !reference) {
    return NextResponse.json({ received: true });
  }

  try {
    if (eventType === "charge.success") {
      await confirmSuccessfulPayment({ reference, source: "webhook", eventType, rawPayload: event });
    } else if (eventType.startsWith("refund.") || eventType.startsWith("charge.dispute.")) {
      await handlePaystackRefundOrDispute({ reference, eventType, rawPayload: event });
    }
    // Other event types (e.g. transfer.*) are intentionally acknowledged
    // and ignored — this app never initiates Paystack transfers.
    return NextResponse.json({ received: true });
  } catch (err) {
    // An unexpected error while processing (not a duplicate — that's
    // handled internally and returns normally) — return 500 so Paystack's
    // retry schedule (every 3 min x4, then hourly for 72h in live mode)
    // gets another attempt, rather than silently losing the event.
    console.error("[paystack webhook] processing error", eventType, reference, err);
    return NextResponse.json({ error: "processing error" }, { status: 500 });
  }
}
