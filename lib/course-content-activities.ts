import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Block, InlineNode } from "./markdown/types";
import { getModule, getModuleDocument, listModuleFolders, slugify } from "./course-content";

// Parses a module's Exercises/Quiz/Answer-Key/Checklist markdown into
// student-facing structures (quiz questions, grouped checklist items), and
// scrubs raw internal filenames (01-content.md, 02-exercises.md, etc.) out
// of anything rendered to the student — see humanizeFileRefInline() and
// humanizeBlocks() below for exactly how and why.
//
// The quiz/answer-key format ("**N. Multiple choice.** ...", "A) ...",
// "**N. Answer: B) ...**" / "**N. Answer guide.** ...") is consistent
// across all 10 modules' 03-quiz.md/04-answer-key.md pairs — verified by a
// standalone prototype parser run against the real content for every
// module before this was written (all 10 modules parsed cleanly: every
// question matched its declared `question_count`, every question had a
// matching answer block, and question/answer numbering aligned exactly).

const MODULES_DIR = path.join(process.cwd(), "content", "course", "modules");

// ---------------------------------------------------------------------------
// Raw filename → human label. Applied wherever course markdown mentions one
// of its own sibling files by name, so the student-facing UI never shows
// "02-exercises.md" as a piece of navigation — see the module page (Module
// Completion section) and the Exercises/Checklist pages for where this is
// used.
// ---------------------------------------------------------------------------
const FILE_LABELS: Record<string, string> = {
  "01-content": "the lesson content",
  "02-exercises": "the Exercises",
  "03-quiz": "the Knowledge Check",
  "04-answer-key": "the answer key",
  "05-checklist": "the Completion Checklist",
  // Referenced once, in Module 1's "Before You Move On" risk-disclosure
  // sentence ("see the full risk disclosure in `course-overview.md`") —
  // not one of the five per-module files, but the same rule applies: never
  // show the raw filename to a student. humanizeFileRefInline() already
  // recurses into a `link` node's children, so this is enough to catch it
  // whether it's wrapped in a markdown link (as it is here) or bare code.
  "course-overview": "the course overview",
};

const FILE_REF_RE = /^(0[1-5]-[a-z-]+|course-overview)\.md$/;

function fileRefLabel(codeValue: string): string | null {
  const m = FILE_REF_RE.exec(codeValue.trim());
  if (!m) return null;
  return FILE_LABELS[m[1]] ?? null;
}

/** Recursively walks inline nodes, replacing a `code` node that names one of
 * this course's own markdown files (e.g. `` `02-exercises.md` ``) with a
 * plain text node carrying its human label (e.g. "the Exercises"). Every
 * other inline node — including the surrounding bold wrapper, if any — is
 * left exactly as authored. Used for short, template-like text (checklist
 * items) where an in-place word swap reads naturally. */
export function humanizeFileRefInline(nodes: InlineNode[]): InlineNode[] {
  return nodes.map((node): InlineNode => {
    if (node.type === "code") {
      const label = fileRefLabel(node.value);
      return label ? { type: "text", value: label } : node;
    }
    if (node.type === "bold" || node.type === "italic") {
      return { ...node, children: humanizeFileRefInline(node.children) };
    }
    if (node.type === "link") {
      return { ...node, children: humanizeFileRefInline(node.children) };
    }
    return node;
  });
}

function inlineContainsFileRef(nodes: InlineNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === "code") return fileRefLabel(node.value) !== null;
    if (node.type === "bold" || node.type === "italic" || node.type === "link") {
      return inlineContainsFileRef(node.children);
    }
    return false;
  });
}

/**
 * Applies humanizeFileRefInline to every inline slot of every block —
 * paragraphs, blockquotes, headings, list/checklist items, table cells.
 * Unlike the old drop-the-whole-block approach this replaced, it never
 * removes a sentence: every block that isn't purely a raw-filename
 * cross-reference keeps every word it was authored with, just with any
 * `01-content.md`-style mention swapped for its human label (see
 * fileRefLabel() above). Safe to run over content that has no file
 * references at all — those blocks pass through unchanged.
 */
export function humanizeBlocks(blocks: Block[]): Block[] {
  return blocks.map((block): Block => {
    switch (block.type) {
      case "heading":
      case "subhead":
      case "paragraph":
      case "blockquote":
        return { ...block, children: humanizeFileRefInline(block.children) };
      case "list":
      case "checklist":
        return { ...block, items: block.items.map((item) => humanizeFileRefInline(item)) };
      case "table":
        return {
          ...block,
          header: block.header.map((cell) => humanizeFileRefInline(cell)),
          rows: block.rows.map((row) => row.map((cell) => humanizeFileRefInline(cell))),
        };
      default:
        return block;
    }
  });
}

/**
 * True for a `list` block whose items are nothing but "go open this file"
 * navigation (every item names one of this course's own files) — the
 * pattern used by every module 1-8's "Before You Move On" 3-item list
 * ("Work through `02-exercises.md`...", "Complete the `03-quiz.md`...",
 * "Go through the full `05-checklist.md`..."). humanizeBlocks() can't turn
 * these into clean prose in place — several items already have their own
 * leading "the"/"the full" article right before the file reference, so a
 * word-for-word swap for a label that itself starts with "the" produces
 * "the the Knowledge Check" — so splitModuleWrapUp() below drops a block
 * like this entirely and the Module Completion panel renders its own
 * equivalent instruction list instead (clean, and impossible to leak a
 * filename from, since it's not sourced from markdown at all).
 */
function isPureFileInstructionList(block: Block): boolean {
  return block.type === "list" && block.items.length > 0 && block.items.every((item) => inlineContainsFileRef(item));
}

/**
 * Pulls the "Before You Move On" wrap-up section (present at the end of
 * every module's 01-content.md) out of the module's other wrap-up sections
 * (e.g. "Key Takeaways", which is unaffected and keeps rendering on the
 * module page as before). Drops only the pure file-navigation list
 * (isPureFileInstructionList() above — modules 1-8's numbered "work through
 * X" list; the Module Completion panel renders its own replacement for
 * this), and humanizes (never drops) everything else in the section,
 * including modules 9-10's single paragraph that mixes a file-navigation
 * clause with a real, module-specific transition sentence — splitting that
 * one at the sentence level isn't reliable from the parsed block tree, and
 * word-swapping it in place keeps 100% of the original sentence, just
 * without the raw filenames.
 */
export function splitModuleWrapUp(mod: { wrapUpSections: { title: string; blocks: Block[] }[] }): {
  keepSections: { title: string; blocks: Block[] }[];
  /**
   * Content before the dropped instruction list (module 1-8's own lead-in
   * sentence — "This module ends with three things to actually complete
   * before starting Module N — not just read:" — which ends in a colon
   * that's meant to introduce a list, so it has to stay paired with
   * whatever list follows it). Empty when there was no list to split
   * around (modules 9-10, or a module with no "Before You Move On"
   * section at all).
   */
  beforeList: Block[];
  /** Content after the dropped instruction list — or everything in the section, when there was no list (modules 9-10's single fused paragraph). */
  afterList: Block[];
  /** True when a pure file-instruction list was actually found and dropped (modules 1-8) — tells the caller whether it's filling a real gap or just adding a redundant reminder (modules 9-10). */
  hadInstructionList: boolean;
} {
  const idx = mod.wrapUpSections.findIndex((s) => s.title.trim().toLowerCase() === "before you move on");
  if (idx === -1) return { keepSections: mod.wrapUpSections, beforeList: [], afterList: [], hadInstructionList: false };
  const section = mod.wrapUpSections[idx];
  const keepSections = mod.wrapUpSections.filter((_, i) => i !== idx);
  const listIdx = section.blocks.findIndex((b) => isPureFileInstructionList(b));
  if (listIdx === -1) {
    return { keepSections, beforeList: [], afterList: humanizeBlocks(section.blocks), hadInstructionList: false };
  }
  return {
    keepSections,
    beforeList: humanizeBlocks(section.blocks.slice(0, listIdx)),
    afterList: humanizeBlocks(section.blocks.slice(listIdx + 1)),
    hadInstructionList: true,
  };
}

/**
 * Drops only the document's own first-level heading (already shown as the
 * page's own styled <h1> — e.g. ExercisesPage — so keeping it would render
 * the title twice), then humanizes every remaining block. Used for
 * Exercises specifically: unlike the quiz/checklist, its body is rendered
 * close to verbatim (framing paragraph + the exercises themselves), so
 * every sentence — including the ones that happen to name a sibling file —
 * is kept, just with the filename swapped for a label.
 */
export function prepareExerciseBlocks(blocks: Block[]): Block[] {
  const firstHeadingIdx = blocks.findIndex((b) => b.type === "heading" && b.level === 1);
  const withoutTitle = firstHeadingIdx === -1 ? blocks : blocks.filter((_, i) => i !== firstHeadingIdx);
  return humanizeBlocks(withoutTitle);
}

// ---------------------------------------------------------------------------
// Checklist — reuses the existing generic Markdown parser's output (it
// already correctly folds wrapped "- [ ]" lines into one checklist block
// per contiguous group, with real inline-formatted InlineNode[] items) and
// just groups those blocks under their preceding "### Heading", rather than
// re-parsing the raw file with a second, bespoke parser.
// ---------------------------------------------------------------------------
export interface ChecklistItem {
  /** Stable across reloads (derived from the group title + position), e.g. "core-understanding-0". Never derived from student input. */
  id: string;
  text: InlineNode[];
}
export interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}
export interface ParsedChecklist {
  moduleSlug: string;
  title: string;
  /** Intro blocks before the first "###" group (checklist.md's own "Before You Move On" framing paragraph) — rendered as-is, no filename refs present in it in any module. */
  intro: Block[];
  groups: ChecklistGroup[];
  totalItems: number;
  /**
   * Blocks after the last "###" group's items (every module's closing
   * "you're ready for the next module" / "go back and re-read" paragraph,
   * often after an "---" divider). The original loop here only ever
   * collected pre-group blocks into `intro` and silently discarded
   * anything after the last group — dropping this real closing content on
   * every module's checklist page. Now collected and humanized like
   * everything else, instead of lost.
   */
  outro: Block[];
}

/**
 * Every module's checklist "Practice completed" group has the same 3 items,
 * e.g. (module 1): "I completed all 11 exercises in `02-exercises.md`.",
 * "I completed the 15-question checkpoint in `03-quiz.md` before looking at
 * the answers.", "I checked my answers against `04-answer-key.md` and
 * re-read any lesson connected to a question I missed." A plain filename
 * swap (humanizeFileRefInline) still leaves that third item describing an
 * internal "answer key" the student looks things up against, which is
 * exactly the framing the student-facing UI shouldn't use — the Knowledge
 * Check's own review screen is what a student actually interacts with, not
 * a standalone answer key. So this group's 3 items are replaced outright
 * with fixed wrapper copy (not sourced from markdown, so nothing to leak)
 * that talks about "Knowledge Check results" instead. Returns null for
 * every other group, which keeps the parsed original text (word-swapped by
 * humanizeFileRefInline as usual).
 */
function practiceCompletedOverrides(groupTitle: string, moduleOrder: number): InlineNode[][] | null {
  if (groupTitle.trim().toLowerCase() !== "practice completed") return null;
  const text = (value: string): InlineNode[] => [{ type: "text", value }];
  return [
    text(`I completed the Module ${moduleOrder} exercises.`),
    text(`I completed the Module ${moduleOrder} Knowledge Check before reviewing my results.`),
    text("I reviewed my Knowledge Check results and revisited any lessons connected to questions I missed."),
  ];
}

export const getChecklist = cache((moduleSlug: string): ParsedChecklist | null => {
  const mod = getModule(moduleSlug);
  const doc = getModuleDocument(moduleSlug, "checklist");
  if (!mod || !doc) return null;

  const intro: Block[] = [];
  const outro: Block[] = [];
  const groups: ChecklistGroup[] = [];
  let current: ChecklistGroup | null = null;

  for (const block of doc.blocks) {
    if (block.type === "heading" && block.level === 1) {
      // "# Module N — Completion Checklist" — already shown as the page's
      // own <h1> via doc.title; don't duplicate it in the body.
      continue;
    }
    if (block.type === "heading" && block.level === 2) {
      // e.g. "## Before You Move On" — its own intro heading, not a group.
      continue;
    }
    if (block.type === "heading" && block.level === 3) {
      current = { title: block.children.map((n) => (n.type === "text" ? n.value : "")).join(""), items: [] };
      groups.push(current);
      continue;
    }
    if (block.type === "checklist" && current) {
      const groupSlug = slugify(current.title);
      const overrides = practiceCompletedOverrides(current.title, mod.order);
      for (const itemNodes of block.items) {
        const index = current.items.length;
        current.items.push({
          id: `${groupSlug}-${index}`,
          // "Practice completed" items are replaced with our own wrapper
          // copy below, not humanized in place — see
          // practiceCompletedOverrides() for why a word-swap alone isn't
          // enough here. The item's own id is still derived purely from
          // position (group slug + index), same as every other group, so
          // a student's already-persisted checked state for these 3 items
          // isn't affected by this — the id never depended on the text.
          text: overrides?.[index] ?? humanizeFileRefInline(itemNodes),
        });
      }
      continue;
    }
    if (!current) {
      // Anything before the first "###" group (the checklist's own short
      // framing paragraph) — keep as page intro.
      intro.push(block);
    } else if (block.type !== "checklist") {
      // Anything after the last group that isn't itself a checklist block
      // (e.g. the "---" divider and closing paragraph every module ends
      // with) — keep as page outro, rendered after the interactive list.
      outro.push(block);
    }
  }

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  return { moduleSlug, title: doc.title, intro, groups, totalItems, outro: humanizeBlocks(outro) };
});

// ---------------------------------------------------------------------------
// Quiz — the "**N. Type.** prompt / A) ... B) ..." format used by every
// module's 03-quiz.md, cross-referenced against 04-answer-key.md's
// "**N. Answer: ...**" / "**N. Answer guide.** ..." format. Parsed from raw
// text (not the generic block parser) because this inline convention is
// specific to the quiz/answer-key files and doesn't map onto the generic
// heading/paragraph/list block model.
// ---------------------------------------------------------------------------
export type QuizQuestionType = "mc" | "tf" | "open";

export interface QuizOption {
  letter: string;
  text: string;
}

/** Safe to send to the client before the quiz is submitted — no correct answer, no explanation. */
export interface QuizQuestionPublic {
  num: number;
  type: QuizQuestionType;
  prompt: string;
  options?: QuizOption[];
}

/** Server-side only until the student has submitted this question. */
export interface QuizQuestionGraded extends QuizQuestionPublic {
  correctLetter?: string;
  correctBool?: boolean;
  explanation: string;
}

export interface ParsedQuiz {
  moduleSlug: string;
  title: string;
  questions: QuizQuestionGraded[];
}

function stripFrontmatterBody(raw: string): string {
  const m = /^---\n[\s\S]*?\n---\n?/.exec(raw);
  return m ? raw.slice(m[0].length) : raw;
}

function splitNumberedBlocks(body: string, markerRe: RegExp): { num: number; text: string }[] {
  const lines = body.split("\n");
  const starts: { line: number; num: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = markerRe.exec(lines[i]);
    if (m) starts.push({ line: i, num: parseInt(m[1], 10) });
  }
  const blocks: { num: number; text: string }[] = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].line;
    const end = i + 1 < starts.length ? starts[i + 1].line : lines.length;
    blocks.push({ num: starts[i].num, text: lines.slice(start, end).join("\n").trim() });
  }
  return blocks;
}

const QUESTION_START_RE = /^\*\*(\d+)\.\s+([A-Za-z][A-Za-z /-]*?)\.\*\*/;
const ANSWER_START_RE = /^\*\*(\d+)\.\s+Answer/;
const OPTION_RE = /(^|\n)([A-E])\)\s+/g;

function parseQuestionBlock(block: { num: number; text: string }): { type: QuizQuestionType; prompt: string; options?: QuizOption[] } {
  const m = QUESTION_START_RE.exec(block.text);
  if (!m) return { type: "open", prompt: block.text.replace(/\s+/g, " ").trim() };

  const typeLabel = m[2].toLowerCase();
  let type: QuizQuestionType = "open";
  if (typeLabel.includes("multiple choice")) type = "mc";
  else if (typeLabel.includes("true or false") || typeLabel.includes("true/false")) type = "tf";

  const afterLabel = block.text.slice(m[0].length).trim();
  const optionMatches = [...afterLabel.matchAll(OPTION_RE)];

  if (type === "mc" && optionMatches.length >= 2) {
    const prompt = afterLabel.slice(0, optionMatches[0].index).replace(/\s+/g, " ").trim();
    const options: QuizOption[] = optionMatches.map((om, i) => {
      const start = (om.index ?? 0) + om[0].length;
      const end = i + 1 < optionMatches.length ? optionMatches[i + 1].index! : afterLabel.length;
      return { letter: om[2], text: afterLabel.slice(start, end).replace(/\s+/g, " ").trim() };
    });
    return { type, prompt, options };
  }
  return { type, prompt: afterLabel.replace(/\s+/g, " ").trim() };
}

type ParsedAnswer =
  | { num: number; kind: "mc"; correctLetter: string; explanation: string }
  | { num: number; kind: "tf"; correctBool: boolean; explanation: string }
  | { num: number; kind: "open"; explanation: string }
  | { num: number; kind: "unparsed" };

function parseAnswerBlock(block: { num: number; text: string }): ParsedAnswer {
  const m = ANSWER_START_RE.exec(block.text);
  if (!m) return { num: block.num, kind: "unparsed" };
  const rest = block.text.slice(m[0].length);

  const guideMatch = /^\s*guide\.\*\*\s*([\s\S]*)$/.exec(rest);
  if (guideMatch) {
    return { num: block.num, kind: "open", explanation: guideMatch[1].replace(/\s+/g, " ").trim() };
  }

  const colonMatch = /^:\s*([\s\S]*?)\*\*([\s\S]*)$/.exec(rest);
  if (colonMatch) {
    const boldPart = colonMatch[1].trim();
    const restExplanation = colonMatch[2].replace(/\s+/g, " ").trim();
    const mcMatch = /^([A-E])\)/.exec(boldPart);
    if (mcMatch) {
      return {
        num: block.num,
        kind: "mc",
        correctLetter: mcMatch[1],
        explanation: `${boldPart} ${restExplanation}`.trim(),
      };
    }
    if (/^true$/i.test(boldPart)) return { num: block.num, kind: "tf", correctBool: true, explanation: restExplanation };
    if (/^false$/i.test(boldPart)) return { num: block.num, kind: "tf", correctBool: false, explanation: restExplanation };
    return { num: block.num, kind: "open", explanation: `${boldPart} ${restExplanation}`.trim() };
  }
  return { num: block.num, kind: "unparsed" };
}

/**
 * Full graded quiz data — SERVER-SIDE USE ONLY. Never pass the result of
 * this function to a Client Component or a Server Action's return value
 * for an unsubmitted attempt; use toPublicQuiz() for that. See
 * lib/progress/actions.ts (submitQuizAction) for where the split is
 * enforced.
 */
export const getQuiz = cache((moduleSlug: string): ParsedQuiz | null => {
  const mod = getModule(moduleSlug);
  const folder = listModuleFolders().find((m) => m.slug === moduleSlug)?.folder;
  if (!mod || !folder) return null;
  const quizPath = path.join(MODULES_DIR, folder, "03-quiz.md");
  const keyPath = path.join(MODULES_DIR, folder, "04-answer-key.md");
  if (!fs.existsSync(quizPath) || !fs.existsSync(keyPath)) return null;

  const quizBody = stripFrontmatterBody(fs.readFileSync(quizPath, "utf-8"));
  // Every 04-answer-key.md ends with a "---" divider followed by a whole-quiz
  // "Scoring guide" closing note (not tied to any one question) — cut it off
  // before splitting into per-question blocks, so it doesn't get glued onto
  // the last question's explanation.
  const keyBodyFull = stripFrontmatterBody(fs.readFileSync(keyPath, "utf-8"));
  const scoringGuideSplit = /\n---\n/.exec(keyBodyFull);
  const keyBody = scoringGuideSplit ? keyBodyFull.slice(0, scoringGuideSplit.index) : keyBodyFull;

  const qBlocks = splitNumberedBlocks(quizBody, /^\*\*(\d+)\.\s+[A-Za-z]/);
  const aBlocks = splitNumberedBlocks(keyBody, /^\*\*(\d+)\.\s+Answer/);
  const answersByNum = new Map(aBlocks.map((b) => [b.num, parseAnswerBlock(b)]));

  const questions: QuizQuestionGraded[] = qBlocks.map((qb) => {
    const parsed = parseQuestionBlock(qb);
    const answer = answersByNum.get(qb.num);
    const base: QuizQuestionGraded = {
      num: qb.num,
      type: parsed.type,
      prompt: parsed.prompt,
      options: parsed.options,
      explanation: answer && answer.kind !== "unparsed" ? answer.explanation : "",
    };
    if (answer?.kind === "mc") base.correctLetter = answer.correctLetter;
    if (answer?.kind === "tf") base.correctBool = answer.correctBool;
    return base;
  });

  return { moduleSlug, title: `Module ${mod.order} — Knowledge Check`, questions };
});

/** Strips correct-answer/explanation fields — this is what's safe to send to the browser before submission. */
export function toPublicQuiz(quiz: ParsedQuiz): QuizQuestionPublic[] {
  return quiz.questions.map((q) => ({ num: q.num, type: q.type, prompt: q.prompt, options: q.options }));
}
