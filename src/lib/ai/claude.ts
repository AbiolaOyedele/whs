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
import { toProviderError } from './provider-errors'

/**
 * Which model runs is now the operator's choice per draft, made in the editor
 * and passed in here. It used to be pinned by ANTHROPIC_MODEL, which made
 * moving between Haiku and Sonnet a redeploy.
 *
 * ANTHROPIC_MODEL still overrides the Haiku entry, which is what it overrode
 * before, so an existing deployment that sets it keeps the behaviour it has.
 * It does not touch the Sonnet entry: an override that silently pinned both
 * choices to one model would leave a picker that changes nothing.
 */
export function claudeClient(model: string): AiClient {
  const env = adminEnv()
  if (!env.ANTHROPIC_API_KEY) {
    throw new AppError(
      503,
      'Claude is not connected yet. Add an Anthropic API key, or switch the drafter to Gemini.',
      'AI_CLAUDE_NOT_CONFIGURED'
    )
  }

  const resolved = model === 'claude-haiku-4-5' ? (env.ANTHROPIC_MODEL ?? model) : model
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

  return {
    provider: 'claude',
    model: resolved,

    async draftJson(systemPrompt: string, userPrompt: string, signal): Promise<string> {
      let response
      try {
        response = await client.messages.parse(
          {
            model: resolved,
            max_tokens: 16_000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            output_config: { format: zodOutputFormat(quoteDraftSchema) },
          },
          { signal }
        )
      } catch (cause) {
        throw toProviderError('claude', resolved, cause)
      }

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
