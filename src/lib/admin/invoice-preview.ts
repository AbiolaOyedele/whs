/**
 * The invoice a quote would produce, without issuing one.
 *
 * The client-facing route issues a real invoice: it takes a number, writes a
 * row, and snapshots the figures so a later edit cannot rewrite a document
 * already sitting in someone's inbox. That is the right behaviour there and the
 * wrong behaviour for a look: checking the layout should not burn an invoice
 * number, and it certainly should not create a bill against a quote nobody has
 * accepted.
 *
 * So this renders the same document from the live quote and touches nothing.
 * No row, no number, no snapshot. Run it twice and the only thing that changes
 * is the date.
 *
 * The two paths share `chargedLines` and `computeTotals`, which is what keeps
 * the preview honest: the figures come from the same arithmetic the real
 * invoice uses, so what the operator checks is what the client would get.
 */
import { SITE } from '@/config/site'
import { publicEnv } from '@/config/env'
import { chargedLines, computeTotals } from '@/lib/admin/money'
import { listPaymentsForQuote } from '@/lib/admin/repositories/payments'
import { isPayableCurrency, isPaystackConfigured } from '@/lib/paystack'
import { renderInvoicePdf } from '@/lib/invoice-pdf'
import type { Quote } from '@/types/quote'

/**
 * Stands in for the invoice number.
 *
 * A preview must not carry a number that looks issued. Someone will eventually
 * download one of these to check a wording change, and if it reads WHS-2026-0007
 * it is one forward from there to a client having a document whose number
 * belongs to nothing. The renderer prints this where the number goes, so a
 * preview announces itself in the one place nobody can miss.
 */
export const PREVIEW_NUMBER = 'PREVIEW'

export async function renderInvoicePreview(quote: Quote): Promise<Uint8Array> {
  const totals = computeTotals({
    lineItems: quote.lineItems,
    options: quote.options,
    discountMinor: quote.discountMinor,
    taxRateBp: quote.taxRateBp,
    depositPercent: quote.depositPercent,
  })

  /* Real payments, not zero. If a deposit has been taken, the operator should
     see the balance the client would actually be billed for. */
  const paidMinor = (await listPaymentsForQuote(quote.id))
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amountMinor, 0)

  const balanceMinor = Math.max(0, totals.totalMinor - paidMinor)
  const origin = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')

  return renderInvoicePdf({
    number: PREVIEW_NUMBER,
    issuedAt: new Date(),
    dueAt: quote.validUntil ? new Date(quote.validUntil) : null,
    clientName: quote.clientName,
    clientCompany: quote.clientCompany,
    clientEmail: quote.clientEmail,
    projectTitle: quote.projectTitle,
    currency: quote.currency,
    lines: chargedLines(quote.lineItems, quote.options),
    subtotalMinor: totals.subtotalMinor,
    discountMinor: totals.discountMinor,
    taxRateBp: quote.taxRateBp,
    taxMinor: totals.taxMinor,
    totalMinor: totals.totalMinor,
    paidMinor,
    amountDueMinor: balanceMinor,
    depositPercent: quote.depositPercent,
    depositMinor: totals.depositMinor,
    paymentTerms: quote.paymentTerms,
    quoteUrl: `${origin}/quote/${quote.slug}`,
    payable: balanceMinor > 0 && isPaystackConfigured() && isPayableCurrency(quote.currency),
    studio: {
      name: SITE.name,
      email: SITE.email,
      site: origin.replace(/^https?:\/\//, ''),
    },
  })
}
