import type { Interaction } from "./types";
import { module01Interactions } from "./module-01";

// Module 1 is the only module with hand-authored, lesson-embedded
// interactions so far (the pilot) — see module-01.ts's header comment and
// the delivery report for why. Modules 2–10 intentionally return an empty
// list here; LessonInteractions renders nothing when the list is empty, so
// their lesson pages are unaffected until the same standard is applied to
// them in a follow-up pass.
const BY_MODULE: Record<string, Record<string, Interaction[]>> = {
  "forex-fundamentals": module01Interactions,
};

export function getLessonInteractions(moduleSlug: string, lessonSlug: string): Interaction[] {
  return BY_MODULE[moduleSlug]?.[lessonSlug] ?? [];
}
