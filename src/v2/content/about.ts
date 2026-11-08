import { site } from '@v2/config/site'

/** Copy for /about. Real product facts only; anything we do not have yet is marked "Placeholder". */

export interface AboutHero {
  /** Words before the highlighted phrase. */
  before: string
  highlight: string
  after: string
  label: string
  intro: string
}

export interface AboutOverview {
  label: string
  heading: string
  paragraphs: readonly string[]
}

export interface AboutGalleryItem {
  seed: number
  /** Width over height on wide screens. */
  ratio: number
  speed: number
  span: 'one' | 'two' | 'full'
}

export interface AboutStory {
  headingLead: string
  headingHighlight: string
  lead: string
  body: string
  cta: { label: string; href: string }
}

export type AboutLinkCard =
  | { type: 'email'; label: string; email: string }
  | { type: 'download' | 'link'; label: string; title: string; href: string }

export interface AboutBackers {
  heading: string
  names: readonly string[]
}

export const aboutHero: AboutHero = {
  before: 'Helping Nigerian sellers',
  highlight: 'run their shop',
  after: 'from one phone',
  label: 'Company',
  intro: `${site.name} gives a seller one place for the whole shop: a website with checkout, orders, stock, delivery and payments that land in her own bank account. It is made by ${site.company.name} for people who sell on Instagram, WhatsApp and at a stall, and run all of it from a phone.`,
}

export const aboutOverview: AboutOverview = {
  label: `About ${site.name}`,
  heading: 'Built for sellers who take orders on WhatsApp, get paid by transfer and keep count in a notebook.',
  paragraphs: [
    'Each shop gets its own website with a checkout that works on a phone. Shoppers pay by card, transfer or USSD through Paystack, and the money is settled to the bank account the seller adds.',
    'Orders from the website, from WhatsApp and from the stall land in one list. Stock goes down when something sells and warns the seller before it runs out. Delivery fees are set by the seller, or paid orders are booked with Fez.',
    `${site.name} is built and run by ${site.company.name}. Every new shop starts with a 7-day trial of the Growth plan. If the owner does not choose a plan, the shop moves to the free plan and stays open.`,
  ],
}

export const aboutGallery: readonly AboutGalleryItem[] = [
  { seed: 3, ratio: 0.7043, speed: -0.1, span: 'one' },
  { seed: 7, ratio: 1.3333, speed: -0.2, span: 'two' },
  { seed: 11, ratio: 1.8145, speed: -0.2, span: 'full' },
]

export const aboutStory: AboutStory = {
  headingLead: 'Why we built',
  headingHighlight: site.name,
  lead: 'Selling online in Nigeria often means a page on one app, payments on another and orders in a chat. We wanted one shop that a seller can open in minutes and run without help.',
  body: 'So the dashboard does the everyday work: adding products, packing orders, following up on unpaid bags and showing what sold. Discount codes, emails, loyalty points and wholesale prices are there when a shop is ready for them.',
  cta: { label: 'Open your shop', href: site.signUpUrl },
}

export const aboutLinkCards: readonly AboutLinkCard[] = [
  { type: 'email', label: 'Questions', email: site.supportEmail },
  { type: 'link', label: 'Made by', title: site.company.name, href: site.company.url },
  { type: 'link', label: 'Brand assets', title: 'Logo and colours', href: '/brand-assets' },
]

export const aboutBackers: AboutBackers = {
  heading: 'Placeholder: backers heading',
  names: [
    'Placeholder: backer name',
    'Placeholder: backer name',
    'Placeholder: backer name',
    'Placeholder: backer name',
  ],
}
