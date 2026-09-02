/**
 * Method:   POST
 * Path:     /api/v1/admin/publish
 * Auth:     admin session cookie
 * Response: 200 { ok, message } | { error: { code, message } }
 *
 * Triggers a Vercel rebuild so saved edits reach visitors.
 *
 * The deploy hook is fire-and-forget by design: Vercel returns a job id, not a
 * finished deployment, and a build takes a minute or two. Blocking the request
 * until the site is live would time out long before it was. The publish log
 * records that we asked; the Vercel dashboard is the source of truth for how it
 * went.
 */
import type { APIRoute } from 'astro'
import { adminEnv, publicEnv } from '@/config/env'
import { AppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { recordPublish } from '@/lib/admin/repositories/content'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    const session = await requireSession(cookies)
    // A build costs money and minutes. Three a minute is far more than anyone
    // needs and stops a stuck button queueing twenty.
    enforceRateLimit(`admin-publish:${clientIp(request)}`, 3, 60_000)

    const hook = adminEnv().WH_VERCEL_DEPLOY_HOOK_URL
    if (!hook) {
      throw new AppError(
        503,
        'Publishing is not connected yet. Add a Vercel deploy hook to push changes live from here. Your edits are saved either way.',
        'PUBLISH_HOOK_NOT_CONFIGURED'
      )
    }

    const response = await fetch(hook, { method: 'POST' })

    if (!response.ok) {
      await recordPublish({
        status: 'failed',
        note: 'Deploy hook rejected the request.',
        error: `HTTP ${response.status}`,
        changedKeys: 0,
        userId: session.userId,
        email: session.email,
      })

      throw new AppError(
        502,
        'Vercel would not start the build. Check the deploy hook and try again.',
        'PUBLISH_HOOK_REJECTED'
      )
    }

    await recordPublish({
      status: 'triggered',
      note: 'Rebuild requested.',
      changedKeys: 0,
      userId: session.userId,
      email: session.email,
    })

    return toSuccessResponse('Building now. Your changes will be live in a minute or two.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
