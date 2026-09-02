/**
 * Method:   GET
 * Path:     /api/v1/admin/fx?from=GBP&to=NGN
 * Auth:     admin session cookie
 * Response: 200 { from, to, rate, asOf }
 *
 * Today's rate for one pair. The editor uses it to convert a quote's amounts
 * when the currency changes; the converted figures are then stored as ordinary
 * numbers, so a quote never re-prices itself after it has been sent.
 */
import type { APIRoute } from 'astro'
import { AppError, toErrorResponse } from '@/lib/errors'
import { requireSession } from '@/lib/admin/auth'
import { fetchRate } from '@/lib/admin/fx'
import { CURRENCIES } from '@/types/quote'

export const prerender = false

const known = new Set<string>(CURRENCIES.map((entry) => entry.code))

export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    await requireSession(cookies)

    const from = (url.searchParams.get('from') ?? '').toUpperCase()
    const to = (url.searchParams.get('to') ?? '').toUpperCase()

    // Only currencies the quote builder offers, so this cannot be used as an
    // open proxy to an external API.
    if (!known.has(from) || !known.has(to)) {
      throw new AppError(422, 'That currency pair is not available.', 'FX_PAIR_UNKNOWN')
    }

    return new Response(JSON.stringify(await fetchRate(from, to)), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
