import { Hero } from "@/components/Hero";
import { TrustSection } from "@/components/TrustSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { WhyStructuredSection } from "@/components/WhyStructuredSection";
import { CurriculumSection } from "@/components/CurriculumSection";
import { CoursePreviewSection } from "@/components/CoursePreviewSection";
import { AudienceFitSection } from "@/components/AudienceFitSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { PricingSection } from "@/components/PricingSection";
import { FAQSection } from "@/components/FAQSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";

// Page flow (Landing Page Trust + Conversion Revision, extended by the
// Final Promotion + Social Proof Pass with a stats strip after Trust):
// 1. Hero  2. Trust/value strip  2b. Social proof stats  3. Why FX University
// / structured learning  4. What You'll Learn (high-level)  5. Inside the
// Learning Experience  6. Who It's For  7. What You Get  8. Pricing (incl.
// special enrollment offer)  9. FAQ  10. Final CTA  11. Minimal
// footer/legal (rendered by app/course/layout.tsx's <Footer />)
//
// Sections previously here (Problem/Solution/Process/Benefits/Outcomes/
// Bonuses/OpportunityCost/HowItWorks/RiskDisclaimer/Testimonials) are no
// longer part of the sales-page flow — their component files remain in the
// repo, unused, so no legal/content/architecture is deleted. The large
// risk-disclaimer block was removed from the page body per req. #1 (the
// concise footer disclaimer already covers this); the full lesson-level
// curriculum accordion was replaced by CurriculumSection's high-level
// overview per req. #2.
export default function CoursePage() {
  return (
    <>
      <Hero />
      <TrustSection />
      <SocialProofSection />
      <WhyStructuredSection />
      <CurriculumSection />
      <CoursePreviewSection />
      <AudienceFitSection />
      <WhatYouGetSection />
      <PricingSection />
      <FAQSection />
      <FinalCtaSection />
    </>
  );
}
