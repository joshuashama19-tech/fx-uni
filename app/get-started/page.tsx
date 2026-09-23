import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkCourseAccess } from "@/lib/access";
import { signInAction } from "@/lib/auth/actions";
import { initializeCheckoutAction } from "@/lib/payments/checkout-action";
import { siteConfig } from "@/lib/course-data";
import { getSiteContent } from "@/lib/content";
import { resolvePricing } from "@/lib/pricing";
import { Container } from "@/components/ui/Container";
import { IconArrowRight, IconAlert, IconMail } from "@/components/icons";
import { SignupForm } from "@/components/auth/SignupForm";
import { PasswordField } from "@/components/auth/PasswordField";

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
};

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

  const pricingState = await resolvePricing();
  const content = await getSiteContent();
  const next = params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/learn";

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

          {params.error ? (
            <p className="mb-5 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{params.error}</p>
          ) : null}

          {user ? (
            <CheckoutPanel email={user.email ?? ""} pricing={pricingState} billingNote={content.pricing_billing_note} />
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
}: {
  icon: ReactNode;
  title: string;
  body: string;
  tone?: "info" | "warning";
}) {
  const colors = tone === "warning" ? "bg-brand-50 text-brand-700" : "bg-ink-50 text-ink-700";
  return (
    <div className={`mb-6 flex gap-3 rounded-lg px-4 py-3.5 ${colors}`}>
      <span className="mt-0.5 flex-none">{icon}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function CheckoutPanel({
  email,
  pricing,
  billingNote,
}: {
  email: string;
  pricing: Awaited<ReturnType<typeof resolvePricing>>;
  billingNote: string;
}) {
  return (
    <div>
      <p className="text-sm text-ink-500">Signed in as</p>
      <p className="mb-6 font-medium text-ink-900">{email}</p>

      <div className="mb-6 rounded-xl border border-ink-100 bg-ink-50 p-4">
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
      </div>

      <form action={initializeCheckoutAction}>
        <button
          type="submit"
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
        >
          Continue to secure payment
          <IconArrowRight className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-ink-500">
        You&apos;ll be redirected to Paystack to complete payment securely. Access unlocks automatically once
        payment is confirmed.
      </p>

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
