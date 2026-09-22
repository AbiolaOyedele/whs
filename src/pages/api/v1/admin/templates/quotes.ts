/**
 * Method:   POST   save a quote's body as a new template
 *           PUT    replace a template's body and name (?id=)
 *           PATCH  rename a template (?id=)
 *           DELETE remove one (?id=)
 * Path:     /api/v1/admin/templates/quotes
 * Auth:     admin session cookie
 * Response: 200 { template } for writes, 200 { ok: true } for a delete
 *           | { error: { code, message } }
 *
 * The body is validated against the quote's own field rules, so anything saved
 * as a template is something a quote will accept back.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { toErrorResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { readBody } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'
import { quoteTemplateMetaSchema, quoteTemplateSchema } from '@/lib/schemas/templates'
import { deleteTemplateEntry, renameQuoteTemplate, saveQuoteTemplate } from '@/lib/admin/templates'
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
    const input = parseTemplateInput(quoteTemplateSchema, await readBody(context.request))
    return json({ template: await saveQuoteTemplate(null, input) })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const PUT: APIRoute = async (context) => {
  try {
    await authorise(context)
    const id = requireId(context.url)
    const input = parseTemplateInput(quoteTemplateSchema, await readBody(context.request))
    return json({ template: await saveQuoteTemplate(id, input) })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const PATCH: APIRoute = async (context) => {
  try {
    await authorise(context)
    const id = requireId(context.url)
    const input = parseTemplateInput(quoteTemplateMetaSchema, await readBody(context.request))
    return json({ template: await renameQuoteTemplate(id, input) })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const DELETE: APIRoute = async (context) => {
  try {
    await authorise(context)
    await deleteTemplateEntry('quote', requireId(context.url))
    return json({ ok: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
