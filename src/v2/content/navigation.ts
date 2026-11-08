import { site } from '@v2/config/site'

export type NavIcon = 'shirt' | 'sparkle' | 'home' | 'calendar' | 'mail'

export interface NavLink {
  label: string
  href: string
  icon?: NavIcon
}

/** The kinds of shop the use-case pages are written for. */
export const USE_CASES: NavLink[] = [
  { label: 'Fashion', href: '/use-cases/fashion', icon: 'shirt' },
  { label: 'Beauty', href: '/use-cases/beauty', icon: 'sparkle' },
  { label: 'Home & living', href: '/use-cases/home-and-living', icon: 'home' },
]

export const MAIN_NAV: NavLink[] = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Help', href: '/resources' },
  { label: 'Blog', href: '/blog' },
  { label: 'Company', href: '/about' },
]

export const MORE_NAV: NavLink[] = [
  { label: 'Talk to us', href: '/book-demo', icon: 'calendar' },
  { label: 'Contact us', href: '/contact', icon: 'mail' },
]

/** The platform's social accounts. Leave `href` as '#' until an account exists; those are not shown. */
export const SOCIALS: { label: 'X' | 'Instagram' | 'TikTok' | 'WhatsApp'; href: string }[] = [
  { label: 'X', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'TikTok', href: '#' },
  { label: 'WhatsApp', href: '#' },
]

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  { title: 'Shops', links: USE_CASES },
  {
    title: site.name,
    links: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Company', href: '/about' },
      { label: 'Help', href: '/resources' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Sign in', href: site.signInUrl },
    ],
  },
]

export const LEGAL_LINKS: NavLink[] = [
  { label: 'Brand assets', href: '/brand-assets' },
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Terms of service', href: '/terms-of-service' },
]

/** Only the accounts that exist, so no link leads nowhere. */
export const LIVE_SOCIALS = SOCIALS.filter((social) => social.href !== '#')
