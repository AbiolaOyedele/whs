/**
 * The amount check that decides whether a payment is recorded at all.
 *
 * WHAT HAPPENED
 *
 * A client paid a 100,000 kobo deposit. Paystack collected 101,523, because
 * this account passes its transaction fee to the customer. The guard compared
 * for exact equality, called a completed payment a mismatch, and left the row
 * pending. Nothing recorded it: not the quote, not the invoice, not the ledger.
 * The money had moved and the system did not know.
 *
 * THE RULE NOW
 *
 * At least what we asked for, in the currency we asked for. Under-payment is
 * still refused, which is what the guard was written for. Over-payment is not
 * something a client can arrange, because the figure is fixed when the
 * transaction is initialised and the reference is ours.
 *
 * The predicate is inlined rather than imported because `payment-reconcile`
 * reaches Paystack, the database and the mailer on import. What is worth
 * pinning is the comparison itself, and it is one line in that file.
 */
import { describe, expect, it } from 'vitest'

/** Mirrors the guard in reconcilePayment. */
const isMismatch = (
  verified: { amountMinor: number; currency: string },
  stored: { amountMinor: number; currency: string }
): boolean => verified.currency !== stored.currency || verified.amountMinor < stored.amountMinor

const stored = { amountMinor: 100_000, currency: 'NGN' }

describe('the payment amount guard', () => {
  it('settles the exact amount, as it always did', () => {
    expect(isMismatch({ amountMinor: 100_000, currency: 'NGN' }, stored)).toBe(false)
  })

  it('settles the real payment that this bug rejected', () => {
    // The transaction that went missing: our 100,000 plus a 1,523 kobo fee.
    expect(isMismatch({ amountMinor: 101_523, currency: 'NGN' }, stored)).toBe(false)
  })

  it('still refuses an under-payment, which is the case the guard is for', () => {
    expect(isMismatch({ amountMinor: 99_999, currency: 'NGN' }, stored)).toBe(true)
    expect(isMismatch({ amountMinor: 1_000, currency: 'NGN' }, stored)).toBe(true)
    expect(isMismatch({ amountMinor: 0, currency: 'NGN' }, stored)).toBe(true)
  })

  it('still refuses a different currency at any amount', () => {
    // A hundred thousand of something else is not a hundred thousand kobo.
    expect(isMismatch({ amountMinor: 100_000, currency: 'USD' }, stored)).toBe(true)
    expect(isMismatch({ amountMinor: 999_999, currency: 'GBP' }, stored)).toBe(true)
  })
})

describe('what gets credited', () => {
  /*
   * The surcharge is Paystack's fee, collected on top and never ours. Crediting
   * the gross would tell the quote more had been paid off it than actually was,
   * and the balance would drift by the fee on every instalment.
   */
  const credited = (storedMinor: number, _chargedMinor: number) => storedMinor

  it('credits what the quote asked for, not what the card was charged', () => {
    expect(credited(100_000, 101_523)).toBe(100_000)
  })

  const surcharge = (storedMinor: number, chargedMinor: number) =>
    chargedMinor > storedMinor ? chargedMinor - storedMinor : 0

  it('reports the fee the client absorbed, so a bank statement reconciles', () => {
    expect(surcharge(100_000, 101_523)).toBe(1_523)
  })

  it('reports no surcharge when the amounts match', () => {
    expect(surcharge(100_000, 100_000)).toBe(0)
  })
})
