/**
 * Templates: work an account sells often enough to save once and reuse.
 *
 * Three shapes, smallest first. Each is copied into a document when used and
 * never linked back to it, so editing a template cannot rewrite a quote or an
 * invoice a client has already been sent.
 */
import type {
  CurrencyCode,
  QuoteLineItem,
  QuoteOption,
  QuoteOptionPricing,
  QuotePhase,
  QuoteReference,
} from './quote'

/** One line of work, with its usual quantity and price. */
export interface SavedItem {
  id: string
  title: string
  description: string
  quantity: number
  unitPriceMinor: number
  currency: CurrencyCode
  createdAt: string
  updatedAt: string
}

/** A line inside a saved package. Same fields as a quote line, minus placement. */
export interface SavedLine {
  title: string
  description: string
  quantity: number
  unitPriceMinor: number
}

/** A named bundle of lines, sold line by line or at one price. */
export interface SavedPackage {
  id: string
  name: string
  description: string
  currency: CurrencyCode
  pricing: QuoteOptionPricing
  /** Read only when `pricing` is `fixed`, exactly as on a quote option. */
  fixedPriceMinor: number
  lines: SavedLine[]
  createdAt: string
  updatedAt: string
}

/**
 * The body of a quote without its client.
 *
 * Deliberately absent: who it is for, the project title, the link, status,
 * dates and images. Those belong to one engagement. Images are also left out
 * because each one is an upload tied to the quote it was added to.
 */
export interface QuoteTemplateBody {
  projectSummary: string
  introNote: string
  paymentTerms: string
  terms: string
  discountMinor: number
  taxRateBp: number
  depositPercent: number
  /** Options keep their own ids so the lines below can point at them. */
  options: Array<Omit<QuoteOption, 'position' | 'isSelected'>>
  lineItems: Array<Omit<QuoteLineItem, 'id' | 'position'>>
  phases: Array<Omit<QuotePhase, 'id' | 'position'>>
  references: Array<Omit<QuoteReference, 'id' | 'position'>>
}

export interface QuoteTemplate {
  id: string
  name: string
  description: string
  currency: CurrencyCode
  body: QuoteTemplateBody
  createdAt: string
  updatedAt: string
}

/** Everything the pickers need, loaded once per page. */
export interface TemplateLibrary {
  items: SavedItem[]
  packages: SavedPackage[]
  quoteTemplates: QuoteTemplate[]
}
