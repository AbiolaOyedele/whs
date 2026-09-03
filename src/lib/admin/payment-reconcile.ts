/**
 * Turning a pending payment into a settled one — the single place that does it.
 *
 * WHY THIS EXISTS
 *
 * A Paystack business has exactly one live webhook URL. This account's URL
 * belongs to another product, so `charge.success` is not delivered here and the
 * webhook cannot be the authority it was written to be. Recording a payment
 * therefore falls to polling: `verifyTransaction` asks Paystack what actually
 * happened, and every surface that reads payment state sweeps its own pending
 * rows on the way past.
 *
 * The webhook route still exists and still works. When this build gets its own
 * Paystack business, point the webhook here and nothing below needs to change —
 * the webhook simply starts winning the race, and these sweeps find nothing.
 *
 * TWO RULES
 *
 *  1. Only `paid` is ever written. A verify against a reference the client has
 *     not finished paying comes back `abandoned`, and persisting that would
 *     take the row out of `pending` — which is the exact state `settlePayment`
 *     is guarded on. The client would then pay, and we would have no way left
 *     to record it. A payment that never happened stays pending and reads as
 *     unpaid, which is the truth anyway.
 *  2. The amount is checked against what we stored before anything is written.
 *     Paystack is being asked, not trusted.
 */
import type { QuotePayment } from './repositories/payments'
import { listStalePendingPayments, settlePayment } from './repositories/payments'
import { getQuoteById } from './repositories/quotes'
import { verifyTransaction } from '@/lib/paystack'
import { sendNotification } from '@/lib/resend'
import { formatMoney } from './money'

export type ReconcileOutcome =
  /** This call settled it. */
  | 'settled'
  /** Already paid — settled by an earlier sweep, the callback, or the webhook. */
  | 'already-settled'
  /** Paystack says it is not paid. The row is left pending on purpose. */
  | 'unpaid'
  /** Paystack's figure does not match ours. Left alone for a person to look at. */
  | 'mismatch'
  /** Paystack could not be reached. Nothing was written. */
  | 'unavailable'

export interface ReconcileResult {
  outcome: ReconcileOutcome
  /** What Paystack reported, for display. Absent when it could not be reached. */
  verifiedStatus?: 'paid' | 'failed' | 'abandoned'
}

/**
 * Asks Paystack about one pending payment and settles it if it was paid.
 *
 * Safe to call on a payment that is already settled elsewhere — `settlePayment`
 * updates zero rows and this reports `unpaid` rather than notifying twice.
 */
export async function reconcilePayment(payment: QuotePayment): Promise<ReconcileResult> {
  if (payment.status === 'paid') return { outcome: 'already-settled', verifiedStatus: 'paid' }

  let verified: Awaited<ReturnType<typeof verifyTransaction>>
  try {
    verified = await verifyTransaction(payment.reference)
  } catch (cause) {
    console.error('[paystack] verify failed', { reference: payment.reference, cause })
    return { outcome: 'unavailable' }
  }

  if (verified.status !== 'paid') {
    return { outcome: 'unpaid', verifiedStatus: verified.status }
  }

  if (verified.amountMinor !== payment.amountMinor || verified.currency !== payment.currency) {
    console.error('[paystack] amount mismatch', {
      reference: payment.reference,
      expected: `${payment.amountMinor} ${payment.currency}`,
      got: `${verified.amountMinor} ${verified.currency}`,
    })
    return { outcome: 'mismatch', verifiedStatus: verified.status }
  }

  const settled = await settlePayment(payment.reference, {
    status: 'paid',
    paidAt: verified.paidAt,
    channel: verified.channel,
    feesMinor: verified.feesMinor,
    raw: verified.raw,
  })

  // Lost the race with another surface doing the same sweep. It notified.
  if (!settled) return { outcome: 'already-settled', verifiedStatus: 'paid' }

  await notifyPaid(payment)
  return { outcome: 'settled', verifiedStatus: 'paid' }
}

/**
 * Sweeps a batch, one at a time so a slow Paystack cannot fan out into a burst
 * of parallel requests on a page render. In practice the list is empty.
 *
 * @returns how many this call settled.
 */
export async function reconcilePayments(payments: QuotePayment[]): Promise<number> {
  let settled = 0
  for (const payment of payments) {
    if (payment.status !== 'pending') continue
    try {
      const result = await reconcilePayment(payment)
      if (result.outcome === 'settled') settled += 1
    } catch (cause) {
      // A sweep runs on the way past a page render. It is allowed to find
      // nothing, and it is not allowed to take the page down with it.
      console.error('[paystack] reconcile failed', { reference: payment.reference, cause })
    }
  }
  return settled
}

/**
 * The whole-ledger sweep: every pending payment old enough to be worth asking
 * about, across all quotes. For admin screens, which see everything.
 *
 * Never throws, for the same reason as above.
 *
 * @returns how many this call settled.
 */
export async function sweepStalePayments(): Promise<number> {
  try {
    return await reconcilePayments(await listStalePendingPayments())
  } catch (cause) {
    console.error('[paystack] sweep failed', cause)
    return 0
  }
}

/**
 * Tells the operator money arrived.
 *
 * Never allowed to throw: the payment is already recorded, and a mail failure
 * must not turn a settled payment into an error response.
 */
async function notifyPaid(payment: QuotePayment): Promise<void> {
  try {
    const quote = await getQuoteById(payment.quoteId)
    await sendNotification({
      subject: `Payment received: ${quote?.clientName ?? 'a client'} — ${formatMoney(payment.amountMinor, payment.currency)}`,
      text: [
        `${quote?.clientName ?? 'A client'} paid the ${payment.kind}.`,
        `Amount: ${formatMoney(payment.amountMinor, payment.currency)}`,
        `Project: ${quote?.projectTitle ?? '—'}`,
        `Reference: ${payment.reference}`,
      ].join('\n'),
    })
  } catch (cause) {
    console.error('[paystack] notify failed', cause)
  }
}

/**
 * Narrows a list of payments to the ones worth asking Paystack about.
 *
 * `minAgeSeconds` skips clients still on the checkout page — a reference
 * created ten seconds ago is a payment in progress, not a lost one.
 * `maxAgeDays` stops us re-verifying references abandoned weeks ago on every
 * single page render.
 */
export function pendingWorthChecking(
  payments: QuotePayment[],
  options?: { minAgeSeconds?: number; maxAgeDays?: number }
): QuotePayment[] {
  const minAgeSeconds = options?.minAgeSeconds ?? 120
  const maxAgeDays = options?.maxAgeDays ?? 7
  const now = Date.now()

  return payments.filter((payment) => {
    if (payment.status !== 'pending') return false
    const age = now - new Date(payment.createdAt).getTime()
    return Number.isFinite(age) && age >= minAgeSeconds * 1000 && age <= maxAgeDays * 86_400_000
  })
}
