/**
 * Method:   GET (read) | PUT (save) | DELETE
 * Path:     /api/v1/admin/quotes/:id
 * Auth:     admin session cookie
 * Response: 200 { quote } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { deleteQuote, getQuoteById, listQuoteEvents, saveQuote } from '@/lib/admin/quotes'
import { saveQuoteSchema } from '@/lib/schemas/quotes'
import { readBody } from '@/lib/forms'

export const prerender = false

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function quoteId(params: Record<string, string | undefined>): string {
  const id = params['id']
  if (!id) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')
  return id
}

export const GET: APIRoute = async ({ cookies, params }) => {
  try {
    await requireSession(cookies)
    const id = quoteId(params)

    const quote = await getQuoteById(id)
    if (!quote) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')

    return json({ quote, events: await listQuoteEvents(id) })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)

    const parsed = saveQuoteSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.')
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
      }
      return json(
        {
          error: {
            code: 'QUOTE_SAVE_INVALID_INPUT',
            message: parsed.error.issues[0]?.message ?? 'Check the quote and try again.',
            fields: fieldErrors,
          },
        },
        422
      )
    }

    return json({ quote: await saveQuote(quoteId(params), parsed.data) })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)
    await deleteQuote(quoteId(params))
    return toSuccessResponse('Quote deleted.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
