/**
 * Method:   POST
 * Path:     /api/v1/job-application
 * Auth:     none
 * Request:  multipart/form-data — see jobApplicationSchema, plus an optional
 *           `cv` file (pdf/doc/docx, max 3.5MB, re-validated server-side)
 * Response: 201 { ok: true, message } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertSameOrigin, submitJobApplication } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    enforceRateLimit(`job:${clientIp(request)}`, 3)

    let form: FormData
    try {
      form = await request.formData()
    } catch (cause) {
      throw new AppError(400, 'We could not read that submission.', 'FORM_BODY_UNREADABLE', cause)
    }

    await submitJobApplication(form)
    return toSuccessResponse('Application received. We will be in touch.', 201)
  } catch (error) {
    return toErrorResponse(error)
  }
}
