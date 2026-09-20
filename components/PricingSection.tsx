import { pricing } from "@/lib/course-data";
import { getDisplayPrice, getSiteContent } from "@/lib/content";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { PricingCard } from "./PricingCard";

export async function PricingSection() {
  const { formatted } = getDisplayPrice();
  const content = await getSiteContent();

  return (
    <section id="pricing" className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={pricing.eyebrow} headline={pricing.headline} subheadline={pricing.subheadline} />
        <PricingCard formattedPrice={formatted} billingNote={content.pricing_billing_note} />
      </Container>
    </section>
  );
}
