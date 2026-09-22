import { beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * The admin guard in src/middleware.ts. The regression it covers: a failed
 * query in an admin page's frontmatter escaped as an uncaught error and reached
 * the browser as the platform's bare HTTP 500 (/admin/invoices, September 2026,
 * after a migration had not been run in production).
 */

vi.mock('astro:middleware', () => ({
  defineMiddleware: <T>(handler: T): T => handler,
}))

const readSession = vi.fn()
vi.mock('@/lib/admin/auth', () => ({ readSession: () => readSession() }))
vi.mock('@/config/env', () => ({ isAdminConfigured: () => true }))

const { onRequest } = await import('@/middleware')

interface FakeContext {
  url: URL
  cookies: object
  locals: Record<string, unknown>
  redirect: (path: string) => Response
  rewrite: (path: string) => Promise<Response>
}

function context(pathname: string): FakeContext {
  return {
    url: new URL(`https://wildhands.test${pathname}`),
    cookies: {},
    locals: {},
    redirect: (path) => new Response(null, { status: 302, headers: { location: path } }),
    rewrite: vi.fn(async (path: string) => new Response(`rewritten:${path}`, { status: 200 })),
  }
}

type Handler = (ctx: FakeContext, next: () => Promise<Response>) => Promise<Response>
const run = onRequest as unknown as Handler

describe('admin middleware', () => {
  beforeEach(() => {
    readSession.mockReset()
    readSession.mockResolvedValue({ userId: 'u1', email: 'owner@wildhands.test' })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('passes a page that renders straight through', async () => {
    const ok = new Response('ledger', { status: 200 })
    const response = await run(context('/admin/invoices'), async () => ok)
    expect(response).toBe(ok)
  })

  it('shows the unavailable screen instead of a bare 500 when a page throws', async () => {
    const ctx = context('/admin/invoices')
    const response = await run(ctx, async () => {
      throw new Error('column quote_payments.invoice_id does not exist')
    })

    expect(ctx.rewrite).toHaveBeenCalledWith('/admin/unavailable')
    expect(response.status).toBe(503)
    expect(await response.text()).toBe('rewritten:/admin/unavailable')
  })

  it('does not catch failures of the unavailable screen itself, so it cannot loop', async () => {
    const ctx = context('/admin/unavailable')
    await expect(
      run(ctx, async () => {
        throw new Error('boom')
      })
    ).rejects.toThrow('boom')
    expect(ctx.rewrite).not.toHaveBeenCalled()
  })

  it('still sends a signed-out visitor to sign in', async () => {
    readSession.mockResolvedValue(null)
    const response = await run(context('/admin/invoices'), async () => new Response('no'))
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/admin/sign-in?next=%2Fadmin%2Finvoices')
  })

  it('leaves the public site alone', async () => {
    const next = vi.fn(async () => new Response('home'))
    await run(context('/'), next)
    expect(next).toHaveBeenCalledOnce()
    expect(readSession).not.toHaveBeenCalled()
  })
})
