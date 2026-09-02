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
import { computeTotals, lineAmount } from '@/lib/admin/money'
import { getQuoteBySlug } from '@/lib/admin/repositories/quotes'
import { createInvoice, findInvoice } from '@/lib/admin/repositories/invoices'
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

    if (quote.status === 'draft') {
      throw new AppError(403, 'This quote is not ready yet.', 'QUOTE_NOT_PUBLISHED')
    }

    const totals = computeTotals({
      lineItems: quote.lineItems,
      discountMinor: quote.discountMinor,
      taxRateBp: quote.taxRateBp,
      depositPercent: quote.depositPercent,
    })

    const takingDeposit = quote.depositPercent > 0 && quote.depositPercent < 100
    const kind = takingDeposit ? 'deposit' : 'full'
    const amountMinor = takingDeposit ? totals.depositMinor : totals.totalMinor

    if (amountMinor <= 0) {
      throw new AppError(422, 'There is nothing to invoice on this quote.', 'INVOICE_ZERO_AMOUNT')
    }

    const lines: InvoiceLine[] = quote.lineItems
      .filter((item) => !item.isOptional)
      .map((item) => ({
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        amountMinor: lineAmount(item),
      }))

    // Reuse before issuing: this endpoint is a download button, and clicking it
    // three times must not produce invoices 0007, 0008 and 0009.
    const invoice =
      (await findInvoice(quote.id, kind)) ??
      (await createInvoice({
        quoteId: quote.id,
        amountMinor,
        currency: quote.currency,
        kind,
        dueAt: quote.validUntil,
        snapshot: {
          clientName: quote.clientName,
          clientCompany: quote.clientCompany,
          projectTitle: quote.projectTitle,
          lines,
          totals,
        },
      }))

    const paid = (await listPaymentsForQuote(quote.id)).some((p) => p.status === 'paid')
    const origin = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')

    const pdf = await renderInvoicePdf({
      number: invoice.number,
      issuedAt: new Date(invoice.issuedAt),
      dueAt: invoice.dueAt ? new Date(invoice.dueAt) : null,
      clientName: quote.clientName,
      clientCompany: quote.clientCompany,
      clientEmail: quote.clientEmail,
      projectTitle: quote.projectTitle,
      currency: quote.currency,
      lines,
      subtotalMinor: totals.subtotalMinor,
      discountMinor: totals.discountMinor,
      taxRateBp: quote.taxRateBp,
      taxMinor: totals.taxMinor,
      totalMinor: totals.totalMinor,
      amountDueMinor: invoice.amountMinor,
      kind: invoice.kind,
      paymentTerms: quote.paymentTerms,
      quoteUrl: `${origin}/quote/${quote.slug}`,
      payable: !paid && isPaystackConfigured() && isPayableCurrency(quote.currency),
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
