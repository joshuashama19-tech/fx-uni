import { pricing, pricingFomo } from "@/lib/course-data";
import { getSiteContent } from "@/lib/content";
import { resolvePricing } from "@/lib/pricing";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { PricingCard } from "./PricingCard";
import { ChartTexture } from "./visuals/ChartTexture";

/**
 * Purely visual pass (Final Premium Landing Page Redesign, req. #10): a
 * dark section with a subtle chart texture, matching the reference's
 * "premium pricing" treatment. Every price/discount/countdown value below
 * still comes straight from resolvePricing() — nothing here recomputes or
 * hardcodes any of it, and PricingCard (the actual pricing/checkout logic)
 * is untouched.
 */
export async function PricingSection() {
  const [pricingState, content] = await Promise.all([resolvePricing(), getSiteContent()]);

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
