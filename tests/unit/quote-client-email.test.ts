/**
 * The email a client adds to their own quote.
 *
 * Payment used to stop at "we need an email address on this quote, please get
 * in touch", which asks someone holding their card to go and send an email
 * instead. They can now enter it there, which means an endpoint that writes to
 * a quote is reachable by anyone holding the access code.
 *
 * That is the whole risk, and it is what this file is about: the address must
 * be settable exactly once. A second holder of the link must not be able to
 * point the receipt, the invoice and every later message at an address of their
 * choosing.
 *
 * The write itself carries the guard in its WHERE clause rather than reading
 * first and writing after, so there is no window between the two. What is
 * testable here is the validation in front of it.
 */
import { describe, expect, it } from 'vitest'
import { clientEmailSchema } from '@/lib/schemas/quotes'

const parse = (email: unknown) => clientEmailSchema.safeParse({ email })

describe('the address a client submits', () => {
  it('accepts an ordinary address', () => {
    expect(parse('someone@company.com').success).toBe(true)
  })

  it('trims what a phone keyboard adds', () => {
    const result = parse('  someone@company.com  ')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('someone@company.com')
  })

  it('refuses an empty submission with a sentence, not a code', () => {
    const result = parse('   ')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Please enter your email address.')
    }
  })

  it('refuses something that is not an address', () => {
    for (const value of ['someone', 'someone@', '@company.com', 'someone company.com']) {
      expect(parse(value).success).toBe(false)
    }
  })

  it('refuses an address longer than the column holds', () => {
    // client_email is text with a 254 check. A longer value would fail at the
    // database with an error nobody could act on; it fails here with a sentence.
    expect(parse(`${'a'.repeat(250)}@company.com`).success).toBe(false)
  })

  it('refuses a non-string outright', () => {
    for (const value of [null, undefined, 42, { email: 'someone@company.com' }, ['a@b.com']]) {
      expect(parse(value).success).toBe(false)
    }
  })
})
