/** Copy for /contact and /book-demo ("Request a quote"), and the rules each field is checked against. */

export interface ChoiceOption {
  value: string
  label: string
}

export const FORM_COPY = {
  /** Shown on a valid submit: there is no backend for this site yet. Never a fake success. */
  notConnectedLead: "This form isn't connected yet. Email us at",
  notConnectedTail: 'for now.',
  privacyLead: 'Read how we handle your details in our',
  privacyLink: 'privacy policy',
} as const

export const FIELD_COPY = {
  firstName: { label: 'First name', placeholder: 'Your first name' },
  lastName: { label: 'Last name', placeholder: 'Your last name' },
  email: { label: 'Work email', placeholder: 'you@company.com' },
  phone: { label: 'Phone (optional)', placeholder: 'With your country code' },
  message: { label: 'Tell us about your project', placeholder: 'What is taking up your team’s time?' },
  demoMessage: { label: 'Tell us about it (optional)', placeholder: 'Rough budget, timeline, anything that helps us reply usefully' },
  sells: { label: 'What you need', placeholder: 'Choose what you need' },
  channel: { label: 'How did you hear about us?', placeholder: 'Choose one' },
} as const

export const ERRORS = {
  firstName: 'Enter your first name.',
  lastName: 'Enter your last name.',
  emailEmpty: 'Enter your email address.',
  emailInvalid: 'Enter an email address like you@company.com.',
  phone: 'Enter a phone number with 10 to 15 digits, or leave it blank.',
  message: 'Tell us a little about your project so we know how to help.',
  tooLong: (max: number) => `Keep this under ${max.toLocaleString('en-NG')} characters.`,
  sells: 'Choose what you need.',
  channel: 'Choose how you heard about us.',
} as const

export const LIMITS = { name: 80, email: 200, message: 2000 } as const

export const CONTACT_PAGE = {
  title: 'Get in touch',
  lead: 'Tell us what is eating your hours: the report someone rebuilds every week, the spreadsheet three people maintain, the thing you keep meaning to automate. We read every enquiry and reply with a concrete next step, usually within one working day. You can also email us at',
  submit: 'Send message',
} as const

export const DEMO_PAGE = {
  title: 'Request a quote',
  lead: 'Tell us what you are building. We read every request and reply within one working day, with either a scoped quote or a couple of questions we need answered first. Nothing here is binding. You can also email us at',
  submit: 'Send request',
} as const

/** What the visitor wants built, from the main site's quote form. */
export const SELLS_OPTIONS: ChoiceOption[] = [
  { value: 'website', label: 'A website' },
  { value: 'web-app', label: 'A web app or platform' },
  { value: 'internal-tool', label: 'An internal tool or dashboard' },
  { value: 'redesign', label: 'A redesign of something we already have' },
  { value: 'other', label: 'Something else' },
]

/** Where the visitor heard about us. */
export const CHANNEL_OPTIONS: ChoiceOption[] = [
  { value: 'search', label: 'Search' },
  { value: 'referral', label: 'A referral' },
  { value: 'article', label: 'An article' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'other', label: 'Somewhere else' },
]
