/**
 * Zod schemas for all four public forms. These are the single source of truth —
 * API routes validate against them server-side, and the React islands reuse the
 * same field rules for UX-only client validation.
 */
import { z } from 'zod'
import {
  AVAILABILITY_OPTIONS,
  FREELANCE_POSITIONS,
  HONEYPOT_FIELD,
  HOURS_PER_MONTH_OPTIONS,
} from './form-constants'

// Constants live in ./form-constants so the client islands can import them
// without pulling Zod into the browser bundle.
export * from './form-constants'

const honeypot = z.string().max(0, 'Rejected.').optional().or(z.literal('').optional())

const requiredText = (label: string, max = 2_000) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`)

export const contactSchema = z.object({
  name: requiredText('Your name', 120),
  email: z.email('Enter a valid work email address.').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  projectDetails: requiredText('A short description of your project', 5_000),
  referralSource: z.string().trim().max(200).optional().or(z.literal('')),
  [HONEYPOT_FIELD]: honeypot,
})

export type ContactInput = z.infer<typeof contactSchema>

export const newsletterSchema = z.object({
  email: z.email('Enter a valid email address.').max(200),
  [HONEYPOT_FIELD]: honeypot,
})

export type NewsletterInput = z.infer<typeof newsletterSchema>

export const freelanceApplicationSchema = z.object({
  firstName: requiredText('First name', 80),
  lastName: requiredText('Last name', 80),
  email: z.email('Enter a valid email address.').max(200),
  linkedinUrl: z.url('Enter a valid LinkedIn URL.').max(500),
  portfolioUrl: z.url('Enter a valid portfolio or GitHub URL.').max(500),
  countryOfResidence: requiredText('Country of residence', 100),
  taxResidence: requiredText('Country of tax residence', 100),
  position: z.enum(FREELANCE_POSITIONS),
  availability: z.enum(AVAILABILITY_OPTIONS),
  hoursPerMonth: z.enum(HOURS_PER_MONTH_OPTIONS),
  longTermInterest: z.enum(['yes', 'no']),
  /** Required consent — must be literally true. */
  confirmsB2B: z.literal(true, 'Please confirm you can invoice as a business.'),
  consentsToProcessing: z.literal(true, 'Please accept the data processing terms.'),
  /** Optional consent. */
  consentsToFutureContact: z.boolean().default(false),
  [HONEYPOT_FIELD]: honeypot,
})

export type FreelanceApplicationInput = z.infer<typeof freelanceApplicationSchema>

export const jobApplicationSchema = z.object({
  role: requiredText('Role', 120),
  firstName: requiredText('First name', 80),
  lastName: requiredText('Last name', 80),
  email: z.email('Enter a valid email address.').max(200),
  linkedinUrl: z.url('Enter a valid LinkedIn URL.').max(500).optional().or(z.literal('')),
  coverNote: z.string().trim().max(5_000).optional().or(z.literal('')),
  consentsToProcessing: z.literal(true, 'Please accept the data processing terms.'),
  [HONEYPOT_FIELD]: honeypot,
})

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>

export const llmsTxtGeneratorSchema = z.object({
  url: z.url('Enter a full website or sitemap URL, including https://').max(500),
})

export type LlmsTxtGeneratorInput = z.infer<typeof llmsTxtGeneratorSchema>
