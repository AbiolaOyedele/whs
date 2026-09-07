/**
 * Renders a standalone invoice — one that never had a quote behind it — to
 * a PDF, using the same `renderInvoicePdf` the quote-backed path uses.
 *
 * The snapshot on the invoice row is the source of truth: it was frozen at
 * issue time and includes client name, project title, line items and
 * totals. This module reads that snapshot, joins today's payments to
 * compute what is still owed, and hands the whole thing to the renderer.
 *
 * Split out from `invoice-preview.ts` (which is quote-only) so a caller
 * for a standalone invoice does not have to synthesise a fake `Quote`
 * just to reach the same renderer.
 */
import { SITE } from '@/config/site'
import { publicEnv } from '@/config/env'
import { isPayableCurrency, isPaystackConfigured } from '@/lib/paystack'
import { renderInvoicePdf } from '@/lib/invoice-pdf'
import { getInvoiceLogoUrl } from '@/lib/admin/invoice-branding'
import { getInvoiceById } from '@/lib/admin/repositories/invoices'
import { listPaymentsForInvoice } from '@/lib/admin/repositories/payments'

export async function renderStandaloneInvoicePdf(invoiceId: string): Promise<Uint8Array | null> {
  const invoice = await getInvoiceById(invoiceId)
  if (!invoice || invoice.quoteId) return null

  const paid = (await listPaymentsForInvoice(invoiceId))
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amountMinor, 0)

  const balanceMinor = Math.max(0, invoice.amountMinor - paid)
  const origin = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')
  const frozen = invoice.snapshot

  return renderInvoicePdf({
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
    paidMinor: paid,
    amountDueMinor: balanceMinor,
    /* No quote, no deposit split — a standalone invoice is billed in full. */
    depositPercent: 100,
    depositMinor: invoice.amountMinor,
    paymentTerms: frozen.paymentTerms,
    /* No client-facing page yet for standalone invoices, so this link
       points back to the studio's home. When the public payment page
       ships, swap it for `/invoice/<number>`. */
    quoteUrl: origin,
    payable: balanceMinor > 0 && isPaystackConfigured() && isPayableCurrency(invoice.currency),
    studio: {
      name: SITE.name,
      email: SITE.email,
      site: origin.replace(/^https?:\/\//, ''),
    },
    logoUrl: await getInvoiceLogoUrl(),
  })
}
