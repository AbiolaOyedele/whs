import { site } from '@v2/config/site'

export type NavIcon = 'globe' | 'monitorSmartphone' | 'workflow' | 'calendar' | 'mail'

export interface NavLink {
  label: string
  href: string
  icon?: NavIcon
}

/** The three services, one page each (the use-case template). */
export const USE_CASES: NavLink[] = [
  { label: 'Websites', href: '/use-cases/websites', icon: 'globe' },
  { label: 'Apps', href: '/use-cases/apps', icon: 'monitorSmartphone' },
  { label: 'Tools & Systems', href: '/use-cases/tools-and-systems', icon: 'workflow' },
]

/** Same order as the main site's header: Services (the dropdown), Work, About, Insights. */
export const MAIN_NAV: NavLink[] = [
  { label: 'Work', href: '/resources' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/blog' },
]

export const MORE_NAV: NavLink[] = [
  { label: 'Request a quote', href: '/request-a-quote', icon: 'calendar' },
  { label: 'Get in touch', href: '/contact', icon: 'mail' },
]

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  { title: 'Services', links: USE_CASES },
  {
    title: site.name,
    links: [
      { label: 'Work', href: '/resources' },
      { label: 'Insights', href: '/blog' },
      { label: 'About us', href: '/about' },
      { label: 'Clients outside Nigeria', href: '/outside-nigeria' },
      { label: 'Careers', href: '/careers' },
      { label: 'Freelance Hub', href: '/freelance-hub' },
      { label: 'Request a quote', href: '/request-a-quote' },
      { label: 'Get in touch', href: '/contact' },
    ],
  },
]

export const LEGAL_LINKS: NavLink[] = [
  { label: 'Brand assets', href: '/brand-assets' },
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Terms of service', href: '/terms-of-service' },
]
