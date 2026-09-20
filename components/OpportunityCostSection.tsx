import { opportunityCost } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { IconX } from "./icons";

export function OpportunityCostSection() {
  return (
    <section className="bg-ink-950 py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
            {opportunityCost.eyebrow}
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {opportunityCost.headline}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-4 text-balance text-base leading-relaxed text-ink-300 sm:text-lg">
              {opportunityCost.subheadline}
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
          {opportunityCost.items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 50}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4"
            >
              <IconX className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-0.5 text-sm text-ink-400">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={360} className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-balance text-lg font-medium text-white sm:text-xl">{opportunityCost.closing}</p>
        </Reveal>
      </Container>
    </section>
  );
}
