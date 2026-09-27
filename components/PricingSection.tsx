import { pricing, pricingFomo } from "@/lib/course-data";
import { getSiteContent } from "@/lib/content";
import { resolvePricing } from "@/lib/pricing";
import { resolveActiveCurrency } from "@/lib/payments/provider";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { PricingCard } from "./PricingCard";
import { ChartTexture } from "./visuals/ChartTexture";

/**
 * Resolves the public price for whichever currency is actually active
 * (resolveActiveCurrency() — server-side, admin-controlled, never anything
 * the browser could influence; see lib/payments/provider.ts). Falls back to
 * the NGN price if the active currency's price hasn't been configured yet
 * (resolvePricing(currency) throws in that case — see lib/pricing.ts) —
 * this is a public landing page with no error state to show a visitor, so
 * an admin switching to USD before setting a USD price must never leave
 * this section blank or broken; it shows the last-known-good (NGN) price
 * instead, exactly like resolveActiveCurrency() itself fails closed to NGN
 * on an unreadable setting. This never happens today: production's active
 * currency is NGN, which is always configured.
 */
async function resolveActivePricing() {
  const activeCurrency = await resolveActiveCurrency();
  try {
    return await resolvePricing(activeCurrency);
  } catch {
    return resolvePricing();
  }
}

/**
 * Purely visual pass (Final Premium Landing Page Redesign, req. #10): a
 * dark section with a subtle chart texture, matching the reference's
 * "premium pricing" treatment. Every price/discount/countdown value below
 * still comes straight from resolveActivePricing() — nothing here
 * recomputes or hardcodes any of it, and PricingCard (the actual
 * pricing/checkout logic) is untouched. Uses the same
 * resolveActiveCurrency() + resolvePricing(currency) architecture as
 * app/get-started/page.tsx, so the public landing page and the signed-in
 * checkout page always agree on which currency's price is shown.
 */
export async function PricingSection() {
  const [pricingState, content] = await Promise.all([resolveActivePricing(), getSiteContent()]);

  return (
    <section id="pricing" className="relative overflow-hidden bg-ink-950 py-20 sm:py-24">
      <ChartTexture />
      <Container className="relative">
        <SectionHeading
          eyebrow={pricing.eyebrow}
          headline={pricing.headline}
          subheadline={pricing.subheadline}
          tone="dark"
        />

        <Reveal className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-xl font-semibold text-white sm:text-2xl">{pricingFomo.headline}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-300 sm:text-base">{pricingFomo.body}</p>
          <p className="mt-3 text-sm font-medium text-ink-200">{pricingFomo.scopeLine}</p>
        </Reveal>

        <PricingCard pricingState={pricingState} billingNote={content.pricing_billing_note} />

        <Reveal delay={80} className="mx-auto mt-10 max-w-xl text-center">
          <p className="text-base font-semibold text-white">{pricingFomo.nextStepHeadline}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">{pricingFomo.nextStepBody}</p>
          {pricingState.isPromoActive ? (
            <p className="mt-4 text-sm font-medium text-brand-300">
              Special enrollment pricing is available for a limited time. Once the offer ends, the course returns to{" "}
              {pricingState.regularPriceFormatted}.
            </p>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
