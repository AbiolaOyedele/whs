/**
 * Method:   POST (sign in) | DELETE (sign out)
 * Path:     /api/v1/admin/session
 * Auth:     none on POST — this is what establishes it
 * Response: 200 { ok, message } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { z } from 'zod'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertAdminOrigin, signIn, signOut } from '@/lib/admin/auth'
import { readBody } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

const credentialsSchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(200),
})

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    // Tighter than the public forms: five attempts a minute is generous for a
    // person typing their own password and hostile to anything else.
    enforceRateLimit(`admin-signin:${clientIp(request)}`, 5, 60_000)

    const parsed = credentialsSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      throw new AppError(422, 'Enter both an email and a password.', 'ADMIN_SIGNIN_INCOMPLETE')
    }

    await signIn(parsed.data.email, parsed.data.password, cookies)
    return toSuccessResponse('Signed in.')
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await signOut(cookies)
    return toSuccessResponse('Signed out.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
