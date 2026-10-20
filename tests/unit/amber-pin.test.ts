import { describe, expect, it } from 'vitest'
import { hashAmberPin, newUserSchema, userUpdateSchema } from '@/lib/admin/amber'

/**
 * The admin creates Amber accounts and Amber checks the PINs, so both must hash
 * identically. This vector is asserted in Amber's own tests too
 * (tests/unit/pin.test.ts there): if either side changes, both fail.
 */
const SECRET = '0123456789abcdef'.repeat(4)

describe('Amber PIN hashing', () => {
  it('matches the vector Amber verifies against', () => {
    expect(hashAmberPin(SECRET, 'Ana.Chow', '0427')).toBe(
      '0058a5c402e96d0461714676fe4d6237a308d836da95192f3be073cbffa54f4f'
    )
  })

  it('normalises the username the same way Amber does', () => {
    expect(hashAmberPin(SECRET, '  ANA.chow ', '0427')).toBe(
      hashAmberPin(SECRET, 'ana.chow', '0427')
    )
  })
})

describe('Amber account input', () => {
  it('accepts a valid new person and lowercases the username', () => {
    const parsed = newUserSchema.parse({ username: 'Ana.Chow', pin: '0427', displayName: '' })
    expect(parsed.username).toBe('ana.chow')
    expect(parsed.displayName).toBeNull()
  })

  it('rejects PINs that are not exactly 4 digits', () => {
    for (const pin of ['123', '12345', 'abcd', '12 4']) {
      expect(newUserSchema.safeParse({ username: 'ana', pin }).success).toBe(false)
    }
  })

  it('rejects usernames with spaces or symbols', () => {
    for (const username of ['an', 'ana chow', 'ana@chow', 'x'.repeat(33)]) {
      expect(newUserSchema.safeParse({ username, pin: '1234' }).success).toBe(false)
    }
  })

  it('refuses an update that changes nothing', () => {
    expect(userUpdateSchema.safeParse({}).success).toBe(false)
    expect(userUpdateSchema.safeParse({ isActive: false }).success).toBe(true)
  })
})
