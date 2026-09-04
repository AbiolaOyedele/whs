/**
 * Static site metadata and navigation structure.
 *
 * TODO: every string here is provisional placeholder copy pending real brand
 * content from the manager. See docs/PROGRESS.md.
 */

/**
 * Case studies are written and published at /work/<slug>, but nothing that
 * *lists* them is switched on yet: the cards fall back to a seeded gradient
 * until each entry carries a real screenshot, and a grid of abstract tiles
 * under a heading that promises work reads as an empty section rather than as
 * proof.
 *
 * One flag rather than three, because the home grid, the work index and the
 * navbar's Work panel all list the same projects and must not disagree. Flip it
 * to true and all three come back. Nothing else needs changing.
 */
export const SHOW_PUBLISHED_WORK = false

/** Shown wherever that listing would have been. */
export const WORK_COMING_SOON = 'Ongoing projects will be published soon.'

export const SITE = {
  name: 'WildHands',
  /** Used in <title> suffixes and Organization JSON-LD. */
  legalName: 'WildHands',
  tagline: 'Custom systems that give you your time back.',
  description:
    'WildHands designs and builds custom websites, apps, and internal tools for teams done doing repetitive work by hand.',
  /**
   * Canonical origin. Everything user-facing — canonical tags, sitemap.xml,
   * robots.txt, Open Graph — reads PUBLIC_SITE_URL, not this; this is the value
   * that variable should hold, kept here so the build warning can name it.
   *
   * https, not http: the site is served over TLS and Vercel redirects http to
   * it, so an http canonical would point every crawler at a redirect.
   */
  origin: 'https://whstd.com',
  /*
   * All three deliver. whstd.com is verified in Resend for sending, and inbound
   * is handled by registrar-level forwarding (MX → eforward*.registrar-servers.com),
   * so mail to these addresses reaches a real inbox.
   *
   * Verified 2026-08-28 by sending to each through Resend: all three came back
   * `delivered`, not bounced.
   */
  email: 'hello@whstd.com',
  salesEmail: 'sales@whstd.com',
  hrEmail: 'hr@whstd.com',
} as const

/**
 * Registered company details, printed in the privacy policy.
 *
 * Leave a field as an empty string and the policy omits that line rather than
 * printing a placeholder. Fill these in once the company is registered.
 */
export const COMPANY = {
  /** Registered name, if it differs from the trading name. */
  registeredName: '',
  /** Companies House (or equivalent) number. */
  number: '',
  /** Registered office address, one line. */
  address: '',
} as const

/**
 * How an engagement runs. Replaces price tiers on the service pages — we quote
 * after discovery rather than publishing packages.
 */
export const PROCESS_STEPS = [
  {
    title: 'Discovery call',
    body: 'We learn what is broken and what it is costing you in time.',
  },
  {
    title: 'Scoped proposal',
    body: 'A written plan for your brief, with what is in scope and what is out.',
  },
  {
    title: 'Custom quote',
    body: 'One price, worked out from that scope.',
  },
] as const

/**
 * Social/profile links rendered in the footer.
 *
 * Instagram only for now — there is no LinkedIn page yet. Add it here and it
 * appears in the footer automatically.
 */
export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Instagram', href: 'https://www.instagram.com/wildhands.studios/' },
]

export interface FooterColumn {
  heading: string
  links: ReadonlyArray<{ label: string; href: string }>
}

export const FOOTER_COLUMNS: ReadonlyArray<FooterColumn> = [
  {
    heading: 'Pages',
    links: [
      { label: 'Services', href: '/services' },
      { label: 'Work', href: '/work' },
      { label: 'Stack', href: '/stack' },
      { label: 'Insights', href: '/insights' },
      { label: 'About us', href: '/about' },
      { label: 'Enterprise', href: '/enterprise' },
      { label: 'Careers', href: '/careers' },
      { label: 'Freelance Hub', href: '/freelance-hub' },
      { label: 'Get in touch', href: '/get-in-touch' },
    ],
  },
  {
    heading: 'Connect',
    links: SOCIAL_LINKS,
  },
]

/** Primary nav items that are plain links rather than mega-menu triggers. */
export const PLAIN_NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
]
