-- ============================================================================
-- Invoices.
--
-- An invoice is a RECORD, not a rendering. The PDF is generated from this row
-- on demand and can be regenerated identically, but the row is what makes the
-- number stable: an invoice whose number changes between two downloads is not
-- an invoice, and it is the thing an accountant will ask about.
--
-- Numbering comes from a Postgres sequence rather than count(*) + 1. Two
-- clients clicking "download invoice" in the same second would both read the
-- same count and both write the same number; a sequence cannot do that, even
-- under concurrency, and never reuses a value after a rollback.
-- ============================================================================

create sequence if not exists wildhands.invoice_number_seq start with 1;

create table if not exists wildhands.invoices (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references wildhands.quotes (id) on delete cascade,

  -- Human-facing, e.g. WHS-2026-0007. Unique and never reissued.
  number text not null unique check (char_length(number) between 3 and 40),

  -- Snapshot of what was invoiced, in minor units. Deliberately copied rather
  -- than read back through the quote: editing a quote after invoicing must not
  -- silently rewrite an invoice that has already been sent.
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  kind text not null default 'deposit' check (kind in ('deposit', 'balance', 'full')),

  /* The document as issued: client name, address block, line items and totals,
     frozen at issue time for the same reason as above. */
  snapshot jsonb not null default '{}'::jsonb,

  issued_at timestamptz not null default now(),
  due_at date,

  created_at timestamptz not null default now()
);

create index if not exists invoices_quote_idx on wildhands.invoices (quote_id, issued_at desc);

alter table wildhands.invoices enable row level security;

grant all on wildhands.invoices to service_role;
grant usage, select on sequence wildhands.invoice_number_seq to service_role;

-- ---------------------------------------------------------------------------
-- Handing the sequence to the application.
--
-- PostgREST cannot call nextval() directly, so it is wrapped. SECURITY DEFINER
-- with a pinned search_path: without the pin, a caller who could set their own
-- search_path could point `invoice_number_seq` at a sequence of their choosing.
-- ---------------------------------------------------------------------------

create or replace function wildhands.next_invoice_number()
returns bigint
language sql
security definer
set search_path = wildhands, pg_temp
as $$
  select nextval('wildhands.invoice_number_seq');
$$;

revoke all on function wildhands.next_invoice_number() from public, anon, authenticated;
grant execute on function wildhands.next_invoice_number() to service_role;
