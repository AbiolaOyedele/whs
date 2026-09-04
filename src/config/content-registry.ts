/**
 * The catalogue of editable site content.
 *
 * Every entry here becomes a field in the website editor. The `value` in the
 * database is an OVERRIDE; the `defaultValue` below is the copy that ships in
 * the repository. Two consequences make the whole thing safe:
 *
 *  1. A build with no database, or a database that is unreachable, renders the
 *     defaults. The site cannot go blank because Supabase had a bad afternoon.
 *  2. Clearing a field in the editor restores the shipped copy rather than
 *     emptying the page.
 *
 * Adding a new editable string is two steps: add it here, then read it with
 * `text()` in the template. Nothing else needs to change.
 */

export type ContentType = 'text' | 'textarea' | 'url' | 'list'

export interface ContentEntry {
  key: string
  page: string
  section: string
  label: string
  help?: string
  type: ContentType
  defaultValue: string | string[]
}

/** Grouped for the editor's navigation. Order here is order on screen. */
export const CONTENT_REGISTRY: readonly ContentEntry[] = [
  /* ---------------------------------------------------------------- Home */
  {
    key: 'home.hero.title',
    page: 'Home',
    section: 'Hero',
    label: 'Headline',
    help: 'Three lines at most. It sets the width of the whole hero.',
    type: 'textarea',
    defaultValue: 'Custom systems that give you your time back.',
  },
  {
    key: 'home.hero.standfirst',
    page: 'Home',
    section: 'Hero',
    label: 'Standfirst',
    type: 'textarea',
    defaultValue:
      'WildHands designs and builds custom websites, apps, and internal tools for teams done doing repetitive work by hand.',
  },
  {
    key: 'home.hero.ctaPrimary',
    page: 'Home',
    section: 'Hero',
    label: 'Primary button',
    type: 'text',
    defaultValue: 'Talk to Us',
  },
  {
    key: 'home.hero.ctaSecondary',
    page: 'Home',
    section: 'Hero',
    label: 'Secondary button',
    type: 'text',
    defaultValue: 'See Our Work',
  },
  {
    key: 'home.hero.logosLabel',
    page: 'Home',
    section: 'Hero',
    label: 'Logo strip label',
    type: 'text',
    defaultValue: 'Built by WildHands',
  },
  {
    key: 'home.hero.logos',
    page: 'Home',
    section: 'Hero',
    label: 'Products in the strip',
    help: 'One per line. These are things WildHands built, not client logos.',
    type: 'list',
    defaultValue: ['Dumpty', 'Auto Flow', 'Lazy Meet', 'The Ruff Agency'],
  },

  {
    key: 'home.problems.0.title',
    page: 'Home',
    section: 'The problem',
    label: 'Point one: heading',
    type: 'text',
    defaultValue: 'Automate the repeats.',
  },
  {
    key: 'home.problems.0.body',
    page: 'Home',
    section: 'The problem',
    label: 'Point one: body',
    type: 'textarea',
    defaultValue: 'We build tools that take repetitive work off your plate for good.',
  },
  {
    key: 'home.problems.1.title',
    page: 'Home',
    section: 'The problem',
    label: 'Point two: heading',
    type: 'text',
    defaultValue: 'Get hours back.',
  },
  {
    key: 'home.problems.1.body',
    page: 'Home',
    section: 'The problem',
    label: 'Point two: body',
    type: 'textarea',
    defaultValue: 'We judge every system we build by how much time it saves you.',
  },
  {
    key: 'home.problems.2.title',
    page: 'Home',
    section: 'The problem',
    label: 'Point three: heading',
    type: 'text',
    defaultValue: 'See what is happening, in real time.',
  },
  {
    key: 'home.problems.2.body',
    page: 'Home',
    section: 'The problem',
    label: 'Point three: body',
    type: 'textarea',
    defaultValue:
      'Custom dashboards that show you the numbers that matter, without digging for them.',
  },

  /* ------------------------------------------------------- Site-wide */
  {
    key: 'site.tagline',
    page: 'Site-wide',
    section: 'Identity',
    label: 'Tagline',
    help: 'Used in Organization structured data and social previews.',
    type: 'text',
    defaultValue: 'Custom systems that give you your time back.',
  },
  {
    key: 'site.description',
    page: 'Site-wide',
    section: 'Identity',
    label: 'Meta description',
    help: 'The sentence search engines and AI assistants quote. Around 155 characters.',
    type: 'textarea',
    defaultValue:
      'WildHands designs and builds custom websites, apps, and internal tools for teams done doing repetitive work by hand.',
  },
  {
    key: 'site.email',
    page: 'Site-wide',
    section: 'Contact',
    label: 'General email',
    type: 'text',
    defaultValue: 'hello@whstd.com',
  },
  {
    key: 'site.salesEmail',
    page: 'Site-wide',
    section: 'Contact',
    label: 'Sales email',
    type: 'text',
    defaultValue: 'sales@whstd.com',
  },
  {
    key: 'site.hrEmail',
    page: 'Site-wide',
    section: 'Contact',
    label: 'Careers email',
    type: 'text',
    defaultValue: 'hr@whstd.com',
  },

  {
    key: 'site.process.0.title',
    page: 'Site-wide',
    section: 'How an engagement runs',
    label: 'Step one: title',
    type: 'text',
    defaultValue: 'Discovery call',
  },
  {
    key: 'site.process.0.body',
    page: 'Site-wide',
    section: 'How an engagement runs',
    label: 'Step one: body',
    type: 'textarea',
    defaultValue: 'We learn what is broken and what it is costing you in time.',
  },
  {
    key: 'site.process.1.title',
    page: 'Site-wide',
    section: 'How an engagement runs',
    label: 'Step two: title',
    type: 'text',
    defaultValue: 'Scoped proposal',
  },
  {
    key: 'site.process.1.body',
    page: 'Site-wide',
    section: 'How an engagement runs',
    label: 'Step two: body',
    type: 'textarea',
    defaultValue: 'A written plan for your brief, with what is in scope and what is out.',
  },
  {
    key: 'site.process.2.title',
    page: 'Site-wide',
    section: 'How an engagement runs',
    label: 'Step three: title',
    type: 'text',
    defaultValue: 'Custom quote',
  },
  {
    key: 'site.process.2.body',
    page: 'Site-wide',
    section: 'How an engagement runs',
    label: 'Step three: body',
    type: 'textarea',
    defaultValue: 'One price, worked out from that scope.',
  },
] as const

/** Lookup by key, built once. */
export const CONTENT_BY_KEY: ReadonlyMap<string, ContentEntry> = new Map(
  CONTENT_REGISTRY.map((entry) => [entry.key, entry])
)

/** Page names in registry order, for the editor's navigation. */
export const CONTENT_PAGES: readonly string[] = [
  ...new Set(CONTENT_REGISTRY.map((entry) => entry.page)),
]
