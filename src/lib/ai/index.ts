/**
 * The quote drafter — the one place that turns a conversation about a job into
 * a structured draft.
 *
 * Provider selection happens here and nowhere else, so the API route, the UI
 * and the tests all stay ignorant of which model ran. Claude is the default;
 * Gemini is a per-request choice.
 *
 * A drafted quote is never sent anywhere. It lands in the editor as unsaved
 * fields for the operator to correct, price and approve. That is deliberate:
 * a model's guess at what a project costs is a starting point for a person who
 * knows, not an output to be forwarded to a client.
 */
import { adminEnv } from '@/config/env'
import { AppError } from '@/lib/errors'
import { claudeClient } from './claude'
import { geminiClient } from './gemini'
import {
  AI_MODELS,
  DEFAULT_AI_MODEL,
  findModel,
  quoteDraftSchema,
  type AiClient,
  type AiModelChoice,
  type AiModelId,
  type DraftContext,
  type DraftResult,
} from './types'
import { isTransient } from './provider-errors'

export * from './types'
export { isTransient, toProviderError } from './provider-errors'

/** Which models are actually callable, given the keys present. Drives the picker. */
export function availableModels(): AiModelChoice[] {
  const env = adminEnv()
  return AI_MODELS.filter((entry) =>
    entry.provider === 'gemini' ? Boolean(env.GEMINI_API_KEY) : Boolean(env.ANTHROPIC_API_KEY)
  )
}

function clientFor(choice: AiModelChoice): AiClient {
  return choice.provider === 'gemini' ? geminiClient(choice.model) : claudeClient(choice.model)
}

/**
 * The system prompt.
 *
 * Two instructions in here are load-bearing and should not be softened:
 *
 *  - never invent a number the brief does not support. A quote is a commercial
 *    document. A confidently hallucinated day rate that reaches a client is
 *    worse than an empty field, because an empty field gets noticed.
 *  - put anything uncertain in `assumptions`, which the operator sees and the
 *    client never does. That gives the model somewhere honest to put doubt
 *    instead of resolving it silently into the price.
 */
const SYSTEM_PROMPT = `You are drafting a project quote for WildHands, a studio that designs and builds custom websites, apps and internal tools for teams doing repetitive work by hand.

House style:
- Plain English. Short sentences. No marketing throat-clearing, no superlatives, no "cutting-edge" or "bespoke solutions".
- Never use an em dash or an en dash, anywhere, including inside a range. Use a colon, a comma, parentheses, or two sentences. For a range write "6 to 9 weeks", never "6-9 weeks" with a dash character.
- Address the client directly as "you". Refer to the studio as "we".
- Describe outcomes in terms of the client's time and effort saved, not technology.

Pricing rules, in order of importance:
1. Never invent a figure the brief does not support. If the brief gives no rate, no budget and no comparable, set unitPrice to 0 and say so in assumptions. A zero the operator must fill in is safe. A plausible guess that reaches a client is not.
2. Break the work into line items that a client could actually query: a named piece of work, what it includes, what it costs. Avoid a single undifferentiated "development" line.
3. Prices are in major currency units (e.g. 4200 means 4,200), not minor units.

Packages and add-ons. Use these when the brief calls for tiers or genuinely optional scope:
- A PACKAGE is one of several mutually exclusive scopes the client picks between (Essential / Standard / Premium, or something specific to the job). Mark ONE as isDefault: the one you recommend.
- An ADD-ON is scope the client ticks independently (a care plan, an SMS layer). Do not mark add-ons as isDefault unless the brief clearly asks for them.
- Every line item goes SOMEWHERE. Work included on every version of the quote belongs in BASE SCOPE (optionKey: null). Work that only counts if the client picks a particular package or add-on carries that option's key.
- By default the option's price is the sum of its items, and you leave fixedPrice at 0. Write a one-sentence description covering what makes it different from the others.
- If the brief asks for a package sold at ONE price ("a flat 12k", "one figure, don't itemise it"), set that option's fixedPrice to the whole amount in major units. Its line items then become a list of what is included, so give each one a title and description and leave unitPrice at 0. Do not do this unless the brief asks: itemised is the default because it shows the client where the money goes.
- No packages when the brief is one fixed scope. isOptional (on base-scope items) is for a single menu item, not a whole tier: a tier is a package.
- Option keys are your own labels ("essential", "care-plan") and must match the key on every line item that belongs to that option. An item pointing at an unknown key falls back to base scope, which is not what you meant.

Timeline rules:
- Phases should describe what happens, what the client receives at the end of it, and roughly how long it takes.
- Use relative durations ("2 weeks", "3 to 4 weeks"), never calendar dates. Dates go stale the moment a quote sits in an inbox.

Terms rules:
- Write paymentTerms only: the split, when each instalment falls due, and the invoice period. Two or three sentences.
- Do NOT write the terms and conditions. Return an empty string for the terms field. The studio has a fixed set covering revisions, rebuilds, redesigns and new features, and it is deliberately the same on every quote. Never invent a legal clause, a warranty, a liability cap or an IP assignment.

Two separate lists, and the difference matters:
- assumptions: gaps you FILLED with a judgement, and every rate or figure you assumed. The operator checks these.
- questions: things you genuinely could NOT price or scope without an answer. Ask short, specific, answerable questions ("What is your day rate?", not "Tell me about budget"). If the brief gives you everything you need, return an empty questions array rather than inventing something to ask.

Neither list is ever shown to the client.`

/**
 * How long a single attempt may run before it is abandoned.
 *
 * Measured against the live API, a full draft off the real schema takes 6 to 18
 * seconds. 60 gives a slow one room without leaving the operator watching a
 * spinner that will never resolve.
 */
const ATTEMPT_TIMEOUT_MS = 60_000

/** Waits before retry N. Short enough that someone can sit through both. */
const BACKOFF_MS = [1_500, 4_000]

/**
 * Retries a provider call on a transient failure.
 *
 * Gemini answers 503 "currently experiencing high demand" on a meaningful share
 * of calls: measured 2 failures in 8 against the real schema, across several
 * models, each recovering on the next attempt seconds later. One retry was not
 * enough, and when both attempts failed the raw SDK error escaped as a generic
 * 500, so a temporary capacity blip reached the screen as "Something on our end
 * stopped this from going through."
 *
 * Three attempts with a short backoff, and whatever finally fails is translated
 * by the provider client into a message naming the model and saying what to do.
 * Not more than three: someone is waiting at a screen, and a third failure
 * means the model is genuinely unavailable rather than briefly busy.
 */
async function withRetry<T>(operation: (signal: AbortSignal) => Promise<T>): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS)
    try {
      return await operation(controller.signal)
    } catch (cause) {
      lastError = cause
      if (!isTransient(cause) || attempt === BACKOFF_MS.length) throw cause
      await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS[attempt]))
    } finally {
      clearTimeout(timer)
    }
  }

  /* Unreachable: the loop either returns or throws. Present so the function has
     a definite return type without a non-null assertion. */
  throw lastError
}

function buildUserPrompt(context: DraftContext): string {
  const parts = [
    `Client: ${context.clientName}`,
    context.clientCompany ? `Company: ${context.clientCompany}` : null,
    `Currency: ${context.currency} (quote in major units)`,
    '',
    'Brief from the operator:',
    context.brief,
  ]

  if (context.existing) {
    parts.push(
      '',
      'The quote already contains the following. Revise it in line with the brief above, keeping anything the brief does not contradict:',
      context.existing
    )
  }

  return parts.filter((part) => part !== null).join('\n')
}

/**
 * Drafts a quote.
 *
 * The model's JSON is validated twice over: once by the provider's own
 * structured-output enforcement, and again here against `quoteDraftSchema`.
 * The second pass is not redundant — Gemini's schema support and Claude's are
 * different mechanisms, and this is the single gate both must clear before a
 * draft is allowed into the editor.
 */
export async function draftQuote(
  context: DraftContext,
  modelId: AiModelId = DEFAULT_AI_MODEL
): Promise<DraftResult> {
  if (context.brief.trim().length < 20) {
    throw new AppError(
      422,
      'Tell the drafter a bit more about the project first. A sentence or two is enough.',
      'AI_BRIEF_TOO_SHORT'
    )
  }

  const choice = findModel(modelId)
  const client = clientFor(choice)
  const raw = await withRetry((signal) =>
    client.draftJson(SYSTEM_PROMPT, buildUserPrompt(context), signal)
  )

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(raw)
  } catch (cause) {
    throw new AppError(
      502,
      'The draft came back in a shape we could not read. Try again.',
      'AI_DRAFT_INVALID_JSON',
      cause
    )
  }

  const result = quoteDraftSchema.safeParse(parsedJson)
  if (!result.success) {
    throw new AppError(
      502,
      'The draft came back incomplete. Try again, or switch provider.',
      'AI_DRAFT_SCHEMA_MISMATCH',
      result.error.issues
    )
  }

  return {
    draft: result.data,
    provider: client.provider,
    model: client.model,
    label: choice.label,
  }
}
