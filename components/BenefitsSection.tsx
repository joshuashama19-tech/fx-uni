import { benefits } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import {
  IconChart,
  IconCandles,
  IconLayers,
  IconCompass,
  IconBook,
  IconGlobe,
  IconShield,
  IconBrain,
  IconTarget,
  IconRefresh,
} from "./icons";

const icons = [IconChart, IconCandles, IconLayers, IconCompass, IconBook, IconGlobe, IconShield, IconBrain, IconTarget, IconRefresh];

export function BenefitsSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={benefits.eyebrow} headline={benefits.headline} />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal
                key={item.title}
                delay={(i % 5) * 60}
                className="rounded-2xl border border-ink-100 bg-white p-5 transition-colors duration-200 hover:border-brand-200 hover:bg-brand-50/40 sm:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 text-brand-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-ink-900 sm:text-base">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.description}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
