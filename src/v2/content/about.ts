import { site } from '@v2/config/site'

/** Copy for /about. Taken from the main site: mission, origin, founding idea and the products we have built. */

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
  before: 'To build systems',
  highlight: 'that give people',
  after: 'their time back.',
  label: 'Our mission',
  intro: `${site.name} builds custom websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa. Built around how you actually work, not a template.`,
}

export const aboutOverview: AboutOverview = {
  label: 'Who is behind it',
  heading:
    "We started small, solving one team's repetitive work. Today we build the systems that run behind businesses, driven by the same idea.",
  paragraphs: [
    'We judge every system we build by how much time it saves you. You can see that in the work we ship and in how we scope a project, from first call to launch.',
    'Every engagement starts with a discovery call, to learn what is broken and what it is costing you in time. Then a written plan for your brief, with what is in scope and what is out, and one price worked out from that scope.',
    "We're based in Lagos, working with businesses across Nigeria and the wider African market.",
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
  lead: 'WildHands exists because most teams lose hours every week to work a system could do in seconds.',
  body: 'We would rather build the system once than watch anyone rebuild the same report again. Your hours should go into the work only you can do.',
  cta: { label: 'Talk to us', href: '/contact' },
}

export const aboutLinkCards: readonly AboutLinkCard[] = [
  { type: 'email', label: 'Questions', email: site.supportEmail },
  { type: 'link', label: 'Our work', title: 'See what we ship', href: '/resources' },
  { type: 'link', label: 'Brand assets', title: 'Logo and colours', href: '/brand-assets' },
]

/** Products WildHands has built. The band drifts, so the names repeat across it. */
export const aboutBackers: AboutBackers = {
  heading: 'Built by WildHands',
  names: ['Dumpty', 'Rayo', 'Tomori', 'Marque', 'Lazy Meet', 'The Ruff Agency'],
}
