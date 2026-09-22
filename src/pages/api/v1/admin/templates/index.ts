/**
 * Method:   GET
 * Path:     /api/v1/admin/templates
 * Auth:     admin session cookie
 * Response: 200 { items, packages, quoteTemplates } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { toErrorResponse } from '@/lib/errors'
import { requireSession } from '@/lib/admin/auth'
import { listTemplateLibrary } from '@/lib/admin/templates'
import { json } from '@/lib/admin/template-http'

export const prerender = false

export const GET: APIRoute = async ({ cookies }) => {
  try {
    await requireSession(cookies)
    return json(await listTemplateLibrary())
  } catch (error) {
    return toErrorResponse(error)
  }
}
