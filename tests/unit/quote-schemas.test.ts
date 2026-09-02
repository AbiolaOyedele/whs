/**
 * Server-side validation for the quote editor.
 *
 * The editor is our own React code, but it is still a browser and everything
 * below arrives over HTTP. The reference-link tests matter most: those URLs are
 * rendered as anchors on a page we send to a paying client, so the scheme
 * allowlist is the difference between a link and stored cross-site scripting.
 */
import { describe, expect, it } from 'vitest'
import {
  createQuoteSchema,
  lineItemSchema,
  quoteAccessSchema,
  referenceSchema,
  saveQuoteSchema,
} from '@/lib/schemas/quotes'

const validQuote = {
  slug: 'acme-corp',
  status: 'draft',
  clientName: 'Ada Iwu',
  clientCompany: '',
  clientEmail: '',
  clientRole: '',
  projectTitle: 'Order sync tool',
  projectSummary: '',
  introNote: '',
  currency: 'GBP',
  discountMinor: 0,
  taxRateBp: 0,
  depositPercent: 50,
  paymentTerms: '',
  terms: '',
  validUntil: null,
  lineItems: [],
  phases: [],
  references: [],
  images: [],
}

describe('referenceSchema', () => {
  it('accepts http and https links', () => {
    expect(
      referenceSchema.safeParse({ label: 'Live site', url: 'https://example.com' }).success
    ).toBe(true)
    expect(referenceSchema.safeParse({ label: 'Staging', url: 'http://example.com' }).success).toBe(
      true
    )
  })

  it('refuses a javascript: URL', () => {
    // Rendered as an anchor on the client-facing quote. Without this, a stored
    // javascript: href is script execution on a page we sent to a client.
    const result = referenceSchema.safeParse({ label: 'x', url: 'javascript:alert(1)' })
    expect(result.success).toBe(false)
  })

  it('refuses data: and other schemes', () => {
    for (const url of [
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox',
      'file:///etc/passwd',
    ]) {
      expect(referenceSchema.safeParse({ label: 'x', url }).success).toBe(false)
    }
  })

  it('refuses a scheme hidden behind whitespace or case', () => {
    expect(referenceSchema.safeParse({ label: 'x', url: '  JaVaScRiPt:alert(1)' }).success).toBe(
      false
    )
  })

  it('requires a label, so a bare URL never ships unexplained', () => {
    expect(referenceSchema.safeParse({ label: '', url: 'https://example.com' }).success).toBe(false)
  })
})

describe('lineItemSchema', () => {
  it('refuses a negative price', () => {
    expect(
      lineItemSchema.safeParse({ title: 'Work', quantity: 1, unitPriceMinor: -100 }).success
    ).toBe(false)
  })

  it('refuses a fractional price, because minor units are whole', () => {
    expect(
      lineItemSchema.safeParse({ title: 'Work', quantity: 1, unitPriceMinor: 10.5 }).success
    ).toBe(false)
  })

  it('allows a fractional quantity, because half days are real', () => {
    expect(
      lineItemSchema.safeParse({ title: 'Work', quantity: 2.5, unitPriceMinor: 65_000 }).success
    ).toBe(true)
  })

  it('requires a title so a client never sees a blank line with a price', () => {
    expect(
      lineItemSchema.safeParse({ title: '  ', quantity: 1, unitPriceMinor: 100 }).success
    ).toBe(false)
  })
})

describe('saveQuoteSchema', () => {
  it('accepts a minimal valid quote', () => {
    expect(saveQuoteSchema.safeParse(validQuote).success).toBe(true)
  })

  it('turns a blank optional field into null rather than an empty string', () => {
    const result = saveQuoteSchema.safeParse(validQuote)
    expect(result.success && result.data.clientCompany).toBeNull()
  })

  it('refuses an unknown currency', () => {
    expect(saveQuoteSchema.safeParse({ ...validQuote, currency: 'XYZ' }).success).toBe(false)
  })

  it('refuses a deposit outside 0 to 100', () => {
    expect(saveQuoteSchema.safeParse({ ...validQuote, depositPercent: 150 }).success).toBe(false)
  })

  it('refuses a tax rate above 100 percent', () => {
    expect(saveQuoteSchema.safeParse({ ...validQuote, taxRateBp: 10_001 }).success).toBe(false)
  })

  it('refuses a malformed date', () => {
    expect(saveQuoteSchema.safeParse({ ...validQuote, validUntil: '31/12/2026' }).success).toBe(
      false
    )
  })

  it('rejects a bad email but accepts a blank one', () => {
    expect(saveQuoteSchema.safeParse({ ...validQuote, clientEmail: 'not-an-email' }).success).toBe(
      false
    )
    expect(saveQuoteSchema.safeParse({ ...validQuote, clientEmail: '' }).success).toBe(true)
  })

  it('caps how many line items one quote can carry', () => {
    const many = Array.from({ length: 41 }, () => ({
      title: 'Work',
      description: '',
      quantity: 1,
      unitPriceMinor: 1000,
      isOptional: false,
    }))
    expect(saveQuoteSchema.safeParse({ ...validQuote, lineItems: many }).success).toBe(false)
  })
})

describe('createQuoteSchema', () => {
  it('defaults the currency rather than failing', () => {
    const result = createQuoteSchema.safeParse({ clientName: 'Ada', projectTitle: 'Tool' })
    expect(result.success && result.data.currency).toBe('GBP')
  })

  it('requires both a client and a project', () => {
    expect(createQuoteSchema.safeParse({ clientName: '', projectTitle: 'Tool' }).success).toBe(
      false
    )
    expect(createQuoteSchema.safeParse({ clientName: 'Ada', projectTitle: '' }).success).toBe(false)
  })
})

describe('quoteAccessSchema', () => {
  it('accepts exactly six digits', () => {
    expect(quoteAccessSchema.safeParse({ pin: '048213' }).success).toBe(true)
  })

  it('refuses anything else', () => {
    for (const pin of ['12345', '1234567', 'abcdef', '12 34 56', '']) {
      expect(quoteAccessSchema.safeParse({ pin }).success).toBe(false)
    }
  })
})
