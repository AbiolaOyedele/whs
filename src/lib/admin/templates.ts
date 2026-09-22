/**
 * Template business logic. Routes validate and authenticate, then call here.
 *
 * Most of the work is in `template-apply.ts`, which is pure so the browser can
 * run it too. What lives here is the part that needs the server: reading the
 * quote and the template, fetching an exchange rate, and writing the result.
 */
import { AppError } from '@/lib/errors'
import { fetchRate } from '@/lib/admin/fx'
import * as quotes from '@/lib/admin/repositories/quotes'
import { getQuoteTemplate } from '@/lib/admin/repositories/templates'
import { applyTemplateToQuote } from '@/lib/admin/template-apply'

export {
  deleteTemplateEntry,
  listTemplateLibrary,
  renameQuoteTemplate,
  saveItem,
  savePackage,
  saveQuoteTemplate,
  type TemplateKind,
} from '@/lib/admin/repositories/templates'

/**
 * Pours a quote template into an existing quote and saves it.
 *
 * Used when a quote is created from a template. The editor applies templates
 * in the browser instead, so the operator can look before saving; this is the
 * same transformation, written straight through because a brand-new quote has
 * nothing on it to lose.
 *
 * Converts at today's rate when the template was saved in another currency.
 */
export async function applyTemplateToSavedQuote(
  quoteId: string,
  templateId: string
): Promise<void> {
  const [quote, template] = await Promise.all([
    quotes.getQuoteById(quoteId),
    getQuoteTemplate(templateId),
  ])

  if (!quote) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')
  if (!template) {
    throw new AppError(404, 'That template no longer exists.', 'TEMPLATES_ENTRY_NOT_FOUND')
  }

  const rate =
    template.currency === quote.currency
      ? 1
      : (await fetchRate(template.currency, quote.currency)).rate

  const next = applyTemplateToQuote(quote, template, rate)

  await quotes.updateQuote(quoteId, {
    projectSummary: next.projectSummary,
    introNote: next.introNote,
    paymentTerms: next.paymentTerms,
    terms: next.terms,
    discountMinor: next.discountMinor,
    taxRateBp: next.taxRateBp,
    depositPercent: next.depositPercent,
  })

  await quotes.replaceQuoteChildren(quoteId, {
    lineItems: next.lineItems.map(({ id: _id, ...item }) => item),
    options: next.options,
    phases: next.phases.map(({ id: _id, ...phase }) => phase),
    references: next.references.map(({ id: _id, ...reference }) => reference),
    images: quote.images.map(({ id: _id, ...image }) => image),
  })
}
