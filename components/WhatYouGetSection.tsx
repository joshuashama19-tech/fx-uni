import { whatYouGet } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import {
  IconBook,
  IconCandles,
  IconChart,
  IconLayers,
  IconGlobe,
  IconShield,
  IconBrain,
  IconTarget,
  IconRefresh,
  IconCheckCircle,
  IconCheck,
  IconCompass,
  IconAlert,
  IconLock,
} from "./icons";

const icons = [
  IconBook,
  IconCandles,
  IconChart,
  IconLayers,
  IconGlobe,
  IconShield,
  IconBrain,
  IconTarget,
  IconRefresh,
  IconCheckCircle,
  IconCheck,
  IconCompass,
  IconAlert,
  IconLock,
];

export function WhatYouGetSection() {
  return (
    <section id="what-you-get" className="bg-ink-50 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={whatYouGet.eyebrow}
          headline={whatYouGet.headline}
          subheadline={whatYouGet.subheadline}
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whatYouGet.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal
                key={item.title}
                delay={(i % 3) * 70}
                className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-card"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900 sm:text-base">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
