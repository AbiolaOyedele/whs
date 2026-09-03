/**
 * Quote arithmetic. Every figure here reaches a client, so the tests are about
 * order of operations and rounding rather than plumbing.
 */
import { describe, expect, it } from 'vitest'
import { computeTotals, formatMoney, lineAmount, parseMoney } from '@/lib/admin/money'
import type { QuoteLineItem } from '@/types/quote'

const item = (overrides: Partial<QuoteLineItem>): QuoteLineItem => ({
  id: 'x',
  position: 0,
  title: 'Work',
  description: '',
  quantity: 1,
  unitPriceMinor: 0,
  isOptional: false,
  optionId: null,
  ...overrides,
})

describe('lineAmount', () => {
  it('multiplies quantity by unit price in minor units', () => {
    expect(lineAmount({ quantity: 3, unitPriceMinor: 65_000 })).toBe(195_000)
  })

  it('rounds a fractional quantity half away from zero', () => {
    // 2.5 days at £650.05 = £1625.125 → 162513 pence, not 162512.
    expect(lineAmount({ quantity: 2.5, unitPriceMinor: 65_005 })).toBe(162_513)
  })
})

describe('computeTotals', () => {
  it('excludes optional items from the total but reports them separately', () => {
    const totals = computeTotals({
      options: [],
      lineItems: [
        item({ unitPriceMinor: 100_000 }),
        item({ id: 'y', unitPriceMinor: 40_000, isOptional: true }),
      ],
      discountMinor: 0,
      taxRateBp: 0,
      depositPercent: 0,
    })

    expect(totals.subtotalMinor).toBe(100_000)
    expect(totals.optionalMinor).toBe(40_000)
    expect(totals.totalMinor).toBe(100_000)
  })

  it('applies the discount before tax, not after', () => {
    const totals = computeTotals({
      options: [],
      lineItems: [item({ unitPriceMinor: 100_000 })],
      discountMinor: 20_000,
      taxRateBp: 2000, // 20%
      depositPercent: 0,
    })

    // £800 taxable, £160 tax, £960 total. Taxing first would give £1000 - £200 = £800.
    expect(totals.taxableMinor).toBe(80_000)
    expect(totals.taxMinor).toBe(16_000)
    expect(totals.totalMinor).toBe(96_000)
  })

  it('never lets a discount push the total below zero', () => {
    const totals = computeTotals({
      options: [],
      lineItems: [item({ unitPriceMinor: 50_000 })],
      discountMinor: 900_000,
      taxRateBp: 0,
      depositPercent: 0,
    })

    expect(totals.discountMinor).toBe(50_000)
    expect(totals.totalMinor).toBe(0)
  })

  it('splits the deposit and balance so they always sum to the total', () => {
    const totals = computeTotals({
      options: [],
      lineItems: [item({ unitPriceMinor: 33_333 })],
      discountMinor: 0,
      taxRateBp: 0,
      depositPercent: 33,
    })

    expect(totals.depositMinor + totals.balanceMinor).toBe(totals.totalMinor)
  })

  it('treats an empty quote as zero rather than NaN', () => {
    const totals = computeTotals({
      options: [],
      lineItems: [],
      discountMinor: 0,
      taxRateBp: 2000,
      depositPercent: 50,
    })

    expect(totals.totalMinor).toBe(0)
    expect(totals.depositMinor).toBe(0)
  })
})

describe('formatMoney', () => {
  it('formats minor units into the right currency', () => {
    expect(formatMoney(125_050, 'GBP')).toBe('£1,250.50')
  })

  it('uses one locale regardless of currency, so both sides read the same number', () => {
    // A German reading "1.250,00" where we wrote "1,250.00" is a 1000x error.
    expect(formatMoney(125_000, 'EUR')).toContain('1,250.00')
  })

  it('falls back to GBP for an unknown code rather than throwing', () => {
    expect(formatMoney(100, 'ZZZ')).toContain('1.00')
  })
})

describe('parseMoney', () => {
  it('accepts a typed amount with symbols and separators', () => {
    expect(parseMoney('£1,250.50', 'GBP')).toBe(125_050)
  })

  it('returns null for something that is not a number', () => {
    expect(parseMoney('', 'GBP')).toBeNull()
    expect(parseMoney('abc', 'GBP')).toBeNull()
  })
})
