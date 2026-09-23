import fs from "fs";
import path from "path";

/**
 * Single source of truth for the photographic/real-world image assets this
 * landing page needs (FX University — Final Premium Landing Page Redesign).
 *
 * No image-generation tool is available in this environment, and the task
 * explicitly says: if one isn't available, "create the image asset slots/
 * components and clearly identify the exact images that need to be
 * supplied. Do NOT substitute them with more SVG illustrations." This file
 * is that manifest — <ImageSlot> (components/visuals/ImageSlot.tsx) reads
 * it to decide, per request, whether a real photo exists yet.
 *
 * To supply a real photo: save it under `public/images/` using the exact
 * `file` name below. Nothing else needs to change — the next request will
 * render it automatically in place of the placeholder. No code touches
 * Supabase, Paystack, pricing, or course content.
 */
export interface ImageAssetSpec {
  /** Filename expected directly under public/images/. */
  file: string;
  /** Accessible alt text used once the real photo is in place. */
  alt: string;
  /** Short label shown inside the placeholder state. */
  label: string;
  /** Content/style brief for whoever sources or shoots the real photo. */
  brief: string;
}

export const imageAssets = {
  heroWorkspace: {
    file: "hero-workspace.jpg",
    alt: "A modern Forex trading workspace at dusk — a laptop showing clean chart analysis on a desk with a notebook and coffee cup",
    label: "Hero — trading workspace",
    brief:
      "A sophisticated, modern trading workspace: laptop/monitor showing a clean Forex chart, professional desk, subtle warm practical lighting, premium dark environment. A person may be present (e.g. hands on the keyboard, seated in soft focus) but the desk/screen stays the visual anchor. No luxury cars, no cash, no fake profit/balance screens, no 'millionaire trader' styling. Landscape, roughly 4:5 to 1:1 (it sits beside the headline on desktop, stacks below it on mobile).",
  },
  learnerReviewingCharts: {
    file: "learner-reviewing-charts.jpg",
    alt: "A learner at a multi-monitor desk reviewing Forex charts, with a notebook and coffee mug nearby",
    label: "Learner reviewing charts",
    brief:
      "A professional African/Nigerian trader or learner (from behind/side is fine) at a desk with chart-filled screens, a notebook and pen, a mug nearby — calm, focused, studying rather than 'trading for profit'. Same lighting/wardrobe/tone family as the hero photo so the two read as one campaign. Roughly 4:5 portrait — it sits opposite the 'why pay for a course' copy.",
  },
  journalReviewCloseup: {
    file: "journal-review-closeup.jpg",
    alt: "A close-up of a trading journal notebook open beside a laptop showing a chart, with a pen resting across the page",
    label: "Trading journal review",
    brief:
      "A close-up, editorial 'flat lay' style shot: an open trading journal/notebook with handwritten notes, a pen, and a laptop or monitor edge showing a chart, on a clean desk. Structured review, not a live trade — no account balances or performance claims in frame. Roughly 4:5 to 1:1 — it sits beside the 'what you get' feature list.",
  },
} satisfies Record<string, ImageAssetSpec>;

export type ImageAssetKey = keyof typeof imageAssets;

/** True once the real photo has been saved to public/images/<file>. */
export function imageAssetExists(file: string): boolean {
  try {
    const filePath = path.join(process.cwd(), "public", "images", file);
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}
