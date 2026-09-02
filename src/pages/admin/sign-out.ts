/**
 * Method:   POST
 * Path:     /admin/sign-out
 * Auth:     none needed — signing out an absent session is a no-op
 * Response: 302 to the sign-in page
 *
 * A POST rather than a link: a GET sign-out can be triggered by any image tag
 * on any page, which is a small but pointless denial of service against your
 * own session.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { assertAdminOrigin, signOut } from '@/lib/admin/auth'
import { toErrorResponse } from '@/lib/errors'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await signOut(cookies)
    return redirect('/admin/sign-in')
  } catch (error) {
    return toErrorResponse(error)
  }
}
