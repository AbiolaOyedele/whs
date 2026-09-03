-- ============================================================================
-- Client-selectable options.
--
-- Two shapes, one table:
--
--   'package' — mutually exclusive. Essential / Standard / Premium. The client
--               picks exactly one and its line items enter the total.
--   'addon'   — independent. Any number can be ticked, each adding its items.
--
-- A line item with a null `option_id` is BASE SCOPE: always included, whatever
-- the client picks. That default is what keeps every existing quote correct
-- after this migration — no backfill, no behaviour change.
--
-- Money still lives entirely in `quote_line_items`. An option carries a name
-- and a sentence of explanation, never a price of its own: two places holding
-- the same figure is two places to disagree, and the one the client reads would
-- not be the one the invoice used.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'quote_option_kind') then
    create type wildhands.quote_option_kind as enum ('package', 'addon');
  end if;
end
$$;

create table if not exists wildhands.quote_options (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references wildhands.quotes (id) on delete cascade,
  kind wildhands.quote_option_kind not null default 'package',
  position integer not null default 0,

  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 600),

  /* What the client has chosen. The default matters: an option nobody has
     picked yet must not be silently included in a price we are quoting. */
  is_selected boolean not null default false,

  /* Pre-ticked when the quote is sent — the package we are recommending. It is
     a starting position, not a lock; the client can move off it. */
  is_default boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists quote_options_quote_idx
  on wildhands.quote_options (quote_id, kind, position);

/* At most ONE selected package per quote, enforced by the database rather than
   by the endpoint that writes it. Two selected packages is not a cosmetic bug:
   both sets of line items enter the total and the client is quoted a number
   that was never on offer. Add-ons are deliberately excluded from this index —
   ticking several is the entire point of an add-on. */
create unique index if not exists quote_options_single_package_idx
  on wildhands.quote_options (quote_id)
  where kind = 'package' and is_selected;

-- Which option a line item belongs to. Null = base scope.
alter table wildhands.quote_line_items
  add column if not exists option_id uuid
    references wildhands.quote_options (id) on delete cascade;

create index if not exists quote_line_items_option_idx
  on wildhands.quote_line_items (option_id);

alter table wildhands.quote_options enable row level security;
grant all on wildhands.quote_options to service_role;
