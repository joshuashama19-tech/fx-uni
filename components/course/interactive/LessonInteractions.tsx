import type { Interaction } from "@/lib/interactions/types";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { RevealCard } from "./RevealCard";

/**
 * Renders a lesson's hand-authored interactive elements (see
 * lib/interactions/module-01.ts) under a single "Check Your Understanding"
 * section, appended after the lesson's own markdown content. Purely
 * additive — a lesson with no authored interactions renders nothing here,
 * per "do not force an interaction into every lesson."
 */
export function LessonInteractions({ interactions }: { interactions: Interaction[] }) {
  if (interactions.length === 0) return null;

  return (
    <section className="mt-8 max-w-[70ch] border-t border-ink-100 pt-8">
      <h2 className="text-lg font-semibold tracking-tight text-ink-950">Check Your Understanding</h2>
      <p className="mt-1 text-sm text-ink-500">
        A quick check on what this lesson covered — answer before reading the explanation.
      </p>
      <div className="mt-4">
        {interactions.map((interaction) => {
          if (interaction.kind === "check") {
            return (
              <KnowledgeCheck
                key={interaction.id}
                label={interaction.label}
                scenario={interaction.scenario}
                prompt={interaction.prompt}
                options={interaction.options}
                correctKey={interaction.correctKey}
                correctFeedback={interaction.correctFeedback}
                incorrectFeedback={interaction.incorrectFeedback}
              />
            );
          }
          return (
            <RevealCard
              key={interaction.id}
              label={interaction.label}
              prompt={interaction.prompt}
              revealLabel={interaction.revealLabel}
              explanation={interaction.explanation}
            />
          );
        })}
      </div>
    </section>
  );
}
