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
3. Mark genuinely optional scope as isOptional rather than padding the total with it.
4. Prices are in major currency units (e.g. 4200 means 4,200), not minor units.

Timeline rules:
- Phases should describe what happens, what the client receives at the end of it, and roughly how long it takes.
- Use relative durations ("2 weeks", "3 to 4 weeks"), never calendar dates. Dates go stale the moment a quote sits in an inbox.

Terms rules. Always write both paymentTerms and terms, never leave them empty:
- paymentTerms: the split, when each instalment falls due, and the invoice period. Keep it to two or three sentences.
- terms: cover what is INCLUDED, what is NOT included, and what happens when scope changes. Where the brief supports it, also cover: dependencies you need from the client (accounts, test environments, sign-off turnaround) and what happens to the timeline if they are late; third-party costs billed separately; how many rounds of revision are included; and what support period follows handover.
- Write terms as short paragraphs, not legal boilerplate. This is a studio quote, not a contract. Never invent a legal clause, a warranty, a liability cap or an IP assignment: those need a solicitor, not a language model. If the engagement clearly needs one, put that in questions.

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
