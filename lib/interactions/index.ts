import type { Interaction } from "./types";
import { module01Interactions } from "./module-01";
import { module02Interactions } from "./module-02";
import { module03Interactions } from "./module-03";
import { module04Interactions } from "./module-04";
import { module05Interactions } from "./module-05";
import { module06Interactions } from "./module-06";
import { module07Interactions } from "./module-07";
import { module08Interactions } from "./module-08";
import { module09Interactions } from "./module-09";
import { module10Interactions } from "./module-10";

// All 10 modules now have hand-authored, lesson-embedded interactions —
// Module 1 was the pilot (see module-01.ts's header comment), Modules 2–4
// were Batch 1, Modules 5–7 (Fundamental Analysis, Risk Management, Trading
// Psychology) were Batch 2, and Modules 8–10 (Building a Trading Plan,
// Backtesting & Trading Journal, Practical Forex Development) are Batch 3 —
// see each module's own file header for its specific grounding notes.
const BY_MODULE: Record<string, Record<string, Interaction[]>> = {
  "forex-fundamentals": module01Interactions,
  "reading-understanding-charts": module02Interactions,
  "technical-analysis": module03Interactions,
  "price-action": module04Interactions,
  "fundamental-analysis": module05Interactions,
  "risk-management": module06Interactions,
  "trading-psychology": module07Interactions,
  "building-a-trading-plan": module08Interactions,
  "backtesting-trading-journal": module09Interactions,
  "practical-forex-development": module10Interactions,
};

export function getLessonInteractions(moduleSlug: string, lessonSlug: string): Interaction[] {
  return BY_MODULE[moduleSlug]?.[lessonSlug] ?? [];
}
