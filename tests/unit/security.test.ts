/**
 * Request-level security controls: origin enforcement, the honeypot trap,
 * upload validation, and the rate limiter.
 */
import { describe, expect, it } from 'vitest'
import { AppError, isAppError, toErrorResponse, toSuccessResponse } from '@/lib/errors'
import { assertSameOrigin, readBody, submitContact } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'
import { slugify, validateCvUpload } from '@/lib/uploads'
import { CV_MAX_BYTES } from '@/lib/schemas/forms'

const SITE = 'https://wildhands.test'

const request = (headers: Record<string, string> = {}, body?: BodyInit) =>
  new Request(`${SITE}/api/v1/contact`, { method: 'POST', headers, ...(body ? { body } : {}) })

describe('assertSameOrigin', () => {
  it('allows a matching origin', () => {
    expect(() => assertSameOrigin(request({ origin: SITE }), SITE)).not.toThrow()
  })

  it('allows a request with no Origin header', () => {
    // Some same-origin form posts omit Origin entirely; blocking them would break the site.
    expect(() => assertSameOrigin(request(), SITE)).not.toThrow()
  })

  it('rejects a cross-origin request', () => {
    expect(() => assertSameOrigin(request({ origin: 'https://evil.test' }), SITE)).toThrow(AppError)
  })

  it('rejects a look-alike subdomain', () => {
    expect(() =>
      assertSameOrigin(request({ origin: 'https://wildhands.test.evil.test' }), SITE)
    ).toThrow()
  })

  it('returns 403 with a non-specific message', () => {
    try {
      assertSameOrigin(request({ origin: 'https://evil.test' }), SITE)
      expect.unreachable()
    } catch (error) {
      expect(isAppError(error)).toBe(true)
      if (isAppError(error)) {
        expect(error.statusCode).toBe(403)
        expect(error.code).toBe('REQUEST_ORIGIN_REJECTED')
      }
    }
  })
})

describe('honeypot', () => {
  it('rejects a submission with the trap field filled', async () => {
    await expect(
      submitContact({
        name: 'Bot',
        email: 'bot@example.com',
        projectDetails: 'spam',
        company_fax: 'filled-by-a-bot',
      })
    ).rejects.toMatchObject({ code: 'FORM_SUBMIT_REJECTED', statusCode: 400 })
  })

  it('does not reveal which field caught the submission', async () => {
    try {
      await submitContact({ name: 'Bot', email: 'b@e.com', projectDetails: 'x', company_fax: 'y' })
      expect.unreachable()
    } catch (error) {
      if (isAppError(error)) {
        expect(error.message).not.toMatch(/fax|honeypot|company/i)
      }
    }
  })

  it('ignores a trap field that is present but empty', async () => {
    // Should fail at delivery (no real Resend key), not at the spam check.
    await expect(
      submitContact({
        name: 'Real Person',
        email: 'real@example.com',
        projectDetails: 'A genuine enquiry about a migration.',
        company_fax: '',
      })
    ).rejects.toMatchObject({ code: expect.stringMatching(/^EMAIL_SEND_/) })
  })
})

describe('validateCvUpload', () => {
  const file = (bytes: number, type: string, name = 'cv.pdf') =>
    new File([new Uint8Array(bytes)], name, { type })

  it('accepts a valid PDF', async () => {
    const result = await validateCvUpload(file(1000, 'application/pdf'), 'ada-lovelace')
    expect(result.filename).toBe('cv-ada-lovelace.pdf')
    expect(result.content.byteLength).toBe(1000)
  })

  it('renames rather than trusting the client filename', async () => {
    const result = await validateCvUpload(file(10, 'application/pdf', '../../../etc/passwd'), 'ada')
    expect(result.filename).toBe('cv-ada.pdf')
    expect(result.filename).not.toContain('/')
    expect(result.filename).not.toContain('..')
  })

  it('rejects a disallowed MIME type even with a .pdf extension', async () => {
    await expect(
      validateCvUpload(file(10, 'application/x-msdownload', 'cv.pdf'), 'x')
    ).rejects.toMatchObject({ code: 'UPLOAD_CV_INVALID_TYPE' })
  })

  it('rejects a file over the size cap', async () => {
    await expect(
      validateCvUpload(file(CV_MAX_BYTES + 1, 'application/pdf'), 'x')
    ).rejects.toMatchObject({
      code: 'UPLOAD_CV_TOO_LARGE',
    })
  })

  it('rejects a missing or empty upload', async () => {
    await expect(validateCvUpload(undefined, 'x')).rejects.toMatchObject({
      code: 'UPLOAD_CV_MISSING',
    })
    await expect(validateCvUpload(file(0, 'application/pdf'), 'x')).rejects.toMatchObject({
      code: 'UPLOAD_CV_MISSING',
    })
  })

  it('falls back to a safe owner segment when the slug is unusable', async () => {
    const result = await validateCvUpload(file(10, 'application/pdf'), '../../')
    expect(result.filename).toBe('cv-applicant.pdf')
  })
})

describe('slugify', () => {
  it('strips punctuation and lowercases', () => {
    expect(slugify('Harbor & Finch')).toBe('harbor-finch')
    expect(slugify('  Ada   Lovelace  ')).toBe('ada-lovelace')
  })
})

describe('enforceRateLimit', () => {
  it('permits requests up to the limit then rejects', () => {
    const key = `test-${Math.random()}`
    for (let i = 0; i < 5; i++) expect(() => enforceRateLimit(key, 5, 60_000)).not.toThrow()
    expect(() => enforceRateLimit(key, 5, 60_000)).toThrow(AppError)
  })

  it('returns 429 with a retry-friendly message', () => {
    const key = `test-${Math.random()}`
    enforceRateLimit(key, 1, 60_000)
    try {
      enforceRateLimit(key, 1, 60_000)
      expect.unreachable()
    } catch (error) {
      if (isAppError(error)) {
        expect(error.statusCode).toBe(429)
        expect(error.code).toBe('FORM_SUBMIT_RATE_LIMITED')
      }
    }
  })

  it('keeps buckets independent per key', () => {
    const a = `a-${Math.random()}`
    const b = `b-${Math.random()}`
    enforceRateLimit(a, 1, 60_000)
    expect(() => enforceRateLimit(b, 1, 60_000)).not.toThrow()
  })
})

describe('clientIp', () => {
  it('takes the first hop from x-forwarded-for', () => {
    expect(clientIp(request({ 'x-forwarded-for': '203.0.113.5, 70.41.3.18' }))).toBe('203.0.113.5')
  })
  it('falls back to x-real-ip', () => {
    expect(clientIp(request({ 'x-real-ip': '203.0.113.9' }))).toBe('203.0.113.9')
  })
  it('falls back to a shared bucket when no header is present', () => {
    expect(clientIp(request())).toBe('unknown')
  })
})

describe('error responses', () => {
  it('never leaks internal details for an unknown error', async () => {
    const response = toErrorResponse(new Error('connection string: postgres://user:pw@host'))
    expect(response.status).toBe(500)
    const body = await response.text()
    expect(body).not.toContain('postgres://')
    expect(JSON.parse(body)).toEqual({
      error: { code: 'SERVER_REQUEST_FAILED', message: expect.any(String) },
    })
  })

  it('never serialises the details field of an AppError', async () => {
    const response = toErrorResponse(
      new AppError(422, 'Please check the form.', 'FORM_TEST', { secret: 'do-not-leak' })
    )
    const body = await response.text()
    expect(body).not.toContain('do-not-leak')
    expect(response.status).toBe(422)
  })

  it('formats a success response consistently', async () => {
    const response = toSuccessResponse('Done', 201)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ ok: true, message: 'Done' })
  })
})

describe('readBody', () => {
  it('parses JSON bodies', async () => {
    const req = new Request(`${SITE}/x`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ a: 1 }),
    })
    expect(await readBody(req)).toEqual({ a: 1 })
  })

  it('rejects a JSON array rather than coercing it', async () => {
    const req = new Request(`${SITE}/x`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify([1, 2]),
    })
    await expect(readBody(req)).rejects.toMatchObject({ code: 'FORM_BODY_MALFORMED' })
  })

  it('rejects malformed JSON', async () => {
    const req = new Request(`${SITE}/x`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not json',
    })
    await expect(readBody(req)).rejects.toMatchObject({ code: 'FORM_BODY_UNREADABLE' })
  })
})

describe('env resolution', () => {
  it('does not require server secrets at import time', async () => {
    // The build must succeed with no secrets configured — this is what broke
    // the first Vercel deploy. Importing the module must not throw.
    const mod = await import('@/config/env')
    expect(typeof mod.serverEnv).toBe('function')
    expect(mod.publicEnv.PUBLIC_SITE_URL).toBeTruthy()
  })

  it('resolves a canonical site URL', async () => {
    const { publicEnv } = await import('@/config/env')
    expect(() => new URL(publicEnv.PUBLIC_SITE_URL)).not.toThrow()
  })
})
