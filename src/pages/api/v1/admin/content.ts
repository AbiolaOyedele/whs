/**
 * Method:   PUT
 * Path:     /api/v1/admin/content
 * Auth:     admin session cookie
 * Request:  { content?: Record<key, string | string[]>, tokens?: Record<key, string> }
 * Response: 200 { ok, message } | { error: { code, message } }
 *
 * Saves edits. Does NOT publish: the site is static, so these values reach
 * visitors on the next build. That separation is deliberate — it lets an
 * operator work through a page over an afternoon and push the result once.
 *
 * Only keys in the registries are accepted. An unknown key is rejected rather
 * than stored, so this endpoint cannot be used to write arbitrary rows into a
 * table whose values are later interpolated into pages and a <style> block.
 */
import type { APIRoute } from 'astro'
import { z } from 'zod'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { CONTENT_BY_KEY } from '@/config/content-registry'
import { TOKEN_BY_KEY } from '@/config/token-registry'
import { saveContentOverride, saveTokenOverride } from '@/lib/admin/repositories/content'
import { invalidateSiteContent } from '@/lib/admin/content'
import { readBody } from '@/lib/forms'

export const prerender = false

const payloadSchema = z.object({
  content: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
  tokens: z.record(z.string(), z.string()).default({}),
})

/**
 * A token value ends up inside a `:root { }` block in the document head.
 *
 * Anything that could close that declaration, open another rule, or start a
 * URL fetch is refused. The allowlist is intentionally narrow: hex, rgb/hsl/
 * oklch functions, plain keywords and numbers cover every value the token
 * registry actually holds, and nothing else has a reason to be there.
 */
const TOKEN_VALUE = /^[a-zA-Z0-9\s.,%#()/-]{1,120}$/

function assertSafeTokenValue(key: string, value: string): void {
  if (value.trim().length === 0) return // blank clears the override

  if (!TOKEN_VALUE.test(value) || /url\s*\(|expression|@import|[<>{};]/i.test(value)) {
    throw new AppError(
      422,
      `That is not a value we can use for ${key}. Try a colour like #84cc16 or oklch(92% 0.19 128).`,
      'CONTENT_TOKEN_VALUE_REJECTED'
    )
  }
}

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    const session = await requireSession(cookies)

    const parsed = payloadSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      throw new AppError(422, 'We could not read those changes.', 'CONTENT_PAYLOAD_INVALID')
    }

    const { content, tokens } = parsed.data

    for (const key of Object.keys(content)) {
      if (!CONTENT_BY_KEY.has(key)) {
        throw new AppError(422, 'That field is not editable.', 'CONTENT_KEY_UNKNOWN')
      }
    }
    for (const key of Object.keys(tokens)) {
      if (!TOKEN_BY_KEY.has(key)) {
        throw new AppError(422, 'That token is not editable.', 'CONTENT_TOKEN_UNKNOWN')
      }
      assertSafeTokenValue(key, tokens[key] ?? '')
    }

    for (const [key, value] of Object.entries(content)) {
      await saveContentOverride(key, value, session.userId)
    }
    for (const [key, value] of Object.entries(tokens)) {
      await saveTokenOverride(key, value, session.userId)
    }

    // The preview renders through the same loader this process caches, so the
    // cache has to go or the operator previews what they just replaced.
    invalidateSiteContent()

    return toSuccessResponse('Saved. Publish when you are ready for visitors to see it.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
