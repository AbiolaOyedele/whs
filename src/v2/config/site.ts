/**
 * The platform's name and the addresses the marketing site links out to.
 * The name is a placeholder that may change: mirror PLATFORM_NAME in the
 * main app's src/config/site.ts and never type it anywhere else.
 */
export const PLATFORM_NAME = 'Dooja'

export const site = {
  name: PLATFORM_NAME,
  company: { name: 'Wild Hands Studio', url: 'https://whstd.com' },
  supportEmail: 'dooja@whstd.com',
  appUrl: 'https://app.dooja.shop',
  signUpUrl: 'https://app.dooja.shop/sign-up',
  signInUrl: 'https://app.dooja.shop/dashboard',
} as const

export type Scheme = 'dark' | 'slate'

/** Pages on a light panel; everything else (home, about, use cases, 404) sits on the dark 3D background. */
const SLATE_PAGES = ['/pricing', '/blog', '/resources', '/contact', '/book-demo', '/brand-assets', '/privacy', '/terms-of-service']

/** Which header scheme each page wears. */
export function pageScheme(pathname: string): Scheme {
  return SLATE_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`)) ? 'slate' : 'dark'
}
