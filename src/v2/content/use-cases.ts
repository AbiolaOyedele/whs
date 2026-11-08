import { site } from '@v2/config/site'
import type { IconName } from '@v2/components/ui/Icon'
import type { MapPoint } from '@v2/components/features/feature-cards/MapCard'

/**
 * The three "kinds of shop" pages. Each mirrors one of the reference site's
 * use-case pages (fashion ← voice, beauty ← language models, home and living
 * ← image and video) and is rendered by one shared template.
 *
 * Every claim here comes from the platform itself: plans and fees from the
 * main app's `src/config/plans.ts`, templates from `src/cms/templates.ts`,
 * shop wording from `src/config/industry-words.ts`, demo shops from
 * `npm run db:demo`. Change those first, then this.
 */

export const USE_CASE_SLUGS = ['fashion', 'beauty', 'home-and-living'] as const
export type UseCaseSlug = (typeof USE_CASE_SLUGS)[number]

export function isUseCaseSlug(value: string): value is UseCaseSlug {
  return (USE_CASE_SLUGS as readonly string[]).includes(value)
}

/** A run of heading text; `highlight` runs wear the pink gradient. */
export interface TitlePart {
  text: string
  highlight?: boolean
}

/* ── plan figures (mirror src/config/plans.ts; prices before 7.5% VAT) ── */

export interface PlanCost {
  name: string
  /** Naira a month. */
  monthly: number
  /** Share of each online sale, 0.03 = 3%. */
  fee: number
}

export const PLAN_COSTS = {
  free: { name: 'Free', monthly: 0, fee: 0.03 },
  starter: { name: 'Starter', monthly: 3500, fee: 0.01 },
  growth: { name: 'Growth', monthly: 9000, fee: 0 },
} as const satisfies Record<string, PlanCost>

/** Monthly online sales at which two plans cost the same. */
export function breakEven(a: PlanCost, b: PlanCost): number {
  return Math.round((b.monthly - a.monthly) / (a.fee - b.fee))
}

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`

/* ── demo shops and templates (from npm run db:demo / cms/templates.ts) ── */

/** Shops live on subdomains of the platform's root domain. */
const SHOP_ROOT = new URL(site.appUrl).host.replace(/^app\./, '')

export type TemplateGlyph = 'default' | 'glow' | 'blush' | 'haven' | 'oak'

export interface TemplateSlide {
  glyph: TemplateGlyph
  name: string
  bestFor: string
}

const TEMPLATE_SLIDES: Record<TemplateGlyph, TemplateSlide> = {
  default: { glyph: 'default', name: 'Default', bestFor: 'Any shop with good pictures' },
  glow: { glyph: 'glow', name: 'Glow', bestFor: 'Beauty and skincare' },
  blush: { glyph: 'blush', name: 'Blush', bestFor: 'Make-up, perfume and gifts' },
  haven: { glyph: 'haven', name: 'Haven', bestFor: 'Home, decor and candles' },
  oak: { glyph: 'oak', name: 'Oak', bestFor: 'Furniture and interiors' },
}

export interface DemoShop {
  slug: string
  template: string
  trade: string
  title: string
  href: string
}

function demoShop(slug: string, template: string, trade: string, sells: string): DemoShop {
  return {
    slug,
    template,
    trade,
    title: `${slug}: a demo shop selling ${sells}, on the ${template} template`,
    href: `https://${slug}.${SHOP_ROOT}`,
  }
}

const DEMO = {
  adirelane: demoShop('adirelane', 'Default', 'Fashion', 'clothes, headwraps and fabric'),
  itanna: demoShop('itanna', 'Glow', 'Beauty', 'skincare, hair and fragrance'),
  oso: demoShop('oso', 'Blush', 'Beauty', 'make-up and fragrance'),
  ile: demoShop('ile', 'Haven', 'Home', 'candles, ceramics and lighting'),
  igi: demoShop('igi', 'Oak', 'Home', 'furniture for every room'),
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
  | { kind: 'wordmarks'; names: string[]; artSeed: number }
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
}

/* ── shared pieces ── */

const SIGN_UP: ExampleLink = {
  icon: 'bag',
  title: 'Open your shop',
  body: 'Free to open. No card needed.',
  action: 'Start now',
  href: site.signUpUrl,
}

const PLANS_LINK: ExampleLink = {
  icon: 'chart',
  title: 'Compare the plans',
  body: 'Start on Free, then move up when a flat price costs less than the fee.',
  action: 'See plans',
  href: '/pricing',
}

const HELP_LINK: ExampleLink = {
  icon: 'box',
  title: 'Read the help guides',
  body: 'Guides for setting up your shop and running it day to day.',
  action: 'Read guides',
  href: '/resources',
}

const TALK_LINK: ExampleLink = {
  icon: 'calendar',
  title: 'Talk to us',
  body: 'Tell us what you sell and we will help you set up your shop.',
  action: 'Talk to us',
  href: '/book-demo',
}

const DELIVERY_BODY =
  'Set a delivery fee for each area, or connect Fez and every paid order is booked for you. Shoppers pay by card, transfer or USSD through Paystack.'

const why = (highlight: string): TitlePart[] => [
  { text: `Why ${site.name} for ` },
  { text: highlight, highlight: true },
]

/* ── the pages ── */

const fashion: UseCaseContent = {
  slug: 'fashion',
  meta: {
    title: 'Online shop for fashion sellers',
    description:
      'Sell clothes, shoes, bags and jewellery online. Every piece with its sizes and stock, orders from your website, WhatsApp and stall in one list, paid through Paystack.',
  },
  label: 'Fashion',
  title: [{ text: 'An online shop for' }, { text: 'fashion', highlight: true }, { text: 'sellers' }],
  intro:
    'Put every piece online with its sizes and colours. Take card, transfer and USSD payments through Paystack, and run orders and stock from your phone.',
  hero: { kind: 'voice' },
  lede: 'Built for clothes, shoes, bags and jewellery, and the sizes that come with them.',
  why: why('fashion?'),
  featuresLabel: 'Features',
  features: [
    {
      id: 'one-order-list',
      navTitle: 'One order list',
      title: 'Every order in one place',
      body: 'Website sales, WhatsApp sales and sales at your stall land in one list. Pack, send and refund from your phone.',
      visual: {
        kind: 'flow',
        hub: 'Orders',
        sources: ['Website', 'WhatsApp', 'Stall'],
        sideLabel: '1 list',
        artSeed: 2,
      },
    },
    {
      id: 'stock-by-size',
      navTitle: 'Stock by size',
      title: 'Sizes and colours, counted',
      body: 'Each size keeps its own count. It goes down when a piece sells and tells you before you run out.',
      visual: { kind: 'cubes' },
    },
    {
      id: 'delivery',
      navTitle: 'Delivery',
      title: 'Booked as soon as they pay',
      body: DELIVERY_BODY,
      visual: {
        kind: 'map',
        leftChip: 'Delivery : your fees or Fez',
        rightChip: 'Payments : card, transfer, USSD',
        points: CITIES,
      },
    },
    {
      id: 'demo-shops',
      navTitle: 'Demo shops',
      title: 'See a shop before you build yours',
      body: 'Every template has a demo shop with products, collections and reviews in it. Open adirelane to see the Default template dressed for fashion.',
      visual: { kind: 'wordmarks', names: ['adirelane', 'itanna', 'oso', 'ile', 'igi'], artSeed: 5 },
    },
  ],
  examples: {
    title: 'Start here',
    items: [SIGN_UP, PLANS_LINK, HELP_LINK, TALK_LINK],
  },
  stories: {
    title: `Demo shops running on ${site.name}`,
    action: 'Open the shop',
    items: [DEMO.adirelane, DEMO.oso, DEMO.itanna, DEMO.ile],
  },
}

const beauty: UseCaseContent = {
  slug: 'beauty',
  meta: {
    title: 'Online shop for beauty sellers',
    description:
      'Sell skincare, hair, make-up and fragrance online. Each shade and size with its own stock, templates made for beauty, and payments through Paystack to your bank.',
  },
  label: 'Beauty',
  title: [{ text: 'Run your' }, { text: 'beauty', highlight: true }, { text: 'shop online' }],
  intro:
    'List every shade and size with its own stock. Shoppers pay by card, transfer or USSD, and the money goes to your own bank account.',
  hero: {
    kind: 'crossword',
    words: ['DELIVERY', 'PAYSTACK', 'SHADES', 'ORDERS', 'STOCK', 'GLOW', 'PAID'],
    mobileWords: ['STOCK', 'GLOW', 'PAID'],
    sequence: [['STOCK', 'PAID'], ['GLOW', 'ORDERS'], ['SHADES'], ['DELIVERY'], ['PAYSTACK']],
    mobileSequence: [['STOCK'], ['GLOW'], ['PAID']],
  },
  lede: 'Built for skincare, hair, make-up and fragrance, in every shade and size.',
  why: why('beauty?'),
  featuresLabel: 'Features',
  features: [
    {
      id: 'shades-and-sizes',
      navTitle: 'Shades and sizes',
      title: 'Every shade keeps its own count',
      body: 'Add a lipstick in six shades or a cream in two sizes. Each one has its own stock, goes down when it sells and tells you before it runs out.',
      visual: { kind: 'cubes' },
    },
    {
      id: 'templates',
      navTitle: 'Templates',
      title: 'Templates made for beauty',
      body: 'Glow suits skincare, hair and perfume, with round collection tiles and reviews by each product. Blush suits make-up and gifts, with serif headings on a soft tint.',
      visual: {
        kind: 'templates',
        items: [TEMPLATE_SLIDES.glow, TEMPLATE_SLIDES.blush, TEMPLATE_SLIDES.default, TEMPLATE_SLIDES.haven, TEMPLATE_SLIDES.oak],
      },
    },
    {
      id: 'payments',
      navTitle: 'Payments',
      title: 'Paid to your own bank',
      body: 'Shoppers pay by card, bank transfer or USSD through Paystack. Each sale is settled to the bank account you add, usually the next working day.',
      visual: { kind: 'batches', tabs: ['Card', 'Transfer', 'USSD'], artSeed: 3 },
    },
    {
      id: 'delivery',
      navTitle: 'Delivery',
      title: 'Delivery fees you control',
      body: DELIVERY_BODY,
      visual: {
        kind: 'map',
        leftChip: 'Delivery : your fees or Fez',
        rightChip: 'Payments : card, transfer, USSD',
        points: CITIES,
      },
    },
  ],
  examples: {
    title: 'Start here',
    seeAll: { label: 'See all', href: '/resources' },
    items: [SIGN_UP, PLANS_LINK, HELP_LINK, TALK_LINK],
  },
  stories: {
    title: `Demo shops running on ${site.name}`,
    action: 'Open the shop',
    items: [DEMO.itanna, DEMO.oso, DEMO.adirelane],
  },
}

const free = PLAN_COSTS.free
const starter = PLAN_COSTS.starter
const growth = PLAN_COSTS.growth

const homeAndLiving: UseCaseContent = {
  slug: 'home-and-living',
  meta: {
    title: 'Online shop for home and living sellers',
    description:
      'Sell decor, candles, lighting and furniture online. Templates made for homeware, room for a full catalogue, and a flat monthly price once you sell more.',
  },
  label: 'Home & living',
  title: [
    { text: 'Sell' },
    { text: 'home', highlight: true },
    { text: 'and' },
    { text: 'living', highlight: true },
    { text: 'pieces online' },
  ],
  intro:
    'Give a big catalogue a calm, roomy shop. Haven and Oak are templates made for homeware and furniture.',
  hero: { kind: 'media' },
  lede: 'Built for decor, candles, lighting and furniture, however many pieces you stock.',
  why: why('home and living?'),
  featuresLabel: 'Features',
  features: [
    {
      id: 'full-catalogue',
      navTitle: 'Full catalogue',
      title: 'Room for every piece you stock',
      body: 'Free holds 25 products and Starter 300. Growth and Pro have no limit, so a whole showroom fits.',
      visual: { kind: 'cubes' },
    },
    {
      id: 'templates',
      navTitle: 'Templates',
      title: 'Layouts made for homeware',
      body: 'Haven is quiet and roomy, for candles, lighting and decor. Oak leads with a bold banner and collection tabs, for furniture and other big pieces.',
      visual: {
        kind: 'templates',
        items: [TEMPLATE_SLIDES.haven, TEMPLATE_SLIDES.oak, TEMPLATE_SLIDES.default, TEMPLATE_SLIDES.glow],
      },
    },
    {
      id: 'plan-costs',
      navTitle: 'Plan costs',
      title: 'A flat price once you sell more',
      body: `Free takes 3% of each online sale. Starter is ${naira(starter.monthly)} a month plus 1%, and costs less than Free above ${naira(breakEven(free, starter))} a month in online sales. Growth is ${naira(growth.monthly)} a month with no fee, and costs less than Starter above ${naira(breakEven(starter, growth))}. Prices are before 7.5% VAT and Paystack's own charge.`,
      visual: {
        kind: 'chart',
        tabs: [
          { label: 'Starter', plans: [free, starter] },
          { label: 'Growth', plans: [starter, growth] },
        ],
        yLabel: 'Plan cost a month',
        xLabel: 'Online sales a month',
        artSeed: 4,
      },
    },
    {
      id: 'delivery',
      navTitle: 'Delivery',
      title: 'Delivery fees you control',
      body: DELIVERY_BODY,
      visual: {
        kind: 'map',
        leftChip: 'Delivery : your fees or Fez',
        rightChip: 'Payments : card, transfer, USSD',
        points: CITIES,
      },
    },
  ],
  examples: {
    title: 'Start here',
    items: [SIGN_UP],
  },
  stories: {
    title: `Demo shops running on ${site.name}`,
    action: 'Open the shop',
    items: [DEMO.ile, DEMO.igi, DEMO.adirelane],
  },
}

export const USE_CASES_CONTENT: Record<UseCaseSlug, UseCaseContent> = {
  fashion,
  beauty,
  'home-and-living': homeAndLiving,
}

export function getUseCase(slug: string): UseCaseContent | null {
  return isUseCaseSlug(slug) ? USE_CASES_CONTENT[slug] : null
}
