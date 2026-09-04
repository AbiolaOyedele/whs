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
import { CURRENCIES, type QuoteLineItem, type QuoteOption, type QuoteTotals } from '@/types/quote'

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
 * Whether a line item is charged right now.
 *
 * Exported because the total is not the only thing that has to agree with it:
 * the invoice lists the lines it is billing for, and a document whose lines and
 * whose total were filtered by two different rules is the bug this codebase has
 * already shipped once.
 *
 * Three cases, in order:
 *
 *  - Tied to an option: counts only while that option is selected. An item
 *    whose option has been deleted counts as unselected rather than base
 *    scope — the safe direction, since the alternative silently adds a charge.
 *  - Base scope and optional: the existing menu behaviour. Shown and priced,
 *    never charged until it is turned into a real item.
 *  - Base scope: always.
 */
export function isCharged(item: QuoteLineItem, options: readonly QuoteOption[]): boolean {
  if (item.optionId !== null) {
    return options.find((option) => option.id === item.optionId)?.isSelected === true
  }
  return !item.isOptional
}

/**
 * Whether this item's own price counts for anything.
 *
 * False for every item inside a fixed-price option. There the option carries
 * the money and the items are inclusions, so their stored unit prices are
 * inert: kept, so switching back to an itemised breakdown restores it, but
 * never summed, never displayed, and never sent to an invoice.
 */
export function itemCarriesMoney(item: QuoteLineItem, options: readonly QuoteOption[]): boolean {
  if (item.optionId === null) return true
  return options.find((option) => option.id === item.optionId)?.pricing !== 'fixed'
}

/**
 * What one option adds to the quote, in minor units.
 *
 * This is what the client compares across packages, so there is exactly one
 * function for it: the admin's package list, the client's package cards and the
 * invoice all call this, and a package cannot show one figure on the quote and
 * another on the bill.
 *
 * It replaced an `optionTotalMinor(optionId, lineItems)` that summed the items
 * and nothing else. That signature cannot answer the question any more, because
 * a fixed-price option's answer is not in its items, so it is gone rather than
 * left around to be called by mistake.
 */
export function optionPriceMinor(option: QuoteOption, lineItems: readonly QuoteLineItem[]): number {
  if (option.pricing === 'fixed') return Math.max(0, option.fixedPriceMinor)
  return lineItems
    .filter((item) => item.optionId === option.id)
    .reduce((sum, item) => sum + lineAmount(item), 0)
}

/**
 * Computes every derived figure on a quote.
 *
 * Order matters and is fixed: discount comes off before tax, tax applies to the
 * discounted subtotal, and the deposit is a percentage of the final total.
 * Anything not currently counted is summed separately into `optionalMinor` and
 * never reaches the total — it is a menu, not a charge.
 *
 * `options` is REQUIRED, deliberately. Making it optional would let a call site
 * forget it and quietly compute a total over every package at once, which is a
 * number that was never offered to anybody. A required field makes the compiler
 * list the call sites instead.
 */
export function computeTotals(input: {
  lineItems: readonly QuoteLineItem[]
  options: readonly QuoteOption[]
  discountMinor: number
  taxRateBp: number
  depositPercent: number
}): QuoteTotals {
  let subtotalMinor = 0
  let optionalMinor = 0

  for (const item of input.lineItems) {
    /* Items inside a fixed-price option are inclusions. The option's own price
       is added below; counting these too would charge the package twice. */
    if (!itemCarriesMoney(item, input.options)) continue

    const amount = lineAmount(item)
    if (isCharged(item, input.options)) subtotalMinor += amount
    else optionalMinor += amount
  }

  for (const option of input.options) {
    if (option.pricing !== 'fixed') continue
    const price = optionPriceMinor(option, input.lineItems)
    /* Same split as a line item: charged when picked, otherwise part of the
       menu figure, so `optionalMinor` still describes what is on offer. */
    if (option.isSelected) subtotalMinor += price
    else optionalMinor += price
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

/** One billable row. Shaped for an invoice, derived from the quote. */
export interface ChargedLine {
  title: string
  description: string
  quantity: number
  unitPriceMinor: number
  amountMinor: number
}

/**
 * The rows a bill for this quote should carry.
 *
 * Exists because a fixed-price package cannot be invoiced as its line items.
 * Those items have stored unit prices that deliberately do not count, so
 * listing them would produce a bill whose rows sum to something other than the
 * amount due. The package becomes ONE row instead, priced at what the client
 * was shown, with its inclusions named in the description so the bill still
 * says what was bought.
 *
 * Guaranteed by construction: the sum of `amountMinor` here equals
 * `computeTotals(...).subtotalMinor` for the same quote. There is a test that
 * says so, because that equality is the entire point of this function.
 */
export function chargedLines(
  lineItems: readonly QuoteLineItem[],
  options: readonly QuoteOption[]
): ChargedLine[] {
  const lines: ChargedLine[] = []

  /* Base scope first, in the operator's order, then each option. Anything
     inside a fixed option is skipped here and handled with the option. */
  for (const item of lineItems) {
    if (!isCharged(item, options)) continue
    if (!itemCarriesMoney(item, options)) continue
    lines.push({
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      amountMinor: lineAmount(item),
    })
  }

  for (const option of options) {
    if (option.pricing !== 'fixed' || !option.isSelected) continue

    const inclusions = lineItems
      .filter((item) => item.optionId === option.id)
      .map((item) => item.title)
      .filter((title) => title.length > 0)

    const amountMinor = optionPriceMinor(option, lineItems)
    lines.push({
      title: option.title,
      /* The option's own sentence, then what it covers. A bill for a
         four-figure package that says only "Standard" is not itemised enough
         for anyone to check. */
      description: [option.description, inclusions.join(', ')].filter(Boolean).join('\n'),
      quantity: 1,
      unitPriceMinor: amountMinor,
      amountMinor,
    })
  }

  return lines
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
export function formatMoney(
  minor: number,
  code: string,
  options?: { compact?: boolean; display?: 'symbol' | 'code' }
): string {
  const meta = currencyMeta(code)
  const major = minor / 10 ** meta.exponent

  /*
   * The number is formatted by Intl; the prefix comes from our own table.
   *
   * Intl's own currency display is wrong for us at both settings. The default
   * writes "NGN 41,931,125.12", long enough to wrap the summary rail on a
   * quote. `narrowSymbol` fixes that (₦41,931,125.12) but renders CAD and AUD
   * as a bare "$", indistinguishable from US dollars on a document quoting a
   * price. So: Intl for grouping and decimals, our own prefix for the rest.
   *
   * `display: 'code'` exists for the PDF. The subset brand fonts have no glyph
   * for ₦ (U+20A6), so the symbol rendered as an empty box on naira invoices
   * and vanished entirely in the display face. A PDF cannot fall back to
   * another font the way a browser can, so it uses the ISO code, which every
   * font here can draw and which reads correctly on a formal document.
   */
  const digits = options?.compact && Number.isInteger(major) ? 0 : meta.exponent

  const formatted = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: digits,
    maximumFractionDigits: meta.exponent,
  }).format(major)

  return options?.display === 'code' ? `${meta.code} ${formatted}` : `${meta.symbol}${formatted}`
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
