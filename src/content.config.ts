/**
 * Content collection schemas. Every frontmatter field is Zod-validated at build
 * time — a malformed entry fails the build rather than rendering blank.
 *
 * NOTE — DEVIATION FROM BRIEF, logged in docs/PROGRESS.md § F-1:
 * The brief specifies `src/content/config.ts`. Astro 7 treats that path as the
 * LEGACY collections location and errors on it; `src/content.config.ts` is the
 * required modern location. Entries still live under `src/content/<collection>/`.
 */
import { defineCollection, reference } from 'astro:content'
import { z } from 'zod'
import { glob } from 'astro/loaders'

/** Stack taxonomy. Mirrors the /stack/[category] route segment. */
export const STACK_CATEGORIES = ['cms', 'framework', 'hosting', 'integrations'] as const

/** Insights taxonomy. Mirrors the /insights/[category] route segment. */
export const INSIGHT_CATEGORIES = [
  'design-systems',
  'field-notes',
  'migration',
  'operations',
  'platform-choice',
] as const

/** The three things WildHands builds. The site is organised around these. */
export const SERVICE_PILLARS = ['websites', 'apps', 'tools'] as const

export type StackCategory = (typeof STACK_CATEGORIES)[number]
export type InsightCategory = (typeof INSIGHT_CATEGORIES)[number]
export type ServicePillar = (typeof SERVICE_PILLARS)[number]

/** Human-readable labels for each stack category. */
export const STACK_CATEGORY_LABELS: Record<StackCategory, string> = {
  cms: 'CMS',
  framework: 'Framework',
  hosting: 'Hosting & Infrastructure',
  integrations: 'Integrations',
}

/**
 * "All X" labels for the stack nav. Written out rather than lower-casing the
 * display label, which produced "All cms" and "All framework".
 */
export const STACK_CATEGORY_ALL_LABELS: Record<StackCategory, string> = {
  cms: 'All CMS options',
  framework: 'All frameworks',
  hosting: 'All hosting',
  integrations: 'All integrations',
}

/** Human-readable labels for each insights category. */
export const INSIGHT_CATEGORY_LABELS: Record<InsightCategory, string> = {
  'design-systems': 'Design Systems',
  'field-notes': 'Field Notes',
  migration: 'Migration & Replatforming',
  operations: 'Running the Website',
  'platform-choice': 'Platform Decisions',
}

/** Human-readable labels for each service pillar. */
export const SERVICE_PILLAR_LABELS: Record<ServicePillar, string> = {
  websites: 'Websites',
  apps: 'Apps',
  tools: 'Tools & Systems',
}

/** One-line positioning for each pillar, used on the services index and nav. */
export const SERVICE_PILLAR_TAGLINES: Record<ServicePillar, string> = {
  websites: 'Custom-built, not templated.',
  apps: 'Software built around how you actually work.',
  tools: 'Dashboards and internal tools that replace the spreadsheet.',
}

/* -------------------------------------------------------------------------- */
/* Shared sub-schemas                                                          */
/* -------------------------------------------------------------------------- */

/** A large numeric result callout, e.g. "+40%" / "Faster page loads". */
const statSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
})

/** A pull-quote with attribution. */
const testimonialSchema = z.object({
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  /** Set only when a real video asset exists — renders the Play video affordance. */
  videoUrl: z.string().optional(),
})

/** One question/answer pair. Feeds both the accordion and FAQPage JSON-LD. */
const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
})

/** Key/value summary rows rendered by AtAGlanceTable. */
const atAGlanceSchema = z.array(
  z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  })
)

/** A numbered narrative block: title plus a short body. */
const numberedItemSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
})

/** Fields shared by every collection. */
const baseFields = {
  title: z.string().min(1),
  /** Meta description. Kept under 160 chars for search snippets. */
  description: z.string().min(1).max(200),
  /**
   * Marks seeded stand-in content. MUST be true on every entry until the
   * manager supplies real copy. `grep -rl "placeholder: true" src/content/`
   */
  placeholder: z.boolean().default(false),
  /** Excludes the entry from listings and sitemap without deleting it. */
  draft: z.boolean().default(false),
}

/* -------------------------------------------------------------------------- */
/* Collections                                                                 */
/* -------------------------------------------------------------------------- */

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    ...baseFields,
    /** Short label above the H1. */
    eyebrow: z.string().optional(),
    /** Hero subheading. */
    summary: z.string().min(1),
    pillar: z.enum(SERVICE_PILLARS),
    /** Controls ordering on /services. Lower sorts first. */
    order: z.number().int().default(50),
    /** The "What is X" definitional section. Leads with a self-contained sentence. */
    definition: z.string().min(1),
    /** "What it includes" breakdown. */
    includes: z.array(numberedItemSchema).default([]),
    /** Platforms/technologies covered, each with a short editorial blurb. */
    platforms: z.array(numberedItemSchema).default([]),
    /** Pricing philosophy copy. No fixed price is ever shown. */
    pricingNote: z.string().optional(),
    /** "How to choose a partner" advice section. */
    choosingAPartner: z.array(numberedItemSchema).default([]),
    /** House opinion section. */
    houseView: z.string().optional(),
    testimonial: testimonialSchema.optional(),
    faqs: z.array(faqSchema).default([]),
    atAGlance: atAGlanceSchema.default([]),
    /** Case studies surfaced at the foot of the page. */
    relatedWork: z.array(reference('work')).default([]),
  }),
})

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    ...baseFields,
    /** Product or client name. Overlays the case-study card. */
    client: z.string().min(1),
    /** One-line outcome shown on the card. */
    summary: z.string().min(1),
    industry: z.string().min(1),
    /** Facet values for the /work filter bar. */
    services: z.array(z.string().min(1)).default([]),
    techStack: z.array(z.string().min(1)).default([]),
    timeline: z.string().optional(),
    /** Public URL, when the project has one. Omitted for tools that are not public. */
    liveUrl: z.url().optional(),
    /** Up to two stat callouts render on the card; the rest show on the detail page. */
    stats: z.array(statSchema).default([]),
    sections: z.array(numberedItemSchema).default([]),
    testimonial: testimonialSchema.optional(),
    outcome: z.string().optional(),
    /** Surfaces the entry in the home page's featured grid. */
    featured: z.boolean().default(false),
    order: z.number().int().default(50),
  }),
})

const stack = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stack' }),
  schema: z.object({
    ...baseFields,
    /** Must match the containing folder — enforced by a build-time check. */
    category: z.enum(STACK_CATEGORIES),
    /** Technology display name. */
    name: z.string().min(1),
    /** One-line positioning statement. */
    positioning: z.string().min(1),
    /** Flags the entry as a house recommendation on the hub and category pages. */
    recommended: z.boolean().default(false),
    definition: z.string().min(1),
    /** "Choose X when" / "Look elsewhere when" — the two-column comparison. */
    chooseWhen: z.array(z.string().min(1)).default([]),
    lookElsewhereWhen: z.array(z.string().min(1)).default([]),
    /**
     * Head-to-head table for `x-vs-y` comparison pages. When present the page
     * renders a ComparisonTable instead of the single-technology layout.
     */
    headToHead: z
      .object({
        optionA: z.string().min(1),
        optionB: z.string().min(1),
        rows: z.array(
          z.object({
            aspect: z.string().min(1),
            a: z.string().min(1),
            b: z.string().min(1),
          })
        ),
      })
      .optional(),
    pricingNote: z.string().optional(),
    houseView: z.string().optional(),
    faqs: z.array(faqSchema).default([]),
    atAGlance: atAGlanceSchema.default([]),
    order: z.number().int().default(50),
  }),
})

const insights = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/insights' }),
  schema: z.object({
    ...baseFields,
    /** Must match the containing folder — enforced by a build-time check. */
    category: z.enum(INSIGHT_CATEGORIES),
    author: z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      bio: z.string().optional(),
    }),
    /** Coerced from the frontmatter date so Article JSON-LD gets a real Date. */
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Estimated read time in minutes. */
    readTime: z.number().int().positive().default(5),
    faqs: z.array(faqSchema).default([]),
  }),
})

const industries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/industries' }),
  schema: z.object({
    ...baseFields,
    /** Industry hero headline. */
    headline: z.string().min(1),
    summary: z.string().min(1),
    /** "What we do for [industry]". */
    whatWeDo: z.array(numberedItemSchema).default([]),
    /** Numbered "why teams pick us" reasons. */
    reasons: z.array(numberedItemSchema).default([]),
    /** What makes estates in this sector structurally different. */
    estateNotes: z.array(numberedItemSchema).default([]),
    testimonial: testimonialSchema.optional(),
    faqs: z.array(faqSchema).default([]),
    atAGlance: atAGlanceSchema.default([]),
    relatedWork: z.array(reference('work')).default([]),
    order: z.number().int().default(50),
  }),
})

export const collections = { services, work, stack, insights, industries }
