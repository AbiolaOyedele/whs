/**
 * Turning a pending /72-hour-website deposit into a settled one.
 *
 * Mirrors payment-reconcile.ts for quotes, for the same reason: this Paystack
 * business has one live webhook URL and it is not this one, so a browser
 * returning from checkout is what settles almost every payment. See
 * src/lib/paystack.ts and src/pages/api/v1/webhooks/paystack.ts.
 */
import {
  getWebsiteDepositByReference,
  settleWebsiteDeposit,
  type WebsiteDeposit,
} from './repositories/website-deposits'
import { verifyTransaction } from '@/lib/paystack'
import { sendNotification } from '@/lib/resend'
import { formatMoney } from './money'

export type WebsiteDepositOutcome =
  | 'settled'
  | 'already-settled'
  | 'unpaid'
  | 'mismatch'
  | 'unavailable'
  | 'not-found'

export interface WebsiteDepositReconcileResult {
  outcome: WebsiteDepositOutcome
  deposit: WebsiteDeposit | null
}

/** Asks Paystack about one reference and settles the row if it was paid. */
export async function reconcileWebsiteDeposit(
  reference: string
): Promise<WebsiteDepositReconcileResult> {
  const deposit = await getWebsiteDepositByReference(reference)
  if (!deposit) return { outcome: 'not-found', deposit: null }

  if (deposit.status === 'paid') return { outcome: 'already-settled', deposit }

  let verified: Awaited<ReturnType<typeof verifyTransaction>>
  try {
    verified = await verifyTransaction(reference)
  } catch (cause) {
    console.error('[paystack] website deposit verify failed', { reference, cause })
    return { outcome: 'unavailable', deposit }
  }

  if (verified.status !== 'paid') {
    return { outcome: 'unpaid', deposit }
  }

  // At least what was asked for, not exactly — Paystack's fee can be passed
  // to the client, which charges more than the stored amount. See
  // payment-reconcile.ts for the full reasoning.
  if (verified.currency !== deposit.currency || verified.amountMinor < deposit.amountMinor) {
    console.error('[paystack] website deposit amount mismatch', {
      reference,
      expected: `${deposit.amountMinor} ${deposit.currency}`,
      got: `${verified.amountMinor} ${verified.currency}`,
    })
    return { outcome: 'mismatch', deposit }
  }

  const settled = await settleWebsiteDeposit(reference, {
    status: 'paid',
    paystackReference: reference,
    paidAt: verified.paidAt,
    channel: verified.channel,
    feesMinor: verified.feesMinor,
    raw: verified.raw,
  })

  // Lost the race with another call settling the same reference.
  if (!settled) return { outcome: 'already-settled', deposit }

  await notifyPaid(deposit)
  return { outcome: 'settled', deposit: { ...deposit, status: 'paid' } }
}

/** Never allowed to throw: the deposit is already recorded either way. */
async function notifyPaid(deposit: WebsiteDeposit): Promise<void> {
  try {
    await sendNotification({
      subject: `Website deposit paid: ${deposit.tier}, ${formatMoney(deposit.amountMinor, deposit.currency)}`,
      replyTo: deposit.email,
      text: [
        `Tier: ${deposit.tier}`,
        `Deposit: ${formatMoney(deposit.amountMinor, deposit.currency)}`,
        `Email: ${deposit.email}`,
        deposit.businessName ? `Business: ${deposit.businessName}` : undefined,
        `Reference: ${deposit.reference}`,
      ]
        .filter(Boolean)
        .join('\n'),
    })
  } catch (cause) {
    console.error('[paystack] website deposit notify failed', cause)
  }
}
