import { pricing, pricingFomo } from "@/lib/course-data";
import { getSiteContent } from "@/lib/content";
import { resolvePricing } from "@/lib/pricing";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { PricingCard } from "./PricingCard";

export async function PricingSection() {
  const [pricingState, content] = await Promise.all([resolvePricing(), getSiteContent()]);

  return (
    <section id="pricing" className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={pricing.eyebrow} headline={pricing.headline} subheadline={pricing.subheadline} />

        <Reveal className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-xl font-semibold text-ink-900 sm:text-2xl">{pricingFomo.headline}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-500 sm:text-base">{pricingFomo.body}</p>
          <p className="mt-3 text-sm font-medium text-ink-700">{pricingFomo.scopeLine}</p>
        </Reveal>

        <PricingCard pricingState={pricingState} billingNote={content.pricing_billing_note} />

        <Reveal delay={80} className="mx-auto mt-10 max-w-xl text-center">
          <p className="text-base font-semibold text-ink-900">{pricingFomo.nextStepHeadline}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{pricingFomo.nextStepBody}</p>
          {pricingState.isPromoActive ? (
            <p className="mt-4 text-sm font-medium text-brand-700">
              Special enrollment pricing is available for a limited time. Once the offer ends, the course returns to{" "}
              {pricingState.regularPriceFormatted}.
            </p>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
