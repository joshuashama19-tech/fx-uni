"use client";

import { useState } from "react";
import { curriculum } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { IconChevronDown, IconCheck } from "./icons";

export function CurriculumSection() {
  const [openModule, setOpenModule] = useState<number | null>(1);

  return (
    <section id="curriculum" className="bg-ink-950 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={curriculum.eyebrow}
          headline={curriculum.headline}
          subheadline={curriculum.subheadline}
          tone="dark"
        />

        <div className="mt-14 grid gap-3 sm:mt-16">
          {curriculum.modules.map((mod, i) => {
            const isOpen = openModule === mod.number;
            return (
              <Reveal key={mod.number} delay={Math.min(i, 6) * 40}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-colors duration-200 ${
                    isOpen ? "border-brand-500/40 bg-white/[0.05]" : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenModule(isOpen ? null : mod.number)}
                    aria-expanded={isOpen}
                    aria-controls={`module-panel-${mod.number}`}
                    className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        isOpen ? "bg-brand-700 text-white" : "bg-white/[0.06] text-brand-300"
                      }`}
                    >
                      {String(mod.number).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span className="block text-base font-semibold text-white sm:text-lg">{mod.title}</span>
                      <span className="mt-1 hidden text-sm text-ink-400 sm:block">{mod.description}</span>
                    </span>
                    <IconChevronDown
                      className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand-300" : ""
                      }`}
                    />
                  </button>

                  <div
                    id={`module-panel-${mod.number}`}
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-6 sm:px-6 sm:pl-[4.5rem]">
                        <p className="text-sm text-ink-400 sm:hidden">{mod.description}</p>
                        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                          {mod.topics.map((topic) => (
                            <li key={topic} className="flex items-start gap-2.5 text-sm text-ink-200">
                              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
