/**
 * Method:   POST (add a line) | PUT ?id= (edit text, switch on/off, move up/down) | DELETE ?id=
 * Path:     /api/v1/admin/amber/headlines
 * Auth:     admin session cookie, same-origin
 * Body:     POST { text } · PUT { text?, isActive?, move?: 'up' | 'down' }
 * Response: 200/201 { ok, message } | { error: { code, message } }
 *
 * The heading bank Amber rotates through. `{brand}` in a line becomes the brand name.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { createHeadline, deleteHeadline, updateHeadline } from '@/lib/admin/amber'
import { toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { readBody } from '@/lib/forms'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)
    await createHeadline(await readBody(request))
    return toSuccessResponse('Added.', 201)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const PUT: APIRoute = async ({ request, cookies, url }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)
    await updateHeadline(url.searchParams.get('id') ?? '', await readBody(request))
    return toSuccessResponse('Saved.')
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const DELETE: APIRoute = async ({ request, cookies, url }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)
    await deleteHeadline(url.searchParams.get('id') ?? '')
    return toSuccessResponse('Removed.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
