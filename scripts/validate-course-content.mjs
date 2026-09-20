#!/usr/bin/env node
// Validates that content/course/modules/** has the structure the /learn
// reader (lib/course-content.ts) expects: 10 modules, each with the
// expected lesson count, no missing 02/03/04/05 support files, no duplicate
// lesson slugs within a module, and that the production resource library
// exists. Pure Node, zero dependencies — actually runnable in any
// environment (including this sandbox, which cannot `npm install`), unlike
// `next build`/`tsc`.
//
// This intentionally does NOT re-implement lib/markdown/parser.ts's full
// block parsing — just enough heading/slug logic to check structure, so
// there is no second, drifting copy of the real parser.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MODULES_DIR = path.join(ROOT, "content", "course", "modules");
const RESOURCE_LIBRARY = path.join(ROOT, "content", "course", "production", "resource-library.md");

const EXPECTED_MODULE_COUNT = 10;
// Known-good lesson counts per module, established during the course
// content build (see content/course/production/pdf-build-report.md).
const EXPECTED_LESSON_COUNTS = {
  "module-01-forex-fundamentals": 13,
  "module-02-reading-understanding-charts": 13,
  "module-03-technical-analysis": 13,
  "module-04-price-action": 12,
  "module-05-fundamental-analysis": 14,
  "module-06-risk-management": 12,
  "module-07-trading-psychology": 14,
  "module-08-building-a-trading-plan": 14,
  "module-09-backtesting-trading-journal": 15,
  "module-10-practical-forex-development": 15,
};

const REQUIRED_MODULE_FILES = ["01-content.md", "02-exercises.md", "03-quiz.md", "04-answer-key.md", "05-checklist.md"];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let errors = [];
let warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

if (!fs.existsSync(MODULES_DIR)) {
  console.log(`x Modules directory not found: ${MODULES_DIR}`);
  console.log("\nFAILED");
  process.exit(1);
}

const folders = fs
  .readdirSync(MODULES_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

if (folders.length !== EXPECTED_MODULE_COUNT) {
  fail(`Expected ${EXPECTED_MODULE_COUNT} module folders, found ${folders.length}: ${folders.join(", ")}`);
}

const seenModuleSlugs = new Set();
const allModuleSummaries = [];

for (const folder of folders) {
  const match = /^module-(\d{2})-(.+)$/.exec(folder);
  if (!match) {
    fail(`Module folder does not match expected "module-NN-slug" pattern: ${folder}`);
    continue;
  }
  const [, orderStr, slug] = match;
  const order = parseInt(orderStr, 10);

  if (seenModuleSlugs.has(slug)) {
    fail(`Duplicate module slug "${slug}" (folder: ${folder})`);
  }
  seenModuleSlugs.add(slug);

  const folderPath = path.join(MODULES_DIR, folder);
  for (const requiredFile of REQUIRED_MODULE_FILES) {
    if (!fs.existsSync(path.join(folderPath, requiredFile))) {
      fail(`Missing required file: ${folder}/${requiredFile}`);
    }
  }

  const contentPath = path.join(folderPath, "01-content.md");
  if (!fs.existsSync(contentPath)) continue;

  const raw = fs.readFileSync(contentPath, "utf-8");
  const body = raw.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
  const lines = body.split("\n");

  const lessonSlugs = new Set();
  const lessons = [];
  for (const line of lines) {
    const m = /^###\s+Lesson\s+(\d+)\s*[-–—]\s*(.+)$/.exec(line.trim());
    if (!m) continue;
    const lessonOrder = parseInt(m[1], 10);
    const title = m[2].trim();
    const lessonSlug = slugify(title);
    if (lessonSlugs.has(lessonSlug)) {
      fail(`Duplicate lesson slug "${lessonSlug}" within ${folder} (title: "${title}")`);
    }
    lessonSlugs.add(lessonSlug);
    lessons.push({ order: lessonOrder, title, slug: lessonSlug });
  }

  if (lessons.length === 0) {
    fail(`No "### Lesson N — Title" headings found in ${folder}/01-content.md`);
  }

  const expectedCount = EXPECTED_LESSON_COUNTS[folder];
  if (expectedCount !== undefined && lessons.length !== expectedCount) {
    fail(`${folder}: expected ${expectedCount} lessons, found ${lessons.length}`);
  } else if (expectedCount === undefined) {
    warn(`${folder}: no expected lesson count on file for comparison (found ${lessons.length})`);
  }

  // Lesson order should be 1..N with no gaps or duplicates.
  const orders = lessons.map((l) => l.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) {
      fail(`${folder}: lesson numbering has a gap or duplicate — expected ${i + 1}, found ${orders[i]}`);
      break;
    }
  }

  allModuleSummaries.push({ slug, order, folder, lessonCount: lessons.length });
}

// Route uniqueness across the whole course: /learn/<module-slug> must be
// unique (checked above) and every module's own lesson slugs must be
// unique within that module (checked above) — the full route
// /learn/<module>/<lesson> is therefore guaranteed unique.

// Previous/next navigation resolves as long as modules are contiguously
// ordered 1..10 with no gaps — verify that too.
const orders = allModuleSummaries.map((m) => m.order).sort((a, b) => a - b);
for (let i = 0; i < orders.length; i++) {
  if (orders[i] !== i + 1) {
    fail(`Module numbering has a gap or duplicate — expected ${i + 1}, found ${orders[i]}`);
    break;
  }
}

if (!fs.existsSync(RESOURCE_LIBRARY)) {
  fail(`Resource library not found: ${RESOURCE_LIBRARY}`);
}

function report() {
  console.log(`Checked ${allModuleSummaries.length} module(s).`);
  for (const m of allModuleSummaries) {
    console.log(`  - ${m.folder}: slug="${m.slug}", ${m.lessonCount} lessons`);
  }
  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  ! ${w}`);
  }
  if (errors.length > 0) {
    console.log(`\n${errors.length} error(s):`);
    for (const e of errors) console.log(`  x ${e}`);
    console.log("\nFAILED");
    process.exit(1);
  }
  console.log("\nPASSED — course content structure matches what the /learn reader expects.");
  process.exit(0);
}

report();
