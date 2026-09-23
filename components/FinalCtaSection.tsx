import { finalCta } from "@/lib/course-data";
import { getSiteContent } from "@/lib/content";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { Button } from "./ui/Button";
import { ChartTexture } from "./visuals/ChartTexture";
import { IconArrowRight } from "./icons";

export async function FinalCtaSection() {
  const content = await getSiteContent();

  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-24">
      <ChartTexture />
      <Container className="relative text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {content.final_cta_headline}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-ink-300 sm:text-lg">
            {content.final_cta_subheadline}
          </p>
        </Reveal>
        <Reveal delay={160} className="mt-8">
          <Button
            href={finalCta.ctaHref}
            size="lg"
            icon={<IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
          >
            {content.final_cta_button_label}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
