import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { confirmSuccessfulPayment } from "@/lib/payments/access-activation";
import { Container } from "@/components/ui/Container";
import { IconAlert, IconCheckCircle } from "@/components/icons";
import { siteConfig } from "@/lib/course-data";

export const metadata: Metadata = { title: "Confirming Payment" };

// Paystack redirects the browser here after checkout, appending the
// transaction reference as a query param. This page's ONLY job is to ask
// confirmSuccessfulPayment() to re-verify with Paystack's API server-side —
// it never treats the mere fact of landing on this URL, or any query
// param, as proof that payment succeeded.
export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference || params.trxref;

  if (!reference) {
    redirect(`/get-started?error=${encodeURIComponent("Missing payment reference. Please try checking out again.")}`);
  }

  let outcome: Awaited<ReturnType<typeof confirmSuccessfulPayment>>["outcome"];
  try {
    const result = await confirmSuccessfulPayment({ reference, source: "return" });
    outcome = result.outcome;
  } catch {
    return (
      <StatusPage
        tone="warning"
        title="We couldn't confirm your payment"
        body="Something went wrong reaching our payment verification service. If you were charged, your access will activate automatically within a few minutes once our system reconciles it — no need to pay again. If it hasn't after 15 minutes, contact support with your payment reference."
        reference={reference}
      />
    );
  }

  if (outcome === "granted" || outcome === "already_processed") {
    redirect("/learn?welcome=1");
  }

  if (outcome === "verification_failed") {
    return (
      <StatusPage
        tone="warning"
        title="Payment not completed"
        body="Your payment wasn't completed or was declined. No charge was applied. You can try again from the checkout page."
        reference={reference}
        showRetry
      />
    );
  }

  if (outcome === "mismatch") {
    return (
      <StatusPage
        tone="warning"
        title="We couldn't verify this payment"
        body="The payment details didn't match what we expected for your order. Nothing has been charged against your access, and our team has been notified for manual review. Please contact support with your payment reference."
        reference={reference}
      />
    );
  }

  return (
    <StatusPage
      tone="warning"
      title="We couldn't find this order"
      body="This payment reference doesn't match an order we started. If you completed a payment, contact support with your reference so we can look into it."
      reference={reference}
    />
  );
}

function StatusPage({
  tone,
  title,
  body,
  reference,
  showRetry,
}: {
  tone: "success" | "warning";
  title: string;
  body: string;
  reference: string;
  showRetry?: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-5 py-16">
      <Container className="max-w-md">
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
              tone === "success" ? "bg-ink-50 text-ink-700" : "bg-brand-50 text-brand-700"
            }`}
          >
            {tone === "success" ? <IconCheckCircle className="h-6 w-6" /> : <IconAlert className="h-6 w-6" />}
          </div>
          <h1 className="mt-4 text-xl font-semibold text-ink-950">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{body}</p>
          <p className="mt-4 text-xs text-ink-400">Reference: {reference}</p>
          <div className="mt-6">
            <Link
              href={showRetry ? "/get-started" : "/course#pricing"}
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow hover:bg-brand-700"
            >
              {showRetry ? "Try again" : `Back to ${siteConfig.name}`}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
