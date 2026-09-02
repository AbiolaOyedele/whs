/**
 * Quote business logic. Routes are thin: they authenticate, hand the parsed
 * body in here, and format whatever comes back.
 */
import { AppError } from '@/lib/errors'
import { draftQuote, type AiProvider, type QuoteDraft } from '@/lib/ai'
import { currencyMeta } from './money'
import {
  decryptPin,
  encryptPin,
  generatePin,
  hashPin,
  isValidQuoteSlug,
  quoteSlug,
} from './quote-access'
import * as repo from './repositories/quotes'
import type { Quote } from '@/types/quote'
import type { SaveQuoteInput } from '@/lib/schemas/quotes'

/**
 * Creates a quote and returns the PIN in clear text.
 *
 * This is the only moment the PIN exists in readable form — only its hash is
 * stored, so it cannot be recovered later, only replaced. The UI must therefore
 * show it prominently and say so, otherwise the operator closes the dialog and
 * has to reissue a code the client may already have.
 */
export async function createQuote(
  input: { clientName: string; projectTitle: string; currency: string; slug?: string | undefined },
  userId: string
): Promise<{ id: string; slug: string; pin: string }> {
  const slug = input.slug ? input.slug.trim().toLowerCase() : quoteSlug(input.clientName)

  if (!isValidQuoteSlug(slug)) {
    throw new AppError(
      422,
      'That link can only use lowercase letters, numbers and hyphens.',
      'QUOTE_SLUG_INVALID'
    )
  }

  if (await repo.slugExists(slug)) {
    throw new AppError(
      409,
      'A quote already uses that link. Pick a different one.',
      'QUOTE_SLUG_TAKEN'
    )
  }

  const pin = generatePin()
  const id = await repo.createQuote({
    slug,
    pinHash: await hashPin(pin, slug),
    pinEncrypted: await encryptPin(pin),
    clientName: input.clientName,
    projectTitle: input.projectTitle,
    currency: input.currency,
    createdBy: userId,
  })

  return { id, slug, pin }
}

/**
 * Saves the whole quote: the record and all four child collections.
 *
 * Changing the slug re-hashes the PIN, because the slug is part of the digest.
 * Without this, renaming a quote would silently invalidate a code the client
 * already has — and there would be no way to tell from the data that it had
 * happened. The PIN itself is unchanged; only its hash moves.
 */
export async function saveQuote(id: string, input: SaveQuoteInput): Promise<Quote> {
  const existing = await repo.getQuoteById(id)
  if (!existing) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')

  const slug = input.slug.trim().toLowerCase()
  if (!isValidQuoteSlug(slug)) {
    throw new AppError(
      422,
      'That link can only use lowercase letters, numbers and hyphens.',
      'QUOTE_SLUG_INVALID'
    )
  }

  if (slug !== existing.slug && (await repo.slugExists(slug, id))) {
    throw new AppError(
      409,
      'A quote already uses that link. Pick a different one.',
      'QUOTE_SLUG_TAKEN'
    )
  }

  /*
   * A slug change re-derives the PIN digest, because the slug is inside it.
   * The ciphertext is keyed only by the pepper, so it does not need rewriting —
   * but the digest does, or the code we can still display would stop verifying.
   */
  const slugChanged = slug !== existing.slug
  const currentPin = slugChanged ? await revealPin(id) : null

  await repo.updateQuote(id, {
    slug,
    ...(slugChanged && currentPin ? { pinHash: await hashPin(currentPin, slug) } : {}),
    status: input.status,
    clientName: input.clientName,
    clientCompany: input.clientCompany,
    clientEmail: input.clientEmail,
    clientRole: input.clientRole,
    projectTitle: input.projectTitle,
    projectSummary: input.projectSummary,
    introNote: input.introNote,
    currency: input.currency,
    discountMinor: input.discountMinor,
    taxRateBp: input.taxRateBp,
    depositPercent: input.depositPercent,
    paymentTerms: input.paymentTerms,
    terms: input.terms,
    validUntil: input.validUntil,
    ...(input.status === 'sent' && !existing.sentAt ? { sentAt: new Date().toISOString() } : {}),
  })

  await repo.replaceQuoteChildren(id, {
    lineItems: input.lineItems.map((item, index) => ({ ...item, position: index })),
    phases: input.phases.map((phase, index) => ({ ...phase, position: index })),
    references: input.references.map((reference, index) => ({ ...reference, position: index })),
    images: input.images.map((image, index) => ({ ...image, position: index })),
  })

  const saved = await repo.getQuoteById(id)
  if (!saved)
    throw new AppError(500, 'The quote saved but could not be reloaded.', 'QUOTE_RELOAD_FAILED')
  return saved
}

/** Issues a fresh PIN, invalidating the old one. Returned in clear once. */
export async function regeneratePin(id: string): Promise<string> {
  const quote = await repo.getQuoteById(id)
  if (!quote) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')

  const pin = generatePin()
  await repo.updateQuote(id, {
    pinHash: await hashPin(pin, quote.slug),
    pinEncrypted: await encryptPin(pin),
  })
  return pin
}

/**
 * The current access code, in clear.
 *
 * Admin-only, and only ever reached from a route that has already checked the
 * session. Returns null for a quote created before codes were stored
 * recoverably, or if the pepper has been rotated since — in both cases the
 * only remedy is to issue a new code, which is what the UI offers.
 */
export async function revealPin(id: string): Promise<string | null> {
  return decryptPin(await repo.getQuotePinCipher(id))
}

/**
 * Applies an AI draft on top of an existing quote.
 *
 * The draft never touches the client's identity, the slug, the PIN or the
 * status — only the describable content and the prices. Those are the fields a
 * person is about to review. Letting a model rewrite who the quote is for, or
 * mark it as sent, would be handing it a decision it is not making.
 */
export async function applyDraft(
  quoteId: string,
  brief: string,
  provider: AiProvider,
  includeExisting: boolean
): Promise<{ draft: QuoteDraft; provider: AiProvider; model: string; assumptions: string[] }> {
  const quote = await repo.getQuoteById(quoteId)
  if (!quote) throw new AppError(404, 'That quote no longer exists.', 'QUOTE_NOT_FOUND')

  const result = await draftQuote(
    {
      clientName: quote.clientName,
      clientCompany: quote.clientCompany ?? undefined,
      currency: quote.currency,
      brief,
      existing: includeExisting ? summariseForModel(quote) : undefined,
    },
    provider
  )

  return {
    draft: result.draft,
    provider: result.provider,
    model: result.model,
    assumptions: result.draft.assumptions,
  }
}

/** Renders the current quote as plain text for the model to revise. */
function summariseForModel(quote: Quote): string {
  const exponent = currencyMeta(quote.currency).exponent
  const major = (minor: number): string => (minor / 10 ** exponent).toFixed(exponent)

  const lines = [
    `Title: ${quote.projectTitle}`,
    `Summary: ${quote.projectSummary || '(empty)'}`,
    '',
    'Line items:',
    ...(quote.lineItems.length > 0
      ? quote.lineItems.map(
          (item) =>
            `- ${item.title} | qty ${item.quantity} | ${major(item.unitPriceMinor)}${
              item.isOptional ? ' | optional' : ''
            }${item.description ? ` | ${item.description}` : ''}`
        )
      : ['(none)']),
    '',
    'Phases:',
    ...(quote.phases.length > 0
      ? quote.phases.map(
          (phase) =>
            `- ${phase.title} (${phase.durationLabel || 'no duration'}): ${phase.description}`
        )
      : ['(none)']),
  ]

  return lines.join('\n')
}

export {
  listQuotes,
  getQuoteById,
  getQuoteBySlug,
  listQuoteEvents,
  deleteQuote,
} from './repositories/quotes'
