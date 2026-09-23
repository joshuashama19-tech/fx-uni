import { whyStructured } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { ImageSlot } from "./visuals/ImageSlot";
import { IconClock, IconBrain, IconTarget } from "./icons";

const outcomeIcons = [IconClock, IconBrain, IconTarget];

/**
 * "Why pay for a course when there's free content everywhere?" — the
 * page's primary human-presence section (Final Premium Landing Page
 * Redesign, req. #2 & #5). A real learner/trader photo sits opposite the
 * objection-handling copy and a compact three-outcome row, replacing the
 * previous three-card layout with the visual weight the reference calls
 * for.
 */
export function WhyStructuredSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-6">
            <ImageSlot
              assetKey="learnerReviewingCharts"
              className="aspect-[4/5] w-full max-w-md rounded-2xl shadow-card sm:aspect-[5/4] lg:aspect-[4/5] lg:max-w-none"
            />
          </Reveal>

          <div className="lg:col-span-6">
            <Reveal className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {whyStructured.eyebrow}
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
                {whyStructured.headline}
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-ink-500 sm:text-lg">
                {whyStructured.description}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">
                {whyStructured.closing}
              </p>
            </Reveal>

            <Reveal delay={240} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {whyStructured.outcomes.map((outcome, i) => {
                const Icon = outcomeIcons[i % outcomeIcons.length];
                return (
                  <div key={outcome.title} className="flex flex-col items-start gap-2 sm:items-center sm:text-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{outcome.title}</p>
                      <p className="text-xs text-ink-500">{outcome.description}</p>
                    </div>
                  </div>
                );
              })}
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
