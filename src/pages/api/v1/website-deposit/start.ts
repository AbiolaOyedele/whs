/**
 * Method:   POST
 * Path:     /api/v1/website-deposit/start
 * Auth:     none (public campaign page)
 * Request:  { tier: 'starter' | 'standard', email } — see websiteDepositSchema
 * Response: 200 { url } — where to send the client | { error: { code, message } }
 *
 * Starts a Paystack transaction for a /72-hour-website deposit. The amount is
 * worked out SERVER-SIDE from the tier, using the same plan prices the page
 * shows (src/v2/content/pricing.ts), never taken from the request. See
 * PAYMENTS.md.
 */
import type { APIRoute } from 'astro'
import { randomBytes } from 'node:crypto'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse } from '@/lib/errors'
import { assertSameOrigin, readBody } from '@/lib/forms'
import { websiteDepositSchema } from '@/lib/schemas/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'
import { initialiseTransaction } from '@/lib/paystack'
import { createWebsiteDeposit } from '@/lib/admin/repositories/website-deposits'
import { WEBSITE_OFFER_PATH, depositKobo, offerPlan } from '@v2/content/website-offer'

export const prerender = false

const CURRENCY = 'NGN'

export const POST: APIRoute = async ({ request }) => {
  try {
    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    enforceRateLimit(`website-deposit:${clientIp(request)}`, 6, 60_000)

    const body = await readBody(request)
    const parsed = websiteDepositSchema.safeParse(body)
    if (!parsed.success) {
      throw new AppError(
        422,
        parsed.error.issues[0]?.message ?? 'Please check your email address and try again.',
        'WEBSITE_DEPOSIT_INVALID_INPUT'
      )
    }

    const { tier, email } = parsed.data
    const amountMinor = depositKobo(offerPlan(tier))

    // Ours, generated before redirecting. The idempotency key a repeated
    // verify is guarded on.
    const reference = `whsweb_${tier}_${randomBytes(6).toString('hex')}`

    // Recorded BEFORE redirecting. If the insert fails, nothing is sent to
    // Paystack, so there is never a transaction with no row behind it.
    await createWebsiteDeposit({ reference, tier, email, amountMinor, currency: CURRENCY })

    const origin = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')
    const { authorizationUrl } = await initialiseTransaction({
      email,
      amountMinor,
      currency: CURRENCY,
      reference,
      callbackUrl: `${origin}${WEBSITE_OFFER_PATH}/paid`,
      metadata: { tier, kind: 'website_deposit' },
    })

    return new Response(JSON.stringify({ url: authorizationUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
