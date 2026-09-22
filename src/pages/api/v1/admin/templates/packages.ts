/**
 * Method:   POST   create a saved package
 *           PUT    replace one (?id=)
 *           DELETE remove one (?id=)
 * Path:     /api/v1/admin/templates/packages
 * Auth:     admin session cookie
 * Response: 200 { package } for writes, 200 { ok: true } for a delete
 *           | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { toErrorResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { readBody } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'
import { savedPackageSchema } from '@/lib/schemas/templates'
import { deleteTemplateEntry, savePackage } from '@/lib/admin/templates'
import { json, parseTemplateInput, requireId } from '@/lib/admin/template-http'

export const prerender = false

type Context = Parameters<APIRoute>[0]

async function authorise({ request, cookies }: Context): Promise<void> {
  assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
  await requireSession(cookies)
  enforceRateLimit(`templates-write:${clientIp(request)}`, 60, 60_000)
}

export const POST: APIRoute = async (context) => {
  try {
    await authorise(context)
    const input = parseTemplateInput(savedPackageSchema, await readBody(context.request))
    return json({ package: await savePackage(null, input) })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const PUT: APIRoute = async (context) => {
  try {
    await authorise(context)
    const id = requireId(context.url)
    const input = parseTemplateInput(savedPackageSchema, await readBody(context.request))
    return json({ package: await savePackage(id, input) })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const DELETE: APIRoute = async (context) => {
  try {
    await authorise(context)
    await deleteTemplateEntry('package', requireId(context.url))
    return json({ ok: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
