-- ============================================================================
-- One price for a whole package.
--
-- 0008 put the money entirely in `quote_line_items` and gave options no price
-- of their own, on the grounds that two places holding the same figure is two
-- places to disagree. That reasoning still holds, and this does not break it.
-- What changes is WHICH place holds the figure, per option:
--
--   'itemised' — the price is the sum of the option's line items. Unchanged,
--                and the default, so every existing quote behaves exactly as
--                it did before this migration. No backfill.
--   'fixed'    — the price is `fixed_price_minor`, and the option's line items
--                are inclusions: a list of what the client gets, carrying no
--                money at all.
--
-- The invariant is one source of truth PER OPTION, not one source of truth for
-- the table. An option in 'fixed' mode ignores its items' unit prices entirely
-- rather than reconciling against them, so there is still nothing to disagree.
-- The stored unit prices are left alone so switching back to 'itemised'
-- restores the breakdown instead of zeroing it.
--
-- Text with a check rather than a new enum: two states that may grow a third,
-- and altering a Postgres enum is a migration where a check constraint is one
-- line.
-- ============================================================================

alter table wildhands.quote_options
  add column if not exists pricing_mode text not null default 'itemised'
    check (pricing_mode in ('itemised', 'fixed'));

/* Minor units, like every other amount in this schema. Non-negative: a package
   priced below zero is a refund, which is not what this column is for. */
alter table wildhands.quote_options
  add column if not exists fixed_price_minor bigint not null default 0
    check (fixed_price_minor >= 0);

comment on column wildhands.quote_options.pricing_mode is
  'itemised: price is the sum of this option''s line items. fixed: price is fixed_price_minor and the line items are inclusions with no money on them.';

comment on column wildhands.quote_options.fixed_price_minor is
  'Minor units. Read only when pricing_mode = ''fixed''.';
