/**
 * Paystack: initialise a transaction, verify one, and authenticate webhooks.
 *
 * Plain `fetch` rather than an SDK. Paystack's REST surface here is three
 * endpoints, and their Node library has been unmaintained for years — a
 * dependency that wraps three POSTs is a liability, not a convenience.
 *
 * FLAGGED DEVIATION: the confirmed stack names Stripe. Paystack was chosen for
 * this build on the operator's instruction.
 *
 * ⚠️ CURRENCY. Paystack settles in NGN, GHS, ZAR, KES and USD depending on the
 * account. It does not do GBP or EUR. `isPayableCurrency` is the guard, and the
 * UI must not offer payment on a quote priced in something Paystack will
 * refuse — the failure otherwise happens after the client has clicked pay,
 * which is the worst possible moment to discover it.
 */
import crypto from 'node:crypto'
import { adminEnv } from '@/config/env'
import { AppError } from './errors'

const API = 'https://api.paystack.co'

/** Currencies Paystack can charge. Everything else must not reach checkout. */
export const PAYSTACK_CURRENCIES = ['NGN', 'GHS', 'ZAR', 'KES', 'USD'] as const

export function isPayableCurrency(currency: string): boolean {
  return (PAYSTACK_CURRENCIES as readonly string[]).includes(currency)
}

/** True when Paystack is configured at all. */
export function isPaystackConfigured(): boolean {
  try {
    return Boolean(adminEnv().PAYSTACK_SECRET_KEY)
  } catch {
    return false
  }
}

function secret(): string {
  const key = adminEnv().PAYSTACK_SECRET_KEY
  if (!key) {
    throw new AppError(503, 'Card payments are not switched on yet.', 'PAYMENT_NOT_CONFIGURED')
  }
  return key
}

interface InitialiseResult {
  authorizationUrl: string
  paystackReference: string
}

/**
 * Creates a transaction and returns the URL to send the client to.
 *
 * `reference` is ours and must already be stored: it is the idempotency key
 * that stops a replayed webhook recording a second payment.
 */
export async function initialiseTransaction(input: {
  email: string
  amountMinor: number
  currency: string
  reference: string
  callbackUrl: string
  metadata: Record<string, string>
}): Promise<InitialiseResult> {
  if (!isPayableCurrency(input.currency)) {
    throw new AppError(
      422,
      `We cannot take card payments in ${input.currency}. Please get in touch and we will arrange a transfer.`,
      'PAYMENT_CURRENCY_UNSUPPORTED'
    )
  }

  const response = await fetch(`${API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      // Paystack takes minor units, which is what we store. No conversion.
      amount: input.amountMinor,
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  })

  const body = (await response.json()) as {
    status?: boolean
    message?: string
    data?: { authorization_url?: string; reference?: string }
  }

  if (!response.ok || !body.status || !body.data?.authorization_url) {
    /*
     * Logged as well as thrown. `AppError.details` never reaches the client by
     * design, and `toErrorResponse` only logs errors it does not recognise — so
     * without this, Paystack's actual complaint ("email must be a valid email",
     * "amount is too low") is discarded and the operator debugging a failed
     * payment has nothing but the generic sentence the client saw.
     */
    console.error('[paystack] initialise rejected', {
      status: response.status,
      message: body.message,
      reference: input.reference,
    })

    throw new AppError(
      502,
      'We could not start that payment. Please try again in a moment.',
      'PAYMENT_INITIALISE_FAILED',
      body.message
    )
  }

  return {
    authorizationUrl: body.data.authorization_url,
    paystackReference: body.data.reference ?? input.reference,
  }
}

export interface VerifiedTransaction {
  status: 'paid' | 'failed' | 'abandoned'
  amountMinor: number
  currency: string
  paidAt: string | null
  channel: string | null
  feesMinor: number | null
  raw: unknown
}

/**
 * Asks Paystack what actually happened.
 *
 * The browser returning from checkout proves nothing — anyone can request the
 * callback URL — so the redirect only triggers this, and this decides.
 */
export async function verifyTransaction(reference: string): Promise<VerifiedTransaction> {
  const response = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
  })

  const body = (await response.json()) as {
    status?: boolean
    data?: {
      status?: string
      amount?: number
      currency?: string
      paid_at?: string | null
      channel?: string | null
      fees?: number | null
    }
  }

  if (!response.ok || !body.status || !body.data) {
    throw new AppError(
      502,
      'We could not confirm that payment. If you were charged, email us and we will sort it out.',
      'PAYMENT_VERIFY_FAILED'
    )
  }

  const state = body.data.status
  return {
    status: state === 'success' ? 'paid' : state === 'abandoned' ? 'abandoned' : 'failed',
    amountMinor: body.data.amount ?? 0,
    currency: body.data.currency ?? '',
    paidAt: body.data.paid_at ?? null,
    channel: body.data.channel ?? null,
    feesMinor: body.data.fees ?? null,
    raw: body.data,
  }
}

/**
 * Authenticates a webhook.
 *
 * Paystack signs the raw request body with the secret key, HMAC-SHA512, in
 * `x-paystack-signature`. Compared in constant time. An unsigned or
 * wrongly-signed webhook is an attacker telling us an invoice is paid, so this
 * is not optional and there is no development bypass.
 */
export function isValidWebhook(rawBody: string, signature: string | null): boolean {
  if (!signature) return false

  const expected = crypto.createHmac('sha512', secret()).update(rawBody).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length) return false

  return crypto.timingSafeEqual(a, b)
}
