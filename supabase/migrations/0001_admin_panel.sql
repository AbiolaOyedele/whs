-- ============================================================================
-- WildHands admin panel — initial schema
--
-- Run once against the Supabase project (SQL Editor, or `supabase db push`).
--
-- ⚠️ THIS IS A SHARED SUPABASE PROJECT. Everything WildHands owns lives in a
-- dedicated `wildhands` schema, never in `public`. Nothing here creates,
-- alters or drops anything outside that schema, so it cannot collide with
-- another project's tables, enum types, functions or triggers — all four are
-- schema-scoped in Postgres, and a bare `create type quote_status` in `public`
-- is exactly the kind of thing that breaks someone else's deploy at 2am.
--
-- Two consequences of sharing worth carrying in your head:
--
--   1. `auth.users` is PROJECT-WIDE, not ours. Every other application in this
--      project writes users into the same table. That is precisely why sign-in
--      checks ADMIN_ALLOWED_EMAILS as well as the password — see the note on
--      the allowlist in src/lib/admin/auth.ts. Without it, anyone who signs up
--      to any application sharing this project could administer this site.
--
--   2. The service role key bypasses RLS across the WHOLE project, not just
--      this schema. Treat it accordingly.
--
-- SECURITY POSTURE: row-level security is enabled on every table and NO policy
-- grants access to `anon` or `authenticated`. That is deliberate. Nothing in
-- this application talks to Supabase from a browser. Every read and write goes
-- through our own /api/v1/admin/* routes using the service role, which bypasses
-- RLS, after those routes have checked the session cookie.
--
-- So RLS here is a backstop: if a Supabase anon key ever leaked, it would grant
-- exactly nothing. Adding a permissive `authenticated` policy would quietly
-- undo that, so do not add one without changing the access model first.
-- ============================================================================

-- Everything WildHands owns lives here. `public` is left alone entirely.
create schema if not exists wildhands;

-- No `create extension` on purpose. `gen_random_uuid()` has been core Postgres
-- since 13 and Supabase runs newer, so pgcrypto is not needed — and installing
-- an extension is the one thing in this file that would reach outside our
-- schema and affect the other applications sharing this database.
--
-- With that gone, every statement below is schema-qualified: running this
-- migration cannot alter, lock or break anything in `public`.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type wildhands.quote_status as enum ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wildhands.quote_event_type as enum ('viewed', 'pin_failed', 'accepted', 'declined', 'downloaded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wildhands.publish_status as enum ('queued', 'triggered', 'failed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- updated_at trigger, shared by every table that carries the column
-- ---------------------------------------------------------------------------

create or replace function wildhands.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = wildhands, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- QUOTES
-- ===========================================================================

create table if not exists wildhands.quotes (
  id uuid primary key default gen_random_uuid(),

  -- URL segment: whstd.com/quote/<slug>. Lowercase, hyphenated, unique.
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 80),

  -- SHA-256 of (pepper + pin). The PIN itself is never stored, and is shown to
  -- the operator exactly once, at the moment it is set.
  pin_hash text not null,

  status wildhands.quote_status not null default 'draft',

  -- Client
  client_name text not null check (char_length(client_name) between 1 and 120),
  client_company text check (char_length(client_company) <= 160),
  client_email text check (char_length(client_email) <= 254),
  client_role text check (char_length(client_role) <= 120),

  -- Project
  project_title text not null check (char_length(project_title) between 1 and 200),
  project_summary text not null default '' check (char_length(project_summary) <= 4000),
  intro_note text not null default '' check (char_length(intro_note) <= 2000),

  -- Money. Amounts are stored in minor units (pence/kobo/cents) as bigint so
  -- there is no floating point anywhere near a price.
  currency text not null default 'GBP' check (currency ~ '^[A-Z]{3}$'),
  discount_minor bigint not null default 0 check (discount_minor >= 0),
  tax_rate_bp integer not null default 0 check (tax_rate_bp between 0 and 10000), -- basis points
  deposit_percent integer not null default 50 check (deposit_percent between 0 and 100),
  payment_terms text not null default '' check (char_length(payment_terms) <= 2000),
  terms text not null default '' check (char_length(terms) <= 8000),

  valid_until date,

  -- Lifecycle
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  view_count integer not null default 0 check (view_count >= 0),
  decided_at timestamptz,
  decision_note text check (char_length(decision_note) <= 2000),

  created_by uuid references auth.users (id) on delete set null
);

create index if not exists quotes_status_idx on wildhands.quotes (status, updated_at desc);
create index if not exists quotes_created_idx on wildhands.quotes (created_at desc);

drop trigger if exists quotes_set_updated_at on wildhands.quotes;
create trigger quotes_set_updated_at
  before update on wildhands.quotes
  for each row execute function wildhands.set_updated_at();

-- Line items — the cost breakdown.
create table if not exists wildhands.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references wildhands.quotes (id) on delete cascade,
  position integer not null default 0,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 2000),
  quantity numeric(10, 2) not null default 1 check (quantity >= 0),
  unit_price_minor bigint not null default 0 check (unit_price_minor >= 0),
  -- Optional items are shown, priced, and excluded from the total until chosen.
  is_optional boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quote_line_items_quote_idx on wildhands.quote_line_items (quote_id, position);

-- Timeline phases.
create table if not exists wildhands.quote_phases (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references wildhands.quotes (id) on delete cascade,
  position integer not null default 0,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 2000),
  duration_label text not null default '' check (char_length(duration_label) <= 80),
  deliverables text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists quote_phases_quote_idx on wildhands.quote_phases (quote_id, position);

-- Reference links — "here is how this will look".
create table if not exists wildhands.quote_references (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references wildhands.quotes (id) on delete cascade,
  position integer not null default 0,
  label text not null check (char_length(label) between 1 and 200),
  url text not null check (url ~* '^https?://' and char_length(url) <= 2048),
  description text not null default '' check (char_length(description) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists quote_references_quote_idx on wildhands.quote_references (quote_id, position);

-- Images, stored in Cloudinary. We keep the identifiers, not the bytes.
create table if not exists wildhands.quote_images (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references wildhands.quotes (id) on delete cascade,
  position integer not null default 0,
  url text not null check (char_length(url) <= 2048),
  public_id text not null check (char_length(public_id) <= 400),
  caption text not null default '' check (char_length(caption) <= 500),
  width integer check (width > 0),
  height integer check (height > 0),
  created_at timestamptz not null default now()
);

create index if not exists quote_images_quote_idx on wildhands.quote_images (quote_id, position);

-- Audit trail for a client-facing document. `ip_hash` is a salted digest, not
-- an address: enough to tell two viewers apart, not enough to identify anyone.
create table if not exists wildhands.quote_events (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references wildhands.quotes (id) on delete cascade,
  type wildhands.quote_event_type not null,
  ip_hash text,
  user_agent text check (char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists quote_events_quote_idx on wildhands.quote_events (quote_id, created_at desc);

-- Reusable starting points, so a common engagement is not retyped each time.
create table if not exists wildhands.quote_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists quote_templates_set_updated_at on wildhands.quote_templates;
create trigger quote_templates_set_updated_at
  before update on wildhands.quote_templates
  for each row execute function wildhands.set_updated_at();

-- ===========================================================================
-- SITE CONTENT EDITING
-- ===========================================================================

-- One editable string, number, list or image on the marketing site.
--
-- `key` is a stable dotted path (e.g. 'home.hero.headline'). The build reads
-- these at build time and falls back to `default_value` — which is the copy
-- currently hardcoded in the repo — whenever a row is missing or blank. That
-- fallback is what makes the editor safe: deleting a row restores the shipped
-- copy rather than emptying the page.
create table if not exists wildhands.content_blocks (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9]+(\.[a-z0-9_-]+)*$'),
  page text not null default '' check (char_length(page) <= 120),
  section text not null default '' check (char_length(section) <= 120),
  label text not null default '' check (char_length(label) <= 200),
  help text not null default '' check (char_length(help) <= 500),
  type text not null default 'text'
    check (type in ('text', 'textarea', 'richtext', 'url', 'image', 'list', 'number', 'boolean')),
  value jsonb,
  default_value jsonb,
  position integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index if not exists content_blocks_page_idx on wildhands.content_blocks (page, section, position);

drop trigger if exists content_blocks_set_updated_at on wildhands.content_blocks;
create trigger content_blocks_set_updated_at
  before update on wildhands.content_blocks
  for each row execute function wildhands.set_updated_at();

-- Design tokens: the colours, fonts and radii from global.css, made editable.
-- Same fallback contract as content_blocks — a null `value` means "use what is
-- in the stylesheet".
create table if not exists wildhands.design_tokens (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (char_length(key) between 2 and 120),
  "group" text not null default 'colour' check (char_length("group") <= 60),
  label text not null default '' check (char_length(label) <= 200),
  help text not null default '' check (char_length(help) <= 500),
  type text not null default 'colour' check (type in ('colour', 'font', 'size', 'weight', 'raw')),
  value text,
  default_value text not null default '',
  position integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index if not exists design_tokens_group_idx on wildhands.design_tokens ("group", position);

drop trigger if exists design_tokens_set_updated_at on wildhands.design_tokens;
create trigger design_tokens_set_updated_at
  before update on wildhands.design_tokens
  for each row execute function wildhands.set_updated_at();

-- Publish log. Every rebuild the admin triggers, and how it went.
create table if not exists wildhands.publishes (
  id uuid primary key default gen_random_uuid(),
  status wildhands.publish_status not null default 'queued',
  note text not null default '' check (char_length(note) <= 500),
  error text check (char_length(error) <= 2000),
  changed_keys integer not null default 0,
  triggered_by uuid references auth.users (id) on delete set null,
  triggered_by_email text check (char_length(triggered_by_email) <= 254),
  created_at timestamptz not null default now()
);

create index if not exists publishes_created_idx on wildhands.publishes (created_at desc);

-- ===========================================================================
-- FIRST-PARTY ANALYTICS
--
-- Vercel Web Analytics is the primary source and owns the headline numbers.
-- This table exists so the admin dashboard is never empty: it records the same
-- page views ourselves, cookie-free, with no identifier that survives the day.
-- `visitor_hash` is a digest of (date + ip + user agent + secret), so it can
-- count returning visits within one day and cannot be linked across days or
-- back to a person.
-- ===========================================================================

create table if not exists wildhands.page_views (
  id bigserial primary key,
  path text not null check (char_length(path) <= 512),
  referrer_host text check (char_length(referrer_host) <= 253),
  utm_source text check (char_length(utm_source) <= 120),
  utm_medium text check (char_length(utm_medium) <= 120),
  utm_campaign text check (char_length(utm_campaign) <= 120),
  country text check (char_length(country) <= 2),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  visitor_hash text not null check (char_length(visitor_hash) <= 64),
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on wildhands.page_views (created_at desc);
create index if not exists page_views_path_idx on wildhands.page_views (path, created_at desc);
create index if not exists page_views_visitor_idx on wildhands.page_views (visitor_hash, created_at desc);

-- ===========================================================================
-- ROW-LEVEL SECURITY
--
-- Enabled everywhere, with no policies. See the note at the top of this file:
-- the service role bypasses RLS and is the only thing that ever connects.
-- ===========================================================================

alter table wildhands.quotes             enable row level security;
alter table wildhands.quote_line_items   enable row level security;
alter table wildhands.quote_phases       enable row level security;
alter table wildhands.quote_references   enable row level security;
alter table wildhands.quote_images       enable row level security;
alter table wildhands.quote_events       enable row level security;
alter table wildhands.quote_templates    enable row level security;
alter table wildhands.content_blocks     enable row level security;
alter table wildhands.design_tokens      enable row level security;
alter table wildhands.publishes          enable row level security;
alter table wildhands.page_views         enable row level security;

-- ---------------------------------------------------------------------------
-- Grants
--
-- The API roles get USAGE on the schema so PostgREST can resolve it at all,
-- and nothing else. With RLS on and no policies, `anon` and `authenticated`
-- can name a table and read zero rows from it — which is the intent.
--
-- `service_role` needs real privileges because it is the only thing that
-- actually connects.
-- ---------------------------------------------------------------------------

grant usage on schema wildhands to anon, authenticated, service_role;

grant all on all tables in schema wildhands to service_role;
grant all on all sequences in schema wildhands to service_role;
grant all on all functions in schema wildhands to service_role;

-- Anything added to this schema later inherits the same posture.
alter default privileges in schema wildhands
  grant all on tables to service_role;
alter default privileges in schema wildhands
  grant all on sequences to service_role;

-- ============================================================================
-- ONE MANUAL STEP REMAINS
--
-- PostgREST only serves schemas it has been told about. In the Supabase
-- dashboard:
--
--   Settings → API → Exposed schemas → add `wildhands` → Save
--
-- Without it every admin query returns PGRST106 ("schema must be one of the
-- following"), which reads like a permissions bug and is not one.
-- ============================================================================
