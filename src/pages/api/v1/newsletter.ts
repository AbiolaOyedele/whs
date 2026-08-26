/**
 * Method:   POST
 * Path:     /api/v1/newsletter
 * Auth:     none
 * Request:  application/json or form-encoded — see newsletterSchema
 * Response: 200 { ok: true, message } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertSameOrigin, readBody, submitNewsletter } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    enforceRateLimit(`newsletter:${clientIp(request)}`)
    await submitNewsletter(await readBody(request))
    return toSuccessResponse('You are on the list. Thanks for subscribing.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
