import { trust } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { IconLayers, IconTarget, IconRefresh, IconLock } from "./icons";

const icons = [IconLayers, IconTarget, IconRefresh, IconLock];

/**
 * Premium trust/value section (Landing Page Trust + Conversion Revision,
 * req. #3). Every card claim is backed by the existing product — no
 * student counts, testimonials, awards, or results claims.
 */
export function TrustSection() {
  return (
    <section className="bg-ink-50 py-20 sm:py-24">
      <Container>
        <SectionHeading headline={trust.headline} subheadline={trust.subheadline} />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.points.map((point, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal
                key={point.title}
                delay={i * 70}
                className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-brand-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{point.description}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
