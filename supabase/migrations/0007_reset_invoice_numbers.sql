-- ============================================================================
-- Reset invoice numbering to 1.
--
-- The demo quotes have been deleted, taking their invoices with them
-- (`invoices.quote_id` cascades). The sequence, however, does not roll back —
-- it is deliberately immune to that, which is the whole reason numbering uses
-- a sequence instead of count(*) + 1. So the next real invoice would have been
-- WHS-2026-0004 with 0001 through 0003 belonging to nothing.
--
-- Run this ONCE, in the Supabase SQL editor, after the demo data is gone.
--
-- ⚠️ GUARDED ON AN EMPTY TABLE, on purpose. Reissuing a number that is already
-- on a PDF in a client's inbox is not a tidy-up, it is two different documents
-- claiming to be the same invoice — the exact thing an accountant will find.
-- If this raises, the answer is to look at why an invoice still exists, never
-- to delete the guard.
-- ============================================================================

do $$
declare
  existing bigint;
begin
  select count(*) into existing from wildhands.invoices;

  if existing > 0 then
    raise exception
      'Refusing to reset invoice numbering: % invoice(s) still exist. Numbers already issued must never be reused.',
      existing;
  end if;

  -- `false` for is_called means the NEXT nextval() returns 1, not 2.
  perform setval('wildhands.invoice_number_seq', 1, false);

  raise notice 'Invoice numbering reset. The next invoice will be WHS-%-0001.',
    to_char(now() at time zone 'utc', 'YYYY');
end
$$;
