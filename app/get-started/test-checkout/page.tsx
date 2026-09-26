import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMinorUnits } from "@/lib/pricing";
import { simulateTestPaymentAction } from "@/lib/payments/test-checkout-actions";
import { Container } from "@/components/ui/Container";
import { IconAlert } from "@/components/icons";
import type { OrderRow } from "@/lib/types";

export const metadata: Metadata = { title: "Test Checkout" };

// In-app stand-in for Korapay's/Paystack's own hosted checkout page, reached
// only via lib/payments/test-provider.ts's initializeCharge() — which only
// ever runs for a test account's order (payment_provider='test'). Never
// reachable for a real order: the query below only ever finds a row here
// when is_test/payment_provider='test' both hold, and RLS (orders_select_own)
// means it can only ever be READ back by the same user who owns it, so
// nothing here trusts the query string beyond "which order to look up".
//
// The actual "charge" is decided entirely by which button the test account
// clicks — lib/payments/test-checkout-actions.ts's simulateTestPaymentAction
// re-verifies every invariant (ownership, is_test, pending) itself before
// writing anything, exactly like the real webhook/return-verify flow never
// trusts its own trigger alone.
export default async function TestCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  if (!reference) {
    redirect("/get-started");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/get-started");
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("paystack_reference", reference)
    .maybeSingle<OrderRow>();

  if (
    !order ||
    order.user_id !== user.id ||
    !order.is_test ||
    order.payment_provider !== "test" ||
    order.status !== "pending"
  ) {
    redirect(
      `/get-started?error=${encodeURIComponent("This test checkout session is no longer valid.")}`
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-5 py-16">
      <Container className="max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
            <IconAlert className="h-5 w-5 flex-none" />
            <p>
              <span className="font-semibold">Test Mode.</span> No real payment provider is involved and no money
              moves. This page only exists for this test account.
            </p>
          </div>

          <h1 className="text-xl font-semibold text-ink-950">Simulated checkout</h1>
          <p className="mt-1 text-sm text-ink-500">
            Choose the outcome you want this checkout to resolve to. Whichever you pick runs through the exact same
            verification and course-access flow a real Korapay/Paystack payment would.
          </p>

          <div className="mt-6 rounded-xl border border-ink-100 bg-ink-50 p-4">
            <p className="text-sm text-ink-500">Amount</p>
            <p className="mt-1 text-2xl font-semibold text-ink-950">
              {formatMinorUnits(order.amount_minor_units, order.currency)}
            </p>
            <p className="mt-2 font-mono text-xs text-ink-400">{reference}</p>
          </div>

          <div className="mt-6 space-y-3">
            <form action={simulateTestPaymentAction}>
              <input type="hidden" name="reference" value={reference} />
              <input type="hidden" name="outcome" value="success" />
              <button
                type="submit"
                className="w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow hover:bg-brand-700"
              >
                Simulate successful payment
              </button>
            </form>
            <form action={simulateTestPaymentAction}>
              <input type="hidden" name="reference" value={reference} />
              <input type="hidden" name="outcome" value="failed" />
              <button
                type="submit"
                className="w-full rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50"
              >
                Simulate failed payment
              </button>
            </form>
            <form action={simulateTestPaymentAction}>
              <input type="hidden" name="reference" value={reference} />
              <input type="hidden" name="outcome" value="cancelled" />
              <button
                type="submit"
                className="w-full rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-500 hover:bg-ink-50"
              >
                Simulate cancelled checkout
              </button>
            </form>
          </div>
        </div>
      </Container>
    </main>
  );
}
