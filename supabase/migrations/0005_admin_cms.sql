-- =============================================================================
-- FX University — Admin content management (testimonials, FAQs, site copy)
-- =============================================================================
-- Adds three tables so the admin can manage landing-page content without
-- editing source code:
--   - testimonials  (student quotes shown on /course)
--   - faqs          (the FAQ accordion on /course)
--   - site_content  (a small, curated set of editable CTA/marketing strings —
--                    deliberately NOT a generic "every string is a DB row"
--                    system; see lib/content.ts for the fixed key list)
--
-- Same security model as every other table in this schema (see 0001_init.sql):
-- RLS is enabled everywhere, public/authenticated roles get a narrow SELECT
-- policy (published rows only), and there is NO insert/update/delete policy
-- for anon/authenticated at all. Every write goes through the service-role
-- client (lib/supabase/admin.ts) from a Server Action that itself calls
-- requireAdmin() first (lib/admin/content-actions.ts) — identical to how
-- course_access and orders are already written. This is a deliberate choice
-- to keep exactly one authorization pattern in the codebase rather than
-- introduce a second one (e.g. a Postgres helper function + RLS policies
-- keyed off profiles.is_admin) for these tables alone.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  role_title text,
  quote text not null,
  display_order integer not null default 0,
  is_active boolean not null default false,
  -- True for the three "Student name pending" placeholder rows migrated
  -- from lib/course-data.ts on 2026-09-20 (see the seed insert below) and
  -- for any future row an admin explicitly marks as a placeholder while
  -- drafting. Placeholders are never shown publicly regardless of
  -- is_active — see the select policy below — so this flag is purely an
  -- admin-facing label ("this is a draft, not a real testimonial") rather
  -- than a second visibility switch.
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.testimonials is
  'Student testimonials shown on /course. Only rows with is_active = true AND is_placeholder = false are ever readable by anon/authenticated — see testimonials_select_published. All writes go through the service-role client from an admin-gated Server Action (lib/admin/content-actions.ts), never through RLS policies for the authenticated role.';
comment on column public.testimonials.is_placeholder is
  'Marks a row as a draft/placeholder, never a genuine student quote. Placeholder rows are excluded from the public select policy even if is_active is true, so a placeholder can never accidentally be shown to real visitors as a genuine testimonial.';

alter table public.testimonials enable row level security;

create policy "testimonials_select_published"
  on public.testimonials for select
  to anon, authenticated
  using (is_active = true and is_placeholder = false);

-- No insert/update/delete policy for anon/authenticated — see file header.

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.faqs is
  'FAQ accordion on /course. Only rows with is_active = true are readable by anon/authenticated. All writes go through the service-role client from an admin-gated Server Action, never through RLS policies for the authenticated role.';

alter table public.faqs enable row level security;

create policy "faqs_select_published"
  on public.faqs for select
  to anon, authenticated
  using (is_active = true);

create trigger faqs_set_updated_at
  before update on public.faqs
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- site_content
-- ---------------------------------------------------------------------------
-- A small, fixed set of editable strings — NOT a generic CMS field for every
-- piece of copy on the site (see lib/content.ts, which enumerates the exact
-- keys the app reads and the hardcoded fallback used when a key has no row
-- yet, so a missing/blank value never breaks the page).
create table if not exists public.site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.site_content is
  'A small fixed set of admin-editable marketing strings (final CTA copy, etc — see lib/content.ts for the exact key list and the hardcoded fallback each one falls back to). Deliberately not a general-purpose CMS table. Writes go through the service-role client from an admin-gated Server Action.';

alter table public.site_content enable row level security;

create policy "site_content_select_all"
  on public.site_content for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policy for anon/authenticated — see file header.

create trigger site_content_set_updated_at
  before update on public.site_content
  for each row
  execute function public.set_updated_at();

-- Note: all three "before update" triggers above reuse the existing
-- public.set_updated_at() function already defined in 0001_init.sql and
-- hardened (fixed search_path, revoked from PUBLIC) in
-- 0002_harden_functions.sql — no new trigger function is defined here.

-- ---------------------------------------------------------------------------
-- Seed: migrate the existing placeholder testimonials from lib/course-data.ts
-- ---------------------------------------------------------------------------
-- Inserted as inactive + is_placeholder so they never appear publicly (the
-- select policy above excludes them either way) — this just preserves them
-- in the admin UI as a starting point / reminder that real testimonials
-- still need to be entered, instead of silently losing them. TestimonialsSection
-- renders nothing on /course until real, active rows exist (see
-- components/TestimonialsSection.tsx) rather than showing these to visitors.
-- No "on conflict do nothing" here: these tables have no natural unique key
-- to conflict on (id is a fresh random uuid every time), and it isn't
-- needed for idempotency — Supabase records each migration as applied
-- exactly once and will not re-run this file.
insert into public.testimonials (student_name, role_title, quote, display_order, is_active, is_placeholder)
values
  ('Student name pending', null, 'A genuine testimonial from a real student will go here once it''s supplied.', 0, false, true),
  ('Student name pending', null, 'A genuine testimonial from a real student will go here once it''s supplied.', 1, false, true),
  ('Student name pending', null, 'A genuine testimonial from a real student will go here once it''s supplied.', 2, false, true);

-- ---------------------------------------------------------------------------
-- Seed: migrate the existing FAQ items from lib/course-data.ts
-- ---------------------------------------------------------------------------
insert into public.faqs (question, answer, display_order, is_active)
values
  ('I''m completely new to this. Can I actually understand it?', 'Yes — the course is written specifically for people with zero background. Module 1 starts with basic terminology and builds up in order, so nothing assumes knowledge you don''t have yet.', 0, true),
  ('Do I need a lot of money to start?', 'No. This is an educational course, not a trading fund — you''re paying for the course itself, not to open a trading account. What you do with your own money afterward, and how much, is entirely your decision.', 1, true),
  ('Do I need previous trading experience?', 'No previous experience is required. The course is built to take you from zero to a structured, intermediate understanding.', 2, true),
  ('Can I learn using my phone?', 'Yes — course access is designed to work well on mobile, tablet, and desktop.', 3, true),
  ('Is this a signals service?', 'No. This is an educational course, not a signals service. The goal is to teach you to read and understand the market yourself, not to hand you trades to copy.', 4, true),
  ('Is this mentorship?', 'No. This is a self-paced course, not one-on-one mentorship or coaching. It''s built so you can learn the material in order, at your own pace, without needing live sessions with an instructor.', 5, true),
  ('Will this guarantee profits?', 'No course or educational program can guarantee trading profits, and we won''t claim otherwise. Trading involves substantial risk. This course is designed to build your understanding, skills, and process — not to promise results.', 6, true),
  ('Why should I buy this instead of just watching YouTube?', 'You can absolutely learn from free content, and some of it is good. What free content rarely offers is order — a single path that takes you from fundamentals to a full trading plan without contradictions or gaps. That structure, plus the built-in exercises and checklists, is what you''re paying for.', 7, true),
  ('What exactly do I receive after payment?', 'Secure, personal access to the full 10-module course, including all lessons, examples, exercises, checklists, the backtesting walkthrough, and the trading-journal framework.', 8, true),
  ('How quickly can I go through the course?', 'That depends on your pace — the material is self-paced, so you can move quickly through fundamentals or take your time on modules like risk management and psychology. Most beginners benefit from not rushing the earlier modules.', 9, true),
  ('How do I access the course?', 'After your payment is confirmed, you''ll get secure, personal access to the course through your account.', 10, true),
  ('Is this financial advice?', 'No. This is an educational course designed to teach you how the Forex market works. Nothing in this course is personalized financial or investment advice.', 11, true);

-- Note: the old "What payment methods will be available?" placeholder FAQ
-- answer was not migrated — it referenced payment processing as
-- unfinalized, which is no longer true (Paystack is live). Add a real
-- answer for that question through /admin/faqs if it's still wanted.
