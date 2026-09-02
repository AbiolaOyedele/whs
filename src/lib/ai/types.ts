/**
 * The contract every AI provider in this codebase implements.
 *
 * Deliberately narrow. The quote drafter needs one thing — a brief in, a
 * structured draft out — and keeping the interface at exactly that width is
 * what makes Claude and Gemini interchangeable at the call site, and what makes
 * adding a third provider a new file rather than an edit to five.
 */
import { z } from 'zod'

export const AI_PROVIDERS = ['claude', 'gemini'] as const
export type AiProvider = (typeof AI_PROVIDERS)[number]

/** Claude unless the operator picks otherwise, per the brief. */
export const DEFAULT_AI_PROVIDER: AiProvider = 'claude'

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  claude: 'Claude',
  gemini: 'Gemini',
}

/**
 * The shape a drafted quote comes back in.
 *
 * Every model output is parsed through this before it is allowed anywhere near
 * the editor. A language model asked for JSON usually returns JSON; "usually"
 * is not a contract, and an unvalidated draft would put arbitrary strings into
 * a document we send to a paying client.
 *
 * Prices are in MAJOR units here — the model reasons about "4200", not
 * "420000" — and are converted to minor units on arrival. Asking a model to do
 * currency-exponent arithmetic is inviting a factor-of-100 error into a price.
 */
export const quoteDraftSchema = z.object({
  projectTitle: z.string().min(1).max(200),
  projectSummary: z.string().min(1).max(4000),
  introNote: z.string().max(2000).default(''),
  lineItems: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).default(''),
        quantity: z.number().min(0).max(10_000).default(1),
        unitPrice: z.number().min(0).max(100_000_000),
        isOptional: z.boolean().default(false),
      })
    )
    .min(1)
    .max(40),
  phases: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).default(''),
        durationLabel: z.string().max(80).default(''),
        deliverables: z.array(z.string().max(300)).max(12).default([]),
      })
    )
    .max(20)
    .default([]),
  paymentTerms: z.string().max(2000).default(''),
  terms: z.string().max(8000).default(''),
  /**
   * Suggested commercial shape. Operator-facing defaults, not client-facing
   * copy — the editor pre-fills the fields and the operator adjusts.
   */
  suggestedDepositPercent: z.number().int().min(0).max(100).default(50),
  suggestedValidityDays: z.number().int().min(7).max(180).default(30),
  /** The model's own note to the operator. Never shown to the client. */
  assumptions: z.array(z.string().max(500)).max(12).default([]),
  /**
   * Specific things the model could not price without an answer.
   *
   * Distinct from `assumptions`, and the distinction is the point: an
   * assumption is a gap it filled and wants checked, a question is a gap it
   * could not fill at all. Left as one list, the blocking items drown in the
   * advisory ones, and the operator sends a quote with a hole in it.
   */
  questions: z.array(z.string().max(300)).max(8).default([]),
})

export type QuoteDraft = z.infer<typeof quoteDraftSchema>

export interface DraftContext {
  clientName: string
  clientCompany?: string | undefined
  currency: string
  /** Free-text conversation from the operator describing the engagement. */
  brief: string
  /** Existing quote content, when refining rather than starting fresh. */
  existing?: string | undefined
}

export interface DraftResult {
  draft: QuoteDraft
  provider: AiProvider
  model: string
}

/** What every provider module must export. */
export interface AiClient {
  readonly provider: AiProvider
  readonly model: string
  /** Returns raw JSON text conforming to `quoteDraftSchema`. */
  draftJson(systemPrompt: string, userPrompt: string): Promise<string>
}
