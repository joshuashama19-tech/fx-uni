---
title: Production Manifest — Source-to-PDF Mapping
file: production-manifest
status: complete
last_updated: 2026-09-19
---

# Production Manifest

A complete source-to-PDF mapping for the master FX University PDF. Every
row below lets a human trace a PDF section back to the exact source file
it comes from. "Expected order" is the row's position in the final
17-section master PDF (§1 of `pdf-production-spec.md`); within Modules
1–10 and the Resource Library, a second-level order is also given.

## Front matter

| PDF section | Source file | Source type | Expected order | Special formatting |
|---|---|---|---|---|
| Cover | `front-matter/01-cover-page.md` | Production front matter | 1 | Cover template, §7 of pdf-production-spec.md; no header/footer |
| Welcome | `front-matter/02-welcome.md` | Production front matter | 2 | Standard body template |
| How to Use This Course | `front-matter/03-how-to-use-this-course.md` | Production front matter | 3 | Standard body template; numbered list preserved |
| Course Roadmap | `front-matter/04-course-roadmap.md` | Production front matter | 4 | Arrow-diagram code block rendered as a graphic element, §24 |
| Table of Contents | `front-matter/05-table-of-contents.md` | Production front matter (generated reference) | 5 | Page numbers and links auto-generated at build time, never hand-typed — see §13 |

## Modules 1–10

Each module is assembled from its own 5 source files, in this fixed
6-part order (pdf-production-spec.md §4):

| Assembly part | Source file (per module) | Source type | Special formatting |
|---|---|---|---|
| Module cover/introduction | `01-content.md` (frontmatter + "Module Introduction" + "Learning Objectives") | Approved curriculum | Module cover template, §8 |
| Lessons | `01-content.md` (lesson sections) | Approved curriculum | Lesson template, §2 of style-guide.md; existing lesson order preserved exactly |
| Exercises | `02-exercises.md` | Approved curriculum | Response-area sizing per §18 |
| Quiz | `03-quiz.md` | Approved curriculum | Quiz template, §19; never adjacent to its answer key |
| Answer key | `04-answer-key.md` | Approved curriculum | Begins its own section/page after the quiz |
| Module checklist | `05-checklist.md` | Approved curriculum | Checklist template, §20 (`- [ ]` → ☐) |

Module-by-module order and lesson counts (verified by count against each
module's `01-content.md` during this phase):

| Order | Module | Folder | Lessons |
|---|---|---|---|
| 6 | Module 1 — Forex Fundamentals | `modules/module-01-forex-fundamentals/` | 13 |
| 7 | Module 2 — Reading & Understanding Charts | `modules/module-02-reading-understanding-charts/` | 13 |
| 8 | Module 3 — Technical Analysis | `modules/module-03-technical-analysis/` | 13 |
| 9 | Module 4 — Price Action | `modules/module-04-price-action/` | 12 |
| 10 | Module 5 — Fundamental Analysis | `modules/module-05-fundamental-analysis/` | 14 |
| 11 | Module 6 — Risk Management | `modules/module-06-risk-management/` | 12 |
| 12 | Module 7 — Trading Psychology | `modules/module-07-trading-psychology/` | 14 |
| 13 | Module 8 — Building a Trading Plan | `modules/module-08-building-a-trading-plan/` | 14 |
| 14 | Module 9 — Backtesting & Trading Journal | `modules/module-09-backtesting-trading-journal/` | 15 |
| 15 | Module 10 — Practical Forex Development | `modules/module-10-practical-forex-development/` | 15 |

This matches `module-index.md` (the authoritative module list) and
`front-matter/05-table-of-contents.md` exactly — no renaming, reordering,
or duplication.

## Practical Resource Library (order 16)

Source: [`resource-library.md`](./resource-library.md). All 24 items,
grouped into 4 categories, each category starting on a new page
(pdf-production-spec.md §22).

| # | Resource | Category | Source module/lesson | Formatting note |
|---|---|---|---|---|
| 1 | Risk Management Worksheet | Risk Management | Module 6, Lesson 12 | Verbatim fill-in template |
| 2 | Position-Sizing Worksheet | Risk Management | Module 6, Lesson 5 | Reformatted — step-by-step calculation sheet, §15/§21 |
| 3 | Market Selection Worksheet | Trading Plan | Module 8, Lesson 3 | Verbatim table |
| 4 | Setup Definition Worksheet | Trading Plan | Module 8, Lesson 5 | Verbatim table |
| 5 | Entry Checklist | Trading Plan | Module 8, Lesson 6 | Verbatim checklist |
| 6 | Trading Schedule | Trading Plan | Module 8, Lesson 10 | Verbatim checklist (3 sub-sections: Before/During/After) |
| 7 | No-Trade Checklist | Trading Plan | Module 8, Lesson 11 | Verbatim checklist |
| 8 | Complete Trading Plan Template | Trading Plan | Module 8, Lesson 12 | Verbatim fill-in template, 14 fields |
| 9 | Final Trading Plan Audit | Trading Plan | Module 8, Lesson 14 | Verbatim checklist |
| 10 | Backtesting Log | Backtesting & Journaling | Module 9, Lesson 5 | Verbatim table |
| 11 | Backtest Summary Sheet | Backtesting & Journaling | Module 9, Lessons 6–8 | Reformatted — table built from the module's own Quick Reference field list |
| 12 | Trading Journal Template | Backtesting & Journaling | Module 9, Lesson 11 | Verbatim fill-in template |
| 13 | Weekly Review Template | Backtesting & Journaling | Module 9, Lesson 12 | Verbatim fill-in template |
| 14 | Monthly Review Template | Backtesting & Journaling | Module 9, Lesson 12 | Verbatim fill-in template |
| 15 | Bias/Error Checklist | Backtesting & Journaling | Module 9, Lesson 10 | Reformatted — prose → 9-item checklist |
| 16 | Testing Workflow | Backtesting & Journaling | Module 9, Lesson 15 | Verbatim numbered workflow |
| 17 | Demo Trading Readiness Checklist | Practical Development | Module 10, Lesson 2 | Verbatim checklist |
| 18 | Broker Due-Diligence Checklist | Practical Development | Module 10, Lesson 5 | Verbatim checklist |
| 19 | Scam Red-Flag Checklist | Practical Development | Module 10, Lesson 6 | Verbatim checklist |
| 20 | Signal Provider Evaluation Checklist | Practical Development | Module 10, Lesson 7 | Reformatted — prose criteria → 7-item checklist |
| 21 | Prop Firm Evaluation Checklist | Practical Development | Module 10, Lesson 8 | Reformatted — two lists combined → 13-item checklist |
| 22 | Execution Checklist | Practical Development | Module 10, Lesson 10 | Verbatim checklist |
| 23 | Performance Review Template | Practical Development | Module 10, Lesson 11 | Verbatim fill-in template |
| 24 | 90-Day Development Roadmap | Practical Development | Module 10, Lesson 15 | Verbatim, converted to 3-phase checklist |

This order matches spec section 5 exactly (verified against
`resource-library.md` during this phase — no discrepancies found).

## Course Complete (order 17)

| PDF section | Source file | Source type | Special formatting |
|---|---|---|---|
| Course Complete | `module-completion-page.md` | Production front matter (closing) | New page; no disclaimer text; draws only on Module 10's own approved closing language (Key Takeaways, "Before You Move On," Lesson 15) |

## Cross-cutting sources (apply throughout, not a single section)

| Element | Governing source | Applies to |
|---|---|---|
| Lesson structure / callout mapping | `style-guide.md` §1–2, §4 | Every lesson in every module |
| Calculation formatting | `style-guide.md` §3 | Every formula/worked example |
| Resource design standard | `style-guide.md` §6 | All 24 resource-library items |
| Typography | `style-guide.md` §8, pdf-production-spec.md §9 | Entire document |
| Branding / palette | `style-guide.md` §9, pdf-production-spec.md §10 | Entire document |
| Student-facing tone | `style-guide.md` §10 | Any newly written copy (front matter, Course Complete) |
| Page-break logic | `style-guide.md` §7, pdf-production-spec.md §22–23 | Entire document |

## Traceability confirmation

Every one of the 17 top-level PDF sections above resolves to an existing
file under `content/course/`. No section in this manifest points to
content that does not yet exist, and no disclaimer section appears
anywhere in this mapping.
