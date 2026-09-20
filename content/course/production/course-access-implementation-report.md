---
title: Secure Course Access — Implementation Report
status: development ready — live Supabase project, code review and security-header hardening complete; build/lint/live-flow testing still blocked by sandbox network egress
last_updated: 2026-09-20
---

# Secure Course Access — Implementation Report

This is the implementation report for the system specified in
[`course-access-security-spec.md`](./course-access-security-spec.md):
Supabase Auth + Postgres, Paystack payments, and a protected `/learn`
reader serving the existing course markdown. It follows the report format
requested for this phase.

## Implementation Summary

Built, in the existing Next.js 15 / React 19 app, without modifying any
course content or the public marketing site (`/`, `/course/`):

- Supabase Auth (email + password, password recovery, server-side session
  handling via `@supabase/ssr`) — no custom auth/JWT code.
- Postgres schema with Row Level Security: `profiles`, `orders`,
  `course_access`, `payment_events`.
- A Paystack adapter (plain REST + Node `crypto`, no SDK dependency):
  server-side transaction initialization, server-side verification, signed
  webhook handling, idempotent processing.
- A course-access authorization layer (`lib/access.ts`) that is the single
  place deciding whether a request gets protected content, checked fresh
  on every request.
- A zero-dependency Markdown parser/renderer (`lib/markdown/`) rendering
  `content/course/modules/**` directly into React elements — no second
  copy of the course, no `dangerouslySetInnerHTML`.
- A protected `/learn` reader covering all 10 modules, all 135 lessons,
  and every module's exercises/quiz/answer key/checklist, plus the
  compiled resource library.
- A minimal admin panel (`/admin/students`) to find a student and
  grant/revoke/restore access.
- Two zero-dependency verification scripts, both **actually run** against
  this repo (output below).

## Authentication

- `@supabase/ssr` browser client (`lib/supabase/client.ts`), server client
  (`lib/supabase/server.ts`, using Next 15's async `cookies()`), and a
  service-role/admin client (`lib/supabase/admin.ts`) used only in
  server-only, already-authorized code paths.
- `middleware.ts` (not `proxy.ts` — that name only takes effect on
  Next.js 16+; this project is on 15.1.0) refreshes the session cookie on
  every request via the standard `updateSession` pattern.
- Sign up collects name, email, password (`app/get-started`,
  `signUpAction`); a database trigger (`handle_new_user`) auto-creates the
  matching `profiles` row.
- Email verification is enforced by your Supabase project's own "Confirm
  email" Auth setting, not by this app's code — the sign-up action handles
  both outcomes (immediate session vs. "check your email").
- Password recovery: `/forgot-password` → Supabase's
  `resetPasswordForEmail` → `/auth/callback` (exchanges the emailed code
  for a session) → `/reset-password` (`updateUser`).
- Logout (`signOutAction`) calls `supabase.auth.signOut()`.

## Payment

- `lib/payments/paystack.ts`: `initializeTransaction`, `verifyTransaction`,
  `verifyWebhookSignature` (HMAC-SHA512 of the raw body, timing-safe
  compare), all built on `fetch` + Node's `crypto` — no Paystack SDK
  dependency.
- Checkout (`lib/payments/checkout-action.ts`): creates a `pending` order
  as the authenticated user (RLS lets a user insert only their own pending
  order), then redirects to Paystack's hosted checkout page. No card data
  ever touches this app.
- Verification (`lib/payments/access-activation.ts`,
  `confirmSuccessfulPayment`): called from **both** the checkout-return
  page (`/get-started/verify`) and the webhook
  (`/api/webhooks/paystack`). Both paths **always** re-verify directly
  against Paystack's `GET /transaction/verify/:reference` — neither trusts
  the browser's return URL nor the webhook payload's own `status` field.
  Only after that verification succeeds, and the amount/currency match
  what the order was created for, does it flip `orders.status` and upsert
  `course_access`.
- Idempotency: every processing attempt first inserts a uniquely-keyed row
  into `payment_events` (`ON CONFLICT DO NOTHING`); a duplicate delivery
  or a page refresh is detected there and does nothing further.
  `course_access` writes are additionally an upsert on
  `unique(user_id, course_id)`.
- Refunds/disputes (`refund.*`, `charge.dispute.*` webhook events) revoke
  access and mark the order accordingly. Paystack has no `charge.failed`
  webhook — a failed/abandoned payment is only ever observed through the
  checkout-return verify path.
- Price is **never hardcoded**: `COURSE_PRICE_MINOR_UNITS` /
  `COURSE_PRICE_CURRENCY` are required env vars; checkout fails with a
  clear message (not a fallback price) if they're unset.

## Course Access

`lib/access.ts`'s `requireCourseAccess()` is the only place that decides
whether a request may see protected content, called in
`app/learn/layout.tsx` on **every** request to `/learn/**`. It calls
`supabase.auth.getUser()` (a live round-trip to Supabase Auth — not the
locally-cached `getClaims()`, which would miss a server-side-revoked
session) plus a fresh, uncached `course_access` query. On any database or
auth-service error it fails **closed** (never grants access) and shows a
retry state — it never falls through to "assume access." `requireAdmin()`
is the equivalent gate for `/admin/students`, keyed on
`profiles.is_admin`, which a database trigger prevents a user (including
an admin) from setting on themselves via the normal client — it can only
be set with a service-role query.

## Anti-Download

The master PDF
(`content/course/production/output/FX-University-Forex-Trading-Course.pdf`)
was not moved, copied, or referenced anywhere in `app/`, `components/`,
or `lib/` — verified by `scripts/check-pdf-not-exposed.mjs` (output
below). Students never receive it. Instead, `/learn` renders
`content/course/modules/**/*.md` directly: a hand-rolled markdown parser
(`lib/markdown/parser.ts`) turns each requested lesson/document into a
typed block AST, and a renderer (`lib/markdown/render.tsx`) turns that
into real React elements server-side — never
`dangerouslySetInnerHTML`, so there's no markup-injection path even though
nothing here needs to sanitize third-party input (the content is our own
trusted source). Authorization happens before any of this runs
(`app/learn/layout.tsx`), so there's no "hidden with CSS" or
client-side-only gating anywhere. Every `/learn` page shows a subtle
`Licensed to: {name} · {email}` watermark; the PDF file itself is never
touched or modified.

## Database

**Live and migrated.** Project "FX uni" (org "FXUNIVERSITY", ref
`lsxoatpitpsrlujfuadg`) — a dedicated, previously-empty Supabase project,
confirmed separate from the unrelated dispatch/commission application on
a different account. Four migrations were applied directly via the
Supabase connector, in this order, and confirmed against the live schema:

- `0001_init.sql` — the four tables below, with RLS.
- `0002_harden_functions.sql` — fixes for two real findings from Supabase's
  own security advisor, run immediately after 0001: `set_updated_at()` was
  missing a fixed `search_path` (its sibling trigger functions already had
  one), and `handle_new_user()`/`prevent_self_admin_grant()` — both
  `SECURITY DEFINER` trigger functions meant to run only as triggers —
  were directly callable by `anon`/`authenticated` via PostgREST's
  `/rest/v1/rpc/<function>`. This migration revoked `EXECUTE` from
  `anon`/`authenticated` directly on both functions.
- `0003_harden_functions_revoke_public.sql` — re-running the advisor after
  0002 showed the same two findings unchanged: Postgres grants `EXECUTE`
  on a new function to the `PUBLIC` pseudo-role by default, and
  `anon`/`authenticated` inherit it through `PUBLIC` regardless of what's
  revoked from them by name. This migration revokes from `PUBLIC` itself,
  which actually cleared the advisor. Trigger behavior is unaffected: a
  trigger runs its function under the function owner's privileges, not the
  caller's `EXECUTE` grant.
- `0004_performance_hardening.sql` — fixes for two real findings from
  Supabase's performance advisor: two missing indexes
  (`course_access.granted_by`, `course_access.order_id`), and five RLS
  policies calling `auth.uid()` directly, which Postgres re-evaluates
  per-row — rewritten as `(select auth.uid())` so it's evaluated once per
  query (standard Supabase RLS performance guidance).

After all four migrations, `get_advisors` shows zero WARN-level findings.
The two that remain are both expected, not defects: `payment_events` has
RLS enabled with intentionally zero policies (default-deny for
`anon`/`authenticated` — only the service-role client writes there), and
several new indexes are flagged "unused" simply because every table has 0
rows right now.

Four tables (full SQL: `supabase/migrations/0001_init.sql`,
`0002_harden_functions.sql`, `0003_harden_functions_revoke_public.sql`,
`0004_performance_hardening.sql`), all with Row Level Security enabled:

- **profiles** — id (= `auth.users.id`), email, full_name, is_admin,
  timestamps. Auto-created on signup. Users can read/update their own row;
  a trigger blocks the `authenticated` role from changing `is_admin`
  (including on itself).
- **orders** — user_id, course_id, amount_minor_units, currency, status
  (`pending/successful/failed/cancelled/refunded/disputed`),
  paystack_reference (unique), metadata. Users can read their own orders
  and insert only their own `pending` ones; there is no
  update/delete policy for the `authenticated` role at all — every status
  transition happens through the service-role client.
- **course_access** — user_id, course_id, status (`active/revoked`),
  order_id, granted_at, revoked_at, granted_by, notes;
  `unique(user_id, course_id)`. Users can only read their own row; no
  write policy exists for `authenticated` at all.
- **payment_events** — append-only log with a unique `dedupe_key`, used
  for idempotency and audit. No policies for `authenticated`/`anon` at
  all (default-deny) — only the service-role client ever writes here.

## Routes

**New:** `/login`, `/forgot-password`, `/reset-password`, `/account`,
`/auth/callback` (route handler), `/get-started/verify`, `/learn`,
`/learn/[module]`, `/learn/[module]/[lesson]`,
`/learn/[module]/exercises`, `/learn/[module]/quiz`,
`/learn/[module]/answer-key`, `/learn/[module]/checklist`,
`/learn/resources`, `/admin/students`, `/api/webhooks/paystack` (route
handler).

**Modified:** `/get-started` (rewritten from its Phase-2 placeholder into
the real signup/login/checkout entry point).

**Untouched:** `/`, `/course`, `/privacy`, `/terms` — all still
unauthenticated and independent of the learning environment.

## Security

Row Level Security on every table; all privileged writes (order status,
course access, admin grants) go through the service-role client only
after a server-side check (`requireAdmin()`, webhook signature, or
Paystack verification) — never reachable from a student's own session;
webhook signature verified via HMAC-SHA512 over the **raw** request body
with a timing-safe comparison; payment amount/currency/order-ownership
cross-checked before granting access; fail-closed authorization on any
service error; no secrets in client bundles (only `NEXT_PUBLIC_*` vars are
ever read by client code); `/admin/students` is indistinguishable from a
404 to a non-admin (redirects to `/`, no "forbidden" signal); a minimal,
**explicitly documented** in-memory rate limiter
(`lib/rate-limit.ts`) on login/signup/password-reset/checkout — honestly
process-local, not a distributed limiter, noted as a "Remaining Setup"
item below rather than oversold.

## Testing

**Actually run, in this sandbox, against this repo:**

```
$ node scripts/validate-course-content.mjs
Checked 10 module(s).
  - module-01-forex-fundamentals: slug="forex-fundamentals", 13 lessons
  - module-02-reading-understanding-charts: slug="reading-understanding-charts", 13 lessons
  - module-03-technical-analysis: slug="technical-analysis", 13 lessons
  - module-04-price-action: slug="price-action", 12 lessons
  - module-05-fundamental-analysis: slug="fundamental-analysis", 14 lessons
  - module-06-risk-management: slug="risk-management", 12 lessons
  - module-07-trading-psychology: slug="trading-psychology", 14 lessons
  - module-08-building-a-trading-plan: slug="building-a-trading-plan", 14 lessons
  - module-09-backtesting-trading-journal: slug="backtesting-trading-journal", 15 lessons
  - module-10-practical-forex-development: slug="practical-forex-development", 15 lessons

PASSED — course content structure matches what the /learn reader expects.
```

```
$ node scripts/check-pdf-not-exposed.mjs
Master PDF expected at: content/course/production/output/FX-University-Forex-Trading-Course.pdf
Exists: yes (as a private production artifact — expected)

PASSED — the master PDF is not present under public/ or app/, and no
app/components/lib source file references it.
```

Also actually run, directly against the live "FX uni" Supabase project
(ref `lsxoatpitpsrlujfuadg`) via the Supabase connector, after applying
all four migrations:

```
get_advisors(type="security") → 1 finding, INFO level only:
  "public.payment_events has RLS enabled, but no policies exist"
  (intentional — see Database section)

get_advisors(type="performance") → 1 finding, INFO level only:
  7 "unused index" notices (expected — every table has 0 rows)
```

Zero WARN-or-higher findings on either advisor after hardening. This is a
real, live check against the actual schema — not a design claim.

**NOT run, and why (do not read anything below this line as "passed"):**

- `npm install` / `next build` / `next dev` / `next lint` /
  `tsc --noEmit` — this sandbox has no installed `node_modules` for this
  project at all (not even for the pre-existing `next`/`react`
  dependencies), and its outbound network policy blocks
  `registry.npmjs.org` and CDN mirrors entirely (confirmed via direct
  403s). This is a pre-existing sandbox limitation, unrelated to adding
  Supabase/Paystack. **Practical effect: this code has never been
  compiled or type-checked.** Every new file was hand-reviewed, but that
  is not a substitute for a real build.
- Any live *application-level* test against the now-connected Supabase
  project — actually signing up a student through `/get-started`, logging
  in/out, receiving a real confirmation/password-reset email, exercising
  RLS as two different real user sessions to confirm cross-user isolation,
  or revoking access and confirming an open `/learn` tab is cut off. What
  **has** been run against the live project is schema-level only: the four
  migrations applied cleanly, `list_tables` confirms the resulting
  columns/RLS/foreign keys match what's described below, and both
  `get_advisors` checks come back clean (output above). None of that
  exercises the app's own auth/checkout/authorization code paths end to
  end — that still requires `npm install`/a build (next bullet) plus
  either a browser or a scripted client hitting the running app.
- Any live Paystack test-mode transaction, webhook delivery, or webhook
  replay — no Paystack account/credentials are connected here yet.
- Direct-URL-attack, cross-user-attack, and client-manipulation tests from
  the spec's test list — these are addressed **by construction** (server-
  side `requireCourseAccess()`/RLS/verification, as described above) and
  by code review, **not by an executed test**. Please read that
  distinction literally: it means "the code is written so this can't
  happen," not "I ran an attack and it was blocked."
- Mobile/responsive rendering in an actual browser.

**On the Supabase project specifically:** this session initially found two
existing Supabase projects on one account, both already at that org's
free-tier project cap — one of them turned out to already contain a live,
unrelated 38-table application with its own conflicting
`profiles`/`orders` tables. That project was never touched. You then
connected a different, dedicated Supabase account/organization
("FXUNIVERSITY") created specifically for FX University, with a single
empty project ("FX uni", ref `lsxoatpitpsrlujfuadg`) confirmed separate
from the dispatch/commission application before anything was applied to
it. All four migrations listed under Database are now live on that
project. What remains is everything in the bullet above: real signup/
login/payment/revocation flows have not been exercised end to end,
because that needs a working `npm install`/build (still blocked in this
sandbox) and, for payments, Paystack test credentials.

## Environment Variables

Names only — no *secret* values are printed anywhere in this report or
committed to the repo (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `COURSE_PRICE_MINOR_UNITS`
- `COURSE_PRICE_CURRENCY`
- `COURSE_ID` (optional — defaults to `fx-university`)

**Public-safe values for the live "FX uni" project** — these two are
designed to be exposed to the browser (that's what `NEXT_PUBLIC_` and
"anon"/"publishable" mean), so, unlike `SUPABASE_SERVICE_ROLE_KEY` and
`PAYSTACK_SECRET_KEY`, printing them here is safe and saves a trip to the
dashboard for `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL=https://lsxoatpitpsrlujfuadg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_KpLTxavuRm9_vUYU35_kIw_ueQ1ClIY`
  (Supabase's newer `sb_publishable_...` format; the older `anon` JWT also
  still works if your `@supabase/ssr` version expects that shape instead —
  available from the same dashboard page: Project Settings → API.)

`SUPABASE_SERVICE_ROLE_KEY` is not shown here or anywhere else — copy it
directly from Project Settings → API → service_role into your deployment
platform's secret storage, never into a file that gets committed.

## Files Changed

**Created** (41 files): `.env.example`; `middleware.ts`;
`supabase/migrations/{0001_init,0002_harden_functions,0003_harden_functions_revoke_public,0004_performance_hardening}.sql`;
`lib/supabase/{client,server,admin,middleware}.ts`;
`lib/{access,types,rate-limit,course-content}.ts`;
`lib/markdown/{types,inline,parser,render}.{ts,tsx}`;
`lib/auth/actions.ts`; `lib/admin/actions.ts`;
`lib/payments/{paystack,access-activation,checkout-action}.ts`;
`app/auth/callback/route.ts`; `app/api/webhooks/paystack/route.ts`;
`app/login/page.tsx`; `app/forgot-password/page.tsx`;
`app/reset-password/page.tsx`; `app/account/page.tsx`;
`app/get-started/verify/page.tsx`;
`app/learn/{layout,page}.tsx`; `app/learn/[module]/page.tsx`;
`app/learn/[module]/[lesson]/page.tsx`;
`app/learn/[module]/{exercises,quiz,answer-key,checklist}/page.tsx`;
`app/learn/resources/page.tsx`; `components/course/ModuleDocPage.tsx`;
`app/admin/students/page.tsx`;
`scripts/{validate-course-content,check-pdf-not-exposed}.mjs`;
`lib/security-headers.ts` (pre-deployment hardening pass, 2026-09-20);
this report.

**Modified** (5 files): `package.json` (added
`@supabase/supabase-js`, `@supabase/ssr`, `server-only`; added
`validate:course`/`check:pdf-exposure` scripts); `app/get-started/page.tsx`
(rewritten from its Phase-2 placeholder); `lib/rate-limit.ts` (QA pass,
2026-09-20 — fixed a `setInterval().unref()` type-safety issue, no
behavior change); `middleware.ts` (hardening pass, 2026-09-20 — now also
stamps security headers on every response; session-refresh behavior
unchanged); `lib/supabase/middleware.ts` (hardening pass — added an
optional `requestHeaders` parameter so `middleware.ts` can thread its CSP
nonce through; default behavior when omitted is byte-for-byte the same);
`lib/supabase/admin.ts` and `lib/supabase/server.ts` (hardening pass —
added `import "server-only"`, no logic change).

**Deleted:** none.

**Unrelated files touched:** none — `/`, `/course/`, `/privacy`, `/terms`,
every existing marketing component, and all course content under
`content/course/modules/` are untouched.

## Remaining Setup

1. ~~Create or choose a Supabase project and apply the migrations.~~
   **Done.** All four migrations in `supabase/migrations/` are live on the
   "FX uni" project (ref `lsxoatpitpsrlujfuadg`), and both security and
   performance advisors are clean (see Database/Testing above).
2. In that project's Auth settings: turn on "Confirm email" if signup
   verification should be enforced, and add `{SITE_URL}/auth/callback` to
   the allowed redirect URLs. Not yet confirmed done — verify in the
   Supabase dashboard under Authentication → Providers/URL Configuration.
3. Set every environment variable listed above in your deployment
   platform and a local `.env.local` — the two public-safe Supabase values
   are already given above; `SUPABASE_SERVICE_ROLE_KEY` still needs to be
   copied from the dashboard, and the Paystack/site/price vars still need
   to be filled in — never commit real values.
4. Create a Paystack account; start with its **test** secret key; register
   the webhook URL `{SITE_URL}/api/webhooks/paystack` in the Paystack
   dashboard once deployed.
5. Set `COURSE_PRICE_MINOR_UNITS`/`COURSE_PRICE_CURRENCY` to the real
   price (the marketing page's own pricing display in
   `lib/course-data.ts` still has its own separate "PLACEHOLDER" values to
   replace).
6. Promote your own account to admin once you've signed up:
   `update public.profiles set is_admin = true where email = 'you@example.com';`
   run directly in the Supabase SQL editor — by design, nothing in the app
   itself can grant this.
7. Run `npm install`, then `npm run build`, `npm run lint`, and the two
   validation scripts, in an environment with real network access, before
   deploying.
8. No transactional email provider beyond Supabase Auth's own built-in
   emails (confirmation, password reset) was added — those work out of
   the box. Purchase/access-confirmation emails were intentionally not
   built now, per scope.
9. Consider replacing the in-memory rate limiter with a distributed one
   (e.g. your host's edge/WAF rate limiting) before relying on it in
   production — it's currently a same-process-only deterrent.

## Application-Level QA Pass (2026-09-20)

A follow-up review, focused on getting the project buildable and doing a
full code-level QA sweep now that the Supabase project is live. Two real
findings, everything else confirmed sound:

- **Confirmed BLOCKED, not fixed:** `npm install`/`next build`/`next lint`
  still cannot run in this sandbox. Direct proof this time, not just a
  timeout: `curl -sS -D - https://registry.npmjs.org/next` returns
  `HTTP/2 403` with header `x-deny-reason: host_not_allowed` and body
  `"Host not in allowlist: registry.npmjs.org."` — an organization-level
  egress policy on this sandbox, not a transient network issue, and not
  something to route around. `npm ping` fails the same way.
- **Best available substitute for typecheck:** ran the globally-installed
  TypeScript compiler (v6.0.3 — newer than this project's pinned `^5.6.3`,
  so not authoritative) directly against this project's own `tsconfig.json`
  with no dependencies installed. Result: 1,153 errors. Every single one
  was individually traced to its root cause rather than assumed: 1,152 are
  the direct, expected consequence of `next`, `react`, `@supabase/*`, and
  `server-only` not being resolvable (missing modules → cascading "implicit
  any"/"cannot find namespace React"/"function typed `never` has a
  reachable end" errors on code that is standard, correct Next.js 15
  patterns — e.g. `redirect()`/`notFound()` are typed to return `never` in
  the real `next` package, which is what makes the surrounding
  definite-assignment/narrowing checks pass in a real build). Verified this
  file-by-file for every non-"cannot find module" error class before
  concluding it was cascading, not assuming it. One genuine, environment-
  independent bug was found and fixed: `lib/rate-limit.ts`'s cleanup timer
  called `.unref()` in a way whose type correctness depended on which
  `setInterval` overload TypeScript resolves (Node's timer object vs. a
  browser-style `number`) — rewritten to a cast-and-optional-call pattern
  that is correct at runtime and type-checks cleanly under either
  resolution. Zero syntax errors (TypeScript's `TS1xxx` class) turned up in
  any file — every `.ts`/`.tsx` file in the project parses as valid.
- **Lint:** also blocked, for the same reason (`eslint-config-next` isn't
  installed), and the one globally-available ESLint here is v10, which
  requires flat config and can't read this project's `.eslintrc.json`
  (`{"extends": "next/core-web-vitals"}`, confirmed present and standard)
  regardless. Not run, not claimed as run.
- **Supabase config wiring:** confirmed by `grep` across `app/`,
  `components/`, and `lib/` that no Supabase URL, project ref, or key is
  ever hardcoded — every client (`lib/supabase/{client,server,admin,middleware}.ts`)
  reads exclusively from `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  and `SUPABASE_SERVICE_ROLE_KEY`. Whichever project's values are set at
  deploy time is the project the app talks to — there is no path by which
  it could silently point at the old dispatch/commission project.
- **Re-verified live against the "FX uni" project right now (not reused
  from earlier in this conversation):** `list_tables` — 4 tables, all RLS
  enabled, all still 0 rows; `get_advisors(security)` and
  `get_advisors(performance)` — zero WARN/ERROR findings, only the same 2
  expected INFO notices as before.
- **Re-ran both content-integrity scripts:** `validate-course-content.mjs`
  (10 modules / 135 lessons, unchanged) and `check-pdf-not-exposed.mjs`
  (PDF still absent from `public/`/`app/`, still unreferenced) — both
  PASSED again.
- **Manual security review, this pass, of every route/module the task
  asked about** (`middleware.ts`, `lib/supabase/middleware.ts`,
  `lib/access.ts`, `app/api/webhooks/paystack/route.ts`,
  `app/admin/students/page.tsx` + `lib/admin/actions.ts`,
  `app/auth/callback/route.ts`, `app/get-started/page.tsx`,
  `app/learn/layout.tsx`, `app/learn/page.tsx`, `app/learn/[module]/page.tsx`,
  `lib/course-content.ts`, `lib/markdown/{inline,render}.tsx`): no new
  issues found beyond the `rate-limit.ts` fix above. Specifically
  re-confirmed: `requireAdmin()` is called as the *first* line of every
  individual admin server action (not only gated at the page level, so a
  crafted direct form POST can't skip it); `/learn/[module]/[lesson]`'s
  slug params are matched against a pre-enumerated allowlist derived from
  real directory names, never concatenated into a filesystem path, so
  path traversal via a crafted `module`/`lesson` URL segment isn't
  possible; markdown link `href`s are only rendered as a navigable anchor
  when they match `http(s)://`/`mailto:`, otherwise rendered as inert
  styled text (closes a `javascript:`-URI vector, even though the content
  source is our own trusted markdown, not user input); every
  `next`/`redirectPath`/callback-`next` value accepted from a query string
  or form field is checked with the same "must start with a single `/`"
  guard before being used in a redirect, so there's no open-redirect path
  through login/signup/password-reset/email-confirmation.
- **One gap noted, not fixed (out of scope for this pass):** `next.config.mjs`
  sets no HTTP security headers (no CSP, `X-Frame-Options`, etc.) — this is
  a pre-existing gap, not something either implementation phase broke, and
  wasn't in this task's checklist as something to build. Worth adding
  before production (a short `headers()` block in `next.config.mjs`), but
  intentionally not added unprompted here per "do not make unnecessary
  architectural changes."

## Pre-Deployment Security Hardening Pass (2026-09-20)

A final focused pass, requested explicitly ahead of deployment: add
production HTTP security headers, and re-verify secret handling across
the whole app. No schema change, no new Supabase project, no content
change, no architectural change.

**Headers added — new file `lib/security-headers.ts`, wired into the
existing `middleware.ts`** (which already ran on every route for Supabase
session refresh; it now also stamps these headers on every response):

- `Content-Security-Policy`, built per-request with a nonce. `script-src`
  uses Next.js's own documented `'nonce-<value>' 'strict-dynamic'` pattern
  (see the file's comments for the exact citation) rather than
  `'unsafe-inline'`, so an attacker-injected `<script>` (no matching
  nonce) is blocked while Next's own App Router hydration scripts keep
  working. `'unsafe-eval'` is added only outside production (`next dev`'s
  Fast Refresh needs it; a production build does not).
  `connect-src`/`frame-src`/`form-action` are all locked to `'self'` —
  this is safe, not a guess, because the codebase makes zero direct
  browser-to-Supabase and zero direct browser-to-Paystack calls (verified
  by grep: the Supabase browser client is never imported anywhere; auth
  is 100% Server Actions; Paystack checkout is a full top-level
  `redirect()`, not a client fetch, popup, or embedded widget — a
  server-issued redirect is an ordinary navigation, which CSP's resource
  directives don't govern). `style-src` carries `'unsafe-inline'` with
  **no** nonce — CSP has no nonce mechanism for HTML `style=""`
  attributes, and this app has two `style={{...}}` usages
  (`components/ui/Reveal.tsx`, `components/CoursePreviewSection.tsx`)
  that would otherwise break; this is a deliberate, narrow, documented
  tradeoff. `frame-ancestors 'none'` and `object-src 'none'` are also set.
- `X-Frame-Options: DENY` (legacy fallback alongside `frame-ancestors`).
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `X-Content-Type-Options: nosniff`.
- `Permissions-Policy` disabling camera/microphone/geolocation/payment
  (the native Payment Request API, unrelated to and safe alongside the
  Paystack integration)/usb/motion sensors/FLoC-Topics tracking.
- `Strict-Transport-Security` (`max-age=63072000; includeSubDomains;
  preload`) — **production only**. Gated behind `NODE_ENV === "production"`
  together with `upgrade-insecure-requests` in the CSP, so plain
  `http://localhost` under `next dev` is never affected. Do **not** submit
  the domain to browsers' HSTS preload list (hstspreload.org) until the
  final production domain is confirmed and everything on it — and every
  subdomain — is HTTPS-only; that submission is slow to undo.
- Not verifiable from this sandbox: an actual browser render against
  these headers (no build). First thing to check right after deploying —
  open every distinct page type (marketing pages, `/get-started`,
  `/learn` reader, `/admin/students`, the Paystack return page) and check
  the browser console for CSP violation reports; if Vercel Analytics,
  Speed Insights, or any other third-party script/embed is added later,
  this policy will need updating to allowlist it (none is present today —
  verified by grep, no `@vercel/analytics` or `next/script` usage exists
  in this codebase).

**Genuine gap found and fixed (not present before this pass):**
`lib/supabase/admin.ts` — the client built with the Supabase **service
role key**, which bypasses Row Level Security entirely — had no
`server-only` import, unlike every other file in the codebase that
touches a secret credential. It relied solely on a doc comment ("NEVER
import this file into a Client Component"). Added `import "server-only"`,
turning an accidental client-bundle import into a build-time error
instead of a comment someone could miss. Also added the same import to
`lib/supabase/server.ts` for consistency/defense-in-depth (that file was
already protected indirectly, since it calls `next/headers`'s `cookies()`,
which Next.js itself refuses to run in a Client Component).

**Verified, this pass, item by item:**

1. **No secrets committed.** Grepped the whole repo for `sk_live_`,
   `sk_test_`, and a service-role-shaped JWT/key assigned to
   `SUPABASE_SERVICE_ROLE_KEY` in any tracked file type — none found.
   `.env.example` contains only empty placeholders.
2. **`.env.local` is gitignored.** Confirmed in `.gitignore`
   (`.env*.local` and bare `.env`), and confirmed no `.env.local` file
   exists in this sandbox to begin with.
3. **Service-role credentials are server-only.** Exactly one file
   references `SUPABASE_SERVICE_ROLE_KEY` (`lib/supabase/admin.ts`), now
   `server-only`-guarded (see above).
4. **Paystack secret credentials are server-only.** Exactly one file
   references `PAYSTACK_SECRET_KEY` (`lib/payments/paystack.ts`), already
   `server-only`-guarded from the original implementation.
5. **Client-side code only receives public Supabase credentials.**
   Grepped every reference to `NEXT_PUBLIC_SUPABASE_*` and confirmed no
   file reads `SUPABASE_SERVICE_ROLE_KEY` or `PAYSTACK_SECRET_KEY` outside
   the two files above.
6. **Master PDF remains inaccessible.** `check-pdf-not-exposed.mjs`
   re-run — PASSED, unchanged.
7. **`/learn` remains server-authorized.** Re-read `lib/access.ts` and
   `app/learn/layout.tsx` — `requireCourseAccess()` still the sole gate,
   still called fresh on every request, still fail-closed. Unaffected by
   this pass's changes (middleware's new header logic runs alongside, not
   instead of, the existing session-refresh logic — cookie handling
   itself was left behavioraly identical, only *which* headers object
   downstream rendering receives was touched, verified line by line).
8. **Admin actions remain server-authorized.** Re-read
   `lib/admin/actions.ts` — `requireAdmin()` is still the first line of
   every individual action, not just the page. Unaffected by this pass.
9. **No debug/test endpoints.** Only two route handlers exist in the
   entire app (`app/api/webhooks/paystack/route.ts`,
   `app/auth/callback/route.ts`) — both pre-existing, both reviewed
   previously, neither added or changed this pass. No health-check,
   debug, or admin-data-dump endpoint exists anywhere. No custom
   `error.tsx`/`global-error.tsx` was added (Next's own production
   default already withholds stack traces from the client — verified
   nothing here overrides that). No stray `console.log` of request data
   anywhere in `app/`/`lib/` — only `console.error` in the webhook
   handler, logging the event type/reference/error server-side for
   operational visibility, never returned to the client.

**Re-run after all changes above:** static TypeScript pass (same 3
cascading missing-dependency error classes as every prior pass, zero new
categories, zero syntax errors), `validate-course-content.mjs` (still
10/135, PASSED), `check-pdf-not-exposed.mjs` (still PASSED). `npm
install`/`next build`/`next lint` remain BLOCKED in this sandbox —
confirmed again by the same direct `x-deny-reason: host_not_allowed`
response from `registry.npmjs.org`, not re-claimed as passing.

## Production Readiness

**Development ready.** Not staging- or production-ready yet. Blockers,
none of them architectural:

- The code has never been built or type-checked by its real toolchain in
  any environment — confirmed (not just suspected) to be an organization-
  level egress block on `registry.npmjs.org` in this sandbox
  (`x-deny-reason: host_not_allowed`), not something fixable from inside
  this session. A best-effort substitute static pass (global TypeScript
  against this project's tsconfig, no dependencies installed) found and
  fixed one genuine bug (`lib/rate-limit.ts`) and traced every other
  finding to the missing dependencies themselves — but that is still not
  the same as a real `tsc`/`next build`/`next lint` pass, which remains
  the single biggest open unknown.
- No live application-level test has been run against the now-connected
  Supabase project — signup, login, password reset, RLS cross-user
  isolation, and revoked-access enforcement are all implemented and
  twice code-reviewed but not yet exercised against a real running app.
- No live Paystack test transaction, checkout return, or webhook delivery
  has been run — no Paystack account/credentials are connected yet.
- Supabase Auth project settings (email confirmation, `/auth/callback`
  redirect URL) have not been confirmed configured on the live project.
- The new Content-Security-Policy has not been observed against a real
  running instance (no build possible here) — see "Pre-Deployment
  Security Hardening Pass" above for exactly what to check in the browser
  console right after the first deploy.

What is no longer a blocker: HTTP security headers. CSP, X-Frame-Options/
`frame-ancestors`, Referrer-Policy, X-Content-Type-Options,
Permissions-Policy, and production-only HSTS are all now set in
`middleware.ts`/`lib/security-headers.ts`, and the service-role Supabase
client (the one credential in this codebase capable of bypassing RLS
entirely) now has the same `server-only` build-time guard every other
secret-touching file already had.

What is no longer a blocker: the Supabase project itself. It's live,
migrated (all four migrations applied), schema-verified via `list_tables`,
and clean on both the security and performance advisors (re-confirmed
again in this pass). And the code itself: every route/module this task
asked about was re-reviewed line by line with no new defects found beyond
the one fixed above.
