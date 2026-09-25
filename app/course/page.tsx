import { Hero } from "@/components/Hero";
import { TrustSection } from "@/components/TrustSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { WhyStructuredSection } from "@/components/WhyStructuredSection";
import { CurriculumSection } from "@/components/CurriculumSection";
import { CoursePreviewSection } from "@/components/CoursePreviewSection";
import { AudienceFitSection } from "@/components/AudienceFitSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { PricingSection } from "@/components/PricingSection";
import { RiskDisclaimerSection } from "@/components/RiskDisclaimerSection";
import { FAQSection } from "@/components/FAQSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";

// Page flow (Landing Page Trust + Conversion Revision, extended by the
// Final Promotion + Social Proof Pass with a stats strip after Trust):
// 1. Hero  2. Trust/value strip  2b. Social proof stats  2c. Testimonials
// (real student quotes — see below)  3. Why FX University / structured
// learning  4. What You'll Learn (high-level)  5. Inside the Learning
// Experience  6. Who It's For  7. What You Get  8. Pricing (incl. special
// enrollment offer)  8b. Risk Disclaimer (see below)  9. FAQ  10. Final CTA
// 11. Minimal footer/legal (rendered by app/course/layout.tsx's <Footer />)
//
// TestimonialsSection (step 2c) was remounted here, right after the
// numeric social-proof stats and before the objection-handling copy —
// real student voices belong right where social proof conventionally
// sits. It renders nothing at all when no genuine, published testimonial
// exists yet (see the component's own header comment and
// app/admin/testimonials), so this is a no-op until an admin actually
// publishes one.
//
// RiskDisclaimerSection (step 8b) was mounted here, directly after Pricing
// and before FAQ, so the risk disclosure sits right at the point a visitor
// is deciding whether to enroll — its wording is unchanged from
// lib/course-data.ts's existing `riskDisclaimer` content. Its section id
// ("risk-disclaimer") is now also the target of the footer's "Risk
// Disclaimer" link (previously pointed at /terms) and of a reference to it
// from /terms.
//
// The remaining sections previously here (Problem/Solution/Process/
// Benefits/Outcomes/Bonuses/OpportunityCost/HowItWorks) are still not part
// of the sales-page flow — their component files remain in the repo,
// unused, so no legal/content/architecture is deleted. The full
// lesson-level curriculum accordion was replaced by CurriculumSection's
// high-level overview per req. #2.
export default function CoursePage() {
  return (
    <>
      <Hero />
      <TrustSection />
      <SocialProofSection />
      <TestimonialsSection />
      <WhyStructuredSection />
      <CurriculumSection />
      <CoursePreviewSection />
      <AudienceFitSection />
      <WhatYouGetSection />
      <PricingSection />
      <RiskDisclaimerSection />
      <FAQSection />
      <FinalCtaSection />
    </>
  );
}
