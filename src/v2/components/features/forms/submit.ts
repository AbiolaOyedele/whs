import { FORM_COPY } from '@v2/content/forms'

/** What a form shows once the server has answered. */
export type SubmitResult = { ok: true; message: string } | { ok: false; message: string }

interface ApiBody {
  ok?: boolean
  message?: string
  error?: { code?: string; message?: string }
}

function isApiBody(value: unknown): value is ApiBody {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Posts a form to one of the site's /api/v1 routes and turns the answer into
 * plain English. A plain object goes as JSON; FormData goes as multipart, which
 * the CV uploads need. Same-origin only: the routes reject any other origin.
 *
 * The server's own messages are authored by us (see src/lib/forms.ts), so they
 * are safe to show as they are.
 */
export async function postForm(endpoint: string, body: FormData | Record<string, unknown>): Promise<SubmitResult> {
  const isFormData = body instanceof FormData
  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: isFormData ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    })
  } catch {
    return { ok: false, message: FORM_COPY.offline }
  }

  const payload: unknown = await response.json().catch(() => null)
  const parsed = isApiBody(payload) ? payload : {}

  if (response.ok) {
    return { ok: true, message: parsed.message ?? 'Thanks, that came through.' }
  }
  return { ok: false, message: parsed.error?.message ?? FORM_COPY.failed }
}
