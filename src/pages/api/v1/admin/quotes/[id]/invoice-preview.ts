/**
 * Method:   GET
 * Path:     /api/v1/admin/quotes/:id/invoice-preview
 * Auth:     admin session cookie
 * Response: application/pdf
 *
 * The invoice this quote would produce, rendered from the live quote and
 * issuing nothing. No number is taken, no row is written, no snapshot is
 * frozen. Checking that a document reads well should not create a bill.
 *
 * Unlike the client-facing route this does NOT require the quote to be
 * accepted, which is the entire point: the operator wants to look before it is
 * sent, not after it is agreed.
 *
 * Inline rather than an attachment, so it renders in the editor's own panel
 * instead of landing in a downloads folder every time the tab is opened.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { getQuoteById } from '@/lib/admin/repositories/quotes'
import { renderInvoicePreview } from '@/lib/admin/invoice-preview'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const GET: APIRoute = async ({ request, cookies, params }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)

    /* Embedding three fonts on every render is the most expensive thing in the
       admin, and this one is behind a tab someone may leave open. */
    enforceRateLimit(`admin-invoice-preview:${clientIp(request)}`, 30, 60_000)

    const id = params['id']
    if (!id) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')

    const quote = await getQuoteById(id)
    if (!quote) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')

    const pdf = await renderInvoicePreview(quote)

    return new Response(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="invoice-preview.pdf"',
        // Commercial figures, and a preview that goes stale the moment the
        // quote is edited. Never a shared cache, never a stored copy.
        'Cache-Control': 'no-store, private',
      },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
