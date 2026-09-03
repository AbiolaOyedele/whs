/**
 * The drafter's option handling.
 *
 * Two properties the schema and its downstream must keep:
 *
 *  1. Optional means optional. A draft without packages is the common case, and
 *     the schema must accept it without complaint.
 *  2. Never two default packages. Two selected packages is the exact class of
 *     bug the database's partial unique index also refuses; the schema is the
 *     earlier line of defence, with a sentence a person can act on.
 */
import { describe, expect, it } from 'vitest'
import { quoteDraftSchema } from '@/lib/ai/types'

const minimalDraft = {
  projectTitle: 'x',
  projectSummary: 'y',
  lineItems: [{ title: 'a', unitPrice: 1 }],
}

describe('quoteDraftSchema', () => {
  it('accepts a draft with no packages, as before', () => {
    const parsed = quoteDraftSchema.parse(minimalDraft)
    expect(parsed.options).toEqual([])
    expect(parsed.lineItems[0]?.optionKey).toBeNull()
  })

  it('accepts a draft with packages and a default', () => {
    const parsed = quoteDraftSchema.parse({
      ...minimalDraft,
      options: [
        { key: 'essential', kind: 'package', title: 'Essential', isDefault: true },
        { key: 'premium', kind: 'package', title: 'Premium' },
      ],
      lineItems: [
        { title: 'base', unitPrice: 100 },
        { title: 'essential-only', unitPrice: 200, optionKey: 'essential' },
      ],
    })

    expect(parsed.options).toHaveLength(2)
    expect(parsed.lineItems[1]?.optionKey).toBe('essential')
  })

  it('refuses two default packages', () => {
    const result = quoteDraftSchema.safeParse({
      ...minimalDraft,
      options: [
        { key: 'a', kind: 'package', title: 'A', isDefault: true },
        { key: 'b', kind: 'package', title: 'B', isDefault: true },
      ],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toMatch(/pre-selected/i)
  })

  it('accepts several default add-ons — that is the whole point of an add-on', () => {
    const parsed = quoteDraftSchema.parse({
      ...minimalDraft,
      options: [
        { key: 'seo', kind: 'addon', title: 'SEO', isDefault: true },
        { key: 'care', kind: 'addon', title: 'Care', isDefault: true },
      ],
    })

    expect(parsed.options.filter((o) => o.isDefault)).toHaveLength(2)
  })

  it('caps the option list rather than accepting a wall of them', () => {
    const nine = Array.from({ length: 9 }, (_, i) => ({
      key: `k${i}`,
      kind: 'package' as const,
      title: `Package ${i}`,
    }))

    expect(quoteDraftSchema.safeParse({ ...minimalDraft, options: nine }).success).toBe(false)
  })
})
