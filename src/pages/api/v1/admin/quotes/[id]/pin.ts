/**
 * Method:   GET (reveal the current code) | POST (issue a new one)
 * Path:     /api/v1/admin/quotes/:id/pin
 * Auth:     admin session cookie
 * Response: 200 { pin } | 200 { pin: null } when it cannot be recovered
 *
 * Issuing a new PIN invalidates the old one immediately. If the client already
 * has the previous code, they lose access until they are sent the new one, so
 * the UI must say that before the operator clicks.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { regeneratePin, revealPin } from '@/lib/admin/quotes'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies, params }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)

    const id = params['id']
    if (!id) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')

    return new Response(JSON.stringify({ pin: await regeneratePin(id) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}

/**
 * Reveals the current code.
 *
 * A separate request rather than a field on the quote, so the code is fetched
 * only when someone actually asks to see it — it does not sit in the editor's
 * memory, or in a network response, every time a quote is opened.
 *
 * `pin: null` means the quote predates recoverable codes, or the pepper has
 * been rotated. Both have the same remedy, and the UI offers it.
 */
export const GET: APIRoute = async ({ cookies, params }) => {
  try {
    await requireSession(cookies)

    const id = params['id']
    if (!id) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')

    return new Response(JSON.stringify({ pin: await revealPin(id) }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Never let a client access code sit in a shared or disk cache.
        'Cache-Control': 'no-store, private',
      },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
