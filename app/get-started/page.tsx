import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkCourseAccess } from "@/lib/access";
import { signInAction } from "@/lib/auth/actions";
import { initializeCheckoutAction, applyDiscountCodeAction } from "@/lib/payments/checkout-action";
import {
  resolvePaymentProvider,
  resolveCheckoutMethodSettings,
  resolveActiveCurrency,
  providerSupportsCurrency,
  type PaymentProvider,
  type CheckoutMethod,
} from "@/lib/payments/provider";
import { siteConfig } from "@/lib/course-data";
import { getSiteContent } from "@/lib/content";
import { resolvePricing, formatMinorUnits } from "@/lib/pricing";
import { validateDiscountCode } from "@/lib/discounts";
import type { ProfileRow, Currency } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { IconArrowRight, IconAlert, IconMail } from "@/components/icons";
import { SignupForm } from "@/components/auth/SignupForm";
import { PasswordField } from "@/components/auth/PasswordField";

// resolvePricing(currency) throws when that currency's price hasn't been
// configured yet on /admin/pricing (see lib/pricing.ts) — this page needs
// to render a clear "not fully configured" state rather than a broken
// checkout attempt, so a thrown error here is caught and treated as "no
// price available" rather than crashing the whole page.
async function tryResolvePricing(currency: Currency) {
  try {
    return await resolvePricing(currency);
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: "Get Started",
  description: "Create your account and get secure access to FX University.",
};

type SearchParams = {
  mode?: string;
  error?: string;
  status?: string;
  email?: string;
  next?: string;
  discount?: string;
  discount_error?: string;
};

interface DiscountPreview {
  code: string;
  discountAmountFormatted: string;
  payableFormatted: string;
}

export default async function GetStartedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const access = await checkCourseAccess();
    if (access.authorized) {
      redirect("/learn");
    }
  }

  const content = await getSiteContent();
  // Only resolved for a signed-in visitor (CheckoutPanel is the only
  // consumer) — matches the original behavior of not touching this at all
  // on the signed-out auth screen. Mirrors checkout-action.ts's own
  // decision exactly: a test account's provider is always 'test', decided
  // directly from profiles.is_test, and resolvePaymentProvider() (Production's/
  // Preview's own active-provider setting) is never even called for one —
  // otherwise this copy could show "Paystack"/"Korapay" right before the
  // student is actually sent to the in-app simulated checkout.
  let paymentProvider: PaymentProvider = "paystack";
  // Whether Crypto Payment is offered at all, and which method is
  // preselected — a genuinely separate axis from paymentProvider above
  // (which still only ever means the LOCAL rail). Left at these safe
  // defaults (crypto not offered, local preselected) for a test account and
  // for a signed-out visitor, exactly mirroring how paymentProvider itself
  // is only ever resolved for a signed-in, non-test user — see
  // lib/payments/checkout-action.ts's identical isTestAccount short-circuit.
  let cryptoEnabled = false;
  // Fails closed to true, mirroring resolveCheckoutMethodSettings()'s own
  // fail-closed default — local has always been the guaranteed-available
  // rail, so a signed-out visitor or a test account (neither of which ever
  // calls that resolver) sees the same safe assumption a real,
  // non-test-account checkout would fall back to on an unreadable/missing
  // row. See supabase/migrations/20260927140054_local_payments_toggle.sql.
  let localEnabled = true;
  let effectiveDefaultMethod: CheckoutMethod = "local";
  // Fails closed to NGN, mirroring resolveActiveCurrency()'s own fail-closed
  // default and every other setting above — a signed-out visitor or (before
  // it's resolved below) a test account sees the same safe assumption a
  // real checkout would fall back to on an unreadable/missing row. See
  // supabase/migrations/20260927190000_payment_currency.sql.
  let activeCurrency: Currency = "NGN";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_test")
      .eq("id", user.id)
      .maybeSingle<Pick<ProfileRow, "is_test">>();
    const isTestAccount = profile?.is_test === true;
    paymentProvider = isTestAccount ? "test" : await resolvePaymentProvider();
    // Resolved for every signed-in user, test accounts included — Test
    // Mode is isolated from real providers, but must still respect the
    // active-currency setting so NGN and USD can both be simulated (see
    // lib/payments/test-provider.ts and the currency spec's Test Mode
    // section).
    activeCurrency = await resolveActiveCurrency();
    if (!isTestAccount) {
      const checkoutSettings = await resolveCheckoutMethodSettings();
      // Gated by providerSupportsCurrency in addition to the admin's
      // on/off toggle — a method the admin left "on" is still hidden if
      // the active provider genuinely can't process the active currency
      // (e.g. Korapay + USD). Mirrors the exact same gate
      // lib/payments/checkout-action.ts applies server-side, so this page
      // never shows an option that action would refuse anyway.
      cryptoEnabled = checkoutSettings.cryptoEnabled && providerSupportsCurrency("nowpayments", activeCurrency);
      localEnabled = checkoutSettings.localEnabled && providerSupportsCurrency(paymentProvider, activeCurrency);
      // The required fallback: a default of "crypto" while crypto is
      // disabled (by the toggle OR by this currency gate) must never
      // preselect (or expose) a broken option — it silently becomes
      // "local" instead. See lib/payments/provider.ts's
      // resolveCheckoutMethodSettings() doc comment for why this one-line
      // rule lives at each call site rather than inside that function.
      effectiveDefaultMethod = checkoutSettings.defaultMethod === "crypto" && cryptoEnabled ? "crypto" : "local";
    }
  }
  const pricingState = await tryResolvePricing(activeCurrency);
  const next = params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/learn";

  // Re-validates the code from the `?discount=` query string (set by
  // applyDiscountCodeAction) fresh on every render, purely to show an
  // accurate price breakdown — never trusted as-is for the actual charge.
  // initializeCheckoutAction re-validates it a second, completely
  // independent time when the student actually submits checkout.
  let discountPreview: DiscountPreview | null = null;
  if (user && params.discount && pricingState) {
    const validation = await validateDiscountCode(
      params.discount,
      user.id,
      pricingState.payableMinorUnits,
      activeCurrency
    );
    if (validation.valid) {
      discountPreview = {
        code: validation.discount.code,
        discountAmountFormatted: formatMinorUnits(validation.discountAmountMinorUnits, pricingState.currency),
        payableFormatted: formatMinorUnits(validation.finalAmountMinorUnits, pricingState.currency),
      };
    }
    // An invalid code in the query string (expired since it was applied,
    // usage limit hit in the meantime, or a hand-edited URL) just silently
    // falls back to full price here — the student sees the real price and
    // can re-apply; initializeCheckoutAction is what actually refuses to
    // charge on a bad code, with an explicit error.
  }

  return (
    <main id="main-content" className="min-h-screen bg-ink-950 py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">{siteConfig.name}</p>
          <h1 className="mx-auto mt-3 max-w-sm text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {user ? "You're almost in." : "Create your account to get started."}
          </h1>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          {params.status === "verify-email" ? (
            <StatusPanel
              icon={<IconMail className="h-5 w-5" />}
              title="Check your email"
              body={`We sent a confirmation link to ${params.email ?? "your email address"}. Click it to activate your account, then come back here.`}
              note="Can't find it? Check your Spam, Junk, or Promotions folder."
            />
          ) : params.status === "no-access" ? (
            <StatusPanel
              icon={<IconAlert className="h-5 w-5" />}
              title="Payment required"
              body="Your account doesn't have active course access yet. Complete payment below to unlock it."
              tone="warning"
            />
          ) : params.status === "revoked" ? (
            <StatusPanel
              icon={<IconAlert className="h-5 w-5" />}
              title="Access no longer active"
              body="Your course access was revoked. Contact support if you believe this is a mistake."
              tone="warning"
            />
          ) : null}

          {params.error || params.discount_error ? (
            <div className="mb-5 space-y-1.5 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {params.error ? <p>{params.error}</p> : null}
              {params.discount_error ? <p>{params.discount_error}</p> : null}
            </div>
          ) : null}

          {user ? (
            <CheckoutPanel
              email={user.email ?? ""}
              pricing={pricingState}
              activeCurrency={activeCurrency}
              billingNote={content.pricing_billing_note}
              discountPreview={discountPreview}
              paymentProvider={paymentProvider}
              cryptoEnabled={cryptoEnabled}
              localEnabled={localEnabled}
              effectiveDefaultMethod={effectiveDefaultMethod}
            />
          ) : (
            <AuthPanel mode={params.mode === "login" ? "login" : "signup"} next={next} />
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link href="/course#pricing" className="underline underline-offset-2 hover:text-ink-300">
            Back to the course page
          </Link>
        </p>
      </Container>
    </main>
  );
}

function StatusPanel({
  icon,
  title,
  body,
  tone = "info",
  note,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  tone?: "info" | "warning";
  note?: string;
}) {
  const colors = tone === "warning" ? "bg-brand-50 text-brand-700" : "bg-ink-50 text-ink-700";
  return (
    <div className={`mb-6 flex gap-3 rounded-lg px-4 py-3.5 ${colors}`}>
      <span className="mt-0.5 flex-none">{icon}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed">{body}</p>
        {/* Only passed by the verify-email panel above — the "check your
            spam folder" tip, moved here from SignupForm so it's shown while
            the student is actually waiting for the email, not only on the
            form before it's sent. */}
        {note ? <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{note}</p> : null}
      </div>
    </div>
  );
}

// Display names for the "you'll be redirected to X" copy below — the only
// place a payment provider's name is shown to the student. Deliberately a
// small local lookup (not exported/shared) rather than baked into
// lib/payments/provider.ts, since that module is server-only wiring and has
// no reason to know about UI copy.
const PAYMENT_PROVIDER_DISPLAY_NAME: Record<PaymentProvider, string> = {
  paystack: "Paystack",
  korapay: "Korapay",
  test: "Test Mode (simulated, no real payment)",
  nowpayments: "NOWPayments",
};

function CheckoutPanel({
  email,
  pricing,
  activeCurrency,
  billingNote,
  discountPreview,
  paymentProvider,
  cryptoEnabled,
  localEnabled,
  effectiveDefaultMethod,
}: {
  email: string;
  pricing: Awaited<ReturnType<typeof resolvePricing>> | null;
  activeCurrency: Currency;
  billingNote: string;
  discountPreview: DiscountPreview | null;
  paymentProvider: PaymentProvider;
  cryptoEnabled: boolean;
  localEnabled: boolean;
  effectiveDefaultMethod: CheckoutMethod;
}) {
  // pricing is null only when the active currency has no price configured
  // yet on /admin/pricing (see tryResolvePricing() above and
  // lib/pricing.ts's resolvePricing()) — never a real order's price. Shown
  // as its own clear state rather than a broken checkout attempt; the same
  // situation is what makes initializeCheckoutAction redirect back here
  // with "checkout isn't fully configured" if this were somehow bypassed.
  if (!pricing) {
    return (
      <div>
        <p className="mb-6 text-sm text-ink-500">
          Signed in as <span className="font-medium text-ink-900">{email}</span>
        </p>
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center">
          <p className="text-sm font-semibold text-brand-700">Checkout isn&apos;t available right now</p>
          <p className="mt-1 text-sm text-brand-700">
            {activeCurrency} pricing hasn&apos;t been configured yet. Please try again shortly, or contact support
            if this continues.
          </p>
        </div>
        <p className="mt-4 text-center">
          <Link href="/account" className="text-sm text-ink-500 underline underline-offset-2 hover:text-ink-800">
            Not you? Manage account
          </Link>
        </p>
      </div>
    );
  }

  // A test account always goes straight to the in-app simulated checkout
  // (see the paymentProvider === "test" branch further down) and never
  // reaches either on/off setting — checkoutBlocked only ever applies to a
  // real, non-test checkout. Mirrors the exact guard added server-side in
  // lib/payments/checkout-action.ts; kept here too so the UI never shows a
  // submit button that server action would refuse anyway.
  const checkoutBlocked = paymentProvider !== "test" && !localEnabled && !cryptoEnabled;

  return (
    <div>
      {/* Account context — who's buying. Kept compact/muted so it doesn't
          compete with the price for attention. */}
      <p className="mb-6 text-sm text-ink-500">
        Signed in as <span className="font-medium text-ink-900">{email}</span>
      </p>

      {/* What they're buying, how much, and any active discount/promotion —
          one grouped card, in that order. */}
      <div className="mb-4 rounded-xl border border-ink-100 bg-ink-50 p-4">
        <p className="text-sm text-ink-500">{siteConfig.name} — full course</p>
        {pricing.isPromoActive ? (
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-sm text-ink-400 line-through">{pricing.regularPriceFormatted}</span>
            <span className="text-2xl font-semibold text-ink-950">{pricing.payableFormatted}</span>
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
              {pricing.discountPercent}% OFF
            </span>
          </div>
        ) : (
          <p className="mt-1 text-2xl font-semibold text-ink-950">{pricing.payableFormatted}</p>
        )}
        <p className="mt-1 text-xs text-ink-500">{billingNote}</p>

        {discountPreview ? (
          // The price above already shows the pre-discount amount, so this
          // breakdown only needs to add what's new: the discount itself and
          // the final total — not repeat the course price a second time.
          <dl className="mt-3 space-y-1 border-t border-ink-200 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">
                Discount (<span className="font-mono">{discountPreview.code}</span>)
              </dt>
              <dd className="text-brand-700">−{discountPreview.discountAmountFormatted}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt className="text-ink-900">You pay</dt>
              <dd className="text-ink-950">{discountPreview.payableFormatted}</dd>
            </div>
          </dl>
        ) : null}
      </div>

      {/* Where to enter a discount code — the one place on the site this
          happens. */}
      {!discountPreview ? (
        <form action={applyDiscountCodeAction} className="mb-6 flex gap-2">
          <label className="sr-only" htmlFor="discount_code_input">
            Discount code
          </label>
          <input
            id="discount_code_input"
            name="discount_code"
            type="text"
            placeholder="Discount code (optional)"
            autoCapitalize="characters"
            className="min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm uppercase text-ink-900 placeholder:normal-case placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
          >
            Apply
          </button>
        </form>
      ) : (
        <form action="/get-started" className="mb-6">
          <button type="submit" className="text-sm text-ink-500 underline underline-offset-2 hover:text-ink-800">
            Remove discount code
          </button>
        </form>
      )}

      {/* Which provider handles payment, directly above the one main
          action — the single button that continues to payment. A test
          account never sees a payment-method choice at all — it always
          goes straight to the in-app simulated checkout, exactly as before
          this feature existed. */}
      {paymentProvider === "test" ? (
        <p className="mb-2 text-center text-xs text-ink-500">
          Secure payment via {PAYMENT_PROVIDER_DISPLAY_NAME[paymentProvider]}.
        </p>
      ) : null}

      {checkoutBlocked ? (
        // Neither payment method is available in this environment right
        // now (an admin has turned both Local Payments and Crypto Payments
        // off — see app/admin/payment-provider/page.tsx). No form is
        // rendered at all here: there is no submit button that could create
        // an order, matching the guard
        // lib/payments/checkout-action.ts enforces server-side regardless
        // of what any request sends. This is not reachable for a test
        // account (see checkoutBlocked's own definition above).
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center">
          <p className="text-sm font-semibold text-brand-700">Checkout isn&apos;t available right now</p>
          <p className="mt-1 text-sm text-brand-700">
            Please try again shortly, or contact support if this continues.
          </p>
        </div>
      ) : (
        <form action={initializeCheckoutAction}>
          {discountPreview ? <input type="hidden" name="discount_code" value={discountPreview.code} /> : null}

          {paymentProvider !== "test" ? (
            <div className="mb-4 space-y-2">
              {/* Only ever rendered when the admin has Local Payments
                  turned on for this environment — never shown disabled,
                  never a broken option a student could pick. See
                  lib/payments/provider.ts's
                  resolveCheckoutMethodSettings() and
                  supabase/migrations/20260927140054_local_payments_toggle.sql. */}
              {localEnabled ? (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 p-3.5 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="local"
                    defaultChecked={effectiveDefaultMethod === "local"}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">Secure Online Payment</span>
                    <span className="block text-xs text-ink-500">Pay securely online</span>
                  </span>
                </label>
              ) : null}

              {/* Only ever rendered when the admin has crypto turned on for
                  this environment — never shown disabled, never a broken
                  option a student could pick. See
                  lib/payments/provider.ts's resolveCheckoutMethodSettings(). */}
              {cryptoEnabled ? (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 p-3.5 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="crypto"
                    defaultChecked={effectiveDefaultMethod === "crypto"}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">Crypto Payment</span>
                    <span className="block text-xs text-ink-500">Pay securely with cryptocurrency</span>
                  </span>
                </label>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
          >
            Continue to secure payment
            <IconArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* What happens after successful payment. */}
      {!checkoutBlocked ? (
        <p className="mt-3 text-center text-xs text-ink-500">Access unlocks automatically once payment is confirmed.</p>
      ) : null}

      <p className="mt-4 text-center">
        <Link href="/account" className="text-sm text-ink-500 underline underline-offset-2 hover:text-ink-800">
          Not you? Manage account
        </Link>
      </p>
    </div>
  );
}

function AuthPanel({ mode, next }: { mode: "signup" | "login"; next: string }) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 rounded-full bg-ink-100 p-1 text-sm font-semibold">
        <Link
          href={`/get-started?mode=signup${next !== "/learn" ? `&next=${encodeURIComponent(next)}` : ""}`}
          className={`rounded-full py-2 text-center transition-colors ${
            mode === "signup" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
          }`}
        >
          Create account
        </Link>
        <Link
          href={`/get-started?mode=login${next !== "/learn" ? `&next=${encodeURIComponent(next)}` : ""}`}
          className={`rounded-full py-2 text-center transition-colors ${
            mode === "login" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
          }`}
        >
          Log in
        </Link>
      </div>

      {mode === "signup" ? (
        <SignupForm next={next} />
      ) : (
        <form action={signInAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="redirectPath" value="/get-started" />
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <PasswordField label="Password" name="password" autoComplete="current-password" required />
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-ink-500 underline underline-offset-2 hover:text-ink-800">
              Forgot password?
            </Link>
          </div>
          <SubmitButton label="Log in" />
        </form>
      )}
    </div>
  );
}

function Field(props: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{props.label}</span>
      <input
        name={props.name}
        type={props.type}
        autoComplete={props.autoComplete}
        required={props.required}
        minLength={props.minLength}
        className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="w-full rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
    >
      {label}
    </button>
  );
}
