/**
 * Copy for every v2 form (contact, quote, job application, freelance
 * application, newsletter) and the rules each field is checked against.
 *
 * The checks here are for the visitor's benefit only. Every form posts to the
 * main site's API routes under /api/v1, which validate again against the Zod
 * schemas in src/lib/schemas/forms.ts; the limits below match those schemas.
 */
import { PROJECT_TYPES } from '@/types/public-request'
import { AVAILABILITY_OPTIONS, FREELANCE_POSITIONS, HOURS_PER_MONTH_OPTIONS } from '@/lib/schemas/form-constants'

export interface ChoiceOption {
  value: string
  label: string
}

/** The endpoints each form posts to. Same routes the original site's forms use. */
export const ENDPOINTS = {
  contact: '/api/v1/contact',
  quote: '/api/v1/quote-requests',
  job: '/api/v1/job-application',
  freelance: '/api/v1/freelance-application',
  newsletter: '/api/v1/newsletter',
} as const

export const FORM_COPY = {
  privacyLead: 'Read how we handle your details in our',
  privacyLink: 'privacy policy',
  sending: 'Sending',
  /** When the request never reached the server. */
  offline: 'We could not reach our server. Check your connection and try again.',
  /** When the server answered with an error but no message we can show. */
  failed: 'Your message did not go through. Please try again, or email us instead.',
  /** Shown above the form when the server turns a submission down. */
  errorLead: 'That did not send.',
} as const

export const FIELD_COPY = {
  firstName: { label: 'First name', placeholder: 'Your first name' },
  lastName: { label: 'Last name', placeholder: 'Your last name' },
  email: { label: 'Work email', placeholder: 'you@company.com' },
  plainEmail: { label: 'Email', placeholder: 'you@example.com' },
  phone: { label: 'Phone (optional)', placeholder: 'With your country code' },
  company: { label: 'Company (optional)', placeholder: "If you're representing one" },
  message: { label: 'Tell us about your project', placeholder: 'What is taking up your team’s time?' },
  referral: { label: 'How did you hear about us? (optional)', placeholder: 'Choose one' },
  projectType: { label: 'What are you building?', placeholder: 'Choose what fits closest' },
  projectSummary: {
    label: 'Tell us about it',
    placeholder: "What you're trying to build, who it's for, and anything about it that already exists.",
    hint: 'A sentence or two is enough. The more you can say now, the tighter the quote.',
  },
  budget: { label: 'Budget (optional)', placeholder: 'A range, a ceiling, or "no idea yet"' },
  timeline: { label: 'Timeline (optional)', placeholder: 'For example ready to start now, launch by December' },
  linkedin: { label: 'LinkedIn URL', placeholder: 'https://www.linkedin.com/in/you' },
  linkedinOptional: { label: 'LinkedIn URL (optional)', placeholder: 'https://www.linkedin.com/in/you' },
  portfolio: { label: 'Portfolio or GitHub URL', placeholder: 'https://' },
  cv: { label: 'CV', hint: 'PDF, DOC or DOCX, up to 3.5MB.' },
  cvOptional: { label: 'CV (optional)', hint: 'PDF, DOC or DOCX, up to 3.5MB.' },
  coverNote: { label: 'Anything you want us to know (optional)', placeholder: 'A line or two is plenty' },
  country: { label: 'Country of residence', placeholder: 'Choose a country' },
  taxResidence: { label: 'Country of tax residence', placeholder: 'Choose a country' },
  position: { label: 'Position', placeholder: 'Choose a position' },
  availability: { label: 'Availability', placeholder: 'Choose your availability' },
  hours: { label: 'Hours per month', placeholder: 'Choose your hours' },
  longTerm: { label: 'Interested in long-term work?', placeholder: 'Choose an answer' },
  newsletterEmail: { label: 'Email address', placeholder: 'you@company.com' },
} as const

export const CONSENT_COPY = {
  processing: 'I agree to WildHands processing my data for this application.',
  b2b: 'I can invoice as a registered business (B2B).',
  futureContact: 'Keep my details for future opportunities.',
} as const

export const ERRORS = {
  firstName: 'Enter your first name.',
  lastName: 'Enter your last name.',
  emailEmpty: 'Enter your email address.',
  emailInvalid: 'Enter an email address like you@company.com.',
  phone: 'Enter a phone number with 10 to 15 digits, or leave it blank.',
  message: 'Tell us a little about your project so we know how to help.',
  tooLong: (max: number) => `Keep this under ${max.toLocaleString('en-NG')} characters.`,
  projectType: 'Choose what you are building.',
  projectSummaryShort: 'Tell us a little more: two or three sentences is enough.',
  linkedin: 'Enter your LinkedIn profile address, starting with https://',
  linkedinOptional: 'Enter a full LinkedIn address starting with https://, or leave it blank.',
  portfolio: 'Enter a link to your portfolio or GitHub, starting with https://',
  cvMissing: 'Attach your CV.',
  cvTooLarge: 'That file is larger than 3.5MB. Attach a smaller one.',
  cvType: 'Attach your CV as a PDF, DOC or DOCX file.',
  country: 'Choose your country of residence.',
  taxResidence: 'Choose your country of tax residence.',
  position: 'Choose the position you are applying for.',
  availability: 'Choose when you could start.',
  hours: 'Choose how many hours a month you could give.',
  longTerm: 'Tell us whether you are interested in long-term work.',
  consentProcessing: 'Tick this box so we can process your application.',
  consentB2B: 'Tick this box to confirm you can invoice as a business.',
} as const

/** Matches the server schemas: names 80, email 200, contact message 5,000, quote summary 4,000. */
export const LIMITS = {
  name: 80,
  email: 200,
  phone: 40,
  company: 200,
  message: 5000,
  summaryMin: 20,
  summary: 4000,
  short: 120,
  url: 500,
  coverNote: 5000,
} as const

export const CONTACT_PAGE = {
  title: 'Get in touch',
  lead: 'Tell us what is eating your hours: the report someone rebuilds every week, the spreadsheet three people maintain, the thing you keep meaning to automate. We read every enquiry and reply with a concrete next step, usually within one working day. You can also email us at',
  submit: 'Send message',
  successTitle: 'Message sent',
} as const

export const QUOTE_PAGE = {
  title: 'Request a quote',
  lead: 'Tell us what you are building. We read every request and reply within one working day, with either a scoped quote or a couple of questions we need answered first. Nothing here is binding. You can also email us at',
  submit: 'Send request',
  successTitle: 'Request sent',
  successAction: { label: 'Back to WildHands', href: '/' },
  emailTitle: 'Prefer email?',
  emails: [
    { address: 'sales@whstd.com', note: 'new projects' },
    { address: 'hello@whstd.com', note: 'anything else' },
  ],
  rfp: 'Running a formal RFP or procurement process? Send it to the sales address and we will confirm receipt with a named contact.',
  nextTitle: 'What happens next',
  next: [
    { title: 'We read it.', body: 'A real person, not an autoresponder.' },
    { title: 'We reply.', body: 'Within one working day, with a scoped quote or a couple of questions.' },
    { title: 'You decide.', body: 'Nothing here is binding: a quote is a starting point, not a signature.' },
  ],
} as const

/** What the visitor wants built: the same list the admin queue understands. */
export const PROJECT_TYPE_OPTIONS: ChoiceOption[] = PROJECT_TYPES.map((type) => ({
  value: type.value,
  label: type.label,
}))

/** Where the visitor heard about us. Sent as free text to the server. */
export const REFERRAL_OPTIONS: ChoiceOption[] = [
  { value: 'Search', label: 'Search' },
  { value: 'A referral', label: 'A referral' },
  { value: 'An article', label: 'An article' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Somewhere else', label: 'Somewhere else' },
]

const asOptions = (values: readonly string[]): ChoiceOption[] => values.map((value) => ({ value, label: value }))

/** Countries offered on the freelance form, from the original form's list. */
export const COUNTRY_OPTIONS = asOptions([
  'United Kingdom',
  'Ireland',
  'Poland',
  'Germany',
  'Spain',
  'Portugal',
  'Netherlands',
  'France',
  'Italy',
  'United States',
  'Canada',
  'Nigeria',
  'South Africa',
  'India',
  'Australia',
  'Other',
])

export const POSITION_OPTIONS = asOptions(FREELANCE_POSITIONS)
export const AVAILABILITY_CHOICES = asOptions(AVAILABILITY_OPTIONS)
export const HOURS_CHOICES = asOptions(HOURS_PER_MONTH_OPTIONS)
export const LONG_TERM_OPTIONS: ChoiceOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const NEWSLETTER_COPY = {
  submit: 'Subscribe',
  successTitle: 'You are on the list',
} as const
