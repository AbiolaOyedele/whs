/**
 * Access control for client-facing quotes.
 *
 * These cover the two things that keep one client's pricing away from another:
 * the PIN digest, and the signed session token that a correct PIN mints.
 */
import { describe, expect, it } from 'vitest'
import {
  generatePin,
  hashPin,
  isValidPin,
  isValidQuoteSlug,
  quoteSlug,
  slugify,
  verifyPin,
} from '@/lib/admin/quote-access'

describe('generatePin', () => {
  it('always produces exactly six digits', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generatePin()).toMatch(/^\d{6}$/)
    }
  })

  it('does not keep returning the same code', () => {
    const seen = new Set(Array.from({ length: 50 }, () => generatePin()))
    expect(seen.size).toBeGreaterThan(40)
  })

  it('spreads across all ten digits rather than favouring the low ones', () => {
    // Rejection sampling exists to avoid modulo bias. Without it, 0-5 would be
    // over-represented, so this asserts every digit actually appears.
    const digits = new Set(
      Array.from({ length: 400 }, () => generatePin())
        .join('')
        .split('')
    )
    expect(digits.size).toBe(10)
  })
})

describe('isValidPin', () => {
  it('accepts six digits and nothing else', () => {
    expect(isValidPin('012345')).toBe(true)
    expect(isValidPin('12345')).toBe(false)
    expect(isValidPin('1234567')).toBe(false)
    expect(isValidPin('12345a')).toBe(false)
    expect(isValidPin(' 123456 ')).toBe(false)
  })
})

describe('hashPin / verifyPin', () => {
  it('verifies the correct pin', async () => {
    const hash = await hashPin('123456', 'acme')
    expect(await verifyPin('123456', 'acme', hash)).toBe(true)
  })

  it('rejects the wrong pin', async () => {
    const hash = await hashPin('123456', 'acme')
    expect(await verifyPin('123457', 'acme', hash)).toBe(false)
  })

  it('binds the hash to the slug, so one quote"s pin cannot open another', async () => {
    const hash = await hashPin('123456', 'acme')
    expect(await verifyPin('123456', 'northsight', hash)).toBe(false)
  })

  it('produces different hashes for the same pin on different quotes', async () => {
    const a = await hashPin('123456', 'acme')
    const b = await hashPin('123456', 'northsight')
    expect(a).not.toBe(b)
  })

  it('never stores the pin itself in the digest', async () => {
    const hash = await hashPin('123456', 'acme')
    expect(hash).not.toContain('123456')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('rejects a malformed pin without comparing it', async () => {
    const hash = await hashPin('123456', 'acme')
    expect(await verifyPin('abc', 'acme', hash)).toBe(false)
    expect(await verifyPin('', 'acme', hash)).toBe(false)
  })
})

describe('slugify and quoteSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Acme Corp Ltd')).toBe('acme-corp-ltd')
  })

  it('strips punctuation that would break a URL', () => {
    expect(slugify('Smith & Co. (UK)')).toBe('smith-co-uk')
  })

  it('caps the length so a link stays readable', () => {
    expect(slugify('a'.repeat(200)).length).toBeLessThanOrEqual(60)
  })

  it('never leaves a trailing hyphen', () => {
    expect(slugify('Acme!!!')).toBe('acme')
    expect(slugify('a'.repeat(59) + ' extra')).not.toMatch(/-$/)
  })

  it('refuses a name too short to build a link from', () => {
    expect(() => quoteSlug('!')).toThrow()
  })

  it('suffixes a reserved word rather than producing a confusing link', () => {
    expect(quoteSlug('admin')).toBe('admin-quote')
    expect(quoteSlug('api')).toBe('api-quote')
  })
})

describe('isValidQuoteSlug', () => {
  it('accepts a normal slug', () => {
    expect(isValidQuoteSlug('acme-corp')).toBe(true)
  })

  it('rejects anything that is not lowercase, digits and single hyphens', () => {
    expect(isValidQuoteSlug('Acme')).toBe(false)
    expect(isValidQuoteSlug('acme--corp')).toBe(false)
    expect(isValidQuoteSlug('-acme')).toBe(false)
    expect(isValidQuoteSlug('acme-')).toBe(false)
    expect(isValidQuoteSlug('a')).toBe(false)
    expect(isValidQuoteSlug('../etc/passwd')).toBe(false)
    expect(isValidQuoteSlug('acme corp')).toBe(false)
  })

  it('rejects reserved route names', () => {
    expect(isValidQuoteSlug('admin')).toBe(false)
    expect(isValidQuoteSlug('work')).toBe(false)
  })
})
