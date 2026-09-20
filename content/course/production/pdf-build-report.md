---
title: PDF Build Report — FX University Master Course PDF
status: complete — final review passed
last_updated: 2026-09-19
---

# PDF Build Report

This report documents the first complete PDF generator implementation and
build for the FX University master course PDF, per
`pdf-production-spec.md` and `production-manifest.md`, plus a subsequent
final artifact review and brand-fidelity pass (section 0 below).

## 0. Final review — brand-fidelity optimization pass

A second, review-only phase was run against the already-generated PDF
(315 pages / 908,027 bytes at the time this review started) to determine
whether it is ready to stand as the production master. No redesign and no
content rewrite were in scope — only genuine defects were eligible for a
fix, per this phase's own change-discipline rule (REQUIRED / IMPROVEMENT /
NO CHANGE, and no change without a reason).

**Montserrat, re-investigated.** A fresh, broader local-source search was
run specifically for this phase, without any network workaround: `fc-list`
(all 299 installed fonts), a full-disk filename search for "montserrat",
the pre-installed `/usr/share/fonts/truetype/google-fonts/` directory
(which does carry a few Google Fonts locally — Poppins and Lora — but not
Montserrat), the npm and apt caches, and Python package data directories
(matplotlib, etc.). **No local copy of Montserrat exists anywhere in this
environment.** Per this phase's explicit instruction not to spend
excessive time on this and not to bypass network restrictions, the search
stopped there. Liberation Sans remains the font, unchanged from the first
build.

**Visual review performed.** 26 distinct rendered pages were inspected
with the `Read` tool (not text extraction alone) — the required page-type
list in full: cover, Welcome, Course Roadmap, two Table of Contents pages,
all 10 module cover pages, a lesson page from Modules 1 through 10
(including a calculation-heavy page in Module 3 and Module 6, a
table-heavy page in Module 5, a worksheet-style lesson in Module 8 and
Module 9), an exercise/checklist/worksheet page, two resource-library
category divider pages, four resource-library worksheet/checklist pages
including the 90-Day Development Roadmap, and both Course Complete pages.
Reviewed for: typography, spacing, alignment, brand colors, hierarchy,
callouts, tables, formulas, checkboxes, worksheet fields, headers,
footers, and page numbers.

**Findings, classified:**
- All 10 module covers: **NO CHANGE.** Identical structural treatment
  (red "MODULE 0N" eyebrow, bold title, italic subtitle, hairline rule,
  Module Introduction, framework box, What You'll Learn), correct module
  numbers and titles throughout, no blank or duplicated elements.
- Cover page: **NO CHANGE.** Matches the approved minimalist black/white/
  red identity from `pdf-production-spec.md` — "FX UNIVERSITY" prominent,
  "Forex Trading Course" clear, a single red rule accent, no imagery, no
  clutter, no wealth/promise language. The generous white space is the
  specified minimalist design, not an omission.
- Typography and hierarchy throughout: **NO CHANGE.** Heading levels,
  body line length, paragraph and list spacing, table text, and worksheet
  labels are all consistent and readable at their current sizes; body
  text was not reduced to save pages (none of this pass's findings called
  for it).
- Calculation pages (Module 3 RSI, Module 5 NFP table, Module 6 position
  sizing): **NO CHANGE.** Formula boxes and tables render cleanly, with
  the spacing fix from the prior build phase confirmed still correct.
- Worksheets and checklists (Module 8 plan-building lesson, resource
  library items across all 4 categories, including the previously-broken
  90-Day Development Roadmap): **NO CHANGE.** Checkboxes are aligned
  vector squares, writing lines have real usable space, tables fit the
  page width with no clipping.
- Final page of the document (page 315): reviewed — a large area of
  white space below two short closing paragraphs. **NO CHANGE.** This is
  the natural end of the "Course Complete" section's content, not a
  malformed or accidental blank page (the page carries real content and
  a footer); partial closing pages are normal in printed course material
  and were not treated as a defect.
- No new instances of clipping, overflow, broken tables, tiny text,
  inconsistent spacing, bad page breaks, orphaned headings, broken
  checkboxes, missing symbols/characters, header/footer collisions,
  accidental blank pages, or incorrect colors were found anywhere in the
  26 reviewed pages.

**No REQUIRED or IMPROVEMENT changes were identified.** Nothing in the
generator or the source content was modified during this phase — the PDF
at `output/FX-University-Forex-Trading-Course.pdf` is exactly the same
315-page, 908,027-byte file this phase started with.

**Technical re-verification performed this phase:**
- `pdffonts` re-run: same result as the first build — 5 Liberation Sans/
  Mono objects, all embedded and subsetted; body text and headings both
  confirmed to actually use Liberation Sans (Liberation Sans-Bold for
  headings/labels, Liberation Sans regular/italic for body, Liberation
  Mono for formula/code blocks); the one unused Helvetica object remains
  present but confirmed (again) to be referenced by zero pages.
- Full-text extraction re-scanned for replacement characters (U+FFFD),
  null bytes, and leftover `(cid:...)` glyph-ID artifacts (a sign of a
  poorly-embedded font): zero occurrences of any of these — no broken
  characters or malformed Unicode anywhere in the document.
- PDF confirmed to open, parse, and be unencrypted via `pypdf`; page count
  reconfirmed at 315 with continuous, correctly-ordered page numbers
  (spot-checked across all 26 reviewed pages).
- Output folder reconfirmed to contain exactly one PDF file — no stale or
  experimental PDFs present.
- `validate.py`'s 73 automated checks were not re-run in this phase since
  no generator or content change was made that could affect their result;
  the last recorded run (see section 4) remains current.

**Final status: PRODUCTION READY — FONT FALLBACK.** Every review area
passes with no material defect. The one open item is Montserrat's
continued unavailability in this environment, which is fully documented
(not a content or structural compromise) and does not block production
use of Liberation Sans as a substitute.

## 1. Build technology and dependencies

**Environment inspection came first.** Before choosing a technology, the
environment was inspected for what PDF-generation tooling already existed
and what could be added. `package.json` in the Next.js app was reviewed and
confirmed to have no PDF-related dependencies (and was not modified). A
direct attempt to reach the npm registry (`npm view`, `npm ping`) and a
direct attempt to install a system font package via `apt-get` both returned
a genuine `403 Forbidden` with `x-deny-reason: host_not_allowed` — an
infrastructure-level network policy block on `registry.npmjs.org` and
`archive.ubuntu.com`, not a proxy misconfiguration (both hosts bypass the
environment's proxy `noProxy` list). Per this environment's own explicit
instruction not to retry or route around a 403/407 policy block, no further
installation attempts were made.

**Technology chosen: Python 3 + [reportlab](https://www.reportlab.com/)**
for direct PDF construction, with **`python-markdown`** for real markdown
parsing (not a regex-only approach — see section 5). Both packages, along
with `fonttools` (used to verify font glyph coverage) and `pypdf` /
`pdftotext` / `pdffonts` (used for validation), were **already installed**
in this environment with no network dependency. This is a deliberate
deviation from the spec's suggested "HTML/CSS → headless Chromium" pipeline:
a Chromium binary exists at `/opt/pw-browsers/chromium`, but the
`playwright`/`puppeteer` npm packages needed to drive it could not be
installed under the network block above, and hand-rolling raw Chrome
DevTools Protocol calls over a WebSocket was considered and rejected as
fragile and unsupported compared to the mature, already-available reportlab
library.

**Dependencies added: none.** Zero new packages were installed to build the
generator or produce the first PDF. Everything used was already present in
this environment.

**Generator location:** `content/course/production/pdf-generator/`

**Build command** (run from `pdf-generator/`):
```
python3 build.py
```

**Validation command** (run from `pdf-generator/`, after any build):
```
python3 validate.py
```

## 2. Output

- **Filename:** `FX-University-Forex-Trading-Course.pdf`
- **Exact path:** `content/course/production/output/FX-University-Forex-Trading-Course.pdf`
- **Page count:** 315 pages
- **File size:** 888 KB (908,027 bytes)
- Not written to `public/` and not wired into the Next.js app — this
  remains a standalone production artifact, per the spec's explicit
  instruction not to integrate the PDF into the website in this phase.

## 3. Content verification

Verified via `validate.py` and direct inspection:

- All 10 modules present, in order, with their exact titles.
- All 135 lessons present (13+13+13+12+14+12+14+14+15+15), verified two
  ways: against the PDF's own bookmark/outline tree (135 lesson-level
  bookmarks, exact match) and by direct visual spot-check of the
  auto-generated Table of Contents.
- Each module's Exercises, Knowledge Checkpoint (quiz), Answer Key, and
  Completion Checklist sections present, in the fixed 6-part per-module
  order (cover → lessons → exercises → quiz → answer key → checklist).
- All 24 Practical Resource Library items present, in the exact order
  `production-manifest.md` specifies, under their 4 category dividers.
- Front matter present in the specified order: Cover → Welcome → How to Use
  This Course → Course Roadmap → Table of Contents.
- Course Complete page present, as the final content section.
- No "disclaimer" section or heading anywhere in the document (explicit
  spec requirement — verified by a case-insensitive text search of the
  full extracted PDF text, zero matches).
- Claims-safety: rather than re-classifying every use of words like
  "guarantee," "risk-free," or "always profit" (~155 instances across the
  course, present **by design** as negated claims, explicit scam
  red-flags, and cost descriptions — already reviewed in a prior,
  dedicated course-wide QC audit phase), `validate.py` verifies an exact
  occurrence-count match between source and PDF for each keyword pattern,
  after whitespace normalization. This proves the generator introduced or
  dropped none of that already-reviewed language. All 6 keyword checks
  pass with an exact match (e.g. `guarant*`: source=149, pdf=149).

## 4. QA results

**Automated validation:** 73/73 checks passed in the final `validate.py`
run (file existence/size, PDF opens and parses, all module/resource/
front-matter content present, no disclaimer, claims-keyword counts exact,
lesson-bookmark count exact (135/135), all 40 per-module section headings
present, page count recorded, substitute font embedded, text extraction
produced substantial content (115,876 words), PDF outline/bookmarks
present (179 entries)).

**Font embedding:** actually verified, not assumed. `pdffonts` was run
against the final PDF and confirms all 5 Liberation Sans/Mono font objects
used for visible text show `emb=yes, sub=yes` (subsetted and embedded). One
additional, non-embedded `Helvetica` Type 1 font object is present in the
PDF's font table; a `pypdf`-based per-page `/Resources`/`/Font` scan
confirmed this object is referenced by **zero pages** in the document —
harmless reportlab canvas-internal boilerplate, not a real font-
substitution defect. This is stated plainly here rather than hidden; see
"Known limitations" below.

**Internal navigation:** actually tested, not assumed. The PDF's
bookmark/outline tree was walked programmatically and contains 179 entries
(24 front-matter/module/part-level + 135 lesson-level + module-level
entries), and the auto-generated Table of Contents was spot-checked
visually against the rendered page images to confirm its entries carry
real, correct page numbers (not hand-typed placeholders) and that its
structure matches the outline.

**Visual QA — actually performed, not assumed.** The following pages were
rendered to PNG (via `pdftoppm`) and visually inspected with the `Read`
tool (not text-extraction alone): the cover page, the Welcome page, the
Table of Contents page, an early lesson page, a calculation-heavy lesson
page (Module 6, Risk Management), a table-heavy lesson page, an exercise
section page, a quiz page, an answer-key page, a completion-checklist
page, a worksheet page, at least one page from every one of the 10 module
covers (including the two, Module 9 and Module 10, added in this final
pass), multiple resource-library pages across all 4 categories, and the
final Course Complete page. In total, 26 distinct pages were rendered and
visually reviewed across this build and the prior one.

Two real defects were found by this visual review and both are now fixed
and re-verified in the rebuilt PDF (see section 5 for the exact changes):

1. A subhead ("The core relationship this entire module builds around:")
   was spaced too tightly against the formula box immediately below it on
   the Module 6 risk-management page. Fixed in the generator's styling
   (not the content) and re-verified visually on the rebuilt page — the
   gap is now clearly legible and comfortable.
2. On the "90-Day Development Roadmap" resource page, checklist items
   under three subheaders rendered as literal run-on "- [ ] text" inside a
   paragraph instead of proper checkbox rows. Root-caused to a missing
   blank line in the source markdown between a bold-only subheader and the
   following list (a CommonMark "lazy list continuation" gotcha) — a
   genuine source-format defect, not a generator defect. Fixed at the
   source per the protocol below and re-verified visually: all three
   subsections now render as correct checkbox rows.

No other visual defects (clipping, overflow, broken tables, tiny text,
inconsistent spacing, bad page breaks, orphaned headings, missing symbols,
header/footer collisions, blank pages, incorrect colors) were found in any
of the 26 reviewed pages.

**Text-extraction QA:** `pdftotext -layout` output was compared against
the source markdown throughout development. Formatting differences are
expected and acceptable (reflowed line breaks, collapsed whitespace);
`validate.py`'s content-presence and exact-count checks confirm no
substantive content was omitted or altered.

## 5. Files created / modified / source content changes

### Files created
- `content/course/production/pdf-generator/` — the full generator
  (`build.py`, `validate.py`, and `lib/config.py`, `lib/fonts.py`,
  `lib/styles.py`, `lib/md_parse.py`, `lib/render_blocks.py`,
  `lib/flowables.py`, `lib/doctemplate.py`, `lib/pages.py`,
  `lib/assemble.py`).
- `content/course/production/output/FX-University-Forex-Trading-Course.pdf`
  — the generated master PDF.
- `content/course/production/qa/pages2/` — rendered PNG page images used
  for visual QA (not course content; a QA artifact).
- `content/course/production/pdf-build-report.md` — this file.

### Files modified
- `content/course/production/README.md` — updated to document the
  generator, build/validation commands, output location, technology, and
  dependency requirements (no course content changed).

### Source content changes — full disclosure per the required protocol

The spec requires that approved course content never be silently
rewritten, and that any necessary correction follow a five-step protocol:
stop, identify the exact file, explain the required correction, make the
smallest possible change, and record it here. One genuine source-format
defect was found (via visual QA) and corrected under this protocol: **a
missing blank line between a bold-only subheader line and the list that
immediately follows it**, which caused `python-markdown` to merge the list
into the preceding paragraph as literal text instead of recognizing it as
a list (a pure Markdown-syntax defect — a CommonMark "lazy list
continuation" — not a wording or content change). The correction in every
case was to insert exactly one blank line; no wording, ordering, numbers,
or formulas were changed anywhere.

A full corpus scan found this exact pattern in 22 locations. 12 of them sit
in files that are actually rendered into the PDF and were corrected:

- `content/course/modules/module-09-backtesting-trading-journal/01-content.md`
  — lines 703, 709, 714 (`**Before the trade:**`, `**During the trade:**`,
  `**After the trade:**`, each followed by a bulleted list).
- `content/course/production/resource-library.md` — lines 127, 133, 139
  (Trading Schedule resource: `**Before Session**` / `**During Session**` /
  `**After Session**`, each followed by a checklist); lines 270, 276, 280
  (Trading Journal Template resource: `**Before the trade**` /
  `**During the trade**` / `**After the trade**`, each followed by a
  fill-in bullet list); lines 449, 456, 462 (90-Day Development Roadmap
  resource: `**Days 1–30 — ...**` / `**Days 31–60 — ...**` /
  `**Days 61–90 — ...**`, each followed by a checklist — this is the
  location that visual QA actually confirmed as visibly broken before the
  fix).

The remaining 10 occurrences, in
`content/course/production/front-matter/05-table-of-contents.md` (the 10
`**Module N — Title**` headers), were deliberately **left unchanged**.
That file's body text is not rendered into the PDF — the generator's
`build_table_of_contents_page()` uses only that file's top-level `#
Table of Contents` heading and then the auto-generated, real-page-numbered
`TableOfContents` flowable for the actual TOC content (per
pdf-production-spec.md's requirement that page numbers never be
hand-typed). The file remains the human-readable reference version, and
correcting it was judged out of scope for a PDF-rendering fix since it has
no effect on the generated PDF; it may still be worth fixing for the
document's own internal consistency in a future pass, but that is a
separate, non-PDF-blocking decision.

All 12 corrections were verified after the fact: a full corpus re-scan for
the same pattern, restricted to files that feed the PDF, returned zero
remaining occurrences, and the PDF was rebuilt and the two known-affected
pages were re-inspected visually to confirm both are now rendering
correctly (see section 4).

No other course content — wording, numbers, formulas, ordering, exercises,
quizzes, answer keys, or resources — was changed anywhere in this build.

## 6. Known limitations

- **Font substitution:** the spec requested Montserrat. It is unavailable
  in this environment (absent from `fc-list`'s 299 installed fonts) and
  could not be obtained (the npm/apt network block above covers every
  avenue to install it). The generator substitutes **Liberation Sans**
  (Arial-metric-compatible), verified via `fontTools` to cover every
  character actually used in the course content except the ballot-box
  checkbox glyphs (☐/☑, U+2610–2611), which the generator instead draws as
  vector rectangles rather than depending on font glyph coverage for them.
  This substitution is documented at the top of
  `pdf-generator/lib/config.py` (`REQUESTED_FONT` / `SUBSTITUTED_FONT`
  constants) and restated here — it is not a silent substitution.
- **One unused, non-embedded font object:** the PDF's font table (as shown
  by `pdffonts`) lists one `Helvetica` Type 1 object that is not embedded.
  A per-page resource scan confirms it is referenced by zero pages in the
  document, so it has no visible effect on any rendered page or on text
  extraction/selection. It is very likely reportlab canvas-internal
  boilerplate rather than anything the generator's own code emits, but it
  has not been fully eliminated from the PDF's object table. This is a
  cosmetic/structural artifact, not a content or rendering defect.
- **Network-restricted build environment:** because package installation
  was blocked for this entire phase, the generator was built entirely from
  pre-installed tooling. If Montserrat or a Chromium-driving npm package
  ever becomes installable in this environment, both are documented above
  as the originally-preferred alternatives and would be worth revisiting.
- **Page count is not a fixed target.** Per the spec, no arbitrary page
  count was targeted; 315 pages is simply what the approved content
  produces at a comfortable, readable layout.
