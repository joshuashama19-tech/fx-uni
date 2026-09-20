# FX University

A production-quality, mobile-first Next.js site for a beginner Forex
education course. Two live routes today:

- **`/`** — a minimal placeholder homepage (the future FX University
  main site; not in scope to build out yet).
- **`/course`** — the Phase 1 sales page for the paid course. This is
  where nearly all of the content and conversion work lives. No LMS,
  payments, auth, or student dashboard are built yet, by design.

Routing is plain Next.js App Router nesting — **no `basePath`** is used,
so `/` and `/course` coexist normally and can each be deployed to going
forward without extra configuration.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 (placeholder homepage) and
http://localhost:3000/course (the course sales page). For a production
build:

```bash
npm run build
npm run start
```

> This project is built in a sandboxed environment without access to the
> npm registry, so `npm install` / `npm run build` cannot be executed here
> to verify the build (confirmed blocked again as of the most recent
> pass — `403 Forbidden` from `registry.npmjs.org`). The code is instead
> checked with static tooling: a TypeScript/JSX syntax pass (`tsc --noEmit`
> against a temporary permissive config), an import/export cross-check
> script, a hooks/`"use client"` boundary check, a `.map()` key check, an
> unused-import check, an internal href/id cross-reference, and a WCAG
> contrast check on the color palette. Please run a real
> `npm install && npm run build` as your first step before deploying.

## Tech

Next.js (App Router) + TypeScript + Tailwind CSS. Brand typeface is
**Montserrat** (weights 400/500/600/700/800) loaded via `next/font/google`
in `app/layout.tsx` and exposed as `font-sans` through a CSS variable — no
extra font files to manage. No UI/animation libraries — icons are
hand-written inline SVGs (`components/icons.tsx`) and scroll-reveal
animation is a small IntersectionObserver wrapper
(`components/ui/Reveal.tsx`), so the dependency list stays minimal.

## Editing content

Almost every string on the `/course` page — pricing, curriculum, FAQ,
bonuses, testimonials, trust copy, disclaimers — lives in
**`lib/course-data.ts`**. Edit that file; you generally shouldn't need to
touch component JSX to update copy. Values that must be filled in with
real, verified information before launch:

- **Pricing**: `pricing.currency` / `pricing.price` / `pricing.originalPrice`
  / `pricing.discountLabel` (leave `discountLabel` as an empty string to
  hide the badge entirely)
- **Student count**: `studentProof.count` — the single source of truth for
  every "X Students Trained" mention on the site (rendered through the
  `<StudentCount />` component, see below). Update the number here only;
  never hardcode it elsewhere.
- **Testimonials**: `testimonials.items` — each entry has a `placeholder`
  flag. Leave it `true` (shows a "Placeholder" badge on the card) until you
  have a genuine, verifiable testimonial to replace it with; set `verified`
  only when the student has actually been confirmed.
- **Bonuses**: `bonuses.items` (only real, delivered bonuses belong here —
  no invented value)
- **Payment methods**: `pricing.paymentNote`, and the FAQ item about
  payment methods
- **Support email**: `siteConfig.supportEmail`
- **Legal pages**: `/app/privacy/page.tsx` and `/app/terms/page.tsx` are
  stub pages — replace with real policies before launch

## The `<StudentCount />` component

`components/StudentCount.tsx` is the only place the "5,000+ Students
Trained" style claim should ever be rendered. It reads `studentProof` from
`lib/course-data.ts` and supports a few phrasing variants (`trained`,
`trusted`, `join`, `number`) so the same underlying number can read
naturally in a hero badge, a big trust-section stat, etc. It is a plain,
deterministic component — not a live or incrementing counter — by design,
so the number shown always matches whatever is set in `course-data.ts`.

## Structure

```
app/
  layout.tsx         Root shell: Montserrat font, generic SEO defaults, skip link
  page.tsx            Placeholder homepage ("/")
  course/
    layout.tsx        Course-specific chrome (announcement bar, header, footer) + metadata
    page.tsx           Assembles all course sales-page sections in order ("/course")
  get-started/        Placeholder entry point for Phase 2 (signup + checkout)
  privacy/, terms/    Placeholder legal pages (linked from the footer)
components/
  *.tsx              One component per landing-page section
  ui/                Small shared primitives (Container, Button, SectionHeading, Reveal)
  icons.tsx           Hand-written inline SVG icon set
lib/
  course-data.ts      All editable copy/content (see above)
```

## Design notes

- **Palette**: black (`ink-950` / `#0A0A0A`) + white + red (`brand-600` /
  `#E50914`, dark red `brand-700` / `#B20710`), with supporting light gray
  (`ink-50` / `#F7F7F7`), dark text (`ink-900` / `#171717`), muted gray
  (`ink-500` / `#666666`), and border gray (`ink-100` / `#E5E5E5`) —
  defined in `tailwind.config.ts`. White is the dominant background; black
  is used for structure/headings; red is used strategically for CTAs and
  emphasis only — the site is intentionally not primarily dark or
  primarily red.
- Gradients, glassmorphism, and heavy animation are intentionally kept to
  a minimum — no blurred glow-orb decorations, no backdrop blur.
- All interactive text/background color pairings were checked against WCAG
  AA contrast (4.5:1 for text, 3:1 for icons/graphics) using a small custom
  script (relative luminance + contrast ratio) — re-check contrast if you
  change the palette.
- No fake testimonials, fake/incrementing student counters, countdowns, or
  guaranteed-profit claims are anywhere on the page, per the brief.
  Persuasion comes from value, structure, and honest urgency (the "real
  cost of staying unstructured" section) — not manufactured scarcity.
  Testimonials are genuine-only and clearly marked as placeholders until
  real ones are supplied.
