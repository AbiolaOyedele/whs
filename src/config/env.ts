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
      '   Falling back to http://localhost:4321 — do not ship this build.'
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
