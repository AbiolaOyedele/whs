/**
 * Method:   POST
 * Path:     /api/v1/quote-requests
 * Auth:     none (public)
 * Response: 200 { ok, message, requestId, quoteSlug }
 *
 * The submission endpoint behind the multi-step "Request A Quote"
 * wizard. Does three things atomically-enough for a small studio:
 *
 *   1. Writes the raw submission into the unified `public_requests`
 *      queue so it is never lost.
 *   2. Creates a matching client row (via findOrCreateClient) and a
 *      draft quote pre-filled with the client's name, project title,
 *      and standard terms — the operator opens the queue, clicks
 *      through to the draft, prices it, and sends.
 *   3. Sends the studio a notification and the visitor a receipt.
 *
 * The request row is written FIRST; if any of the follow-up work fails,
 * the request is still saved and the failure is logged. That means an
 * operator sees the enquiry in the queue even when Supabase quirked mid-
 * flow or the mail provider had a bad minute.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, isAppError, toErrorResponse } from '@/lib/errors'
import { assertSameOrigin, readBody } from '@/lib/forms'
import { HONEYPOT_FIELD, quoteRequestSchema } from '@/lib/schemas/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'
import { hashIp } from '@/lib/admin/quote-session'
import {
  attachRequestRelations,
  createPublicRequest,
} from '@/lib/admin/repositories/public-requests'
import { findOrCreateClient } from '@/lib/admin/repositories/clients'
import * as quotesRepo from '@/lib/admin/repositories/quotes'
import {
  encryptPin,
  generatePin,
  hashPin,
  isValidQuoteSlug,
  quoteSlug,
} from '@/lib/admin/quote-access'
import { STANDARD_PAYMENT_TERMS, STANDARD_TERMS } from '@/config/terms'
import { sendClientReceipt, sendNotification } from '@/lib/resend'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    enforceRateLimit(`quote-request:${clientIp(request)}`, 3, 60_000)

    const body = await readBody(request)

    const trap = body[HONEYPOT_FIELD]
    if (typeof trap === 'string' && trap.trim().length > 0) {
      throw new AppError(400, 'This submission could not be accepted.', 'REQUEST_REJECTED')
    }

    const parsed = quoteRequestSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
      throw new AppError(422, first, 'QUOTE_REQUEST_INVALID_INPUT')
    }

    const data = parsed.data
    const contactName = data.contactName.trim()
    const contactEmail = data.contactEmail.trim()
    const contactPhone = (data.contactPhone || '').trim() || null
    const company = (data.company || '').trim() || null
    const budgetRange = (data.budgetRange || '').trim() || null
    const timeline = (data.timeline || '').trim() || null
    const referralSource = (data.referralSource || '').trim() || null

    /* Step 1 — the queue row. If everything else fails, this survives. */
    const requestRow = await createPublicRequest(
      {
        kind: 'quote',
        contactName,
        contactEmail,
        contactPhone,
        company,
        message: data.projectSummary.trim(),
        details: {
          projectType: data.projectType,
          projectSummary: data.projectSummary.trim(),
          budgetRange: budgetRange ?? '',
          timeline: timeline ?? '',
          referralSource: referralSource ?? '',
        },
      },
      {
        ipHash: await hashIp(clientIp(request)),
        userAgent: request.headers.get('user-agent') ?? undefined,
      }
    )

    /*
     * Steps 2 and 3 — best-effort. A failure here leaves the request
     * row in the queue with a null linked_quote_id; the operator can
     * still open it, reply by email, and create a quote by hand.
     */
    let quoteSlugValue: string | null = null
    try {
      const client = await findOrCreateClient(
        { name: contactName, company, email: contactEmail, phone: contactPhone },
        null
      )

      /* Slug: name-derived, uniqued with a short suffix if taken. Avoids
         crashing the whole submission on a name collision. */
      let slug = quoteSlug(contactName)
      if (!isValidQuoteSlug(slug)) slug = quoteSlug(`quote-${Date.now()}`)
      let attempt = 0
      while (await quotesRepo.slugExists(slug)) {
        attempt += 1
        if (attempt > 8) {
          slug = `${slug.slice(0, 40)}-${Math.random().toString(36).slice(2, 6)}`
          break
        }
        slug = `${quoteSlug(contactName)}-${Math.random().toString(36).slice(2, 5)}`
      }

      const pin = generatePin()
      const projectTitle = truncate(data.projectSummary.trim().split('\n')[0] ?? 'Untitled', 200)
      const quoteId = await quotesRepo.createQuote({
        slug,
        pinHash: await hashPin(pin, slug),
        pinEncrypted: await encryptPin(pin),
        clientName: contactName,
        projectTitle,
        currency: 'NGN',
        createdBy: null,
      })

      await quotesRepo.updateQuote(quoteId, {
        terms: STANDARD_TERMS,
        paymentTerms: STANDARD_PAYMENT_TERMS,
        ...(client ? { clientId: client.id } : {}),
      })

      await attachRequestRelations(requestRow.id, {
        clientId: client?.id ?? null,
        linkedQuoteId: quoteId,
      })
      quoteSlugValue = slug
    } catch (cause) {
      console.error('[quote-request-draft]', cause)
    }

    const origin = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')

    /* Studio notification — best effort. */
    try {
      await sendNotification({
        subject: `New quote request: ${contactName}${company ? ` (${company})` : ''}`,
        replyTo: contactEmail,
        text: [
          `${contactName} asked for a quote.`,
          ``,
          `Email: ${contactEmail}`,
          contactPhone ? `Phone: ${contactPhone}` : null,
          company ? `Company: ${company}` : null,
          `Project type: ${data.projectType}`,
          budgetRange ? `Budget: ${budgetRange}` : null,
          timeline ? `Timeline: ${timeline}` : null,
          referralSource ? `Heard about us via: ${referralSource}` : null,
          ``,
          `Their summary:`,
          data.projectSummary.trim(),
          ``,
          `See it in the queue: ${origin}/admin/requests/${requestRow.id}`,
          quoteSlugValue ? `Draft quote: ${origin}/admin/quotes` : null,
        ]
          .filter((line) => line !== null)
          .join('\n'),
      })
    } catch (cause) {
      console.error('[quote-request-notify]', cause)
    }

    /* Client receipt — never throws. */
    void sendClientReceipt({
      to: contactEmail,
      subject: 'We got your request',
      text: [
        `Hi ${contactName.split(' ')[0] || contactName},`,
        ``,
        `Thanks for reaching out to WildHands. We have your request and will read through it today. You'll hear back from us within one working day with either a quote or a couple of questions.`,
        ``,
        `A short summary of what you sent:`,
        data.projectSummary.trim(),
        ``,
        `If you need to add anything, just reply to this email — it reaches us directly.`,
        ``,
        `— The WildHands team`,
        `hello@whstd.com`,
      ].join('\n'),
    })

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Thanks — we have your request and will reply within a working day.',
        requestId: requestRow.id,
        quoteSlug: quoteSlugValue,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    if (!isAppError(error)) console.error('[quote-request]', error)
    return toErrorResponse(error)
  }
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trimEnd()}…`
}
