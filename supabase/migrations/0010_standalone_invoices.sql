-- ============================================================================
-- Standalone invoices.
--
-- Until now an invoice was always for a quote: `invoices.quote_id` was NOT
-- NULL. That fits the case where a quote becomes a bill, but not the case
-- where the studio bills a client for work that never had a quote in this
-- system — retainer top-ups, one-off fixes, work quoted over email.
--
-- Two changes:
--   1. `invoices.quote_id` becomes nullable, and an invoice must instead be
--      tied to a client (`client_id`), a quote, or both. A check enforces
--      "at least one" so an orphan invoice cannot exist.
--   2. `quote_payments.quote_id` becomes nullable and gains a sibling
--      `invoice_id`, so a payment against a standalone invoice records in
--      the same table. One payment ledger is easier to reason about than
--      two, and every existing query keeps working — a payment with an
--      invoice_id and no quote_id simply does not appear in quote-scoped
--      joins, which is exactly what we want.
--
-- The invoice number sequence stays the same: `WHS-<year>-<n>` regardless of
-- whether the invoice came from a quote or was written from scratch.
-- ============================================================================

-- --- invoices --------------------------------------------------------------

alter table wildhands.invoices
  alter column quote_id drop not null;

alter table wildhands.invoices
  add column if not exists client_id uuid references wildhands.clients (id) on delete set null;

-- An invoice must be tied to *something*. Without this constraint a caller
-- could insert an orphan by omitting both ids, and the row would render as
-- "Unknown" everywhere with no way to fix it.
alter table wildhands.invoices
  drop constraint if exists invoices_owner_present;

alter table wildhands.invoices
  add constraint invoices_owner_present
  check (quote_id is not null or client_id is not null);

create index if not exists invoices_client_idx
  on wildhands.invoices (client_id, issued_at desc);

-- --- quote_payments --------------------------------------------------------

alter table wildhands.quote_payments
  alter column quote_id drop not null;

alter table wildhands.quote_payments
  add column if not exists invoice_id uuid references wildhands.invoices (id) on delete cascade;

-- Exactly one of quote_id / invoice_id per payment row. Both would be
-- ambiguous ("which balance does this reduce?"); neither would be an orphan.
alter table wildhands.quote_payments
  drop constraint if exists quote_payments_target_exclusive;

alter table wildhands.quote_payments
  add constraint quote_payments_target_exclusive
  check (
    (quote_id is not null and invoice_id is null)
    or (quote_id is null and invoice_id is not null)
  );

create index if not exists quote_payments_invoice_idx
  on wildhands.quote_payments (invoice_id, paid_at desc);
