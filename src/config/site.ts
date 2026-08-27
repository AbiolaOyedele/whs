/**
 * Static site metadata and navigation structure.
 *
 * TODO: every string here is provisional placeholder copy pending real brand
 * content from the manager. See docs/PROGRESS.md.
 */

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
  /**
   * TODO: these mailboxes do not exist yet. Create them (or set up forwarding)
   * on whstd.com before launch — they are printed on the contact page and in
   * the agent instructions, so a missing mailbox silently loses enquiries.
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
    body: 'A plan built around your actual brief, not a template.',
  },
  {
    title: 'Custom quote',
    body: 'Priced for the work in front of us, not a generic package.',
  },
] as const

/**
 * Social/profile links rendered in the footer.
 *
 * Instagram and LinkedIn only for now. GitHub, Dribbble and X were removed —
 * they pointed at the platforms' own home pages rather than at WildHands.
 *
 * TODO: swap in the real handles. These are still the bare domains.
 */
export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Instagram', href: 'https://www.instagram.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
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
