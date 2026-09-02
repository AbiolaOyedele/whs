/**
 * Origin enforcement for form posts.
 *
 * The apex/www pair matters in production: whstd.com redirects to
 * www.whstd.com, so depending on how a visitor arrives, a form can be submitted
 * from either host. Accepting only the configured one returned 403 to real
 * people on every form on the site.
 */
import { describe, expect, it } from 'vitest'
import { allowedOrigins, assertSameOrigin } from '@/lib/forms'

const post = (origin: string | null): Request =>
  new Request('https://www.whstd.com/api/v1/contact', {
    method: 'POST',
    ...(origin ? { headers: { origin } } : {}),
  })

describe('allowedOrigins', () => {
  it('returns the configured host and its www counterpart', () => {
    expect(allowedOrigins('https://whstd.com')).toEqual([
      'https://whstd.com',
      'https://www.whstd.com',
    ])
  })

  it('works the other way round too', () => {
    expect(allowedOrigins('https://www.whstd.com')).toEqual([
      'https://www.whstd.com',
      'https://whstd.com',
    ])
  })

  it('keeps the protocol AND the port, so local development still works', () => {
    // `url.hostname` drops the port; this once turned http://localhost:4321
    // into http://localhost and would have 403'd every form in dev.
    expect(allowedOrigins('http://localhost:4321')).toEqual([
      'http://localhost:4321',
      'http://www.localhost:4321',
    ])
  })
})

describe('assertSameOrigin', () => {
  it('accepts both halves of the pair', () => {
    expect(() => assertSameOrigin(post('https://whstd.com'), 'https://www.whstd.com')).not.toThrow()
    expect(() => assertSameOrigin(post('https://www.whstd.com'), 'https://whstd.com')).not.toThrow()
  })

  it('tolerates a missing Origin header', () => {
    // Some browsers omit it on same-origin form posts.
    expect(() => assertSameOrigin(post(null), 'https://whstd.com')).not.toThrow()
  })

  it('still refuses another site', () => {
    for (const origin of [
      'https://evil.test',
      'https://whstd.com.evil.test',
      'https://notwhstd.com',
      'http://whstd.com',
    ]) {
      expect(() => assertSameOrigin(post(origin), 'https://whstd.com')).toThrow()
    }
  })

  it('refuses an arbitrary subdomain', () => {
    // Only apex and www, never a wildcard.
    expect(() => assertSameOrigin(post('https://staging.whstd.com'), 'https://whstd.com')).toThrow()
  })
})
