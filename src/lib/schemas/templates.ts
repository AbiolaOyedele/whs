/**
 * Validation for saved items, saved packages and quote templates.
 *
 * The limits match the quote's own, field for field, so anything saved from a
 * quote can go back into one without a second, stricter rule refusing it. The
 * quote schemas are reused rather than restated wherever the shape is the same.
 */
import { z } from 'zod'
import { CURRENCIES } from '@/types/quote'
import {
  lineItemSchema,
  phaseSchema,
  quoteOptionSchema,
  referenceSchema,
  saveQuoteSchema,
} from './quotes'

const currencyCodes = CURRENCIES.map((entry) => entry.code) as [string, ...string[]]

const priceMinor = z
  .number()
  .int('Prices are held in whole pence.')
  .min(0, 'A price cannot be negative.')
  .max(1_000_000_000_00, 'That price is too large.')

const quantity = z
  .number()
  .min(0, 'Quantity cannot be negative.')
  .max(10_000, 'That quantity is too large. Keep it under 10,000.')

const templateName = z
  .string()
  .trim()
  .min(1, 'Give it a name.')
  .max(120, 'Keep the name under 120 characters.')

const templateBlurb = z
  .string()
  .trim()
  .max(600, 'Keep the description under 600 characters.')
  .default('')

export const savedItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the item a name.')
    .max(200, 'Keep the name under 200 characters.'),
  description: z
    .string()
    .trim()
    .max(2000, 'Keep the description under 2,000 characters.')
    .default(''),
  quantity: quantity.default(1),
  unitPriceMinor: priceMinor,
  currency: z.enum(currencyCodes),
})

export type SavedItemInput = z.infer<typeof savedItemSchema>

export const savedLineSchema = z.object({
  title: z.string().trim().min(1, 'Every line needs a name.').max(200),
  description: z.string().trim().max(2000).default(''),
  quantity: quantity.default(1),
  unitPriceMinor: priceMinor.default(0),
})

export const savedPackageSchema = z.object({
  name: templateName,
  description: templateBlurb,
  currency: z.enum(currencyCodes),
  pricing: z.enum(['itemised', 'fixed']).default('itemised'),
  fixedPriceMinor: priceMinor.default(0),
  lines: z
    .array(savedLineSchema)
    .min(1, 'A package needs at least one line.')
    .max(30, 'A package can hold at most 30 lines.'),
})

export type SavedPackageInput = z.infer<typeof savedPackageSchema>

/*
 * The quote body, reusing the quote's own field rules.
 *
 * `isSelected` is not stored on a template option: which package the client
 * has ticked belongs to one quote. Using the template starts every option at
 * its default, exactly as a freshly sent quote does.
 */
const templateOptionSchema = quoteOptionSchema.omit({ isSelected: true })

const quoteFields = saveQuoteSchema.shape

export const quoteTemplateBodySchema = z
  .object({
    projectSummary: quoteFields.projectSummary,
    introNote: quoteFields.introNote,
    paymentTerms: quoteFields.paymentTerms,
    terms: quoteFields.terms,
    discountMinor: quoteFields.discountMinor,
    taxRateBp: quoteFields.taxRateBp,
    depositPercent: quoteFields.depositPercent,
    options: z
      .array(templateOptionSchema)
      .max(8, 'A template can offer at most 8 options.')
      .default([]),
    lineItems: z.array(lineItemSchema).max(40, 'A template can hold at most 40 lines.'),
    phases: z.array(phaseSchema).max(20, 'A template can hold at most 20 phases.').default([]),
    references: z
      .array(referenceSchema)
      .max(20, 'A template can hold at most 20 links.')
      .default([]),
  })
  /* A line pointing at an option that is not in the template would be dropped
     on use, silently losing priced work. Refuse it at the door instead. */
  .refine(
    (body) => {
      const ids = new Set(body.options.map((option) => option.id))
      return body.lineItems.every((item) => item.optionId === null || ids.has(item.optionId))
    },
    { message: 'A line points at a package that is not in the template.', path: ['lineItems'] }
  )

export const quoteTemplateSchema = z.object({
  name: templateName,
  description: templateBlurb,
  currency: z.enum(currencyCodes),
  body: quoteTemplateBodySchema,
})

export type QuoteTemplateInput = z.infer<typeof quoteTemplateSchema>

/** Renaming a template. Its body is replaced only by saving a quote over it. */
export const quoteTemplateMetaSchema = z.object({
  name: templateName,
  description: templateBlurb,
})

export type QuoteTemplateMetaInput = z.infer<typeof quoteTemplateMetaSchema>
