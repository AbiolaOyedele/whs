-- ============================================================================
-- Clients.
--
-- Until now a client existed only as four loose columns on a quote. Two quotes
-- for the same person were two unrelated rows, and there was nowhere to answer
-- "what have we sent this company?" — which is the question you actually have.
--
-- The quote keeps its own client_name / client_company / client_email columns.
-- They are NOT replaced by the foreign key, deliberately: a quote is a document
-- that was sent, and the name on it must stay the name that was on it even if
-- the client record is later edited or deleted. `client_id` links them; the
-- columns record what was said.
-- ============================================================================

create table if not exists wildhands.clients (
  id uuid primary key default gen_random_uuid(),

  name text not null check (char_length(name) between 1 and 120),
  company text check (char_length(company) <= 160),

  /* Lowercased on write so "Ada@x.com" and "ada@x.com" are one client.
     Unique where present: it is the only reliable way to recognise someone.
     Null is allowed and does not collide, because plenty of clients arrive
     without an address. */
  email text check (email is null or char_length(email) <= 254),

  phone text check (char_length(phone) <= 40),
  role text check (char_length(role) <= 120),
  website text check (website is null or website ~* '^https?://'),
  notes text not null default '' check (char_length(notes) <= 4000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create unique index if not exists clients_email_key
  on wildhands.clients (email) where email is not null;

create index if not exists clients_name_idx on wildhands.clients (name);

drop trigger if exists clients_set_updated_at on wildhands.clients;
create trigger clients_set_updated_at
  before update on wildhands.clients
  for each row execute function wildhands.set_updated_at();

-- Link, do not replace. See the note at the top of this file.
alter table wildhands.quotes
  add column if not exists client_id uuid references wildhands.clients (id) on delete set null;

create index if not exists quotes_client_idx on wildhands.quotes (client_id);

alter table wildhands.clients enable row level security;
grant all on wildhands.clients to service_role;

-- ---------------------------------------------------------------------------
-- Backfill: every quote already written becomes a client.
--
-- Grouped by lowercased email where there is one, and by company-or-name where
-- there is not, so the same person across two quotes lands as one record.
-- ---------------------------------------------------------------------------

insert into wildhands.clients (name, company, email)
select distinct on (coalesce(lower(client_email), lower(coalesce(client_company, client_name))))
  client_name,
  client_company,
  lower(client_email)
from wildhands.quotes
where client_name is not null
order by coalesce(lower(client_email), lower(coalesce(client_company, client_name))), created_at
on conflict (email) where email is not null do nothing;

update wildhands.quotes q
set client_id = c.id
from wildhands.clients c
where q.client_id is null
  and (
    (q.client_email is not null and lower(q.client_email) = c.email)
    or (q.client_email is null and coalesce(q.client_company, q.client_name) = coalesce(c.company, c.name))
  );
