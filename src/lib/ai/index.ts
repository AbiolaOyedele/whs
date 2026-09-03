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
  DEFAULT_AI_PROVIDER,
  quoteDraftSchema,
  type AiClient,
  type AiProvider,
  type DraftContext,
  type DraftResult,
} from './types'

export * from './types'

/** Which providers currently have a key. Drives the UI's provider picker. */
export function availableProviders(): AiProvider[] {
  const env = adminEnv()
  const available: AiProvider[] = []
  if (env.ANTHROPIC_API_KEY) available.push('claude')
  if (env.GEMINI_API_KEY) available.push('gemini')
  return available
}

function clientFor(provider: AiProvider): AiClient {
  return provider === 'gemini' ? geminiClient() : claudeClient()
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
- Never use em dashes. Use a colon, a comma, parentheses, or two sentences.
- Address the client directly as "you". Refer to the studio as "we".
- Describe outcomes in terms of the client's time and effort saved, not technology.

Pricing rules, in order of importance:
1. Never invent a figure the brief does not support. If the brief gives no rate, no budget and no comparable, set unitPrice to 0 and say so in assumptions. A zero the operator must fill in is safe. A plausible guess that reaches a client is not.
2. Break the work into line items that a client could actually query: a named piece of work, what it includes, what it costs. Avoid a single undifferentiated "development" line.
3. Prices are in major currency units (e.g. 4200 means 4,200), not minor units.

Packages and add-ons — use these when the brief calls for tiers or genuinely optional scope:
- A PACKAGE is one of several mutually exclusive scopes the client picks between (Essential / Standard / Premium, or something specific to the job). Mark ONE as isDefault: the one you recommend.
- An ADD-ON is scope the client ticks independently (a care plan, an SMS layer). Do not mark add-ons as isDefault unless the brief clearly asks for them.
- Every line item goes SOMEWHERE. Work included on every version of the quote belongs in BASE SCOPE (optionKey: null). Work that only counts if the client picks a particular package or add-on carries that option's key.
- The option's price is the sum of its items; do not repeat the total in the option itself. Write a one-sentence description covering what makes it different from the others.
- No packages when the brief is one fixed scope. isOptional (on base-scope items) is for a single menu item, not a whole tier — a tier is a package.
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
 * Retries a provider call once on a transient failure.
 *
 * Observed in testing: Gemini returned 503 "currently experiencing high demand"
 * on one attempt and answered normally seconds later. The Anthropic SDK retries
 * 429s and 5xx itself; the Google one does not, so without this the drafter
 * would surface a temporary capacity blip to the operator as a failed draft.
 *
 * Deliberately one retry rather than a backoff loop: someone is waiting at a
 * screen, and a second failure means something is actually wrong, not busy.
 */
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause)
    const transient = /429|503|500|overloaded|high demand|UNAVAILABLE|RESOURCE_EXHAUSTED/i.test(
      message
    )
    if (!transient) throw cause

    await new Promise((resolve) => setTimeout(resolve, 1_500))
    return operation()
  }
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
  provider: AiProvider = DEFAULT_AI_PROVIDER
): Promise<DraftResult> {
  if (context.brief.trim().length < 20) {
    throw new AppError(
      422,
      'Tell the drafter a bit more about the project first. A sentence or two is enough.',
      'AI_BRIEF_TOO_SHORT'
    )
  }

  const client = clientFor(provider)
  const raw = await withRetry(() => client.draftJson(SYSTEM_PROMPT, buildUserPrompt(context)))

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

  return { draft: result.data, provider: client.provider, model: client.model }
}
