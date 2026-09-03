/**
 * Every database query touching a quote payment.
 */
import { serviceClient } from '@/lib/supabase'
import { AppError } from '@/lib/errors'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'abandoned' | 'refunded'

export interface QuotePayment {
  id: string
  quoteId: string
  reference: string
  status: PaymentStatus
  amountMinor: number
  currency: string
  kind: 'deposit' | 'balance' | 'full'
  paidAt: string | null
  channel: string | null
  createdAt: string
}

interface Row {
  id: string
  quote_id: string
  reference: string
  status: PaymentStatus
  amount_minor: number
  currency: string
  kind: QuotePayment['kind']
  paid_at: string | null
  channel: string | null
  created_at: string
}

const SELECT =
  'id, quote_id, reference, status, amount_minor, currency, kind, paid_at, channel, created_at'

const toPayment = (row: Row): QuotePayment => ({
  id: row.id,
  quoteId: row.quote_id,
  reference: row.reference,
  status: row.status,
  amountMinor: row.amount_minor,
  currency: row.currency,
  kind: row.kind,
  paidAt: row.paid_at,
  channel: row.channel,
  createdAt: row.created_at,
})

function fail(op: string, cause: unknown): never {
  throw new AppError(
    500,
    'We could not reach the payment record.',
    `DB_PAYMENT_${op}_FAILED`,
    cause
  )
}

export async function createPayment(input: {
  quoteId: string
  reference: string
  amountMinor: number
  currency: string
  kind: QuotePayment['kind']
}): Promise<void> {
  const { error } = await serviceClient().from('quote_payments').insert({
    quote_id: input.quoteId,
    reference: input.reference,
    amount_minor: input.amountMinor,
    currency: input.currency,
    kind: input.kind,
  })
  if (error) fail('CREATE', error)
}

export async function getPaymentByReference(reference: string): Promise<QuotePayment | null> {
  const { data, error } = await serviceClient()
    .from('quote_payments')
    .select(SELECT)
    .eq('reference', reference)
    .maybeSingle()

  if (error) fail('GET', error)
  return data ? toPayment(data as Row) : null
}

export async function listPaymentsForQuote(quoteId: string): Promise<QuotePayment[]> {
  const { data, error } = await serviceClient()
    .from('quote_payments')
    .select(SELECT)
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false })

  if (error) fail('LIST', error)
  return (data as Row[]).map(toPayment)
}

/**
 * Settles a payment.
 *
 * Guarded on `status = 'pending'`, which is what makes this idempotent: the
 * webhook and the browser callback both race to settle the same reference, and
 * Paystack retries webhooks. Whichever arrives first wins; the rest update zero
 * rows and return quietly.
 *
 * @returns true when this call was the one that settled it.
 */
export async function settlePayment(
  reference: string,
  result: {
    status: PaymentStatus
    paidAt: string | null
    channel: string | null
    feesMinor: number | null
    raw: unknown
  }
): Promise<boolean> {
  const { data, error } = await serviceClient()
    .from('quote_payments')
    .update({
      status: result.status,
      paid_at: result.paidAt,
      channel: result.channel,
      fees_minor: result.feesMinor,
      raw: result.raw,
    })
    .eq('reference', reference)
    .eq('status', 'pending')
    .select('id')

  if (error) fail('SETTLE', error)
  return (data as Array<{ id: string }>).length > 0
}

/**
 * Pending payments old enough to be worth asking Paystack about.
 *
 * `minAgeSeconds` skips clients who are still on the checkout page — a
 * reference created ten seconds ago is not a lost payment, it is a payment in
 * progress. `maxAgeDays` stops the sweep re-verifying references that were
 * abandoned weeks ago and never will be paid.
 */
export async function listStalePendingPayments(options?: {
  minAgeSeconds?: number
  maxAgeDays?: number
  limit?: number
}): Promise<QuotePayment[]> {
  const minAgeSeconds = options?.minAgeSeconds ?? 120
  const maxAgeDays = options?.maxAgeDays ?? 7
  const now = Date.now()

  const { data, error } = await serviceClient()
    .from('quote_payments')
    .select(SELECT)
    .eq('status', 'pending')
    .lte('created_at', new Date(now - minAgeSeconds * 1000).toISOString())
    .gte('created_at', new Date(now - maxAgeDays * 86_400_000).toISOString())
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 25)

  if (error) fail('LIST_PENDING', error)
  return (data as Row[]).map(toPayment)
}
