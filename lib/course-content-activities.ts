import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Block, InlineNode } from "./markdown/types";
import { getModule, getModuleDocument, listModuleFolders, slugify } from "./course-content";

// Parses a module's Exercises/Quiz/Answer-Key/Checklist markdown into
// student-facing structures (quiz questions, grouped checklist items), and
// scrubs raw internal filenames (01-content.md, 02-exercises.md, etc.) out
// of anything rendered to the student — see humanizeFileRefInline() and
// dropFileReferenceBlocks() below for exactly how and why.
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
};

const FILE_REF_RE = /^(0[1-5]-[a-z-]+)\.md$/;

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
 * Drops any paragraph/list block that mentions one of this course's own
 * markdown files by name — these are always pure "go open 02-exercises.md
 * next" navigation instructions, fully superseded by the real Exercises/
 * Knowledge Check/Checklist links the student-facing UI provides instead
 * (the Module Activities cards, the Module Completion panel). Every other
 * block — including the substantive educational sentences that happen to
 * share a section with one of these — is kept exactly as authored. This is
 * intentionally narrow: it only ever removes a block that does nothing but
 * point at a raw filename, never a block that teaches something.
 */
export function dropFileReferenceBlocks(blocks: Block[]): Block[] {
  return blocks.filter((block) => {
    if (block.type === "paragraph" || block.type === "blockquote") {
      return !inlineContainsFileRef(block.children);
    }
    if (block.type === "list" || block.type === "checklist") {
      return !block.items.some((item) => inlineContainsFileRef(item));
    }
    return true;
  });
}

/**
 * Pulls the "Before You Move On" wrap-up section (present at the end of
 * every module's 01-content.md) out of the module's other wrap-up sections
 * (e.g. "Key Takeaways", which is unaffected and keeps rendering on the
 * module page as before), and strips its raw-filename navigation
 * instructions per dropFileReferenceBlocks() above — the Module Completion
 * section (app/learn/[module]/page.tsx) renders what's left (the module's
 * own educational framing/disclaimer sentences, verbatim) above a real,
 * computed completion status panel that replaces the stripped instructions.
 */
export function splitModuleWrapUp(mod: { wrapUpSections: { title: string; blocks: Block[] }[] }): {
  keepSections: { title: string; blocks: Block[] }[];
  beforeYouMoveOn: Block[] | null;
} {
  const idx = mod.wrapUpSections.findIndex((s) => s.title.trim().toLowerCase() === "before you move on");
  if (idx === -1) return { keepSections: mod.wrapUpSections, beforeYouMoveOn: null };
  const section = mod.wrapUpSections[idx];
  const keepSections = mod.wrapUpSections.filter((_, i) => i !== idx);
  return { keepSections, beforeYouMoveOn: dropFileReferenceBlocks(section.blocks) };
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
}

export const getChecklist = cache((moduleSlug: string): ParsedChecklist | null => {
  const mod = getModule(moduleSlug);
  const doc = getModuleDocument(moduleSlug, "checklist");
  if (!mod || !doc) return null;

  const intro: Block[] = [];
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
      for (const itemNodes of block.items) {
        current.items.push({
          id: `${groupSlug}-${current.items.length}`,
          text: humanizeFileRefInline(itemNodes),
        });
      }
      continue;
    }
    if (!current) {
      // Anything before the first "###" group (the checklist's own short
      // framing paragraph) — keep as page intro.
      intro.push(block);
    }
  }

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  return { moduleSlug, title: doc.title, intro, groups, totalItems };
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
