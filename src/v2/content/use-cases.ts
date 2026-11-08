import { PHOTOS, coverImage, logoImage, type CardImage } from '@v2/content/photos'
import { site } from '@v2/config/site'
import type { IconName } from '@v2/components/ui/Icon'
import type { MapPoint } from '@v2/components/features/feature-cards/MapCard'

/**
 * The three service pages: websites, apps, and tools and systems. Each
 * mirrors one of the reference site's use-case pages (websites ← voice, apps
 * ← language models, tools and systems ← image and video) and is rendered by
 * one shared template.
 *
 * Every claim here comes from the main site: the service pages in
 * `src/content/services/`, the case studies in `src/content/work/` and the
 * process in `src/config/site.ts`. Change those first, then this.
 */

export const USE_CASE_SLUGS = ['websites', 'apps', 'tools-and-systems'] as const
export type UseCaseSlug = (typeof USE_CASE_SLUGS)[number]

export function isUseCaseSlug(value: string): value is UseCaseSlug {
  return (USE_CASE_SLUGS as readonly string[]).includes(value)
}

/** A run of heading text; `highlight` runs wear the pink gradient. */
export interface TitlePart {
  text: string
  highlight?: boolean
}

/* ── chart lines (an illustration of time spent; the chart prints no figures) ── */

export interface PlanCost {
  name: string
  /** Where the line starts: the effort before anything runs. */
  monthly: number
  /** How steeply the line climbs as the weeks go by. */
  fee: number
}

/**
 * Doing the work by hand starts at nothing and keeps climbing. A dashboard or
 * an automation costs effort up front and then little or nothing after. Only
 * the shape is drawn: the chart carries no amounts.
 */
export const PLAN_COSTS = {
  free: { name: 'By hand', monthly: 0, fee: 0.03 },
  starter: { name: 'Dashboard', monthly: 6000, fee: 0.008 },
  growth: { name: 'Automated', monthly: 9000, fee: 0 },
} as const satisfies Record<string, PlanCost>

/** The point at which two lines meet. */
export function breakEven(a: PlanCost, b: PlanCost): number {
  return Math.round((b.monthly - a.monthly) / (a.fee - b.fee))
}

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`

/* ── case studies and project cards (from src/content/work) ── */

export type TemplateGlyph = 'default' | 'glow' | 'blush' | 'haven' | 'oak'

export interface TemplateSlide {
  glyph: TemplateGlyph
  name: string
  bestFor: string
}

/** Apps we have built, one per layout sketch. */
const APP_SLIDES: Record<TemplateGlyph, TemplateSlide> = {
  default: { glyph: 'default', name: 'Rayo', bestFor: 'Quotes the client accepts on the page' },
  glow: { glyph: 'glow', name: 'Dumpty', bestFor: 'Voice notes that arrive already organised' },
  blush: { glyph: 'blush', name: 'Lazy Meet', bestFor: 'Joins your calls muted, camera off' },
  haven: { glyph: 'haven', name: 'Dory', bestFor: 'A budget that always knows what is left' },
  oak: { glyph: 'oak', name: 'Planes', bestFor: 'A to-do list you race your friends on' },
}

/** Tools and systems we have built, one per layout sketch. */
const TOOL_SLIDES: Record<TemplateGlyph, TemplateSlide> = {
  default: { glyph: 'default', name: 'Marvy', bestFor: 'Course videos filed in one step' },
  glow: { glyph: 'glow', name: 'Lazy Meet', bestFor: 'Joins your calls muted, camera off' },
  blush: { glyph: 'blush', name: 'Dumpty', bestFor: 'Ideas filed, tagged and turned into next steps' },
  haven: { glyph: 'haven', name: 'Auto Flow', bestFor: 'Bulk video generation, unattended' },
  oak: { glyph: 'oak', name: 'The Ruff Agency', bestFor: 'One workspace instead of six tools' },
}

export interface DemoShop {
  client: string
  /** The product's logo, from public/work-logos. */
  logo: CardImage
  template: string
  trade: string
  title: string
  href: string
}

/** A case study card: the product's logo, its industry and service as tags. */
function workStory(id: string, logoFile: string, client: string, industry: string, service: string, title: string): DemoShop {
  return {
    client,
    logo: logoImage(logoFile, client),
    template: service,
    trade: industry,
    title,
    href: `/resources/${id}`,
  }
}

const WORK = {
  tomori: workStory('tomori', 'tomori.svg', 'Tomori', 'E-commerce', 'Websites', 'Tomori: a shop for hand-dyed Adire, built for a phone'),
  marque: workStory('marque', 'marque.svg', 'Marque', 'Creative tooling', 'Websites', 'Marque: brand guidelines, made easy'),
  ruffSite: workStory('the-ruff-agency', 'the-ruff-agency.svg', 'The Ruff Agency', 'Agency operations', 'Websites', 'The Ruff Agency: one workspace instead of six tools'),
  dumpty: workStory('dumpty', 'dumpty.png', 'Dumpty', 'Consumer product', 'Apps', 'Dumpty: voice notes that arrive already organised'),
  lazyMeet: workStory('lazy-meet', 'lazy-meet.png', 'Lazy Meet', 'Productivity', 'Apps', 'Lazy Meet: joining the call so you do not have to'),
  rayo: workStory('rayo', 'rayo.svg', 'Rayo', 'Business tools', 'Apps', 'Rayo: quotes your client accepts on the page'),
  autoFlow: workStory('auto-flow', 'auto-flow.png', 'Auto Flow', 'Creative tooling', 'Tools & Systems', 'Auto Flow: bulk video generation without the manual loop'),
  ruff: workStory('the-ruff-agency', 'the-ruff-agency.svg', 'The Ruff Agency', 'Agency operations', 'Tools & Systems', 'The Ruff Agency: one workspace instead of six tools'),
  marvy: workStory('marvy', 'marvy.svg', 'Marvy', 'Internal tools', 'Tools & Systems', 'Marvy: course videos filed in one step'),
} as const

/* ── map (Nigerian cities placed on MapCard's 0–100 grid of the country) ── */

/**
 * MapCard shows these in three waves of consecutive points, so each run of
 * five is picked to spread across the country: north, south, east, west, middle.
 */
const CITIES: MapPoint[] = [
  { x: 6, y: 76, label: 'Lagos' },
  { x: 48, y: 20, label: 'Kano' },
  { x: 40, y: 50, label: 'Abuja' },
  { x: 36, y: 88, label: 'Port Harcourt' },
  { x: 86, y: 22, label: 'Maiduguri' },
  { x: 10, y: 67, label: 'Ibadan' },
  { x: 39, y: 35, label: 'Kaduna' },
  { x: 40, y: 77, label: 'Enugu' },
  { x: 47, y: 87, label: 'Calabar' },
  { x: 81, y: 49, label: 'Yola' },
  { x: 21, y: 9, label: 'Sokoto' },
  { x: 15, y: 56, label: 'Ilorin' },
  { x: 60, y: 37, label: 'Bauchi' },
  { x: 24, y: 78, label: 'Benin City' },
  { x: 49, y: 64, label: 'Makurdi' },
]

/* ── page shape ── */

export type HeroVisual =
  | { kind: 'voice' }
  | {
      kind: 'crossword'
      /** Longest first is best; vertical and diagonal words need 5 letters or fewer. */
      words: string[]
      mobileWords: string[]
      /** Groups highlighted together, in turn. */
      sequence: string[][]
      mobileSequence: string[][]
    }
  | { kind: 'media' }

export interface ChartTab {
  /** The plan being weighed against the one below it. */
  label: string
  /** Two plans, drawn blue then pink. */
  plans: [PlanCost, PlanCost]
}

export type FeatureVisual =
  | { kind: 'flow'; hub: string; sources: [string, string, string]; sideLabel: string; artSeed: number }
  | { kind: 'cubes' }
  | { kind: 'map'; leftChip: string; rightChip: string; points: MapPoint[] }
  | { kind: 'wordmarks'; logos: CardImage[]; artSeed: number }
  | { kind: 'templates'; items: TemplateSlide[] }
  | { kind: 'batches'; tabs: [string, string, string]; artSeed: number }
  | { kind: 'chart'; tabs: ChartTab[]; yLabel: string; xLabel: string; artSeed: number }

export interface FeatureContent {
  id: string
  navTitle: string
  title: string
  body: string
  visual: FeatureVisual
}

export interface ExampleLink {
  icon: IconName
  /** Shown in the tile in place of the icon: the product's logo, or a photo. */
  image?: CardImage
  title: string
  body: string
  action: string
  href: string
}

export interface UseCaseContent {
  slug: UseCaseSlug
  meta: { title: string; description: string }
  label: string
  title: TitlePart[]
  intro: string
  hero: HeroVisual
  /** Line beside "Why … for …?" on wide screens. */
  lede: string
  why: TitlePart[]
  featuresLabel: string
  features: FeatureContent[]
  examples: { title: string; seeAll?: { label: string; href: string }; items: ExampleLink[] }
  stories: { title: string; action: string; items: DemoShop[] }
  /** Questions at the foot of the page, also published as FAQPage structured data. */
  faqs: UseCaseFaq[]
}

export interface UseCaseFaq {
  question: string
  answer: string
  /** The "do you work outside Lagos?" answer, which a location page swaps for its own place's. */
  aboutLocation?: true
}

/* ── shared pieces ── */

const QUOTE_LINK: ExampleLink = {
  image: coverImage(PHOTOS.startQuote),
  icon: 'bag',
  title: 'Request a quote',
  body: 'Send a short brief. We reply with a written plan and one price, worked out from that scope.',
  action: 'Request a quote',
  href: '/request-a-quote',
}

const WEBSITE_OFFER_LINK: ExampleLink = {
  image: coverImage(PHOTOS.service72Hours),
  icon: 'chart',
  title: 'The 72-hour website',
  body: `Starter at ${naira(150000)} or Standard at ${naira(250000)}. The design is approved before any code, and the site is live in 72 hours.`,
  action: 'See pricing',
  href: '/pricing',
}

const APP_CASE_LINK: ExampleLink = {
  image: logoImage('lazy-meet.png', 'Lazy Meet'),
  icon: 'chart',
  title: 'Read a case study',
  body: 'Lazy Meet joins your Google Meet calls at start time, muted and camera off, across three accounts.',
  action: 'Read the case study',
  href: '/resources/lazy-meet',
}

const INSIGHTS_LINK: ExampleLink = {
  image: coverImage(PHOTOS.startInsights),
  icon: 'box',
  title: 'Read our insights',
  body: 'Notes from the studio on websites, apps and the tools behind a business.',
  action: 'Read insights',
  href: '/blog',
}

const TALK_LINK: ExampleLink = {
  image: coverImage(PHOTOS.startDiscoveryCall),
  icon: 'calendar',
  title: 'Book a discovery call',
  body: 'We learn what is broken and what it is costing you in time.',
  action: 'Get in touch',
  href: '/contact',
}

const LOCATION_BODY =
  'We are based in Lagos and build for businesses across Nigeria and Africa. Most of the process runs over calls, so location is not a barrier.'

const why = (highlight: string): TitlePart[] => [
  { text: `Why ${site.name} for ` },
  { text: highlight, highlight: true },
]

/* ── the pages ── */

const websites: UseCaseContent = {
  slug: 'websites',
  meta: {
    title: 'Custom Website Design in Lagos, Nigeria',
    description:
      'Websites built from scratch around what you publish. Marketing sites that convert and full custom builds, designed in Lagos for businesses across Nigeria and Africa.',
  },
  label: 'Websites',
  title: [{ text: 'Websites built' }, { text: 'from scratch', highlight: true }, { text: 'around your business' }],
  intro:
    'We build websites around your business, rather than fitting you into a theme. The structure, the content model and the page templates are designed for what you actually publish.',
  hero: { kind: 'voice' },
  lede: 'Marketing sites that convert, and full custom builds for businesses that need the site to do more.',
  why: why('websites?'),
  featuresLabel: 'What you get',
  features: [
    {
      id: 'ships-with',
      navTitle: 'What ships with it',
      title: 'Everything a site needs, built in',
      body: 'Every site ships with a CMS admin panel, search engine crawl rules, an XML sitemap, AI search visibility setup and simple website analytics.',
      visual: {
        kind: 'flow',
        hub: 'Website',
        sources: ['CMS', 'Sitemap', 'Analytics'],
        sideLabel: '1 build',
        artSeed: 2,
      },
    },
    {
      id: 'built-custom',
      navTitle: 'Built from scratch',
      title: 'Designed for what you publish',
      body: 'Nothing is adapted from a site built for someone else. Editing is part of the build, so routine changes never need a developer.',
      visual: { kind: 'cubes' },
    },
    {
      id: 'local-realities',
      navTitle: 'Built for Nigeria',
      title: 'Built for local realities',
      body: 'Every site accounts for local hosting, payment and connectivity realities, not just international defaults. We are based in Lagos and build for businesses across Nigeria and Africa.',
      visual: {
        kind: 'map',
        leftChip: 'Studio : Lagos',
        rightChip: 'Clients : Nigeria and Africa',
        points: CITIES,
      },
    },
    {
      id: 'our-work',
      navTitle: 'Our work',
      title: 'See what we have built',
      body: 'Every project is built around its own brief, so none of them look like each other. Marque publishes brand guidelines as a live website at one link.',
      visual: {
        kind: 'wordmarks',
        logos: [
          logoImage('tomori.svg', 'Tomori'),
          logoImage('marque.svg', 'Marque'),
          logoImage('dumpty.png', 'Dumpty'),
          logoImage('rayo.svg', 'Rayo'),
          logoImage('planes.png', 'Planes'),
        ],
        artSeed: 5,
      },
    },
  ],
  examples: {
    title: 'Start here',
    items: [QUOTE_LINK, WEBSITE_OFFER_LINK, INSIGHTS_LINK, TALK_LINK],
  },
  stories: {
    title: `Websites built by ${site.name}`,
    action: 'Read the case study',
    items: [WORK.tomori, WORK.marque, WORK.ruffSite],
  },
  faqs: [
    {
      question: 'How much does a custom website cost?',
      answer: `Starter is ${naira(150000)} and Standard is ${naira(250000)}, one-off, with half paid to start. A larger build with more pages or functionality is quoted after a short discovery call, once the scope is clear.`,
    },
    {
      question: 'How long does a custom website take to build?',
      answer:
        'Starter and Standard sites are live in 72 hours once you approve the design. A full custom build takes longer, depending on how much functionality sits behind it, which the discovery call establishes.',
    },
    {
      question: 'Why not just use a template?',
      answer:
        'A template is faster to launch and then constrains every decision afterwards. If your site only needs to represent you, a template can be enough. If it needs to do anything specific to your business, custom is cheaper over time.',
    },
    {
      question: 'Can we update the site ourselves after launch?',
      answer: 'Yes. Every site ships with a CMS admin panel, so routine changes never need a developer.',
    },
    {
      question: 'Do you build websites for businesses outside Lagos?',
      answer: LOCATION_BODY,
      aboutLocation: true,
    },
  ],
}

const apps: UseCaseContent = {
  slug: 'apps',
  meta: {
    title: 'Custom web apps and internal tools',
    description:
      'Custom web apps and internal tools built around how your team actually works, rather than how off-the-shelf software assumes you do.',
  },
  label: 'Apps',
  title: [{ text: 'Software built around' }, { text: 'how you actually work', highlight: true }],
  intro:
    'An app is worth building when the way you work is specific enough that generic software makes it harder. We build around your real workflow, so the software fits the process.',
  hero: {
    kind: 'crossword',
    words: ['WORKFLOW', 'SOFTWARE', 'CUSTOM', 'PORTAL', 'TOOLS', 'APPS', 'TEAM'],
    mobileWords: ['TOOLS', 'APPS', 'TEAM'],
    sequence: [['TOOLS', 'TEAM'], ['APPS', 'PORTAL'], ['CUSTOM'], ['WORKFLOW'], ['SOFTWARE']],
    mobileSequence: [['TOOLS'], ['APPS'], ['TEAM']],
  },
  lede: 'Custom web apps and internal tools, for teams whose workflow does not fit off-the-shelf software.',
  why: why('apps?'),
  featuresLabel: 'What you get',
  features: [
    {
      id: 'your-workflow',
      navTitle: 'Your workflow',
      title: 'Built around the real process',
      body: 'Software your team or your customers log into, built for a job off-the-shelf tools do not quite do. Often it is the piece between the tools you already have, where the manual work lives.',
      visual: { kind: 'cubes' },
    },
    {
      id: 'shaped-by-the-problem',
      navTitle: 'Shaped by the problem',
      title: 'No two apps alike',
      body: 'Every app here started as a workflow someone was doing by hand. Dumpty replaced the note that never got tidied up. Lazy Meet replaced the five clicks before every call.',
      visual: {
        kind: 'templates',
        items: [APP_SLIDES.glow, APP_SLIDES.blush, APP_SLIDES.default, APP_SLIDES.haven, APP_SLIDES.oak],
      },
    },
    {
      id: 'how-the-work-runs',
      navTitle: 'How the work runs',
      title: 'Discovery, proposal, quote',
      body: 'A discovery call first, to find out what is actually costing you time. Then a scoped proposal written around that brief. Then one price for the work in front of us.',
      visual: { kind: 'batches', tabs: ['Discovery', 'Proposal', 'Quote'], artSeed: 3 },
    },
    {
      id: 'where-we-work',
      navTitle: 'Where we work',
      title: 'Built in Lagos, used anywhere',
      body: LOCATION_BODY,
      visual: {
        kind: 'map',
        leftChip: 'Studio : Lagos',
        rightChip: 'Clients : Nigeria and Africa',
        points: CITIES,
      },
    },
  ],
  examples: {
    title: 'Start here',
    seeAll: { label: 'See all', href: '/blog' },
    items: [QUOTE_LINK, APP_CASE_LINK, INSIGHTS_LINK, TALK_LINK],
  },
  stories: {
    title: `Apps built by ${site.name}`,
    action: 'Read the case study',
    items: [WORK.dumpty, WORK.lazyMeet, WORK.rayo],
  },
  faqs: [
    {
      question: 'When is a custom app worth building?',
      answer:
        'When the way you work is specific enough that generic software makes it harder, or when the workaround has become a spreadsheet several people maintain by hand. If an off-the-shelf tool fits, we will tell you.',
    },
    {
      question: 'How much does a custom app cost?',
      answer:
        'It is quoted after a discovery call. The main driver is how many distinct workflows the app supports, not the number of screens.',
    },
    {
      question: 'Do you replace software we already pay for?',
      answer:
        'Sometimes. More often we build the piece that sits between the tools you already have, because that gap is usually where the manual work lives.',
    },
    {
      question: 'Do you build apps for businesses outside Lagos?',
      answer: LOCATION_BODY,
      aboutLocation: true,
    },
  ],
}

const byHand = PLAN_COSTS.free
const dashboard = PLAN_COSTS.starter
const automated = PLAN_COSTS.growth

const toolsAndSystems: UseCaseContent = {
  slug: 'tools-and-systems',
  meta: {
    title: 'Dashboards and workflow automation',
    description:
      'Dashboards that show what is actually happening, and automation that removes the manual steps between the tools you already use.',
  },
  label: 'Tools & Systems',
  title: [
    { text: 'Dashboards', highlight: true },
    { text: 'and' },
    { text: 'automation', highlight: true },
    { text: 'that give you' },
    { text: 'your time back' },
  ],
  intro:
    'Dashboards that put the numbers in one place, and automation that connects the tools you already pay for, so nobody re-keys data between them.',
  hero: { kind: 'media' },
  lede: 'For teams rebuilding the same report, or re-keying the same data, every week.',
  why: why('tools and systems?'),
  featuresLabel: 'What you get',
  features: [
    {
      id: 'dashboards',
      navTitle: 'Dashboards',
      title: 'The numbers in one place',
      body: 'Most teams already produce the data and lose it across several tools. The work is pulling it into one live view, instead of rebuilding the same report every week.',
      visual: { kind: 'cubes' },
    },
    {
      id: 'automation',
      navTitle: 'Automation',
      title: 'Manual steps, removed for good',
      body: 'Auto Flow turned a supervised afternoon of clicking into an unattended half-hour. Marvy files each course video in the right Drive folder and tags the right reviewers.',
      visual: {
        kind: 'templates',
        items: [TOOL_SLIDES.haven, TOOL_SLIDES.oak, TOOL_SLIDES.default],
      },
    },
    {
      id: 'hours-returned',
      navTitle: 'Hours returned',
      title: 'Judged on the time it gives back',
      body: 'During discovery we work out how many hours the current process costs, and the finished build is measured against that number. If we cannot answer how much time it saves, it was not worth building.',
      visual: {
        kind: 'chart',
        tabs: [
          { label: 'Dashboard', plans: [byHand, dashboard] },
          { label: 'Automation', plans: [byHand, automated] },
        ],
        yLabel: 'Hours spent',
        xLabel: 'Weeks running',
        artSeed: 4,
      },
    },
    {
      id: 'where-we-work',
      navTitle: 'Where we work',
      title: 'Built in Lagos, used anywhere',
      body: LOCATION_BODY,
      visual: {
        kind: 'map',
        leftChip: 'Studio : Lagos',
        rightChip: 'Clients : Nigeria and Africa',
        points: CITIES,
      },
    },
  ],
  examples: {
    title: 'Start here',
    items: [TALK_LINK],
  },
  stories: {
    title: `Systems built by ${site.name}`,
    action: 'Read the case study',
    items: [WORK.autoFlow, WORK.ruff, WORK.marvy],
  },
  faqs: [
    {
      question: 'What is workflow automation?',
      answer:
        'Connecting the tools you already use so data moves between them without anyone re-keying it. The goal is removing manual steps permanently rather than making them faster.',
    },
    {
      question: 'How do you measure whether a system was worth it?',
      answer:
        'By hours returned. We establish what the current process costs in time during discovery, and that number is what the finished build is measured against.',
    },
    {
      question: 'Can you build a dashboard from data we already have?',
      answer:
        'Usually yes. Most teams already produce the data and lose it across several tools. The work is pulling it into one live view rather than generating anything new.',
    },
    {
      question: 'Do you build tools for businesses outside Lagos?',
      answer: LOCATION_BODY,
      aboutLocation: true,
    },
  ],
}

export const USE_CASES_CONTENT: Record<UseCaseSlug, UseCaseContent> = {
  websites,
  apps,
  'tools-and-systems': toolsAndSystems,
}

export function getUseCase(slug: string): UseCaseContent | null {
  return isUseCaseSlug(slug) ? USE_CASES_CONTENT[slug] : null
}
