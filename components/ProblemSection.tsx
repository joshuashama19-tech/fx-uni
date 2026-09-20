import { problems } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { IconAlert } from "./icons";

export function ProblemSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={problems.eyebrow}
          headline={problems.headline}
          subheadline={problems.subheadline}
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 60}
              className="group rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-ink-500 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700">
                <IconAlert className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
