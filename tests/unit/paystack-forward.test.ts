/**
 * Passing a Paystack webhook on to the other products on the business.
 *
 * What matters: the body and signature arrive untouched (or the downstream
 * signature check fails), every product is tried even when one is down, and
 * nothing that is not an https URL is ever called.
 */
import { describe, expect, it, vi } from 'vitest'
import { forwardWebhook, parseForwardUrls } from '@/lib/paystack-forward'

const body = '{"event":"charge.success","data":{"reference":"AL-261107-B49D6E"}}'
const signature = 'a'.repeat(128)

describe('parseForwardUrls', () => {
  it('splits a comma-separated list and trims it', () => {
    expect(
      parseForwardUrls(' https://app.trydumpty.com/api/v1/hooks/paystack , https://dooja.shop/api/v1/webhooks/paystack')
    ).toEqual([
      'https://app.trydumpty.com/api/v1/hooks/paystack',
      'https://dooja.shop/api/v1/webhooks/paystack',
    ])
  })

  it('drops anything that is not an https URL', () => {
    expect(parseForwardUrls('http://plain.example.com,not a url,,https://ok.example.com')).toEqual([
      'https://ok.example.com',
    ])
  })

  it('is empty when unset', () => {
    expect(parseForwardUrls(undefined)).toEqual([])
    expect(parseForwardUrls('')).toEqual([])
  })
})

describe('forwardWebhook', () => {
  it('sends the exact body and the original signature to every URL', async () => {
    const send = vi.fn(async () => new Response('ok', { status: 200 }))
    const urls = ['https://a.example.com/hook', 'https://b.example.com/hook']

    const results = await forwardWebhook(body, signature, urls, send as unknown as typeof fetch)

    expect(send).toHaveBeenCalledTimes(2)
    for (const [index, url] of urls.entries()) {
      const [calledUrl, init] = send.mock.calls[index] as unknown as [string, RequestInit]
      expect(calledUrl).toBe(url)
      expect(init.method).toBe('POST')
      expect(init.body).toBe(body)
      expect((init.headers as Record<string, string>)['x-paystack-signature']).toBe(signature)
    }
    expect(results.every((r) => r.ok)).toBe(true)
  })

  it('still reaches the others when one is down, and never throws', async () => {
    const send = vi.fn(async (url: string) => {
      if (url.includes('down')) throw new Error('connection refused')
      return new Response('ok', { status: 200 })
    })

    const results = await forwardWebhook(
      body,
      signature,
      ['https://down.example.com/hook', 'https://up.example.com/hook'],
      send as unknown as typeof fetch
    )

    expect(results).toEqual([
      { url: 'https://down.example.com/hook', ok: false, status: null },
      { url: 'https://up.example.com/hook', ok: true, status: 200 },
    ])
  })

  it('reports a downstream rejection as not ok', async () => {
    const send = vi.fn(async () => new Response('Unauthorised', { status: 401 }))
    const [result] = await forwardWebhook(body, signature, ['https://a.example.com/hook'], send as unknown as typeof fetch)
    expect(result).toEqual({ url: 'https://a.example.com/hook', ok: false, status: 401 })
  })

  it('does nothing with no URLs', async () => {
    const send = vi.fn()
    expect(await forwardWebhook(body, signature, [], send as unknown as typeof fetch)).toEqual([])
    expect(send).not.toHaveBeenCalled()
  })
})
