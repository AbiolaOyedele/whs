/**
 * Method:   POST
 * Path:     /api/v1/admin/quotes/:id/draft
 * Auth:     admin session cookie
 * Response: 200 { draft, provider, model, label, assumptions }
 *
 * Returns a draft. Does NOT save it — the operator applies it in the editor,
 * field by field or wholesale, and then saves. A model's guess at a price is a
 * starting point for someone who knows, not a write to a client-facing record.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { applyDraft } from '@/lib/admin/quotes'
import { draftRequestSchema } from '@/lib/schemas/quotes'
import { readBody } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies, params }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)
    // Model calls cost money. Ten a minute is far above real drafting pace and
    // well below anything that would run up a bill unnoticed.
    enforceRateLimit(`admin-draft:${clientIp(request)}`, 10, 60_000)

    const id = params['id']
    if (!id) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')

    const parsed = draftRequestSchema.safeParse({ ...(await readBody(request)), quoteId: id })
    if (!parsed.success) {
      throw new AppError(
        422,
        parsed.error.issues[0]?.message ?? 'Tell the drafter a bit more about the project.',
        'AI_DRAFT_INVALID_INPUT'
      )
    }

    const result = await applyDraft(
      id,
      parsed.data.brief,
      parsed.data.model,
      parsed.data.includeExisting
    )

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
