---
title: PDF Production Specification
file: pdf-production-spec
status: complete
last_updated: 2026-09-19
---

# PDF Production Specification

This is the finalized specification for the single master FX University
PDF. It defines the document's architecture, order, page-level design,
and technical targets. **It does not generate a PDF.** No PDF-generation
library has been installed and no `.pdf` file exists anywhere in the
project as a result of this document.

This spec is the PDF-specific layer on top of
[`style-guide.md`](./style-guide.md), which already defines lesson
structure, the six callout types, calculation formatting, resource
design, typography, and branding. Where this document repeats something
from the style guide, the style guide remains the source of truth if the
two ever appear to disagree.

## 1. The master PDF package

One single master PDF, containing the complete student curriculum, in
this exact top-level order:

1. Cover
2. Welcome
3. How to Use This Course
4. Course Roadmap
5. Table of Contents
6. Module 1 — Forex Fundamentals
7. Module 2 — Reading & Understanding Charts
8. Module 3 — Technical Analysis
9. Module 4 — Price Action
10. Module 5 — Fundamental Analysis
11. Module 6 — Risk Management
12. Module 7 — Trading Psychology
13. Module 8 — Building a Trading Plan
14. Module 9 — Backtesting & Trading Journal
15. Module 10 — Practical Forex Development
16. Practical Resource Library
17. Course Complete

No disclaimer section is included in the master PDF. (The course's risk
disclosure remains in `course-overview.md` as existing, separate,
already-approved governance content — it is not part of this student
curriculum PDF's assembly.)

## 2. Document order — front matter

```
FRONT MATTER
  Page Group 1 — Cover
  Page Group 2 — Welcome to FX University
  Page Group 3 — How to Use This Course
  Page Group 4 — Course Roadmap
  Page Group 5 — Table of Contents
```

Source: the five files in [`front-matter/`](./front-matter/), used
exactly as written, in file order (`01` through `05`).

## 3. Module order

The existing approved module order, unchanged:

1. Forex Fundamentals
2. Reading & Understanding Charts
3. Technical Analysis
4. Price Action
5. Fundamental Analysis
6. Risk Management
7. Trading Psychology
8. Building a Trading Plan
9. Backtesting & Trading Journal
10. Practical Forex Development

Modules are not renamed, not reordered, and no duplicate module folder
is created — this matches `module-index.md`, the authoritative module
list, exactly.

## 4. Module assembly order

Each module is assembled, in this fixed order, from its existing five
files:

1. Module cover/introduction (from `01-content.md` frontmatter +
   "Module Introduction" + "Learning Objectives" — see style guide §1)
2. Lessons (`01-content.md`, existing lesson order preserved exactly)
3. Exercises (`02-exercises.md`)
4. Quiz (`03-quiz.md`)
5. Answer key (`04-answer-key.md`)
6. Module checklist (`05-checklist.md`)

Answer keys are never placed immediately after individual questions —
each module's quiz runs to completion first, then its answer key
follows as its own section (style guide §5).

## 5. Practical Resource Library — order

After Module 10, the complete 24-resource library, in this exact order
(matching [`resource-library.md`](./resource-library.md) as built):

**Risk Management** — 1. Risk Management Worksheet · 2. Position-Sizing
Worksheet

**Trading Plan** — 3. Market Selection Worksheet · 4. Setup Definition
Worksheet · 5. Entry Checklist · 6. Trading Schedule · 7. No-Trade
Checklist · 8. Complete Trading Plan Template · 9. Final Trading Plan
Audit

**Backtesting & Journaling** — 10. Backtesting Log · 11. Backtest
Summary Sheet · 12. Trading Journal Template · 13. Weekly Review
Template · 14. Monthly Review Template · 15. Bias/Error Checklist · 16.
Testing Workflow

**Practical Development** — 17. Demo Trading Readiness Checklist · 18.
Broker Due-Diligence Checklist · 19. Scam Red-Flag Checklist · 20.
Signal Provider Evaluation Checklist · 21. Prop Firm Evaluation
Checklist · 22. Execution Checklist · 23. Performance Review Template ·
24. 90-Day Development Roadmap

This order was verified against `resource-library.md` during this phase
and the two already match exactly — no reordering was needed.

## 6. Resource library design (PDF layout)

Each resource begins with its number, title, and (where the source
lesson already states one) a one-sentence purpose line, followed by the
actual fillable worksheet/template/checklist — exactly as already laid
out in `resource-library.md`. In the PDF, each resource must render as
usable when printed: real tables, `- [ ]` → ☐ checkboxes, underscore
blanks converted to a printable fill line, and calculation fields kept
in the step-by-step format from style guide §3. No new instructional
content is added and no existing resource content is removed in this
conversion — it is a rendering change only (markdown table → PDF table,
`- [ ]` → ☐ glyph), not a content change.

## 7. Cover page

A premium, minimal cover:

```
FX UNIVERSITY
Forex Trading Course
```

Communicates premium / modern / professional / educational, using the
established black/white/red palette (§10). Avoids excessive graphics,
clutter, unrealistic trading imagery, money/riches imagery, and any
guaranteed-success or exaggerated income language — consistent with
every other module cover and with the course's existing no-hype tone
(style guide §10).

## 8. Module cover pages

Every module begins on a new page, using a single consistent separator
design across all ten modules:

```
MODULE 0N
[Module Title]
[existing approved subtitle/introduction, where applicable]
```

This is the same design specified in style guide §1 — the PDF layer
adds only the page-break-before rule and the visual template; the
content pulled onto the cover is unchanged.

## 9. Typography

Primary typeface: **Montserrat**, with the hierarchy already defined in
`style-guide.md` §8 — course title → module title → lesson title →
major heading → subsection heading → body text → notes/captions, each
visually distinct, with readability prioritized at every level. This
spec does not redefine that hierarchy; it applies it to the PDF output.

## 10. Colors

The established palette (style guide §9), unchanged:

| Role | Color | Hex |
|---|---|---|
| Primary background / ink | Black | `#0A0A0A` |
| Accent / emphasis | Red | `#E50914` |
| Accent, darker variant | Dark Red | `#B20710` |
| Page background (dominant) | White | `#FFFFFF` |
| Secondary background | Light Gray | `#F7F7F7` |
| Body text | Dark Text | `#171717` |
| Secondary text | Muted Text | `#666666` |
| Rules / table borders | Border | `#E5E5E5` |

White remains the dominant reading background throughout the PDF. Red is
used for emphasis, navigation, section markers, and selected visual
elements only — no page is predominantly red.

## 11. Header and footer

A consistent footer on all pages except the cover:

```
FX UNIVERSITY                                          [page number]
```

(left: wordmark; right: page number). Module pages may optionally
include the module title in the header if it does not create visual
clutter — left to the actual layout pass to judge per the "avoid visual
noise" principle in style guide §9. No header/footer appears on the
cover page unless a future design pass intentionally adds one.

## 12. Page numbering

Continuous numbering across the entire master PDF — numbering never
restarts at a module boundary. The cover may remain visually unnumbered.
The first visible page number begins with the student-facing content
(Welcome), per the final PDF implementation's actual layout.

## 13. Table of contents

The PDF's table of contents is generated from the actual document
structure at build time — never hand-typed page numbers. It must
include: front matter, Modules 1–10, each module's major lesson
headings, the Practical Resource Library, and Course Complete. The
content structure this TOC is generated from is
[`front-matter/05-table-of-contents.md`](./front-matter/05-table-of-contents.md),
which already lists every lesson title verbatim per module (production
note: regenerate that file from the modules directly if any module is
ever revised, rather than hand-editing it).

## 14. Internal navigation

Where the PDF toolchain technically supports it: TOC entries link to
their sections, major resource-library entries are individually
navigable, and module sections are easy to locate (e.g., via PDF
bookmarks/outline mirroring the TOC structure). Reliability of the PDF
takes priority over any interactive feature that would compromise it —
navigation is additive, never load-bearing for reading the document.

## 15. Calculations

Every verified calculation in the curriculum is reproduced in the PDF
exactly as approved — formula on its own line, variables identified,
steps separated, final result visually distinguishable, with sufficient
spacing around the equation block. No numerical value, variable name, or
step order may be altered during PDF conversion (style guide §3). This
is a hard constraint: every number in the curriculum has already been
independently verified through the course-wide QC audit.

## 16. Callouts

The six existing callout types (style guide §4), each with one
consistent visual treatment in the PDF:

KEY CONCEPT · EXAMPLE · PRACTICAL NOTE · WATCH OUT · CHECKPOINT ·
REMEMBER

No additional callout type is introduced unless a genuinely new kind of
existing course element is found to require one — none has been
identified during this phase.

## 17. Tables

All tables (lesson tables and resource-library tables alike) must fit
within the printable page width, stay readable at print size, avoid
excessive density, repeat header rows when a table spans a page break
(where the toolchain supports it), and avoid awkward row splits. Where a
table cannot fit cleanly, the layout — not the text size — is adjusted
first.

## 18. Exercise response areas

Exercises that call for calculation or written responses get adequate
blank space, sized for a multi-line response where the exercise calls
for one; exercises calling for short analysis rather than long written
answers get a smaller, proportionate response area. This is a layout
judgment applied per exercise at build time, not a fixed rule for every
exercise regardless of what it asks.

## 19. Quiz formatting

Quizzes and answer keys stay in separate sections, never interleaved:

```
Module X Knowledge Check
[questions, in sequential numbered order, answer choices kept together,
 never split awkwardly across a page]
```

The answer key begins on its own section/page, immediately after the
quiz, wherever practical (style guide §5).

## 20. Checklist formatting

Checklist items render as clear printable checkboxes:

```
☐ I completed the lesson.
☐ I completed the exercise.
☐ I reviewed my answers.
```

The approved checklist content and item wording are preserved exactly —
this is a `- [ ]` → ☐ rendering change only. No completion requirement
is added that the approved checklist doesn't already state.

## 21. Worksheet formatting

Worksheets (front matter and the 24-item resource library alike) use
clearly labeled fields, sufficient writing space, structured tables,
checkboxes, and fill lines as already laid out in `resource-library.md`
— never compressed into dense prose blocks.

## 22. Page-break rules

Always start a new page for: the cover, each module, each major
resource-library category (Risk Management, Trading Plan, Backtesting &
Journaling, Practical Development), and Course Complete.

Never break between: a heading and its introductory paragraph, a quiz
question and its answer choices, a formula and the explanation
immediately around it, a checklist heading and its checklist items, or a
worksheet heading and its first fields.

No page break is forced after every small subsection — normal content
flow is allowed within a module (style guide §7, carried forward
unchanged into this PDF-specific spec).

## 23. Widows and orphans

The layout avoids: a single heading line stranded at the bottom of a
page, isolated first/last lines of a paragraph, a question prompt
separated from its answer choices, and a worksheet label separated from
its fields. Sensible pagination is preferred over excessive whitespace.

## 24. Images and graphics

No stock trading imagery is added purely for decoration. Graphics are
used only where they improve understanding or visual hierarchy (e.g.,
the roadmap arrow-diagram already in `front-matter/04-course-roadmap.md`
and the module-cover template). No new instructional chart or diagram is
created for the PDF that could contradict the approved curriculum; any
existing visual/chart example already inside a module's content is
preserved as-is.

## 25. PDF quality target

The finished PDF should read as a professionally designed paid
educational course: clean, highly readable, structured, consistent,
premium, print-friendly, and screen-friendly, with easy navigation — not
as raw Markdown exported to PDF.

## 26. PDF technical targets

- Broadly compatible PDF output (PDF/A-compatible where practical, but
  not at the expense of readability or functionality if the two
  conflict — see §27 note below)
- Embedded fonts (Montserrat)
- Selectable, searchable text
- Correct Unicode rendering (the curriculum uses ÷, →, ☐, en/em dashes,
  and curly quotes throughout — all must render correctly)
- Clickable internal navigation, where supported (§14)
- Consistent margins
- Reliable, continuous page numbering (§12)
- No clipped content, no overflow, no broken tables

**Production note:** PDF/A compliance is a target, not a constraint that
overrides readability — if a future build finds the two in tension
(e.g., an embedded interactive feature that PDF/A strictness would
block), functionality and readability win, per the user's explicit
instruction in this spec.

## 27. Document size

US Letter, the standard default, with comfortable margins suitable for
both screen reading and printing. This should be revisited only if the
actual production environment (once selected) clearly establishes a
different standard.

## 28. Accessibility

Where technically practical: readable font sizes, sufficient contrast
(the existing palette's Dark Text `#171717` on White `#FFFFFF` already
provides strong contrast; Muted Text `#666666` is reserved for secondary
content, not primary reading text), selectable text, a logical heading
hierarchy, no essential information conveyed by color alone (e.g., a
Watch Out callout is marked by its label and icon/box, not red color
alone), and tables that remain understandable when read out of visual
context. None of this requires deviating from the established visual
identity.

## 29. Build architecture (for the eventual generator)

The eventual PDF generator — not built in this phase — should be
designed so that:

- Content (markdown in `../modules/` and `production/`) stays fully
  separate from presentation logic (templates/styles).
- Styles are centralized in one place, driven by this spec and
  `style-guide.md`, not duplicated per page.
- Page templates are reusable: one module-cover template, one lesson
  template, one callout template (parameterized by type), one table
  template, one worksheet template — not one hardcoded page per module.
- Headers/footers are centralized and applied globally, not set
  per-page.
- The table of contents and page numbers are generated automatically
  from the assembled document structure, never hand-maintained.

This rules out a one-off script that hardcodes every page — the content
in `../modules/` changes only rarely (it is fully approved and QC'd),
but the generator should be able to re-run against it without a rewrite
each time.

## 30. Production file structure

```text
content/course/production/
├── README.md
├── style-guide.md
├── pdf-production-spec.md          (this file)
├── production-manifest.md
├── production-readiness-report.md
├── front-matter/
│   ├── 01-cover-page.md
│   ├── 02-welcome.md
│   ├── 03-how-to-use-this-course.md
│   ├── 04-course-roadmap.md
│   └── 05-table-of-contents.md
├── resource-library.md
├── module-completion-page.md
└── validation/
    └── README.md
```

No `templates/` or `resources/` folder is created in this phase — the
spec above (§6, §29) already defines what a future build's reusable
templates need to cover, and `resource-library.md` already holds the
resource content itself. Creating empty placeholder folders now would
not serve any purpose this phase requires; a future PDF-build phase can
add them alongside the actual generator code, once that work begins.

## 31. What this phase deliberately does not do

Per the governing instruction for this phase: no PDF is generated, no
`.pdf` file is created, no PDF-generation dependency is installed, no
final build script is written, and nothing under `app/`, `components/`,
`lib/`, or `public/` is modified. See
[`production-readiness-report.md`](./production-readiness-report.md)
and the validation checks in [`validation/README.md`](./validation/README.md)
for confirmation this scope was honored.
