import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { SolutionSection } from "@/components/SolutionSection";
import { WhyStructuredSection } from "@/components/WhyStructuredSection";
import { ProcessSection } from "@/components/ProcessSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { CurriculumSection } from "@/components/CurriculumSection";
import { OutcomesSection } from "@/components/OutcomesSection";
import { AudienceFitSection } from "@/components/AudienceFitSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { CoursePreviewSection } from "@/components/CoursePreviewSection";
import { BonusesSection } from "@/components/BonusesSection";
import { OpportunityCostSection } from "@/components/OpportunityCostSection";
import { PricingSection } from "@/components/PricingSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TrustSection } from "@/components/TrustSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FAQSection } from "@/components/FAQSection";
import { RiskDisclaimerSection } from "@/components/RiskDisclaimerSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";

export default function CoursePage() {
  return (
    <>
      {/* 1. Hook: what it is, who it's for, the transformation, a clear CTA */}
      <Hero />

      {/* 2. Agitate: make the reader feel understood */}
      <ProblemSection />

      {/* 3. Resolve: the structured path + the process behind it */}
      <SolutionSection />
      <ProcessSection />

      {/* 4. Objection handling: free content vs. structure */}
      <WhyStructuredSection />

      {/* 5. Practical skills + full curriculum depth */}
      <BenefitsSection />
      <CurriculumSection />

      {/* 6. Identity-level transformation, then audience fit */}
      <OutcomesSection />
      <AudienceFitSection />

      {/* 7. Full value stack, preview, bonuses */}
      <WhatYouGetSection />
      <CoursePreviewSection />
      <BonusesSection />

      {/* 8. Real urgency (no fake scarcity), then the offer itself */}
      <OpportunityCostSection />
      <PricingSection />

      {/* 9. Reduce friction: how it works, social proof, testimonials, objections, risk */}
      <HowItWorksSection />
      <TrustSection />
      <TestimonialsSection />
      <FAQSection />
      <RiskDisclaimerSection />

      {/* 10. Last chance to act */}
      <FinalCtaSection />
    </>
  );
}
