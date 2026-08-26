/**
 * Method:   POST
 * Path:     /api/v1/contact
 * Auth:     none (public marketing site)
 * Request:  application/json or form-encoded — see contactSchema
 * Response: 200 { ok: true, message } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertSameOrigin, readBody, submitContact } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    enforceRateLimit(`contact:${clientIp(request)}`)
    await submitContact(await readBody(request))
    return toSuccessResponse('Thanks, your message is with us. We will reply shortly.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
