/**
 * Paystack guards.
 *
 * Only the offline half is pinned here: the currency allowlist and the webhook
 * signature. The network calls are verified by hand against test mode — a test
 * suite that charges a payment provider on every run is a bad idea, and one
 * that mocks the provider proves nothing about the provider.
 */
import crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { isPayableCurrency, isValidWebhook } from '@/lib/paystack'

describe('isPayableCurrency', () => {
  it('accepts what Paystack can actually charge', () => {
    for (const code of ['NGN', 'GHS', 'ZAR', 'KES', 'USD']) {
      expect(isPayableCurrency(code)).toBe(true)
    }
  })

  it('refuses GBP and EUR', () => {
    // The quote editor defaults to GBP, so this guard is what stops a pay
    // button appearing on a quote that could never be paid. The failure
    // otherwise lands after the client has clicked.
    expect(isPayableCurrency('GBP')).toBe(false)
    expect(isPayableCurrency('EUR')).toBe(false)
  })

  it('refuses nonsense rather than passing it through', () => {
    expect(isPayableCurrency('')).toBe(false)
    expect(isPayableCurrency('ngn')).toBe(false)
  })
})

describe('isValidWebhook', () => {
  const secret = process.env['PAYSTACK_SECRET_KEY'] ?? ''
  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'whs_x' } })
  const sign = (payload: string) =>
    crypto.createHmac('sha512', secret).update(payload).digest('hex')

  it('accepts a correctly signed body', () => {
    expect(isValidWebhook(body, sign(body))).toBe(true)
  })

  it('refuses an unsigned webhook', () => {
    // An unsigned webhook is an attacker telling us an invoice is paid.
    expect(isValidWebhook(body, null)).toBe(false)
    expect(isValidWebhook(body, '')).toBe(false)
  })

  it('refuses a wrong signature', () => {
    expect(isValidWebhook(body, 'deadbeef')).toBe(false)
    expect(isValidWebhook(body, sign('{"event":"something.else"}'))).toBe(false)
  })

  it('refuses a body that has been altered after signing', () => {
    // The whole point: the amount must not be editable in flight.
    const signature = sign(body)
    const tampered = body.replace('whs_x', 'whs_y')
    expect(isValidWebhook(tampered, signature)).toBe(false)
  })
})
