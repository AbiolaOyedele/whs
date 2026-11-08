import { VAT_BPS, type PricingPlan } from '@v2/content/pricing'

/**
 * Whole naira with en-NG grouping, e.g. 350000 kobo -> "₦3,500".
 * Grouped by hand so the server and every browser print the same string.
 */
export function formatNaira(kobo: number): string {
  const naira = Math.round(kobo / 100)
  const sign = naira < 0 ? '-' : ''
  return `${sign}₦${groupDigits(Math.abs(naira))}`
}

/** 1234567 -> "1,234,567". */
export function groupDigits(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** 300 basis points -> "3%". */
export function formatPercent(bps: number): string {
  return `${groupDigits(bps / 100)}%`
}

/** What paying for `months` at once costs: discount first, then VAT on what is left (as plans.ts quotePlan). */
export function quoteCycle(plan: PricingPlan, months: number, discountPercent: number) {
  const listKobo = plan.monthlyKobo * months
  const discountKobo = Math.round((listKobo * discountPercent) / 100)
  const subtotalKobo = listKobo - discountKobo
  const vatKobo = Math.round((subtotalKobo * VAT_BPS) / 10_000)
  return { listKobo, discountKobo, subtotalKobo, vatKobo, totalKobo: subtotalKobo + vatKobo }
}

export interface MonthlyCost {
  planKobo: number
  vatKobo: number
  feeKobo: number
  totalKobo: number
}

/** A plan's cost spread over one month, for a month of online sales. */
export function monthlyCost(plan: PricingPlan, months: number, discountPercent: number, salesKobo: number): MonthlyCost {
  const quote = quoteCycle(plan, months, discountPercent)
  const planKobo = quote.subtotalKobo / months
  const vatKobo = quote.vatKobo / months
  const feeKobo = (salesKobo * plan.feeBps) / 10_000
  return { planKobo, vatKobo, feeKobo, totalKobo: planKobo + vatKobo + feeKobo }
}
