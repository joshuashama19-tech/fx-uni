import { finalCta } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { Button } from "./ui/Button";
import { IconArrowRight } from "./icons";

export function FinalCtaSection() {
  return (
    <section className="bg-ink-950 py-20 sm:py-24">
      <Container className="text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {finalCta.headline}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-ink-300 sm:text-lg">
            {finalCta.subheadline}
          </p>
        </Reveal>
        <Reveal delay={160} className="mt-8">
          <Button
            href={finalCta.ctaHref}
            size="lg"
            icon={<IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
          >
            {finalCta.ctaLabel}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
