import { bonuses } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { IconGift } from "./icons";

export function BonusesSection() {
  return (
    <section className="bg-ink-50 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={bonuses.eyebrow}
          headline={bonuses.headline}
          subheadline={bonuses.subheadline}
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {bonuses.items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 80}
              className="rounded-2xl border border-dashed border-ink-300 bg-white/60 p-6 text-center"
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <IconGift className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink-800">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
