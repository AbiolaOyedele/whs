/**
 * The signed cookie a correct PIN mints.
 *
 * A forgeable or slug-agnostic token would undo the PIN entirely, so these
 * tests are about what happens when the value is edited rather than what
 * happens when it is not.
 */
import { describe, expect, it, vi } from 'vitest'
import type { AstroCookies } from 'astro'
import { grantQuoteAccess, hasQuoteAccess, hashIp } from '@/lib/admin/quote-session'

/** Minimal in-memory stand-in for Astro's cookie API. */
function fakeCookies(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))
  return {
    get: (name: string) => (store.has(name) ? { value: store.get(name) as string } : undefined),
    set: (name: string, value: string) => store.set(name, value),
    delete: (name: string) => store.delete(name),
    has: (name: string) => store.has(name),
    store,
  } as unknown as AstroCookies & { store: Map<string, string> }
}

describe('grantQuoteAccess / hasQuoteAccess', () => {
  it('lets the holder back in without retyping the code', async () => {
    const cookies = fakeCookies()
    await grantQuoteAccess('acme', cookies)
    expect(await hasQuoteAccess('acme', cookies)).toBe(true)
  })

  it('does not open a different quote', async () => {
    const cookies = fakeCookies()
    await grantQuoteAccess('acme', cookies)
    expect(await hasQuoteAccess('northsight', cookies)).toBe(false)
  })

  it('refuses when there is no cookie at all', async () => {
    expect(await hasQuoteAccess('acme', fakeCookies())).toBe(false)
  })

  it('refuses a token whose slug has been edited', async () => {
    const cookies = fakeCookies()
    await grantQuoteAccess('acme', cookies)

    const token = cookies.store.get('wh_quote_access') as string
    const [, expires, signature] = token.split('.')
    cookies.store.set('wh_quote_access', `northsight.${expires}.${signature}`)

    expect(await hasQuoteAccess('northsight', cookies)).toBe(false)
  })

  it('refuses a token whose expiry has been pushed out', async () => {
    const cookies = fakeCookies()
    await grantQuoteAccess('acme', cookies)

    const token = cookies.store.get('wh_quote_access') as string
    const [slug, , signature] = token.split('.')
    const farFuture = Date.now() + 1000 * 60 * 60 * 24 * 365
    cookies.store.set('wh_quote_access', `${slug}.${farFuture}.${signature}`)

    expect(await hasQuoteAccess('acme', cookies)).toBe(false)
  })

  it('refuses a token with a made-up signature', async () => {
    const cookies = fakeCookies({
      wh_quote_access: `acme.${Date.now() + 100_000}.not-a-real-signature`,
    })
    expect(await hasQuoteAccess('acme', cookies)).toBe(false)
  })

  it('refuses a malformed token rather than throwing', async () => {
    for (const value of ['', 'acme', 'acme.123', 'a.b.c.d']) {
      const cookies = fakeCookies({ wh_quote_access: value })
      expect(await hasQuoteAccess('acme', cookies)).toBe(false)
    }
  })

  it('expires on its own', async () => {
    const cookies = fakeCookies()
    await grantQuoteAccess('acme', cookies)
    expect(await hasQuoteAccess('acme', cookies)).toBe(true)

    // Thirteen hours later: the token is minted with a twelve-hour life.
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000 * 60 * 60 * 13)
    expect(await hasQuoteAccess('acme', cookies)).toBe(false)
    vi.restoreAllMocks()
  })
})

describe('hashIp', () => {
  it('is stable for one address and different for another', async () => {
    const a = await hashIp('203.0.113.10')
    expect(a).toBe(await hashIp('203.0.113.10'))
    expect(a).not.toBe(await hashIp('203.0.113.11'))
  })

  it('does not contain the address it came from', async () => {
    const hash = await hashIp('203.0.113.10')
    expect(hash).not.toContain('203')
    expect(hash).toMatch(/^[0-9a-f]{32}$/)
  })
})
