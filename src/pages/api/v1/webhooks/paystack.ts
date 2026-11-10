/**
 * Method:   POST
 * Path:     /api/v1/webhooks/paystack
 * Auth:     HMAC-SHA512 signature in x-paystack-signature
 * Response: 200 always, once authenticated
 *
 * The hub for the whole Paystack business. A Paystack business has one webhook
 * URL per mode, and since 7 Nov 2026 both live and test point here. The same
 * business also takes payments for Dumpty and the shop platform, so every
 * authenticated event that is not one of our own payments is passed on to them
 * (`PAYSTACK_FORWARD_URLS`, see `src/lib/paystack-forward.ts`). Polling
 * (`src/lib/admin/payment-reconcile.ts`) still runs as a backstop.
 *
 * Three rules this endpoint lives by:
 *
 *  1. The signature is checked against the RAW body before anything is parsed.
 *     An unsigned webhook is an attacker telling us an invoice is paid.
 *  2. It returns 200 for anything it has authenticated, including events it
 *     ignores. Paystack retries non-2xx responses, so a 4xx on an event we
 *     simply do not care about turns into a retry loop.
 *  3. Only a signed event is ever passed on, with its body and signature
 *     untouched. A downstream product that is down does not fail the request:
 *     Paystack would retry the event at us, not at it.
 */
import type { APIRoute } from 'astro'
import { toErrorResponse } from '@/lib/errors'
import { isValidWebhook } from '@/lib/paystack'
import { getPaymentByReference } from '@/lib/admin/repositories/payments'
import { reconcileWebsiteDeposit } from '@/lib/admin/website-deposit-reconcile'
import { reconcilePayment } from '@/lib/admin/payment-reconcile'
import { forwardUrls, forwardWebhook } from '@/lib/paystack-forward'

export const prerender = false

const ok = (): Response => new Response(JSON.stringify({ received: true }), { status: 200 })

export const POST: APIRoute = async ({ request }) => {
  try {
    // Raw text, not request.json(): the signature covers the exact bytes sent,
    // and re-serialising a parsed object will not reproduce them.
    const raw = await request.text()

    const signature = request.headers.get('x-paystack-signature')
    if (!signature || !isValidWebhook(raw, signature)) {
      // Deliberately terse. An attacker learns nothing about why.
      return new Response('Unauthorised', { status: 401 })
    }

    const event = JSON.parse(raw) as {
      event?: string
      data?: { reference?: string }
    }

    const reference = event.data?.reference

    // A deposit from the /72-hour-website page, for a client who closed the
    // tab before Paystack sent them back. Re-verified and idempotent, like
    // the quote payments below.
    if (reference?.startsWith('whsweb_') && event.event === 'charge.success') {
      await reconcileWebsiteDeposit(reference)
      return ok()
    }

    const payment =
      reference && event.event === 'charge.success' ? await getPaymentByReference(reference) : null
    if (!payment) {
      // Not one of ours: another product on this Paystack business. Each
      // checks the signature again and ignores references it does not know.
      await passOn(raw, signature)
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

async function passOn(raw: string, signature: string): Promise<void> {
  const results = await forwardWebhook(raw, signature, forwardUrls())
  for (const result of results) {
    if (!result.ok) {
      // The URL and status only: never the body, which holds a customer's details.
      console.error('[paystack] could not pass the webhook on', result.url, result.status)
    }
  }
}
