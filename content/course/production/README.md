---
title: Production Folder — Read Me
status: complete — master PDF generated
last_updated: 2026-09-19
---

# Production Folder

This folder holds the **production layer** that sits on top of the
approved 10-module curriculum in `../modules/`. It does not contain any
new teaching content. Everything here organizes, formats, and packages
the already-approved lessons, exercises, quizzes, answer keys, and
checklists for eventual student-facing (and eventual PDF) delivery.

Nothing in `../modules/` was rewritten to produce this folder. Where a
worksheet or checklist already existed inside a module lesson, it was
copied here verbatim and given a consistent, fillable layout. Where a
named resource existed only as a description rather than an actual
fillable template (noted explicitly where this applies), it was built
using only the exact field list the module itself already specifies —
never new fields, new claims, or new teaching content.

## What's in here

```
production/
  README.md                        This file
  front-matter/
    01-cover-page.md                Course title page
    02-welcome.md                   "Welcome to FX University"
    03-how-to-use-this-course.md    Student guide to the course's own structure
    04-course-roadmap.md            Visual/text progression map, Module 1 → 10 → 90-Day Roadmap
    05-table-of-contents.md         Full course table of contents
  style-guide.md                    Lesson structure, callout types, calculation
                                     formatting, typography, branding, tone, and
                                     page-break rules for production
  resource-library.md               All 24 reusable worksheets/checklists/
                                     templates from Modules 6–10, compiled and
                                     reformatted into one fillable section
  module-completion-page.md         The "Course Complete" page, placed after
                                     Module 10
  production-readiness-report.md    What changed, what was only reformatted,
                                     and what (if anything) needs human review
  pdf-production-spec.md            The finalized PDF production specification:
                                     master document order, page/cover design,
                                     typography and branding application, page
                                     numbering, navigation, technical targets,
                                     and build architecture — no PDF generated
  production-manifest.md            Complete source-to-PDF mapping, so any PDF
                                     page can be traced back to its source file
  pdf-build-report.md               The build report for the generated master
                                     PDF: technology, dependencies, files
                                     touched, validation and visual-QA results,
                                     known limitations
  course-access-security-spec.md    Specification (not yet implemented) for
                                     protected online course access: student
                                     flow, payment verification, the protected
                                     course viewer, PDF protection, data model,
                                     threat model, and phased implementation
                                     plan
  validation/
    README.md                      Pre-production validation checks and their
                                    results, run against the current content
  pdf-generator/                    The reusable PDF generator (Python +
                                    reportlab). See "Building the PDF" below.
  output/
    FX-University-Forex-Trading-Course.pdf   The generated master course PDF
  qa/
    pages2/, pages3/, pages4/      Rendered PNG page images used for visual QA
                                    (across the initial build and the
                                    subsequent final-review pass)
```

## Building the PDF

A reusable PDF generator lives in `pdf-generator/`. It reads the approved
course content directly from `../modules/` and this folder — nothing about
the course is hardcoded into the generator.

- **Technology:** Python 3 + [reportlab](https://www.reportlab.com/) for
  direct PDF construction, with `python-markdown` for parsing course
  markdown into a block-level AST (not a regex-only approach). Both were
  already installed in this environment; no new packages were installed to
  build the generator or run the first build (see `pdf-build-report.md` for
  the full reasoning, including why an HTML→Chromium pipeline was not used).
- **Build command**, run from `pdf-generator/`:
  ```
  python3 build.py
  ```
- **Output:** `output/FX-University-Forex-Trading-Course.pdf` (not written
  to `public/` and not wired into the Next.js app — this remains a
  standalone production artifact).
- **Validation**, run after any build:
  ```
  python3 validate.py
  ```
  This runs automated file/content/structural/technical checks (module and
  resource presence, lesson-bookmark counts against source, claims-keyword
  occurrence counts against source, embedded-font checks, outline/navigation
  checks, and more). See `pdf-build-report.md` for the latest results.
- **Font:** the spec requested Montserrat. It is unavailable in this
  environment and could not be installed (network policy blocks npm/apt
  package installation here). The generator substitutes **Liberation Sans**
  (metric-compatible with Arial, verified to cover every character actually
  used in the course text) and documents this substitution explicitly in
  `pdf-generator/lib/config.py` and in `pdf-build-report.md` — it is not a
  silent substitution.
- **Dependencies:** none were newly installed. The generator uses only
  Python packages already present in this environment (`reportlab`,
  `markdown`, `fonttools`) plus the system `pdftotext`/`pdffonts` utilities
  for validation.

## What this folder is not

- It is not a website page, and nothing here (including the generated PDF)
  is imported by, or wired into, the Next.js app.
- It is not a rewrite of the curriculum — `../modules/` remains the
  single source of truth for all teaching content. If this folder and a
  module ever disagree, the module is correct.

## How this maps to the eventual course book

This folder's contents correspond directly to the front matter,
resource-library, and completion sections of the course-book structure
already described in [`../course-overview.md`](../course-overview.md)
("Where this content is headed") and [`../README.md`](../README.md)
("Future PDF structure"):

```
Cover → Welcome → How to Use This Course → Course Roadmap → Table of Contents
→ Module 1–10 (unchanged, in ../modules/)
→ Practical Resource Library
→ Course Complete
```

The full PDF-specific specification — document order, cover and page
design, page numbering, navigation, and technical build targets — is
defined in [`pdf-production-spec.md`](./pdf-production-spec.md), with a
complete source-to-PDF trace in
[`production-manifest.md`](./production-manifest.md) and the checks that
must pass before a build in [`validation/README.md`](./validation/README.md).

The master PDF built from that specification now exists at
[`output/FX-University-Forex-Trading-Course.pdf`](./output/FX-University-Forex-Trading-Course.pdf).
See [`pdf-build-report.md`](./pdf-build-report.md) for the full build,
validation, and visual-QA report, and "Building the PDF" above for how to
regenerate it.

Integrating the PDF into the website, and building any LMS or delivery
mechanism, remain future steps, out of scope for this phase.

## Course access & security

How students get protected online access to this course — account
creation, payment verification, the protected course viewer, PDF
protection, data model, threat model, and a phased implementation plan —
was specified in
[`course-access-security-spec.md`](./course-access-security-spec.md) and
has since been **implemented** (Supabase Auth + Postgres, Paystack
payments, a protected `/learn` reader). See
[`course-access-implementation-report.md`](./course-access-implementation-report.md)
for exactly what was built, how authorization and payment verification
work, every test actually run (and, just as importantly, every test that
was **not** run and why), and what's still required before this goes to
production (a connected Supabase project, Paystack credentials, and a
real `npm install`/build in an environment with network access — this
sandbox could do neither).
