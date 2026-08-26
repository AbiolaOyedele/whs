/**
 * Method:   POST
 * Path:     /api/v1/tools/llms-txt-generator
 * Auth:     none
 * Request:  application/json — { url: string }
 * Response: 200 { ok, markdown, discovered, included } | { error: { code, message } }
 *
 * Stateless: nothing about the request or result is persisted.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { toErrorResponse } from '@/lib/errors'
import { assertSameOrigin, readBody } from '@/lib/forms'
import { generateLlmsTxt } from '@/lib/llms-txt'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'
import { llmsTxtGeneratorSchema } from '@/lib/schemas/forms'
import { AppError } from '@/lib/errors'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    // Outbound crawling is expensive — throttle harder than the plain forms.
    enforceRateLimit(`llms-txt:${clientIp(request)}`, 3, 60_000)

    const parsed = llmsTxtGeneratorSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      throw new AppError(
        422,
        parsed.error.issues[0]?.message ?? 'Enter a valid website URL.',
        'TOOL_LLMS_INPUT_INVALID'
      )
    }

    const result = await generateLlmsTxt(parsed.data.url)
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
