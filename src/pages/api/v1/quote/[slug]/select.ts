/**
 * Method:   POST
 * Path:     /api/v1/quote/:slug/select
 * Auth:     the quote access cookie minted by the PIN gate
 * Response: 200 { totalMinor, depositMinor, options }
 *
 * The client choosing a package or ticking an add-on.
 *
 * Their pick is final — no approval step — so this endpoint is the moment a
 * quote's price changes, and it is guarded accordingly: the quote must be
 * unlocked, the option must belong to THIS quote, and the recomputed totals
 * come back from the server rather than being trusted from the page.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse } from '@/lib/errors'
import { computeTotals } from '@/lib/admin/money'
import { getQuoteBySlug, setOptionSelection } from '@/lib/admin/repositories/quotes'
import { listPaymentsForQuote } from '@/lib/admin/repositories/payments'
import { selectionState } from '@/lib/admin/quote-selection'
import { hasQuoteAccess } from '@/lib/admin/quote-session'
import { assertSameOrigin } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies, params }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)

    const slug = params['slug']
    if (!slug) throw new AppError(404, 'That quote could not be found.', 'QUOTE_NOT_FOUND')

    // Generous: changing your mind about a package several times is normal
    // behaviour, not abuse. Tight enough that it cannot be used as a write loop.
    enforceRateLimit(`quote-select:${clientIp(request)}`, 40, 60_000)

    if (!(await hasQuoteAccess(slug, cookies))) {
      throw new AppError(401, 'Please enter your access code again.', 'QUOTE_ACCESS_EXPIRED')
    }

    const body = (await request.json().catch(() => null)) as {
      optionId?: unknown
      selected?: unknown
    } | null

    const optionId = typeof body?.optionId === 'string' ? body.optionId : null
    const selected = typeof body?.selected === 'boolean' ? body.selected : null
    if (!optionId || selected === null) {
      throw new AppError(422, 'That selection could not be read.', 'QUOTE_SELECT_INVALID')
    }

    const quote = await getQuoteBySlug(slug)
    if (!quote) throw new AppError(404, 'That quote could not be found.', 'QUOTE_NOT_FOUND')

    const lock = selectionState(quote, await listPaymentsForQuote(quote.id))
    if (lock.locked) {
      throw new AppError(
        409,
        lock.message ?? 'This quote can no longer be changed.',
        'QUOTE_SELECTION_LOCKED'
      )
    }

    // Scoped to this quote's id, so an option id belonging to someone else's
    // quote is a 404 rather than a cross-quote write.
    await setOptionSelection(quote.id, optionId, selected)

    const updated = await getQuoteBySlug(slug)
    if (!updated) throw new AppError(404, 'That quote could not be found.', 'QUOTE_NOT_FOUND')

    const totals = computeTotals({
      lineItems: updated.lineItems,
      options: updated.options,
      discountMinor: updated.discountMinor,
      taxRateBp: updated.taxRateBp,
      depositPercent: updated.depositPercent,
    })

    return new Response(
      JSON.stringify({
        totalMinor: totals.totalMinor,
        depositMinor: totals.depositMinor,
        subtotalMinor: totals.subtotalMinor,
        options: updated.options.map((option) => ({
          id: option.id,
          isSelected: option.isSelected,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    return toErrorResponse(error)
  }
}
