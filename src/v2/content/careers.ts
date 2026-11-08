/**
 * Copy for /careers, each role page and its application form, carried over
 * from the original site's careers pages (src/pages/careers, now retired).
 *
 * The open roles themselves are not copied: they come from src/config/roles.ts,
 * the one list of openings. Edit that file to add, change or close a role;
 * an empty list shows the "nothing open" line instead.
 */
import { ROLES, findRole, type Role } from '@/config/roles'

export type { Role }
export { ROLES, findRole }

export const CAREERS_PAGE = {
  meta: {
    title: 'Careers',
    description: 'Open roles at WildHands. Remote-only, async-first, and honest about what the work actually is.',
  },
  label: 'Careers',
  title: 'Small team, unglamorous problems, real ownership.',
  intro: 'We are remote-only and async-first, and we would rather tell you what the work is than sell you on it.',
  rulesTitle: 'How we work',
  rules: [
    { title: 'Remote only', body: 'No office, no hybrid expectation, no core-hours theatre.' },
    { title: 'Flexible hours', body: 'Overlap for the meetings that need it. The rest is yours to arrange.' },
    { title: 'Async by default', body: 'Written first. A meeting has to earn itself.' },
    { title: 'Contractor baseline', body: 'A monthly hours baseline agreed up front rather than negotiated each month.' },
  ],
  openTitle: 'Open positions',
  none: 'Nothing open right now. We still read speculative applications.',
  viewRole: 'View role',
  cta: {
    title: 'Not a fit today?',
    body: 'Tell us what you do and we will keep it on file. Freelancers can also join the pool through the Freelance Hub.',
    primary: { label: 'Get in touch', href: '/contact' },
    secondary: { label: 'Freelance Hub', href: '/freelance-hub' },
  },
} as const

export const ROLE_PAGE = {
  back: { label: 'All open roles', href: '/careers' },
  apply: 'Apply now',
  applyAgain: 'Apply for this role',
  needTitle: 'What we need',
  niceTitle: 'Nice to have',
} as const

export const APPLY_PAGE = {
  title: 'Apply',
  lead: 'A few details and, if you like, your CV. We read every application ourselves and reply either way, usually within a week. Questions first? Email us at',
  submit: 'Send application',
  successTitle: 'Application received',
  successBody:
    'Thanks for taking the time. We read every application ourselves and reply either way, usually within a week.',
  otherRoles: { label: 'Other open roles', href: '/careers' },
  writing: { label: 'Read our writing', href: '/blog' },
} as const

/** Path helpers, so the route table and the links agree. */
export const rolePath = (slug: string) => `/careers/${slug}`
export const applyPath = (slug: string) => `/careers/${slug}/apply`
