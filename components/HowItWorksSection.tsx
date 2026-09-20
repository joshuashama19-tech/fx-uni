import { howItWorks } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

export function HowItWorksSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={howItWorks.eyebrow} headline={howItWorks.headline} />

        <div className="relative mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-ink-100 sm:block" aria-hidden />
          {howItWorks.steps.map((step, i) => (
            <Reveal key={step.step} delay={i * 100} className="relative flex flex-col items-center text-center">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-ink-950 text-base font-bold text-brand-300 ring-8 ring-white">
                {step.step}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
