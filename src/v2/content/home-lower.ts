import { logoImage, type CardImage } from '@v2/content/photos'
import type { IconName } from '@v2/components/ui/Icon'
import { site } from '@v2/config/site'

/**
 * Words for the lower half of the home page: how an engagement runs, the
 * work by service, recent projects and what we build. Every line comes from
 * the main site's src/config/site.ts, src/content/services and
 * src/content/work.
 */

/** The domain WildHands products live under, read from the site's own address. */
export const ROOT_DOMAIN = new URL(site.appUrl).hostname.replace(/^app\./, '')

/** A product's address, e.g. https://rayo.<root domain>. */
export function demoShopUrl(slug: string): string {
  return `https://${slug}.${ROOT_DOMAIN}`
}

/* ── How we work ───────────────────────────────────────────────── */

export interface TrustPoint {
  icon: IconName
  title: string
  body: string
}

export interface TrustSection {
  /** The title is split so the middle words can carry the gradient. */
  title: { before: string; highlight: string; after: string }
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
  points: TrustPoint[]
}

export const TRUST: TrustSection = {
  title: { before: 'Scope first,', highlight: 'price second,', after: 'then we build' },
  primary: { label: 'Request a quote', href: '/request-a-quote' },
  secondary: { label: 'Get in touch', href: '/contact' },
  points: [
    {
      icon: 'phoneCall',
      title: 'Discovery call',
      body: 'We learn what is broken and what it is costing you in time.',
    },
    {
      icon: 'fileText',
      title: 'Scoped proposal',
      body: 'A written plan for your brief, with what is in scope and what is out.',
    },
    {
      icon: 'receipt',
      title: 'Custom quote',
      body: 'One price, worked out from that scope. The price follows the scope, not the other way around.',
    },
    {
      icon: 'handshake',
      title: 'Honest about fit',
      body: 'If an off-the-shelf tool already does the job, we will tell you. We will also tell you if we are not the right fit.',
    },
  ],
}

/* ── Built by: the products, by service ───────────────────────────── */

export interface ShowcaseCard {
  /** The product's own logo, from public/work-logos. */
  logo: CardImage
  title: string
  description: string
  /** The product's case study, /resources/<id>. */
  href: string
  linkLabel: string
}

export interface ShowcaseTab {
  label: string
  cards: ShowcaseCard[]
}

const VISIT = 'Read the case study'

export const SHOWCASE_TITLE = 'What do you need?'

/**
 * The work, grouped by the job a visitor hires us for rather than by what we
 * deliver: look credible online, get paid and keep track, or stop doing the
 * same work by hand. Every product here is one WildHands built, with its
 * summary from src/content/work; numbers are only ones the case study states.
 */
export const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    label: 'A website',
    cards: [
      {
        logo: logoImage('tomori.svg', 'Tomori'),
        title: 'Tomori, a shop built for a phone',
        description: 'A shop for hand-dyed clothes that loads fast on mobile data, with the back office in the owner’s pocket.',
        href: '/resources/tomori',
        linkLabel: VISIT,
      },
      {
        logo: logoImage('marque.svg', 'Marque'),
        title: 'Marque, brand guidelines at one link',
        description: 'Start from a logo, edit the guide where it sits, and publish it at one link.',
        href: '/resources/marque',
        linkLabel: VISIT,
      },
    ],
  },
  {
    label: 'Get paid',
    cards: [
      {
        logo: logoImage('rayo.svg', 'Rayo'),
        title: 'Rayo, quotes that become invoices',
        description: 'Send a quote with options. The client accepts one on the page, and it becomes the invoice.',
        href: '/resources/rayo',
        linkLabel: VISIT,
      },
      {
        logo: logoImage('dory.svg', 'Dory'),
        title: 'Dory, a budget that knows what is left',
        description: 'Budget, shopping, loans and subscriptions in one place, with what is left always on top.',
        href: '/resources/dory',
        linkLabel: VISIT,
      },
    ],
  },
  {
    label: 'Save time',
    cards: [
      {
        logo: logoImage('auto-flow.png', 'Auto Flow'),
        title: 'Auto Flow, 2 hours down to 30 minutes',
        description: 'A 24-image batch took about two hours of watching and clicking. Now it runs in about half an hour, on its own.',
        href: '/resources/auto-flow',
        linkLabel: VISIT,
      },
      {
        logo: logoImage('marvy.svg', 'Marvy'),
        title: 'Marvy, course videos filed in one step',
        description: 'Drop a video in and it lands in the right Drive folder, with the right people tagged.',
        href: '/resources/marvy',
        linkLabel: VISIT,
      },
    ],
  },
]

/* ── Recent work carousel ─────────────────────────────────────────── */

export interface ShopDesignTile {
  /** The product's name, for keys and screen readers. */
  name: string
  /** The product's logo, centred on a white tile as on the Work page. */
  logo: CardImage
  tags: string[]
  title: string
  href: string
  linkLabel: string
}

export const DESIGNS_SECTION = {
  label: 'Recent work',
  title: { before: 'Recent work,', highlight: 'built from scratch', after: 'around how each team works' },
}

/** Every product in src/content/work (Beam excepted), in its `order`: industry and outcome. */
export const DESIGN_TILES: ShopDesignTile[] = [
  {
    name: 'Auto Flow',
    logo: logoImage('auto-flow.png', 'Auto Flow'),
    tags: ['Creative tooling'],
    title: 'A 24-image batch that took roughly two hours now runs in about half an hour, unattended.',
    href: '/resources/auto-flow',
    linkLabel: VISIT,
  },
  {
    name: 'Lazy Meet',
    logo: logoImage('lazy-meet.png', 'Lazy Meet'),
    tags: ['Productivity'],
    title: 'Meetings join themselves at the scheduled minute, muted, across up to three Google accounts.',
    href: '/resources/lazy-meet',
    linkLabel: VISIT,
  },
  {
    name: 'The Ruff Agency',
    logo: logoImage('the-ruff-agency.svg', 'The Ruff Agency'),
    tags: ['Agency operations'],
    title: 'A client goes from invited to working inside their own portal, without a single email thread.',
    href: '/resources/the-ruff-agency',
    linkLabel: VISIT,
  },
  {
    name: 'Tomori',
    logo: logoImage('tomori.svg', 'Tomori'),
    tags: ['E-commerce'],
    title: 'The clothes are the loudest thing on every page, and the owner runs the shop from her phone.',
    href: '/resources/tomori',
    linkLabel: VISIT,
  },
  {
    name: 'Marvy',
    logo: logoImage('marvy.svg', 'Marvy'),
    tags: ['Internal tools'],
    title: 'Nobody on the team has to think about where a video goes.',
    href: '/resources/marvy',
    linkLabel: VISIT,
  },
  {
    name: 'Rayo',
    logo: logoImage('rayo.svg', 'Rayo'),
    tags: ['Business tools'],
    title: 'A quote that answers itself, and an invoice nobody has to retype.',
    href: '/resources/rayo',
    linkLabel: VISIT,
  },
  {
    name: 'Dory',
    logo: logoImage('dory.svg', 'Dory'),
    tags: ['Personal finance'],
    title: 'You always know what is left without doing the maths.',
    href: '/resources/dory',
    linkLabel: VISIT,
  },
  {
    name: 'Planes',
    logo: logoImage('planes.png', 'Planes'),
    tags: ['Productivity'],
    title: 'Finishing a task feels like landing a plane.',
    href: '/resources/planes',
    linkLabel: VISIT,
  },
  {
    name: 'Marque',
    logo: logoImage('marque.svg', 'Marque'),
    tags: ['Creative tooling'],
    title: 'A brand guide that lives at a link, not in a PDF nobody can find.',
    href: '/resources/marque',
    linkLabel: VISIT,
  },
]

/* ── What we build ────────────────────────────────────────────────── */

/** The home page's pointer to the full list at /what-we-build. */
export const FEATURES = {
  title: 'What we build',
  body: 'Twelve things we build, from a one-page website to jobs that run on their own. Each has its own page: what it is, who it is for and what you get.',
  action: { label: 'See everything we build', href: '/what-we-build' },
}

/* ── Blog row ─────────────────────────────────────────────────────── */

export const BLOG_ROW = {
  title: 'Latest insights',
  seeAll: { label: 'See all insights', href: '/blog' },
}
