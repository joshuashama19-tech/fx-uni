---
title: Course Access & Security Specification
status: specification only — not implemented
last_updated: 2026-09-19
---

# FX University — Course Access & Security Specification

This document specifies how paying students will get protected online
access to the FX University course. **It is a specification and
architecture document only.** Nothing described here has been built. No
application code, database, authentication, payment integration, or
routing has been created or changed as part of producing this document.
See "What was and was not done" at the very end for an explicit account.

The goal is a lean, server-enforced, provider-agnostic protected course
reader — not a full LMS, not a downloadable PDF product, and not a
promise of unbreakable DRM. See Part 24 for the design principles that
govern every decision in this document.

## Reality check against the current codebase

This spec is written against the actual repository, not a hypothetical
one, so a future implementer isn't guessing at integration points. As of
this writing:

- **Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.
  No `pages/` directory — App Router only.
- **Dependencies:** only `next`, `react`, `react-dom` plus standard dev
  tooling. There is **no auth library, no payment SDK, no ORM/database
  client, no email library, and no markdown-rendering pipeline wired into
  the app**. This is a greenfield build for all of Parts 1–20 below —
  nothing to migrate away from, but also nothing to reuse.
- **Existing routes:** `app/page.tsx` (homepage, an explicit placeholder
  that links to `/course`), `app/course/page.tsx` + `app/course/layout.tsx`
  (the paid course landing/sales page — ~20 marketing sections, no forms,
  no auth, no payment logic), `app/get-started/page.tsx` (an **already
  reserved, already-linked placeholder** — its own docstring says
  "Placeholder entry point for Phase 2 (signup + checkout). Intentionally
  minimal — no forms, auth, or payment logic here yet."), `app/privacy/`,
  `app/terms/`.
- **The integration point already exists:** `lib/course-data.ts` line 567
  sets the pricing CTA's `ctaHref` to `/get-started` with the comment
  `// Phase 2 (signup + checkout) will live at this route`. This means
  the landing page's primary purchase CTA is already wired to the correct
  future entry point — Part 1A below builds on this rather than proposing
  a new one.
- **Content today:** `content/course/` (modules 1–10, markdown) is
  consumed only by the offline PDF pipeline at
  `content/course/production/pdf-generator/`. **No web route reads this
  content today.** `lib/course-data.ts` is a separate, hand-authored file
  that powers the marketing page and is intentionally decoupled from the
  markdown curriculum.
- **No `.env`/`.env.example`, no `middleware.ts`, no database schema, no
  deployment config file** (`.gitignore` ignoring `.vercel` is the only
  hint that Vercel is the likely target host). The repository itself is
  not currently under git version control.

Every recommendation below is written to slot into this exact codebase.

---

## Part 1 — Student flow

### A. Landing page

`/course/` remains exactly as it is today: the public marketing/sales
page, unauthenticated, unchanged. Its primary purchase CTA (`pricing.ctaHref`
in `lib/course-data.ts`, currently `/get-started`) should continue to
point at **`/get-started`**, which becomes the real entry point to
account creation and checkout instead of a placeholder. No change to
`/course/`'s content, copy, or design is in scope here — only that
`/get-started` stops being a "coming soon" placeholder and becomes the
actual flow described in B–D below. This is a one-line continuity: the
route the marketing team already chose stays the route.

### B. Account creation

Keep registration minimal — this is a single-product course, not a
multi-tenant platform.

**Required fields:** name (display name, not verified identity), email,
password. Nothing else. No phone number, no address, no date of birth,
no marketing-preference checkboxes beyond what's legally required (see
Part 18 for the privacy rationale).

**Password requirements:** a length-based policy (minimum 10 characters)
plus a check against a common-password/breached-password list (e.g. via
a k-anonymity HaveIBeenPwned range query, or the equivalent built into a
managed auth provider) is sufficient. Do not impose composition rules
(forced uppercase/digit/symbol) — they push people toward predictable
patterns and hurt usability more than they help security; length +
breach-list checking is the current best practice.

**Email verification:** required, but **not blocking for checkout.** A
student can create an account, verify their email asynchronously (a
"please verify your email" banner in their account area is enough), and
still proceed straight to payment. What email verification *does* gate
is password-reset and any future email-based account-recovery flow —
those must not work against an unverified address. Blocking checkout on
email verification would only add friction between "I want to pay" and
"I have paid," which is the one point in the funnel where friction is
most costly.

**Account creation vs. checkout ordering:** account creation happens
**before** payment, as a distinct first step, not bundled into a single
combined "checkout" form. Reasons: (1) course access must be tied to a
durable identity (a user record) that outlives any one payment attempt —
if payment fails or is abandoned, the account should still exist so the
student can retry without re-entering everything; (2) it lets a returning
customer (see below) skip straight to payment; (3) it keeps the payment
step provider-agnostic and focused only on the transaction, which matters
because the payment provider is not yet chosen (Part 20).

**If a student already has an account:** `/get-started` (or the
account-check step within it) detects an existing session or a matching
email at the email-entry step and redirects into a **login** form instead
of registration. After login, if that account already has active course
access, skip straight to `/learn` (Part 12) — never show a paid customer
a checkout page again. If the account exists but has no active access
(e.g. they registered previously but never paid, or access was later
revoked/refunded), send them to payment.

### C. Payment (provider-agnostic)

No payment provider has been selected (Part 20 lists this as an open
decision). The architecture below must work unchanged regardless of
which provider is eventually chosen, so every payment-provider detail is
expressed as an interface, not an implementation.

**State machine.** A payment/order progresses through these states,
stored server-side (see Part 4's Order model):

- `initiated` — the student has chosen to pay; an order row exists with
  no confirmed transaction yet. This exists so that even an abandoned
  checkout leaves a traceable record (useful for admin support: "I tried
  to pay and nothing happened").
- `pending` — the provider has acknowledged the attempt (e.g. redirected
  to its hosted checkout, or returned a client-side "processing" state)
  but has not yet confirmed success. Access is **not** granted in this
  state, no matter how long it lasts.
- `succeeded` — the provider has confirmed the transaction *and* that
  confirmation was verified server-side (see Part 11). This is the only
  state that triggers access activation (Part 1D).
- `failed` — the provider reported a failed attempt (declined card,
  insufficient funds, etc.). No access. The student is shown a clear,
  non-technical failure message (Part 17) and can retry.
- `cancelled` — the student abandoned the flow before completing payment
  (closed the tab, clicked back). No access. Functionally similar to
  `failed` but distinguished for reporting accuracy.
- `refunded` — a previously `succeeded` payment has been reversed at the
  student's or admin's request. Access is revoked (Part 5 details the
  automatic-vs-manual question).
- `disputed` — a chargeback/dispute was opened with the payment provider
  or the student's bank. Access is revoked pending resolution (Part 5).

**How payment becomes access — the trusted path only:**

```
Student completes payment with provider
        ↓
Provider sends a server-to-server webhook/event to our backend
        ↓
Backend verifies the event is authentic (signature/secret check — Part 11)
        ↓
Backend verifies the event corresponds to a known order (reference match)
        ↓
Backend verifies the amount/currency match what was expected
        ↓
Backend updates Order.status = 'succeeded' (idempotently — see below)
        ↓
Backend creates/activates a CourseAccess record for that user
        ↓
Student's next request to /learn sees active access
```

The student's browser is **never** the source of truth for "payment
succeeded." A client-side success callback (redirect back to our site
after a hosted checkout) is used only to improve UX — e.g. show a "we're
confirming your payment" screen — and must re-poll the backend's own
order status rather than assume success. If the webhook hasn't arrived
yet when the student lands back on our site, they see a pending state
(Part 17), not a false "you're in" screen.

**Idempotency.** Every inbound webhook event carries a provider-issued
event ID. The backend records processed event IDs (or relies on the
order's own state transition being a no-op if already `succeeded`) so
that a duplicate delivery — which every major payment provider explicitly
warns can happen, and which providers actively encourage handlers to
tolerate — never creates a second order, a second access grant, or any
duplicate side effect. Processing a webhook is written as: look up order
by provider reference → if already in a terminal state matching this
event, return 200 and do nothing further → otherwise apply the state
transition once.

**Where the eventual provider plugs in:** a single internal interface,
e.g. `PaymentProvider`, with methods like `createCheckoutSession(order)`,
`verifyWebhookSignature(rawBody, headers)`, and `parseEvent(rawBody)` —
implemented once per provider behind that interface. Nothing outside the
provider-adapter module should know which provider is in use. This is
what makes the provider decision (Part 20) safely deferrable.

### D. Access activation

```
Payment Verified (server-side, via webhook)
        ↓
Order.status → 'succeeded'  (recorded: amount, currency, provider, provider_reference, timestamps)
        ↓
CourseAccess row created (or, if one exists in a non-active state, reactivated):
    user_id, course_id, status = 'active', granted_at = now()
        ↓
Student can now reach /learn — checked on every request, not cached client-side
```

Data that must be stored at this point (full schema in Part 4): the order
itself (so refunds/disputes/support can reference exactly what was paid,
when, and through which provider), and a course-access record separate
from the order (so access state — active/revoked — can change later
without rewriting payment history). Keeping these as two records, not
one, is what makes refund/revocation/restoration (Part 5) clean: the
order is an immutable financial record, access is a mutable entitlement
that a refund or an admin action can flip independently.

### E. Student login (return visits)

On every authenticated request to a protected route, the system checks,
in order:

1. **Is there a valid session?** (Not expired, not revoked — Part 7.)
   If not → redirect to `/login`.
2. **Does the account exist and is it in good standing?** (Not deleted,
   not banned — an edge case, but the check should exist.)
3. **Is there an active `CourseAccess` record for this user and this
   course?** If the record is `pending`, `revoked`, or absent → do not
   serve course content; redirect to an explanatory state (Part 17), not
   a generic 403.
4. **Does the requested resource belong to this user's access?** (Cross-
   user access check — Part 10, threat #7. With a single course product
   this is mostly about not trusting a client-supplied user/course ID in
   any URL or request body; the authorization check always uses the
   session's own user ID, never a value the client sent.)

This check happens **server-side on every request** to a protected route
(via a server component's own data-fetching, or middleware — see Part 12)
— never inferred from client-stored state like a flag in `localStorage`
or a long-lived unchecked JWT claim. A student whose access was revoked
five minutes ago must lose access on their very next request, not after
their token happens to expire.

### F. Course access (the reading experience itself)

Once inside, the student reads modules and lessons rendered as protected
web pages (full architecture in Part 2 and Part 13) — not a PDF, not a
downloadable file. They can navigate between lessons, leave, and come
back later; access persists for as long as `CourseAccess.status = active`,
with no artificial time limit unless FX University later decides to sell
a time-boxed access tier (out of scope now — the model in Part 4 doesn't
preclude adding `expires_at` later, but nothing requires it today).

---

## Part 2 — Protected course viewer architecture

This is the most consequential decision in the whole spec, so each
option is evaluated on the same seven axes the brief asked for.

### Option A — Convert the PDF into protected web-readable pages

Meaning: take the finished PDF and re-derive web content from it (PDF
text/layout extraction → HTML).

- **Security:** medium. Still just gated HTML once done, so the download
  vector is closed — but getting there means parsing a *print-oriented*
  artifact (fixed page breaks, two-column-style worksheet boxes, ASCII
  formula boxes meant for a printed page) back into something responsive,
  which is lossy and fragile.
- **UX:** poor-to-medium. PDF layout is built for 8.5×11 printed pages,
  not phone screens (Part 15 matters a lot here); worksheets with
  underscore blanks and vector checkboxes don't translate cleanly to
  responsive HTML without essentially rebuilding them anyway.
- **Performance:** fine once converted (it's just HTML), but the
  conversion step itself is a real one-time (and per-content-update)
  engineering cost.
- **Implementation complexity:** high, for a bad reason — you'd be
  reverse-engineering structure out of a format that was intentionally
  produced *from* structured markdown in the first place (see
  `pdf-production-spec.md`/`production-manifest.md`). Rebuilding the
  markdown → HTML pipeline the PDF generator already has, but pointed at
  the *original* markdown instead of the PDF, is strictly less work and
  strictly more faithful.
- **Ability to prevent normal downloading:** good, once built.
- **Ability to protect the original PDF:** good — the PDF itself is
  never served to the browser.
- **Maintenance burden:** high — every future curriculum edit means
  re-running PDF→HTML extraction and re-verifying the layout didn't
  break, on top of maintaining the existing markdown→PDF pipeline.

### Option B — Render PDF pages server-side into protected images

Meaning: rasterize each PDF page to an image server-side, serve images
through an authenticated, token-gated endpoint (a "page flipbook").

- **Security:** medium-high against casual copy-paste (no selectable
  text in the browser), but this is the option most likely to be
  *oversold* as more secure than it is — screenshotting or basic OCR
  defeats it exactly as easily as any other on-screen rendering (see the
  security framing in Part 6 and Part 24 principle 8).
- **UX:** poor, especially on mobile (Part 15) — an 8.5×11 page image
  shrunk to a phone width means pinch-zooming to read body text, no
  reflow, no accessible text (screen readers get nothing — Part 16 fails
  outright).
- **Performance:** the worst option at scale (Part 14) — every page view
  is either a rasterization job or a cache-hit on a pre-rendered image set
  that must be regenerated on every content update; image bandwidth per
  lesson is far higher than the equivalent HTML+CSS.
- **Implementation complexity:** high — needs a PDF rasterizer in the
  request path (or a pre-rendered image-per-page build step), a
  token-gated image-serving endpoint, and page-turn UI.
- **Ability to prevent normal downloading:** good for the *whole file*,
  but individual page images are just images — "save image as" on a
  right-click is trivial unless you also fight the browser's native image
  handling (diminishing returns, see Part 6).
- **Ability to protect the original PDF:** good.
- **Maintenance burden:** high — an image-regeneration pipeline is one
  more system to keep in sync with content changes, on top of the
  existing PDF pipeline.

### Option C — Another protected document-viewer architecture

Meaning: embed a JS PDF renderer (e.g. PDF.js) against a token-gated,
short-lived PDF stream, with print/download UI disabled in the viewer.

- **Security:** medium — the browser still receives page content (a
  text layer, if kept for accessibility/search) that devtools/network
  inspection can extract; disabling the viewer's own download button is
  a UI nicety, not a control (Part 24 principle 8). If the text layer is
  stripped to reduce this risk, accessibility (Part 16) and in-page
  search both go with it.
- **UX:** medium — closer to "reading a PDF" than "reading a website";
  same fixed-page-size mismatch with mobile as Options A/B, mitigated
  somewhat by pinch-zoom/pan but still not a native responsive reflow.
- **Performance:** medium — better than full-page rasterization if
  streamed incrementally, worse than plain HTML.
- **Implementation complexity:** high — a custom PDF.js integration,
  per-page or per-chunk token authorization, and print/save suppression
  logic, none of which is a standard, well-trodden Next.js pattern.
- **Ability to prevent normal downloading:** medium — closes the "obvious
  right-click → save file" path but a motivated user can still reconstruct
  the file from the stream (Part 24 principle 8 applies directly here).
- **Ability to protect the original PDF:** medium — the file (or its
  full content, chunked) still transits to the client in some form.
- **Maintenance burden:** medium-high — a third-party viewer library to
  keep updated, plus the custom auth/streaming glue around it.

### Option D — Recommended: render the source markdown into protected, server-rendered web content (not derived from the PDF at all)

Meaning: build a small, purpose-built markdown → React rendering layer
(reusing/adapting the block-parsing approach already proven in
`content/course/production/pdf-generator/lib/md_parse.py`, translated to
the Next.js/TypeScript stack — e.g. `gray-matter` + `remark`/`unified` or
`next-mdx-remote`) that reads directly from `content/course/modules/**`
(the same markdown the PDF was generated from, and the actual source of
truth), and renders each lesson as its own protected route, entirely
server-side.

- **Security:** best of the four. There is no PDF, no PDF-derived image,
  and no PDF stream anywhere in the request/response path for a student.
  An unauthenticated or unauthorized request never receives course HTML
  in the first place — the authorization check happens before any
  content is fetched or rendered (a React Server Component that checks
  access *before* it reads the markdown), so there's no content to leak
  even via a misconfigured cache.
- **UX:** best of the four — genuinely responsive typography, real text
  reflow on any screen size, proper headings for in-page navigation, fast
  client-side transitions between lessons (Next.js App Router), and full
  parity with the brand system already defined for the PDF (same
  black/white/red palette, same callout types, same heading hierarchy —
  `style-guide.md` already documents this and translates directly to
  CSS).
- **Performance:** best of the four at scale (Part 14) — lesson content
  is plain text/markup, trivially small compared to page images or a PDF
  stream, and because the content itself doesn't vary per student
  (only the authorization check does), it can be cached aggressively
  (e.g. Next.js `unstable_cache`/route-segment caching, or a CDN cache
  keyed to be safe only behind the auth check) while the auth check stays
  per-request.
- **Implementation complexity:** medium — this is genuinely new work (no
  existing markdown pipeline in the app today), but it is standard,
  well-documented Next.js territory (server components + a markdown
  renderer), not a bespoke document-viewer.
- **Ability to prevent normal downloading:** best — there is no file to
  download. A screenshot/photo/manual-copy is still possible (Part 24
  principle 8, honestly stated), but there is no "save as," no "download"
  button, and no underlying file object anywhere in the flow.
- **Ability to protect the original PDF:** best and most direct — the
  PDF is completely out of the serving path. It doesn't need to be
  streamed, rasterized, or parsed at request time at all; it can live in
  private storage untouched (Part 3) and only ever be touched by the
  build pipeline that already produces it.
- **Maintenance burden:** lowest of the four going forward — one content
  source (`content/course/modules/**` markdown) feeds both the existing
  PDF pipeline (unchanged) and the new web viewer, so a future curriculum
  edit updates both outputs from the same place instead of requiring a
  separate re-derivation step.

### Recommendation

**Option D.** It wins on every axis except that it requires new
(rather than adapted) rendering code — and that cost is offset by reusing
the same markdown source, the same brand/style rules, and the same
content structure the PDF pipeline already validated. Options A–C all
share the same flaw: they treat the *PDF* as the thing to protect and
serve (in some derived form), when the actual source of truth was always
the markdown, and the PDF is better understood as one *output* of that
source, not the master copy that must be re-processed for the web.

---

## Part 3 — Master PDF protection

**Current state, precisely:** in this Next.js App Router project, only
files under `public/` are served automatically at a predictable URL.
`content/course/production/output/FX-University-Forex-Trading-Course.pdf`
is **not** under `public/` and **no route currently reads or serves
it** — so today, nothing exposes it. The risk is entirely about the
future: a well-meaning later change (e.g. "let's add a download link for
receipts" or a careless `public/` move) could expose it by accident if
there's no structural guardrail.

**Requirements, and how each is met:**

- **Must not be placed in `public/`.** Enforce this as a rule, not just a
  convention: add a CI check (a simple script/test) that fails the build
  if any `.pdf` matching the course filename ever appears under `public/`
  or any other statically-served directory. Cheap, permanent insurance
  against a future accidental `mv`.
- **Must not be available through a predictable public URL / must not be
  linked directly from the frontend.** Because the recommended viewer
  (Part 2, Option D) never serves the PDF to students at all, there is no
  legitimate reason for any frontend code to ever construct a URL to it.
  A repo-wide grep for the PDF's filename should return zero matches
  outside `content/course/production/` — that's a good pre-launch check.
- **Students should not receive a permanent PDF URL.** Satisfied by
  construction — Part 2's recommendation means students never receive a
  PDF URL at all, permanent or temporary.
- **Original master PDF should remain protected/private; app server vs.
  private object storage.** Recommendation: move the canonical PDF (and,
  optionally, the whole `pdf-generator/output/` artifact) to **private
  object storage** (an S3-compatible bucket, Vercel Blob in private mode,
  or a private Supabase Storage bucket — whichever aligns with the
  provider decisions in Part 20) rather than shipping it inside the
  application's deployment bundle at all. Reasons: (1) it decouples a
  large binary asset from the app's deploy artifact and git history
  (large files in a deploy bundle slow cold starts and CI); (2) since the
  recommended student-facing viewer never reads the PDF at runtime, the
  application server doesn't need read access to it in production — the
  only consumers of the PDF going forward are internal/admin (e.g. an
  admin support tool that lets staff regenerate a receipt-friendly export,
  if that's ever wanted) and the build pipeline itself; (3) private
  object storage gives clean, auditable access control (short-lived
  signed URLs for the rare authenticated-admin case, never a public ACL)
  independent of anything the web app does.
- **What stays where:** the markdown source (`content/course/modules/**`)
  remains in the repo — it's source code for both the PDF pipeline and
  the new web viewer. The generated PDF itself is a build artifact and
  belongs in private storage, referenced by the build/admin tooling, not
  the repo, once this system goes to production. Until then, keeping it
  where it is (outside `public/`) is already safe; moving it to private
  storage is a Part 22 implementation task, not something to do by hand
  now.

**Explicit non-exposure checklist** (all satisfied by the above): no
static asset reference, no Next.js `public/` file, no CDN public URL, not
pushed anywhere it'd be publicly cloneable if the repo's own visibility
ever changed, no frontend source reference, no browser-accessible
permanent URL, no predictable API endpoint (there should be no API
endpoint that serves this file to students at all — full stop, not "a
protected one").

---

## Part 4 — Authorization data model

Minimal, provider-agnostic, no unnecessary LMS tables. Four entities.

### `User`

| Field | Notes |
|---|---|
| `id` | primary key |
| `name` | display name |
| `email` | unique, used for login |
| `password_hash` | omitted entirely if using a managed auth provider that owns credential storage (Part 20) |
| `email_verified_at` | nullable timestamp |
| `created_at` / `updated_at` | |

### `Order` (one row per payment attempt)

| Field | Notes |
|---|---|
| `id` | primary key |
| `user_id` | FK |
| `provider` | e.g. `"stripe"`, `"paystack"` — a string, not an enum tied to one provider's SDK |
| `provider_reference` | the provider's transaction/session ID — unique, used for idempotency |
| `amount` | integer minor units (cents/kobo), never a float |
| `currency` | ISO 4217 code |
| `status` | `initiated \| pending \| succeeded \| failed \| cancelled \| refunded \| disputed` |
| `raw_event_ids` | small array/log of processed provider event IDs, for idempotency (Part 11) |
| `created_at` / `updated_at` | |

### `CourseAccess` (the entitlement itself)

| Field | Notes |
|---|---|
| `id` | primary key |
| `user_id` | FK |
| `course_id` | a constant/string today (`"fx-university"`) rather than a full `Course` table — see below |
| `status` | `pending \| active \| revoked` (Part 5) |
| `granted_at` | nullable |
| `revoked_at` | nullable |
| `revocation_reason` | free text/enum: `"refund" \| "dispute" \| "admin_manual" \| ...` |
| `order_id` | FK to the `Order` that granted this access, for traceability |
| `created_at` / `updated_at` | |

### `Session` (only if not delegated to a managed auth provider)

If the eventual auth approach (Part 20) is a managed provider (Clerk,
Supabase Auth, Auth.js with a database adapter), it owns session storage
and this table isn't needed. If credentials are handled directly, a
minimal session table (`id`, `user_id`, `created_at`, `expires_at`,
`revoked_at`, `user_agent`/`ip` for the monitoring described in Part 7) is
required so that "revoke this session" (Part 7, Part 10 threat #14) is
something the backend can actually do — a stateless JWT with no
revocation list cannot satisfy "revoked access takes effect immediately."

### Why no `Course` table

There is exactly one product today. A full `courses` table (with its own
id, title, pricing, curriculum metadata) would be schema for a catalog
that doesn't exist. `course_id` as a fixed string constant on
`CourseAccess` keeps the model honest about current scope while costing
nothing to extend later (adding a real `courses` table if FX University
ever sells a second product is an additive migration, not a breaking
one).

### Why no separate `Payment` *and* `Order` tables

Some systems split "order" (what was purchased) from "payment" (the
transaction attempt) because one order can have multiple payment
attempts (retries) or multiple payments (installments). FX University
sells one course at one price with no installment plan described in this
spec — collapsing them into a single `Order` row per attempt is
sufficient and avoids a join that has no current purpose. If installment
billing is ever added, splitting them out then is a clean, additive
change.

### Optional but genuinely useful: `AccessLog`

Not required for launch, but cheap and valuable for the threat model
(Part 10) and admin visibility (Part 9): a row per meaningful access
event (`login`, `lesson_viewed`, `access_denied`), with `user_id`,
`event_type`, `ip`, `user_agent`, `created_at`. This is the basis for
"unusual access detection" in Part 7 and "basic access history" in
Part 9. Recommended, not essential — see Part 6's essential/recommended/
optional split for the reasoning.

---

## Part 5 — Access states

Three states, as the brief anticipates, and that's genuinely enough —
a fourth ("suspended", "trial", "grace period") isn't justified by
anything in the current product (one course, one price, no trial tier
described).

- **`pending`** — an account exists, possibly an `Order` exists in a
  non-terminal state, but no successful payment has been verified. No
  course access. This is also the state a `CourseAccess` row can be
  created in optimistically at `initiated`/`pending` order time if you
  want a row to update in place rather than insert-on-success — an
  implementation detail, not a spec requirement.
- **`active`** — verified payment has been confirmed server-side (Part
  1C/1D). Full course access.
- **`revoked`** — access has been withdrawn, either automatically
  (refund/dispute — see below) or manually (admin action, Part 9).
  `revoked_at` and `revocation_reason` are set. No course access,
  regardless of any cached session state (Part 1E's per-request check is
  what guarantees this takes effect immediately).

**Payment succeeds** → `CourseAccess.status = active` (Part 1D).

**Payment fails** → no `CourseAccess` row is activated; the `Order`
records `failed` for support/analytics purposes. Student sees a clear
retry path (Part 17).

**Payment pending** → no access until a `succeeded` webhook is verified.
If a student's payment is stuck pending for an unreasonable time (a
provider-specific concern), that's a support/admin situation (Part 9),
not something the student-facing system should paper over with
speculative access.

**Payment refunded** → **access is revoked automatically**,
`revocation_reason = "refund"`. Rationale: a refund is an unambiguous
signal that the transaction backing the access was undone; granting a
refund and leaving access active would mean the course was effectively
free on request, which undermines the product. This should be the
default behavior triggered directly by the refund webhook event, with no
manual admin step required — but an admin should still be able to
manually restore access afterward (e.g. a goodwill exception) since
Part 9 requires manual grant/restore as an admin capability regardless of
how access was lost.

**Payment disputed/charged back** → **access is revoked automatically**
on receipt of the dispute-opened event, same mechanism as refund
(`revocation_reason = "dispute"`). Rationale: once a chargeback is filed,
FX University is already financially exposed; continuing to provide
access during the dispute adds no benefit and (depending on the provider)
can occasionally count against the merchant in dispute evidence. If the
dispute is later resolved in FX University's favor, an admin restores
access manually (Part 9) rather than the system auto-restoring — a
human should confirm resolution before re-granting, since dispute
outcomes aren't always communicated via a clean webhook event across
every provider.

**Admin manually revokes access** → `status = revoked`,
`revocation_reason = "admin_manual"` (with a free-text note if the admin
tool supports it — Part 9). Takes effect on the revoked user's very next
request (Part 1E).

**Admin restores access** → `status = active` again, `revoked_at`/
`revocation_reason` cleared or superseded, `granted_at` updated. Works
regardless of *why* access was originally revoked — refund, dispute, or
manual — since the admin action is the trusted signal at that point.

---

## Part 6 — Anti-download measures

Split exactly as requested, with the framing from Part 24 principle 8
applied throughout: nothing here claims to stop screenshots, photos, or a
determined devtools user — the goal is closing the *easy, obvious* paths
(a downloadable file, a guessable URL, an unauthenticated API) that
would otherwise make casual sharing/downloading trivial.

**Essential — absolutely implement:**

- Private storage for the PDF (Part 3) — nothing to download in the
  first place.
- Every protected route/request authenticated and authorized server-side
  (Part 1E) — no route ever returns course content to a request that
  hasn't passed the access check, regardless of what the client claims.
- No permanent, predictable, or public URLs to course content or the PDF
  — content is served only via authenticated server rendering (Part 2
  Option D), never a static file URL.
- Payment verified only via signed server-to-server webhook (Part 11) —
  never via a client-reported "success."
- Session-based authorization checked on every protected request, not
  cached indefinitely client-side — a revoked session/access loses
  access immediately (Part 1E, Part 5).
- Rate limiting on authentication endpoints (login, password reset) to
  blunt credential-stuffing/brute-force attempts — standard, cheap,
  necessary regardless of course-content protection specifically.

**Recommended — materially improves protection:**

- Access logging (the `AccessLog` table, Part 4) — not a prevention
  mechanism by itself, but the basis for noticing abuse patterns (Part 7)
  and for admin visibility (Part 9) after the fact.
- Basic UI affordances that discourage casual copying without pretending
  to be security: disabling the browser's default text-selection/
  right-click context menu on lesson content is fine as a mild deterrent
  *as long as it is never described as a security control* — it stops a
  casual "select all, copy, paste into a doc" and nothing more. This
  belongs here, not in "essential," precisely because Part 24 principle 8
  forbids treating it as one.
- Session/device visibility for the student (Part 7) — "here's where
  you're logged in" is both a UX feature and a mild sharing deterrent
  (a student who can see 4 unfamiliar devices logged into their account
  notices).
- Suspicious-access alerting (Part 7) — e.g. many rapid lesson views from
  new/unfamiliar locations in a short window, surfaced to admin, not
  auto-enforced (auto-locking a legitimate student's account on a false
  positive is worse than the problem it solves).

**Optional — can wait:**

- Per-student watermarking (Part 8) — genuinely useful as a *social*
  deterrent, not a technical one; worth building once the core system is
  stable, not before.
- Short-lived signed tokens for any future case where a genuinely
  file-like asset (e.g. a downloadable certificate, if that's ever added
  outside this spec's scope — see Part 19) needs to be served — not
  needed today because Option D never serves a file at all.
- More advanced anomaly detection (ML-based, IP-geolocation heuristics)
  — real diminishing returns for a single-course product at this scale;
  revisit only if Part 7's simpler monitoring shows a real problem.

**Explicitly not recommended:** disabling right-click/dev-tools/print
as a *claimed* security measure, obfuscating page source, or any
"security through obscurity" technique presented to stakeholders as
protection — these stop almost no one and, per Part 24 principle 8,
must not be sold as more than a mild, honest deterrent if used at all.

---

## Part 7 — Account sharing

The realistic goal is discouraging casual sharing (one paying student
handing a login to a friend), not building surveillance infrastructure
for a single-course education product.

- **Session management:** standard session/token expiry (e.g. a rolling
  30-day session refreshed on activity, so a normal returning student
  never has to re-login constantly — directly satisfying "do not make
  students constantly re-authenticate for normal use").
- **Concurrent-session limits:** **not recommended as a hard block.**
  Legitimate students routinely use a phone and a laptop, or a work and
  home computer. A hard concurrent-session cap creates real support
  burden (locked-out legitimate users) for a soft problem. Instead:
  *visibility*, not *enforcement* — a "manage devices/sessions" view in
  account settings showing active sessions (device/browser, approximate
  location, last-active time) with a "log out this device" action the
  student controls themselves. This is both good security hygiene
  (matches what banks/major SaaS products already do) and a mild sharing
  deterrent without punishing normal multi-device use.
- **Unusual access detection:** a lightweight, admin-facing signal (not
  an automatic lockout) — e.g. flag accounts with an unusual number of
  distinct IPs/locations in a short window, surfaced in the admin view
  (Part 9) for a human to optionally investigate, not to trigger
  automatic suspension. False positives (VPN users, travel, mobile
  carriers rotating IPs) are common enough that automatic enforcement
  would cause more harm than the sharing it's meant to catch.
- **Forced logout:** available to the student (via the sessions view
  above) and to an admin (as part of revoking access, Part 9) — a
  revoked `CourseAccess` should also invalidate active sessions for that
  user if using a session table, or simply become moot immediately if
  using the per-request access check from Part 1E (which is why that
  check matters more than session expiry alone).
- **Password reset / account recovery:** standard email-based reset flow
  (a signed, short-lived, single-use token emailed to the verified
  address). No security questions (weak, hard to keep private), no SMS
  requirement (adds a phone-number collection requirement this spec
  otherwise avoids — Part 18).

**Tradeoff stated plainly:** every measure above was chosen by asking
"does this catch real sharing without punishing a legitimate student
using two devices, traveling, or on a shared/VPN connection?" Anything
that failed that test (hard concurrent-session caps, automatic
IP-based lockouts, forced re-authentication on every request) was left
out deliberately, per Part 24 principle 6.

---

## Part 8 — Optional student watermarking

**Recommendation: yes, but lightweight, and explicitly optional/
deferrable (Part 6 already places it in "optional").**

**Does it materially discourage sharing?** Modestly, and mostly
*socially* rather than technically — it does nothing to stop a
screenshot from being taken, but it does mean that if a screenshot or
photo *is* shared, it visibly identifies whose account it came from,
which is a real deterrent for the common case (a student casually
forwarding a page to a friend) even though it does nothing against a
determined bad actor. This matches the honest framing Part 24 principle 8
requires: a social deterrent, not a technical control.

**Where it should appear:** a small, low-contrast line in the page
footer area of each lesson page — e.g. `Licensed to name · email` — using
the same muted-gray footer treatment the PDF already uses for its own
footer (`style-guide.md`'s existing footer convention), so it's
consistent with the brand system and doesn't look like a bolted-on
security banner.

**Visible but unobtrusive:** yes — small type, muted color, footer
position only (never overlaid across the body text, never a diagonal
watermark across the reading area, which would actively hurt readability
and violate Part 24 principle 6). It should be easy to *notice* if you
look, and easy to *ignore* while actually reading.

**Every page?** Every lesson/content page, yes — consistency is what
makes it meaningful; a watermark that appears on only some pages is
trivially avoided by sharing the unwatermarked ones.

**Privacy considerations:** display name + email is personal data shown
on every page a student's own browser renders — that's fine (they're
seeing their own data, same as any account-context UI), but it should
**never** be included in anything cacheable at a shared layer (e.g. a CDN
edge cache keyed without the user in the key) since that would leak one
student's email into another student's response. Because Option D
already requires per-user authorization on every request, the render
naturally can't be shared-cached across users without the fix already
being part of the architecture — this is a reason the caching guidance
in Part 14 explicitly separates "cacheable content" from "per-request
authorization + personalization."

**How it should work, concretely:** the server component that renders a
lesson page reads the current session's `name`/`email` (already
available from the auth check that gated the page) and interpolates it
into a small footer component — no separate database lookup, no
client-side JS needed, no risk of it being stripped by disabling
JavaScript (since it's server-rendered into the HTML itself).

---

## Part 9 — Admin controls

Minimum viable admin surface — explicitly not a CMS, not a course editor,
not analytics. One admin-only route (or small route group), e.g.
`/admin/students`, gated by an `is_admin` flag on `User` (simplest
possible role model for a single-admin-role product) checked server-side.

**Required capabilities:**

- **View customers** — a searchable (by name/email) list of users, each
  showing: account created date, email-verified status, current
  `CourseAccess.status`, and latest `Order` summary (amount, currency,
  provider, status, date).
- **View payment/access status** — a detail view per user showing full
  order history (every `Order` row, not just the latest) and the current
  and historical `CourseAccess` state (when granted, when/why revoked, if
  applicable).
- **Manually grant access** — creates/activates a `CourseAccess` row with
  `revocation_reason` cleared, independent of any `Order` (covers
  goodwill grants, manual/offline payment arrangements, support
  resolutions).
- **Revoke access** — sets `status = revoked`, `revocation_reason =
  "admin_manual"`, optional free-text note.
- **Restore access** — reactivates a previously revoked `CourseAccess`
  row (Part 5).
- **View basic payment reference** — the provider's transaction
  reference/ID, visible to admin for support/reconciliation purposes
  (never exposed to the student beyond what the provider's own receipt
  shows).
- **Basic access history** — the `AccessLog` table (Part 4), if built;
  otherwise, the `CourseAccess` state-change history is sufficient for
  launch, and access-event logging can be added later without
  restructuring anything.
- **Search by email/name.**
- **Identify failed/pending payments** — a filtered view of `Order` rows
  in `failed`/`pending`/`initiated` state, useful for proactive support
  ("I tried to pay and it didn't work").

**Explicitly out of scope** (per the brief's own list, reaffirmed here
because it's a real temptation to scope-creep into): course authoring,
lesson editor, student grading, certificate management, complex
analytics, community management, affiliate management, progress
analytics, full CRM. None of these are needed to deliver "protected
online access to a course a student already paid for," which is the
entire mandate of this system.

---

## Part 10 — Security threat model

| # | Threat | Risk | Mitigation | Priority |
|---|---|---|---|---|
| 1 | Student guesses a course URL | Low — content isn't served by ID-guessable URLs at all under Option D (routes are `/learn/[module]/[lesson]` with slugs, not opaque IDs, but every request still requires an authorized session regardless of whether the slug is guessed) | Server-side authorization check before any content is read/rendered (Part 1E) — guessing the right slug gets you nothing without a valid session+access | Essential |
| 2 | Student shares a course URL with another person | Medium — the URL alone is useless without that person also having a valid, authenticated session for an account with active access | Same as above; the URL carries no access on its own (no token-in-URL scheme) | Essential |
| 3 | Student shares their login credentials | Medium — the one scenario URL-level protection can't stop by itself | Session visibility + self-service device management (Part 7); admin-visible unusual-access signals (Part 7); this is accepted as a residual risk mitigated socially (watermarking, Part 8) rather than "solved" technically — stated honestly per Part 24 | Recommended (beyond the essential session/auth basics) |
| 4 | Student attempts to access the PDF directly | Low, if Part 3 is implemented — there is no route that serves it | Private storage, no public/predictable URL, CI guardrail against accidental exposure (Part 3) | Essential |
| 5 | Student inspects network requests (devtools) | Low-medium — they can see the HTML/data their *own* authorized session legitimately receives (expected — they paid for it), but not other users' data or the PDF | Server-rendered content only contains what that specific authorized user is entitled to; no over-fetching of other users' or unrelated data in any response | Essential |
| 6 | Student reuses an expired URL (e.g. an old password-reset or magic-link) | Low | Single-use, short-lived, signed tokens for any link-based flow (reset, email verification); expired/used tokens rejected server-side | Essential |
| 7 | Student attempts to access another student's course/account resources | Medium if not carefully checked | Authorization checks always derive the "whose data is this" answer from the *session*, never from a client-supplied ID in the URL/body (Part 1E) | Essential |
| 8 | Unauthenticated API requests | Medium | Every protected route/handler checks session validity before doing anything else; no protected route trusts an absent or malformed session as "public" by default (deny-by-default, not allow-by-default) | Essential |
| 9 | Payment spoofing (forged "I paid" claim) | High if not guarded | Access is only ever granted from a verified webhook event (Part 11), never from any client-reported state | Essential |
| 10 | Fake client-side payment success (tampered redirect/callback) | High if trusted | Same as above — the success redirect is UX only; the backend re-checks the order's actual server-side status before showing "you're in" | Essential |
| 11 | Replay of a payment webhook | Medium | Idempotent processing keyed on provider event ID / order reference (Part 1C, Part 11) — replays are no-ops | Essential |
| 12 | Duplicate webhook delivery (providers explicitly warn this happens) | Medium | Same idempotency mechanism — this is the same mitigation as #11, not a separate one | Essential |
| 13 | Refunded customer retains access | Medium | Automatic revocation on the refund webhook event (Part 5) | Essential |
| 14 | Revoked customer retains an old session | Medium | Per-request authorization check (Part 1E) means a revoked `CourseAccess` blocks access on the very next request regardless of session validity; if using a custom session table, revoking access can also proactively invalidate sessions | Essential |
| 15 | Public/static exposure of course assets | High if it happens, low likelihood if Part 2/3 are followed | No file-based content in the serving path at all (Option D); CI guardrail (Part 3) | Essential |
| 16 | Server misconfiguration exposing private files | Medium | Private object storage with no public ACL (Part 3) rather than relying on "just don't add a route for it"; periodic (e.g. pre-deploy) automated check that the PDF isn't reachable at any known/guessed path | Recommended (the CI guardrail in Part 3 is the essential version; a live post-deploy probe is the recommended hardening) |

---

## Part 11 — Payment verification security (provider-agnostic)

Restated as explicit requirements, all provider-agnostic:

- **Never trust the browser.** A client-side "payment succeeded" event
  (redirect, postMessage, whatever the eventual provider's client SDK
  produces) is used only to drive UI state ("checking your payment...");
  it never directly flips `Order.status` or grants `CourseAccess`.
- **Webhook verification:** every inbound webhook's authenticity is
  verified using the provider's documented signature/secret mechanism
  (virtually every major provider — Stripe, Paystack, Flutterwave,
  Lemon Squeezy, etc. — signs webhook payloads with an HMAC secret
  specifically for this purpose) before the payload is trusted or parsed
  for business logic. An unverified/invalid signature is rejected
  outright (non-2xx or simply ignored, per the provider's expected
  contract) and logged.
- **Provider signature verification** is implemented once, inside the
  provider-adapter module (Part 1C), so the rest of the system only ever
  sees an already-verified, normalized event.
- **Idempotency:** covered in Part 1C/Part 10 (#11, #12) — processing is
  written to be a safe no-op on a repeat event.
- **Transaction reference validation:** the webhook's transaction/session
  reference is matched against a known `Order.provider_reference` created
  at checkout-initiation time; an event referencing an order we have no
  record of is logged and ignored, never treated as "create access for
  whoever this claims to be."
- **Amount/currency validation:** the verified event's amount and
  currency are compared against the `Order`'s expected amount/currency at
  creation time; a mismatch is treated as suspicious (logged, not
  auto-activated) rather than silently accepted — this guards against a
  class of bugs/attacks where a low-value or wrong-currency transaction
  could otherwise be replayed against a higher-value order reference.
- **Duplicate event handling:** identical to idempotency above.
- **Access activation only after trusted confirmation:** restated from
  Part 1D — activation is a direct, synchronous consequence of a
  verified webhook, not a polling assumption, not a client callback, not
  a delayed batch job (a batch job would introduce unnecessary latency
  between "paid" and "can read the course," which is bad UX for no
  security benefit).
- **Refund/reversal handling:** the same webhook-driven pattern —
  refund/dispute events are verified exactly like a success event and
  trigger the automatic revocation described in Part 5.

---

## Part 12 — Routing architecture

Kept lean, and explicitly evaluated against "don't create dozens of
routes just because an LMS normally has them."

```
/                          existing homepage — unchanged
/course/                   existing marketing/sales landing page — unchanged
/get-started                already-reserved entry point → becomes:
                             account creation (or login, if returning) + checkout
/login                      explicit login route (linked from /get-started
                             when an existing account is detected, and from
                             any "session expired" state)
/account                    minimal account area: profile basics, email
                             verification status, active sessions/devices
                             (Part 7), order/receipt summary
/learn                      protected course home — module list, resume-
                             where-you-left-off entry point
/learn/[module]/[lesson]    protected lesson content (the actual reading
                             experience, Part 2/13)
/admin/students             admin-only (Part 9)
```

**Evaluated and deliberately excluded:**

- A separate `/checkout` route distinct from `/get-started` — not needed;
  `/get-started` already is the checkout entry point per its existing
  docstring and the pricing CTA already pointing at it. Splitting account
  creation and payment into `/signup` + `/checkout` as two *URLs* isn't
  necessary — they can be two *steps* within the `/get-started` flow
  (Part 1B/1C), avoiding an extra route for what's really one funnel.
- `/learn/[module]` as its own intermediate route (module overview page)
  — evaluated, and left as a **reasonable optional addition**, not a
  requirement: `/learn` itself can show the full module/lesson list with
  progress state, making a separate per-module landing page a nice-to-
  have rather than structurally necessary. An implementer can add it if
  the module list gets long enough to want a dedicated per-module view;
  it doesn't change anything else in this spec if added later.
- Separate `/signup` vs `/login` as the *first* thing a student sees —
  rejected in favor of a single email-first step within `/get-started`
  that branches to registration or login based on whether the email is
  recognized (Part 1B) — one fewer decision for the student to make
  upfront ("do I have an account?" is something the system can answer
  for them).
- A public `/pricing` route separate from `/course/#pricing` — the
  existing anchor-based pricing section on the marketing page already
  serves this; no reason to duplicate it.

**Why `/learn` rather than `/course/learn`:** evaluated both, per the
brief's request to explain the tradeoff rather than assume.
- `/course/learn` nests the protected app under the existing marketing
  route, which reads nicely ("the course, and here's where you learn it")
  but risks two real problems: (1) `app/course/layout.tsx` currently
  wraps the marketing page in its own header/footer/announcement-bar
  layout meant for a public sales page — a protected reading experience
  needs a *different* layout (no sales nav, no announcement bar, probably
  a distraction-free reading chrome instead), and nesting under the same
  App Router segment makes that layout separation slightly more awkward
  (needing a route-group split to avoid inheriting the marketing layout);
  (2) it blurs the line between "public marketing route" and "protected
  app route" in the URL structure itself, which makes it marginally
  easier to misconfigure caching/auth boundaries between the two later.
- `/learn` as a sibling top-level route cleanly separates "public
  marketing surface" from "authenticated product surface" at the routing
  level, gets its own layout with zero inheritance risk from the
  marketing chrome, and is a shorter, cleaner URL for something students
  will bookmark and return to often.
- **Recommendation: `/learn`**, for the layout-separation and clean-
  boundary reasons above — but this is flagged again in Open Decisions
  at the end, since it's a judgment call with a reasonable case either
  way and it's the kind of naming decision worth a quick sanity check
  before implementation locks it in.

**`/course/` is not modified** by any of this — same content, same
components, same CTA target it already has today.

---

## Part 13 — Course content architecture

Directly restates and formalizes the Part 2/Option D decision as it
applies to content sourcing specifically:

**Recommended approach: render the source markdown directly (item 1 in
the brief's list), not a derived web-content format, not generated page
assets, and not PDF page rendering.**

- The markdown under `content/course/modules/**` is already the
  authoritative source — the PDF itself is generated *from* it
  (`production-manifest.md` documents this trace exactly). Treating
  anything downstream of the markdown (the PDF, or images of the PDF) as
  the web viewer's source would mean protecting and rendering a copy of
  a copy, with no benefit and real fidelity/maintenance cost (Part 2's
  option-by-option analysis).
- "Convert Markdown to a secure web-content format" (the brief's option
  2) is effectively what rendering markdown *into React server components
  at request time* already accomplishes — there's no need for a separate
  intermediate "secure format" or a build-time static-export step that
  would then itself need protecting; the protection comes from the
  authorization check gating the render, not from the format the content
  is stored in.
- "Generated page assets" (option 3) — not recommended as a *pre-build*
  step (e.g. statically generating every lesson page into the deploy
  bundle) because that would mean every lesson's full content ships
  inside the application bundle regardless of who requests it, relying
  entirely on route-level auth to gate access rather than the content
  simply not being fetched/rendered for an unauthorized request in the
  first place. Rendering server-side, per authorized request (with
  aggressive caching *behind* the auth check, not instead of it — Part
  14), gets the performance benefit without that exposure surface.
- **The existing markdown is not rewritten, the curriculum is not
  changed, and the master PDF is not altered** — this system only reads
  `content/course/modules/**`; it adds a new consumer of that content, it
  does not modify the content or the separate, already-complete PDF
  pipeline in any way.

**Practical construction:** a small content-loading layer (e.g.
`lib/course-content.ts`) that mirrors the shape of the existing
`lib/course-data.ts` file conceptually (a clean, typed interface the rest
of the app consumes) but is backed by reading and parsing the markdown
files at request time (with caching, Part 14) instead of a hand-authored
object. Front matter (title, lesson order) plus the same block-level
structure the PDF generator's `md_parse.py` already proved out (headings,
callouts, tables, checklists, formulas) is translated into a TypeScript/
React equivalent — this is genuinely new code, but it is directly modeled
on a design that's already been validated against the real content.

---

## Part 14 — Performance

**1 student:** trivial — a single server-rendered request per page view,
no meaningful load anywhere in the stack.

**100 students:** still trivial on any standard Next.js hosting
(Vercel or equivalent) — the content itself is small, mostly-static text;
the only per-request work is the authorization check (a fast
indexed-lookup query) plus rendering already-cacheable markdown→HTML.

**1,000 students:** the design goal is that this tier looks the same as
100, operationally — achieved by separating two concerns explicitly:
(1) *content rendering*, which does not vary per user (the same lesson's
HTML is identical for every authorized student, aside from the small
watermark string, Part 8) and can be cached at the rendered-output level
(e.g. Next.js data/fetch caching, or a route-segment cache) keyed by
lesson, not by user; and (2) *authorization*, a single lightweight
per-request database check that gates whether the cached content is
served at all. This means the expensive part (parsing/rendering markdown)
happens once per content version, not once per request.

**5,000+ students (FX University's actual historical scale):** the
explicit assumption from the brief — not all 5,000 are simultaneously
active — holds up the same caching strategy; realistic concurrent load
for an education product is a small fraction of the total user base at
any given moment. The main scaling levers, in priority order: (1) the
caching split above, which keeps rendering cost roughly constant
regardless of total user count; (2) database connection pooling/indexing
on the two or three lookup paths that matter (`user_id` → `CourseAccess`,
`email` → `User`, `provider_reference` → `Order`) — cheap to get right
from day one, expensive to retrofit; (3) if the eventual provider choice
supports it, edge/CDN caching of the *rendered-but-not-yet-authorized*
HTML fragment with the authorization check happening in a thin
middleware/edge function in front of it — a genuinely available option on
Vercel specifically, worth confirming once hosting (Part 20) is
finalized, but not required for a correct v1.

**Caching strategy, summarized:** cache content by lesson version, not by
user; never cache the authorization decision itself beyond the current
request (Part 5/Part 10 require revocation to take effect immediately);
keep watermarking (Part 8) as a cheap per-request string interpolation
*after* the cacheable content is retrieved, not baked into the cached
artifact.

**Protected asset delivery:** under the recommended architecture there
are no protected *binary* assets in the hot path at all (no images, no
PDF pages, no video) — course content is text/markup. If FX University
later adds media (diagrams, video), that would warrant revisiting this
section with signed, short-lived URLs for that specific media — out of
scope today because no such assets exist in the current curriculum.

**Storage considerations:** the database stays small (a few tables,
rows proportional to user count, not content size); the only large
binary asset in the whole system is the master PDF itself, which lives
in private object storage and is never read in the student-facing
request path at all (Part 3) — so it has zero bearing on this
performance analysis.

---

## Part 15 — Mobile experience

Directly satisfied by the Option D recommendation (Part 2), specified
explicitly:

- **Responsive reader:** real HTML/CSS reflow (Tailwind, matching the
  existing site's responsive conventions already used on `/course/`) —
  no fixed-page-size content anywhere, unlike any PDF-derived option.
- **Readable typography:** a comfortable reading measure (max content
  width, e.g. `~65ch`), font sizes that don't require zooming, generous
  line-height — the same typographic care already documented for the PDF
  in `style-guide.md`, translated to responsive web units instead of
  fixed points.
- **Touch navigation, next/previous lesson:** a simple, always-visible
  next/previous control at the bottom (and optionally top) of each lesson
  page — this is the single most important navigation primitive for a
  linear course and should not be buried in a menu.
- **Module navigation:** a collapsible/off-canvas module+lesson list on
  small screens (standard responsive-sidebar pattern), full sidebar on
  larger screens.
- **Minimal interface:** the reading chrome should be deliberately
  sparse — no marketing header, no announcement bar (explicitly different
  from `/course/`'s layout, reinforcing the Part 12 routing decision) —
  just enough navigation to move through the course.
- **No horizontal scrolling:** tables and formula blocks (which have
  fixed-width monospace content in the PDF) need explicit mobile handling
  — e.g. horizontal scroll *contained within* a table element specifically
  (not the whole page), or reflow to a stacked layout for narrow tables,
  decided per-component during implementation rather than left to chance.
- **Loading states:** since content is server-rendered per request (not
  client-fetched after an empty shell), the natural Next.js loading UI
  (`loading.tsx` route segments) covers this with minimal extra work —
  a lightweight skeleton/spinner during navigation, not a blank white
  screen.
- **Poor-network considerations:** text-and-markup content is inherently
  lightweight compared to any image/PDF-based alternative (reinforcing
  Part 2's recommendation) — this is one of the concrete, measurable
  benefits of Option D over Options A–C, not just a security argument.

---

## Part 16 — Accessibility

- **Semantic HTML:** real `<h1>`–`<h3>` heading hierarchy (matching the
  PDF's own documented heading hierarchy, so the two outputs stay
  conceptually aligned), real `<table>` markup for tables, real `<ul>`/
  `<ol>` for lists, real `<input type="checkbox">` (or an accessible
  custom equivalent with proper ARIA state) for checklist items —
  directly achievable under Option D and **not achievable at all** under
  Options B/C (an image or a stripped-text-layer PDF stream gives
  screen readers nothing).
- **Keyboard navigation:** all interactive elements (next/previous
  lesson, module list toggles, account/session management controls)
  reachable and operable via keyboard alone, with visible focus states
  (see below).
- **Readable contrast:** the existing black/white/red brand palette
  already documented in `style-guide.md` should be checked against WCAG
  AA contrast ratios when translated to web colors (the PDF's exact hex
  values are a starting point, not an automatic pass — print and screen
  contrast requirements aren't identical).
- **Text-based content over images:** every content type in the
  curriculum (formulas, tables, checklists, callouts) renders as real
  text/markup under Option D, not as an image of text — this is a direct,
  structural accessibility win of the recommended architecture, not an
  add-on feature.
- **Proper headings:** lesson titles, section headings, and callout
  labels use real heading levels and landmark regions
  (`<nav>`/`<main>`/`<aside>` as appropriate) so screen-reader users can
  navigate by heading/landmark the same way sighted users scan visually.
- **Screen-reader considerations:** the watermark footer (Part 8) should
  be marked in a way that doesn't interrupt the reading flow (e.g. placed
  outside the main content landmark, or given appropriate ARIA
  labeling), and any icon-only navigation controls (next/previous arrows)
  need accessible text labels, not just visual icons.
- **Focus states:** visible, on-brand focus rings on every interactive
  element — required for keyboard users and required for various
  accessibility compliance baselines; a small, easy-to-get-wrong detail
  worth calling out explicitly so it isn't dropped during implementation.

---

## Part 17 — Failure states

All messages student-facing, plain language, no stack traces, no
provider-specific jargon, no technical error codes shown directly (an
internal reference ID is fine, useful for support, and not itself
technical-sounding).

| Situation | What the student sees |
|---|---|
| Payment pending | "We're confirming your payment — this usually takes a few seconds to a couple of minutes. This page will update automatically." (auto-polling or a manual refresh, not a dead end) |
| Payment failed | "Your payment didn't go through. No charge was made. You can try again, or use a different payment method." + a retry action |
| Payment succeeded but webhook hasn't arrived yet | Same as "pending" above — the student never sees a false negative; if confirmation takes unusually long, a "still confirming — contact support if this doesn't resolve in [X]" message after a reasonable timeout |
| Account exists but course access is inactive | "Your account doesn't have active access to this course yet." with a clear path to checkout (covers both "never paid" and "access was revoked" without exposing the specific reason — the specific reason is an admin/support detail, not something to surface generically to avoid confusing wording for an edge case like a pending refund review) |
| Session expired | "You've been logged out for your security. Please log back in." with a direct link to `/login` that returns them to where they were headed afterward |
| Course access has been revoked | Same message as "inactive" above, from the student's point of view — the system doesn't need to (and generally shouldn't) explain *why* in the UI; a student who believes this is a mistake contacts support, where an admin has the full picture (Part 9) |
| Server error | A generic, calm "something went wrong on our end — please try again in a moment" with a reference ID, never implementation detail |
| Protected asset fails to load | Under the recommended architecture there's no separate "asset" to fail independently of the page itself (Part 14) — a failed page load gets the same generic server-error treatment above |

---

## Part 18 — Data & privacy

**Minimum data collected, and why:**

- **Name** — display purposes (watermark, account area, receipts).
- **Email** — login identifier, transactional communication (receipts,
  password reset, access-related notices).
- **Password (or auth-provider identifier)** — authentication.
- **Payment records (`Order` rows)** — amount, currency, provider,
  provider reference, status, timestamps — required for support,
  reconciliation, refund handling, and (depending on jurisdiction) legal/
  tax record-keeping. Full card/payment-method details are **never**
  stored by this system at all — that data stays entirely with the
  payment provider, which is standard practice and reduces this system's
  compliance burden significantly (no PCI-DSS scope beyond "redirect to a
  provider-hosted checkout" territory).
- **Access logs (optional, `AccessLog`)** — if implemented, only the
  minimum needed for the threat-model/admin-visibility purposes in Parts
  7/9/10 (event type, timestamp, coarse device/location signal) — not
  granular behavioral tracking (which lessons were read for how long,
  scroll depth, etc. — explicitly not collected; this is not an
  analytics product, per Part 19).

**Retention:**

- Payment/order records: retained per applicable financial
  record-keeping requirements (commonly several years; the exact period
  is a legal/jurisdictional question outside this spec's technical scope
  — flagged in Open Decisions only if FX University's jurisdiction has a
  specific requirement to encode).
- Access logs (if implemented): a much shorter, rolling retention window
  (e.g. 90 days) is sufficient for the abuse-detection purpose they
  serve — there's no reason to keep granular access logs indefinitely.
- Session records: pruned/expired on their own schedule (Part 7), no
  long-term retention needed beyond active-session management.

**Password/security requirements:** covered in Part 1B — length-based
policy plus breach-list checking, no arbitrary composition rules.

**Account deletion:** a student who requests deletion should have their
personal data (name, email, password/credential) removed or
irreversibly anonymized, while the underlying `Order` financial records
are retained (per the retention note above) in a form that satisfies
record-keeping obligations without retaining unnecessary personal
identifiers beyond what that obligation requires — the exact mechanics
(hard delete vs. anonymize-in-place) are an implementation detail best
decided alongside whichever jurisdiction's requirements apply, not a
technical open question this spec needs to resolve further.

**What is deliberately not collected:** phone number, physical address,
date of birth, government ID, IP-based precise geolocation beyond
coarse abuse-detection signals, behavioral/analytics tracking of reading
activity, marketing-consent data beyond what's legally required for any
transactional email FX University already needs to send.

---

## Part 19 — What we are not building

Explicit boundary, restated from the brief because it's worth having in
the spec itself, not just the request that produced it. This system is
**not**:

a full LMS · a social network · a community platform · an affiliate
platform · a signal service · a trading platform · a broker · a
copy-trading system · a student grading system · a certificate platform ·
a mobile app · a course-authoring CMS · a downloadable PDF store.

Also explicitly excluded from anything built under this spec: fake
scarcity, fake countdowns, fake testimonials, guaranteed-profit or
income-promise language, "get rich quick" mechanics of any kind — none of
which have any place in an access-control system regardless, but stated
here as a boundary marker consistent with the course content's own
existing, deliberate avoidance of these patterns (already verified during
the course's own QC/PDF-production phases).

---

## Part 20 — Provider decisions

Every external-service decision that must be made before implementation,
with a recommendation where one is reasonably determinable now, and
flagged for the user's input where it genuinely isn't (also listed again
in Open Decisions).

| Decision | Used for | Required? | What's needed before implementation | Provider-agnostic interface to build regardless |
|---|---|---|---|---|
| **Payment provider** | Processing course payments, webhooks | Yes | Which provider(s) FX University can actually settle with in its target market(s) — a business/banking decision, not a technical one | `PaymentProvider` interface (Part 1C) — `createCheckoutSession`, `verifyWebhookSignature`, `parseEvent` |
| **Authentication approach** | Login/session/credential management | Yes | A choice between (a) a managed auth provider (e.g. Clerk, Supabase Auth, Auth.js) or (b) fully custom credential handling on top of the chosen database | An `AuthProvider`-shaped boundary (`getSession`, `requireAuth`, `createUser`, etc.) so the rest of the app doesn't hard-couple to whichever is chosen |
| **Database** | Users, orders, course access, sessions | Yes | A Postgres-compatible option is assumed (broadest ecosystem fit for Next.js — Prisma/Drizzle both support it well); specific host (Neon, Supabase, Vercel Postgres, etc.) can be decided alongside hosting | A schema/ORM layer (Prisma or Drizzle, either is reasonable) — not a raw-SQL-per-route approach, so the data model in Part 4 stays portable |
| **Private object storage** | Master PDF, any future private assets | Yes, per Part 3 | Which bucket/provider (S3-compatible, Vercel Blob private mode, Supabase Storage private bucket) — often naturally follows whichever hosting/database provider is chosen, for one fewer vendor | A thin storage-adapter interface, even though the PDF isn't in the student-facing hot path — keeps future private-asset needs (Part 14's media note) unblocked |
| **Email provider** | Verification emails, password reset, receipts, revocation/refund notices | Yes (transactional email is required for Parts 1B/7/17, not optional) | Any standard transactional email API (e.g. Resend, Postmark, SES) — a low-stakes choice, several are functionally interchangeable for this volume | A minimal `sendTransactionalEmail(template, to, data)` interface |
| **Hosting** | Deploying the Next.js app | Yes | Vercel is the strong default given the `.gitignore`'s existing `.vercel` entry and Next.js's first-party optimization there, but worth a one-line confirmation since no deployment config currently exists | N/A — hosting choice doesn't need an abstraction layer the way the above do |

Nothing above was selected "because it's familiar" — each recommendation
(where given) follows from either the existing codebase's own signals
(the `.vercel` gitignore entry), the Next.js ecosystem's best-supported
options, or the specific requirements this spec already established
(e.g. email being required, not optional, because Parts 1B/7/17 depend
on it).

---

## Part 21 — Recommended architecture

```
                         LANDING PAGE  (/course/ — unchanged, public)
                                 │
                          primary CTA (existing: /get-started)
                                 ▼
                            ACCOUNT  (/get-started → /login)
                    [ Auth provider: manages credentials/sessions ]
                                 │
                             PAYMENT  (/get-started, step 2)
                [ Payment provider: hosted checkout / client SDK ]
                                 │
                                 │  (webhook — server to server only)
                                 ▼
              SERVER-SIDE PAYMENT VERIFICATION  (signature + reference
              + amount/currency checks, idempotent — Part 11)
                                 │
                                 ▼
                     COURSE ACCESS RECORD  (Database: Order + CourseAccess
                     rows, Part 4 — the durable record of "who is
                     entitled to what, and why")
                                 │
                                 ▼
              AUTHENTICATED COURSE ENVIRONMENT  (/learn — new protected
              route group, own layout, no marketing chrome)
                    [ Authorization layer: per-request check against
                      CourseAccess.status, derived from session only —
                      never from client-supplied IDs ]
                                 │
                                 ▼
                  PROTECTED COURSE CONTENT  (/learn/[module]/[lesson] —
                  server-rendered from content/course/modules/**
                  markdown, Part 2 Option D / Part 13)
                    [ Course renderer: markdown → React server
                      components, cached by content version ]
                                 │
                                 ▼
                          ONLINE READING
              (responsive, accessible, watermarked footer, no
               download/file/PDF anywhere in this path)


  Where each piece lives:
  ─────────────────────────────────────────────────────────────────
  Database              → Users, Orders, CourseAccess, (Sessions),
                           (AccessLog) — Part 4
  Authentication        → chosen auth provider or custom credential
                           layer — Part 20 (open decision)
  Payment provider      → behind the PaymentProvider interface —
                           Part 1C / Part 20 (open decision)
  Private storage       → master PDF only, never in the student path —
                           Part 3
  Course renderer       → new lib/course-content.ts + /learn routes,
                           reading content/course/modules/** directly —
                           Part 13 (existing PDF pipeline untouched)
  Authorization layer   → per-request check, in server components
                           and/or a thin middleware — Parts 1E, 6, 10
  Admin controls        → /admin/students, same database, no new
                           infrastructure — Part 9
  ─────────────────────────────────────────────────────────────────
  Untouched by this system: /, /course/, content/course/modules/**
  (as source content, read-only), the existing PDF generator, and the
  master PDF file itself (moved to private storage, never re-processed
  by anything described here).
```

---

## Part 22 — Implementation phases

Each phase states its objective, likely affected files/components,
dependencies, acceptance criteria, and an explicit "do not touch" list.
Sequencing follows dependency order (you can't gate access before you
can authenticate a user; you can't verify payment before there's an
order to verify against).

### Phase 1 — Foundation: database + authentication

- **Objective:** stand up the data model (Part 4) and working account
  creation/login/session management (Parts 1B, 1E, 7), with no payment
  or course-content involvement yet.
- **Likely affected/new:** `lib/db.ts` (or ORM client setup), a schema/
  migration for `User`/`Session` (and stub `Order`/`CourseAccess` tables
  so Phase 2 doesn't require another migration), `app/get-started/`
  (real registration/login form replacing the placeholder), `app/login/`,
  `app/account/` (minimal).
- **Dependencies:** database provider and auth approach decided
  (Part 20).
- **Acceptance criteria:** a user can register, verify email
  asynchronously, log in, log out, reset a forgotten password, and see a
  basic account page; no course access exists yet because no payment
  system exists yet (expected — `CourseAccess` stays empty this phase).
- **Must not change:** `/`, `/course/`, `content/course/**`, anything
  under `content/course/production/`.

### Phase 2 — Payment integration

- **Objective:** working checkout against the chosen provider, with
  full server-side verification (Parts 1C, 11) and the `Order` state
  machine.
- **Likely affected/new:** the `PaymentProvider` adapter module, a
  webhook route handler (e.g. `app/api/webhooks/payment/route.ts`),
  checkout initiation inside `/get-started`'s payment step.
- **Dependencies:** Phase 1 complete; payment provider selected
  (Part 20, open decision).
- **Acceptance criteria:** a real (sandbox/test-mode) payment creates an
  `Order`, transitions through the documented states correctly, a
  verified webhook is required for `succeeded`, duplicate/replayed
  webhooks are no-ops, and an invalid signature is rejected — all
  independently testable without any course-content system existing yet.
- **Must not change:** anything from Phase 1's scope boundary, plus no
  course-content routes exist yet to accidentally affect.

### Phase 3 — Access control

- **Objective:** connect a `succeeded` order to an active `CourseAccess`
  record (Part 1D), and build the per-request authorization check
  (Part 1E) as a reusable function/middleware, before there's any real
  content to gate.
- **Likely affected/new:** access-activation logic triggered from the
  Phase 2 webhook handler, a `requireCourseAccess()`-style server-side
  helper, a placeholder `/learn` route that just proves the gate works
  (e.g. renders "you have access" vs. redirecting appropriately).
- **Dependencies:** Phases 1–2 complete.
- **Acceptance criteria:** the full pending → active → revoked lifecycle
  (Part 5) is testable end-to-end against the placeholder route, refund/
  dispute webhooks correctly auto-revoke, and admin manual grant/revoke
  (a minimal version, ahead of full Phase 6 admin UI) works.
- **Must not change:** Phase 1–2 scope; still no real course content
  wired in.

### Phase 4 — Protected course viewer

- **Objective:** build the markdown-rendering layer (Part 13) and the
  real `/learn/[module]/[lesson]` experience (Part 2 Option D), replacing
  the Phase 3 placeholder.
- **Likely affected/new:** `lib/course-content.ts` (markdown loading/
  parsing), `app/learn/layout.tsx` (distraction-free reading chrome, no
  marketing nav), `app/learn/page.tsx` (module/lesson list), `app/learn/
  [module]/[lesson]/page.tsx`, shared content-block React components
  (heading, callout, table, formula, checklist — mirroring the PDF
  generator's proven block types).
- **Dependencies:** Phase 3's authorization gate; a content-loading
  design informed by (but not copying code from) `content/course/
  production/pdf-generator/lib/md_parse.py`'s block structure.
- **Acceptance criteria:** all 10 modules render correctly and
  responsively from the existing markdown, with no wording/content
  changes; mobile layout (Part 15) and accessibility basics (Part 16)
  verified; caching strategy (Part 14) in place.
- **Must not change:** `content/course/modules/**` content itself (read
  only), the PDF pipeline, `content/course/production/output/*.pdf`.

### Phase 5 — Anti-sharing / security hardening

- **Objective:** the "recommended" and remaining "essential" items from
  Part 6 not already covered by earlier phases — session/device
  management UI (Part 7), watermarking (Part 8, optional but reasonable
  to include here if time allows), access logging (Part 4/9/10),
  CI guardrail against PDF exposure (Part 3).
- **Likely affected/new:** `app/account/sessions/` (or a section of
  `/account`), the watermark footer component wired into Phase 4's
  content rendering, an `AccessLog` table + writes at key events, a CI
  script checking `public/` for the PDF filename.
- **Dependencies:** Phases 1–4 complete.
- **Acceptance criteria:** a student can view and revoke their own
  active sessions; (if included) the watermark renders correctly and
  isn't cached cross-user (Part 8's caching warning); the CI guardrail
  fails a build that accidentally introduces a public PDF reference.
- **Must not change:** anything from prior phases' completed scope.

### Phase 6 — Admin controls

- **Objective:** the full `/admin/students` surface (Part 9).
- **Likely affected/new:** `app/admin/students/` route(s), an
  `is_admin` check/guard, search/filter/detail views over the existing
  `User`/`Order`/`CourseAccess` data (no new core data model needed
  beyond an `is_admin` flag on `User`).
- **Dependencies:** Phases 1–3 (needs the full data model and access
  lifecycle already working); can proceed in parallel with Phase 4/5 if
  useful, since it doesn't depend on the course viewer.
- **Acceptance criteria:** every capability listed in Part 9 works
  against real data — search, view, manual grant/revoke/restore, payment
  reference visibility, failed/pending payment identification.
- **Must not change:** no course-authoring capability is added, per
  Part 9's explicit boundary — resist scope creep here specifically.

### Phase 7 — Testing / security audit

- **Objective:** work through Part 23's full acceptance checklist plus
  Part 10's threat model, item by item, against the real implementation.
- **Likely affected/new:** test suites (unit/integration for the
  authorization and payment-verification logic especially — these are
  the highest-consequence code paths in the whole system), a manual
  security review pass against Part 10.
- **Dependencies:** Phases 1–6 complete.
- **Acceptance criteria:** Part 23's checklist passes in full; no
  Part 10 threat is left with only a "planned" mitigation.
- **Must not change:** nothing new — this phase is verification, not
  feature work; any fix it surfaces should be scoped back to the
  relevant earlier phase's boundaries.

---

## Part 23 — Acceptance criteria (final implementation checklist)

Implementation is not complete until every item below passes:

- [ ] **Unauthorized access:** a visitor with no account cannot reach any
      `/learn` route — redirected to `/get-started`/`/login`, no content
      rendered, no leaked data in the response.
- [ ] **Unpaid account:** a registered, logged-in user with no
      `succeeded` order / no `active` `CourseAccess` cannot reach `/learn`
      content — redirected to checkout with a clear message (Part 17).
- [ ] **Paid account:** a user with verified payment and `active`
      `CourseAccess` can reach and read all course content correctly.
- [ ] **Direct PDF request:** no URL, guessed or otherwise, returns the
      master PDF to an unauthenticated or student-authenticated request;
      confirmed via the CI guardrail (Part 3) and a manual pre-launch
      check.
- [ ] **Revoked access:** a user whose `CourseAccess.status` is flipped to
      `revoked` loses access on their very next request, without needing
      to wait for session expiry.
- [ ] **Expired session:** an expired or invalidated session cannot reach
      protected content; the user is prompted to log back in (Part 17).
- [ ] **Cross-user access:** Student A cannot view Student B's account
      data, order history, or session list via any manipulated request
      (IDs in URLs/bodies are never trusted over the session's own
      identity — Part 10 #7).
- [ ] **Payment spoofing:** no client-side-only signal (tampered redirect,
      forged callback, manipulated local state) can activate
      `CourseAccess` — only a verified server-side webhook can.
- [ ] **Duplicate webhook:** sending the same payment-success webhook
      event twice does not create a duplicate `Order`, a duplicate
      `CourseAccess` grant, or any duplicate side effect (e.g. a
      duplicate receipt email).
- [ ] **Refund/reversal:** a refund or dispute event correctly and
      automatically revokes access (Part 5), and an admin can
      subsequently restore it if warranted.
- [ ] **Mobile:** the full `/learn` experience — navigation, reading,
      checklists, tables, formulas — works correctly on a real small
      screen with no horizontal scroll and no unreadably small text.
- [ ] **Performance:** protected pages remain fast and responsive under
      simulated realistic concurrent load (not all 5,000 historical
      students at once, but a reasonable concurrent fraction), per the
      caching strategy in Part 14.

---

## Part 24 — Design principles

Restated here as a single reference, since they governed every decision
above:

1. Security must be server-enforced, not just UI-enforced.
2. Never expose the master PDF publicly.
3. Never trust client-side payment success.
4. Do not build a full LMS.
5. Keep the student experience simple.
6. Protect the course without making legitimate access frustrating.
7. Do not over-engineer before there is a demonstrated need.
8. Do not claim impossible DRM/security guarantees.
9. Do not modify completed course content.
10. Do not break `/course/`.
11. Do not implement until the specification is approved.

---

## Open decisions

Only genuine decisions requiring input before implementation — everything
this document could reasonably determine on its own has already been
decided above.

1. **Payment provider.** Not assumed anywhere in this spec (Part 1C,
   Part 20). Needs a business decision (which provider(s) FX University
   can settle with in its actual target market) before Phase 2 can start.
   The `PaymentProvider` interface means this choice doesn't ripple
   through the rest of the system once made.

2. **Authentication approach: managed provider vs. custom.** A real
   architectural fork (Part 20) — a managed provider (e.g. Clerk,
   Supabase Auth, Auth.js with a DB adapter) trades a small recurring
   cost/vendor dependency for materially less custom security-sensitive
   code to build and maintain (password storage, session handling, reset
   flows); a fully custom approach trades that convenience for full
   control and no external auth dependency. Both are legitimate; this
   spec doesn't pick one because the tradeoff genuinely depends on FX
   University's cost sensitivity and comfort with a vendor dependency in
   the auth path specifically.

3. **Database provider/host.** A Postgres-compatible option is assumed
   (Part 20) as the technical default, but the specific host (Neon,
   Supabase, Vercel Postgres, a self-managed instance, etc.) is an
   infrastructure/cost decision, often best made alongside the hosting
   decision below for the sake of fewer vendors.

4. **Private object storage provider.** Follows from whichever
   database/hosting choice is made (Part 20) — flagged separately only
   because it's the one piece of infrastructure directly responsible for
   Part 3's core requirement (the PDF must never become publicly
   reachable), so it's worth a deliberate, not incidental, choice.

5. **`/learn` vs. `/course/learn` as the protected route root.** Part 12
   gives a reasoned recommendation (`/learn`, for clean layout separation
   from the marketing route) but flags it here because it's a genuine
   judgment call rather than something with only one defensible answer —
   worth a quick confirmation before it's baked into URLs students will
   bookmark.

6. **Payment/financial record retention period.** Part 18 notes that
   `Order` records should be retained per applicable financial
   record-keeping requirements but does not specify a duration, since
   that depends on FX University's operating jurisdiction(s) — a legal/
   compliance input, not a technical one.

7. **Whether to include student watermarking (Part 8) in the initial
   build or defer it.** The spec recommends it as a lightweight,
   deferrable addition (already reflected as "optional" in Part 6) —
   flagged here only so the decision to include it in Phase 5 or push it
   to a later pass is a conscious choice, not a default.

---

## What was and was not done in this phase

**Created:** this file,
`content/course/production/course-access-security-spec.md`.

**Modified:** `content/course/production/README.md` (added a pointer to
this spec in its file listing — see below).

**Not done, per this phase's explicit scope:** no website code was
modified; no application code, database, migration, authentication,
payment integration, storage, or API route was created; `/course/`,
`app/get-started/page.tsx`, `app/page.tsx`, and every other existing
route/component are byte-for-byte unchanged; `content/course/modules/**`
and the master PDF at `content/course/production/output/
FX-University-Forex-Trading-Course.pdf` were read for reference only and
were not altered; nothing was deployed.
