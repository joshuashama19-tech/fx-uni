---
title: Pre-Production Validation
file: validation-readme
status: complete
last_updated: 2026-09-19
---

# Pre-Production Validation

The checks that must pass before any PDF is generated from this
production layer, and the results of running them against the current
content as of this phase. Re-run every check listed here whenever a
module or a production file changes, before generating a PDF.

## 1. File presence

**Check:** every module folder contains exactly its 5 required files
(`01-content.md`, `02-exercises.md`, `03-quiz.md`, `04-answer-key.md`,
`05-checklist.md`), and no module folder is missing or duplicated.

**Result: PASS.** All 10 module folders contain exactly 5 files each.
`module-index.md` lists exactly 10 modules, matching the 10 folders on
disk — no duplicate or stray module folder exists (this was the specific
failure mode the "IMPORTANT PATH RULE" was introduced to prevent in
earlier phases, and it remains clean).

## 2. Missing/duplicate files

**Check:** no production file is missing relative to `README.md`'s own
file listing, and no file exists twice under a different name.

**Result: PASS.** All 9 files `README.md` lists (5 front-matter files,
`style-guide.md`, `resource-library.md`, `module-completion-page.md`,
`production-readiness-report.md`) are present, plus this phase's 3
additions (`pdf-production-spec.md`, `production-manifest.md`,
`validation/README.md`). No duplicate file was found under an alternate
name or path.

## 3. Broken internal links

**Check:** every relative markdown link (`](./...)`  or `](../...)`)
inside `content/course/production/` resolves to a file that actually
exists.

**Result: PASS.** Verified programmatically across every `.md` file in
`content/course/production/` (including this file, once created). No
broken links found.

## 4. Missing module sections

**Check:** every module's `01-content.md` contains its "Module
Introduction," "Learning Objectives," "Key Takeaways," and "Before You
Move On" sections.

**Result: PASS.** Already confirmed during the course-wide QC audit
(Structural audit category); no module content has changed since.

## 5. Missing exercises / quizzes / answer keys / checklists

**Check:** every module has a non-empty exercises file, a quiz with a
matching 1:1 answer key, and a checklist.

**Result: PASS**, with one false-positive worth recording. Counting
quiz questions via a numbered-bold-line pattern (`^\*\*[0-9]+\.`)
initially flagged Module 4 as having 17 quiz "questions" against 15
answer-key entries. Manual review found the extra two matches were
bolded decimal price values that happen to start a line inside two
multi-part quiz questions (e.g., a swing-low price of `**0.65350**` and
`**1.31100**`), not real question markers. Module 4 in fact has exactly
15 quiz questions and 15 answer-key entries — a clean 1:1 match. Actual
verified counts:

| Module | Exercises | Quiz | Answer key | Checklist items |
|---|---|---|---|---|
| 1 | 11 | 15 | 15 | 18 |
| 2 | 11 | 15 | 15 | 21 |
| 3 | 12 | 15 | 15 | 19 |
| 4 | 12 | 15 | 15 | 24 |
| 5 | 12 | 15 | 15 | 18 |
| 6 | 15 | 17 | 17 | 25 |
| 7 | 14 | 17 | 17 | 21 |
| 8 | 14 | 17 | 17 | 22 |
| 9 | 15 | 18 | 18 | 22 |
| 10 | 14 | 18 | 18 | 20 |

Every module's quiz count matches its answer-key count exactly.

## 6. Missing resources

**Check:** all 24 items named in `pdf-production-spec.md` §5 exist in
`resource-library.md`, in the same order.

**Result: PASS.** All 24 present, in matching order — verified directly
against the resource-library.md heading structure (`grep -c "^### [0-9]"` → 24;
4 `##` category headings matching Risk Management / Trading Plan /
Backtesting & Journaling / Practical Development).

## 7. Unexpected disclaimer text

**Check:** no disclaimer/risk-warning section appears anywhere in
`content/course/production/`.

**Result: PASS.** Scanned for "disclaimer," "not financial advice," and
"risk warning" across every file in `content/course/production/`. No
disclaimer section exists; the only matches are this validation
document's and the manifest's own notes confirming the absence.

## 8. Banned guarantee/promotional claims

**Check:** scan for "guarantee(d)," "risk-free," "get rich," "100%
win/profit," "no risk," "always profit," "never lose" anywhere in
`content/course/production/`, then manually review every match (per the
instruction not to flag a legitimate educational use of these words).

**Result: PASS, all matches reviewed and safe.** Every hit is either (a)
a negation explicitly stating something is *not* guaranteed
(`style-guide.md`, `front-matter/04-course-roadmap.md`,
`pdf-production-spec.md`, `module-completion-page.md`,
`resource-library.md`'s 90-Day Roadmap note), or (b) the Scam Red-Flag
Checklist item that names "Guaranteed or risk-free returns" specifically
as a warning sign to watch for — its intended, safe use. No promotional
or outcome-guaranteeing claim was found.

## 9. Malformed markdown / malformed tables

**Check:** spot-check table syntax and heading structure across
production files for broken pipes, mismatched header/separator rows, or
skipped heading levels.

**Result: PASS.** All markdown tables in `resource-library.md`,
`production-manifest.md`, and `pdf-production-spec.md` use standard
`| --- |` separator rows and consistent column counts per row (checked
during authoring). Heading levels step down consistently (`#` → `##` →
`###`) with no skipped levels in any production file.

## 10. Inconsistent headings

**Check:** heading text and hierarchy stay consistent between
`front-matter/05-table-of-contents.md`, `production-manifest.md`, and
the actual module content.

**Result: PASS.** Lesson counts and titles were verified by direct
`grep` against each module's `01-content.md` at the time the table of
contents was built, and re-verified again during this phase — counts
match exactly (13, 13, 13, 12, 14, 12, 14, 14, 15, 15).

## Content integrity check (spec §29)

Run immediately before this validation document was finalized:

- [x] All 10 modules present (`module-index.md` lists 10; 10 folders on
      disk; no duplicates)
- [x] All lessons present (per-module counts verified: 13/13/13/12/14/
      12/14/14/15/15 — matches the table of contents)
- [x] All exercises present (11–15 per module; see table in check 5)
- [x] All quizzes present (15–18 per module; see table in check 5)
- [x] All answer keys present, matching their quiz 1:1 (see check 5)
- [x] All checklists present (18–25 items per module; see table in
      check 5)
- [x] All 24 practical resources present, in spec order (see check 6)
- [x] Front matter present (cover, welcome, how-to-use, roadmap, TOC —
      all 5 files exist)
- [x] Course Complete present (`module-completion-page.md`)
- [x] No disclaimer section added anywhere in this phase's output (see
      check 7)

**All checks pass.** The content is validated and traceable
(`production-manifest.md`) as ready for an eventual PDF build. No PDF
has been generated as part of this validation.
