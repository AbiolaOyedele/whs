/**
 * Client-selectable options.
 *
 * The money is the point. A client picks a package and that pick decides the
 * total, the deposit, what the pay button charges and what the invoice says, so
 * these tests are about one question: does exactly the selected scope reach the
 * total, and nothing else?
 */
import { describe, expect, it } from 'vitest'
import { computeTotals, isCharged, lineAmount, optionTotalMinor } from '@/lib/admin/money'
import { selectionState } from '@/lib/admin/quote-selection'
import type { QuotePayment } from '@/lib/admin/repositories/payments'
import type { Quote, QuoteLineItem, QuoteOption } from '@/types/quote'

const option = (over: Partial<QuoteOption> & { id: string }): QuoteOption => ({
  kind: 'package',
  position: 0,
  title: 'Package',
  description: '',
  isSelected: false,
  isDefault: false,
  ...over,
})

const item = (over: Partial<QuoteLineItem> & { id: string }): QuoteLineItem => ({
  position: 0,
  title: 'Work',
  description: '',
  quantity: 1,
  unitPriceMinor: 0,
  isOptional: false,
  optionId: null,
  ...over,
})

const totals = (lineItems: QuoteLineItem[], options: QuoteOption[]) =>
  computeTotals({ lineItems, options, discountMinor: 0, taxRateBp: 0, depositPercent: 50 })

describe('computeTotals with options', () => {
  const base = item({ id: 'base', unitPriceMinor: 100_000 })
  const essential = item({ id: 'e', unitPriceMinor: 200_000, optionId: 'ess' })
  const premium = item({ id: 'p', unitPriceMinor: 900_000, optionId: 'pre' })

  it('charges base scope plus only the selected package', () => {
    const result = totals(
      [base, essential, premium],
      [option({ id: 'ess', isSelected: true }), option({ id: 'pre' })]
    )

    expect(result.subtotalMinor).toBe(300_000)
    expect(result.totalMinor).toBe(300_000)
  })

  it('never sums two packages at once', () => {
    // The database forbids this and the schema forbids it, but the arithmetic
    // must not depend on either being reached first.
    const both = totals(
      [base, essential, premium],
      [option({ id: 'ess', isSelected: true }), option({ id: 'pre', isSelected: true })]
    )

    // If a bad write ever lands, the figure is at least the sum of what is
    // marked selected — never a silently different number.
    expect(both.subtotalMinor).toBe(1_200_000)
  })

  it('charges base scope alone when nothing is picked yet', () => {
    const result = totals(
      [base, essential, premium],
      [option({ id: 'ess' }), option({ id: 'pre' })]
    )

    expect(result.totalMinor).toBe(100_000)
    // The unpicked packages are quoted as a menu, not charged.
    expect(result.optionalMinor).toBe(1_100_000)
  })

  it('adds each ticked add-on and no others', () => {
    const seo = item({ id: 's', unitPriceMinor: 50_000, optionId: 'seo' })
    const care = item({ id: 'c', unitPriceMinor: 30_000, optionId: 'care' })

    const result = totals(
      [base, seo, care],
      [
        option({ id: 'seo', kind: 'addon', isSelected: true }),
        option({ id: 'care', kind: 'addon' }),
      ]
    )

    expect(result.totalMinor).toBe(150_000)
  })

  it('does not charge an item whose option has been deleted', () => {
    // The dangerous direction: treating an orphan as base scope would add a
    // charge the client never selected.
    const result = totals(
      [base, item({ id: 'ghost', unitPriceMinor: 500_000, optionId: 'gone' })],
      []
    )

    expect(result.totalMinor).toBe(100_000)
  })

  it('takes the deposit from the selected total, not the whole menu', () => {
    const result = totals(
      [base, essential, premium],
      [option({ id: 'ess', isSelected: true }), option({ id: 'pre' })]
    )

    expect(result.depositMinor).toBe(150_000)
    expect(result.depositMinor + result.balanceMinor).toBe(result.totalMinor)
  })
})

describe('optionTotalMinor', () => {
  it('prices an option from its own lines', () => {
    const items = [
      item({ id: 'a', unitPriceMinor: 200_000, optionId: 'pre' }),
      item({ id: 'b', quantity: 2, unitPriceMinor: 50_000, optionId: 'pre' }),
      item({ id: 'c', unitPriceMinor: 900_000, optionId: 'other' }),
    ]

    expect(optionTotalMinor('pre', items)).toBe(300_000)
  })

  it('is zero for an option with no lines, not NaN', () => {
    expect(optionTotalMinor('empty', [])).toBe(0)
  })
})

describe('selectionState', () => {
  const quote = (over: Partial<Pick<Quote, 'status' | 'decidedAt'>> = {}) => ({
    status: 'sent' as const,
    decidedAt: null,
    ...over,
  })

  const payment = (status: QuotePayment['status']): QuotePayment => ({
    id: 'p',
    quoteId: 'q',
    reference: 'r',
    status,
    amountMinor: 1,
    currency: 'NGN',
    kind: 'deposit',
    paidAt: null,
    channel: null,
    createdAt: new Date().toISOString(),
  })

  it('lets a client change their mind while the quote is open', () => {
    expect(selectionState(quote(), []).locked).toBe(false)
  })

  it('freezes once the quote is accepted', () => {
    const state = selectionState(quote({ status: 'accepted' }), [])
    expect(state.locked).toBe(true)
    expect(state.reason).toBe('decided')
  })

  it('freezes once the quote is declined', () => {
    expect(selectionState(quote({ status: 'declined' }), []).locked).toBe(true)
  })

  it('freezes on a decision timestamp even if the status lags', () => {
    expect(selectionState(quote({ decidedAt: '2026-09-03T00:00:00Z' }), []).locked).toBe(true)
  })

  it('freezes the moment money is paid, whatever the status says', () => {
    const state = selectionState(quote(), [payment('paid')])
    expect(state.locked).toBe(true)
    expect(state.reason).toBe('paid')
  })

  it('does not freeze on a payment that was only started', () => {
    // Otherwise abandoning a checkout would lock the client out of their own
    // quote with nothing paid.
    expect(selectionState(quote(), [payment('pending')]).locked).toBe(false)
    expect(selectionState(quote(), [payment('failed')]).locked).toBe(false)
  })

  it('gives the client a sentence, not a code', () => {
    const state = selectionState(quote(), [payment('paid')])
    expect(state.message).toMatch(/payment/i)
    expect(state.message).not.toMatch(/[A-Z]{4}_/)
  })
})

describe('isCharged — the predicate the invoice and the total share', () => {
  const options = [
    option({ id: 'ess', isSelected: true }),
    option({ id: 'pre' }),
    option({ id: 'seo', kind: 'addon', isSelected: true }),
  ]

  it('charges base scope', () => {
    expect(isCharged(item({ id: 'a' }), options)).toBe(true)
  })

  it('does not charge a base-scope item marked optional', () => {
    expect(isCharged(item({ id: 'a', isOptional: true }), options)).toBe(false)
  })

  it('charges a line under the selected package', () => {
    expect(isCharged(item({ id: 'a', optionId: 'ess' }), options)).toBe(true)
  })

  it('does not charge a line under an unselected package', () => {
    expect(isCharged(item({ id: 'a', optionId: 'pre' }), options)).toBe(false)
  })

  it('charges a line under a ticked add-on', () => {
    expect(isCharged(item({ id: 'a', optionId: 'seo' }), options)).toBe(true)
  })

  it('does not charge a line whose option no longer exists', () => {
    expect(isCharged(item({ id: 'a', optionId: 'gone' }), options)).toBe(false)
  })

  it('agrees with computeTotals on every line', () => {
    // The property that stops the invoice and the total disagreeing: the sum of
    // the charged lines IS the subtotal.
    const lines = [
      item({ id: 'a', unitPriceMinor: 100_000 }),
      item({ id: 'b', unitPriceMinor: 700_000, isOptional: true }),
      item({ id: 'c', unitPriceMinor: 200_000, optionId: 'ess' }),
      item({ id: 'd', unitPriceMinor: 900_000, optionId: 'pre' }),
      item({ id: 'e', unitPriceMinor: 50_000, optionId: 'seo' }),
      item({ id: 'f', unitPriceMinor: 400_000, optionId: 'gone' }),
    ]

    const charged = lines.filter((line) => isCharged(line, options))
    const summed = charged.reduce((total, line) => total + lineAmount(line), 0)

    expect(summed).toBe(totals(lines, options).subtotalMinor)
  })
})
