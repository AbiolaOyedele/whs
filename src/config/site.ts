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
  /** TODO: confirm real contact addresses before launch. */
  email: 'hello@wildhands.example.com',
  salesEmail: 'sales@wildhands.example.com',
  hrEmail: 'hr@wildhands.example.com',
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

/** Social/profile links rendered in the footer. TODO: real URLs. */
export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { label: 'Dribbble', href: 'https://dribbble.com' },
  { label: 'X', href: 'https://x.com' },
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
      { label: 'llms.txt Generator', href: '/tools/llms-txt-generator' },
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
