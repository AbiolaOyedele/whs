/**
 * Method:   POST
 * Path:     /api/v1/webhooks/paystack
 * Auth:     HMAC-SHA512 signature in x-paystack-signature
 * Response: 200 always, once authenticated
 *
 * ⚠️ NOT CURRENTLY RECEIVING TRAFFIC. A Paystack business has one live webhook
 * URL, and this account's points at another product. Payments are recorded by
 * polling instead — see `src/lib/admin/payment-reconcile.ts`. This route is
 * kept working and correct so that pointing a webhook here later is a one-line
 * change in the Paystack dashboard and nothing else.
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
import { isValidWebhook } from '@/lib/paystack'
import { getPaymentByReference } from '@/lib/admin/repositories/payments'
import { reconcilePayment } from '@/lib/admin/payment-reconcile'

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

    /*
     * The payload is not believed. `reconcilePayment` re-verifies against
     * Paystack, checks the amount against ours, and is idempotent — which is
     * what makes retries and the browser callback racing this harmless.
     */
    await reconcilePayment(payment)

    return ok()
  } catch (error) {
    console.error('[paystack] webhook error', error)
    return toErrorResponse(error)
  }
}
