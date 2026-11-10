-- ============================================================================
-- Website deposits — Paystack payments from the /72-hour-website campaign page.
--
-- Deliberately its own table rather than a row in `quote_payments`: that table
-- requires exactly one of `quote_id` / `invoice_id` (see 0010), and a campaign
-- deposit has neither — there is no quote and no client record at the point
-- someone pays, only an email address and a tier they picked off a pricing
-- card. Manufacturing a client and a standalone invoice for every deposit just
-- to satisfy that constraint would put marketing leads in the CRM before the
-- studio has even looked at them.
--
-- Reuses `wildhands.payment_status` (0003) and `wildhands.set_updated_at()`
-- (0001) rather than redefining either.
-- ============================================================================

create table if not exists wildhands.website_deposits (
  id uuid primary key default gen_random_uuid(),

  -- Our reference, generated before redirecting to Paystack. Unique: it is
  -- the idempotency key that stops a repeated verify from settling twice.
  reference text not null unique check (char_length(reference) between 8 and 100),
  paystack_reference text check (char_length(paystack_reference) <= 100),

  -- Which pricing card this came from. Text, not an enum tied to campaign
  -- copy that will change: a tier can be renamed without a migration.
  tier text not null check (char_length(tier) between 1 and 40),

  -- Required to initialise a Paystack transaction, and it is how the studio
  -- follows up — there is no client record behind this payment yet.
  email text not null check (char_length(email) between 3 and 254),
  business_name text check (char_length(business_name) <= 200),

  status wildhands.payment_status not null default 'pending',

  -- What was asked for, in minor units (kobo), and the currency Paystack was
  -- told. Computed server-side from the tier — never taken from the client.
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),

  -- Set from the verified transaction, never from the browser redirect.
  paid_at timestamptz,
  channel text check (char_length(channel) <= 40),
  fees_minor bigint,

  -- The provider's own payload, kept verbatim for reconciliation. Never
  -- rendered to anyone.
  raw jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_deposits_status_idx
  on wildhands.website_deposits (status, created_at desc);

drop trigger if exists website_deposits_set_updated_at on wildhands.website_deposits;
create trigger website_deposits_set_updated_at
  before update on wildhands.website_deposits
  for each row execute function wildhands.set_updated_at();

alter table wildhands.website_deposits enable row level security;

grant all on wildhands.website_deposits to service_role;
