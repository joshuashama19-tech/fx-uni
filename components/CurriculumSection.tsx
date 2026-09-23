import { curriculum } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

/**
 * High-level "What You'll Learn" overview — intentionally shows only the
 * four learning phases, never the full module/lesson-level curriculum.
 * (Landing Page Trust + Conversion Revision, req. #2 — students should
 * understand scope and transformation without receiving the complete
 * curriculum before purchase.)
 */
export function CurriculumSection() {
  return (
    <section id="curriculum" className="bg-ink-950 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={curriculum.eyebrow}
          headline={curriculum.headline}
          subheadline={curriculum.subheadline}
          tone="dark"
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {curriculum.phases.map((phase, i) => (
            <Reveal
              key={phase.number}
              delay={i * 80}
              className="relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-bold text-brand-300">
                {String(phase.number).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{phase.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{phase.description}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={340} className="mx-auto mt-10 max-w-2xl text-center text-sm font-medium text-ink-300 sm:text-base">
          {curriculum.scopeStatement}
        </Reveal>
      </Container>
    </section>
  );
}
