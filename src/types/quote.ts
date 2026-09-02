/**
 * Quote domain types.
 *
 * Money is carried as `*_minor` integers — pence, kobo, cents — everywhere:
 * database, API, and UI state. Nothing multiplies or sums a float. Conversion
 * to a display string happens once, at the edge, in lib/admin/money.ts.
 */

export const QUOTE_STATUSES = [
  'draft',
  'sent',
  'viewed',
  'accepted',
  'declined',
  'expired',
] as const

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

/** Labels and tone for each status, used by the badge and the filter bar. */
export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
}

/** Currencies the quote builder offers. Minor-unit exponent included. */
export const CURRENCIES = [
  { code: 'GBP', symbol: '£', label: 'Pound sterling', exponent: 2 },
  { code: 'USD', symbol: '$', label: 'US dollar', exponent: 2 },
  { code: 'EUR', symbol: '€', label: 'Euro', exponent: 2 },
  { code: 'NGN', symbol: '₦', label: 'Nigerian naira', exponent: 2 },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian dollar', exponent: 2 },
  { code: 'AUD', symbol: 'A$', label: 'Australian dollar', exponent: 2 },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

export interface QuoteLineItem {
  id: string
  position: number
  title: string
  description: string
  quantity: number
  unitPriceMinor: number
  /** Priced and shown, but excluded from the total until the client picks it. */
  isOptional: boolean
}

export interface QuotePhase {
  id: string
  position: number
  title: string
  description: string
  durationLabel: string
  deliverables: string[]
}

export interface QuoteReference {
  id: string
  position: number
  label: string
  url: string
  description: string
}

export interface QuoteImage {
  id: string
  position: number
  url: string
  publicId: string
  caption: string
  width: number | null
  height: number | null
}

export interface QuoteEvent {
  id: string
  type: 'viewed' | 'pin_failed' | 'accepted' | 'declined' | 'downloaded'
  createdAt: string
  userAgent: string | null
}

/** A quote as the admin list renders it — no children, no heavy fields. */
export interface QuoteSummary {
  id: string
  slug: string
  status: QuoteStatus
  clientName: string
  clientCompany: string | null
  projectTitle: string
  currency: CurrencyCode
  totalMinor: number
  validUntil: string | null
  createdAt: string
  updatedAt: string
  sentAt: string | null
  firstViewedAt: string | null
  lastViewedAt: string | null
  viewCount: number
}

/** A quote in full, as the editor and the client-facing page render it. */
export interface Quote extends QuoteSummary {
  clientEmail: string | null
  clientRole: string | null
  projectSummary: string
  introNote: string
  discountMinor: number
  /** Basis points: 2000 = 20%. Integer maths only. */
  taxRateBp: number
  depositPercent: number
  paymentTerms: string
  terms: string
  decisionNote: string | null
  decidedAt: string | null
  lineItems: QuoteLineItem[]
  phases: QuotePhase[]
  references: QuoteReference[]
  images: QuoteImage[]
}

/** Everything the client-facing page needs. Deliberately omits internals. */
export type ClientQuote = Omit<Quote, 'decisionNote' | 'viewCount' | 'updatedAt'>

/** Computed money for a quote. Every field is minor units. */
export interface QuoteTotals {
  subtotalMinor: number
  optionalMinor: number
  discountMinor: number
  taxableMinor: number
  taxMinor: number
  totalMinor: number
  depositMinor: number
  balanceMinor: number
}

/** A run of identical consecutive events, folded into one row. */
export interface CollapsedEvent {
  type: QuoteEvent['type']
  count: number
  /** Earliest moment in the run. */
  firstAt: string
  /** Latest moment in the run. */
  lastAt: string
}
