import { site } from '@v2/config/site'
import { PLANS, type PricingPlan } from '@v2/content/pricing'
import type { TitlePart, UseCaseFaq } from '@v2/content/use-cases'

/**
 * Words and data for /72-hour-website, the campaign page for the fixed-price
 * website. Prices, plan names and what each plan includes come from PLANS in
 * pricing.ts, so this page and /pricing can never disagree, and the deposit
 * the server charges is worked out from the same numbers
 * (src/config/website-offer.ts).
 */

export const WEBSITE_OFFER_PATH = '/72-hour-website'

/** The pricing cards the page sells from, by the slug the deposit endpoint takes. */
export type WebsiteOfferTier = 'starter' | 'standard'

const PLAN_ID: Record<WebsiteOfferTier, PricingPlan['id']> = { starter: 'starter', standard: 'growth' }

export function offerPlan(tier: WebsiteOfferTier): PricingPlan {
  const plan = PLANS.find((candidate) => candidate.id === PLAN_ID[tier])
  if (!plan) throw new Error(`No pricing plan for the ${tier} website tier.`)
  return plan
}

/** What is charged to start, in kobo: the plan's price times its deposit share. */
export function depositKobo(plan: PricingPlan): number {
  return Math.round((plan.monthlyKobo * plan.feeBps) / 10_000)
}

/**
 * The number that answers this campaign, as the old /websites page used
 * (and the USD note on /pricing). Digits only, country code first.
 */
const WHATSAPP_NUMBER = '2348129796927'

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const WEBSITE_OFFER = {
  meta: {
    title: 'A website for your business, live in 72 hours',
    description: `A proper website for your business, live in 72 hours. One fixed price, half to start, and you approve the design before any code is written. Built in Lagos by ${site.name}.`,
  },
  title: [
    { text: 'A proper website for your business,' },
    { text: 'live in 72 hours', highlight: true },
  ] satisfies TitlePart[],
  intro: 'One fixed price, half paid to start. You approve the design before we write any code.',
  actions: [
    { label: 'See prices', href: '#prices' },
    { label: 'Chat on WhatsApp', href: whatsappLink('Hi, I want a website built in 72 hours.') },
  ],

  stepsTitle: 'From deposit to a live site',
  steps: [
    { title: 'Pay the deposit', body: 'Then send your logo, photos and the words you want on the site.' },
    { title: 'Approve the design', body: 'You see the design within 24 hours and nothing is built until you say yes.' },
    { title: 'Go live', body: 'The site goes live on your own domain, 72 hours after you approve it.' },
  ],

  pricesTitle: 'Two ways to start',
  tiers: ['starter', 'standard'] satisfies WebsiteOfferTier[],
  featured: 'standard' satisfies WebsiteOfferTier,
  usdNote: 'Paying from outside Nigeria?',
  usdLink: { label: 'Ask for USD pricing on WhatsApp', href: whatsappLink('Hi, I am paying from outside Nigeria and want USD pricing.') },

  deposit: {
    pay: (amount: string) => `Pay ${amount} to start`,
    emailLabel: 'Your email',
    emailPlaceholder: 'you@business.com',
    emailHint: 'For your receipt. Paystack asks for it.',
    continue: 'Continue to payment',
    redirecting: 'Opening Paystack',
    cancel: 'Cancel',
  },

  faqs: [
    {
      question: 'What do I need to send you?',
      answer:
        'Your logo, a few photos, and the words for each section: what you do, who it is for and how to reach you. If you do not have all of it yet, send what you have and we will tell you what is missing.',
    },
    {
      question: 'What if I do not like the design?',
      answer:
        'You approve the design before we write any code, so nothing goes live until you are happy with it. Changes at that stage are part of the price.',
    },
    {
      question: 'Do I own the website?',
      answer:
        'Yes. The site, the domain and everything on it are yours. We can host and look after it for you, but you are never locked in.',
    },
    {
      question: 'What about my domain?',
      answer:
        'If you already have one, send us access and we will connect it. If you do not, we will register one for you and add the cost to your invoice.',
    },
    {
      question: 'What happens after the rounds of edits?',
      answer:
        'Further changes are billed by the hour, and we quote them before we start. Most sites need little once they are live.',
    },
  ] satisfies UseCaseFaq[],

  lead: {
    title: 'Not sure which one? Send us your Instagram handle and we will tell you.',
    body: 'We will look at what you have and tell you straight which plan fits, on WhatsApp.',
    whatsapp: { label: 'Chat on WhatsApp', href: whatsappLink('Hi, I want to know which website plan fits my business.') },
    fields: {
      name: { label: 'Your name', placeholder: 'Ada Okafor' },
      businessName: { label: 'Business name', placeholder: 'Ada’s Kitchen' },
      instagram: { label: 'Instagram handle', placeholder: '@adaskitchen' },
    },
    errors: {
      name: 'Enter your name.',
      businessName: 'Enter your business name.',
      instagram: 'Enter your Instagram handle.',
    },
    submit: 'Send',
    successTitle: 'That is with us',
  },
} as const
