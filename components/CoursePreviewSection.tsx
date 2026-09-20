import { coursePreview } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { IconLayers, IconChart, IconCheck } from "./icons";

const mockIcons = [IconLayers, IconChart, IconCheck];

export function CoursePreviewSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={coursePreview.eyebrow}
          headline={coursePreview.headline}
          subheadline={coursePreview.subheadline}
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {coursePreview.items.map((item, i) => {
            const Icon = mockIcons[i % mockIcons.length];
            return (
              <Reveal key={item.title} delay={i * 80} className="group">
                <div className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br from-ink-50 to-white p-5 transition-shadow duration-200 group-hover:shadow-card-hover">
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        "linear-gradient(#0a0f1a 1px, transparent 1px), linear-gradient(90deg, #0a0f1a 1px, transparent 1px)",
                      backgroundSize: "18px 18px",
                    }}
                    aria-hidden
                  />
                  <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-950 text-brand-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="relative w-fit rounded-lg bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    Preview placeholder
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.description}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
