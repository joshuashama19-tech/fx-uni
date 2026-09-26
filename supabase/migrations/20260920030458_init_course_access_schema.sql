-- =============================================================================
-- FX University — Course Access: initial schema
-- =============================================================================
-- Tables: profiles, orders, course_access, payment_events.
--
-- Core rule enforced throughout: students can READ their own rows, but no
-- privileged write (order status, course access, is_admin) is reachable by
-- a regular authenticated user. Those writes happen only through server-only
-- code using the service-role client (lib/supabase/admin.ts) — the Paystack
-- webhook handler and admin actions — after their own authorization checks.
-- RLS here is the backstop that makes that true even if application code
-- has a bug: a normal user's Postgres role simply has no grant to do it.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
-- One row per auth.users row, created automatically by the trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per authenticated user. Created automatically on signup by handle_new_user(). is_admin gates access to /admin and can only be changed by a service-role query (e.g. run directly in the Supabase SQL editor), never by the user themselves.';

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Regular users may update their own row (e.g. full_name) but must never be
-- able to grant themselves admin. This trigger silently pins is_admin to its
-- previous value unless the write is performed by the service role (which
-- bypasses RLS and this trigger's role check is moot for it anyway — this
-- trigger is specifically the backstop against the *authenticated* role).
create or replace function public.prevent_self_admin_grant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' and new.is_admin is distinct from old.is_admin then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_self_admin_grant on public.profiles;
create trigger trg_prevent_self_admin_grant
  before update on public.profiles
  for each row
  execute function public.prevent_self_admin_grant();

-- Auto-create a profiles row whenever a new auth.users row is created
-- (i.e. on signup, handled by Supabase Auth itself).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null default 'fx-university',
  amount_minor_units integer not null check (amount_minor_units > 0),
  currency text not null,
  status text not null default 'pending'
    check (status in ('pending', 'successful', 'failed', 'cancelled', 'refunded', 'disputed')),
  paystack_reference text not null unique,
  paystack_authorization_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is
  'One row per checkout attempt. Created (status=pending) server-side when a student starts checkout. Status only ever transitions away from pending via the service-role client, after Paystack server-side verification or an authenticated webhook event — never from a client-reported "success".';

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());

-- A student may create their OWN pending order (checkout initiation), and
-- only ever as status='pending' — never any other status. No update/delete
-- policy exists for the authenticated role at all: every subsequent status
-- change (successful/failed/refunded/...) happens through the service-role
-- client, which bypasses RLS after its own trusted verification.
create policy "orders_insert_own_pending"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid() and status = 'pending');

-- ---------------------------------------------------------------------------
-- course_access
-- ---------------------------------------------------------------------------
create table if not exists public.course_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null default 'fx-university',
  status text not null default 'active' check (status in ('active', 'revoked')),
  order_id uuid references public.orders (id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  granted_by uuid references public.profiles (id),
  notes text,
  unique (user_id, course_id)
);

comment on table public.course_access is
  'The single source of truth for "does this user have access to this course right now". Read on every protected /learn request via requireCourseAccess() (getUser() + a fresh, uncached query — no long-lived cache — so revocation takes effect immediately). Written only by the service-role client: automatically on verified payment, or manually by an admin action.';

create index if not exists course_access_user_id_idx on public.course_access (user_id);

alter table public.course_access enable row level security;

create policy "course_access_select_own"
  on public.course_access for select
  to authenticated
  using (user_id = auth.uid());

-- No insert/update/delete policy for authenticated users at all: access can
-- only be granted or revoked server-side (webhook after verified payment,
-- or an admin action), both using the service-role client.

-- ---------------------------------------------------------------------------
-- payment_events
-- ---------------------------------------------------------------------------
-- Append-only log of every Paystack webhook event received, used for
-- idempotency (a replayed webhook for the same reference+event is a no-op)
-- and for audit/support ("what did Paystack actually tell us, and when").
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  paystack_reference text not null,
  event_type text not null,
  dedupe_key text not null unique,
  status text,
  raw_payload jsonb not null,
  received_at timestamptz not null default now()
);

comment on table public.payment_events is
  'Append-only. dedupe_key (event_type + ":" + paystack_reference + ":" + a hash of the payload) has a unique constraint — the webhook handler upserts on conflict do nothing, which is what makes a replayed Paystack webhook safe to process twice. Written only by the service-role client (there is no legitimate client-side writer). No RLS policies are defined for the authenticated/anon roles, so with RLS enabled, ordinary users get zero access by default.';

create index if not exists payment_events_order_id_idx on public.payment_events (order_id);
create index if not exists payment_events_reference_idx on public.payment_events (paystack_reference);

alter table public.payment_events enable row level security;
-- Intentionally no policies for `authenticated`/`anon` — default-deny.
-- The service role bypasses RLS entirely, which is the only writer this
-- table is designed to have.

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();
