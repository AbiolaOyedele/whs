import { describe, expect, it } from 'vitest'
import { findDashes } from '@/lib/admin/house-style'

describe('findDashes', () => {
  it('flags an em dash in client-visible prose', () => {
    const issues = findDashes({ 'Opening note': 'Thanks for Tuesday — that helped.' })
    expect(issues).toHaveLength(1)
    expect(issues[0]?.field).toBe('Opening note')
  })

  it('flags an en dash in a range, which is how one reached a live quote', () => {
    expect(findDashes({ 'Phase 1 duration': '6–9 weeks' })).toHaveLength(1)
  })

  it('leaves a hyphen alone', () => {
    expect(findDashes({ Terms: 'A six-week build, part-payment up front.' })).toHaveLength(0)
  })

  it('ignores empty and missing fields', () => {
    expect(findDashes({ a: '', b: null, c: undefined })).toHaveLength(0)
  })

  it('returns an excerpt around the dash rather than the whole field', () => {
    const long = `${'x'.repeat(200)} — ${'y'.repeat(200)}`
    const excerpt = findDashes({ Terms: long })[0]?.excerpt ?? ''
    expect(excerpt.length).toBeLessThan(long.length)
    expect(excerpt).toContain('—')
  })

  it('reports every offending field, not just the first', () => {
    expect(findDashes({ One: 'a — b', Two: 'c – d', Three: 'clean' })).toHaveLength(2)
  })
})
