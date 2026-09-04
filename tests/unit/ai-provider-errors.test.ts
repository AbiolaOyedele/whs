/**
 * Provider failures, as the operator sees them.
 *
 * The bug this covers: Gemini answers 503 "experiencing high demand" on a
 * meaningful share of calls. That error is not an `AppError`, so it fell
 * through to the generic handler and reached the screen as "Something on our
 * end stopped this from going through" — which is wrong on both counts. It is
 * not our end, and it is fixed by pressing the button again.
 *
 * Two properties matter here:
 *
 *  1. A transient failure is recognised as transient, whichever shape the SDK
 *     threw it in. `@google/genai` hides the status inside a JSON string in
 *     `message`; the Anthropic SDK puts it on `status`.
 *  2. Every message names the model and says what to do next.
 */
import { describe, expect, it } from 'vitest'
import { isTransient, toProviderError } from '@/lib/ai/provider-errors'
import { AppError } from '@/lib/errors'

/** How @google/genai surfaces an API error: the envelope stringified. */
const geminiError = (code: number, message: string) =>
  Object.assign(new Error(JSON.stringify({ error: { code, message, status: 'UNAVAILABLE' } })), {
    name: 'ApiError',
    status: code,
  })

/** How the Anthropic SDK surfaces one. */
const anthropicError = (status: number, message: string) =>
  Object.assign(new Error(message), { status })

describe('isTransient', () => {
  it('recognises the Gemini high-demand 503 that started this', () => {
    expect(
      isTransient(
        geminiError(
          503,
          'This model is currently experiencing high demand. Please try again later.'
        )
      )
    ).toBe(true)
  })

  it('recognises a 503 with the status only in the message body', () => {
    // No `status` property at all, which is how it arrives when the SDK wraps.
    const bare = new Error(JSON.stringify({ error: { code: 503, message: 'UNAVAILABLE' } }))
    expect(isTransient(bare)).toBe(true)
  })

  it('recognises rate limiting and gateway failures', () => {
    expect(isTransient(anthropicError(429, 'rate_limit_error'))).toBe(true)
    expect(isTransient(anthropicError(502, 'bad gateway'))).toBe(true)
    expect(isTransient(new Error('fetch failed'))).toBe(true)
  })

  it('does not retry a bad key or a missing model', () => {
    expect(isTransient(anthropicError(401, 'invalid x-api-key'))).toBe(false)
    expect(isTransient(geminiError(404, 'no longer available to new users'))).toBe(false)
    expect(isTransient(anthropicError(400, 'invalid schema'))).toBe(false)
  })
})

describe('toProviderError', () => {
  it('turns the high-demand 503 into something worth reading', () => {
    const error = toProviderError(
      'gemini',
      'gemini-3.6-flash',
      geminiError(503, 'This model is currently experiencing high demand.')
    )

    expect(error).toBeInstanceOf(AppError)
    expect(error.statusCode).toBe(503)
    expect(error.code).toBe('AI_PROVIDER_UNAVAILABLE')
    expect(error.message).toContain('gemini-3.6-flash')
    expect(error.message).toContain('try again')
    // Never the generic sentence that sent us looking for this bug.
    expect(error.message).not.toContain('Something on our end')
  })

  it('names the model when it is not on the key', () => {
    const error = toProviderError(
      'gemini',
      'gemini-2.5-flash',
      geminiError(404, 'no longer available to new users')
    )
    expect(error.code).toBe('AI_PROVIDER_MODEL_UNAVAILABLE')
    expect(error.message).toContain('gemini-2.5-flash')
  })

  it('separates a rejected key from a busy model', () => {
    const error = toProviderError('claude', 'claude-sonnet-5', anthropicError(401, 'bad key'))
    expect(error.code).toBe('AI_PROVIDER_KEY_REJECTED')
    expect(error.message).toContain('Claude')
  })

  it('separates rate limiting from capacity, since waiting differs', () => {
    const error = toProviderError('claude', 'claude-haiku-4-5', anthropicError(429, 'rate limit'))
    expect(error.code).toBe('AI_PROVIDER_RATE_LIMITED')
  })

  it('passes our own AppErrors through untouched', () => {
    const original = new AppError(422, 'Claude declined to draft that.', 'AI_CLAUDE_REFUSED')
    expect(toProviderError('claude', 'claude-haiku-4-5', original)).toBe(original)
  })

  it('never leaks the raw provider text into the message', () => {
    const error = toProviderError(
      'gemini',
      'gemini-3.6-flash',
      geminiError(500, 'internal stack trace at /var/task/index.js:1:1')
    )
    expect(error.message).not.toContain('/var/task')
    // The detail is kept for the server log, which is where it belongs.
    expect(JSON.stringify(error.details)).toContain('/var/task')
  })
})
