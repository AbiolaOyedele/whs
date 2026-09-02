/**
 * Method:   POST (create) | PUT (update) | DELETE
 * Path:     /api/v1/admin/clients
 * Auth:     admin session cookie
 * Response: 200 { client } | { ok } | { error: { code, message } }
 */
import type { APIRoute } from 'astro'
import { z } from 'zod'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import { createClient, deleteClient, updateClient } from '@/lib/admin/repositories/clients'
import { readBody } from '@/lib/forms'

export const prerender = false

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional()

const clientSchema = z.object({
  name: z.string().trim().min(1, 'Give the client a name.').max(120),
  company: optional(160),
  email: z
    .string()
    .trim()
    .max(254)
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'That email looks wrong.'
    )
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional(),
  phone: optional(40),
  role: optional(120),
  website: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (value) => value === '' || /^https?:\/\//i.test(value),
      'Links must start with http:// or https://'
    )
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional(),
  notes: z.string().trim().max(4000).default(''),
})

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function parse(body: unknown) {
  const parsed = clientSchema.safeParse(body)
  if (!parsed.success) {
    throw new AppError(
      422,
      parsed.error.issues[0]?.message ?? 'Check the form and try again.',
      'CLIENT_INVALID_INPUT'
    )
  }
  return parsed.data
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    const session = await requireSession(cookies)
    return json({ client: await createClient(parse(await readBody(request)), session.userId) }, 201)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const PUT: APIRoute = async ({ request, cookies, url }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)

    const id = url.searchParams.get('id')
    if (!id) throw new AppError(404, 'That client no longer exists.', 'CLIENT_NOT_FOUND')

    await updateClient(id, parse(await readBody(request)))
    return toSuccessResponse('Saved.')
  } catch (error) {
    return toErrorResponse(error)
  }
}

export const DELETE: APIRoute = async ({ request, cookies, url }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)

    const id = url.searchParams.get('id')
    if (!id) throw new AppError(404, 'That client no longer exists.', 'CLIENT_NOT_FOUND')

    // Quotes survive: they keep their own copy of the name they were sent under.
    await deleteClient(id)
    return toSuccessResponse('Client deleted. Their quotes are untouched.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
