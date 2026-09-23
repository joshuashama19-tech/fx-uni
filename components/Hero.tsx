import { hero } from "@/lib/course-data";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { ImageSlot } from "./visuals/ImageSlot";
import { IconArrowRight, IconCheck } from "./icons";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-grid grid-fade-mask opacity-60" aria-hidden />

      <Container className="relative grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-28">
        <div className="lg:col-span-7">
          <Reveal className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
            {hero.eyebrow}
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              {hero.headline}
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-300 sm:text-lg">
              {hero.subheadline}
            </p>
          </Reveal>

          <Reveal delay={200}>
            <ul className="mt-7 space-y-3">
              {hero.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm text-ink-200 sm:text-base">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={260} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={hero.ctaPrimary.href} size="lg" icon={<IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}>
              {hero.ctaPrimary.label}
            </Button>
            <Button href={hero.ctaSecondary.href} variant="ghost" size="lg">
              {hero.ctaSecondary.label}
            </Button>
          </Reveal>

          <Reveal delay={300} className="mt-6 text-xs text-ink-500">
            {hero.disclaimerNote}
          </Reveal>
        </div>

        <Reveal delay={160} className="lg:col-span-5">
          {/* Premium photographic hero visual (Final Premium Landing Page
              Redesign, req. #1) — a real trading-workspace photo once one is
              supplied at public/images/hero-workspace.jpg; a labeled
              placeholder until then. Replaces the earlier abstract SVG
              treatment, per the task's explicit instruction not to
              substitute missing photography with more vector illustration. */}
          <ImageSlot
            assetKey="heroWorkspace"
            tone="dark"
            priority
            className="aspect-[4/5] w-full rounded-2xl shadow-2xl sm:aspect-[6/5] lg:aspect-[4/5]"
          />
        </Reveal>
      </Container>
    </section>
  );
}
