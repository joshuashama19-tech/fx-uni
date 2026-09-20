import { solution } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { IconCompass, IconCheck } from "./icons";

export function SolutionSection() {
  return (
    <section className="bg-ink-50 py-20 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-5">
          <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80 lg:h-full lg:w-full lg:max-w-sm">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-ink-900 to-brand-800" />
            <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            <IconCompass className="relative h-20 w-20 text-brand-300 sm:h-24 sm:w-24" aria-hidden />
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {solution.eyebrow}
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              {solution.headline}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-4 max-w-2xl text-balance text-base leading-relaxed text-ink-500 sm:text-lg">
              {solution.description}
            </p>
          </Reveal>
          <Reveal delay={180}>
            <ul className="mt-6 space-y-3">
              {solution.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-ink-700 sm:text-base">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
