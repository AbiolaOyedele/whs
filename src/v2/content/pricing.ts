/**
 * Copy and plan data for /pricing.
 *
 * The plan figures mirror the main app's src/config/plans.ts (PLANS, CYCLES,
 * TRIAL_DAYS, GRACE_DAYS, VAT_BPS). This site is a separate app and cannot
 * import that file, so when a price, fee or limit changes there, change it
 * here too.
 */

export type PlanId = 'free' | 'starter' | 'growth' | 'pro'

export interface PricingPlan {
  id: PlanId
  name: string
  tagline: string
  /** Price for one month, in kobo, before VAT. */
  monthlyKobo: number
  /** The platform's cut of each online sale, in basis points (100 = 1%). */
  feeBps: number
  /** What the plan card lists, in order. */
  highlights: string[]
  cta: string
  /** Shorter label for the narrow comparison columns. */
  compareCta: string
}

export const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Start selling for nothing',
    monthlyKobo: 0,
    feeBps: 300,
    highlights: ['Online shop and checkout', 'Up to 25 products', 'Just you', '1 written report a month', '3% on each online sale'],
    cta: 'Start for free',
    compareCta: 'Start free',
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For a shop finding its feet',
    monthlyKobo: 350_000,
    feeBps: 100,
    highlights: ['Up to 300 products', '2 staff', 'Email campaigns', 'Your own domain', '1% on each online sale'],
    cta: 'Choose Starter',
    compareCta: 'Get Starter',
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For a shop that sells every day',
    monthlyKobo: 900_000,
    feeBps: 0,
    highlights: ['Unlimited products', '5 staff', 'Full business report', '5 written reports a month', 'No fee on sales'],
    cta: 'Try Growth free',
    compareCta: 'Try Growth',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For a busy team',
    monthlyKobo: 2_000_000,
    feeBps: 0,
    highlights: ['Everything in Growth', 'Unlimited staff', '15 written reports a month', 'Priority support', 'No fee on sales'],
    cta: 'Choose Pro',
    compareCta: 'Get Pro',
  },
]

/** The plan every new shop tries, and for how long. */
export const TRIAL_PLAN: PlanId = 'growth'
export const TRIAL_DAYS = 7
export const GRACE_DAYS = 7
/** The pink tab above the trial plan's card. */
export const TRIAL_TAB = `${TRIAL_DAYS}-day free trial`
export const PER_MONTH = '/ month'
/** 7.5% VAT on the subscription, in basis points. */
export const VAT_BPS = 750

/** Months you can pay for at once, and the discount for each, in percent. */
export const CYCLES = [
  { months: 1, discount: 0 },
  { months: 3, discount: 5 },
  { months: 6, discount: 10 },
  { months: 12, discount: 20 },
] as const

export type Cycle = (typeof CYCLES)[number]

/* ── hero ─────────────────────────────────────────────────────────── */

export const HERO = {
  title: { highlight: 'Start', rest: 'free, pay as you grow' },
  body: 'Open your shop for ₦0 and pay a small fee only when you sell online. When sales pick up, a monthly plan cuts that fee to 1% or nothing at all.',
  primary: 'Open your shop',
  secondary: 'Contact us',
} as const

export const PRICE_CARD = {
  title: 'Plan prices',
  planHeading: 'Plan',
  priceHeading: 'Price',
  feeSection: 'Fee on online sales',
  feeHeading: 'Fee',
  noFee: 'None',
  feeNote: "*Paystack's own charge applies to card, transfer and USSD",
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
export const COMPARE_PRICE_LABEL = 'Price a month'

export const COMPARE_GROUPS: CompareGroup[] = [
  {
    title: 'Selling',
    rows: [
      { label: 'Online shop and checkout', values: [true, true, true, true] },
      { label: 'Products', values: ['25', '300', 'Unlimited', 'Unlimited'] },
      { label: 'Fee on each online sale', values: ['3%', '1%', 'None', 'None'] },
    ],
  },
  {
    title: 'Team and marketing',
    rows: [
      { label: 'Staff besides you', values: [false, '2', '5', 'Unlimited'] },
      { label: 'Email campaigns', values: [false, true, true, true] },
      { label: 'Your own domain', values: [false, true, true, true] },
    ],
  },
  {
    title: 'Reports and support',
    rows: [
      { label: 'Written reports a month', values: ['1', '1', '5', '15'] },
      { label: 'Full business report', values: [false, false, true, true] },
      { label: 'Priority support', values: [false, false, false, true] },
    ],
  },
]

/* ── calculator ───────────────────────────────────────────────────── */

export const CALCULATOR = {
  title: { line: 'What you', highlight: 'would pay' },
  intro: 'Put in what you sell online in a month and see what each plan costs you.',
  totalHeading: 'Estimated monthly cost',
  onSales: 'On online sales of',
  cheapest: 'Cheapest at these sales:',
  details: 'Details',
  estimate: 'Estimated costs',
  planLine: 'plan',
  vatLine: 'VAT on plan (7.5%)',
  feeLine: 'Fee on online sales',
  totalLine: 'Total',
  perMonth: '/mo',
  footnote: "*Paystack's own charge is not included",
  orders: { label: 'Orders a month', hint: '*Paid online through your shop', min: 0, max: 1000, step: 1, typedMax: 100_000 },
  average: { label: 'Average order', hint: 'What one order comes to', min: 1000, max: 100_000, step: 500 },
  months: { label: 'Months paid at once', placeholder: 'Choose months' },
  plan: { label: 'Plan', placeholder: 'Choose a plan' },
  defaults: { orders: 40, average: 15_000, months: 1, plan: 'starter' as PlanId },
} as const

/* ── questions ────────────────────────────────────────────────────── */

export interface Faq {
  question: string
  answer: string[]
}

export const FAQ_TITLE = 'Pricing questions'

export const FAQS: Faq[] = [
  {
    question: 'What does it cost to start?',
    answer: [
      "Nothing. Every shop can stay on Free: no monthly fee, and 3% of each online sale. Paystack's own charge applies to card, transfer and USSD payments. The rest goes to your bank.",
    ],
  },
  {
    question: 'What do I get in the free trial?',
    answer: [
      `Every new shop gets ${TRIAL_DAYS} days of Growth: unlimited products, 5 staff, the full business report and no fee on sales.`,
      `When the ${TRIAL_DAYS} days end, the shop moves to Free unless you have chosen a plan.`,
    ],
  },
  {
    question: 'What happens if my plan runs out?',
    answer: [
      `Your plan keeps working for ${GRACE_DAYS} days after it ends. After that the shop moves to Free. It is never switched off.`,
    ],
  },
  {
    question: 'Is there a discount for paying ahead?',
    answer: ['Yes. Pay for 3 months at once for 5% off, 6 months for 10% off, or 12 months for 20% off.'],
  },
  {
    question: 'Do prices include VAT?',
    answer: ['No. Plan prices are before 7.5% VAT, which is added when you pay.'],
  },
  {
    question: 'Can I change plans later?',
    answer: [
      'Yes. Paid time left on your old plan carries over at its value. A month of Growth left becomes about 2.5 months of Starter, or about 2 weeks of Pro.',
    ],
  },
  {
    question: 'When do I get my money?',
    answer: ['Paystack settles each sale to the bank account you add, usually the next working day.'],
  },
]
