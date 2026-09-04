/**
 * Packages sold at one price.
 *
 * An option is priced one of two ways and never both: from its line items, or
 * from its own `fixedPriceMinor`. The items under a fixed-price option are
 * inclusions. They keep their stored unit prices so switching back restores the
 * breakdown, but those prices must not reach a total, a card or a bill.
 *
 * The property that matters most is the last one in this file: the rows on the
 * invoice sum to the amount the invoice charges. That equality is what the
 * original "money lives in one place" rule was protecting, and adding a second
 * way to price a package is exactly the change that could break it.
 */
import { describe, expect, it } from 'vitest'
import { chargedLines, computeTotals, optionPriceMinor } from '@/lib/admin/money'
import type { QuoteLineItem, QuoteOption } from '@/types/quote'

const option = (over: Partial<QuoteOption> & { id: string }): QuoteOption => ({
  kind: 'package',
  position: 0,
  title: 'Package',
  description: '',
  isSelected: false,
  isDefault: false,
  pricing: 'itemised',
  fixedPriceMinor: 0,
  ...over,
})

const item = (over: Partial<QuoteLineItem> & { id: string }): QuoteLineItem => ({
  position: 0,
  title: 'Line',
  description: '',
  quantity: 1,
  unitPriceMinor: 0,
  isOptional: false,
  optionId: null,
  ...over,
})

const totals = (lineItems: QuoteLineItem[], options: QuoteOption[]) =>
  computeTotals({ lineItems, options, discountMinor: 0, taxRateBp: 0, depositPercent: 50 })

describe('optionPriceMinor', () => {
  it('uses the fixed price and ignores what the items say', () => {
    const pkg = option({ id: 'std', pricing: 'fixed', fixedPriceMinor: 1_200_000 })
    const items = [
      item({ id: 'a', unitPriceMinor: 999_999, optionId: 'std' }),
      item({ id: 'b', unitPriceMinor: 999_999, optionId: 'std' }),
    ]

    expect(optionPriceMinor(pkg, items)).toBe(1_200_000)
  })

  it('never returns a negative price', () => {
    const pkg = option({ id: 'std', pricing: 'fixed', fixedPriceMinor: -500 })
    expect(optionPriceMinor(pkg, [])).toBe(0)
  })
})

describe('computeTotals with a fixed-price package', () => {
  it('charges the package price, not its inclusions', () => {
    const options = [
      option({ id: 'std', pricing: 'fixed', fixedPriceMinor: 1_200_000, isSelected: true }),
    ]
    const items = [
      item({ id: 'a', unitPriceMinor: 800_000, optionId: 'std' }),
      item({ id: 'b', unitPriceMinor: 700_000, optionId: 'std' }),
    ]

    // Not 1,500,000, which is what the inclusions would have summed to.
    expect(totals(items, options).subtotalMinor).toBe(1_200_000)
  })

  it('counts an unpicked fixed package as menu, never as charge', () => {
    const options = [option({ id: 'std', pricing: 'fixed', fixedPriceMinor: 1_200_000 })]
    const items = [item({ id: 'a', unitPriceMinor: 800_000, optionId: 'std' })]

    const result = totals(items, options)
    expect(result.subtotalMinor).toBe(0)
    expect(result.optionalMinor).toBe(1_200_000)
  })

  it('adds base scope to the package price', () => {
    const options = [
      option({ id: 'std', pricing: 'fixed', fixedPriceMinor: 1_200_000, isSelected: true }),
    ]
    const items = [
      item({ id: 'base', unitPriceMinor: 300_000 }),
      item({ id: 'a', unitPriceMinor: 800_000, optionId: 'std' }),
    ]

    expect(totals(items, options).subtotalMinor).toBe(1_500_000)
  })

  it('leaves itemised packages exactly as they were', () => {
    const options = [option({ id: 'std', isSelected: true })]
    const items = [
      item({ id: 'a', unitPriceMinor: 800_000, optionId: 'std' }),
      item({ id: 'b', quantity: 2, unitPriceMinor: 100_000, optionId: 'std' }),
    ]

    expect(totals(items, options).subtotalMinor).toBe(1_000_000)
  })

  it('handles one fixed package beside one itemised package', () => {
    const options = [
      option({ id: 'lite', position: 0 }),
      option({
        id: 'full',
        position: 1,
        pricing: 'fixed',
        fixedPriceMinor: 2_000_000,
        isSelected: true,
      }),
    ]
    const items = [
      item({ id: 'a', unitPriceMinor: 400_000, optionId: 'lite' }),
      item({ id: 'b', unitPriceMinor: 900_000, optionId: 'full' }),
    ]

    const result = totals(items, options)
    expect(result.subtotalMinor).toBe(2_000_000)
    // The unpicked itemised package is still quotable as a menu figure.
    expect(result.optionalMinor).toBe(400_000)
  })

  it('applies tax and deposit to the fixed price like any other charge', () => {
    const options = [
      option({ id: 'std', pricing: 'fixed', fixedPriceMinor: 1_000_000, isSelected: true }),
    ]
    const result = computeTotals({
      lineItems: [item({ id: 'a', unitPriceMinor: 500_000, optionId: 'std' })],
      options,
      discountMinor: 0,
      taxRateBp: 2000,
      depositPercent: 40,
    })

    expect(result.subtotalMinor).toBe(1_000_000)
    expect(result.taxMinor).toBe(200_000)
    expect(result.totalMinor).toBe(1_200_000)
    expect(result.depositMinor).toBe(480_000)
  })
})

describe('chargedLines', () => {
  it('collapses a fixed package into one row naming its inclusions', () => {
    const options = [
      option({
        id: 'std',
        title: 'Standard',
        description: 'Everything most teams need.',
        pricing: 'fixed',
        fixedPriceMinor: 1_200_000,
        isSelected: true,
      }),
    ]
    const items = [
      item({ id: 'a', title: 'Design', unitPriceMinor: 800_000, optionId: 'std' }),
      item({ id: 'b', title: 'Build', unitPriceMinor: 700_000, optionId: 'std' }),
    ]

    const lines = chargedLines(items, options)
    expect(lines).toHaveLength(1)
    expect(lines[0]?.title).toBe('Standard')
    expect(lines[0]?.quantity).toBe(1)
    expect(lines[0]?.amountMinor).toBe(1_200_000)
    expect(lines[0]?.description).toContain('Design, Build')
  })

  it('keeps itemised packages itemised', () => {
    const options = [option({ id: 'std', isSelected: true })]
    const items = [
      item({ id: 'a', title: 'Design', unitPriceMinor: 800_000, optionId: 'std' }),
      item({ id: 'b', title: 'Build', unitPriceMinor: 200_000, optionId: 'std' }),
    ]

    expect(chargedLines(items, options).map((line) => line.title)).toEqual(['Design', 'Build'])
  })

  it('leaves out an unpicked package entirely', () => {
    const options = [option({ id: 'std', pricing: 'fixed', fixedPriceMinor: 1_200_000 })]
    const items = [item({ id: 'a', title: 'Design', unitPriceMinor: 800_000, optionId: 'std' })]

    expect(chargedLines(items, options)).toEqual([])
  })

  /*
   * The one that matters. If these ever disagree, a client receives a bill
   * whose rows do not add up to what it asks them to pay.
   */
  it('always sums to the subtotal computeTotals charges', () => {
    const cases: Array<[QuoteLineItem[], QuoteOption[]]> = [
      [[item({ id: 'a', unitPriceMinor: 300_000 })], []],
      [
        [
          item({ id: 'base', unitPriceMinor: 250_000 }),
          item({ id: 'menu', unitPriceMinor: 90_000, isOptional: true }),
          item({ id: 'x', unitPriceMinor: 800_000, optionId: 'fixed' }),
          item({ id: 'y', quantity: 3, unitPriceMinor: 60_000, optionId: 'listed' }),
        ],
        [
          option({ id: 'fixed', pricing: 'fixed', fixedPriceMinor: 1_450_000, isSelected: true }),
          option({ id: 'listed', position: 1 }),
        ],
      ],
      [
        [
          item({ id: 'x', unitPriceMinor: 800_000, optionId: 'care' }),
          item({ id: 'y', unitPriceMinor: 400_000, optionId: 'sms' }),
        ],
        [
          option({
            id: 'care',
            kind: 'addon',
            pricing: 'fixed',
            fixedPriceMinor: 99_000,
            isSelected: true,
          }),
          option({ id: 'sms', kind: 'addon', position: 1, isSelected: true }),
        ],
      ],
    ]

    for (const [items, options] of cases) {
      const summed = chargedLines(items, options).reduce((sum, line) => sum + line.amountMinor, 0)
      expect(summed).toBe(totals(items, options).subtotalMinor)
    }
  })
})
