/**
 * Method:   GET (list) | POST (create)
 * Path:     /api/v1/admin/quotes
 * Auth:     admin session cookie
 * Response: 200 { quotes } | 201 { id, slug, pin } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { toErrorResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { createQuote, listQuotes } from '@/lib/admin/quotes'
import { createQuoteSchema } from '@/lib/schemas/quotes'
import { readBody } from '@/lib/forms'
import { QUOTE_STATUSES, type QuoteStatus } from '@/types/quote'

export const prerender = false

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    await requireSession(cookies)

    const statusParam = url.searchParams.get('status')
    const status = QUOTE_STATUSES.includes(statusParam as QuoteStatus)
      ? (statusParam as QuoteStatus)
      : undefined

    return json({
      quotes: await listQuotes({
        status,
        search: url.searchParams.get('q')?.trim() || undefined,
      }),
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    const session = await requireSession(cookies)

    const parsed = createQuoteSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Check the form and try again.'
      return json({ error: { code: 'QUOTE_CREATE_INVALID_INPUT', message: first } }, 422)
    }

    // `pin` is returned in clear here and nowhere else, ever again.
    const created = await createQuote(parsed.data, session.userId)
    return json(created, 201)
  } catch (error) {
    return toErrorResponse(error)
  }
}
