---
title: Production Style Guide
file: production-style-guide
status: complete
last_updated: 2026-09-19
---

# Production Style Guide

This is the formatting system for turning the approved curriculum in
`../modules/` into a consistent, student-facing, eventually-PDF-ready
course. It defines structure, callout conventions, calculation
formatting, resource design, typography, branding, tone, and page-break
rules. **It does not change any lesson's wording.** Where an existing
lesson already contains the substance this guide asks for (which is
true almost everywhere — the curriculum was written carefully and
consistently), this guide explains how to *present* that existing
content, not how to rewrite it.

## 1. Module cover

Every module opens with a short cover, built entirely from information
that already exists in that module's `01-content.md` frontmatter and
opening section:

```
MODULE 0N
[Module Title — from frontmatter `title:`]
[One-line subtitle — from frontmatter `subtitle:`, where present]

[The module's existing "Module Introduction" section, used as-is]

What you'll learn:
[The module's existing "Learning Objectives" list, used as-is]
```

No new subtitle or introduction needs to be written — every module
already has a `subtitle:` frontmatter field (Modules 5–10) or an
equivalent opening line (Modules 1–4), plus a full "Module Introduction"
and "Learning Objectives" section. The cover simply pulls these forward
and presents them first, on their own page.

## 2. Lesson structure

Production lessons use this presentational hierarchy:

```
Lesson N — [Title]
  Lesson Objective
  Main Lesson
  Key Concept   (callout, where the lesson has one)
  Example       (callout, where the lesson has one)
  Watch Out     (callout — every lesson's existing "Beginner mistake")
  Practical Takeaway
```

**This maps onto content that already exists in every lesson — it is a
layout instruction, not a request for new subheadings inside
`01-content.md`.** Every approved lesson already follows a consistent
internal pattern (what-it-is → why-it-matters → how-it-works/worked
example → common beginner mistake), and that pattern maps directly:

| Production element | Where it already lives in the approved lesson |
|---|---|
| Lesson Objective | The lesson's opening sentence(s) — what the term/concept is and why it matters, before any formula or example |
| Main Lesson | The body of the lesson: the explanation, any sub-bullets, any formulas |
| Key Concept | A bolded formula, a bolded definition, or a lesson's single most load-bearing sentence (production layout pulls this into a callout box; the sentence itself is not altered) |
| Example | Any paragraph starting "**Worked example**" or similar — already present in nearly every lesson |
| Watch Out | The existing `> **Beginner mistake:**` blockquote at the end of every lesson |
| Practical Takeaway | The lesson's closing sentence(s), or (where a lesson has no distinct closing line) a one-sentence restatement of the Key Concept |

A future layout pass applies this hierarchy visually (headers, boxes,
spacing) when the PDF is built. It does not require inserting new
markdown subheadings into the 155 existing lessons across the ten
modules — doing so would be a large, unnecessary rewrite of approved
content, which this production phase is not authorized to do.

## 3. Calculations and formulas

Every module already follows this pattern for numerical content, and it
should be preserved exactly as-is:

- Formulas are already on their own line, in a fenced code block, e.g.:
  ```
  Position Size = Amount Willing to Risk ÷ Risk Per Unit
  ```
- Variables are already defined in prose immediately before or after the
  formula.
- Assumptions (account size, risk %, stop distance, pip value, etc.) are
  already stated as a labeled list before the calculation itself.
- Calculations are already shown step-by-step inside a fenced code
  block, with the final answer on its own line, often bolded.

**Production instruction:** preserve this exact pattern. Do not
compress a step-by-step calculation into a single inline expression, and
do not re-derive or "simplify" any verified calculation — every number
in the curriculum has already been independently verified (see the
course-wide QC report). If a future layout pass wants extra visual
separation between assumptions and the calculation itself, add a
horizontal rule or spacing between them — never alter the numbers,
variable names, or order of steps.

## 4. Callout types

Six callout types, used consistently across production. Each maps to
something that (almost always) already exists in the approved text —
production adds the visual box, not new content.

| Callout | Purpose | Markdown convention | Existing source |
|---|---|---|---|
| **KEY CONCEPT** | The essential idea/formula to remember | `> **Key Concept:** ...` | A lesson's core bolded definition or formula |
| **EXAMPLE** | A numerical, chart, market, or practical example | `> **Example:** ...` | A lesson's "Worked example" paragraph |
| **PRACTICAL NOTE** | Useful implementation guidance | `> **Practical Note:** ...` | A lesson's "What a beginner would actually do" or similar practical-application paragraph |
| **WATCH OUT** | A common mistake or misunderstanding | `> **Watch Out:** ...` | The existing `> **Beginner mistake:**` blockquote, relabeled for the student-facing edition |
| **CHECKPOINT** | A short reflection or understanding check | `> **Checkpoint:** ...` | A lesson's rhetorical "why does this matter" question, or the module's own quiz question closest to that lesson |
| **REMEMBER** | A concept that should stay top-of-mind going forward | `> **Remember:** ...` | A lesson's closing sentence, or a Key Takeaways bullet that connects forward to a later module |

**Use sparingly.** Not every lesson needs all six. Most lessons already
have a natural Key Concept and a Watch Out (the existing beginner
mistake); Example appears wherever the lesson already has a worked
example; Practical Note, Checkpoint, and Remember are used only where
the existing content actually supports one — never manufactured to fill
a quota. Overusing callouts is exactly what section 8 of the production
spec warns against: they should improve comprehension, not turn every
paragraph into a box.

## 5. Exercises, quizzes, answer keys, checklists

These four already follow a consistent, correct structure across every
module — production only needs to present them clearly, which they
already are:

- **Exercises** (`02-exercises.md`): presented under "Module X
  Exercises," with a one-line instruction ("complete each exercise
  before reviewing the answer key" — adapted per module, since most
  modules' exercises have no separate answer key by design, only the
  quiz does), then each exercise numbered with its prompt. In a
  print/fillable layout, leave blank response space after each
  numbered exercise; digitally, this is simply blank space or a text
  field.
- **Quizzes** (`03-quiz.md`): presented under "Module X Knowledge
  Check," with the existing instruction line preserved, then each
  question exactly as approved — wording, answer choices, and question
  count unchanged.
- **Answer keys** (`04-answer-key.md`): presented immediately after the
  quiz section (never interleaved with it, never visible on the same
  page/screen as the questions in a way that could be seen before
  answering), each numbered answer followed by its existing explanation
  where one is given.
- **Checklists** (`05-checklist.md`): presented under "Module X
  Completion Checklist," using the existing checkbox items exactly as
  written, grouped under their existing subheadings (Core understanding,
  Practice completed, etc.).

No module's question count, answer wording, or checklist items should
change during production — all of it already passed course-wide QC.

## 6. Resource design standard

Every worksheet/template in the Practical Resource Library
(`../resource-library.md`) is laid out so a student can actually fill it
in, both on screen and on paper:

- Tables use real markdown table syntax (not prose describing a table),
  so headers and rows are clear when rendered or printed.
- Checklists use literal `- [ ]` checkbox syntax.
- Fill-in fields use an underscore blank (`____________`) long enough to
  write in, or a table cell left empty for the student.
- Any calculation resource shows the formula on its own line, then a
  blank calculation area, then a clearly labeled "Your answer" line —
  following the same step-by-step pattern as section 3 above.
- Where a resource is naturally recurring (the Trading Journal, Weekly
  Review, Monthly Review), the template includes a Date field and a
  Notes area, so one blank copy can be reused indefinitely.

## 7. Page-break logic (for future PDF production)

These rules govern the eventual PDF layout — they are not implemented
in this phase, since no PDF is being generated:

- Start each module on a new page.
- Start each major resource-library section (Risk Management, Trading
  Plan, Backtesting & Journaling, Practical Development) on a new page.
- Never split: a heading from its first paragraph; a quiz question from
  its answer choices; a checklist heading from its checklist items; a
  table across a page break where avoidable; a formula from the
  explanation immediately around it.
- Long lessons flow naturally across pages — do not force a break after
  every subsection.
- No artificial break is inserted after a single short paragraph or
  callout box.

## 8. Typography

- **Primary typeface:** Montserrat.
- **Hierarchy:**
  - Course title (cover page): bold, largest size in the document.
  - Module title: bold, prominent — second-largest heading level.
  - Lesson title: bold, clearly distinct from body text but smaller than
    a module title.
  - Section heading (Learning Objectives, Key Takeaways, etc.): medium
    or semi-bold weight.
  - Body text: regular weight, sized for comfortable long-form reading.
  - Captions, notes, and production notes (like the italic notes in this
    folder): smaller, regular weight.
- Readability takes priority over decorative type choices at every
  level.

## 9. Branding

**Primary palette:**

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

**Feel:** premium, bold, modern, professional, clean, trustworthy,
educational.

**Avoid:** gradients used decoratively, glassmorphism, heavy blur,
glow effects, overuse of red (red is an accent for emphasis and callout
accents — e.g. Watch Out — not a background or body-text color), and
visually noisy layouts. White stays the dominant reading background
throughout; red and dark red are used sparingly, for emphasis and
accent elements only (callout borders/labels, key numbers, section
markers) — never as large fill areas competing with body text.

## 10. Student-facing tone

The approved curriculum already writes in this voice consistently
(confirmed in the course-wide QC audit); production should preserve it
exactly, not "polish" it into something different:

Clear, confident, professional, beginner-friendly without being
childish, practical, direct. **Avoid** (and none of the approved content
currently contains): hype, unrealistic income language, guaranteed
results, get-rich-quick framing, unexplained technical jargon, and
unnecessary repetition.

If a future production pass ever needs to write *new* student-facing
copy (an introduction, a callout label, a resource instruction) rather
than reformat existing copy, it should match this same voice — the front
matter in `front-matter/` is written to this standard and can be used as
a reference.
