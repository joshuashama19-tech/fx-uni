import { courseProcess } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import {
  IconBook,
  IconBrain,
  IconTarget,
  IconRefresh,
  IconLayers,
  IconChart,
} from "./icons";

const icons = [IconBook, IconBrain, IconTarget, IconChart, IconLayers, IconRefresh];

export function ProcessSection() {
  return (
    <section className="bg-ink-950 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={courseProcess.eyebrow}
          headline={courseProcess.headline}
          subheadline={courseProcess.subheadline}
          tone="dark"
        />

        <div className="relative mt-14 grid grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-3 lg:grid-cols-6">
          {courseProcess.steps.map((step, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={step.title} delay={i * 70} className="relative">
                <div className="flex h-full flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-white sm:text-base">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-400 sm:text-sm">{step.description}</p>
                </div>
                {i < courseProcess.steps.length - 1 ? (
                  <span
                    className="absolute -right-2.5 top-1/2 hidden h-px w-5 -translate-y-1/2 bg-gradient-to-r from-brand-500/60 to-transparent lg:block"
                    aria-hidden
                  />
                ) : null}
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={420} className="mx-auto mt-10 max-w-2xl text-center text-sm text-ink-400 sm:text-base">
          {courseProcess.note}
        </Reveal>
      </Container>
    </section>
  );
}
