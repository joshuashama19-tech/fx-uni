import { whyStructured } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { IconLayers, IconCompass, IconTarget } from "./icons";

const icons = [IconLayers, IconCompass, IconTarget];

export function WhyStructuredSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7 lg:content-start">
            {whyStructured.points.map((point, i) => {
              const Icon = icons[i % icons.length];
              return (
                <Reveal
                  key={point.title}
                  delay={i * 80}
                  className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 text-brand-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-ink-900">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{point.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
