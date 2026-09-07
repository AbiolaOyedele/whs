/**
 * Method:   GET
 * Path:     /api/v1/admin/invoices/<id>/pdf
 * Auth:     admin session cookie
 * Response: application/pdf
 *
 * Streams the PDF for a standalone invoice — the same document a client
 * would download, rendered on demand from the snapshot on the row. Used
 * both as an <iframe> src on the admin detail page (for preview) and as
 * the download endpoint behind "Download PDF".
 *
 * The `download` query parameter switches between inline (default, so the
 * iframe renders it) and attachment (for the download button).
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { AppError, toErrorResponse } from '@/lib/errors'
import { getInvoiceById } from '@/lib/admin/repositories/invoices'
import { renderStandaloneInvoicePdf } from '@/lib/admin/standalone-invoice-pdf'

export const prerender = false

export const GET: APIRoute = async ({ request, cookies, params, url }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)

    const id = params.id
    if (!id) throw new AppError(404, 'That invoice no longer exists.', 'INVOICE_NOT_FOUND')

    const invoice = await getInvoiceById(id)
    if (!invoice) throw new AppError(404, 'That invoice no longer exists.', 'INVOICE_NOT_FOUND')

    if (invoice.quoteId) {
      /* Quote-backed invoices already have a public download route on the
         quote. Sending the operator there keeps one document per number. */
      throw new AppError(
        409,
        'This invoice belongs to a quote. Open the quote to download its PDF.',
        'INVOICE_HAS_QUOTE'
      )
    }

    const pdf = await renderStandaloneInvoicePdf(id)
    if (!pdf) {
      throw new AppError(500, 'The invoice PDF could not be built.', 'INVOICE_PDF_FAILED')
    }

    const download = url.searchParams.get('download') === '1'
    const disposition = download ? 'attachment' : 'inline'

    return new Response(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${invoice.number}.pdf"`,
        /* Do not cache — the operator might mark part of it paid and
           expect the "amount due" line on the page to reflect that on
           the next reload. */
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
