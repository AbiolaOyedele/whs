/**
 * Currency conversion arithmetic.
 *
 * The bug this exists to prevent: switching a quote's currency used to change
 * only the label, so £4,200 became ₦4,200 — out by a factor of about two
 * thousand, on a document that goes to a client.
 */
import { describe, expect, it } from 'vitest'
import { convertMinor } from '@/lib/admin/fx'

describe('convertMinor', () => {
  it('applies the rate to minor units', () => {
    // £650.00 at 2,050 NGN to the pound.
    expect(convertMinor(65_000, 2050)).toBe(133_250_000)
  })

  it('rounds a genuine half away from zero, like the rest of the money code', () => {
    // Values exact in binary, so this tests the rounding rule rather than
    // floating point: 100 * 1.005 is actually 100.4999…, which rounds down and
    // says nothing about the rule.
    expect(convertMinor(1, 2.5)).toBe(3)
    expect(convertMinor(3, 0.5)).toBe(2)
    expect(convertMinor(1, 2.25)).toBe(2)
  })

  it('is a no-op at parity', () => {
    expect(convertMinor(123_456, 1)).toBe(123_456)
  })

  it('handles a rate below one', () => {
    // ₦1,000,000 at 0.00049 to the pound.
    expect(convertMinor(100_000_000, 0.00049)).toBe(49_000)
  })

  it('never returns a fractional minor unit', () => {
    for (const rate of [1.3337, 0.00071, 2049.87, 1 / 3]) {
      expect(Number.isInteger(convertMinor(65_000, rate))).toBe(true)
    }
  })

  it('keeps zero at zero', () => {
    expect(convertMinor(0, 2050)).toBe(0)
  })
})
