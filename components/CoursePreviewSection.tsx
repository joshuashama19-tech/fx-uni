import { insideExperience } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { LearningExperienceVisual } from "./visuals/LearningExperienceVisual";
import { IconBook, IconBrain, IconTarget, IconCheckCircle, IconRefresh, IconCheck } from "./icons";

const flowIcons = [IconBook, IconBrain, IconTarget, IconCheckCircle, IconRefresh];

/**
 * "Inside The Learning Experience" (Landing Page Trust + Conversion
 * Revision, req. #5). No real product screenshots exist in this repo, so
 * this renders an original, hand-built interface mockup in the site's own
 * brand language — the same "decorative, not a real screenshot" approach
 * already used by HeroChartCard.tsx — rather than a fabricated photo or a
 * generic stock image.
 */
export function CoursePreviewSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow={insideExperience.eyebrow}
              headline={insideExperience.headline}
              subheadline={insideExperience.subheadline}
              align="left"
            />
          </div>
          {/* Learning-experience visual (asset #2) — a laptop showing the
              same FX University lesson UI as the mockup below, not a
              generic/unrelated screen. */}
          <Reveal delay={80} className="lg:col-span-6">
            <LearningExperienceVisual />
          </Reveal>
        </div>

        {/* Flow strip: Learn -> Think -> Practice -> Check -> Track */}
        <div className="relative mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
          {insideExperience.flowSteps.map((step, i) => {
            const Icon = flowIcons[i % flowIcons.length];
            return (
              <Reveal key={step.title} delay={i * 70} className="relative flex flex-col items-center text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-2.5 text-xs font-semibold uppercase tracking-wide text-ink-900 sm:text-sm">
                  {step.title}
                </span>
                <span className="mt-1 hidden text-xs leading-relaxed text-ink-500 sm:block">{step.description}</span>
                {i < insideExperience.flowSteps.length - 1 ? (
                  <span
                    className="absolute -right-2 top-5 hidden h-px w-4 bg-ink-200 sm:block"
                    aria-hidden
                  />
                ) : null}
              </Reveal>
            );
          })}
        </div>

        {/* Original interface mockup — not a real screenshot */}
        <Reveal delay={200} className="mx-auto mt-14 max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-50 shadow-card">
            <div className="flex items-center gap-2 border-b border-ink-100 bg-white px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-ink-200" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-200" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-200" aria-hidden />
              <span className="ml-2 text-xs font-medium text-ink-400">FX University &middot; Lesson</span>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <div className="rounded-xl border border-ink-100 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">Lesson</p>
                <div className="mt-2.5 space-y-2">
                  <div className="h-2.5 w-full rounded-full bg-ink-100" />
                  <div className="h-2.5 w-11/12 rounded-full bg-ink-100" />
                  <div className="h-2.5 w-4/5 rounded-full bg-ink-100" />
                  <div className="h-2.5 w-full rounded-full bg-ink-100" />
                  <div className="h-2.5 w-2/3 rounded-full bg-ink-100" />
                </div>
              </div>

              <div className="rounded-xl border border-ink-100 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">Knowledge Check</p>
                <p className="mt-2.5 text-xs font-medium text-ink-800 sm:text-sm">
                  Which of these best describes this lesson&apos;s concept?
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2 text-xs text-ink-500">
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-ink-300" />
                    Option A
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800">
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                      <IconCheck className="h-2.5 w-2.5" />
                    </span>
                    Option B
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2 text-xs text-ink-500">
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-ink-300" />
                    Option C
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-ink-100 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                  Completion Checklist
                </p>
                <div className="mt-2.5 space-y-2.5">
                  {["Read through the lesson", "Complete the knowledge check", "Finish the practical exercise"].map(
                    (label) => (
                      <div key={label} className="flex items-center gap-2.5 text-xs text-ink-600 sm:text-sm">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-ink-950 text-white">
                          <IconCheck className="h-2.5 w-2.5" />
                        </span>
                        {label}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-xl border border-ink-100 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">Your Progress</p>
                <p className="mt-2.5 text-xs text-ink-500">Module 3 of 10</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full w-[32%] rounded-full bg-brand-600" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {insideExperience.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
