/**
 * Gemini provider. Selectable per request; Claude remains the default.
 *
 * Same contract as the Claude provider: JSON in, validated draft out. Gemini
 * takes a JSON Schema rather than a Zod object, so the schema is derived from
 * the same Zod definition with `z.toJSONSchema` — one source of truth, so the
 * two providers can never drift into accepting different shapes.
 *
 * The model id is configurable because model names move faster than this
 * codebase will. A stale default should be a one-line environment change, not
 * a deploy.
 */
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import { adminEnv } from '@/config/env'
import { AppError } from '@/lib/errors'
import { quoteDraftSchema, type AiClient } from './types'

/*
 * Verified against a live key on 2026-09-02: the 2.5 family now returns
 * "no longer available to new users", so a newly-issued key cannot call
 * gemini-2.5-flash or gemini-2.5-pro at all. gemini-3.8-flash is the newest
 * non-preview flash model and answers cleanly.
 *
 * Flash rather than pro deliberately, matching the Claude side: drafting a
 * quote from a brief is structured extraction, not hard reasoning. Override
 * with GEMINI_MODEL if a job needs more.
 */
const DEFAULT_MODEL = 'gemini-3.8-flash'

/**
 * Keywords Gemini's `responseJsonSchema` accepts.
 *
 * Its schema dialect is a subset of JSON Schema, and it rejects the whole
 * request with a bare `INVALID_ARGUMENT` when it meets anything outside that
 * subset — no indication of which keyword offended. Zod emits `$schema` and
 * `default` among others, so the schema is filtered down before it is sent.
 *
 * Dropping constraints here costs nothing: the response is validated against
 * the full Zod schema on arrival either way, so the real contract is enforced
 * on our side rather than delegated to the provider.
 */
const GEMINI_SCHEMA_KEYS = new Set([
  'type',
  'properties',
  'items',
  'required',
  'enum',
  'description',
  'nullable',
  'anyOf',
])

/** Recursively strips anything Gemini's schema dialect does not accept. */
function toGeminiSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toGeminiSchema)
  if (typeof value !== 'object' || value === null) return value

  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (!GEMINI_SCHEMA_KEYS.has(key)) continue
    out[key] = key === 'properties' ? mapValues(child) : toGeminiSchema(child)
  }
  return out
}

/** `properties` is a map of name → schema, not a schema itself. */
function mapValues(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, child]) => [
      key,
      toGeminiSchema(child),
    ])
  )
}

export function geminiClient(): AiClient {
  const env = adminEnv()
  if (!env.GEMINI_API_KEY) {
    throw new AppError(
      503,
      'Gemini is not connected yet. Add a Gemini API key, or switch the drafter to Claude.',
      'AI_GEMINI_NOT_CONFIGURED'
    )
  }

  const model = env.GEMINI_MODEL ?? DEFAULT_MODEL
  const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

  return {
    provider: 'gemini',
    model,

    async draftJson(systemPrompt: string, userPrompt: string): Promise<string> {
      const response = await client.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseJsonSchema: toGeminiSchema(z.toJSONSchema(quoteDraftSchema, { io: 'input' })),
        },
      })

      const text = response.text
      if (!text || text.trim().length === 0) {
        throw new AppError(
          502,
          'Gemini returned an empty draft. Try again, or switch to Claude.',
          'AI_GEMINI_EMPTY_RESPONSE'
        )
      }

      return text
    },
  }
}
