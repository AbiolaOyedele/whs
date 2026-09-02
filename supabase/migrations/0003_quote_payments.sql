-- ============================================================================
-- Paystack payments against a quote.
--
-- Scope, stated plainly: this records a client paying the deposit (or the full
-- amount) for a quote they have accepted. It is not an invoicing system, not a
-- subscription, and not a ledger.
--
-- Money is stored the same way it is everywhere else in this schema: integer
-- minor units. Paystack also works in minor units (kobo, cents), so no
-- conversion happens anywhere and no float touches a price.
--
-- `reference` is ours and is what we send to Paystack; their identifier comes
-- back as `paystack_reference`. Keeping both means a payment can be traced from
-- either side, which is the first thing anyone wants during a dispute.
-- ============================================================================

do $$ begin
  create type wildhands.payment_status as enum ('pending', 'paid', 'failed', 'abandoned', 'refunded');
exception when duplicate_object then null; end $$;

create table if not exists wildhands.quote_payments (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references wildhands.quotes (id) on delete cascade,

  -- Our reference, generated before redirecting the client. Unique, because it
  -- is the idempotency key: a webhook that arrives twice must not pay twice.
  reference text not null unique check (char_length(reference) between 8 and 100),
  paystack_reference text check (char_length(paystack_reference) <= 100),

  status wildhands.payment_status not null default 'pending',

  -- What was asked for, in minor units, and the currency Paystack was told.
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),

  /* Which part of the quote this covers, so a deposit and a balance payment
     against the same quote stay distinguishable without inferring it from
     amounts that may have changed since. */
  kind text not null default 'deposit' check (kind in ('deposit', 'balance', 'full')),

  -- Set from the verified webhook, never from the browser redirect.
  paid_at timestamptz,
  channel text check (char_length(channel) <= 40),
  fees_minor bigint,

  -- The provider's own payload, kept verbatim for reconciliation. Never
  -- rendered to anyone: it can contain the payer's details.
  raw jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quote_payments_quote_idx on wildhands.quote_payments (quote_id, created_at desc);
create index if not exists quote_payments_status_idx on wildhands.quote_payments (status, created_at desc);

drop trigger if exists quote_payments_set_updated_at on wildhands.quote_payments;
create trigger quote_payments_set_updated_at
  before update on wildhands.quote_payments
  for each row execute function wildhands.set_updated_at();

alter table wildhands.quote_payments enable row level security;

grant all on wildhands.quote_payments to service_role;
