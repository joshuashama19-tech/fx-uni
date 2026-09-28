"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires the browser-side Meta Pixel Purchase event, then navigates on to
 * /learn. Mounted ONLY from the "granted" branch of
 * app/get-started/verify/page.tsx — i.e. only after
 * confirmSuccessfulPayment() has ACTUALLY re-verified the payment
 * server-side (against the provider's own API) and granted course access.
 * Never mounted speculatively, never on page load alone.
 *
 * eventID is set to the SAME value as the server-side Conversions API
 * Purchase call fired from lib/payments/access-activation.ts
 * (order.paystack_reference) — this is what lets Meta deduplicate the two
 * events into a single reported conversion instead of double-counting one
 * real sale. See lib/analytics/meta-capi.ts's own doc comment for the CAPI
 * side of this pairing.
 *
 * value/currency/reference are the order's own authoritative,
 * server-verified numbers (passed down from confirmSuccessfulPayment()'s
 * return value via the verify page — see ConfirmResult in
 * access-activation.ts) — never hardcoded, never re-derived client-side.
 *
 * fired guards against React StrictMode's dev-mode double-invoke firing
 * this twice; it is not a substitute for the real, order-level dedupe that
 * already guarantees this component is only ever mounted once per order
 * (the "already_processed" outcome redirects silently with no render at
 * all — see the verify page).
 *
 * Navigation is deliberately delayed slightly rather than immediate:
 * fbq()'s tracking calls are ordinary fetch/image requests, not
 * sendBeacon, so an instant client-side navigation could race ahead of the
 * request actually being sent.
 */
export function PurchaseTracker({
  reference,
  valueMajorUnits,
  currency,
  contentName,
  contentId,
  redirectTo,
}: {
  reference: string;
  valueMajorUnits: number;
  currency: string;
  contentName: string;
  contentId: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq(
        "track",
        "Purchase",
        {
          value: valueMajorUnits,
          currency,
          content_name: contentName,
          content_type: "product",
          content_ids: [contentId],
        },
        { eventID: reference }
      );
    }

    const timer = setTimeout(() => {
      router.replace(redirectTo);
    }, 1200);

    return () => clearTimeout(timer);
  }, [reference, valueMajorUnits, currency, contentName, contentId, redirectTo, router]);

  return null;
}
