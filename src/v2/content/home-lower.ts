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
      icon: 'lock',
      title: 'Discovery call',
      body: 'We learn what is broken and what it is costing you in time.',
    },
    {
      icon: 'bank',
      title: 'Scoped proposal',
      body: 'A written plan for your brief, with what is in scope and what is out.',
    },
    {
      icon: 'globe',
      title: 'Custom quote',
      body: 'One price, worked out from that scope. The price follows the scope, not the other way around.',
    },
    {
      icon: 'shield',
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

export const SHOWCASE_TITLE = `Built by ${site.name}`

/**
 * Only products WildHands built, each under the service it shows best, from
 * the `services` and summary in src/content/work. Marque is listed as Apps
 * and Websites there; it sits under Websites because what it makes is a
 * published site. Dumpty, Marvy, Auto Flow and The Ruff Agency list Apps and
 * Tools & Systems; Dumpty is a product people use, so it sits under Apps.
 */
export const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    label: 'Websites',
    cards: [
      {
        logo: logoImage('tomori.svg', 'Tomori'),
        title: 'Tomori, a phone-first shop for hand-dyed Adire',
        description: 'A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.',
        href: '/resources/tomori',
        linkLabel: VISIT,
      },
      {
        logo: logoImage('marque.svg', 'Marque'),
        title: 'Marque, brand guidelines at one link',
        description: 'Start from a logo, edit the guide in place, and publish it at one link.',
        href: '/resources/marque',
        linkLabel: VISIT,
      },
    ],
  },
  {
    label: 'Apps',
    cards: [
      {
        logo: logoImage('dumpty.png', 'Dumpty'),
        title: 'Dumpty, voice notes already organised',
        description: 'Talk through an idea and get back a clean transcript, tags and a checklist.',
        href: '/resources/dumpty',
        linkLabel: VISIT,
      },
      {
        logo: logoImage('rayo.svg', 'Rayo'),
        title: 'Rayo, quotes accepted on the page',
        description: 'Send a quote with options, the client accepts one, and it becomes the invoice.',
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
      {
        logo: logoImage('planes.png', 'Planes'),
        title: 'Planes, a to-do list you race friends on',
        description: 'Swipe to land a task, fly one to a friend, and race your crew on the leaderboard.',
        href: '/resources/planes',
        linkLabel: VISIT,
      },
      {
        logo: logoImage('lazy-meet.png', 'Lazy Meet'),
        title: 'Lazy Meet, calls that join themselves',
        description: 'Joins your calls at start time, muted and camera off, across three accounts.',
        href: '/resources/lazy-meet',
        linkLabel: VISIT,
      },
    ],
  },
  {
    label: 'Tools & Systems',
    cards: [
      {
        logo: logoImage('the-ruff-agency.svg', 'The Ruff Agency'),
        title: 'The Ruff Agency, one workspace instead of six tools',
        description: 'Clients, contracts, invoices, tasks and a client portal in one shared workspace.',
        href: '/resources/the-ruff-agency',
        linkLabel: VISIT,
      },
      {
        logo: logoImage('auto-flow.png', 'Auto Flow'),
        title: 'Auto Flow, video batches unattended',
        description: 'Point it at a folder of images and it generates every video unattended, three at a time.',
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
    name: 'Dumpty',
    logo: logoImage('dumpty.png', 'Dumpty'),
    tags: ['Consumer product'],
    title: 'Raw voice goes in. A titled, tagged idea with a set of next steps comes out.',
    href: '/resources/dumpty',
    linkLabel: VISIT,
  },
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

export interface FeatureLink {
  label: string
  href: string
}

export const FEATURES_LABEL = 'What we build'

/**
 * Each links to its own page, written in src/v2/content/capabilities.ts.
 * "Websites live in 72 hours" (an offer, covered on Marketing sites and
 * /pricing) and "Sitemap and crawl rules" (part of Search and AI visibility)
 * no longer have rows of their own.
 */
export const FEATURE_LINKS: FeatureLink[] = [
  { label: 'Marketing sites', href: '/what-we-build/marketing-sites' },
  { label: 'Full custom builds', href: '/what-we-build/full-custom-builds' },
  { label: 'CMS admin panel', href: '/what-we-build/cms-admin-panel' },
  { label: 'Search and AI visibility', href: '/what-we-build/search-visibility' },
  { label: 'Simple website analytics', href: '/what-we-build/website-analytics' },
  { label: 'Quotes and invoices', href: '/what-we-build/quotes-and-invoices' },
  { label: 'Client management dashboard', href: '/what-we-build/client-management' },
  { label: 'Custom web apps', href: '/what-we-build/custom-web-apps' },
  { label: 'Internal-facing tools', href: '/what-we-build/internal-tools' },
  { label: 'Live dashboards', href: '/what-we-build/live-dashboards' },
  { label: 'Workflow automation', href: '/what-we-build/workflow-automation' },
  { label: 'Connecting the tools you use', href: '/what-we-build/connected-tools' },
]

/* ── Blog row ─────────────────────────────────────────────────────── */

export const BLOG_ROW = {
  title: 'Latest insights',
  seeAll: { label: 'See all insights', href: '/blog' },
}
