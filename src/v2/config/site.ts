/**
 * The studio's name and the two places the header buttons lead. Everything
 * here mirrors the main site's src/config/site.ts.
 */
export const PLATFORM_NAME = 'WildHands'

export const site = {
  name: PLATFORM_NAME,
  company: { name: 'WildHands', url: 'https://whstd.com' },
  supportEmail: 'hello@whstd.com',
  appUrl: 'https://whstd.com',
  /** Primary header button: "Get in touch". */
  signUpUrl: '/contact',
  /** Secondary header button: "Request a quote". */
  signInUrl: '/request-a-quote',
} as const

export type Scheme = 'dark' | 'slate'

/** Pages on a light panel; everything else (home, about, use cases, 404) sits on the dark 3D background. */
const SLATE_PAGES = ['/pricing', '/blog', '/resources', '/contact', '/book-demo', '/brand-assets', '/privacy', '/terms-of-service']

/** Which header scheme each page wears. */
export function pageScheme(pathname: string): Scheme {
  return SLATE_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`)) ? 'slate' : 'dark'
}
