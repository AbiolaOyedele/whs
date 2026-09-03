/**
 * Recording payments without a webhook.
 *
 * This deployment shares a Paystack business whose one live webhook URL belongs
 * to another product, so `charge.success` is never delivered here and payments
 * are settled by polling instead. That makes these properties load-bearing:
 *
 *  1. A row only ever leaves `pending` for `paid`. Persisting `abandoned` on a
 *     client who is still on the checkout page would take the row out of the
 *     one state `settlePayment` is guarded on — they would then pay, and there
 *     would be no way left to record it.
 *  2. Paystack's figure is checked against ours before anything is written.
 *  3. A sweep runs on the way past a page render, so it must never throw.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { QuotePayment } from '@/lib/admin/repositories/payments'

const verify = vi.fn()
const settle = vi.fn()
const listStale = vi.fn()
const notify = vi.fn()

vi.mock('@/lib/paystack', () => ({
  verifyTransaction: (reference: string) => verify(reference),
}))

vi.mock('@/lib/admin/repositories/payments', () => ({
  settlePayment: (reference: string, result: unknown) => settle(reference, result),
  listStalePendingPayments: () => listStale(),
}))

vi.mock('@/lib/admin/repositories/quotes', () => ({
  getQuoteById: () => Promise.resolve({ clientName: 'Acme', projectTitle: 'Site' }),
}))

vi.mock('@/lib/resend', () => ({
  sendNotification: (input: unknown) => notify(input),
}))

const { pendingWorthChecking, reconcilePayment, reconcilePayments, sweepStalePayments } =
  await import('@/lib/admin/payment-reconcile')

const payment = (over: Partial<QuotePayment> = {}): QuotePayment => ({
  id: 'p1',
  quoteId: 'q1',
  reference: 'whs_acme_abc123',
  status: 'pending',
  amountMinor: 500_000,
  currency: 'NGN',
  kind: 'deposit',
  paidAt: null,
  channel: null,
  createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
  ...over,
})

const verified = (over: Record<string, unknown> = {}) => ({
  status: 'paid',
  amountMinor: 500_000,
  currency: 'NGN',
  paidAt: '2026-09-03T10:00:00.000Z',
  channel: 'card',
  feesMinor: 7_500,
  raw: {},
  ...over,
})

beforeEach(() => {
  verify.mockReset()
  settle.mockReset().mockResolvedValue(true)
  listStale.mockReset().mockResolvedValue([])
  notify.mockReset().mockResolvedValue(undefined)
})

describe('reconcilePayment', () => {
  it('settles a verified payment and tells the operator', async () => {
    verify.mockResolvedValue(verified())

    const result = await reconcilePayment(payment())

    expect(result.outcome).toBe('settled')
    expect(settle).toHaveBeenCalledWith(
      'whs_acme_abc123',
      expect.objectContaining({ status: 'paid', channel: 'card', feesMinor: 7_500 })
    )
    expect(notify).toHaveBeenCalledOnce()
  })

  it.each(['abandoned', 'failed'] as const)('never persists %s', async (status) => {
    verify.mockResolvedValue(verified({ status }))

    const result = await reconcilePayment(payment())

    expect(result).toEqual({ outcome: 'unpaid', verifiedStatus: status })
    expect(settle).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })

  it('refuses to settle when Paystack disagrees about the amount', async () => {
    verify.mockResolvedValue(verified({ amountMinor: 100 }))

    expect((await reconcilePayment(payment())).outcome).toBe('mismatch')
    expect(settle).not.toHaveBeenCalled()
  })

  it('refuses to settle when Paystack disagrees about the currency', async () => {
    verify.mockResolvedValue(verified({ currency: 'USD' }))

    expect((await reconcilePayment(payment())).outcome).toBe('mismatch')
    expect(settle).not.toHaveBeenCalled()
  })

  it('writes nothing when Paystack cannot be reached', async () => {
    verify.mockRejectedValue(new Error('network'))

    expect(await reconcilePayment(payment())).toEqual({ outcome: 'unavailable' })
    expect(settle).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })

  it('does not ask about a payment already settled', async () => {
    expect((await reconcilePayment(payment({ status: 'paid' }))).outcome).toBe('already-settled')
    expect(verify).not.toHaveBeenCalled()
  })

  it('notifies once when two sweeps race', async () => {
    verify.mockResolvedValue(verified())
    settle.mockResolvedValue(false) // the other sweep updated the row first

    expect((await reconcilePayment(payment())).outcome).toBe('already-settled')
    expect(notify).not.toHaveBeenCalled()
  })

  it('still reports a settled payment when the notification email fails', async () => {
    verify.mockResolvedValue(verified())
    notify.mockRejectedValue(new Error('resend down'))

    expect((await reconcilePayment(payment())).outcome).toBe('settled')
  })
})

describe('pendingWorthChecking', () => {
  const at = (msAgo: number, over: Partial<QuotePayment> = {}) =>
    payment({ createdAt: new Date(Date.now() - msAgo).toISOString(), ...over })

  it('skips a client still on the checkout page', () => {
    expect(pendingWorthChecking([at(10_000)])).toHaveLength(0)
  })

  it('picks up a payment left hanging', () => {
    expect(pendingWorthChecking([at(10 * 60_000)])).toHaveLength(1)
  })

  it('stops re-checking references abandoned weeks ago', () => {
    expect(pendingWorthChecking([at(30 * 86_400_000)])).toHaveLength(0)
  })

  it('ignores payments that are not pending', () => {
    expect(pendingWorthChecking([at(10 * 60_000, { status: 'paid' })])).toHaveLength(0)
  })
})

describe('sweeps', () => {
  it('carries on past one payment that throws', async () => {
    verify.mockResolvedValueOnce(verified()).mockRejectedValueOnce(new Error('boom'))
    settle.mockRejectedValueOnce(new Error('db down')).mockResolvedValue(true)

    await expect(reconcilePayments([payment(), payment({ id: 'p2' })])).resolves.toBe(0)
  })

  it('never throws when the database is unreachable', async () => {
    listStale.mockRejectedValue(new Error('db down'))

    await expect(sweepStalePayments()).resolves.toBe(0)
  })
})
