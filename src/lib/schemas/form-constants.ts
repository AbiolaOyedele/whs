/**
 * Plain constants shared between the server-side Zod schemas and the client
 * islands.
 *
 * This module deliberately imports NOTHING. The React islands need these values
 * for their markup (accept attributes, select options, the honeypot name), and
 * importing them from the schema module would pull the whole of Zod into the
 * client bundle for no benefit — client-side validation is UX only.
 */

/** Accepted CV formats. Checked against the real File.type server-side. */
export const CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

/** 3.5MB, per the brief. */
export const CV_MAX_BYTES = 3_500_000

export const CV_ACCEPT_ATTRIBUTE = '.pdf,.doc,.docx'

/**
 * Honeypot field name. Rendered visually hidden and deliberately misleading so
 * bots fill it and humans never see it. Any non-empty value rejects the submission.
 */
export const HONEYPOT_FIELD = 'company_fax'

export const FREELANCE_POSITIONS = [
  'Frontend Developer',
  'Web Designer',
  'Webflow Developer',
  'Talent Pool',
] as const

export const AVAILABILITY_OPTIONS = [
  'Immediately',
  'Within 2 weeks',
  'Within a month',
  'Just exploring',
] as const

export const HOURS_PER_MONTH_OPTIONS = ['Up to 40', '40-80', '80-120', '120+'] as const
