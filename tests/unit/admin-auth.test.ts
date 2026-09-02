/**
 * Who is allowed to administer this site.
 *
 * This matters more here than it would on a dedicated project. Supabase's
 * `auth.users` is project-wide, and this project is SHARED with several other
 * applications — so a correct password proves only that someone has an account
 * with *one of those*, not that they should be able to edit this site or read
 * client pricing. The allowlist is what turns "a user in this project" into
 * "an administrator of WildHands".
 */
import { describe, expect, it } from 'vitest'
import { isAllowedEmail } from '@/lib/admin/auth'

describe('isAllowedEmail', () => {
  it('allows an address on the list', () => {
    expect(isAllowedEmail('owner+whs@wildhands.test')).toBe(true)
  })

  it('allows every entry, not just the first', () => {
    expect(isAllowedEmail('second@wildhands.test')).toBe(true)
  })

  it('refuses an address that is not on the list', () => {
    expect(isAllowedEmail('someone@elsewhere.test')).toBe(false)
  })

  it('treats a plus-addressed alias as a DIFFERENT identity', () => {
    // Load-bearing on a shared Supabase project. The bare address belongs to
    // another application in the same auth.users table; only the +whs alias is
    // ours. If anyone ever "normalises" plus-addressing away, that other app's
    // identity silently becomes a WildHands administrator — and its password
    // reset flow becomes a way into this admin. This test is the tripwire.
    expect(isAllowedEmail('owner@wildhands.test')).toBe(false)
  })

  it('ignores casing and surrounding whitespace', () => {
    expect(isAllowedEmail('  OWNER+WHS@WildHands.TEST  ')).toBe(true)
  })

  it('refuses an empty or malformed value rather than passing it through', () => {
    expect(isAllowedEmail('')).toBe(false)
    expect(isAllowedEmail('   ')).toBe(false)
    expect(isAllowedEmail('owner+whs')).toBe(false)
  })

  it('does not match on a substring', () => {
    // "owner+whs@wildhands.test.evil.com" must not pass because it contains
    // the allowed address.
    expect(isAllowedEmail('owner+whs@wildhands.test.evil.com')).toBe(false)
    expect(isAllowedEmail('notowner+whs@wildhands.test')).toBe(false)
  })
})
