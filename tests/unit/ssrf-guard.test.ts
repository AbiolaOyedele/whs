/**
 * The llms.txt generator fetches an anonymous caller's URL server-side, so the
 * address guard is the control that stops it reaching internal infrastructure.
 * These cases are the ones that matter if the guard ever regresses.
 */
import { describe, expect, it } from 'vitest'
import { isBlockedAddress } from '@/lib/llms-txt'

describe('isBlockedAddress', () => {
  it.each([
    ['127.0.0.1', 'IPv4 loopback'],
    ['127.1.2.3', 'anywhere in 127/8'],
    ['0.0.0.0', 'unspecified'],
    ['10.0.0.1', 'RFC1918 10/8'],
    ['172.16.0.1', 'RFC1918 172.16/12 lower bound'],
    ['172.31.255.254', 'RFC1918 172.16/12 upper bound'],
    ['192.168.1.1', 'RFC1918 192.168/16'],
    ['169.254.169.254', 'cloud instance metadata'],
    ['169.254.1.1', 'link-local'],
    ['100.64.0.1', 'carrier-grade NAT'],
    ['224.0.0.1', 'multicast'],
    ['255.255.255.255', 'reserved'],
  ])('blocks %s (%s)', (address) => {
    expect(isBlockedAddress(address, 4)).toBe(true)
  })

  it.each([
    ['8.8.8.8', 'public DNS'],
    ['1.1.1.1', 'public DNS'],
    ['93.184.216.34', 'public web host'],
    ['172.15.0.1', 'just below the RFC1918 172 range'],
    ['172.32.0.1', 'just above the RFC1918 172 range'],
    ['11.0.0.1', 'just above 10/8'],
  ])('allows %s (%s)', (address) => {
    expect(isBlockedAddress(address, 4)).toBe(false)
  })

  it('blocks IPv6 loopback and unique-local space', () => {
    expect(isBlockedAddress('::1', 6)).toBe(true)
    expect(isBlockedAddress('::', 6)).toBe(true)
    expect(isBlockedAddress('fd00::1', 6)).toBe(true)
    expect(isBlockedAddress('fc00::1', 6)).toBe(true)
    expect(isBlockedAddress('fe80::1', 6)).toBe(true)
  })

  it('blocks IPv4-mapped IPv6 addresses that resolve to private space', () => {
    expect(isBlockedAddress('::ffff:127.0.0.1', 6)).toBe(true)
    expect(isBlockedAddress('::ffff:169.254.169.254', 6)).toBe(true)
    expect(isBlockedAddress('::ffff:8.8.8.8', 6)).toBe(false)
  })

  it('allows public IPv6', () => {
    expect(isBlockedAddress('2606:4700:4700::1111', 6)).toBe(false)
  })

  it('blocks malformed IPv4 rather than failing open', () => {
    expect(isBlockedAddress('not-an-ip', 4)).toBe(true)
    expect(isBlockedAddress('1.2.3', 4)).toBe(true)
    expect(isBlockedAddress('', 4)).toBe(true)
  })
})
