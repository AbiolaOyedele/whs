/**
 * Copy and plan data for /pricing.
 *
 * Two fixed-price website builds (Starter and Standard) and two custom builds
 * that are quoted after a discovery call. The ids are fixed keys the page
 * components switch on, so they no longer match the plan names: 'starter' is
 * Starter, 'growth' is Standard, 'pro' is Apps and 'free' is Tools.
 */

export type PlanId = 'free' | 'starter' | 'growth' | 'pro'

export interface PricingPlan {
  id: PlanId
  name: string
  tagline: string
  /** One-off price, in kobo. 0 means the build is quoted after a discovery call. */
  monthlyKobo: number
  /** The deposit taken to start, as a share of the price in basis points (5000 = 50%). 0 when quoted. */
  feeBps: number
  /** What the plan card lists, in order. */
  highlights: string[]
  cta: string
  /** Shorter label for the narrow comparison columns. */
  compareCta: string
}

export const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'One page, live in 72 hours',
    monthlyKobo: 15_000_000,
    feeBps: 5000,
    highlights: [
      'One page, mobile-ready',
      'WhatsApp and contact buttons that work',
      'Your logo, photos and text laid out professionally',
      'Hosted and connected to your domain',
      '2 rounds of edits',
    ],
    cta: 'Start with Starter',
    compareCta: 'Get Starter',
  },
  {
    id: 'growth',
    name: 'Standard',
    tagline: 'Up to 4 pages you can edit yourself',
    monthlyKobo: 25_000_000,
    feeBps: 5000,
    highlights: [
      'Everything in Starter, up to 4 pages',
      'A simple dashboard where you change text, photos, prices and announcements',
      'See how many people visited, what they looked at and where they came from',
      'Copywriting from a 15-minute call',
      '3 rounds of edits',
    ],
    cta: 'Start with Standard',
    compareCta: 'Get Standard',
  },
  {
    id: 'pro',
    name: 'Apps',
    tagline: 'Web apps and larger builds',
    monthlyKobo: 0,
    feeBps: 0,
    highlights: [
      'Custom web apps',
      'Larger websites, past 4 pages',
      'Built around how you actually work',
      'Quoted after a discovery call',
      'A written plan before work starts',
    ],
    cta: 'Talk to us',
    compareCta: 'Talk to us',
  },
  {
    id: 'free',
    name: 'Tools',
    tagline: 'Dashboards and jobs done for you',
    monthlyKobo: 0,
    feeBps: 0,
    highlights: [
      'Dashboards that put the numbers in one place',
      'Your tools talk to each other, so you stop copying between them',
      'Judged on the hours it gives back',
      'Quoted after a discovery call',
      'A written plan before work starts',
    ],
    cta: 'Talk to us',
    compareCta: 'Talk to us',
  },
]

/** The plan we recommend: it gets the pink tab and the pink button. */
export const TRIAL_PLAN: PlanId = 'growth'
/** Hours from approved design to a live site, on Starter and Standard. */
export const TRIAL_DAYS = 72
/** Hours you have to approve the design before any code is written. */
export const GRACE_DAYS = 24
/** The pink tab above the featured plan's card. */
export const TRIAL_TAB = 'Recommended'
/** Printed after a fixed price. */
export const PER_MONTH = 'one-off'
/** No VAT is added to these prices. */
export const VAT_BPS = 0

/**
 * The two ways a price is shown: in full, or the deposit that starts the work.
 * `discount` is the share of the price not taken up front, in percent, so 50
 * leaves the 50% deposit.
 */
export const CYCLES = [
  { months: 1, discount: 0 },
  { months: 1, discount: 50 },
] as const

export type Cycle = (typeof CYCLES)[number]

/* ── hero ─────────────────────────────────────────────────────────── */

export const HERO = {
  title: { highlight: 'Live', rest: 'in 72 hours, priced up front' },
  body: 'A website for your business for one fixed price, with half paid to start. You approve the design within 24 hours, before we build anything. Apps, tools for your team and larger builds are quoted after a discovery call.',
  primary: 'Get in touch',
  secondary: 'Request a quote',
} as const

export const PRICE_CARD = {
  title: 'Prices',
  planHeading: 'Plan',
  priceHeading: 'Price',
  feeSection: 'Deposit to start',
  feeHeading: 'Deposit',
  /** Shown in place of a price or a deposit for the builds quoted after a call. */
  noFee: 'Quoted',
  feeNote: '*Paying from outside Nigeria? Ask for USD pricing on WhatsApp: 0812 979 6927',
} as const

/* ── plan comparison ──────────────────────────────────────────────── */

export type CompareValue = string | boolean

export interface CompareRow {
  label: string
  /** One value per plan, in PLANS order. `true` draws a tick, `false` a dash. */
  values: [CompareValue, CompareValue, CompareValue, CompareValue]
}

export interface CompareGroup {
  title: string
  rows: CompareRow[]
}

export const COMPARE_TITLE = 'Compare the plans'
export const COMPARE_PRICE_LABEL = 'Price'

export const COMPARE_GROUPS: CompareGroup[] = [
  {
    title: 'The website',
    rows: [
      { label: 'Pages', values: ['1', 'Up to 4', 'As quoted', 'As quoted'] },
      { label: 'Mobile-ready', values: [true, true, 'As quoted', 'As quoted'] },
      { label: 'WhatsApp and contact buttons', values: [true, true, 'As quoted', 'As quoted'] },
      { label: 'Hosted and connected to your domain', values: [true, true, 'As quoted', 'As quoted'] },
    ],
  },
  {
    title: 'Running it yourself',
    rows: [
      { label: 'Change words and photos yourself', values: [false, true, 'As quoted', 'As quoted'] },
      { label: 'See who visited and what they looked at', values: [false, true, 'As quoted', 'As quoted'] },
      { label: 'Copywriting from a 15-minute call', values: [false, true, 'As quoted', 'As quoted'] },
    ],
  },
  {
    title: 'Timeline and payment',
    rows: [
      { label: 'Live in', values: ['72 hours', '72 hours', 'As quoted', 'As quoted'] },
      { label: 'Rounds of edits', values: ['2', '3', 'As quoted', 'As quoted'] },
      { label: 'Deposit to start', values: ['₦75,000', '₦125,000', 'Quoted', 'Quoted'] },
    ],
  },
]

/* ── calculator ───────────────────────────────────────────────────── */

/**
 * The calculator's fields. The keys are fixed by the component: `orders` is
 * the pages slider, `average` the budget slider and `months` the full price
 * or deposit choice (an index into CYCLES).
 */
export const CALCULATOR = {
  title: { line: 'What you', highlight: 'would pay' },
  intro: 'Choose a plan and how you want to pay, then set how many pages you need and your budget.',
  totalHeading: 'What you pay now',
  onSales: 'Against a budget of',
  cheapest: 'Best fit for these pages:',
  details: 'Details',
  estimate: 'Amount',
  planLine: 'full price',
  vatLine: 'Deposit to start',
  feeLine: 'Budget left after full price',
  totalLine: 'Pay now',
  perMonth: '',
  footnote: '*Live in 72 hours on Starter and Standard. Apps and tools are quoted after a discovery call.',
  orders: { label: 'Pages you need', hint: '*Starter is one page, Standard up to 4', min: 1, max: 10, step: 1, typedMax: 99 },
  average: { label: 'Your budget', hint: 'Roughly what you have set aside', min: 75_000, max: 1_000_000, step: 5_000 },
  months: { label: 'How you pay', placeholder: 'Choose how to pay' },
  plan: { label: 'Plan', placeholder: 'Choose a plan' },
  defaults: { orders: 1, average: 150_000, months: 0, plan: 'starter' as PlanId },
} as const

/* ── questions ────────────────────────────────────────────────────── */

export interface Faq {
  question: string
  answer: string[]
}

export const FAQ_TITLE = 'Pricing questions'

export const FAQS: Faq[] = [
  {
    question: 'What do I need to send you?',
    answer: [
      'Your logo, your photos and the text you want on the site. On Standard we can write the copy for you from a 15-minute call.',
    ],
  },
  {
    question: 'What if I do not like the design?',
    answer: [
      `You see the design first and approve it within ${GRACE_DAYS} hours, before we build anything. Starter includes 2 rounds of edits and Standard includes 3.`,
    ],
  },
  {
    question: 'Do I own the website?',
    answer: ['Yes. You own the site, the domain and everything on it.'],
  },
  {
    question: 'What about my domain?',
    answer: [
      'If you already have one, we connect it. If not, we register one for you and add the cost to the invoice.',
    ],
  },
  {
    question: 'What happens after the edit rounds?',
    answer: ['Further changes are billed by the hour, and we quote them before we start.'],
  },
  {
    question: 'How do I start?',
    answer: [
      `Pay the deposit, half the price, to start. Starter and Standard sites are live in ${TRIAL_DAYS} hours.`,
    ],
  },
  {
    question: 'I am paying from outside Nigeria. Can I pay in dollars?',
    answer: ['Yes. Ask us for USD pricing on WhatsApp: 0812 979 6927.'],
  },
]
