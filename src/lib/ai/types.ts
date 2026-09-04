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

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  claude: 'Claude',
  gemini: 'Gemini',
}

/**
 * The models the operator can pick between.
 *
 * The selectable unit is a MODEL, not a provider. It used to be a provider,
 * with the actual model pinned by an environment variable, which meant
 * choosing between Haiku and Sonnet for a particular job took a redeploy. The
 * choice belongs to whoever is looking at the brief: a two-line job off a known
 * day rate does not need the same model as a messy brief with no rate in it.
 *
 * `blurb` is written for that decision and shows under the picker. It says what
 * the model is good for, not what it is.
 */
export const AI_MODELS = [
  {
    id: 'haiku',
    provider: 'claude',
    model: 'claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    blurb: 'Fastest and cheapest. Enough for a clear brief with a rate in it.',
  },
  {
    id: 'sonnet',
    provider: 'claude',
    model: 'claude-sonnet-5',
    label: 'Claude Sonnet 5',
    blurb: 'Slower and dearer. Better at a vague brief, tiers, and judging scope.',
  },
  {
    id: 'gemini',
    provider: 'gemini',
    model: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
    blurb: 'A second opinion when a Claude draft reads wrong.',
  },
] as const satisfies ReadonlyArray<{
  id: string
  provider: AiProvider
  model: string
  label: string
  blurb: string
}>

export type AiModelId = (typeof AI_MODELS)[number]['id']
export type AiModelChoice = (typeof AI_MODELS)[number]

export const AI_MODEL_IDS = AI_MODELS.map((entry) => entry.id) as [AiModelId, ...AiModelId[]]

/** Cheapest that does the job, so the expensive choice is always deliberate. */
export const DEFAULT_AI_MODEL: AiModelId = 'haiku'

export function findModel(id: AiModelId): AiModelChoice {
  const found = AI_MODELS.find((entry) => entry.id === id)
  /* Unreachable through the schema, which only accepts catalogue ids. Kept
     because a bad id must not silently become a different model than asked
     for: the panel reports which model wrote the draft. */
  if (!found) throw new Error(`Unknown model id: ${id}`)
  return found
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
        /**
         * Which option this line belongs to, matched by KEY against `options`
         * below. Null means base scope — charged whatever the client picks.
         *
         * A key rather than an id: the editor and the database mint ids after
         * the fact, so the model refers to its own options by a stable label.
         * An unknown key is treated as base scope on arrival: safer than
         * dropping the line, safer than inventing a phantom option.
         */
        optionKey: z.string().trim().max(64).nullable().default(null),
      })
    )
    .min(1)
    .max(40),
  /**
   * Packages the client picks between, and add-ons they tick.
   *
   * Empty when the brief is one fixed scope. When present, each option's price
   * is the sum of the line items whose `optionKey` matches — the model does
   * not write prices here directly, so there is one place for money and no way
   * for the card and the invoice to disagree.
   */
  options: z
    .array(
      z.object({
        key: z.string().trim().min(1).max(64),
        kind: z.enum(['package', 'addon']),
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().max(600).default(''),
        /** Pre-tick this option for the client. At most one package. */
        isDefault: z.boolean().default(false),
        /**
         * One price for the whole option, in major units.
         *
         * Zero, the default, means price it from its line items instead. Set
         * only when the brief asks for a package sold at a single figure, in
         * which case the items under it are inclusions and their own prices are
         * ignored.
         */
        fixedPrice: z.number().min(0).max(100_000_000).default(0),
      })
    )
    .max(8)
    .default([])
    /* At most one default package, for the same reason the database refuses
       two selected packages: both sets of line items would enter the total. */
    .refine(
      (options) => options.filter((o) => o.kind === 'package' && o.isDefault).length <= 1,
      'Only one package can be pre-selected.'
    ),
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
  /** The model that actually answered, after any environment override. */
  model: string
  label: string
}

/** What every provider module must export. */
export interface AiClient {
  readonly provider: AiProvider
  readonly model: string
  /**
   * Returns raw JSON text conforming to `quoteDraftSchema`.
   *
   * `signal` aborts the call. A provider that never answers would otherwise
   * hold the request, the serverless function and the operator's screen open
   * until the platform's own timeout kills it with no message.
   */
  draftJson(systemPrompt: string, userPrompt: string, signal: AbortSignal): Promise<string>
}
