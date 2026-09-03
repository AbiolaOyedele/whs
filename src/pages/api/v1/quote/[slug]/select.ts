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
import { computeTotals, formatMoney } from '@/lib/admin/money'
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

    /*
     * Figures come back ALREADY FORMATTED.
     *
     * The page patches the summary in place instead of reloading, and the
     * moment it formats a number itself there are two implementations of
     * currency display — one of which has no access to the symbol table or the
     * grouping rules and will, eventually, render a total the server does not
     * agree with. Formatting once, here, makes that impossible.
     *
     * Only the rows the document actually renders are included, under the same
     * conditions the template uses. A key the page has no element for means the
     * two have diverged, and the page reloads rather than showing a stale row.
     */
    const money = (minor: number): string => formatMoney(minor, updated.currency)

    const display: Record<string, string> = {
      total: money(totals.totalMinor),
      subtotal: money(totals.subtotalMinor),
    }
    if (totals.discountMinor > 0) display['discount'] = `− ${money(totals.discountMinor)}`
    if (updated.taxRateBp > 0) display['tax'] = money(totals.taxMinor)
    if (updated.depositPercent > 0 && updated.depositPercent < 100) {
      display['deposit'] = money(totals.depositMinor)
      display['balance'] = money(totals.balanceMinor)
    }

    return new Response(
      JSON.stringify({
        display,
        // Drives the one class the total's size depends on, so the script does
        // not have to know the threshold.
        totalIsLarge: totals.totalMinor >= 100_000_000,
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
