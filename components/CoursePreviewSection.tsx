import { insideExperience } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { IconBook, IconBrain, IconTarget, IconCheckCircle, IconRefresh, IconCheck, IconPlay, IconLayers, IconCompass } from "./icons";

const flowIcons = [IconBook, IconBrain, IconTarget, IconCheckCircle, IconRefresh];
const sidebarIcons = [IconLayers, IconBook, IconTarget, IconCompass];

/**
 * "Inside The Learning Experience" (Final Premium Landing Page Redesign,
 * req. #7) — the strongest product/UI visual on the page. This is genuine
 * UI content (not real-world photography), so — matching the same
 * "decorative, not a real screenshot" approach already used by
 * HeroChartCard.tsx — it's rendered as one large, single dashboard mockup
 * (sidebar, lesson/video area, progress panel) rather than several small
 * cards, so visitors can actually read it as "a real learning platform."
 */
export function CoursePreviewSection() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={insideExperience.eyebrow}
          headline={insideExperience.headline}
          subheadline={insideExperience.subheadline}
        />

        {/* Flow strip: Learn -> Think -> Practice -> Check -> Track */}
        <div className="relative mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
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
                  <span className="absolute -right-2 top-5 hidden h-px w-4 bg-ink-200 sm:block" aria-hidden />
                ) : null}
              </Reveal>
            );
          })}
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <ul className="space-y-4">
              {insideExperience.items.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                    <p className="text-xs leading-relaxed text-ink-500">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Large single dashboard mockup — sidebar, lesson/video area, progress panel */}
          <Reveal delay={100} className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-ink-900 bg-ink-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 bg-black/20 px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden />
                <span className="ml-2 flex items-center gap-1.5 text-xs font-medium text-ink-400">
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-brand-600 text-[8px] font-bold text-white">
                    FX
                  </span>
                  FX University &middot; Dashboard
                </span>
              </div>

              <div className="flex">
                <div className="hidden flex-col items-center gap-5 border-r border-white/10 px-4 py-6 sm:flex">
                  {sidebarIcons.map((Icon, i) => (
                    <span
                      key={i}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        i === 0 ? "bg-brand-600 text-white" : "text-ink-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  ))}
                </div>

                <div className="min-w-0 flex-1 p-5 sm:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-400">
                    Module 3 &middot; Technical Analysis
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold text-white sm:text-xl">
                    Identifying Support and Resistance
                  </h3>

                  <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                    <svg viewBox="0 0 400 140" className="h-32 w-full sm:h-40" aria-hidden="true" focusable="false">
                      <defs>
                        <linearGradient id="cpFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e50914" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#e50914" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 100 L40 88 L75 105 L110 80 L145 90 L180 58 L215 70 L250 42 L285 52 L320 26 L360 34 L400 12"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M0 100 L40 88 L75 105 L110 80 L145 90 L180 58 L215 70 L250 42 L285 52 L320 26 L360 34 L400 12 L400 140 L0 140 Z"
                        fill="url(#cpFill)"
                        stroke="none"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow">
                        <IconPlay className="h-5 w-5" />
                      </span>
                    </span>
                  </div>
                </div>

                <div className="hidden w-48 shrink-0 border-l border-white/10 p-5 sm:block">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Your Progress</p>
                  <p className="mt-1 text-xs text-ink-300">3 of 10 modules</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[30%] rounded-full bg-brand-600" />
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {["Read through the lesson", "Complete the knowledge check", "Finish the practical exercise"].map(
                      (label, i) => (
                        <li key={label} className="flex items-start gap-2 text-xs text-ink-300">
                          <span
                            className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                              i < 2 ? "bg-brand-600 text-white" : "border border-ink-600"
                            }`}
                          >
                            {i < 2 ? <IconCheck className="h-2 w-2" /> : null}
                          </span>
                          {label}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
