"use client";

import { useState } from "react";
import { IconCheckCircle, IconAlert } from "@/components/icons";

// A single self-contained, client-only knowledge check (multiple choice or
// true/false), embedded directly in a lesson. Deliberately NOT persisted
// server-side: these are lightweight reinforcement/engagement tools, not
// part of the graded module quiz or any tracked progress — that keeps them
// fast (no network round-trip to answer one) and keeps the persisted
// progress model exactly what the spec calls for (lessons, exercises,
// checklist, quiz), nothing more. State resets on navigation, which is
// fine — the point is the immediate "did I actually get that" moment, not
// a permanent record.

export interface KnowledgeCheckOption {
  key: string;
  text: string;
}

export function KnowledgeCheck({
  label = "Knowledge Check",
  scenario,
  prompt,
  options,
  correctKey,
  correctFeedback,
  incorrectFeedback,
}: {
  label?: string;
  scenario?: string;
  prompt: string;
  options: KnowledgeCheckOption[];
  correctKey: string;
  correctFeedback?: string;
  incorrectFeedback: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === correctKey;

  return (
    <div className="my-6 rounded-xl border border-ink-100 bg-ink-50/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{label}</p>
      {scenario ? <p className="mt-2 text-sm leading-relaxed text-ink-600">{scenario}</p> : null}
      <p className="mt-2 text-base font-medium leading-relaxed text-ink-900">{prompt}</p>

      <div className="mt-4 flex flex-col gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          const showState = selected !== null;
          const optionIsCorrect = opt.key === correctKey;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelected(opt.key)}
              aria-pressed={isSelected}
              className={`min-h-11 rounded-lg border px-4 py-2.5 text-left text-sm leading-relaxed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                showState && optionIsCorrect
                  ? "border-brand-600 bg-brand-50 text-ink-900"
                  : showState && isSelected
                    ? "border-ink-300 bg-white text-ink-500"
                    : "border-ink-200 bg-white text-ink-800 hover:border-brand-200 hover:bg-brand-50/30"
              }`}
            >
              <span className="font-semibold text-ink-500">{opt.key}) </span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {selected !== null ? (
        <div
          role="status"
          className={`mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm leading-relaxed ${
            isCorrect ? "bg-brand-50 text-brand-800" : "bg-ink-100 text-ink-700"
          }`}
        >
          {isCorrect ? (
            <IconCheckCircle className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
          ) : (
            <IconAlert className="mt-0.5 h-4 w-4 flex-none text-ink-500" />
          )}
          <span>
            {isCorrect ? (
              <>
                <span className="font-semibold">Correct.</span> {correctFeedback}
              </>
            ) : (
              <>
                <span className="font-semibold">Not quite.</span> {incorrectFeedback}
              </>
            )}
          </span>
        </div>
      ) : null}
    </div>
  );
}
