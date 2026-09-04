/**
 * The model catalogue.
 *
 * The selectable unit is a model, not a provider. Choosing between Haiku and
 * Sonnet used to mean changing ANTHROPIC_MODEL and redeploying, which put a
 * per-job decision behind a deploy.
 *
 * The catalogue is the contract between the picker, the request schema and the
 * clients, so what matters is that the three cannot drift apart.
 */
import { describe, expect, it } from 'vitest'
import { AI_MODELS, AI_MODEL_IDS, DEFAULT_AI_MODEL, findModel } from '@/lib/ai/types'
import { draftRequestSchema } from '@/lib/schemas/quotes'

describe('AI_MODELS', () => {
  it('offers Haiku and Sonnet as separate choices', () => {
    const claude = AI_MODELS.filter((entry) => entry.provider === 'claude')
    expect(claude.map((entry) => entry.id)).toEqual(['haiku', 'sonnet'])
    expect(claude.map((entry) => entry.model)).toEqual(['claude-haiku-4-5', 'claude-sonnet-5'])
  })

  it('defaults to the cheap one, so the expensive choice is deliberate', () => {
    expect(DEFAULT_AI_MODEL).toBe('haiku')
    expect(findModel(DEFAULT_AI_MODEL).model).toBe('claude-haiku-4-5')
  })

  it('has a unique id and a blurb for every entry', () => {
    const ids = AI_MODELS.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const entry of AI_MODELS) {
      expect(entry.label.length).toBeGreaterThan(0)
      expect(entry.blurb.length).toBeGreaterThan(0)
    }
  })

  it('resolves every catalogue id', () => {
    for (const id of AI_MODEL_IDS) {
      expect(findModel(id).id).toBe(id)
    }
  })
})

describe('draftRequestSchema', () => {
  const base = {
    quoteId: '00000000-0000-4000-8000-000000000000',
    brief: 'A brief long enough to clear the minimum length check on the drafter.',
  }

  it('accepts every id the picker can offer', () => {
    for (const id of AI_MODEL_IDS) {
      expect(draftRequestSchema.parse({ ...base, model: id }).model).toBe(id)
    }
  })

  it('falls back to the default when no model is sent', () => {
    expect(draftRequestSchema.parse(base).model).toBe(DEFAULT_AI_MODEL)
  })

  it('refuses a model that is not in the catalogue', () => {
    // Guards against a stale client asking for something no client can run.
    expect(draftRequestSchema.safeParse({ ...base, model: 'opus' }).success).toBe(false)
    expect(draftRequestSchema.safeParse({ ...base, model: 'claude' }).success).toBe(false)
  })
})
