/**
 * Request plumbing shared by the /api/v1/templates routes.
 *
 * Validation errors surface as the first issue's own sentence: every message in
 * the templates schema is written for the person reading it, so passing it
 * through beats a generic "check the form".
 */
import type { z } from 'zod'
import { AppError } from '@/lib/errors'

export const json = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, private' },
  })

export function parseTemplateInput<S extends z.ZodType>(schema: S, body: unknown): z.infer<S> {
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new AppError(
      422,
      parsed.error.issues[0]?.message ?? 'Check the details and try again.',
      'TEMPLATES_SAVE_INVALID_INPUT'
    )
  }
  return parsed.data
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * The `?id=` every write-by-id route needs.
 *
 * Checked for shape here because Postgres rejects a malformed uuid with an
 * error, not an empty result, and that would reach the operator as "we could
 * not reach your templates" when the truth is that no such entry exists.
 */
export function requireId(url: URL): string {
  const id = url.searchParams.get('id')?.trim()
  if (!id || !UUID.test(id))
    throw new AppError(404, 'That template no longer exists.', 'TEMPLATES_ENTRY_NOT_FOUND')
  return id
}
