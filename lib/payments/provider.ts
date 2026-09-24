import "server-only";
import type { PaymentProvider } from "@/lib/types";

export type { PaymentProvider };

// Paystack stays the default provider for every new checkout until an
// explicit admin provider-switching UI exists — that UI is a separate,
// later piece of work and is deliberately NOT built here. This constant is
// the one place that future switch would change; nothing else in this
// codebase should hardcode which provider is "the" default.
const DEFAULT_PAYMENT_PROVIDER: PaymentProvider = "paystack";

/**
 * Decides which payment provider a NEW checkout uses. Called once, from
 * lib/payments/checkout-action.ts, before either provider adapter
 * (lib/payments/paystack.ts / lib/payments/korapay.ts) is touched — this
 * is what "the selected provider is determined server-side" means: the
 * browser has no say in this (there is no request input read here at all,
 * only a server-side environment variable — see below), and there is
 * intentionally no automatic failover between providers.
 *
 * TEMPORARY, for controlled Korapay test-mode verification only: reads the
 * server-only PAYMENT_PROVIDER env var. Set to "korapay" in Vercel's
 * Preview/Development environments to route new checkouts there for
 * testing; anything else — unset, empty, "paystack", or any other value —
 * falls back to DEFAULT_PAYMENT_PROVIDER. No Production value is set for
 * this variable, so Production keeps hitting that same fallback and stays
 * on Paystack. This is a stand-in for the real admin provider-switching UI
 * (still not built here, deliberately) and should be removed once that UI
 * exists — at that point this function should read the admin-configured
 * choice instead of an env var.
 *
 * An already-existing order's provider is never re-derived by calling this
 * again — it's read from the order's own `payment_provider` column
 * instead (see lib/payments/access-activation.ts), since resolving it
 * fresh at verification time could disagree with what a checkout actually
 * used if this env var (or, later, the admin setting) changes in between.
 */
export function resolvePaymentProvider(): PaymentProvider {
  if (process.env.PAYMENT_PROVIDER === "korapay") {
    return "korapay";
  }
  return DEFAULT_PAYMENT_PROVIDER;
}
