/**
 * Environment variable validation.
 *
 * This is the ONLY module in the codebase permitted to read from
 * `import.meta.env` / `process.env`. Every other file imports from here.
 *
 * Two exports, deliberately split:
 *  - `publicEnv` — PUBLIC_* variables only. Safe to import from client islands.
 *  - `serverEnv` — includes secrets. Server-only; throws if imported in a browser bundle.
 *
 * @see docs/PROGRESS.md for the note on Astro's built-in `astro:env` alternative.
 */
import { z } from 'zod'

/** Merged env source. `process.env` covers Node/build-time, `import.meta.env` covers Vite/Astro. */
const source: Record<string, unknown> = {
  ...(typeof process !== 'undefined' && process.env ? process.env : {}),
  ...(import.meta.env as Record<string, unknown>),
}

const publicSchema = z.object({
  PUBLIC_SITE_URL: z.url(),
  PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  PUBLIC_POSTHOG_HOST: z.url().optional(),
})

const serverSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  CONTACT_NOTIFICATION_EMAIL: z.email(),
})

/** Formats a Zod error into a readable multi-line message for startup failures. */
function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
}

const publicParsed = publicSchema.safeParse(source)
if (!publicParsed.success) {
  const message = `Invalid public environment variables:\n${formatIssues(publicParsed.error)}`
  console.error(`❌ ${message}`)
  throw new Error('Environment validation failed. App cannot start.')
}

/** Validated PUBLIC_* environment variables. Safe to use in client islands. */
export const publicEnv = publicParsed.data

/** True when this module is evaluating inside a browser bundle. */
const isBrowser = typeof window !== 'undefined'

type ServerEnv = z.infer<typeof serverSchema>

let serverEnvValue: ServerEnv | null = null

if (!isBrowser) {
  const serverParsed = serverSchema.safeParse(source)
  if (!serverParsed.success) {
    const message = `Invalid server environment variables:\n${formatIssues(serverParsed.error)}`
    console.error(`❌ ${message}`)
    throw new Error('Environment validation failed. App cannot start.')
  }
  serverEnvValue = serverParsed.data
}

/**
 * Validated server-side environment variables, including secrets.
 * Never import this from a client island — it throws in the browser by design.
 */
export function serverEnv(): ServerEnv {
  if (serverEnvValue === null) {
    throw new Error('serverEnv() is server-only and must not be called from client code.')
  }
  return serverEnvValue
}
