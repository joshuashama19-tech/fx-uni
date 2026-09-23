import { whatYouGet } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { ImageSlot } from "./visuals/ImageSlot";
import { IconCheck } from "./icons";

/**
 * "Here's exactly what you're getting" (Final Premium Landing Page
 * Redesign, req. #9) — reworked from a 3-column icon-card grid into a
 * photo + organized list composition, per the request's explicit "reduce
 * the visual feeling of a generic grid" instruction. All 14 existing,
 * approved items are kept, unchanged — only the presentation changed.
 */
export function WhatYouGetSection() {
  return (
    <section id="what-you-get" className="bg-ink-50 py-20 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow={whatYouGet.eyebrow}
              headline={whatYouGet.headline}
              subheadline={whatYouGet.subheadline}
              align="left"
            />
          </div>
          <Reveal delay={80} className="lg:col-span-5">
            <ImageSlot
              assetKey="journalReviewCloseup"
              className="aspect-[4/5] w-full max-w-md rounded-2xl shadow-card sm:aspect-[5/4] lg:aspect-[4/5] lg:max-w-none"
            />
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-3.5 sm:grid-cols-2">
          {whatYouGet.items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 6) * 50} className="flex items-start gap-3 border-b border-ink-100 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-brand-700 shadow-card">
                <IconCheck className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
