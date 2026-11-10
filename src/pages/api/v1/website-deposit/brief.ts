/**
 * Method:   POST
 * Path:     /api/v1/website-deposit/brief
 * Auth:     none — gated on the deposit reference being paid, not a login
 * Request:  application/json or form-encoded — see websiteDepositBriefSchema
 * Response: 200 { ok: true, message } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertSameOrigin, readBody, submitWebsiteDepositBrief } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    enforceRateLimit(`website-deposit-brief:${clientIp(request)}`)
    await submitWebsiteDepositBrief(await readBody(request))
    return toSuccessResponse('Thanks, that is with us. We will be in touch shortly.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
