/**
 * Standard terms for every quote.
 *
 * Fixed, not written per quote and not written by a model. Terms are the part
 * of a quote a client may hold you to months later, and they should say the
 * same thing every time so you know what you have agreed to without re-reading
 * it. The AI drafter no longer writes this section at all.
 *
 * ⚠️ NOT LEGAL ADVICE. These are plain-English scope and process terms: what is
 * included, what counts as a revision versus new work, and what happens when
 * something changes. They deliberately contain no liability cap, no warranty,
 * no IP assignment and no governing-law clause, because those need a solicitor
 * rather than a template. Have them reviewed before you rely on them for
 * anything substantial.
 *
 * Editable per quote in the admin: this is the default that fills the field,
 * not a value the client-facing page reads directly.
 */

export const STANDARD_TERMS = `What is included

Everything listed in the breakdown above, built to the scope agreed at the start. Each phase includes two rounds of revisions, and 30 days of support after handover for anything that is not working as described.

Revisions

A revision is a change to something we have already built, within the agreed scope: copy, layout, spacing, colour, wording, or fixing something that does not behave as specified. Revisions are included, two rounds per phase. Rounds are consolidated feedback, not individual requests, so gather your comments and send them together.

Work beyond the agreed scope

Three things are not revisions, and each is quoted separately before any work starts:

A rebuild is replacing something already approved and built with a different approach. If a page or a screen is signed off and then needs to be built again a different way, that is new work.

A redesign is changing the visual direction after it has been approved. Exploring alternatives before sign-off is part of the design phase; changing direction afterwards is not.

A new feature is anything not in the breakdown above. If it is not listed, it has not been priced.

We will always tell you before work becomes chargeable, and you will have a written price before we start. Nothing gets built that you have not agreed.

What we need from you

Timely feedback, and access to whatever the work depends on: accounts, test environments, content, and the people who can approve things. We work to the timeline above on the basis of feedback within five working days at each sign-off point. If that slips, the timeline moves with it.

Third-party costs

Hosting, domains, API fees, licences and identity checks are billed to you directly at cost, or passed on without markup. We will tell you what these are before you commit to anything.

Payment

As set out above. Work begins once the deposit clears. Invoices are payable within the terms stated on the invoice.

If something changes

Either side can pause or stop the work. You pay for what has been done up to that point, and you keep it: designs, code and content produced so far are yours.`

/** Default payment terms. Overridable per quote. */
export const STANDARD_PAYMENT_TERMS = `50% to start, 50% on handover. Invoices are payable within 14 days. Work begins once the deposit clears.`
