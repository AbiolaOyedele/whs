import { logoImage, type CardImage } from '@v2/content/photos'
import { GRACE_DAYS, PLANS, TRIAL_DAYS, type PlanId } from '@v2/content/pricing'

/**
 * Words and figures for the top half of the home page: hero, product rail,
 * intro and the four "Why WildHands" cards. Every price and number here is
 * read from the real offer in pricing.ts; every product is one WildHands
 * built (src/content/work). Nothing is sample data.
 */

/* ── hero ─────────────────────────────────────────────────────────── */

export const heroCopy = {
  /** Split around the gradient word: before, gradient, after. */
  title: { before: 'Custom solutions that give you', highlight: 'your time', after: 'back.' },
  body: 'A Lagos-based studio building custom websites, web apps and internal tools for teams done doing repetitive work by hand. We work with businesses across Nigeria and the wider African market.',
  primary: 'Talk to Us',
  secondary: { label: 'See Our Work', href: '/resources' },
  cursorHint: 'Click and hold',
  mobileTrigger: 'Play the intro',
  close: 'Close',
} as const

/** The three words that flicker in while the hero is held, in order. */
export const holdWords = ['Websites', 'Apps', 'Tools'] as const

/* ── intro row ────────────────────────────────────────────────────── */

export const introCopy = {
  lead: 'Websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa.',
  title: { before: 'Built around how you work,', highlight: 'not a template' },
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
    body: 'The structure, the content and the screens are designed for what your business actually does, which is why a clothes shop, a quoting tool and an agency workspace come out nothing alike. Accessibility is checked in CI as we build, not audited once at the end.',
    action: { label: 'See our work', href: '/resources' },
  },
  own: {
    id: 'yours-to-keep',
    navTitle: 'Yours to keep',
    title: 'You own all of it, and you meet who builds it.',
    body: 'The site, the domain, the code and everything on it are yours. The people you meet in the pitch are the people who build your project. And if an off-the-shelf tool already does the job, we will tell you.',
  },
} as const satisfies Record<string, WhyCopy>

/* ── card: the written proposal ───────────────────────────────────── */

export const proposalCard = {
  label: 'Written proposal',
  project: `${STANDARD.name} website`,
  inLabel: 'In scope',
  inScope: [
    'Up to 4 pages',
    'Admin dashboard to edit text, images and prices',
    'Analytics in plain English',
    'Copywriting from a 15-minute call',
    '3 rounds of edits',
  ],
  outLabel: 'Out of scope',
  outScope: ['Pages past 4, quoted separately'],
  priceLabel: 'Fixed price',
  price: naira(STANDARD.price),
  depositLabel: 'Deposit to start',
  deposit: naira(STANDARD.deposit),
} as const

/* ── card: design first, then live in 72 hours ────────────────────── */

export const launchCard = {
  chip: 'Starter and Standard websites',
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
}

export const scratchCard = {
  chip: 'Three businesses, three builds',
  products: [
    { name: 'Tomori', logo: logoImage('tomori.svg', 'Tomori'), industry: 'E-commerce' },
    { name: 'Rayo', logo: logoImage('rayo.svg', 'Rayo'), industry: 'Business tools' },
    { name: 'The Ruff Agency', logo: logoImage('the-ruff-agency.svg', 'The Ruff Agency'), industry: 'Agency operations' },
  ] satisfies ScratchProduct[],
} as const

/* ── card: what you own ───────────────────────────────────────────── */

export const ownCard = {
  label: 'Who owns it',
  rows: ['The site', 'The domain', 'The code', 'Everything on it'],
  owner: 'Yours',
  footer: 'Built by the people in your pitch',
} as const
