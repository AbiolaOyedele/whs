/**
 * Claude provider. The default, per the brief.
 *
 * Uses structured outputs (`output_config.format`) rather than asking for JSON
 * in the prompt and hoping. The schema is enforced server-side, so the response
 * either parses into `quoteDraftSchema` or the request fails loudly — there is
 * no half-valid draft to defend against downstream.
 */
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { adminEnv } from '@/config/env'
import { AppError } from '@/lib/errors'
import { quoteDraftSchema, type AiClient } from './types'

/*
 * Haiku by default, on the operator's instruction: drafting a quote from a
 * brief is structured extraction and light arithmetic, not hard reasoning, and
 * it is a cost paid on every draft.
 *
 * Overridable with ANTHROPIC_MODEL when a particular engagement is genuinely
 * gnarly and worth a bigger model — `claude-sonnet-5` or `claude-opus-5` drop
 * straight in, no other change needed.
 */
const DEFAULT_MODEL = 'claude-haiku-4-5'

export function claudeClient(): AiClient {
  const apiKey = adminEnv().ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new AppError(
      503,
      'Claude is not connected yet. Add an Anthropic API key, or switch the drafter to Gemini.',
      'AI_CLAUDE_NOT_CONFIGURED'
    )
  }

  const model = adminEnv().ANTHROPIC_MODEL ?? DEFAULT_MODEL
  const client = new Anthropic({ apiKey })

  return {
    provider: 'claude',
    model,

    async draftJson(systemPrompt: string, userPrompt: string): Promise<string> {
      const response = await client.messages.parse({
        model,
        max_tokens: 16_000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        output_config: { format: zodOutputFormat(quoteDraftSchema) },
      })

      if (response.stop_reason === 'refusal') {
        throw new AppError(
          422,
          'Claude declined to draft that. Try rewording the brief.',
          'AI_CLAUDE_REFUSED',
          response.stop_details
        )
      }

      if (!response.parsed_output) {
        throw new AppError(
          502,
          'The draft came back in a shape we could not read. Try again.',
          'AI_CLAUDE_UNPARSEABLE'
        )
      }

      return JSON.stringify(response.parsed_output)
    },
  }
}
