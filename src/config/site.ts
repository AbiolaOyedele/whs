/**
 * Static site metadata and navigation structure.
 *
 * TODO: every string here is provisional placeholder copy pending real brand
 * content from the manager. See docs/PROGRESS.md.
 */

export const SITE = {
  name: 'WildHands Studios',
  /** Used in <title> suffixes and Organization JSON-LD. */
  legalName: 'WildHands Studios',
  /** TODO: provisional. One-line positioning. */
  tagline: 'Websites your team can actually run.',
  /** TODO: provisional. Default meta description fallback. */
  description:
    'WildHands Studios is a web studio that audits, designs, migrates, and runs marketing websites for growing companies.',
  /** TODO: confirm real contact addresses before launch. */
  email: 'hello@wildhands.example.com',
  salesEmail: 'sales@wildhands.example.com',
  hrEmail: 'hr@wildhands.example.com',
} as const

/** The four pillars the whole service model is organised around. */
export const PROCESS_STEPS = ['Audit', 'Design', 'Migrate', 'Run'] as const

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
