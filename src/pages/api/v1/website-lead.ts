/**
 * Method:   POST
 * Path:     /api/v1/website-lead
 * Auth:     none (public marketing site)
 * Request:  application/json or form-encoded — see websitesLeadSchema
 * Response: 200 { ok: true, message } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertSameOrigin, readBody, submitWebsiteLead } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    enforceRateLimit(`website-lead:${clientIp(request)}`)
    await submitWebsiteLead(await readBody(request))
    return toSuccessResponse('Thanks, that is with us. We will reach out on WhatsApp shortly.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
