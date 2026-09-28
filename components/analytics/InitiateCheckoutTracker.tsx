"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a Meta Pixel InitiateCheckout event on a genuine checkout-form
 * submit — attaches a native `submit` listener directly to the checkout
 * form (id="checkout-form", see app/get-started/page.tsx) rather than
 * wrapping the form in a client onSubmit handler, so the form's existing
 * Server Action (initializeCheckoutAction) is completely untouched: this
 * component only ever OBSERVES the submit, never intercepts, delays, or
 * prevents it.
 *
 * Deliberately browser-only — no server-side Conversions API counterpart.
 * Unlike Purchase (which needs a durable, provider-verified signal that
 * survives even if the student's browser never gets a response back — see
 * lib/payments/access-activation.ts), "the student clicked the checkout
 * button" is not a fact this app's server ever independently re-verifies,
 * so there is nothing to deduplicate a CAPI call against and no reason to
 * add one.
 *
 * value/currency/content come from THIS PAGE's own server-resolved pricing
 * (app/get-started/page.tsx's `pricing`/`activeCurrency` — the exact same
 * numbers the form is about to submit to checkout-action.ts), never
 * hardcoded. Fires for every checkout submit regardless of payment method
 * (local/crypto) or provider (Paystack/Korapay/NOWPayments/Test) — the
 * click itself is the signal, independent of which rail eventually
 * processes it.
 *
 * payment_method is read directly from the form's own checked radio
 * (name="payment_method", value "local" | "crypto" — see
 * app/get-started/page.tsx's CheckoutPanel) at the moment of submit, not
 * passed down as a prop — the form is the single source of truth for what
 * was actually selected, and this way the tracker never needs to be told
 * about a selection change separately. Omitted entirely for a test-account
 * checkout (that form renders no payment-method radios at all — see
 * CheckoutPanel's `paymentProvider === "test"` branch), so `undefined`
 * there is correct, not a bug.
 *
 * alreadyFiredThisMount guards only against firing this pixel call more
 * than once per page load (e.g. a double-click on the submit button) — it
 * does not, and must not, block the form's own submit in any way.
 */
export function InitiateCheckoutTracker({
  formId,
  valueMajorUnits,
  currency,
  contentName,
  contentId,
}: {
  formId: string;
  valueMajorUnits: number;
  currency: string;
  contentName: string;
  contentId: string;
}) {
  const alreadyFiredThisMount = useRef(false);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;

    const handleSubmit = () => {
      if (alreadyFiredThisMount.current) return;
      alreadyFiredThisMount.current = true;

      const selectedMethod = form.querySelector<HTMLInputElement>('input[name="payment_method"]:checked')?.value;

      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "InitiateCheckout", {
          value: valueMajorUnits,
          currency,
          content_name: contentName,
          content_type: "product",
          content_ids: [contentId],
          ...(selectedMethod ? { payment_method: selectedMethod } : {}),
        });
      }
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [formId, valueMajorUnits, currency, contentName, contentId]);

  return null;
}
