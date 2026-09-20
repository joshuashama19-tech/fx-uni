import { outcomes } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { IconX, IconCheckCircle } from "./icons";

export function OutcomesSection() {
  return (
    <section className="bg-ink-50 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={outcomes.eyebrow} headline={outcomes.headline} subheadline={outcomes.subheadline} />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-2xl bg-white p-7 shadow-card sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-400">{outcomes.before.title}</h3>
            <ul className="mt-5 space-y-4">
              {outcomes.before.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-600 sm:text-base">
                  <IconX className="mt-0.5 h-5 w-5 shrink-0 text-ink-300" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100} className="rounded-2xl bg-ink-950 p-7 shadow-card sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300">{outcomes.after.title}</h3>
            <ul className="mt-5 space-y-4">
              {outcomes.after.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-100 sm:text-base">
                  <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
