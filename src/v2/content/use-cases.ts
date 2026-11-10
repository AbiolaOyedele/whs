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

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`

/* ── case studies and project cards (from src/content/work) ── */

/** A product we have built: its logo, its name and what it does in one line. */
export interface ProductSlide {
  logo: CardImage
  name: string
  line: string
}

/** Products from the case studies, for the product carousels. */
const PRODUCTS = {
  tomori: { logo: logoImage('tomori.svg', 'Tomori'), name: 'Tomori', line: 'A shop for hand-dyed Adire, built for a phone' },
  marque: { logo: logoImage('marque.svg', 'Marque'), name: 'Marque', line: 'Brand guidelines published at one link' },
  rayo: { logo: logoImage('rayo.svg', 'Rayo'), name: 'Rayo', line: 'Quotes the client accepts on the page' },
  planes: { logo: logoImage('planes.png', 'Planes'), name: 'Planes', line: 'A to-do list you race your friends on' },
  lazyMeet: { logo: logoImage('lazy-meet.png', 'Lazy Meet'), name: 'Lazy Meet', line: 'Joins your calls muted, camera off' },
  dory: { logo: logoImage('dory.svg', 'Dory'), name: 'Dory', line: 'A budget that always knows what is left' },
} satisfies Record<string, ProductSlide>

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
  lazyMeet: workStory('lazy-meet', 'lazy-meet.png', 'Lazy Meet', 'Productivity', 'Apps', 'Lazy Meet: joining the call so you do not have to'),
  rayo: workStory('rayo', 'rayo.svg', 'Rayo', 'Business tools', 'Apps', 'Rayo: quotes your client accepts on the page'),
  autoFlow: workStory('auto-flow', 'auto-flow.png', 'Auto Flow', 'Creative tooling', 'Tools & Systems', 'Auto Flow: bulk video generation without the manual loop'),
  ruff: workStory('the-ruff-agency', 'the-ruff-agency.svg', 'The Ruff Agency', 'Agency operations', 'Tools & Systems', 'The Ruff Agency: one workspace instead of six tools'),
  marvy: workStory('marvy', 'marvy.svg', 'Marvy', 'Team tools', 'Tools & Systems', 'Marvy: course videos filed in one step'),
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

export type HeroVisual = { kind: 'voice' }

/** One piece of a site's launch list, with a short note on what it is. */
export interface ChecklistItem {
  label: string
  detail: string
}

/** One stage of how a project starts. */
export interface ProcessStep {
  icon: IconName
  title: string
  detail: string
}

/** One automated tool's run: what it does, step by step, and how the run ends. */
export interface AutomationRun {
  product: string
  logo: CardImage
  steps: string[]
  done: string
}

/** How long one piece of work takes, for the before-and-after bars. */
export interface TimeBar {
  label: string
  minutes: number
  note: string
}

export type FeatureVisual =
  | { kind: 'checklist'; address: string; items: ChecklistItem[]; artSeed: number }
  | { kind: 'cms-edit'; artSeed: number }
  | { kind: 'local-checkout'; artSeed: number }
  | { kind: 'products'; items: ProductSlide[]; artSeed: number }
  | { kind: 'workflow'; artSeed: number }
  | { kind: 'process'; steps: [ProcessStep, ProcessStep, ProcessStep]; artSeed: number }
  | { kind: 'dashboard'; artSeed: number }
  | { kind: 'automation'; runs: AutomationRun[]; artSeed: number }
  | {
      kind: 'hours'
      product: string
      logo: CardImage
      task: string
      before: TimeBar
      after: TimeBar
      returned: string
      artSeed: number
    }
  | { kind: 'map'; points: MapPoint[] }

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
  /** The animation under the hero, if the page has one. */
  hero?: HeroVisual
  /** Line beside "Why … for …?" on wide screens. */
  lede: string
  why: TitlePart[]
  featuresLabel: string
  features: FeatureContent[]
  examples: { title: string; items: ExampleLink[] }
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
  body: 'Send a short brief. We reply with a written plan and one price for that work.',
  action: 'Request a quote',
  href: '/request-a-quote',
}

const WEBSITE_OFFER_LINK: ExampleLink = {
  image: coverImage(PHOTOS.service72Hours),
  icon: 'chart',
  title: 'The 72-hour website',
  body: `Starter at ${naira(150000)} or Standard at ${naira(250000)}. You approve the design before we build, and the site is live in 72 hours.`,
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

const TOOLS_CASE_LINK: ExampleLink = {
  image: logoImage('auto-flow.png', 'Auto Flow'),
  icon: 'chart',
  title: 'Read a case study',
  body: 'Auto Flow runs a 24-image batch in about half an hour, unattended. By hand it took roughly two hours.',
  action: 'Read the case study',
  href: '/resources/auto-flow',
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
  'We are based in Lagos and build for businesses across Nigeria. Most of the process runs over calls and messages, so we are open to working with businesses outside Nigeria too. Our page for clients outside Nigeria sets out how.'

const why = (highlight: string): TitlePart[] => [
  { text: `Why ${site.name} for ` },
  { text: highlight, highlight: true },
]

/* ── the pages ── */

const websites: UseCaseContent = {
  slug: 'websites',
  meta: {
    title: 'Custom website design in Lagos, Nigeria',
    description:
      'Websites built from scratch around your business. Simple sites that bring in enquiries, and bigger builds that take orders and payments, made in Lagos for Nigeria and Africa.',
  },
  label: 'Websites',
  title: [{ text: 'Websites built' }, { text: 'from scratch', highlight: true }, { text: 'around your business' }],
  intro:
    'We build websites around your business, rather than fitting you into a theme. Every page is planned around what you sell and what you need to say.',
  hero: { kind: 'voice' },
  lede: 'Simple sites that bring in enquiries, and bigger builds for when the site needs to take orders or payments.',
  why: why('websites?'),
  featuresLabel: 'What you get',
  features: [
    {
      id: 'ships-with',
      navTitle: 'What comes with it',
      title: 'Everything a site needs, built in',
      body: 'Every site is set up so Google can read each page and AI assistants get a plain summary of you. Standard and bigger sites add a dashboard to edit words and photos, and visitor numbers.',
      visual: {
        kind: 'checklist',
        address: 'yourbusiness.ng',
        items: [
          { label: 'Edit it yourself', detail: 'Change words and photos' },
          { label: 'Private pages hidden', detail: 'Kept out of search' },
          { label: 'Page list for Google', detail: 'Every public page' },
          { label: 'Summary for AI', detail: 'Set up for AI answers' },
          { label: 'Visitor numbers', detail: 'Visits and where they came from' },
        ],
        artSeed: 2,
      },
    },
    {
      id: 'built-custom',
      navTitle: 'Built from scratch',
      title: 'Designed for what you publish',
      body: 'Nothing is copied from a site built for someone else. Editing is part of the build, so routine changes never need a developer.',
      visual: { kind: 'cms-edit', artSeed: 6 },
    },
    {
      id: 'local-realities',
      navTitle: 'Built for Nigeria',
      title: 'Built for how Nigeria works',
      body: 'We plan for how your customers really shop: on a phone, often on mobile data, paying by card, transfer or USSD through Paystack. We are based in Lagos and build for businesses across Nigeria and Africa.',
      visual: { kind: 'local-checkout', artSeed: 1 },
    },
    {
      id: 'our-work',
      navTitle: 'Our work',
      title: 'See what we have built',
      body: 'Every project is built around its own brief, so none of them look like each other. Marque publishes brand guidelines as a live website at one link.',
      visual: {
        kind: 'products',
        items: [PRODUCTS.marque, PRODUCTS.tomori, PRODUCTS.rayo, PRODUCTS.planes],
        artSeed: 5,
      },
    },
  ],
  examples: {
    title: 'Start here',
    items: [TALK_LINK, QUOTE_LINK, WEBSITE_OFFER_LINK, INSIGHTS_LINK],
  },
  stories: {
    title: `Websites built by ${site.name}`,
    action: 'Read the case study',
    items: [WORK.tomori, WORK.marque, WORK.ruffSite],
  },
  faqs: [
    {
      question: 'How much does a custom website cost?',
      answer: `Starter is ${naira(150000)} and Standard is ${naira(250000)}, one-off, with half paid to start. A larger build with more pages or features is quoted after a short discovery call, once we know what you need.`,
    },
    {
      question: 'How long does a custom website take to build?',
      answer:
        'Starter and Standard sites are live in 72 hours once you approve the design. A full custom build takes longer, depending on how much it has to do. We work that out on the discovery call.',
    },
    {
      question: 'Why not just use a template?',
      answer:
        'A template is faster to launch and then constrains every decision afterwards. If your site only needs to represent you, a template can be enough. If it needs to do anything specific to your business, custom is cheaper over time.',
    },
    {
      question: 'Can we update the site ourselves after launch?',
      answer: 'Yes. Standard and bigger sites come with a simple dashboard where you change words and photos yourself, so routine changes never need a developer.',
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
    title: 'Custom web apps and tools for your team',
    description:
      'Custom web apps and tools for your team, built around how you really work, rather than how off-the-shelf software assumes you do.',
  },
  label: 'Apps',
  title: [{ text: 'Software built around' }, { text: 'how you actually work', highlight: true }],
  intro:
    'An app is worth building when the way you work is specific enough that generic software makes it harder. We build around how you really work, so the software fits you.',

  lede: 'Custom web apps and tools for your team, when the way you work does not fit off-the-shelf software.',
  why: why('apps?'),
  featuresLabel: 'What you get',
  features: [
    {
      id: 'your-workflow',
      navTitle: 'How you work',
      title: 'Built around the real process',
      body: 'Software your team or your customers sign in to, built for a job off-the-shelf tools do not quite do. Often it is the piece between the tools you already have, where someone is copying things by hand.',
      visual: { kind: 'workflow', artSeed: 6 },
    },
    {
      id: 'shaped-by-the-problem',
      navTitle: 'Shaped by the problem',
      title: 'No two apps alike',
      body: 'Every app here started as a job someone was doing by hand. Lazy Meet replaced the 5 clicks before every call.',
      visual: {
        kind: 'products',
        items: [PRODUCTS.lazyMeet, PRODUCTS.rayo, PRODUCTS.dory, PRODUCTS.planes],
        artSeed: 1,
      },
    },
    {
      id: 'how-the-work-runs',
      navTitle: 'How the work runs',
      title: 'Call, plan, price',
      body: 'A discovery call first, to find out what is really costing you time. Then a written plan of what we will build. Then one price for that work.',
      visual: {
        kind: 'process',
        steps: [
          { icon: 'phoneCall', title: 'Discovery call', detail: 'What is costing you time' },
          { icon: 'fileText', title: 'Written plan', detail: 'What we will build' },
          { icon: 'receipt', title: 'One price', detail: 'For the work in front of us' },
        ],
        artSeed: 3,
      },
    },
    {
      id: 'where-we-work',
      navTitle: 'Where we work',
      title: 'Built in Lagos, used anywhere',
      body: LOCATION_BODY,
      visual: {
        kind: 'map',
        points: CITIES,
      },
    },
  ],
  examples: {
    title: 'Start here',
    items: [TALK_LINK, QUOTE_LINK, APP_CASE_LINK, INSIGHTS_LINK],
  },
  stories: {
    title: `Apps built by ${site.name}`,
    action: 'Read the case study',
    items: [WORK.lazyMeet, WORK.rayo],
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
        'We quote after a discovery call. What moves the price most is how many different jobs the app does, not the number of screens.',
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

const toolsAndSystems: UseCaseContent = {
  slug: 'tools-and-systems',
  meta: {
    title: 'Dashboards and jobs that run on their own',
    description:
      'Dashboards that show what is really happening, and repetitive jobs that run on their own between the tools you already use.',
  },
  label: 'Tools & Systems',
  title: [
    { text: 'Dashboards', highlight: true },
    { text: 'and' },
    { text: 'tools', highlight: true },
    { text: 'that give you' },
    { text: 'your time back' },
  ],
  intro:
    'Dashboards that put your numbers in one place. Repetitive jobs that run on their own, so nobody copies the same details from one tool to another.',
  lede: 'For teams that rebuild the same report, or copy the same details, every week.',
  why: why('tools and systems?'),
  featuresLabel: 'What you get',
  features: [
    {
      id: 'dashboards',
      navTitle: 'Dashboards',
      title: 'The numbers in one place',
      body: 'Most teams already have the numbers, spread across several tools. The work is pulling them into one live view, instead of rebuilding the same report every week.',
      visual: { kind: 'dashboard', artSeed: 2 },
    },
    {
      id: 'automation',
      navTitle: 'Jobs that run themselves',
      title: 'Manual steps, removed for good',
      body: 'Auto Flow turned about 2 hours of watched clicking into 30 minutes that run on their own. Marvy files each course video in the right Drive folder and tags the right reviewers.',
      visual: {
        kind: 'automation',
        runs: [
          {
            product: 'Marvy',
            logo: logoImage('marvy.svg', 'Marvy'),
            steps: [
              'New video: BIO101 week 3',
              'Course and week read from the file name',
              'Filed in Drive: BIO101, Week 3',
              'Video and its audio uploaded',
              'Reviewers tagged in a comment',
            ],
            done: 'Filed and tagged, nobody clicked a thing',
          },
          {
            product: 'Auto Flow',
            logo: logoImage('auto-flow.png', 'Auto Flow'),
            steps: [
              'Folder of 24 images picked',
              'A prompt written for each image',
              'Each image uploaded to Flow',
              'Three videos generating at once',
              'Every finished video downloaded',
            ],
            done: 'Whole batch done in about half an hour',
          },
        ],
        artSeed: 5,
      },
    },
    {
      id: 'hours-returned',
      navTitle: 'Hours returned',
      title: 'Judged on the time it gives back',
      body: 'On the discovery call we work out how many hours the current way costs you, and we measure the finished build against that number. If we cannot say how much time it saves, it was not worth building.',
      visual: {
        kind: 'hours',
        product: 'Auto Flow',
        logo: logoImage('auto-flow.png', 'Auto Flow'),
        task: 'One 24-image batch',
        before: { label: 'By hand', minutes: 120, note: 'About 2 hours, supervised' },
        after: { label: 'With Auto Flow', minutes: 30, note: 'About 30 minutes, unattended' },
        returned: 'About 90 minutes back, every batch',
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
        points: CITIES,
      },
    },
  ],
  examples: {
    title: 'Start here',
    items: [TALK_LINK, QUOTE_LINK, TOOLS_CASE_LINK, INSIGHTS_LINK],
  },
  stories: {
    title: `Tools built by ${site.name}`,
    action: 'Read the case study',
    items: [WORK.autoFlow, WORK.ruff, WORK.marvy],
  },
  faqs: [
    {
      question: 'What is workflow automation?',
      answer:
        'It means the repetitive job runs on its own. We connect the tools you already use, so details move between them without anyone typing them in again. The goal is to remove the manual step for good, not to make it faster.',
    },
    {
      question: 'How do you know if it was worth building?',
      answer:
        'By the hours it gives back. On the discovery call we work out what the current way costs you in time, and we measure the finished build against that number.',
    },
    {
      question: 'Can you build a dashboard from numbers we already have?',
      answer:
        'Usually yes. Most teams already have the numbers, spread across several tools. The work is pulling them into one live view, not typing anything in again.',
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
