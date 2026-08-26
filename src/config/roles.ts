/**
 * Open roles.
 *
 * TODO: placeholder listings. These drive /careers/[role] and the apply wizard.
 * Replace with real openings, or set to an empty array to show the no-vacancies
 * state, before launch.
 */
export interface Role {
  slug: string
  title: string
  level: string
  location: string
  summary: string
  requirements: readonly string[]
  niceToHave: readonly string[]
}

export const ROLES: readonly Role[] = [
  {
    slug: 'senior-frontend-engineer',
    title: 'Senior Frontend Engineer',
    level: 'Senior',
    location: 'Remote',
    summary:
      'Build and migrate marketing platforms for clients whose in-house teams will run them afterwards.',
    requirements: [
      'Substantial production experience with a modern component framework',
      'Comfortable owning performance and accessibility, not treating them as a later pass',
      'Has migrated a real site off a legacy platform and can describe what went wrong',
    ],
    niceToHave: ['Astro', 'Headless CMS modelling', 'Design systems work'],
  },
  {
    slug: 'product-designer',
    title: 'Product Designer',
    level: 'Mid to senior',
    location: 'Remote',
    summary:
      'Design systems and page templates that a client team can extend for years without us.',
    requirements: [
      'Portfolio of shipped marketing or product work, not concept pieces',
      'Designs in a system rather than page by page',
      'Can hand off to engineers without a translation layer',
    ],
    niceToHave: ['Figma variables and tokens', 'Motion design', 'Front-end familiarity'],
  },
]

/** Finds a role by URL slug. */
export function findRole(slug: string): Role | undefined {
  return ROLES.find((role) => role.slug === slug)
}
