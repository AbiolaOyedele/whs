/**
 * Form business logic. API routes are thin: they hand the request in here and
 * format whatever comes back. All validation, spam rejection, and delivery
 * happens in this module.
 */
import type { z } from 'zod'
import { AppError } from './errors'
import { storeCv } from './cloudinary'
import { sendNotification, type OutgoingAttachment } from './resend'
import { slugify, validateCvUpload } from './uploads'
import {
  HONEYPOT_FIELD,
  contactSchema,
  freelanceApplicationSchema,
  jobApplicationSchema,
  newsletterSchema,
} from './schemas/forms'

/**
 * Rejects cross-origin form posts. The site is same-origin only — no wildcard
 * CORS, and no preflight is ever answered.
 */
export function assertSameOrigin(request: Request, siteUrl: string): void {
  const origin = request.headers.get('origin')
  // Same-origin fetches from some browsers omit Origin entirely; that is fine.
  if (origin === null) return

  if (!allowedOrigins(siteUrl).includes(origin)) {
    throw new AppError(403, 'This request was blocked.', 'REQUEST_ORIGIN_REJECTED')
  }
}

/**
 * The origins a form may legitimately be submitted from: the configured one,
 * and its apex/www counterpart.
 *
 * Both, because the two are the same site. whstd.com redirects to
 * www.whstd.com, so a visitor who typed the bare domain is served the www page
 * and submits with a www origin — but anyone reaching an endpoint on the apex
 * host directly sends the apex origin, and that was being rejected with a 403.
 * Every form on the site was affected, not just the quote gate.
 *
 * This is not a loosening: it names two exact hosts derived from the configured
 * one. No wildcard, no subdomain matching, and nothing else is accepted.
 */
export function allowedOrigins(siteUrl: string): string[] {
  let url: URL
  try {
    url = new URL(siteUrl)
  } catch {
    throw new AppError(500, 'Server configuration problem.', 'CONFIG_SITE_URL_INVALID')
  }

  /* `host`, not `hostname`: hostname drops the port, which turned
     http://localhost:4321 into http://localhost and would have refused every
     form in local development. */
  const hostname = url.hostname
  const port = url.port ? `:${url.port}` : ''
  const counterpart = hostname.startsWith('www.') ? hostname.slice(4) : `www.${hostname}`

  return [`${url.protocol}//${hostname}${port}`, `${url.protocol}//${counterpart}${port}`]
}

/** Throws if the honeypot field carries any value. */
function assertNotBot(record: Record<string, unknown>): void {
  const trap = record[HONEYPOT_FIELD]
  if (typeof trap === 'string' && trap.trim().length > 0) {
    // Deliberately vague: a bot should not learn which field caught it.
    throw new AppError(400, 'This submission could not be accepted.', 'FORM_SUBMIT_REJECTED')
  }
}

/** Parses a request body as either JSON or FormData into a plain record. */
export async function readBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      const parsed: unknown = await request.json()
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new AppError(400, 'We could not read that submission.', 'FORM_BODY_MALFORMED')
      }
      return parsed as Record<string, unknown>
    }

    const form = await request.formData()
    return Object.fromEntries(form.entries())
  } catch (cause) {
    if (cause instanceof AppError) throw cause
    throw new AppError(400, 'We could not read that submission.', 'FORM_BODY_UNREADABLE', cause)
  }
}

/**
 * Runs a Zod schema and converts failures into a 422 with the first
 * user-facing message. Field-level messages ride along in `details` for the
 * client island to render inline — they are safe because we authored them.
 */
function parseOrThrow<S extends z.ZodType>(schema: S, input: unknown, code: string): z.infer<S> {
  const result = schema.safeParse(input)
  if (result.success) return result.data

  const fieldErrors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
  }

  const first = result.error.issues[0]?.message ?? 'Please check the form and try again.'
  throw new AppError(422, first, code, fieldErrors)
}

/** Normalises checkbox values, which arrive as "on"/"true" from FormData. */
function toBoolean(value: unknown): unknown {
  if (value === 'on' || value === 'true') return true
  if (value === 'off' || value === 'false' || value === undefined) return false
  return value
}

/** Formats a label/value list into a readable plain-text email body. */
function asTextBody(rows: Array<[string, string | undefined]>): string {
  return rows
    .filter((row): row is [string, string] => Boolean(row[1]))
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n')
}

/** Validates and delivers a contact enquiry. */
export async function submitContact(body: Record<string, unknown>): Promise<void> {
  assertNotBot(body)
  const data = parseOrThrow(contactSchema, body, 'FORM_CONTACT_INVALID_INPUT')

  await sendNotification({
    subject: `New enquiry: ${data.name}`,
    replyTo: data.email,
    text: asTextBody([
      ['Name', data.name],
      ['Email', data.email],
      ['Phone', data.phone || undefined],
      ['Heard about us via', data.referralSource || undefined],
      ['Project', `\n${data.projectDetails}`],
    ]),
  })
}

/** Validates and delivers a newsletter subscription. */
export async function submitNewsletter(body: Record<string, unknown>): Promise<void> {
  assertNotBot(body)
  const data = parseOrThrow(newsletterSchema, body, 'FORM_NEWSLETTER_INVALID_INPUT')

  await sendNotification({
    subject: `Newsletter signup: ${data.email}`,
    text: asTextBody([['Email', data.email]]),
  })
}

/**
 * Uploads a CV to storage and returns the line to print in the notification.
 *
 * The attachment is kept either way: storage is the filing system, the
 * attachment is what makes the email useful on a phone. If storage is not
 * configured, or the upload fails, the email is unchanged.
 */
async function cvStorageLine(cv: OutgoingAttachment): Promise<string | undefined> {
  const stored = await storeCv(cv.filename, cv.content)
  if (!stored) return undefined
  return `${stored.url}\n(link valid for 30 days; the file is stored as ${stored.publicId})`
}

/** Validates and delivers a freelance application, including the CV attachment. */
export async function submitFreelanceApplication(form: FormData): Promise<void> {
  const body = Object.fromEntries(form.entries())
  assertNotBot(body)

  const normalised = {
    ...body,
    confirmsB2B: toBoolean(body['confirmsB2B']),
    consentsToProcessing: toBoolean(body['consentsToProcessing']),
    consentsToFutureContact: toBoolean(body['consentsToFutureContact']),
  }
  delete (normalised as Record<string, unknown>)['cv']

  const data = parseOrThrow(freelanceApplicationSchema, normalised, 'FORM_FREELANCE_INVALID_INPUT')

  const cv = await validateCvUpload(form.get('cv'), slugify(`${data.firstName} ${data.lastName}`))
  const attachments: OutgoingAttachment[] = [cv]
  const cvLink = await cvStorageLine(cv)

  await sendNotification({
    subject: `Freelance application: ${data.firstName} ${data.lastName} (${data.position})`,
    replyTo: data.email,
    attachments,
    text: asTextBody([
      ['Name', `${data.firstName} ${data.lastName}`],
      ['Email', data.email],
      ['LinkedIn', data.linkedinUrl],
      ['Portfolio', data.portfolioUrl],
      ['Position', data.position],
      ['Country of residence', data.countryOfResidence],
      ['Tax residence', data.taxResidence],
      ['Availability', data.availability],
      ['Hours per month', data.hoursPerMonth],
      ['Open to long-term work', data.longTermInterest],
      ['Consents to future contact', data.consentsToFutureContact ? 'yes' : 'no'],
      ['CV', cvLink],
    ]),
  })
}

/** Validates and delivers a job application. */
export async function submitJobApplication(form: FormData): Promise<void> {
  const body = Object.fromEntries(form.entries())
  assertNotBot(body)

  const normalised = {
    ...body,
    consentsToProcessing: toBoolean(body['consentsToProcessing']),
  }
  delete (normalised as Record<string, unknown>)['cv']

  const data = parseOrThrow(jobApplicationSchema, normalised, 'FORM_JOB_INVALID_INPUT')

  const attachments: OutgoingAttachment[] = []
  let cvLink: string | undefined
  const cvField = form.get('cv')
  if (cvField instanceof File && cvField.size > 0) {
    const cv = await validateCvUpload(cvField, slugify(`${data.firstName} ${data.lastName}`))
    attachments.push(cv)
    cvLink = await cvStorageLine(cv)
  }

  await sendNotification({
    subject: `Job application: ${data.role}, ${data.firstName} ${data.lastName}`,
    replyTo: data.email,
    ...(attachments.length > 0 ? { attachments } : {}),
    text: asTextBody([
      ['Role', data.role],
      ['Name', `${data.firstName} ${data.lastName}`],
      ['Email', data.email],
      ['LinkedIn', data.linkedinUrl || undefined],
      ['CV', cvLink],
      ['Cover note', data.coverNote ? `\n${data.coverNote}` : undefined],
    ]),
  })
}
