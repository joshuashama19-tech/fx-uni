// Data shape for hand-authored, lesson-embedded interactive elements (the
// Module 1 pilot — see lib/interactions/module-01.ts). Deliberately stored
// as structured data, separate from the course markdown, rather than by
// editing the lesson content files themselves: the 135 lessons are
// authoritative course content and are never modified for a UI feature.
// Rendered append-only, after a lesson's own content (see
// components/course/interactive/LessonInteractions.tsx) — never spliced
// into the middle of the markdown — so there's no fragile, error-prone
// matching against parsed lesson blocks.

export type Interaction =
  | {
      kind: "check";
      id: string;
      type: "mc" | "tf";
      /** Small eyebrow label shown above the prompt, e.g. "Knowledge Check", "Scenario". */
      label?: string;
      /** Optional scenario/setup text shown above the question itself. */
      scenario?: string;
      prompt: string;
      options: { key: string; text: string }[];
      correctKey: string;
      correctFeedback?: string;
      incorrectFeedback: string;
    }
  | {
      kind: "reveal";
      id: string;
      label?: string;
      prompt: string;
      revealLabel?: string;
      explanation: string;
    };
