/**
 * Method:   POST
 * Path:     /api/v1/quote/:slug/pay
 * Auth:     the quote access cookie minted by the PIN gate
 * Response: 200 { url } — where to send the client
 *
 * Starts a Paystack transaction for the deposit (or the full amount when no
 * deposit is set).
 *
 * The amount is computed SERVER-SIDE from the stored quote, never taken from
 * the request. A payment endpoint that trusts a browser for the figure is how
 * a £10,000 deposit gets paid as £1.
 */
import type { APIRoute } from 'astro'
import { randomBytes } from 'node:crypto'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse } from '@/lib/errors'
import { computeTotals } from '@/lib/admin/money'
import { getQuoteBySlug } from '@/lib/admin/repositories/quotes'
import { createPayment, listPaymentsForQuote } from '@/lib/admin/repositories/payments'
import { hasQuoteAccess } from '@/lib/admin/quote-session'
import { initialiseTransaction, isPayableCurrency } from '@/lib/paystack'
import { assertSameOrigin } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies, params }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)

    const slug = params['slug']
    if (!slug) throw new AppError(404, 'That quote could not be found.', 'QUOTE_NOT_FOUND')

    enforceRateLimit(`quote-pay:${clientIp(request)}`, 6, 60_000)

    if (!(await hasQuoteAccess(slug, cookies))) {
      throw new AppError(401, 'Please enter your access code again.', 'QUOTE_ACCESS_EXPIRED')
    }

    const quote = await getQuoteBySlug(slug)
    if (!quote) throw new AppError(404, 'That quote could not be found.', 'QUOTE_NOT_FOUND')

    if (!quote.clientEmail) {
      throw new AppError(
        422,
        'We need an email address on this quote before we can take a payment. Please get in touch.',
        'PAYMENT_NO_EMAIL'
      )
    }

    if (!isPayableCurrency(quote.currency)) {
      throw new AppError(
        422,
        `We cannot take card payments in ${quote.currency}. Reply to our email and we will arrange a bank transfer.`,
        'PAYMENT_CURRENCY_UNSUPPORTED'
      )
    }

    const totals = computeTotals({
      lineItems: quote.lineItems,
      options: quote.options,
      discountMinor: quote.discountMinor,
      taxRateBp: quote.taxRateBp,
      depositPercent: quote.depositPercent,
    })

    /*
     * What is actually owed right now.
     *
     * Instalments: the first payment is the deposit, and anything after it
     * clears the remaining balance. The earlier version charged the deposit and
     * then refused any further payment once anything had been settled, which
     * left a client who had paid 40% with no way to pay the other 60% at all.
     */
    const settled = (await listPaymentsForQuote(quote.id)).filter(
      (payment) => payment.status === 'paid'
    )
    const paidMinor = settled.reduce((sum, payment) => sum + payment.amountMinor, 0)
    const outstandingMinor = Math.max(0, totals.totalMinor - paidMinor)

    if (outstandingMinor <= 0) {
      throw new AppError(
        409,
        'This quote is fully paid. If that looks wrong, please get in touch.',
        'PAYMENT_ALREADY_PAID'
      )
    }

    const takingDeposit = paidMinor === 0 && quote.depositPercent > 0 && quote.depositPercent < 100

    const amountMinor = takingDeposit ? totals.depositMinor : outstandingMinor
    const kind = takingDeposit ? 'deposit' : paidMinor > 0 ? 'balance' : 'full'

    // Our own reference, and the idempotency key for the webhook.
    const reference = `whs_${quote.slug.slice(0, 20)}_${randomBytes(6).toString('hex')}`

    // Recorded BEFORE redirecting. If we created the transaction first and the
    // insert then failed, a client could pay against a reference we have no row
    // for, and the webhook would have nothing to settle.
    await createPayment({
      quoteId: quote.id,
      reference,
      amountMinor,
      currency: quote.currency,
      kind,
    })

    const origin = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')
    const { authorizationUrl } = await initialiseTransaction({
      email: quote.clientEmail,
      amountMinor,
      currency: quote.currency,
      reference,
      callbackUrl: `${origin}/quote/${quote.slug}/paid`,
      metadata: { quote_id: quote.id, quote_slug: quote.slug, kind },
    })

    return new Response(JSON.stringify({ url: authorizationUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
