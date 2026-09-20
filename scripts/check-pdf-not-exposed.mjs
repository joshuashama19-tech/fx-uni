#!/usr/bin/env node
// Guards the non-negotiable rule: the master PDF
// (content/course/production/output/FX-University-Forex-Trading-Course.pdf)
// must never become reachable from the public web app. Pure Node, zero
// dependencies, actually runnable in any environment.
//
// This checks the SOURCE TREE, not a live deployment (this sandbox cannot
// run `next build`/start a server — see the final report's Testing
// section). It verifies:
//   1. The PDF is not present anywhere under public/ (Next.js serves
//      everything under public/ verbatim at the site root).
//   2. The PDF is not present anywhere under app/ (would make it
//      importable/servable from a route).
//   3. No source file under app/, components/, or lib/ references the PDF's
//      filename or its production/output path at all — i.e. nothing reads
//      it, links to it, or re-exports it toward the browser.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PDF_FILENAME = "FX-University-Forex-Trading-Course.pdf";
const PDF_PATH = path.join(ROOT, "content", "course", "production", "output", PDF_FILENAME);

const CHECK_DIRS_FOR_PRESENCE = ["public", "app"];
const CHECK_DIRS_FOR_REFERENCES = ["app", "components", "lib"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css"]);

let errors = [];

function walk(dir, onFile) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, onFile);
    } else {
      onFile(full);
    }
  }
}

// 1 & 2: the PDF itself must not exist under public/ or app/.
for (const dirName of CHECK_DIRS_FOR_PRESENCE) {
  const dir = path.join(ROOT, dirName);
  walk(dir, (file) => {
    if (path.basename(file) === PDF_FILENAME) {
      errors.push(`Master PDF found inside ${dirName}/: ${path.relative(ROOT, file)}`);
    }
  });
}

// 3: no source file references the PDF filename or its path.
for (const dirName of CHECK_DIRS_FOR_REFERENCES) {
  const dir = path.join(ROOT, dirName);
  walk(dir, (file) => {
    if (!SOURCE_EXTENSIONS.has(path.extname(file))) return;
    const content = fs.readFileSync(file, "utf-8");
    if (content.includes(PDF_FILENAME) || content.includes("production/output")) {
      errors.push(`Reference to the master PDF found in source file: ${path.relative(ROOT, file)}`);
    }
  });
}

console.log(`Master PDF expected at: ${path.relative(ROOT, PDF_PATH)}`);
console.log(`Exists: ${fs.existsSync(PDF_PATH) ? "yes (as a private production artifact — expected)" : "no"}`);

if (errors.length > 0) {
  console.log(`\n${errors.length} problem(s) found:`);
  for (const e of errors) console.log(`  x ${e}`);
  console.log("\nFAILED");
  process.exit(1);
}

console.log("\nPASSED — the master PDF is not present under public/ or app/, and no app/components/lib source file references it.");
console.log(
  "Note: this checks the source tree only. It does not start a server, so it cannot confirm no route " +
    "handler constructs the file path at runtime from an unchecked source — the review above (webhook, " +
    "checkout, course-content, admin routes) is what establishes that."
);
process.exit(0);
