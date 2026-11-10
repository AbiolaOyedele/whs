import { logoImage, type CardImage } from '@v2/content/photos'
import { GRACE_DAYS, PLANS, TRIAL_DAYS, type PlanId } from '@v2/content/pricing'

/**
 * Words and figures for the top half of the home page: hero, product rail,
 * intro and the four "Why WildHands" cards. Every price and number here is
 * read from the real offer in pricing.ts; every product is one WildHands
 * built (src/content/work). Nothing is sample data.
 */

/* ── hero ─────────────────────────────────────────────────────────── */


/** The three words that flicker in while the hero is held, in order. */
export const holdWords = ['Websites', 'Apps', 'Tools'] as const

/* ── intro row ────────────────────────────────────────────────────── */

export const introCopy = {
  lead: 'For businesses in Nigeria and across Africa that have outgrown WhatsApp and the notebook.',
  title: { before: 'Less copying, less chasing,', highlight: 'more time for the work that pays' },
} as const

/* ── "Why WildHands": the sticky list and each card's words ───────── */

export interface WhyCopy {
  /** Anchor id; also links the sticky list entry to its card. */
  id: string
  navTitle: string
  title: string
  body: string
  action?: { label: string; href: string }
}

/** Naira, whole: 250000 → "₦250,000". */
export function naira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`
}

interface PlanPrice {
  name: string
  price: number
  deposit: number
}

/** A fixed-price website plan's price and deposit, in naira, from pricing.ts. */
function planPrice(id: PlanId): PlanPrice {
  const plan = PLANS.find((item) => item.id === id)
  const price = plan ? plan.monthlyKobo / 100 : 0
  return { name: plan?.name ?? '', price, deposit: plan ? (price * plan.feeBps) / 10_000 : 0 }
}

const STARTER = planPrice('starter')
const STANDARD = planPrice('growth')

export const heroCopy = {
  /** The headline, one entry per line, broken where the owner set it. */
  titleLines: ['We build the', 'website and tools your', 'business runs on.'],
  body: `Websites live in 72 hours from ${naira(STARTER.price)}. Apps and automations that take the copying, chasing and checking off your plate. You own all of it.`,
  primary: 'Book a call',
  secondary: { label: 'See our work', href: '/resources' },
  cursorHint: 'Click and hold',
} as const

export const whyCopy = {
  price: {
    id: 'priced-up-front',
    navTitle: 'Priced up front',
    title: 'One price, agreed before any work starts.',
    body: `Every project starts with a written proposal: what is in scope, what is out, and one price worked out from it. Websites are a fixed ${naira(STARTER.price)} or ${naira(STANDARD.price)}, with half to start. If the scope changes, the change is written and priced before work starts on it.`,
    action: { label: 'See the prices', href: '/pricing' },
  },
  design: {
    id: 'design-first',
    navTitle: 'Design first',
    title: 'You approve the design before any code is written.',
    body: `You see the design and sign it off within ${GRACE_DAYS} hours. Starter and Standard websites go live ${TRIAL_DAYS} hours after that, with 2 or 3 rounds of edits included. Apps and internal tools are quoted after a discovery call.`,
  },
  scratch: {
    id: 'built-from-scratch',
    navTitle: 'Built from scratch',
    title: 'Built around your business, never a theme.',
    body: 'The pages and screens are designed for what your business actually does, which is why a clothes shop, a quoting tool and an agency workspace come out nothing alike.',
    action: { label: 'See our work', href: '/resources' },
  },
  own: {
    id: 'yours-to-keep',
    navTitle: 'Yours to keep',
    title: 'You own all of it, and you meet who builds it.',
    body: 'Your domain is registered in your name. You get every login on day one, and the code is yours. The people you meet on the call are the people who build it. And if an off-the-shelf tool already does the job, we will tell you.',
  },
} as const satisfies Record<string, WhyCopy>

/* ── card: the written proposal ───────────────────────────────────── */

export const proposalCard = {
  label: 'Written proposal, agreed before work starts',
  project: `${STANDARD.name} website`,
  inLabel: 'In scope',
  inScope: [
    'Up to 4 pages',
    'A dashboard to change words, photos and prices',
    'See who visited and what they clicked',
    'Copywriting from a 15-minute call',
    '3 rounds of edits',
  ],
  outLabel: 'Out of scope',
  outScope: ['Pages past 4, quoted separately'],
  priceLabel: 'Fixed price',
  price: naira(STANDARD.price),
  depositLabel: 'Half to start',
  deposit: naira(STANDARD.deposit),
} as const

/* ── card: design first, then live in 72 hours ────────────────────── */

export const launchCard = {
  hours: TRIAL_DAYS,
  unit: 'hours',
  caption: 'from approved design to a live site',
  steps: ['You approve the design', 'We build it', 'Live on your domain'],
} as const

/* ── card: three builds, nothing alike ────────────────────────────── */

export interface ScratchProduct {
  name: string
  logo: CardImage
  /** The product's industry, from src/content/work. */
  industry: string
  /** What it does, in a line, from the product's summary in src/content/work. */
  what: string
}

export const scratchCard = {
  products: [
    {
      name: 'Tomori',
      logo: logoImage('tomori.svg', 'Tomori'),
      industry: 'E-commerce',
      what: 'A phone-first shop for hand-dyed clothes',
    },
    {
      name: 'Rayo',
      logo: logoImage('rayo.svg', 'Rayo'),
      industry: 'Business tools',
      what: 'Quotes your client accepts on the page',
    },
    {
      name: 'The Ruff Agency',
      logo: logoImage('the-ruff-agency.svg', 'The Ruff Agency'),
      industry: 'Agency operations',
      what: 'Clients, contracts and invoices in one workspace',
    },
  ] satisfies ScratchProduct[],
} as const

/* ── card: what you own ───────────────────────────────────────────── */

export const ownCard = {
  rows: ['The site', 'The domain', 'The code', 'Everything on it'],
  owner: 'Yours',
  footer: 'Built by the people in your pitch',
} as const
