"use client";

import { useState } from "react";

// Click-to-reveal: encourages the student to think through a question
// themselves before seeing the explanation, rather than reading straight
// through. Uses a native <button> (keyboard/touch friendly, no hover
// dependency) and respects prefers-reduced-motion by not animating at all
// — the content just appears.

export function RevealCard({
  label = "Think About It",
  prompt,
  revealLabel = "Reveal explanation",
  explanation,
}: {
  label?: string;
  prompt: string;
  revealLabel?: string;
  explanation: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="my-6 rounded-xl border border-ink-100 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{label}</p>
      <p className="mt-2 text-base font-medium leading-relaxed text-ink-900">{prompt}</p>

      {revealed ? (
        <p className="mt-4 rounded-lg bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-700">{explanation}</p>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-4 min-h-11 rounded-full border border-ink-200 px-5 py-2 text-sm font-semibold text-ink-800 hover:border-brand-300 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {revealLabel}
        </button>
      )}
    </div>
  );
}
