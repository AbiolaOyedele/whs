/**
 * Environment variable validation.
 *
 * This is the ONLY module permitted to read `import.meta.env` / `process.env`.
 * Every other file imports from here. ESLint enforces it.
 *
 * Two exports, deliberately split and validated at different times:
 *
 *  - `publicEnv` — PUBLIC_* only, validated at import. Safe in client islands.
 *  - `serverEnv()` — includes secrets, validated lazily on first call.
 *
 * The timing split matters. This is a static site: the pages are prerendered at
 * build time and only the API routes need Resend, at request time. Validating
 * secrets at module load meant a build with no secrets configured failed before
 * it rendered a single page — which is exactly what happened on the first
 * deploy. Validating them on first use keeps the build green while still
 * failing loudly, with a real error, the moment a form is actually submitted
 * without a key.
 */
import { z } from 'zod'

/**
 * Merged env source. `process.env` covers Node/build-time, `import.meta.env`
 * covers Vite/Astro.
 *
 * Blank values are stripped, so a variable set to an empty string behaves
 * exactly like one that was never set. Hosting dashboards make it very easy to
 * create a variable and leave it empty, and without this an optional field like
 * PUBLIC_POSTHOG_KEY fails validation on `""` while passing on `undefined` —
 * which is a confusing way to break a deploy.
 */
const rawSource: Record<string, unknown> = {
  ...(typeof process !== 'undefined' && process.env ? process.env : {}),
  ...(import.meta.env as Record<string, unknown>),
}

const source: Record<string, unknown> = Object.fromEntries(
  Object.entries(rawSource).filter(
    ([, value]) => !(typeof value === 'string' && value.trim() === '')
  )
)

/**
 * Resolves the canonical origin.
 *
 * Vercel does not set PUBLIC_SITE_URL, but it does expose the deployment host —
 * without a protocol — so we normalise it. Preferring the production host keeps
 * canonical URLs and sitemap entries pointing at the real domain even when a
 * preview deployment builds them.
 */
function resolveSiteUrl(): string {
  const explicit = source['PUBLIC_SITE_URL']
  if (typeof explicit === 'string' && explicit.length > 0) return explicit

  const vercelHost = source['VERCEL_PROJECT_PRODUCTION_URL'] ?? source['VERCEL_URL']
  if (typeof vercelHost === 'string' && vercelHost.length > 0) {
    const resolved = vercelHost.startsWith('http') ? vercelHost : `https://${vercelHost}`
    // Loud, because it is silently wrong rather than broken: the site builds
    // fine, but every canonical URL, sitemap entry and OG tag points at the
    // deployment host instead of the real domain.
    console.warn(
      `⚠️  PUBLIC_SITE_URL is not set. Falling back to ${resolved}.\n` +
        '   Canonical URLs, sitemap.xml, robots.txt and Open Graph tags will all\n' +
        '   use that host. Set PUBLIC_SITE_URL to https://whstd.com before launch.'
    )
    return resolved
  }

  console.warn(
    '⚠️  PUBLIC_SITE_URL is not set and no deployment host was found.\n' +
      '   Falling back to http://localhost:4321. Do not ship this build.'
  )
  return 'http://localhost:4321'
}

const publicSchema = z.object({
  PUBLIC_SITE_URL: z.url(),
  PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  PUBLIC_POSTHOG_HOST: z.url().optional(),
})

const serverSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  CONTACT_NOTIFICATION_EMAIL: z.email(),
  /*
   * Cloudinary stores CV uploads. Optional: with these unset the application
   * still submits and the CV still arrives as an email attachment, it is just
   * not filed anywhere. A missing variable must not lose someone's
   * application. See src/lib/cloudinary.ts.
   */
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
})

/**
 * Admin panel: Supabase (auth + data), Anthropic (quote drafting), Vercel
 * (publish hook + analytics read).
 *
 * Validated separately from `serverSchema` and lazily, for the same reason the
 * server/public split exists: the marketing site and its four forms must keep
 * building and sending on a deployment where no admin panel is configured. A
 * missing SUPABASE_URL is an admin problem, not a contact-form problem.
 *
 * Supabase is server-only here on purpose. The admin UI never talks to Supabase
 * from the browser — it calls our own /api/v1/admin/* routes, which hold the
 * session in an httpOnly cookie. That keeps the layering rule intact and means
 * no Supabase key of any kind ships in a client bundle.
 */
const adminSchema = z.object({
  SUPABASE_URL: z.url(),
  /** Used only to exchange an email + password for a session. */
  SUPABASE_ANON_KEY: z.string().min(1),
  /** Bypasses RLS. Server-only, never sent to a browser. */
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  /**
   * Drafting assistance for quotes. Two providers, either or both.
   *
   * Claude is the default. Gemini is selectable per request from the drafting
   * panel, so a provider outage or a second opinion never blocks a quote going
   * out. Both are optional: with neither key set the quote editor works exactly
   * as normal and only the "Draft with AI" panel is disabled.
   */
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  /** Overrides the Claude model id. Model names move faster than this repo. */
  ANTHROPIC_MODEL: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  /** Overrides the Gemini model id. Model names move faster than this repo. */
  GEMINI_MODEL: z.string().min(1).optional(),
  /**
   * Vercel Deploy Hook. Publishing content edits POSTs here to trigger a
   * rebuild. Without it the admin still saves, it just cannot publish.
   */
  WH_VERCEL_DEPLOY_HOOK_URL: z.url().optional(),
  /*
   * Prefixed WH_ deliberately. Vercel reserves the `VERCEL_` prefix for its own
   * system variables and its CLI reads `VERCEL_PROJECT_ID` to decide which
   * project a command targets — so naming ours that way both collides with the
   * CLI and cannot be stored in project settings.
   */
  /** Read-only token for the analytics section. */
  WH_VERCEL_API_TOKEN: z.string().min(1).optional(),
  WH_VERCEL_PROJECT_ID: z.string().min(1).optional(),
  WH_VERCEL_TEAM_ID: z.string().min(1).optional(),
  /**
   * Comma-separated allowlist of addresses permitted to sign in. A correct
   * password is not enough: the address must also appear here. This is the
   * difference between one admin account and anyone who ever gets a row in
   * Supabase's auth table.
   */
  /**
   * Paystack. Optional: with no keys the quote page simply does not offer
   * payment, and every other part of the admin is unaffected.
   *
   * Flagged deviation: the confirmed stack names Stripe. Paystack was chosen
   * for this build on the operator's instruction.
   */
  PAYSTACK_SECRET_KEY: z.string().min(1).optional(),
  PAYSTACK_PUBLIC_KEY: z.string().min(1).optional(),
  ADMIN_ALLOWED_EMAILS: z.string().min(3),
  /**
   * Server-side secret mixed into every client quote PIN hash. Rotating it
   * invalidates every existing PIN, which is the intended emergency lever.
   */
  QUOTE_PIN_PEPPER: z.string().min(16),
})

/** Formats a Zod error into a readable multi-line message. */
function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
}

const publicParsed = publicSchema.safeParse({ ...source, PUBLIC_SITE_URL: resolveSiteUrl() })
if (!publicParsed.success) {
  console.error(`❌ Invalid public environment variables:\n${formatIssues(publicParsed.error)}`)
  throw new Error('Environment validation failed. App cannot start.')
}

/**
 * Whether this is a production build.
 *
 * Exported from here because this module is the only one permitted to read
 * `import.meta.env`, and ESLint enforces that. Cookie flags need it: `secure`
 * must be on in production and off on http://localhost, or nothing signs in
 * locally.
 */
export const isProduction: boolean = import.meta.env.PROD === true

/** Validated PUBLIC_* environment variables. Safe to use in client islands. */
export const publicEnv = publicParsed.data

type ServerEnv = z.infer<typeof serverSchema>

let cachedServerEnv: ServerEnv | null = null

/**
 * Validated server-side environment variables, including secrets.
 *
 * Validated on first call rather than at import, so a build without secrets
 * configured still succeeds. Never call this from a client island — it throws
 * in the browser by design, and the secrets are not there anyway.
 */
export function serverEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv

  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() is server-only and must not be called from client code.')
  }

  const parsed = serverSchema.safeParse(source)
  if (!parsed.success) {
    console.error(`❌ Invalid server environment variables:\n${formatIssues(parsed.error)}`)
    throw new Error(
      'Server environment validation failed. Set RESEND_API_KEY and CONTACT_NOTIFICATION_EMAIL.'
    )
  }

  cachedServerEnv = parsed.data
  return cachedServerEnv
}

type AdminEnv = z.infer<typeof adminSchema>

let cachedAdminEnv: AdminEnv | null = null

/**
 * Validated admin-panel environment. Throws a plain-English error naming the
 * missing variables rather than failing somewhere deeper with a null client.
 *
 * Server-only, lazy, and cached — same contract as `serverEnv()`.
 */
export function adminEnv(): AdminEnv {
  if (cachedAdminEnv) return cachedAdminEnv

  if (typeof window !== 'undefined') {
    throw new Error('adminEnv() is server-only and must not be called from client code.')
  }

  const parsed = adminSchema.safeParse(source)
  if (!parsed.success) {
    console.error(`❌ Invalid admin environment variables:\n${formatIssues(parsed.error)}`)
    throw new Error(
      'Admin environment validation failed. See .env.example for the variables the admin panel needs.'
    )
  }

  cachedAdminEnv = parsed.data
  return cachedAdminEnv
}

/**
 * Whether the admin panel has enough configuration to run at all.
 *
 * Used by the admin routes to render a setup screen explaining what is missing,
 * instead of a 500 that tells the operator nothing.
 */
export function isAdminConfigured(): boolean {
  if (typeof window !== 'undefined') return false
  return adminSchema.safeParse(source).success
}

/** Addresses permitted to sign in, normalised and lowercased. */
export function adminAllowedEmails(): readonly string[] {
  return adminEnv()
    .ADMIN_ALLOWED_EMAILS.split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)
}

/**
 * Which admin variables are missing or malformed, by name only.
 *
 * Names, never values. This drives the /admin/setup screen, which is reachable
 * without a session by necessity — there is nothing to sign in to until it is
 * resolved — so it must not become a readout of the deployment's configuration.
 */
export function adminConfigIssues(): string[] {
  if (typeof window !== 'undefined') return []

  const parsed = adminSchema.safeParse(source)
  if (parsed.success) return []

  return [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? 'unknown')))]
}
