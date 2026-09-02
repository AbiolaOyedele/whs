/**
 * Money formatting and quote arithmetic.
 *
 * Every amount in this codebase is an integer number of minor units — pence,
 * kobo, cents. No price is ever a float. `0.1 + 0.2` is the reason: a quote
 * that adds up to £1,249.99 in the admin and £1,250.00 on the client's copy is
 * a commercial problem, not a rounding curiosity.
 *
 * The one place a fraction legitimately appears is quantity (2.5 days), so
 * `lineAmount` is the single function permitted to round, and it rounds half
 * away from zero — the behaviour a person doing this on paper would expect.
 */
import { CURRENCIES, type QuoteLineItem, type QuoteTotals } from '@/types/quote'

const FALLBACK = CURRENCIES[0]

/** Currency metadata, falling back to GBP for an unrecognised code. */
export function currencyMeta(code: string): (typeof CURRENCIES)[number] {
  return CURRENCIES.find((entry) => entry.code === code) ?? FALLBACK
}

/** Rounds half away from zero, unlike Math.round which rounds half up. */
function roundHalfAway(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value)
}

/** Amount for one line, in minor units. The only rounding in the pipeline. */
export function lineAmount(item: Pick<QuoteLineItem, 'quantity' | 'unitPriceMinor'>): number {
  return roundHalfAway(item.quantity * item.unitPriceMinor)
}

/**
 * Computes every derived figure on a quote.
 *
 * Order matters and is fixed: discount comes off before tax, tax applies to the
 * discounted subtotal, and the deposit is a percentage of the final total.
 * Optional items are summed separately and never reach the total — they are a
 * menu, not a charge.
 */
export function computeTotals(input: {
  lineItems: readonly QuoteLineItem[]
  discountMinor: number
  taxRateBp: number
  depositPercent: number
}): QuoteTotals {
  let subtotalMinor = 0
  let optionalMinor = 0

  for (const item of input.lineItems) {
    const amount = lineAmount(item)
    if (item.isOptional) optionalMinor += amount
    else subtotalMinor += amount
  }

  // A discount can never exceed the subtotal, or the total goes negative and
  // the client sees us owing them money.
  const discountMinor = Math.min(Math.max(input.discountMinor, 0), subtotalMinor)
  const taxableMinor = subtotalMinor - discountMinor
  const taxMinor = roundHalfAway((taxableMinor * input.taxRateBp) / 10_000)
  const totalMinor = taxableMinor + taxMinor
  const depositMinor = roundHalfAway((totalMinor * input.depositPercent) / 100)

  return {
    subtotalMinor,
    optionalMinor,
    discountMinor,
    taxableMinor,
    taxMinor,
    totalMinor,
    depositMinor,
    balanceMinor: totalMinor - depositMinor,
  }
}

/**
 * Formats minor units as a currency string.
 *
 * `Intl.NumberFormat` handles grouping and symbol placement per locale, which
 * matters the moment a quote goes out in euros. en-GB is fixed rather than
 * taken from the viewer: the client and the operator must read the same number
 * the same way, and a German client reading "1.250,00" where we wrote "1,250.00"
 * is a factor-of-a-thousand misunderstanding waiting to happen.
 */
export function formatMoney(minor: number, code: string, options?: { compact?: boolean }): string {
  const meta = currencyMeta(code)
  const major = minor / 10 ** meta.exponent

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: meta.code,
    minimumFractionDigits: options?.compact && Number.isInteger(major) ? 0 : meta.exponent,
    maximumFractionDigits: meta.exponent,
  }).format(major)
}

/** Parses a typed amount ("1,250.50", "£1250.5") into minor units. */
export function parseMoney(input: string, code: string): number | null {
  const meta = currencyMeta(code)
  const cleaned = input.replace(/[^0-9.-]/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null

  const value = Number(cleaned)
  if (!Number.isFinite(value)) return null

  return roundHalfAway(value * 10 ** meta.exponent)
}

/** Basis points as a display percentage: 1750 → "17.5%". */
export function formatBasisPoints(bp: number): string {
  const percent = bp / 100
  return `${Number.isInteger(percent) ? percent : percent.toFixed(2).replace(/0$/, '')}%`
}
