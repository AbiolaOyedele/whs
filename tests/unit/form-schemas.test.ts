/** Server-side validation rules. The client mirrors these but never enforces them. */
import { describe, expect, it } from 'vitest'
import {
  CV_MAX_BYTES,
  CV_MIME_TYPES,
  contactSchema,
  freelanceApplicationSchema,
  jobApplicationSchema,
  llmsTxtGeneratorSchema,
  newsletterSchema,
} from '@/lib/schemas/forms'

describe('contactSchema', () => {
  const valid = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    projectDetails: 'We are on a legacy CMS and publishing is slow.',
  }

  it('accepts a minimal valid submission', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a malformed email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty name even when whitespace is supplied', () => {
    expect(contactSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false)
  })

  it('treats optional fields as genuinely optional', () => {
    expect(contactSchema.safeParse({ ...valid, phone: '', referralSource: '' }).success).toBe(true)
  })

  it('surfaces a plain-English message, not a code', () => {
    const result = contactSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Your name is required.')
    }
  })
})

describe('newsletterSchema', () => {
  it('accepts a valid address', () => {
    expect(newsletterSchema.safeParse({ email: 'a@b.com' }).success).toBe(true)
  })
  it('rejects an invalid address', () => {
    expect(newsletterSchema.safeParse({ email: 'nope' }).success).toBe(false)
  })
})

describe('freelanceApplicationSchema', () => {
  const valid = {
    firstName: 'Grace',
    lastName: 'Hopper',
    email: 'grace@example.com',
    linkedinUrl: 'https://linkedin.com/in/example',
    portfolioUrl: 'https://example.com',
    countryOfResidence: 'United Kingdom',
    taxResidence: 'United Kingdom',
    position: 'Frontend Developer',
    availability: 'Immediately',
    hoursPerMonth: '40-80',
    longTermInterest: 'yes',
    confirmsB2B: true,
    consentsToProcessing: true,
    consentsToFutureContact: false,
  }

  it('accepts a complete application', () => {
    expect(freelanceApplicationSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an unchecked required consent', () => {
    expect(
      freelanceApplicationSchema.safeParse({ ...valid, consentsToProcessing: false }).success
    ).toBe(false)
    expect(freelanceApplicationSchema.safeParse({ ...valid, confirmsB2B: false }).success).toBe(
      false
    )
  })

  it('rejects a URL that is not a URL', () => {
    expect(
      freelanceApplicationSchema.safeParse({ ...valid, portfolioUrl: 'my-site' }).success
    ).toBe(false)
  })

  it('rejects a position outside the allowed set', () => {
    expect(freelanceApplicationSchema.safeParse({ ...valid, position: 'CEO' }).success).toBe(false)
  })

  it('defaults the optional consent to false when omitted', () => {
    const { consentsToFutureContact: _omitted, ...withoutOptional } = valid
    const result = freelanceApplicationSchema.safeParse(withoutOptional)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.consentsToFutureContact).toBe(false)
  })
})

describe('jobApplicationSchema', () => {
  const valid = {
    role: 'Senior Frontend Engineer',
    firstName: 'Alan',
    lastName: 'Turing',
    email: 'alan@example.com',
    consentsToProcessing: true,
  }

  it('accepts a minimal application', () => {
    expect(jobApplicationSchema.safeParse(valid).success).toBe(true)
  })

  it('requires the processing consent', () => {
    expect(jobApplicationSchema.safeParse({ ...valid, consentsToProcessing: false }).success).toBe(
      false
    )
  })

  it('allows an empty optional LinkedIn field', () => {
    expect(jobApplicationSchema.safeParse({ ...valid, linkedinUrl: '' }).success).toBe(true)
  })
})

describe('llmsTxtGeneratorSchema', () => {
  it('accepts an absolute URL', () => {
    expect(llmsTxtGeneratorSchema.safeParse({ url: 'https://example.com' }).success).toBe(true)
  })
  it('rejects a bare hostname', () => {
    expect(llmsTxtGeneratorSchema.safeParse({ url: 'example.com' }).success).toBe(false)
  })
})

describe('upload constraints', () => {
  it('caps CV uploads at 3.5MB', () => {
    expect(CV_MAX_BYTES).toBe(3_500_000)
  })
  it('accepts only pdf, doc and docx', () => {
    expect([...CV_MIME_TYPES]).toEqual([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])
  })
})
