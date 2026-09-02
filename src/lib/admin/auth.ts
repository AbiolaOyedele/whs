/**
 * Admin authentication.
 *
 * Email + password against Supabase Auth, with the session held in two httpOnly
 * cookies. Not localStorage: an httpOnly cookie cannot be read by script, so an
 * XSS bug anywhere on the site cannot walk off with an admin session.
 *
 * Two gates, both of which must pass:
 *
 *  1. Supabase verifies the password.
 *  2. The address appears in ADMIN_ALLOWED_EMAILS.
 *
 * The second gate is the one that matters operationally. Without it, anyone who
 * ever obtains a row in the project's auth table — a stray sign-up, a shared
 * Supabase project, a teammate added for something unrelated — becomes an
 * administrator of this site. The allowlist keeps that decision in the
 * environment, where it is auditable, rather than in a database someone else
 * might be able to write to.
 */
import type { AstroCookies } from 'astro'
import { adminAllowedEmails, adminEnv, isProduction } from '@/config/env'
import { AppError } from '@/lib/errors'
import { authClient } from '@/lib/supabase'

const ACCESS_COOKIE = 'wh_admin_at'
const REFRESH_COOKIE = 'wh_admin_rt'

/** Refresh tokens are long-lived; the access token is not. */
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export interface AdminSession {
  userId: string
  email: string
}

interface CookieWriter {
  set: AstroCookies['set']
  delete: AstroCookies['delete']
}

/**
 * Cookie flags, in one place so they cannot drift between the set and the
 * clear. `sameSite: 'lax'` rather than 'strict' so returning from an external
 * link lands you still signed in; the admin has no cross-site POST surface for
 * 'lax' to expose, and every mutating route checks the origin regardless.
 */
function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge,
  } as const
}

/** True when the address is permitted to administer this site. */
export function isAllowedEmail(email: string): boolean {
  return adminAllowedEmails().includes(email.trim().toLowerCase())
}

/**
 * Exchanges credentials for a session and writes the cookies.
 *
 * Every failure path returns the same message. Distinguishing "no such account"
 * from "wrong password" from "not on the allowlist" would tell someone probing
 * the form which addresses are real.
 */
export async function signIn(
  email: string,
  password: string,
  cookies: CookieWriter
): Promise<AdminSession> {
  const rejected = new AppError(
    401,
    'That email and password do not match an account with access.',
    'ADMIN_SIGNIN_REJECTED'
  )

  if (!isAllowedEmail(email)) {
    // Still spend the time a real attempt would, so the response time does not
    // reveal that the address is unknown.
    await authClient().auth.signInWithPassword({ email, password })
    throw rejected
  }

  const { data, error } = await authClient().auth.signInWithPassword({ email, password })
  if (error || !data.session || !data.user?.email) throw rejected

  // Re-check against the token's own email rather than the submitted string.
  if (!isAllowedEmail(data.user.email)) throw rejected

  cookies.set(ACCESS_COOKIE, data.session.access_token, cookieOptions(data.session.expires_in))
  cookies.set(REFRESH_COOKIE, data.session.refresh_token, cookieOptions(REFRESH_MAX_AGE_SECONDS))

  return { userId: data.user.id, email: data.user.email }
}

/** Clears both cookies and revokes the refresh token upstream. */
export async function signOut(cookies: AstroCookies): Promise<void> {
  const refresh = cookies.get(REFRESH_COOKIE)?.value

  // Evict first: without this, signing out would leave the token usable for the
  // remainder of the cache window, which is exactly the case the cache must not
  // get wrong.
  const accessToken = cookies.get(ACCESS_COOKIE)?.value
  if (accessToken) sessionCache.delete(accessToken)

  cookies.delete(ACCESS_COOKIE, { path: '/' })
  cookies.delete(REFRESH_COOKIE, { path: '/' })

  if (!refresh) return
  try {
    // Best effort. A failure here must not stop the operator signing out.
    await authClient().auth.admin.signOut(refresh)
  } catch {
    /* the cookies are already gone, which is what the user asked for */
  }
}

/**
 * Resolves the current session, refreshing a stale access token when possible.
 * Returns null rather than throwing — callers decide whether that is a
 * redirect, a 401, or nothing at all.
 */
/**
 * Short-lived cache of verified access tokens.
 *
 * `getUser` is a network call to Supabase, and on this project a round trip
 * costs the best part of a second. Middleware runs it on EVERY admin request,
 * so without this the operator pays that latency to load a page, save a quote,
 * upload an image and fetch a PIN alike.
 *
 * Keyed by the token itself, so a different or tampered token never hits the
 * cache. Thirty seconds is short against the token's own lifetime, and the
 * exposure it buys is bounded and understood: a session revoked upstream stays
 * usable here for at most half a minute. For a single-operator admin that is a
 * good trade; it would not be on a multi-tenant surface.
 */
const SESSION_CACHE_MS = 30_000
const sessionCache = new Map<string, { session: AdminSession; at: number }>()

function cachedSession(token: string): AdminSession | null {
  const hit = sessionCache.get(token)
  if (!hit) return null

  if (Date.now() - hit.at > SESSION_CACHE_MS) {
    sessionCache.delete(token)
    return null
  }
  return hit.session
}

function rememberSession(token: string, session: AdminSession): void {
  // Bounded: one operator generates a handful of tokens, but a long-running
  // process should not accumulate them without limit.
  if (sessionCache.size > 50) sessionCache.clear()
  sessionCache.set(token, { session, at: Date.now() })
}

export async function readSession(cookies: AstroCookies): Promise<AdminSession | null> {
  const accessToken = cookies.get(ACCESS_COOKIE)?.value
  const client = authClient()

  if (accessToken) {
    const cached = cachedSession(accessToken)
    if (cached) return cached

    const { data, error } = await client.auth.getUser(accessToken)
    if (!error && data.user?.email && isAllowedEmail(data.user.email)) {
      const session = { userId: data.user.id, email: data.user.email }
      rememberSession(accessToken, session)
      return session
    }
  }

  const refreshToken = cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken) return null

  const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken })
  if (error || !data.session || !data.user?.email || !isAllowedEmail(data.user.email)) {
    cookies.delete(ACCESS_COOKIE, { path: '/' })
    cookies.delete(REFRESH_COOKIE, { path: '/' })
    return null
  }

  cookies.set(ACCESS_COOKIE, data.session.access_token, cookieOptions(data.session.expires_in))
  cookies.set(REFRESH_COOKIE, data.session.refresh_token, cookieOptions(REFRESH_MAX_AGE_SECONDS))

  return { userId: data.user.id, email: data.user.email }
}

/** Session or 401. For API routes, which have no redirect to offer. */
export async function requireSession(cookies: AstroCookies): Promise<AdminSession> {
  const session = await readSession(cookies)
  if (!session) {
    throw new AppError(401, 'Please sign in again to continue.', 'ADMIN_SESSION_REQUIRED')
  }
  return session
}

/**
 * Rejects cross-origin admin writes.
 *
 * Separate from the public form guard in lib/forms.ts because this one is
 * strict: an admin POST arriving with no Origin header at all is refused,
 * where a public form tolerates it. The admin UI is our own code and always
 * sends one, so there is no legitimate caller to break.
 */
export function assertAdminOrigin(request: Request, siteUrl: string): void {
  if (request.method === 'GET' || request.method === 'HEAD') return

  const origin = request.headers.get('origin')
  let expected: string
  try {
    expected = new URL(siteUrl).origin
  } catch {
    throw new AppError(500, 'Server configuration problem.', 'CONFIG_SITE_URL_INVALID')
  }

  if (origin !== expected) {
    throw new AppError(403, 'This request was blocked.', 'ADMIN_ORIGIN_REJECTED')
  }
}

/** Present so the module owns its own configuration read. */
export function adminIsConfigured(): boolean {
  try {
    adminEnv()
    return true
  } catch {
    return false
  }
}
