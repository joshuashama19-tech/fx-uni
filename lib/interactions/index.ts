import type { Interaction } from "./types";
import { module01Interactions } from "./module-01";
import { module02Interactions } from "./module-02";
import { module03Interactions } from "./module-03";
import { module04Interactions } from "./module-04";

// Modules 1–4 have hand-authored, lesson-embedded interactions so far —
// Module 1 was the pilot (see module-01.ts's header comment), and Modules
// 2–4 (Batch 1 of the expansion) follow the exact same pattern and
// standard — see each module's own file header. Modules 5–10 intentionally
// return an empty list here; LessonInteractions renders nothing when the
// list is empty, so their lesson pages are unaffected until the same
// standard is applied to them in a future pass.
const BY_MODULE: Record<string, Record<string, Interaction[]>> = {
  "forex-fundamentals": module01Interactions,
  "reading-understanding-charts": module02Interactions,
  "technical-analysis": module03Interactions,
  "price-action": module04Interactions,
};

export function getLessonInteractions(moduleSlug: string, lessonSlug: string): Interaction[] {
  return BY_MODULE[moduleSlug]?.[lessonSlug] ?? [];
}
