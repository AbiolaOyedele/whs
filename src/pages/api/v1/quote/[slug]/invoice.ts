/**
 * Method:   GET
 * Path:     /api/v1/quote/:slug/invoice
 * Auth:     the quote access cookie minted by the PIN gate
 * Response: application/pdf
 *
 * Issues an invoice for the quote (or returns the one already issued) and
 * streams it as a PDF.
 *
 * Issued once, then reused. A client downloading twice gets the same number and
 * the same figures — an invoice whose number changes between downloads is not
 * an invoice. The amounts are snapshotted at issue, so editing the quote
 * afterwards cannot silently rewrite a document already in someone's inbox.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { SITE } from '@/config/site'
import { AppError, toErrorResponse } from '@/lib/errors'
import { computeTotals, isCharged, lineAmount } from '@/lib/admin/money'
import { getQuoteBySlug } from '@/lib/admin/repositories/quotes'
import {
  createInvoice,
  findInvoice,
  isInvoiceSettled,
  refreshInvoice,
} from '@/lib/admin/repositories/invoices'
import { listPaymentsForQuote } from '@/lib/admin/repositories/payments'
import { hasQuoteAccess } from '@/lib/admin/quote-session'
import { isPayableCurrency, isPaystackConfigured } from '@/lib/paystack'
import { renderInvoicePdf, type InvoiceLine } from '@/lib/invoice-pdf'
import { enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const GET: APIRoute = async ({ cookies, params }) => {
  try {
    const slug = params['slug']
    if (!slug) throw new AppError(404, 'That quote could not be found.', 'QUOTE_NOT_FOUND')

    // Rendering a PDF embeds three fonts; it is the most expensive thing a
    // client can trigger on this site, so it is limited more tightly.
    enforceRateLimit(`quote-invoice:${slug}`, 10, 60_000)

    if (!(await hasQuoteAccess(slug, cookies))) {
      throw new AppError(401, 'Please enter your access code again.', 'QUOTE_ACCESS_EXPIRED')
    }

    const quote = await getQuoteBySlug(slug)
    if (!quote) throw new AppError(404, 'That quote could not be found.', 'QUOTE_NOT_FOUND')

    /* An invoice before the client has said yes is a bill for work they have
       not agreed to. The button is hidden until acceptance; this is the check
       that actually enforces it. */
    if (quote.status !== 'accepted') {
      throw new AppError(
        403,
        'An invoice is available once the quote has been accepted.',
        'INVOICE_QUOTE_NOT_ACCEPTED'
      )
    }

    const totals = computeTotals({
      lineItems: quote.lineItems,
      options: quote.options,
      discountMinor: quote.discountMinor,
      taxRateBp: quote.taxRateBp,
      depositPercent: quote.depositPercent,
    })

    /*
     * One invoice, for the quote total, with payments reducing a balance.
     *
     * Not one document per instalment: a client who pays a 40% deposit has not
     * settled a separate deposit invoice, they have paid 40% of one bill and
     * owe the rest. That is what the ledger has to be able to say, and it is
     * what an invoice normally means.
     */
    const kind = 'full' as const
    const amountMinor = totals.totalMinor

    /* The same predicate `computeTotals` used for `amountMinor` above. Filtering
       on `!isOptional` alone would list every package's lines under a total that
       only covers the one the client picked. */
    const lines: InvoiceLine[] = quote.lineItems
      .filter((item) => isCharged(item, quote.options))
      .map((item) => ({
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        amountMinor: lineAmount(item),
      }))

    /*
     * The invoice is regenerated from the quote on every download.
     *
     * An unpaid invoice is a bill that has not been settled, so it is rewritten
     * in place and keeps its number: edit the quote, download, see the edit.
     * The earlier version reused whatever was issued first, which meant a quote
     * converted from GBP to NGN produced a document with naira line items and a
     * deposit still held in pence.
     *
     * A settled invoice is never rewritten — that is a record of money that
     * moved — so a change after payment issues a new number instead.
     */
    const snapshot = {
      currency: quote.currency,
      clientName: quote.clientName,
      clientCompany: quote.clientCompany,
      clientEmail: quote.clientEmail,
      projectTitle: quote.projectTitle,
      paymentTerms: quote.paymentTerms,
      lines,
      subtotalMinor: totals.subtotalMinor,
      discountMinor: totals.discountMinor,
      taxRateBp: quote.taxRateBp,
      taxMinor: totals.taxMinor,
      totalMinor: totals.totalMinor,
    }

    const existing = await findInvoice(quote.id, kind)
    const settled = existing ? await isInvoiceSettled(quote.id, kind) : false

    const invoice =
      existing && !settled
        ? await refreshInvoice(existing.id, {
            amountMinor,
            currency: quote.currency,
            dueAt: quote.validUntil,
            snapshot,
          })
        : existing &&
            settled &&
            existing.amountMinor === amountMinor &&
            existing.currency === quote.currency
          ? existing
          : await createInvoice({
              quoteId: quote.id,
              amountMinor,
              currency: quote.currency,
              kind,
              dueAt: quote.validUntil,
              snapshot,
            })

    const settledPayments = (await listPaymentsForQuote(quote.id)).filter(
      (payment) => payment.status === 'paid'
    )
    const paidMinor = settledPayments.reduce((sum, payment) => sum + payment.amountMinor, 0)
    const balanceMinor = Math.max(0, invoice.amountMinor - paidMinor)
    const origin = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')

    /*
     * Rendered from the SNAPSHOT, not the live quote.
     *
     * This is what makes an invoice a document rather than a view. Mixing the
     * two is exactly how the currency bug happened: some fields moved with the
     * quote and one did not.
     */
    const frozen = invoice.snapshot

    const pdf = await renderInvoicePdf({
      number: invoice.number,
      issuedAt: new Date(invoice.issuedAt),
      dueAt: invoice.dueAt ? new Date(invoice.dueAt) : null,
      clientName: frozen.clientName,
      clientCompany: frozen.clientCompany,
      clientEmail: frozen.clientEmail,
      projectTitle: frozen.projectTitle,
      currency: invoice.currency,
      lines: frozen.lines,
      subtotalMinor: frozen.subtotalMinor,
      discountMinor: frozen.discountMinor,
      taxRateBp: frozen.taxRateBp,
      taxMinor: frozen.taxMinor,
      totalMinor: frozen.totalMinor,
      paidMinor,
      amountDueMinor: balanceMinor,
      depositPercent: quote.depositPercent,
      depositMinor: totals.depositMinor,
      paymentTerms: frozen.paymentTerms,
      quoteUrl: `${origin}/quote/${quote.slug}`,
      payable: balanceMinor > 0 && isPaystackConfigured() && isPayableCurrency(invoice.currency),
      studio: {
        name: SITE.name,
        email: SITE.email,
        site: origin.replace(/^https?:\/\//, ''),
      },
    })

    return new Response(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.number}.pdf"`,
        // An invoice carries commercial terms: never a shared cache.
        'Cache-Control': 'no-store, private',
      },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
