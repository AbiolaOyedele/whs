/**
 * Method:   POST (add a person) | PUT ?id= (rename, new PIN, switch on/off, unlock) | DELETE ?id=
 * Path:     /api/v1/admin/amber/users
 * Auth:     admin session cookie, same-origin
 * Body:     POST { username, displayName?, pin } · PUT { displayName?, pin?, isActive?, unlock? }
 * Response: 200/201 { ok, message } | { error: { code, message } }
 *
 * PINs arrive here once, are hashed with AMBER_PIN_SECRET, and are never stored or logged.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { createUser, deleteUser, updateUser } from '@/lib/admin/amber'
import { toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { readBody } from '@/lib/forms'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)
    await createUser(await readBody(request))
    return toSuccessResponse('Added. Share the username and PIN with them directly.', 201)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const PUT: APIRoute = async ({ request, cookies, url }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)
    await updateUser(url.searchParams.get('id') ?? '', await readBody(request))
    return toSuccessResponse('Saved.')
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const DELETE: APIRoute = async ({ request, cookies, url }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)
    await deleteUser(url.searchParams.get('id') ?? '')
    return toSuccessResponse('Removed.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
