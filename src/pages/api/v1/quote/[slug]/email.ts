/**
 * Method:   POST
 * Path:     /api/v1/quote/:slug/email
 * Auth:     the quote access cookie minted by the PIN gate
 * Response: 200 { ok: true, message }
 *
 * Lets a client put their email on their own quote, so a payment can be
 * receipted somewhere.
 *
 * Payment used to stop dead here with "we need an email address, please get in
 * touch", which asks someone who is holding their card to go and send an email
 * instead. The address is the only thing missing and they are the person who
 * has it.
 *
 * Set-once. Anyone with the access code can call this, so allowing an overwrite
 * would let a second holder of the link point the receipt, and every message
 * after it, at an address of their choosing. The guard is in the UPDATE's own
 * WHERE clause, not a read followed by a write.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { getQuoteBySlug, setClientEmailIfEmpty } from '@/lib/admin/repositories/quotes'
import { hasQuoteAccess } from '@/lib/admin/quote-session'
import { sendNotification } from '@/lib/resend'
import { clientEmailSchema } from '@/lib/schemas/quotes'
import { assertSameOrigin, readBody } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies, params }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)

    const slug = params['slug']
    if (!slug) throw new AppError(404, 'That quote could not be found.', 'QUOTE_NOT_FOUND')

    /* Tighter than the pay limit. There is no reason to submit an address more
       than a handful of times, and this endpoint writes to a quote. */
    enforceRateLimit(`quote-email:${clientIp(request)}`, 5, 60_000)

    if (!(await hasQuoteAccess(slug, cookies))) {
      throw new AppError(401, 'Please enter your access code again.', 'QUOTE_ACCESS_EXPIRED')
    }

    const parsed = clientEmailSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      throw new AppError(
        422,
        parsed.error.issues[0]?.message ?? 'Please enter your email address.',
        'QUOTE_EMAIL_INVALID'
      )
    }

    const quote = await getQuoteBySlug(slug)
    if (!quote) throw new AppError(404, 'That quote could not be found.', 'QUOTE_NOT_FOUND')

    /* Already answered. Not an error: two tabs, or a second person on the same
       link, and the client should not be shown a failure for something that is
       already true. */
    if (quote.clientEmail) {
      return toSuccessResponse('We already have an email address for this quote.')
    }

    const saved = await setClientEmailIfEmpty(quote.id, parsed.data.email)
    if (!saved) {
      return toSuccessResponse('We already have an email address for this quote.')
    }

    /*
     * Best effort, and deliberately after the write.
     *
     * The address is saved either way. A mail outage must not tell the client
     * their details did not register and send them round the loop again.
     */
    try {
      await sendNotification({
        subject: `Email address added: ${quote.clientName}, ${quote.projectTitle}`,
        replyTo: parsed.data.email,
        text: [
          `${quote.clientName} added their email address on the quote.`,
          `Email: ${parsed.data.email}`,
          `Project: ${quote.projectTitle}`,
          `Link: ${publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')}/quote/${quote.slug}`,
          '',
          'It is on the quote already, under Client.',
        ].join('\n'),
      })
    } catch (cause) {
      console.error('[quote-email-notify]', cause)
    }

    return toSuccessResponse('Thank you. We have your email address.')
  } catch (error) {
    return toErrorResponse(error)
  }
}
