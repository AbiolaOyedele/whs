/**
 * Turns a provider SDK failure into something the operator can act on.
 *
 * Without this, an SDK error is not an `AppError`, so it falls through the API
 * route's catch to the generic handler and reaches the screen as "Something on
 * our end stopped this from going through." That is the correct default for an
 * unknown error and the wrong answer here: the single most common failure is
 * Gemini answering 503 "experiencing high demand", which is temporary, not our
 * end, and fixed by pressing the button again or picking another model. The
 * operator could not tell any of that from the generic message.
 *
 * Every message below names the model and says what to do next.
 */
import { AppError, isAppError } from '@/lib/errors'
import { AI_PROVIDER_LABELS, type AiProvider } from './types'

/** Pulls a status code off whichever shape the SDK threw. */
function statusOf(cause: unknown): number | null {
  if (typeof cause !== 'object' || cause === null) return null

  const record = cause as Record<string, unknown>
  if (typeof record['status'] === 'number') return record['status']
  if (typeof record['statusCode'] === 'number') return record['statusCode']

  /*
   * @google/genai puts the API's JSON envelope in `message` rather than on the
   * error, so the code is only reachable by parsing it back out.
   */
  const message = typeof record['message'] === 'string' ? record['message'] : ''
  const parsed = /"code"\s*:\s*(\d{3})/.exec(message)
  if (parsed?.[1]) return Number(parsed[1])

  const bare = /\b(4\d{2}|5\d{2})\b/.exec(message)
  return bare?.[1] ? Number(bare[1]) : null
}

function messageOf(cause: unknown): string {
  const raw = cause instanceof Error ? cause.message : String(cause)
  /* Unwrap the JSON envelope when there is one, so pattern matching below sees
     the sentence rather than the wrapper. */
  try {
    const parsed: unknown = JSON.parse(raw)
    const inner = (parsed as { error?: { message?: unknown } })?.error?.message
    if (typeof inner === 'string') return inner
  } catch {
    /* Not JSON. The raw message is what we have. */
  }
  return raw
}

/**
 * True when the failure is our own attempt timeout firing.
 *
 * Deliberately NOT transient: the timeout only fires after a full minute of
 * silence, and retrying that twice more would leave someone watching a spinner
 * for three minutes before being told anything.
 */
export function isAborted(cause: unknown): boolean {
  if (typeof cause !== 'object' || cause === null) return false
  const record = cause as Record<string, unknown>
  if (record['name'] === 'AbortError' || record['name'] === 'APIUserAbortError') return true
  return /aborted|AbortError/i.test(typeof record['message'] === 'string' ? record['message'] : '')
}

/** True for failures that a second attempt might clear on its own. */
export function isTransient(cause: unknown): boolean {
  if (isAborted(cause)) return false
  const status = statusOf(cause)
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true
  }
  return /overloaded|high demand|UNAVAILABLE|RESOURCE_EXHAUSTED|ETIMEDOUT|ECONNRESET|fetch failed/i.test(
    messageOf(cause)
  )
}

/**
 * Maps a provider failure onto an `AppError` with a message worth reading.
 *
 * `AppError`s thrown by our own client code pass straight through: those are
 * already written for the operator and re-wrapping would lose them.
 */
export function toProviderError(provider: AiProvider, model: string, cause: unknown): AppError {
  if (isAppError(cause)) return cause

  const providerLabel = AI_PROVIDER_LABELS[provider]
  const status = statusOf(cause)
  const detail = messageOf(cause)

  if (isAborted(cause)) {
    return new AppError(
      504,
      `${model} did not answer in time. Try again, or pick a faster model.`,
      'AI_PROVIDER_TIMEOUT',
      { provider, model, detail }
    )
  }

  if (status === 429 || /RESOURCE_EXHAUSTED|rate limit|quota/i.test(detail)) {
    return new AppError(
      503,
      `${providerLabel} is rate limiting us right now. Wait a minute and try again, or pick a different model.`,
      'AI_PROVIDER_RATE_LIMITED',
      { provider, model, detail }
    )
  }

  if (isTransient(cause)) {
    return new AppError(
      503,
      `${model} is busy and did not answer. This is usually temporary: try again, or pick a different model.`,
      'AI_PROVIDER_UNAVAILABLE',
      { provider, model, detail }
    )
  }

  if (status === 401 || status === 403) {
    return new AppError(
      502,
      `${providerLabel} rejected our API key. It may have expired or been revoked.`,
      'AI_PROVIDER_KEY_REJECTED',
      { provider, model, detail }
    )
  }

  if (status === 404) {
    return new AppError(
      502,
      `${model} is not available on this ${providerLabel} key. Pick a different model.`,
      'AI_PROVIDER_MODEL_UNAVAILABLE',
      { provider, model, detail }
    )
  }

  if (status === 400 || status === 422) {
    return new AppError(
      502,
      `${providerLabel} rejected the request. This is a bug on our side, not something the brief caused.`,
      'AI_PROVIDER_BAD_REQUEST',
      { provider, model, detail }
    )
  }

  return new AppError(
    502,
    `${providerLabel} could not complete the draft. Try again, or pick a different model.`,
    'AI_PROVIDER_FAILED',
    { provider, model, detail }
  )
}
