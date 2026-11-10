import { PHOTOS, type Photo } from '@v2/content/photos'
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
  heading: string
  paragraphs: readonly string[]
}

export interface AboutGalleryItem {
  photo: Photo
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

/** Brand fill for a link card: WildHands lime, ink (charcoal) or white. */
export type AboutLinkTone = 'lime' | 'ink' | 'white'

export type AboutLinkCard =
  | { type: 'email'; email: string; tone: AboutLinkTone }
  | { type: 'download' | 'link'; title: string; href: string; tone: AboutLinkTone }

export const aboutHero: AboutHero = {
  before: 'To build tools',
  highlight: 'that give people',
  after: 'their time back.',
  label: 'Our mission',
  intro: `${site.name} builds custom websites, web apps and tools for your team, for businesses in Lagos, Nigeria and across Africa. Built around how you really work, not a template.`,
}

export const aboutOverview: AboutOverview = {
  heading:
    "We started small, taking one team's repetitive work off their hands. Today we build the websites, apps and tools that run behind businesses, with the same idea.",
  paragraphs: [
    'We judge everything we build by how much time it saves you. Auto Flow is one example: a batch that took about 2 hours by hand now runs in about 30 minutes on its own.',
    'Every project starts with a discovery call, to learn what is broken and what it is costing you in time. Then a written plan for your brief, with what we will build and what we will not, and one price for that work.',
    "We're based in Lagos, working with businesses across Nigeria and the wider African market.",
  ],
}

export const aboutGallery: readonly AboutGalleryItem[] = [
  { seed: 3, ratio: 0.7043, speed: -0.1, span: 'one', photo: PHOTOS.aboutTeam1 },
  { seed: 7, ratio: 1.3333, speed: -0.2, span: 'two', photo: PHOTOS.aboutTeam2 },
  { seed: 11, ratio: 1.8145, speed: -0.2, span: 'full', photo: PHOTOS.aboutTeam3 },
]

export const aboutStory: AboutStory = {
  headingLead: 'Why we built',
  headingHighlight: site.name,
  lead: 'WildHands exists because most teams lose hours every week to work a computer could do in seconds.',
  body: 'We would rather build the tool once than watch anyone rebuild the same report again. Your hours should go into the work only you can do.',
  cta: { label: 'Talk to us', href: '/contact' },
}

export const aboutLinkCards: readonly AboutLinkCard[] = [
  { type: 'email', email: site.supportEmail, tone: 'ink' },
  { type: 'link', title: 'See what we ship', href: '/resources', tone: 'lime' },
  { type: 'link', title: 'Logo and colours', href: '/brand-assets', tone: 'white' },
]
