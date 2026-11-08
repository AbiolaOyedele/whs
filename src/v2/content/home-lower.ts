import { PHOTOS, coverImage, logoImage, type CardImage } from '@v2/content/photos'
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
  label: string
  /** The title is split so the middle words can carry the gradient. */
  title: { before: string; highlight: string; after: string }
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
  points: TrustPoint[]
}

export const TRUST: TrustSection = {
  label: 'How we work',
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

/* ── Built by: work under each service ────────────────────────────── */

export interface ShowcaseCard {
  icon: IconName
  /** Shown in the tile in place of the icon: the product's logo, or a photo. */
  image?: CardImage
  title: string
  description: string
  href: string
  linkLabel: string
}

export interface ShowcaseTab {
  label: string
  cards: ShowcaseCard[]
}

const VISIT = 'Read the case study'
const SEE_HOW = 'See the service'

export const SHOWCASE_TITLE = `Built by ${site.name}`

export const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    label: 'Websites',
    cards: [
      {
        icon: 'shirt',
        image: logoImage('tomori.svg', 'Tomori'),
        title: 'Tomori, a phone-first site for hand-dyed Adire',
        description: 'A quiet storefront for a Lagos label, with a back office the owner runs from her own phone.',
        href: '/resources/tomori',
        linkLabel: VISIT,
      },
      {
        icon: 'box',
        image: logoImage('marque.svg', 'Marque'),
        title: 'Marque, brand guidelines at one link',
        description: 'Start from a logo, edit the guide in place, and publish it as a live website.',
        href: '/resources/marque',
        linkLabel: VISIT,
      },
      {
        icon: 'phone',
        image: coverImage(PHOTOS.serviceSiteBuild),
        title: 'Marketing site or full custom build',
        description: 'A focused site built to convert visitors, or more pages and functionality for a site that does more.',
        href: '/use-cases/websites',
        linkLabel: SEE_HOW,
      },
      {
        icon: 'bag',
        image: coverImage(PHOTOS.service72Hours),
        title: 'Live in 72 hours',
        description: 'Starter at ₦150,000 or Standard at ₦250,000. The design is approved before any code is written.',
        href: '/pricing',
        linkLabel: 'See the prices',
      },
    ],
  },
  {
    label: 'Apps',
    cards: [
      {
        icon: 'sparkle',
        image: logoImage('dumpty.png', 'Dumpty'),
        title: 'Dumpty, voice notes already organised',
        description: 'Talk through an idea and get back a clean transcript, tags and a checklist.',
        href: '/resources/dumpty',
        linkLabel: VISIT,
      },
      {
        icon: 'sparkle',
        image: logoImage('lazy-meet.png', 'Lazy Meet'),
        title: 'Lazy Meet, calls that join themselves',
        description: 'Joins your calls at start time, muted and camera off, across three accounts.',
        href: '/resources/lazy-meet',
        linkLabel: VISIT,
      },
      {
        icon: 'chart',
        image: logoImage('rayo.svg', 'Rayo'),
        title: 'Rayo, quotes accepted on the page',
        description: 'Send a quote with options, the client accepts one, and it becomes the invoice.',
        href: '/resources/rayo',
        linkLabel: VISIT,
      },
      {
        icon: 'mail',
        image: coverImage(PHOTOS.serviceWebApps),
        title: 'Custom web apps',
        description: 'Software your team or your customers log into, built for a job off-the-shelf tools do not quite do.',
        href: '/use-cases/apps',
        linkLabel: SEE_HOW,
      },
    ],
  },
  {
    label: 'Tools & Systems',
    cards: [
      {
        icon: 'home',
        image: logoImage('auto-flow.png', 'Auto Flow'),
        title: 'Auto Flow, video batches unattended',
        description: 'A 24-image batch that took about two hours of clicking now runs in about half an hour.',
        href: '/resources/auto-flow',
        linkLabel: VISIT,
      },
      {
        icon: 'home',
        image: logoImage('the-ruff-agency.svg', 'The Ruff Agency'),
        title: 'The Ruff Agency, one workspace instead of six tools',
        description: 'Clients, contracts, invoices, tasks and a client portal in one shared workspace.',
        href: '/resources/the-ruff-agency',
        linkLabel: VISIT,
      },
      {
        icon: 'truck',
        image: logoImage('marvy.svg', 'Marvy'),
        title: 'Marvy, course videos filed in one step',
        description: 'Drop a video in and it lands in the right Drive folder, with the right people tagged.',
        href: '/resources/marvy',
        linkLabel: VISIT,
      },
      {
        icon: 'bag',
        image: coverImage(PHOTOS.serviceDashboards),
        title: 'Dashboards and workflow automation',
        description: 'The numbers that matter in one place, and tools connected so nobody re-keys data between them.',
        href: '/use-cases/tools-and-systems',
        linkLabel: SEE_HOW,
      },
    ],
  },
]

/* ── Recent work carousel ─────────────────────────────────────────── */

export interface ShopDesignTile {
  /** The project's name, shown large in the tile. */
  wordmark: string
  tags: string[]
  title: string
  href: string
  linkLabel: string
}

export const DESIGNS_SECTION = {
  label: 'Recent work',
  title: { before: 'Recent work,', highlight: 'built from scratch', after: 'around how each team works' },
}

/** From src/content/work in the main site (client, industry, outcome). */
export const DESIGN_TILES: ShopDesignTile[] = [
  {
    wordmark: 'Dumpty',
    tags: ['Consumer product'],
    title: 'Raw voice goes in. A titled, tagged idea with a set of next steps comes out.',
    href: '/resources/dumpty',
    linkLabel: VISIT,
  },
  {
    wordmark: 'Auto Flow',
    tags: ['Creative tooling'],
    title: 'A 24-image batch that took roughly two hours now runs in about half an hour, unattended.',
    href: '/resources/auto-flow',
    linkLabel: VISIT,
  },
  {
    wordmark: 'Lazy Meet',
    tags: ['Productivity'],
    title: 'Meetings join themselves at the scheduled minute, muted, across up to three Google accounts.',
    href: '/resources/lazy-meet',
    linkLabel: VISIT,
  },
  {
    wordmark: 'Rayo',
    tags: ['Business tools'],
    title: 'A quote that answers itself, and an invoice nobody has to retype.',
    href: '/resources/rayo',
    linkLabel: VISIT,
  },
  {
    wordmark: 'Marque',
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

export const FEATURE_LINKS: FeatureLink[] = [
  { label: 'Marketing sites', href: '/use-cases/websites' },
  { label: 'Full custom builds', href: '/use-cases/websites' },
  { label: 'Websites live in 72 hours', href: '/pricing' },
  { label: 'CMS admin panel', href: '/use-cases/websites' },
  { label: 'AI search visibility setup', href: '/use-cases/websites' },
  { label: 'Sitemap and crawl rules', href: '/use-cases/websites' },
  { label: 'Simple website analytics', href: '/use-cases/websites' },
  { label: 'Invoice generator', href: '/use-cases/websites' },
  { label: 'Client management dashboard', href: '/use-cases/websites' },
  { label: 'Custom web apps', href: '/use-cases/apps' },
  { label: 'Internal-facing tools', href: '/use-cases/apps' },
  { label: 'Live dashboards', href: '/use-cases/tools-and-systems' },
  { label: 'Workflow automation', href: '/use-cases/tools-and-systems' },
  { label: 'Connecting the tools you use', href: '/use-cases/tools-and-systems' },
]

/* ── Blog row ─────────────────────────────────────────────────────── */

export const BLOG_ROW = {
  title: 'Latest insights',
  seeAll: { label: 'See all insights', href: '/blog' },
}
