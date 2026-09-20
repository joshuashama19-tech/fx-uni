# FX University — Course Content

This folder holds the actual paid course content — the material the
`/course` landing page sells. It is completely separate from the
marketing site: nothing here is imported by the Next.js app, and changing
files in here has no effect on `/course` or any other route. The two are
deliberately kept in sync on *facts* (module titles, topic lists, the
"5,000+ students" figure) but are different kinds of writing — the
landing page persuades a visitor to enroll; this content actually teaches
the material once they have.

## Status

| Phase | What it covers | Status |
|---|---|---|
| Architecture | Folder structure, templates, course overview, module index | Done |
| Module 1 — Forex Fundamentals | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| Module 2 — Reading & Understanding Charts | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| Module 3 — Technical Analysis | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| Module 4 — Price Action | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| Module 5 — Fundamental Analysis | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| Module 6 — Risk Management | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| Module 7 — Trading Psychology | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| Module 8 — Building a Trading Plan | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| Module 9 — Backtesting & Trading Journal | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| Module 10 — Practical Forex Development | Full lessons, exercises, quiz, answer key, checklist | **Done** |
| LMS / delivery | Rendering this content to students, progress tracking, etc. | Out of scope — future phase |
| PDF export | Combining all modules into the FX University course book | Out of scope — future phase, now that all modules are complete |

No LMS, authentication, payment processing, student dashboard, course
reader, or PDF export has been built in this phase, by design. This is
content only.

## Structure

```
content/course/
  README.md                      This file
  course-overview.md             Program-level overview, learning framework, audience, risk disclosure
  module-index.md                Full list of all 10 modules, status, and topic scope
  _templates/
    module-content-template.md   Reusable skeleton every module's content file follows
  modules/
    module-01-forex-fundamentals/
      01-content.md               Full module content: intro, objectives, 13 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  15-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
    module-02-reading-understanding-charts/
      01-content.md               Full module content: intro, objectives, 13 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  15-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
    module-03-technical-analysis/
      01-content.md               Full module content: intro, objectives, 13 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  15-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
    module-04-price-action/
      01-content.md               Full module content: intro, objectives, 12 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  15-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
    module-05-fundamental-analysis/
      01-content.md               Full module content: intro, objectives, 14 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  15-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
    module-06-risk-management/
      01-content.md               Full module content: intro, objectives, 12 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  17-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
    module-07-trading-psychology/
      01-content.md               Full module content: intro, objectives, 14 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  17-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
    module-08-building-a-trading-plan/
      01-content.md               Full module content: intro, objectives, 14 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  17-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
    module-09-backtesting-trading-journal/
      01-content.md               Full module content: intro, objectives, 15 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  18-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
    module-10-practical-forex-development/
      01-content.md               Full module content: intro, objectives, 15 lessons, mistakes, examples, recap
      02-exercises.md             Practical exercises (no answers)
      03-quiz.md                  18-question knowledge checkpoint (no answers)
      04-answer-key.md            Answers to the quiz, kept separate on purpose
      05-checklist.md             "Before you move on" completion checklist
```

Every module folder follows the same five-file pattern once it's
written (`01-content.md` → `02-exercises.md` → `03-quiz.md` →
`04-answer-key.md` → `05-checklist.md`), so the course stays consistent
and any module can be dropped into a PDF pipeline the same way.

## Content standards (applies to every module)

- **Original writing only.** Nothing is copied or closely paraphrased
  from BabyPips, Investopedia, other courses, or any other source.
- **No profitability promises.** No guaranteed income, guaranteed win
  rate, "secret strategy" language, or unrealistic examples (no
  "$1,000/day" style claims). Numerical examples use realistic prices and
  position sizes and are always explained.
- **No fabricated claims.** No invented instructor credentials,
  regulatory claims, statistics, or achievements. The only confirmed
  external claim usable anywhere in this content is "5,000+ students
  trained" — and it is never framed as implying all of them are active or
  profitable.
- **Beginner-safe, not beginner-shallow.** Every concept is explained in
  plain language before its formal terminology is introduced, but the
  course still goes deep enough to be worth paying for — no filler, no
  repeated explanations, no generic motivational padding.
- **Every module ends with practice.** Exercises, a quiz with a separate
  answer key, and a completion checklist, so the student applies each
  concept instead of only reading about it.

## Future PDF structure

Once all ten modules are complete, this content is written to slot
directly into a single course book:

```
FX UNIVERSITY — FOREX TRADING COURSE
Cover → Welcome → How to Use This Course → Course Roadmap
→ Module 1–10 → Exercises → Worksheets/Templates
→ Final Trading Development Roadmap → Risk Disclaimer
```

No PDF is generated in this phase — that's a deliberate future step, now
that all ten modules are written and available for review.

## What's next

All ten modules — Modules 1 through 10 — are complete and ready for
review. This closes out the core curriculum-writing phase described at
the top of this file. Combining the modules into the single course book
described above (and any LMS, delivery, or PDF-export work) is out of
scope for this phase and remains a future step, on request.
