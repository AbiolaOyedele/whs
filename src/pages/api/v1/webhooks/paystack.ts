/**
 * Method:   POST
 * Path:     /api/v1/webhooks/paystack
 * Auth:     HMAC-SHA512 signature in x-paystack-signature
 * Response: 200 always, once authenticated
 *
 * The authoritative record of whether a payment happened. The browser callback
 * is a convenience for the client; this is what we believe.
 *
 * Two rules this endpoint lives by:
 *
 *  1. The signature is checked against the RAW body before anything is parsed.
 *     An unsigned webhook is an attacker telling us an invoice is paid.
 *  2. It returns 200 for anything it has authenticated, including events it
 *     ignores. Paystack retries non-2xx responses, so a 4xx on an event we
 *     simply do not care about turns into a retry loop.
 */
import type { APIRoute } from 'astro'
import { toErrorResponse } from '@/lib/errors'
import { isValidWebhook, verifyTransaction } from '@/lib/paystack'
import { getPaymentByReference, settlePayment } from '@/lib/admin/repositories/payments'
import { getQuoteById } from '@/lib/admin/repositories/quotes'
import { sendNotification } from '@/lib/resend'
import { formatMoney } from '@/lib/admin/money'

export const prerender = false

const ok = (): Response => new Response(JSON.stringify({ received: true }), { status: 200 })

export const POST: APIRoute = async ({ request }) => {
  try {
    // Raw text, not request.json(): the signature covers the exact bytes sent,
    // and re-serialising a parsed object will not reproduce them.
    const raw = await request.text()

    if (!isValidWebhook(raw, request.headers.get('x-paystack-signature'))) {
      // Deliberately terse. An attacker learns nothing about why.
      return new Response('Unauthorised', { status: 401 })
    }

    const event = JSON.parse(raw) as {
      event?: string
      data?: { reference?: string }
    }

    const reference = event.data?.reference
    if (!reference || event.event !== 'charge.success') return ok()

    const payment = await getPaymentByReference(reference)
    if (!payment) {
      console.warn('[paystack] webhook for an unknown reference', reference)
      return ok()
    }
    if (payment.status === 'paid') return ok() // already settled; retries are normal

    // Verified against Paystack rather than trusted from the payload, so a
    // forged-but-somehow-signed body still cannot invent an amount.
    const verified = await verifyTransaction(reference)

    if (verified.amountMinor !== payment.amountMinor || verified.currency !== payment.currency) {
      console.error('[paystack] amount mismatch', {
        reference,
        expected: `${payment.amountMinor} ${payment.currency}`,
        got: `${verified.amountMinor} ${verified.currency}`,
      })
      // Not settled: a mismatch is a problem for a person, not a state change.
      return ok()
    }

    const settled = await settlePayment(reference, {
      status: verified.status,
      paidAt: verified.paidAt,
      channel: verified.channel,
      feesMinor: verified.feesMinor,
      raw: verified.raw,
    })

    if (settled && verified.status === 'paid') {
      const quote = await getQuoteById(payment.quoteId)
      try {
        await sendNotification({
          subject: `Payment received: ${quote?.clientName ?? 'a client'} — ${formatMoney(payment.amountMinor, payment.currency)}`,
          text: [
            `${quote?.clientName ?? 'A client'} paid the ${payment.kind}.`,
            `Amount: ${formatMoney(payment.amountMinor, payment.currency)}`,
            `Project: ${quote?.projectTitle ?? '—'}`,
            `Reference: ${reference}`,
          ].join('\n'),
        })
      } catch (cause) {
        // The payment is recorded. A mail failure must not fail the webhook,
        // or Paystack retries and we notify twice.
        console.error('[paystack] notify failed', cause)
      }
    }

    return ok()
  } catch (error) {
    console.error('[paystack] webhook error', error)
    return toErrorResponse(error)
  }
}
