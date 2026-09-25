import { Hero } from "@/components/Hero";
import { TrustSection } from "@/components/TrustSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { WhyStructuredSection } from "@/components/WhyStructuredSection";
import { ProcessSection } from "@/components/ProcessSection";
import { CurriculumSection } from "@/components/CurriculumSection";
import { CoursePreviewSection } from "@/components/CoursePreviewSection";
import { AudienceFitSection } from "@/components/AudienceFitSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { PricingSection } from "@/components/PricingSection";
import { FAQSection } from "@/components/FAQSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";

// Page flow (Landing Page Trust + Conversion Revision, extended by the
// Final Promotion + Social Proof Pass with a stats strip after Trust, and
// by Batch 5's ProcessSection/HowItWorksSection mounts):
// 1. Hero  2. Trust/value strip  2b. Social proof stats  2c. Testimonials
// (real student quotes — see below)  3. Why FX University / structured
// learning  3b. The learning process (Learn/Understand/Practice/Backtest/
// Journal/Improve)  4. What You'll Learn (high-level)  5. Inside the
// Learning Experience  6. Who It's For  7. What You Get  7b. How It Works
// (account -> payment -> access)  8. Pricing (incl. special enrollment
// offer)  9. FAQ  10. Final CTA  11. Minimal footer/legal (rendered by
// app/course/layout.tsx's <Footer />)
//
// TestimonialsSection (step 2c) was remounted here, right after the
// numeric social-proof stats and before the objection-handling copy —
// real student voices belong right where social proof conventionally
// sits. It renders nothing at all when no genuine, published testimonial
// exists yet (see the component's own header comment and
// app/admin/testimonials), so this is a no-op until an admin actually
// publishes one.
//
// ProcessSection (step 3b, Batch 5) was mounted here, right after "why
// structured": it's the one previously-unused section whose content
// (the Learn/Understand/Practice/Backtest/Journal/Improve loop) isn't
// covered anywhere else already mounted — it explains the *method*, where
// WhyStructuredSection explains the *rationale* and CurriculumSection
// lists the *modules*. Its "Backtest"/"Journal" steps match the backtesting
// walkthrough and journaling framework already promised in pricing.features,
// so nothing here is a new claim.
//
// HowItWorksSection (step 7b, Batch 5) was mounted here, right before
// Pricing: the nav already has a "How It Works" link (#how-it-works), but
// that id previously landed on CoursePreviewSection (a product-UI mockup,
// not an explanation of the actual account/payment/access steps) — genuine
// nav/content mismatch. HowItWorksSection now owns #how-it-works (see its
// own file) and CoursePreviewSection's id was changed to "course-preview"
// (see that file). Placed right before the pricing decision so a visitor
// knows exactly what happens after they click "Get Course Access."
//
// RiskDisclaimerSection is intentionally NOT mounted here: the full risk
// disclaimer must not appear visibly in the normal sales-page flow. Its
// content and the "risk-disclaimer" section id it renders remain unchanged
// in components/RiskDisclaimerSection.tsx and lib/course-data.ts — only
// this page's mount was removed. The footer's "Risk Disclaimer" link now
// points to /risk-disclaimer, a dedicated page that reuses this same
// component (see app/risk-disclaimer/page.tsx) — not to an anchor on this
// page.
//
// The remaining unused sections (Problem/Solution/Benefits/Outcomes/
// Bonuses/OpportunityCost) were reviewed in Batch 5 and deliberately left
// unmounted: Solution and Benefits substantially restate content already
// covered by WhyStructuredSection and WhatYouGetSection respectively;
// Problem and OpportunityCost both restate the same "confused beginner"
// pain points already implied by WhyStructuredSection's framing, and
// mounting either alongside the other would be redundant with itself as
// well; Outcomes' before/after framing overlaps both of those. Mounting
// any of them would repeat material already on the page rather than add
// to it. BonusesSection's own content is explicitly marked
// PLACEHOLDER/"Title pending" in lib/course-data.ts and must not be shown
// publicly until real bonuses are confirmed. Their component files remain
// in the repo, unused, so no content is deleted — only ProcessSection and
// HowItWorksSection, above, cleared this bar. The full lesson-level
// curriculum accordion was replaced by CurriculumSection's high-level
// overview per req. #2.
export default function CoursePage() {
  return (
    <>
      <Hero />
      <TrustSection />
      <SocialProofSection />
      <TestimonialsSection />
      <WhyStructuredSection />
      <ProcessSection />
      <CurriculumSection />
      <CoursePreviewSection />
      <AudienceFitSection />
      <WhatYouGetSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <FinalCtaSection />
    </>
  );
}
