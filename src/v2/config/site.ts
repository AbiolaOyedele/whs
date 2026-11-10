/**
 * The studio's name and the two places the header buttons lead. Everything
 * here mirrors the main site's src/config/site.ts.
 */
export const PLATFORM_NAME = 'WildHands'

export const site = {
  name: PLATFORM_NAME,
  company: { name: 'WildHands', url: 'https://whstd.com' },
  supportEmail: 'hello@whstd.com',
  /** Who runs the studio; named where a visitor wants to know who they will talk to. */
  founder: 'Abiola Oyedele',
  /** The studio's first number in src/config/site.ts, as a WhatsApp chat link. */
  whatsapp: { display: '+234 703 855 3563', url: 'https://wa.me/2347038553563' },
  appUrl: 'https://whstd.com',
  /** Primary header button: "Get in touch". */
  signUpUrl: '/contact',
  /** Secondary header button: "Request a quote". */
  signInUrl: '/request-a-quote',
} as const

export type Scheme = 'dark' | 'slate'

/** Pages on a light panel; everything else (home, about, use cases, 404) sits on the dark 3D background. */
const SLATE_PAGES = [
  '/pricing',
  '/blog',
  '/resources',
  '/contact',
  '/request-a-quote',
  '/careers',
  '/freelance-hub',
  '/brand-assets',
  '/privacy',
  '/terms-of-service',
  '/outside-nigeria',
]

/** Which header scheme each page wears. */
export function pageScheme(pathname: string): Scheme {
  // The What we build list is a light page; each of its pages is dark.
  if (pathname === '/what-we-build') return 'slate'
  return SLATE_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`)) ? 'slate' : 'dark'
}
