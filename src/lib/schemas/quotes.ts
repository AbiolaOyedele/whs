/**
 * Validation for everything the quote admin accepts.
 *
 * These schemas are the trust boundary. The editor is our own React code, but
 * it is still a browser, and every field below arrives over HTTP from something
 * we do not control. Nothing here assumes the client validated first.
 */
import { z } from 'zod'
import { AI_PROVIDERS } from '@/lib/ai/types'
import { CURRENCIES, QUOTE_STATUSES } from '@/types/quote'

const currencyCodes = CURRENCIES.map((entry) => entry.code) as [string, ...string[]]

/** Trimmed, and empty becomes undefined rather than an empty-string row. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()

export const createQuoteSchema = z.object({
  clientName: z.string().trim().min(1, 'Give the client a name.').max(120),
  projectTitle: z.string().trim().min(1, 'Give the project a title.').max(200),
  currency: z.enum(currencyCodes).default('GBP'),
  /** Optional override; derived from the client name when absent. */
  slug: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
})

export const lineItemSchema = z.object({
  title: z.string().trim().min(1, 'Every line needs a title.').max(200),
  description: z.string().trim().max(2000).default(''),
  quantity: z
    .number()
    .min(0, 'Quantity cannot be negative.')
    .max(10_000, 'That quantity is too large. Keep it under 10,000.'),
  unitPriceMinor: z
    .number()
    .int('Prices are held in whole pence.')
    .min(0, 'A price cannot be negative.')
    .max(1_000_000_000_00, 'That price is too large.'),
  isOptional: z.boolean().default(false),
})

export const phaseSchema = z.object({
  title: z.string().trim().min(1, 'Every phase needs a title.').max(200),
  description: z
    .string()
    .trim()
    .max(2000, 'Keep the description under 2,000 characters.')
    .default(''),
  durationLabel: z.string().trim().max(80, 'Keep the duration short, like "2 weeks".').default(''),
  deliverables: z
    .array(z.string().trim().max(300, 'Keep each deliverable under 300 characters.'))
    .max(12, 'Twelve deliverables is the most a phase can list.')
    .default([]),
})

/**
 * Reference links are rendered as anchors on a page we send to a client, so the
 * scheme allowlist is not decoration: without it, `javascript:` in this field is
 * stored cross-site scripting on the client-facing quote.
 */
export const referenceSchema = z.object({
  label: z.string().trim().min(1, 'Give the link a label.').max(200),
  url: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => /^https?:\/\//i.test(value), 'Links must start with http:// or https://'),
  description: z.string().trim().max(1000).default(''),
})

export const imageSchema = z.object({
  url: z.string().trim().max(2048),
  publicId: z.string().trim().max(400),
  caption: z.string().trim().max(500).default(''),
  width: z.number().int().positive().nullable().default(null),
  height: z.number().int().positive().nullable().default(null),
})

export const saveQuoteSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'The link ending needs at least two characters.')
    .max(80, 'The link ending is too long.'),
  status: z.enum(QUOTE_STATUSES),
  clientName: z.string().trim().min(1, 'Give the client a name.').max(120),
  clientCompany: optionalText(160),
  clientEmail: z
    .string()
    .trim()
    .max(254)
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'That email looks wrong.'
    )
    .transform((value) => (value.length === 0 ? null : value))
    .nullable(),
  clientRole: optionalText(120),
  projectTitle: z.string().trim().min(1, 'Give the project a title.').max(200),
  projectSummary: z
    .string()
    .trim()
    .max(4000, 'The summary is too long. Keep it under 4,000 characters.')
    .default(''),
  introNote: z
    .string()
    .trim()
    .max(2000, 'The opening note is too long. Keep it under 2,000 characters.')
    .default(''),
  currency: z.enum(currencyCodes),
  discountMinor: z
    .number()
    .int('Enter the discount as a normal amount.')
    .min(0, 'A discount cannot be negative.')
    .max(1_000_000_000_00, 'That discount is too large.')
    .default(0),
  /* Basis points: 10,000 = 100%. The editor shows a percentage and converts,
     so the message has to talk in percent or it is meaningless to the reader. */
  taxRateBp: z
    .number()
    .int('Enter the tax rate as a percentage, like 20 or 7.5.')
    .min(0, 'A tax rate cannot be negative.')
    .max(10_000, 'A tax rate cannot be more than 100%.')
    .default(0),
  depositPercent: z
    .number()
    .int('Enter the deposit as a whole percentage.')
    .min(0, 'A deposit cannot be negative.')
    .max(100, 'A deposit cannot be more than 100%.')
    .default(50),
  paymentTerms: z
    .string()
    .trim()
    .max(2000, 'Payment terms are too long. Keep them under 2,000 characters.')
    .default(''),
  terms: z
    .string()
    .trim()
    .max(8000, 'Terms are too long. Keep them under 8,000 characters.')
    .default(''),
  validUntil: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a real date.')
    .nullable()
    .or(z.literal('').transform(() => null)),
  lineItems: z.array(lineItemSchema).max(40, 'A quote can hold at most 40 lines.'),
  phases: z.array(phaseSchema).max(20, 'A quote can hold at most 20 phases.'),
  references: z.array(referenceSchema).max(20, 'A quote can hold at most 20 links.'),
  images: z.array(imageSchema).max(20, 'A quote can hold at most 20 images.'),
})

export type SaveQuoteInput = z.infer<typeof saveQuoteSchema>

export const draftRequestSchema = z.object({
  quoteId: z.uuid(),
  brief: z.string().trim().min(20, 'Tell the drafter a bit more about the project.').max(8000),
  provider: z.enum(AI_PROVIDERS).default('claude'),
  /** Feed the current quote back in so the model revises rather than restarts. */
  includeExisting: z.boolean().default(true),
})

/** The client-facing PIN gate. */
export const quoteAccessSchema = z.object({
  pin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'The code is six digits.'),
})

export const quoteDecisionSchema = z.object({
  decision: z.enum(['accepted', 'declined']),
  note: z.string().trim().max(2000).default(''),
})
