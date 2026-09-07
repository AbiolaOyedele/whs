-- ============================================================================
-- Public requests — the studio's inbox.
--
-- ONE table for every message a visitor sends from the public site:
-- quote requests from the RaQ flow, site-check requests from an insights
-- article, whatever comes next. A `kind` column distinguishes them; a
-- `details` jsonb column carries kind-specific fields without needing a
-- schema migration every time a new form ships.
--
-- Separate from `wildhands.contact_enquiries`-shaped tables (we do not
-- have one; contact submissions go straight to email) on purpose: those
-- are one-shot notifications, these are a queue the operator processes
-- and updates state on. Contact form and this table can converge later
-- if the operator wants everything in one place, but not today.
--
-- All reads and writes go through the service client on the server. No
-- RLS granted to `authenticated` or `anon`; RLS is enabled so any policy
-- added later fails closed rather than open.
-- ============================================================================

do $$ begin
  create type wildhands.request_status as enum ('new', 'in_progress', 'quoted', 'closed');
exception when duplicate_object then null; end $$;

create table if not exists wildhands.public_requests (
  id uuid primary key default gen_random_uuid(),

  -- What kind of ask this is. Text rather than enum so a new form can
  -- start filing rows here without a migration; the app-side type union
  -- narrows what the admin UI knows how to render.
  kind text not null check (char_length(kind) between 1 and 40),

  -- The contact block. Email is required — the whole point of the queue
  -- is being able to reply. Name is optional because a site-check
  -- request from a URL + email is a legitimate submission.
  contact_name text check (char_length(contact_name) <= 120),
  contact_email text not null check (char_length(contact_email) between 3 and 254),
  contact_phone text check (char_length(contact_phone) <= 40),
  company text check (char_length(company) <= 200),

  -- The message body — the free-text field common to every request kind.
  -- Longer than a tweet, shorter than an essay.
  message text not null default '' check (char_length(message) <= 4000),

  -- Kind-specific fields. Whatever the form ships that does not deserve
  -- its own column lives here. Kept as jsonb so listing and searching
  -- across kinds still work.
  details jsonb not null default '{}'::jsonb,

  status wildhands.request_status not null default 'new',

  -- Optional wiring, filled in as the operator triages the request.
  client_id uuid references wildhands.clients (id) on delete set null,
  linked_quote_id uuid references wildhands.quotes (id) on delete set null,

  -- For rate-limiting and abuse triage. Hashed IP so nothing plaintext
  -- lives here.
  ip_hash text check (char_length(ip_hash) <= 128),
  user_agent text check (char_length(user_agent) <= 512),

  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_requests_status_idx
  on wildhands.public_requests (status, submitted_at desc);

create index if not exists public_requests_kind_idx
  on wildhands.public_requests (kind, submitted_at desc);

create index if not exists public_requests_client_idx
  on wildhands.public_requests (client_id, submitted_at desc);

create index if not exists public_requests_quote_idx
  on wildhands.public_requests (linked_quote_id);

alter table wildhands.public_requests enable row level security;

grant all on wildhands.public_requests to service_role;
