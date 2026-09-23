import type { Interaction } from "./types";
import { module01Interactions } from "./module-01";
import { module02Interactions } from "./module-02";
import { module03Interactions } from "./module-03";
import { module04Interactions } from "./module-04";
import { module05Interactions } from "./module-05";
import { module06Interactions } from "./module-06";
import { module07Interactions } from "./module-07";

// Modules 1–7 have hand-authored, lesson-embedded interactions so far —
// Module 1 was the pilot (see module-01.ts's header comment), Modules 2–4
// were Batch 1 of the expansion, and Modules 5–7 (Fundamental Analysis,
// Risk Management, Trading Psychology) are Batch 2 — see each module's own
// file header for its specific grounding notes. Modules 8–10 intentionally
// return an empty list here; LessonInteractions renders nothing when the
// list is empty, so their lesson pages are unaffected until the same
// standard is applied to them in a future pass.
const BY_MODULE: Record<string, Record<string, Interaction[]>> = {
  "forex-fundamentals": module01Interactions,
  "reading-understanding-charts": module02Interactions,
  "technical-analysis": module03Interactions,
  "price-action": module04Interactions,
  "fundamental-analysis": module05Interactions,
  "risk-management": module06Interactions,
  "trading-psychology": module07Interactions,
};

export function getLessonInteractions(moduleSlug: string, lessonSlug: string): Interaction[] {
  return BY_MODULE[moduleSlug]?.[lessonSlug] ?? [];
}
