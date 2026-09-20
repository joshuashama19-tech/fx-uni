import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Block } from "./markdown/types";
import { parseMarkdown, stripFrontmatter } from "./markdown/parser";
import { inlineToPlainText, parseInline } from "./markdown/inline";

// Loads the course reader's content directly from the existing, authoritative
// markdown source under content/course/modules/** (and the production
// resource library) — no second, manually-maintained copy of the course.
// Everything here is read fresh per request via cache() (React's per-request
// memoization, not a persistent cache), so a module/lesson is only parsed
// once even when both a layout and a page need it in the same request, and
// nothing here loads the whole course into memory on every /learn request —
// each function reads only the one file it needs.

const MODULES_DIR = path.join(process.cwd(), "content", "course", "modules");
const RESOURCE_LIBRARY_PATH = path.join(
  process.cwd(),
  "content",
  "course",
  "production",
  "resource-library.md"
);

const MODULE_FOLDER_RE = /^module-(\d{2})-(.+)$/;
const LESSON_HEADING_RE = /^Lesson\s+(\d+)\s*[-–—]\s*(.+)$/;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface ModuleSummary {
  /** URL slug, e.g. "forex-fundamentals" (module-01-forex-fundamentals minus its number prefix). */
  slug: string;
  order: number;
  folder: string;
  title: string;
}

export interface LessonSummary {
  slug: string;
  order: number;
  title: string;
}

export interface ModuleDocument {
  slug: string;
  order: number;
  title: string;
  subtitle: string | null;
  introBlocks: Block[];
  objectivesBlocks: Block[];
  lessons: { slug: string; order: number; title: string; blocks: Block[] }[];
  /** Trailing ## sections after the last lesson (e.g. "Key Takeaways", "Before You Move On") — kept, not dropped. */
  wrapUpSections: { title: string; blocks: Block[] }[];
}

/** Sorted list of every module folder under content/course/modules, with its derived slug. */
export const listModuleFolders = cache((): ModuleSummary[] => {
  const entries = fs
    .readdirSync(MODULES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const summaries: ModuleSummary[] = [];
  for (const folder of entries) {
    const m = MODULE_FOLDER_RE.exec(folder);
    if (!m) continue;
    const order = parseInt(m[1], 10);
    const slug = m[2];
    // Title is filled in properly by getModule(); this list is deliberately
    // cheap (no file reads) for nav-building call sites that just need
    // slugs/order.
    summaries.push({ slug, order, folder, title: "" });
  }
  return summaries;
});

function findModuleFolder(moduleSlug: string): ModuleSummary | null {
  return listModuleFolders().find((m) => m.slug === moduleSlug) ?? null;
}

/** Parses one module's 01-content.md into structured sections (intro, objectives, lessons, wrap-up). */
export const getModule = cache((moduleSlug: string): ModuleDocument | null => {
  const summary = findModuleFolder(moduleSlug);
  if (!summary) return null;

  const filePath = path.join(MODULES_DIR, summary.folder, "01-content.md");
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { body } = stripFrontmatter(raw);
  const lines = body.replace(/\r\n/g, "\n").split("\n");

  // Locate every top-level heading (levels 1-3) and its content span.
  type RawSection = { level: number; title: string; startLine: number; endLine: number };
  const headingLines: { level: number; title: string; line: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^(#{1,3})\s+(.*)$/.exec(lines[i]);
    if (m) headingLines.push({ level: m[1].length, title: m[2].trim(), line: i });
  }

  const sections: RawSection[] = headingLines.map((h, idx) => ({
    level: h.level,
    title: h.title,
    startLine: h.line + 1,
    endLine: idx + 1 < headingLines.length ? headingLines[idx + 1].line : lines.length,
  }));

  let title = summary.folder;
  let subtitle: string | null = null;
  let introBlocks: Block[] = [];
  let objectivesBlocks: Block[] = [];
  const lessons: ModuleDocument["lessons"] = [];
  const wrapUpSections: ModuleDocument["wrapUpSections"] = [];
  let sawFirstLesson = false;

  for (const section of sections) {
    const sectionLines = lines.slice(section.startLine, section.endLine);
    const sectionBody = sectionLines.join("\n");

    if (section.level === 1) {
      // "# Module N — Title" — title is the heading text after the em-dash;
      // subtitle is the first italic (*...*) line in this section, if any.
      const titleMatch = /^Module\s+\d+\s*[-–—]\s*(.+)$/.exec(section.title);
      title = titleMatch ? titleMatch[1].trim() : section.title;
      const italicLine = sectionLines.map((l) => l.trim()).find((l) => /^\*.+\*$/.test(l));
      if (italicLine) subtitle = italicLine.replace(/^\*|\*$/g, "");
      continue;
    }

    const lessonMatch = section.level === 3 ? LESSON_HEADING_RE.exec(section.title) : null;
    if (lessonMatch) {
      sawFirstLesson = true;
      const order = parseInt(lessonMatch[1], 10);
      const lessonTitle = lessonMatch[2].trim();
      lessons.push({
        slug: slugify(lessonTitle),
        order,
        title: lessonTitle,
        blocks: parseMarkdown(sectionBody),
      });
      continue;
    }

    if (section.level === 2) {
      const key = section.title.toLowerCase();
      if (!sawFirstLesson && key === "module introduction") {
        introBlocks = parseMarkdown(sectionBody);
      } else if (!sawFirstLesson && key === "learning objectives") {
        objectivesBlocks = parseMarkdown(sectionBody);
      } else if (sawFirstLesson) {
        wrapUpSections.push({ title: section.title, blocks: parseMarkdown(sectionBody) });
      }
      continue;
    }
    // A level-3 heading that isn't "### Lesson N — Title" (shouldn't occur
    // in the current content, but don't silently drop it if it ever does).
    if (section.level === 3) {
      wrapUpSections.push({ title: section.title, blocks: parseMarkdown(sectionBody) });
    }
  }

  lessons.sort((a, b) => a.order - b.order);

  return {
    slug: moduleSlug,
    order: summary.order,
    title,
    subtitle,
    introBlocks,
    objectivesBlocks,
    lessons,
    wrapUpSections,
  };
});

export function listModules(): { slug: string; order: number; title: string; lessonCount: number }[] {
  return listModuleFolders()
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((m) => {
      const full = getModule(m.slug);
      return {
        slug: m.slug,
        order: m.order,
        title: full?.title ?? m.slug,
        lessonCount: full?.lessons.length ?? 0,
      };
    });
}

export function getLesson(
  moduleSlug: string,
  lessonSlug: string
): { module: ModuleDocument; lesson: ModuleDocument["lessons"][number] } | null {
  const mod = getModule(moduleSlug);
  if (!mod) return null;
  const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return null;
  return { module: mod, lesson };
}

export function getAdjacentLessons(moduleSlug: string, lessonSlug: string) {
  const mod = getModule(moduleSlug);
  if (!mod) return { prev: null, next: null };
  const idx = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) return { prev: null, next: null };

  const modules = listModules();
  const modIdx = modules.findIndex((m) => m.slug === moduleSlug);

  const prev =
    idx > 0
      ? { moduleSlug, lessonSlug: mod.lessons[idx - 1].slug, title: mod.lessons[idx - 1].title }
      : modIdx > 0
        ? lastLessonRef(modules[modIdx - 1].slug)
        : null;

  const next =
    idx < mod.lessons.length - 1
      ? { moduleSlug, lessonSlug: mod.lessons[idx + 1].slug, title: mod.lessons[idx + 1].title }
      : modIdx < modules.length - 1
        ? firstLessonRef(modules[modIdx + 1].slug)
        : null;

  return { prev, next };
}

function firstLessonRef(moduleSlug: string) {
  const mod = getModule(moduleSlug);
  const first = mod?.lessons[0];
  if (!mod || !first) return null;
  return { moduleSlug: mod.slug, lessonSlug: first.slug, title: first.title };
}

function lastLessonRef(moduleSlug: string) {
  const mod = getModule(moduleSlug);
  const last = mod?.lessons[mod.lessons.length - 1];
  if (!mod || !last) return null;
  return { moduleSlug: mod.slug, lessonSlug: last.slug, title: last.title };
}

export type ModuleDocKind = "exercises" | "quiz" | "answer-key" | "checklist";

const DOC_FILENAMES: Record<ModuleDocKind, string> = {
  exercises: "02-exercises.md",
  quiz: "03-quiz.md",
  "answer-key": "04-answer-key.md",
  checklist: "05-checklist.md",
};

export const DOC_LABELS: Record<ModuleDocKind, string> = {
  exercises: "Exercises",
  quiz: "Quiz",
  "answer-key": "Answer Key",
  checklist: "Completion Checklist",
};

/** Renders a module's whole exercises/quiz/answer-key/checklist file as blocks. */
export const getModuleDocument = cache(
  (moduleSlug: string, kind: ModuleDocKind): { title: string; blocks: Block[] } | null => {
    const summary = findModuleFolder(moduleSlug);
    if (!summary) return null;
    const filePath = path.join(MODULES_DIR, summary.folder, DOC_FILENAMES[kind]);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    const { body } = stripFrontmatter(raw);
    const blocks = parseMarkdown(body);
    const firstHeading = blocks.find((b) => b.type === "heading");
    const title =
      firstHeading && firstHeading.type === "heading"
        ? inlineToPlainText(firstHeading.children)
        : DOC_LABELS[kind];
    return { title, blocks };
  }
);

/** The compiled Practical Resource Library (production/resource-library.md), rendered whole. */
export const getResourceLibrary = cache((): { title: string; blocks: Block[] } | null => {
  if (!fs.existsSync(RESOURCE_LIBRARY_PATH)) return null;
  const raw = fs.readFileSync(RESOURCE_LIBRARY_PATH, "utf-8");
  const { body } = stripFrontmatter(raw);
  const blocks = parseMarkdown(body);
  return { title: "Practical Resource Library", blocks };
});

/** A single inline-parsed line of plain text, for places that need one label, not a whole document. */
export function parseInlineText(text: string) {
  return parseInline(text);
}
