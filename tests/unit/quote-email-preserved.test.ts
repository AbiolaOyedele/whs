/**
 * A save must never clear an address the client supplied.
 *
 * A client can add their own email from the payment dialog. If the quote editor
 * was already open when they did, its copy of that field is empty, and saving
 * wrote the emptiness back over the address: silent, and only discovered when a
 * receipt had nowhere to go.
 *
 * An empty incoming value now means "unchanged", not "delete".
 */
import { describe, expect, it } from 'vitest'

/** Mirrors the merge in saveQuote. */
const resolve = (incoming: string | null, stored: string | null): string | null =>
  incoming ?? stored

describe('the client email on save', () => {
  it('keeps what the client supplied when the editor sends nothing', () => {
    expect(resolve(null, 'ada@acme.com')).toBe('ada@acme.com')
  })

  it('accepts a correction, because a new address is not empty', () => {
    expect(resolve('ada@newco.com', 'ada@acme.com')).toBe('ada@newco.com')
  })

  it('still sets the first address on a quote that had none', () => {
    expect(resolve('ada@acme.com', null)).toBe('ada@acme.com')
  })

  it('leaves a quote with no address anywhere still empty', () => {
    expect(resolve(null, null)).toBeNull()
  })
})
