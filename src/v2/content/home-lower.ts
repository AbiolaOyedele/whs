import type { IconName } from '@v2/components/ui/Icon'
import { site } from '@v2/config/site'

/**
 * Words for the lower half of the home page: trust facts, the shop designs
 * and their demo shops, the feature list. Every line is something the
 * product does today (see PRODUCT.md, src/config/plans.ts and
 * src/cms/templates.ts in the main app).
 */

/**
 * The domain every shop lives under. Mirrors the app's NEXT_PUBLIC_ROOT_DOMAIN;
 * read from the app's own address so the platform's name is never typed here.
 */
export const ROOT_DOMAIN = new URL(site.appUrl).hostname.replace(/^app\./, '')

/** A demo shop's address, e.g. https://itanna.<root domain>. */
export function demoShopUrl(slug: string): string {
  return `https://${slug}.${ROOT_DOMAIN}`
}

/* ── Security ─────────────────────────────────────────────────────── */

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
  label: 'Safety',
  title: { before: 'Safe,', highlight: 'steady', after: 'and paid properly' },
  primary: { label: 'How payouts work', href: '/resources' },
  secondary: { label: 'Privacy policy', href: '/privacy' },
  points: [
    {
      icon: 'lock',
      title: 'Payments through Paystack',
      body: 'Shoppers pay by card, bank transfer or USSD at checkout. Paystack handles the payment and its own charge applies.',
    },
    {
      icon: 'bank',
      title: 'Paid to your own bank',
      body: 'Money from each sale is settled to the bank account you add. Paystack checks the account name when you add it.',
    },
    {
      icon: 'globe',
      title: 'Your own address',
      body: 'Every shop gets its own web address. On Starter and above you can use a domain you already own.',
    },
    {
      icon: 'shield',
      title: 'Never switched off',
      body: 'If your plan is not renewed, you get 7 days of grace, then your shop moves to the Free plan. It stays open for orders.',
    },
  ],
}

/* ── Built with: three kinds of shop ──────────────────────────────── */

export interface ShowcaseCard {
  icon: IconName
  title: string
  description: string
  href: string
  linkLabel: string
}

export interface ShowcaseTab {
  label: string
  cards: ShowcaseCard[]
}

const VISIT = 'Visit the shop'
const SEE_HOW = 'See how it works'

export const SHOWCASE_TITLE = `Built with ${site.name}`

export const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    label: 'Fashion',
    cards: [
      {
        icon: 'shirt',
        title: 'Adire Lane, a demo fashion shop',
        description: 'Dresses, kaftans, geles and fabric on the Default design.',
        href: demoShopUrl('adirelane'),
        linkLabel: VISIT,
      },
      {
        icon: 'box',
        title: 'Stock for every size and colour',
        description: 'Each option keeps its own count. It goes down when something sells.',
        href: '/resources',
        linkLabel: SEE_HOW,
      },
      {
        icon: 'phone',
        title: 'WhatsApp and counter sales',
        description: 'Record sales made off the website so every order sits in one list.',
        href: '/resources',
        linkLabel: SEE_HOW,
      },
      {
        icon: 'bag',
        title: 'Goods taken as part payment',
        description: 'Record items a customer hands over as part of what they owe.',
        href: '/resources',
        linkLabel: SEE_HOW,
      },
    ],
  },
  {
    label: 'Beauty',
    cards: [
      {
        icon: 'sparkle',
        title: 'Itanna Beauty, a demo skincare shop',
        description: 'Skincare, hair oils and perfume oils on the Glow design.',
        href: demoShopUrl('itanna'),
        linkLabel: VISIT,
      },
      {
        icon: 'sparkle',
        title: 'Oso Cosmetics, a demo make-up shop',
        description: 'Lipsticks, bases and palettes on the Blush design.',
        href: demoShopUrl('oso'),
        linkLabel: VISIT,
      },
      {
        icon: 'chart',
        title: 'Loyalty points',
        description: 'Shoppers earn points on paid orders and spend them at checkout.',
        href: '/resources',
        linkLabel: SEE_HOW,
      },
      {
        icon: 'mail',
        title: 'Discount codes and emails',
        description: 'Make codes, send emails and keep a newsletter list from the dashboard.',
        href: '/resources',
        linkLabel: SEE_HOW,
      },
    ],
  },
  {
    label: 'Home & living',
    cards: [
      {
        icon: 'home',
        title: 'Ilé Home, a demo homeware shop',
        description: 'Candles, ceramics, lamps and soft things on the Haven design.',
        href: demoShopUrl('ile'),
        linkLabel: VISIT,
      },
      {
        icon: 'home',
        title: 'Igi Furniture, a demo furniture shop',
        description: 'Sofas, tables, beds and storage on the Oak design.',
        href: demoShopUrl('igi'),
        linkLabel: VISIT,
      },
      {
        icon: 'truck',
        title: 'Delivery booked with Fez',
        description: 'Connect Fez and paid orders are booked for delivery. Or set your own fees.',
        href: '/resources',
        linkLabel: SEE_HOW,
      },
      {
        icon: 'bag',
        title: 'Wholesale prices',
        description: 'Set lower prices for bigger orders. The bag shows the price break as shoppers add more.',
        href: '/resources',
        linkLabel: SEE_HOW,
      },
    ],
  },
]

/* ── Shop designs carousel ────────────────────────────────────────── */

export interface ShopDesignTile {
  /** The design's name, shown large in the tile. */
  wordmark: string
  tags: string[]
  title: string
  href: string
  linkLabel: string
}

export const DESIGNS_SECTION = {
  label: 'Shop designs',
  title: { before: 'Five shop designs,', highlight: 'ready to use', after: 'each with a demo shop' },
}

/** Mirrors src/cms/templates.ts in the main app (name, bestFor, first line of the summary). */
export const DESIGN_TILES: ShopDesignTile[] = [
  {
    wordmark: 'Default',
    tags: ['Any shop with good pictures'],
    title: 'Full-screen banners, a short welcome, then one big panel per collection.',
    href: demoShopUrl('adirelane'),
    linkLabel: VISIT,
  },
  {
    wordmark: 'Glow',
    tags: ['Beauty and skincare'],
    title: 'A framed banner, round collection tiles, then products with prices, reviews and your promises.',
    href: demoShopUrl('itanna'),
    linkLabel: VISIT,
  },
  {
    wordmark: 'Blush',
    tags: ['Make-up, perfume and gifts'],
    title: 'A full-width photo with your collections laid over it and serif headings on a soft tint.',
    href: demoShopUrl('oso'),
    linkLabel: VISIT,
  },
  {
    wordmark: 'Haven',
    tags: ['Home, decor and candles'],
    title: 'A wide, light banner with your words beside the product. Quiet and roomy.',
    href: demoShopUrl('ile'),
    linkLabel: VISIT,
  },
  {
    wordmark: 'Oak',
    tags: ['Furniture and interiors'],
    title: "A tinted banner with a framed picture, a bold heading and this week's top three.",
    href: demoShopUrl('igi'),
    linkLabel: VISIT,
  },
]

/* ── Feature list ─────────────────────────────────────────────────── */

export interface FeatureLink {
  label: string
  href: string
}

export const FEATURES_LABEL = 'Features'

export const FEATURE_LINKS: FeatureLink[] = [
  { label: 'Card, transfer and USSD', href: '/resources' },
  { label: 'Stock that counts itself', href: '/resources' },
  { label: 'WhatsApp and counter sales', href: '/resources' },
  { label: 'Delivery booked with Fez', href: '/resources' },
  { label: 'Discount codes', href: '/resources' },
  { label: 'Your own domain', href: '/resources' },
  { label: 'QR codes for in-person sales', href: '/resources' },
  { label: 'Loyalty points', href: '/resources' },
  { label: 'Wholesale prices', href: '/resources' },
  { label: 'Referral rewards', href: '/resources' },
  { label: 'Search engine setup', href: '/resources' },
  { label: 'Email campaigns', href: '/resources' },
  { label: 'Staff accounts', href: '/resources' },
  { label: 'Written business reports', href: '/resources' },
]

/* ── Blog row ─────────────────────────────────────────────────────── */

export const BLOG_ROW = {
  title: 'Latest from the blog',
  seeAll: { label: 'See all posts', href: '/blog' },
}
