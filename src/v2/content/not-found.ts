import { USE_CASES, type NavLink } from '@v2/content/navigation'

/** Words for the page shown at any address the site does not have. */
export const NOT_FOUND_PAGE = {
  title: 'There is no page at this address',
  lead: 'The link may be old, or the address may have a typo. These are the pages most visitors come for.',
  home: 'Go to the home page',
  linksTitle: 'Pages on this site',
  links: [
    ...USE_CASES,
    { label: 'Pricing', href: '/pricing' },
    { label: 'Work', href: '/resources' },
    { label: 'Get in touch', href: '/contact' },
  ] satisfies NavLink[],
}
