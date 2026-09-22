/**
 * Turning templates into quote and invoice content, and quotes into templates.
 *
 * Pure functions, no I/O: the quote editor, the invoice form and the server all
 * run them, so they must not import anything that only exists on one side.
 *
 * Every function takes a `rate`. It is 1 when the template and the document
 * share a currency, and otherwise today's rate from the template's currency to
 * the document's, fetched by the caller. Applied once, on the way in: the copy
 * is an ordinary set of figures from then on, never re-priced.
 */
import { convertMinor } from '@/lib/admin/fx'
import type { Quote, QuoteLineItem, QuoteOption } from '@/types/quote'
import type {
  QuoteTemplate,
  QuoteTemplateBody,
  SavedItem,
  SavedLine,
  SavedPackage,
} from '@/types/templates'

/** A quote line before the editor gives it an id and a position. */
export type NewLine = Omit<QuoteLineItem, 'id' | 'position'>

/** An invoice line as the invoice form holds it: text fields, major units. */
export interface InvoiceLine {
  title: string
  description: string
  quantity: string
  rate: string
}

/** What a package becomes on a quote's Packages tab: one option and its lines. */
export interface PackageAsOption {
  option: Omit<QuoteOption, 'id' | 'position'>
  /** `optionId` is null here; the caller points each line at the new option. */
  lines: NewLine[]
}

const INVOICE_DESCRIPTION_MAX = 500

/** A saved item as a base-scope quote line. */
export function itemToLine(item: SavedItem, rate: number): NewLine {
  return {
    title: item.title,
    description: item.description,
    quantity: item.quantity,
    unitPriceMinor: convertMinor(item.unitPriceMinor, rate),
    isOptional: false,
    optionId: null,
  }
}

/** "Includes: Logo, Palette, Type." Appended to a fixed-price package's line. */
function inclusionsSentence(lines: readonly SavedLine[]): string {
  const titles = lines.map((line) => line.title.trim()).filter(Boolean)
  return titles.length > 0 ? `Includes: ${titles.join(', ')}.` : ''
}

/**
 * A package as base-scope lines, for a quote's cost breakdown or an invoice.
 *
 * Itemised, it is its own lines. At a fixed price it is ONE line carrying that
 * price, with the inclusions written into the description: base scope has no
 * notion of "these lines are covered by one figure", so spreading the price
 * across them would invent per-line prices nobody set.
 */
export function packageToLines(pkg: SavedPackage, rate: number): NewLine[] {
  if (pkg.pricing === 'fixed') {
    return [
      {
        title: pkg.name,
        description: [pkg.description.trim(), inclusionsSentence(pkg.lines)]
          .filter(Boolean)
          .join(' '),
        quantity: 1,
        unitPriceMinor: convertMinor(pkg.fixedPriceMinor, rate),
        isOptional: false,
        optionId: null,
      },
    ]
  }

  return pkg.lines.map((line) => ({
    title: line.title,
    description: line.description,
    quantity: line.quantity,
    unitPriceMinor: convertMinor(line.unitPriceMinor, rate),
    isOptional: false,
    optionId: null,
  }))
}

/**
 * A package as a pick-one option on the quote, with its lines inside it.
 *
 * Not selected and not the default: adding a package to a quote that already
 * offers others must not quietly change which one the client sees pre-ticked.
 */
export function packageToOption(pkg: SavedPackage, rate: number): PackageAsOption {
  const fixed = pkg.pricing === 'fixed'
  return {
    option: {
      kind: 'package',
      title: pkg.name,
      description: pkg.description,
      isSelected: false,
      isDefault: false,
      pricing: pkg.pricing,
      fixedPriceMinor: fixed ? convertMinor(pkg.fixedPriceMinor, rate) : 0,
    },
    lines: pkg.lines.map((line) => ({
      title: line.title,
      description: line.description,
      quantity: line.quantity,
      /* Under a fixed price the lines are inclusions and carry no money of
         their own, exactly as the editor treats them. */
      unitPriceMinor: fixed ? 0 : convertMinor(line.unitPriceMinor, rate),
      isOptional: false,
      optionId: null,
    })),
  }
}

/** Minor units to the plain decimal string the invoice form's rate field takes. */
export function minorToDecimal(minor: number, exponent = 2): string {
  const scale = 10 ** exponent
  const whole = Math.floor(minor / scale)
  const fraction = minor % scale
  return exponent === 0 ? String(whole) : `${whole}.${String(fraction).padStart(exponent, '0')}`
}

/**
 * Quote lines as invoice rows.
 *
 * Invoice descriptions are capped shorter than quote ones, so a long one is
 * cut at a word boundary with an ellipsis rather than refused by the form
 * after the operator has already pressed Create.
 */
export function linesToInvoiceLines(lines: readonly NewLine[], exponent = 2): InvoiceLine[] {
  return lines.map((line) => ({
    title: line.title.slice(0, 200),
    description: clip(line.description, INVOICE_DESCRIPTION_MAX),
    quantity: String(line.quantity),
    rate: minorToDecimal(line.unitPriceMinor, exponent),
  }))
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`
}

/**
 * The reusable part of a quote.
 *
 * Rows the operator left untitled are skipped: they are unfinished, the quote
 * itself would refuse to save them, and a template that cannot be applied is
 * worse than one missing a blank row. Lines under a skipped option go with it,
 * rather than being promoted into base scope and charged.
 */
export function quoteToTemplateBody(quote: Quote): QuoteTemplateBody {
  const options = quote.options.filter((option) => option.title.trim())
  const kept = new Set(options.map((option) => option.id))

  return {
    projectSummary: quote.projectSummary,
    introNote: quote.introNote,
    paymentTerms: quote.paymentTerms,
    terms: quote.terms,
    discountMinor: quote.discountMinor,
    taxRateBp: quote.taxRateBp,
    depositPercent: quote.depositPercent,
    options: options.map((option) => ({
      id: option.id,
      kind: option.kind,
      title: option.title,
      description: option.description,
      isDefault: option.isDefault,
      pricing: option.pricing,
      fixedPriceMinor: option.fixedPriceMinor,
    })),
    lineItems: quote.lineItems
      .filter((item) => item.title.trim())
      .filter((item) => item.optionId === null || kept.has(item.optionId))
      .map((item) => ({
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        isOptional: item.isOptional,
        optionId: item.optionId,
      })),
    phases: quote.phases
      .filter((phase) => phase.title.trim())
      .map((phase) => ({
        title: phase.title,
        description: phase.description,
        durationLabel: phase.durationLabel,
        deliverables: phase.deliverables.filter((entry) => entry.trim()),
      })),
    references: quote.references
      .filter((reference) => reference.label.trim() && reference.url.trim())
      .map((reference) => ({
        label: reference.label,
        url: reference.url,
        description: reference.description,
      })),
  }
}

/**
 * A quote with a template's body poured into it.
 *
 * Kept: who it is for, the project title, the link, status, dates, images and
 * currency. Replaced: everything the template holds. Every row gets a fresh
 * temporary id, which the save remaps to database ids the same way it does for
 * an AI draft; options first, so lines can point at them.
 *
 * Empty template text never blanks a field the quote already has: a template
 * saved without terms should not wipe the terms off the quote it is used on.
 */
export function applyTemplateToQuote(quote: Quote, template: QuoteTemplate, rate: number): Quote {
  const { body } = template
  const optionIds = new Map(body.options.map((option, index) => [option.id, `tpl-option-${index}`]))

  return {
    ...quote,
    projectSummary: body.projectSummary || quote.projectSummary,
    introNote: body.introNote || quote.introNote,
    paymentTerms: body.paymentTerms || quote.paymentTerms,
    terms: body.terms || quote.terms,
    discountMinor: convertMinor(body.discountMinor, rate),
    taxRateBp: body.taxRateBp,
    depositPercent: body.depositPercent,
    options: body.options.map((option, index) => ({
      id: optionIds.get(option.id) ?? `tpl-option-${index}`,
      position: index,
      kind: option.kind,
      title: option.title,
      description: option.description,
      /* What we recommend is what the client sees ticked, as on a new quote. */
      isSelected: option.isDefault,
      isDefault: option.isDefault,
      pricing: option.pricing,
      fixedPriceMinor: convertMinor(option.fixedPriceMinor, rate),
    })),
    lineItems: body.lineItems
      /* The schema refuses dangling option ids on the way in; this is the same
         rule on the way out, for a row written before that check existed. */
      .filter((item) => item.optionId === null || optionIds.has(item.optionId))
      .map((item, index) => ({
        id: `tpl-line-${index}`,
        position: index,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unitPriceMinor: convertMinor(item.unitPriceMinor, rate),
        isOptional: item.isOptional,
        optionId: item.optionId === null ? null : (optionIds.get(item.optionId) ?? null),
      })),
    phases: body.phases.map((phase, index) => ({
      id: `tpl-phase-${index}`,
      position: index,
      ...phase,
    })),
    references: body.references.map((reference, index) => ({
      id: `tpl-reference-${index}`,
      position: index,
      ...reference,
    })),
  }
}

/** How much a template holds, for a one-line summary in a list. */
export function describeTemplate(body: QuoteTemplateBody): string {
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
  return [
    count(body.lineItems.length, 'line', 'lines'),
    body.options.length > 0 ? count(body.options.length, 'option', 'options') : null,
    body.phases.length > 0 ? count(body.phases.length, 'phase', 'phases') : null,
  ]
    .filter(Boolean)
    .join(' · ')
}
