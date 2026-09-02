/**
 * Method:   POST
 * Path:     /api/v1/admin/invoices?id=<invoiceId>&action=mark-paid
 * Auth:     admin session cookie
 * Response: 200 { ok, message }
 *
 * Marks an invoice settled outside Paystack — a bank transfer, usually.
 * Recorded as a payment row with channel `manual`, so "is this paid?" still has
 * one answer in one place.
 */
import type { APIRoute } from 'astro'
import { z } from 'zod'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { markInvoicePaid } from '@/lib/admin/repositories/invoices'
import { readBody } from '@/lib/forms'

export const prerender = false

const bodySchema = z.object({ note: z.string().trim().max(500).default('') })

export const POST: APIRoute = async ({ request, cookies, url }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)

    const id = url.searchParams.get('id')
    if (!id) throw new AppError(404, 'That invoice no longer exists.', 'INVOICE_NOT_FOUND')

    const parsed = bodySchema.safeParse(await readBody(request))
    await markInvoicePaid(id, parsed.success ? parsed.data.note : '')

    return toSuccessResponse('Marked as paid.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
