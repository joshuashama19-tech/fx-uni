"use client";

import { useState } from "react";
import { Reveal } from "./ui/Reveal";
import { IconChevronDown } from "./icons";
import type { FaqRow } from "@/lib/types";

/**
 * Pure presentation/interaction — the accordion open/close state. Item data
 * comes from the server (components/FAQSection.tsx), which fetches
 * admin-managed rows from Supabase; this component never fetches anything
 * itself.
 */
export function FAQAccordion({ items }: { items: Pick<FaqRow, "question" | "answer">[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <Reveal key={item.question} delay={Math.min(i, 6) * 40}>
            <div className={`overflow-hidden rounded-2xl border bg-white transition-colors ${isOpen ? "border-brand-200" : "border-ink-100"}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
              >
                <span className="text-sm font-semibold text-ink-900 sm:text-base">{item.question}</span>
                <IconChevronDown
                  className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-700" : ""}`}
                />
              </button>
              <div
                id={`faq-panel-${i}`}
                className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500 sm:px-6 sm:text-base">{item.answer}</p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
