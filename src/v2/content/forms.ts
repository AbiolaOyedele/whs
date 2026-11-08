/** Copy for /contact and /book-demo ("Talk to us"), and the rules each field is checked against. */

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
  firstName: { label: 'First name', placeholder: 'Ada' },
  lastName: { label: 'Last name', placeholder: 'Okafor' },
  email: { label: 'Email', placeholder: 'ada.okafor@example.com' },
  phone: { label: 'Phone (optional)', placeholder: '0803 123 4567' },
  message: { label: 'Message', placeholder: 'Tell us what you need help with' },
  demoMessage: { label: 'Message (optional)', placeholder: 'Anything else about your shop' },
  sells: { label: 'What you sell', placeholder: 'Choose what you sell' },
  channel: { label: 'How you sell today', placeholder: 'Choose how you sell' },
} as const

export const ERRORS = {
  firstName: 'Enter your first name.',
  lastName: 'Enter your last name.',
  emailEmpty: 'Enter your email address.',
  emailInvalid: 'Enter an email address like ada@example.com.',
  phone: 'Enter a phone number with 10 to 15 digits, or leave it blank.',
  message: 'Write a message so we know how to help.',
  tooLong: (max: number) => `Keep this under ${max.toLocaleString('en-NG')} characters.`,
  sells: 'Choose what you sell.',
  channel: 'Choose how you sell today.',
} as const

export const LIMITS = { name: 80, email: 200, message: 2000 } as const

export const CONTACT_PAGE = {
  title: 'Contact',
  lead: 'Questions about your shop, a plan or a payment? Send us a message, or email us at',
  submit: 'Send message',
} as const

export const DEMO_PAGE = {
  title: 'Talk to us',
  lead: 'Tell us about your shop and how you sell today, and we can talk through setting it up. You can also email us at',
  submit: 'Send details',
} as const

export const SELLS_OPTIONS: ChoiceOption[] = [
  { value: 'fashion', label: 'Fashion and clothing' },
  { value: 'beauty', label: 'Beauty and make-up' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'home', label: 'Home and decor' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'food', label: 'Food and drinks' },
  { value: 'other', label: 'Something else' },
]

export const CHANNEL_OPTIONS: ChoiceOption[] = [
  { value: 'not-yet', label: 'Not selling yet' },
  { value: 'social', label: 'WhatsApp and Instagram' },
  { value: 'stall', label: 'A market stall or shop' },
  { value: 'website', label: 'My own website' },
  { value: 'other-platform', label: 'Another online platform' },
  { value: 'mix', label: 'A mix of these' },
]
