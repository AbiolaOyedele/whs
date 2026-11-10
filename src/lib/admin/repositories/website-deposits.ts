/**
 * Every database query touching a /72-hour-website campaign deposit.
 *
 * Deliberately separate from repositories/payments.ts (quote_payments): that
 * table requires a quote or an invoice behind every row, and a campaign
 * deposit has neither. See supabase/migrations/0013_website_deposits.sql.
 */
import { serviceClient } from '@/lib/supabase'
import { AppError } from '@/lib/errors'
import type { PaymentStatus } from './payments'

export interface WebsiteDeposit {
  id: string
  reference: string
  tier: string
  email: string
  businessName: string | null
  status: PaymentStatus
  amountMinor: number
  currency: string
  paidAt: string | null
  channel: string | null
  createdAt: string
}

interface Row {
  id: string
  reference: string
  tier: string
  email: string
  business_name: string | null
  status: PaymentStatus
  amount_minor: number
  currency: string
  paid_at: string | null
  channel: string | null
  created_at: string
}

const SELECT =
  'id, reference, tier, email, business_name, status, amount_minor, currency, paid_at, channel, created_at'

const toDeposit = (row: Row): WebsiteDeposit => ({
  id: row.id,
  reference: row.reference,
  tier: row.tier,
  email: row.email,
  businessName: row.business_name,
  status: row.status,
  amountMinor: row.amount_minor,
  currency: row.currency,
  paidAt: row.paid_at,
  channel: row.channel,
  createdAt: row.created_at,
})

function fail(op: string, cause: unknown): never {
  throw new AppError(
    500,
    'We could not reach the payment record.',
    `DB_WEBSITE_DEPOSIT_${op}_FAILED`,
    cause
  )
}

export async function createWebsiteDeposit(input: {
  reference: string
  tier: string
  email: string
  businessName?: string | undefined
  amountMinor: number
  currency: string
}): Promise<void> {
  const { error } = await serviceClient().from('website_deposits').insert({
    reference: input.reference,
    tier: input.tier,
    email: input.email,
    business_name: input.businessName || null,
    amount_minor: input.amountMinor,
    currency: input.currency,
  })
  if (error) fail('CREATE', error)
}

export async function getWebsiteDepositByReference(
  reference: string
): Promise<WebsiteDeposit | null> {
  const { data, error } = await serviceClient()
    .from('website_deposits')
    .select(SELECT)
    .eq('reference', reference)
    .maybeSingle()

  if (error) fail('GET', error)
  return data ? toDeposit(data as Row) : null
}

/**
 * Settles a deposit. Guarded on `status = 'pending'`, so a verify that races
 * a second one (the browser callback, say, running twice) updates zero rows
 * on its second pass rather than overwriting an already-settled row.
 *
 * @returns true when this call was the one that settled it.
 */
export async function settleWebsiteDeposit(
  reference: string,
  result: {
    status: PaymentStatus
    paystackReference: string | null
    paidAt: string | null
    channel: string | null
    feesMinor: number | null
    raw: unknown
  }
): Promise<boolean> {
  const { data, error } = await serviceClient()
    .from('website_deposits')
    .update({
      status: result.status,
      paystack_reference: result.paystackReference,
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
