# Quote → Invoice → Payment system

A build specification, extracted from a system running in production. Hand this to
an AI dev as the brief. It describes **what to build and why**, not how it should
look — use the project's own design system for that.

Four surfaces:

- **Quotes** (admin) — build a priced proposal, send a client a link
- **Clients** (admin) — a record per client, maintained automatically
- **Invoices** (admin) — the ledger: billed, received, outstanding
- **`/quote/<slug>`** (public) — the client-facing document, behind a code

---

## 1. Architecture

Keep the public site static. The admin writes to the database; a Publish button
triggers a rebuild. Visitors never wait on a query, and a database outage cannot
take the public site down — pages fall back to copy committed in the repo.

Content that the admin can edit resolves as: **database override → committed
default → empty**. Clearing a field restores the original rather than emptying
the page.

If the database is shared with other applications, put every table in its own
schema, not `public`. Tables, enum types, functions and triggers are all
schema-scoped in Postgres; a bare `create type quote_status` in a shared
`public` will collide with someone else's deploy. Pin the client to the schema
once at construction, not at every call site.

---

## 2. Data model

| Table              | Holds                                                                                                         | Note                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `clients`          | name, company, email, phone, notes                                                                            | email unique where present                           |
| `quotes`           | slug, pin_hash, pin_encrypted, status, client fields, currency, discount, tax_rate_bp, deposit_percent, terms | keeps its own copy of client name/company/email      |
| `quote_line_items` | title, description, quantity, unit_price_minor, is_optional                                                   | optional items priced and shown, excluded from total |
| `quote_phases`     | title, description, duration_label, deliverables[]                                                            | relative durations only, never dates                 |
| `quote_references` | label, url, description                                                                                       | url scheme allowlisted                               |
| `quote_images`     | url, public_id, caption, width, height                                                                        | store dimensions, the gallery needs the ratio        |
| `quote_events`     | type, ip_hash, user_agent                                                                                     | hashed IP, never an address                          |
| `quote_payments`   | reference, status, amount_minor, currency, kind, channel                                                      | the single source of "has money arrived"             |
| `invoices`         | number, amount_minor, currency, snapshot (jsonb), issued_at                                                   | number from a sequence                               |

**Two decisions worth keeping:**

**Duplicate the client onto the quote.** A quote stores `client_name`,
`client_company` and `client_email` _as well as_ a foreign key to `clients`.
Not redundancy: a quote is a document that was sent, and the name on it must
stay the name that was on it even if the client record is later edited or
deleted. The key links them; the columns record what was said.

**Row-level security on every table, with no permissive policies.** Nothing
should talk to the database from a browser. All access goes through your own
API routes using the service role, after those routes have checked the session.
RLS is then a backstop: a leaked anon key grants exactly nothing.

---

## 3. Money rules

Get these right first. Everything else depends on them, and the failures reach
a client as a number.

- **Integer minor units everywhere** — pence, kobo, cents — in the database, the
  API and the UI state. Nothing multiplies or sums a float. `0.1 + 0.2` is why:
  a quote totalling £1,249.99 in the admin and £1,250.00 on the client's copy is
  a commercial problem, not a rounding curiosity.
- **One rounding site.** Only the line-amount function rounds, half away from
  zero — the behaviour a person doing it on paper expects. Quantity is the one
  legitimately fractional input (2.5 days).
- **Fixed order of operations.** Discount comes off before tax; tax applies to
  the discounted subtotal; the deposit is a percentage of the final total.
  Clamp the discount to the subtotal or the total goes negative.
- **Never sum across currencies.** Ledger totals are per currency. Adding £ to ₦
  produces a number that is wrong in both.
- **Switching currency converts the amounts**, not just the label. Fetch a rate,
  apply it once, store ordinary figures. **Never re-price from a live rate
  afterwards** — a client who was sent a total must see that total tomorrow.
  Offer "convert at today's rate" and "keep the numbers" as an explicit choice.
- **Format with `Intl` for grouping and decimals; supply the currency symbol
  yourself.** `Intl`'s default writes `NGN 41,931,125.12`, long enough to wrap a
  summary card. `narrowSymbol` fixes that but renders CAD and AUD as a bare `$`,
  indistinguishable from US dollars on a document quoting a price.

---

## 4. Client access

A readable link plus a six-digit code. The link is not the secret.

- Serve at `/quote/<slug>`, never the site root — a root-level slug can collide
  with a real page and is trivially guessable.
- **PIN digest is SHA-256 over (pepper, slug, pin)**, compared in constant time.
  The pepper is an environment secret, so a database dump alone cannot be
  brute-forced offline. The slug is in the digest so an identical code on two
  quotes produces two different hashes, and one client's code can never open
  another's quote.
- **Also store the PIN encrypted** (AES-GCM, key derived from the pepper) so the
  operator can look up a code they already sent. Hashing alone protects little
  here — the document it guards sits three columns away in the same table —
  while costing you the ability to answer "what code did we send?" without
  reissuing and locking the client out.
- **Rate limit per address AND per quote.** Six digits is a million
  combinations; that is only adequate because guessing is expensive. The two
  limits are a pair. The per-quote limit can lock a legitimate client out while
  someone attacks their quote — that is the right trade for a document carrying
  commercial terms.
- **Verify against a query that selects the hash alone.** Fetching the quote and
  checking the PIN afterwards puts pricing in a response that should have been a 401.
- **Session cookie** after a correct PIN: signed (HMAC over slug + expiry),
  httpOnly, slug-bound, expiring. **Scope it to `/`, not `/quote`** — the
  endpoints that serve invoices and payments live under `/api/...`, which is not
  beneath `/quote`.
- Return the **same message** for a wrong code and a missing quote, or the
  endpoint can be used to enumerate which clients you have quoted.

---

## 5. Quote lifecycle

| Status     | Means            | Gate                             |
| ---------- | ---------------- | -------------------------------- |
| `draft`    | being written    | code refused even if correct     |
| `sent`     | link issued      | opens on a correct code          |
| `viewed`   | client opened it | set automatically on first view  |
| `accepted` | client said yes  | unlocks invoice download         |
| `declined` | client said no   | final until reopened             |
| `expired`  | past valid-until | shows a note; scope still stands |

Record views as events, and **collapse consecutive identical ones** in the UI
with a count and a time range. A quote sent to a client's team gets opened by
everyone on it; twenty "Opened the quote" rows bury the one that says
"Accepted". Only collapse _consecutive_ runs — views either side of an
acceptance are not the same thing.

**Do not record a view when the operator previews their own quote.** That
inflates the one number telling you whether the client actually opened it.

Other content rules for the client document:

- Timeline phases use relative durations ("3 to 4 weeks"), never calendar dates.
  Dates go stale the moment a quote sits in an inbox.
- Reference URLs must be allowlisted to `http`/`https`, or a stored
  `javascript:` URL is script execution on a page you sent a paying client.
- Terms are **fixed and identical on every quote**. Not generated, not per-quote.
- The document is server-rendered with no framework JS. Clients open it on
  phones on mobile data.

---

## 6. Invoices

**One invoice per quote, for the total, with payments reducing a balance.** Not
one document per instalment: a client who pays a 40% deposit has not settled a
separate deposit invoice, they have paid part of one bill and owe the rest. The
PDF shows Total → Payments received → **Balance due**.

- **Numbers come from a database sequence**, never `count(*) + 1`. Two
  simultaneous downloads would both read the same count and write the same
  number. A sequence cannot, and never reuses a value after a rollback.
- **Store a full snapshot** — currency, client, lines, subtotal, tax, total —
  and **render entirely from it**. Mixing snapshot fields with live quote fields
  is what produces mixed-currency documents.
- **Unpaid invoices are rewritten in place**, keeping their number, so editing a
  quote and re-downloading shows the edit. Issuing a fresh number on every
  wording change burns the sequence.
- **Paid invoices are never rewritten.** That is a record of money that moved; a
  later change issues a new number instead.
- **Only available once the quote is accepted.** Enforce at the endpoint, not by
  hiding the button.
- Serve with `Cache-Control: no-store, private`.

### Generating the PDF

Use a PDF library, not a headless browser — shipping Chromium into a serverless
function for an occasional download buys slow cold starts, a large bundle and a
new class of failure.

Two traps:

- Brand fonts are usually `woff2`, which no PDF can embed. Decompress to TTF at
  request time.
- Subset fonts often lack currency glyphs. `₦` (U+20A6) renders as an empty box,
  and a PDF cannot fall back to another font the way a browser can. **Use ISO
  currency codes in the PDF** and symbols on the web.

Make the payment link a real PDF link annotation, not styled blue text. Two
things a PDF library will silently let you get wrong: a bare string becomes a
`PDFName` (so the URL is written as `/https://…` and no reader follows it), and
the annotation must be registered as an indirect object or it is dropped. Both
produce a file that opens fine and links nowhere.

**Always include a link back to the quote**, even when card payment is not
possible for that currency. Label it honestly — "Pay this invoice" when payable,
"View your quote online" when not — rather than omitting it, which leaves the
client with no way back at all.

---

## 7. Payments

- **Recompute the amount server-side** from the stored quote. An endpoint that
  trusts the browser for the figure is how a £10,000 deposit gets paid as £1.
- **Instalments:** the first payment is the deposit, and every payment after it
  clears the remaining balance. Keep the pay button available while anything is
  outstanding. Gating it on "does any payment exist" strands a client who paid
  40% with no way to pay the other 60%.
- **Write your payment row before creating the provider transaction.** The
  reverse order lets a client pay against a reference you have no row for, and
  the webhook then has nothing to settle.
- **The webhook is the truth.** A browser returning from checkout proves only
  that a browser returned. Verify the signature against the **raw body** before
  parsing anything — re-serialising a parsed object will not reproduce the bytes
  that were signed — then re-verify the transaction with the provider rather
  than trusting the payload.
- **Idempotency:** guard the settle update on `status = 'pending'`. Providers
  retry webhooks and the browser callback races them. Whichever arrives first
  wins; the rest update zero rows and return quietly.
- **Return 200 for authenticated events you ignore.** Providers retry non-2xx,
  so a 4xx on an event you do not care about becomes a retry loop.
- **Compare the verified amount and currency** against your stored row before
  settling. A mismatch is a problem for a person, not a state change.
- **Allow manual settlement.** Most invoices settle by bank transfer. Record
  those as a payment row with channel `manual`, so "is this paid?" still has one
  answer in one place. Let the operator enter the amount — part payments are
  normal.
- **Check the provider supports the quote's currency before showing a pay
  button.** A button that fails after the click is worse than no button.

### When you cannot have the webhook

A payment provider account usually has **one live webhook URL**. If the account
is shared with another product, that URL belongs to the other product and this
build will never receive a delivery — so a design that treats the webhook as the
only way payments get recorded silently records nothing.

Settle by polling instead, and put it in one function every surface calls:

- The **return-from-checkout page** verifies and settles. This catches almost
  everything.
- **Sweep stale pending rows** wherever payment state is read — the client's
  quote page, the operator's ledger. That catches the client who paid and closed
  the tab.
- **Only ever persist `paid`.** Verifying a reference the client has not
  finished paying returns `abandoned`, and writing that takes the row out of
  `pending` — the one state the settle update is guarded on. They would then pay
  and there would be no way left to record it. A payment that never happened
  stays pending and reads as unpaid, which is true anyway.
- **Skip rows younger than ~2 minutes** (a client mid-checkout) and **older than
  ~7 days** (never coming back), or every page render re-verifies dead
  references.
- **A sweep runs on the way past a page render, so it must never throw.** Catch
  per payment and carry on.
- Keep the webhook route written and correct. Getting your own provider account
  later should be a URL change in their dashboard and nothing else.

---

## 8. Clients

The list maintains itself or it goes stale within a month.

On every quote create and save, reconcile the client behind it: find by email,
or create.

- **Match on email only.** Matching on name merges two different people called
  James at the same company. A duplicate row someone can merge later is a much
  smaller problem than two clients silently becoming one.
- **Fill blanks from the quote, never overwrite.** The client record is the
  curated one; a quote tops it up.
- **Deleting a client does not delete their quotes** — set the key null and let
  each quote keep the name it was sent under.
- Backfill existing quotes into clients in the migration, grouped by lowercased
  email where present and by company-or-name where not.

---

## 9. AI drafting (optional, build last)

Turns a conversational brief into a structured draft. Worth having; needs five
constraints.

- **Never save a draft.** It lands in the editor as unsaved changes, so a person
  is always between a model's guess at a price and a document a client reads.
- **Zero, not a guess.** Instruct it to set a price to `0` and say so when the
  brief gives no rate. An empty field gets noticed; a plausible invented day
  rate that reaches a client does not.
- **Two separate lists.** _Assumptions_ are gaps it filled and wants checked;
  _questions_ are gaps it could not fill at all. Merged into one list, the
  blocking items drown in the advisory ones and a quote goes out with a hole in
  it. Let the operator answer the questions and redraft.
- **It does not write the terms.** Terms should be identical on every quote.
- **Validate twice** — the provider's structured-output mode, then your own
  schema on arrival. Different providers enforce schemas differently; one gate
  both must clear.

Use a cheap, fast model: this is structured extraction and light arithmetic, not
hard reasoning, and it is a cost paid on every draft. Put the model id in an
environment variable — model names move faster than your repo, and providers
retire them (a stale default returns "no longer available to new users", which
looks like a bug in your code).

Retry once on a transient 429/503. Providers have capacity blips and a failed
draft for a temporary one is a bad experience.

---

## 10. Security checklist

- Admin auth: password **plus an email allowlist**. A correct password alone is
  not enough — anyone who ever gets a row in your auth table would otherwise
  become an administrator.
- Session in an httpOnly cookie, never `localStorage`. An XSS bug anywhere then
  cannot walk off with an admin session.
- If auth is shared with other apps (same project), use a plus-addressed email
  so the admin identity is a distinct row with its own password.
- Same-origin check on every mutating route. Accept both the apex and `www` of
  your configured domain — one redirects to the other, so a form can legitimately
  be submitted from either.
- `noindex` on admin and quote routes, **excluded from `sitemap.xml`**, and
  disallowed in `robots.txt`. Sitemap generators read the route manifest, not
  just static output — otherwise every admin route is advertised to crawlers.
- **Read a request body once, up front.** A body is a stream that can only be
  consumed once; two handlers reading it throws.
- **Gate each mutating handler on the field that identifies it**, or one POST
  falls through into another.

---

## 11. Build order

Each step is testable before the next starts.

1. **Schema and migrations** — all tables, RLS on, no permissive policies
2. **Money module** — minor units, totals, formatting, parsing. Unit test this
   first; everything depends on it
3. **Admin auth** — password + allowlist, httpOnly session
4. **Quote CRUD and editor** — tabbed, not one long scroll; live totals visible
   while editing anything
5. **Client document and PIN gate** — server-rendered, no framework JS
6. **Clients panel** — reconcile from quotes, backfill in the migration
7. **Invoices and PDF** — sequence, snapshot, regenerate-while-unpaid
8. **Payments and webhook** — signature verification and idempotency before
   anything else works
9. **AI drafting** — last. It is the least important part and the most fun to
   build, which is a trap

---

## 12. Bugs that shipped — check for these

All six looked like working software.

1. **The half-snapshotted invoice.** Invoice amount frozen at issue, line items
   rendered live from the quote. Converting the quote's currency produced a PDF
   with naira line items beside a deposit still held in pence, printed with a
   naira symbol — the amount due wrong by a factor of about 1,600. Snapshot
   everything or nothing.
2. **The currency that only changed the label.** Switching currency changed the
   symbol and left the numbers alone, so £4,200 became ₦4,200.
3. **The body read twice.** One handler read the form body in two branches; on
   the request where both ran, the second threw "Body has already been read".
   Worse, the unlock POST fell through into the decision handler and could have
   recorded an acceptance the client never made.
4. **The cookie that never arrived.** The client session cookie was scoped to
   `/quote`; the endpoints serving invoices and payments live under `/api/...`.
   Both answered "session expired" to a client who had just unlocked the page.
5. **The rename that broke the code.** The slug is inside the PIN digest, so
   renaming a quote invalidates the client's code. The code claimed to re-hash on
   rename and never did — and because the PIN was hash-only, it could not have.
6. **The admin in the sitemap.** Every admin route advertised to crawlers.
   `noindex` stops indexing; it does not stop a sitemap naming your admin
   surface out loud.

---

## 13. Things clients notice

- On mobile, put the **price after the narrative**, not before it. A client
  should understand what they are buying before they meet the number; a
  seven-figure total as the first thing on screen reads as a demand rather than
  a proposal. On desktop, pin it in a rail beside the narrative.
- Quote images arrive in wildly different shapes (a 2000×760 dashboard beside an
  820×1420 phone mockup). Give every cell a fixed aspect box with
  `object-contain` — cropping to a common ratio fixes the grid and ruins the
  content.
- Long terms belong in a collapsed disclosure. Left expanded, they push the
  decision far enough down that people stop reaching it.
- Every control clears 44×44px. Verify at 375, 768 and 1280 with no horizontal
  scroll at any width.
