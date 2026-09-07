/**
 * Method:   POST
 * Path:     /api/v1/site-check
 * Auth:     none (public)
 * Response: 200 { ok, message }
 *
 * The "Send us your URL" popup on the checklist article. Writes one row
 * into `wildhands.public_requests` with kind='site-check' and sends the
 * studio a notification so the request can be replied to.
 *
 * Same-origin only, rate-limited per IP, honeypot-protected. No client
 * row or draft quote is created — this is a lightweight ask, not a
 * proposal.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, isAppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertSameOrigin, readBody } from '@/lib/forms'
import { HONEYPOT_FIELD, siteCheckSchema } from '@/lib/schemas/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'
import { hashIp } from '@/lib/admin/quote-session'
import { createPublicRequest } from '@/lib/admin/repositories/public-requests'
import { sendNotification } from '@/lib/resend'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    enforceRateLimit(`site-check:${clientIp(request)}`, 5, 60_000)

    const body = await readBody(request)

    /* Honeypot before parsing — a bot filling every field should trip on
       the invisible trap without any of its other input being read. */
    const trap = body[HONEYPOT_FIELD]
    if (typeof trap === 'string' && trap.trim().length > 0) {
      throw new AppError(400, 'This submission could not be accepted.', 'REQUEST_REJECTED')
    }

    const parsed = siteCheckSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
      throw new AppError(422, first, 'SITE_CHECK_INVALID_INPUT')
    }

    const data = parsed.data
    const url = normaliseUrl(data.websiteUrl)

    const created = await createPublicRequest(
      {
        kind: 'site-check',
        contactName: (data.contactName || '').trim() || null,
        contactEmail: data.contactEmail,
        contactPhone: null,
        company: null,
        message: (data.message || '').trim(),
        details: { websiteUrl: url },
      },
      {
        ipHash: await hashIp(clientIp(request)),
        userAgent: request.headers.get('user-agent') ?? undefined,
      }
    )

    /* Notification is best-effort. The row is already saved, so a mail
       failure should not tell the visitor their request did not land. */
    try {
      await sendNotification({
        subject: `Site check requested: ${url}`,
        replyTo: data.contactEmail,
        text: [
          `A visitor asked for a site check.`,
          ``,
          `URL: ${url}`,
          `Reply to: ${data.contactEmail}`,
          data.contactName ? `From: ${data.contactName}` : null,
          data.message
            ? `\nWhat they added:\n${data.message}`
            : `\nThey did not add a note.`,
          ``,
          `See it in the queue: ${publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')}/admin/requests/${created.id}`,
        ]
          .filter((line) => line !== null)
          .join('\n'),
      })
    } catch (cause) {
      console.error('[site-check-notify]', cause)
    }

    return toSuccessResponse('Thanks — we will take a look and reply.')
  } catch (error) {
    if (!isAppError(error)) console.error('[site-check]', error)
    return toErrorResponse(error)
  }
}

/** Normalise a URL: add https:// if the user typed a bare host. */
function normaliseUrl(input: string): string {
  const trimmed = input.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
