/**
 * The Paystack webhook as the hub for the business: what is ours is settled
 * here, what is not is passed on, and nothing unsigned goes anywhere.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  isValidWebhook: vi.fn(),
  getPaymentByReference: vi.fn(),
  reconcilePayment: vi.fn(),
  forwardWebhook: vi.fn(),
}))

vi.mock('@/lib/paystack', () => ({ isValidWebhook: mocks.isValidWebhook }))
vi.mock('@/lib/admin/repositories/payments', () => ({
  getPaymentByReference: mocks.getPaymentByReference,
}))
vi.mock('@/lib/admin/payment-reconcile', () => ({ reconcilePayment: mocks.reconcilePayment }))
vi.mock('@/lib/paystack-forward', () => ({
  forwardUrls: () => ['https://dooja.shop/api/v1/webhooks/paystack'],
  forwardWebhook: mocks.forwardWebhook,
}))

const { POST } = await import('@/pages/api/v1/webhooks/paystack')

const call = (body: string, signature: string | null) => {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (signature) headers['x-paystack-signature'] = signature
  const request = new Request('https://www.whstd.com/api/v1/webhooks/paystack', {
    method: 'POST',
    headers,
    body,
  })
  return POST({ request } as Parameters<typeof POST>[0])
}

const charge = (reference: string) =>
  JSON.stringify({ event: 'charge.success', data: { reference } })

beforeEach(() => {
  vi.clearAllMocks()
  mocks.forwardWebhook.mockResolvedValue([])
})

describe('Paystack webhook hub', () => {
  it('refuses an unsigned event and passes nothing on', async () => {
    mocks.isValidWebhook.mockReturnValue(false)
    const response = await call(charge('AL-1'), 'bad')
    expect(response.status).toBe(401)
    expect(mocks.forwardWebhook).not.toHaveBeenCalled()
  })

  it('refuses an event with no signature header at all', async () => {
    const response = await call(charge('AL-1'), null)
    expect(response.status).toBe(401)
    expect(mocks.forwardWebhook).not.toHaveBeenCalled()
  })

  it('settles our own payment here and does not pass it on', async () => {
    mocks.isValidWebhook.mockReturnValue(true)
    mocks.getPaymentByReference.mockResolvedValue({ reference: 'whs_1' })
    const response = await call(charge('whs_1'), 'sig')
    expect(response.status).toBe(200)
    expect(mocks.reconcilePayment).toHaveBeenCalledOnce()
    expect(mocks.forwardWebhook).not.toHaveBeenCalled()
  })

  it('passes on another product’s payment, body and signature untouched', async () => {
    mocks.isValidWebhook.mockReturnValue(true)
    mocks.getPaymentByReference.mockResolvedValue(null)
    const body = charge('AL-261107-B49D6E')
    const response = await call(body, 'sig')
    expect(response.status).toBe(200)
    expect(mocks.reconcilePayment).not.toHaveBeenCalled()
    expect(mocks.forwardWebhook).toHaveBeenCalledWith(body, 'sig', [
      'https://dooja.shop/api/v1/webhooks/paystack',
    ])
  })

  it('passes on events that are not payments, such as refunds', async () => {
    mocks.isValidWebhook.mockReturnValue(true)
    const body = JSON.stringify({ event: 'refund.processed', data: { reference: 'AL-1' } })
    await call(body, 'sig')
    expect(mocks.getPaymentByReference).not.toHaveBeenCalled()
    expect(mocks.forwardWebhook).toHaveBeenCalledWith(body, 'sig', expect.any(Array))
  })

  it('still answers 200 when a product downstream is down', async () => {
    mocks.isValidWebhook.mockReturnValue(true)
    mocks.getPaymentByReference.mockResolvedValue(null)
    mocks.forwardWebhook.mockResolvedValue([
      { url: 'https://dooja.shop/api/v1/webhooks/paystack', ok: false, status: null },
    ])
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = await call(charge('AL-1'), 'sig')
    expect(response.status).toBe(200)
  })
})
