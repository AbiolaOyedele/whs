-- ============================================================================
-- WildHands: templates. Saved items, saved packages, and whole-quote templates.
--
-- The studio sells the same engagements over and over, and retyping them on
-- every quote and invoice is the busywork this removes. Three shapes:
--
--   1. saved_items      one line: a title, what it includes, a default quantity
--                       and a unit price. Drops into any quote or invoice.
--   2. saved_packages   a named bundle of lines, priced line by line or at one
--                       fixed price. Drops into a quote as lines or as a
--                       pick-one package, and into an invoice as lines.
--   3. quote_templates  a whole quote minus the client. The table has existed
--                       since 0001 without anything using it; this gives it the
--                       currency its prices need and puts it to work. `payload`
--                       holds the body (see QuoteTemplateBody).
--
-- Everything is COPIED on use, never linked, so editing a template cannot
-- rewrite a quote or invoice a client already has.
--
-- Same posture as every other table here: RLS on, no policies, service role
-- only. See 0001 for why.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- 1. Saved items. -------------------------------------------------------------

create table if not exists wildhands.saved_items (
  id uuid primary key default gen_random_uuid(),

  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 2000),
  quantity numeric(10, 2) not null default 1 check (quantity >= 0 and quantity <= 10000),
  unit_price_minor bigint not null default 0
    check (unit_price_minor >= 0 and unit_price_minor <= 100000000000),
  currency text not null check (currency ~ '^[A-Z]{3}$'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_items_title_idx on wildhands.saved_items (title);

drop trigger if exists saved_items_set_updated_at on wildhands.saved_items;
create trigger saved_items_set_updated_at
  before update on wildhands.saved_items
  for each row execute function wildhands.set_updated_at();

-- 2. Saved packages. ----------------------------------------------------------

create table if not exists wildhands.saved_packages (
  id uuid primary key default gen_random_uuid(),

  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 600),
  currency text not null check (currency ~ '^[A-Z]{3}$'),

  /* Same meaning as quote_options.pricing. */
  pricing text not null default 'itemised' check (pricing in ('itemised', 'fixed')),
  fixed_price_minor bigint not null default 0
    check (fixed_price_minor >= 0 and fixed_price_minor <= 100000000000),

  /* [{ title, description, quantity, unitPriceMinor }], 1 to 30 of them. */
  lines jsonb not null default '[]'::jsonb check (jsonb_typeof(lines) = 'array'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_packages_name_idx on wildhands.saved_packages (name);

drop trigger if exists saved_packages_set_updated_at on wildhands.saved_packages;
create trigger saved_packages_set_updated_at
  before update on wildhands.saved_packages
  for each row execute function wildhands.set_updated_at();

-- 3. Quote templates: prices need a currency. ---------------------------------

/* Nothing has ever written to this table, so the default only exists to let
   the column be added NOT NULL. Every write from here on sets it. */
alter table wildhands.quote_templates
  add column if not exists currency text not null default 'GBP'
    check (currency ~ '^[A-Z]{3}$');

alter table wildhands.quote_templates
  drop constraint if exists quote_templates_description_check;
alter table wildhands.quote_templates
  add constraint quote_templates_description_check check (char_length(description) <= 600);

alter table wildhands.quote_templates
  drop constraint if exists quote_templates_payload_object_check;
alter table wildhands.quote_templates
  add constraint quote_templates_payload_object_check check (jsonb_typeof(payload) = 'object');

create index if not exists quote_templates_name_idx on wildhands.quote_templates (name);

-- Posture. ---------------------------------------------------------------------

alter table wildhands.saved_items enable row level security;
alter table wildhands.saved_packages enable row level security;

grant all on wildhands.saved_items, wildhands.saved_packages to service_role;
