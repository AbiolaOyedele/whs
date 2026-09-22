/**
 * Route guard for /admin.
 *
 * Runs only for on-demand routes — every admin page and API route sets
 * `prerender = false`, the marketing site does not, so this costs the static
 * pages nothing.
 *
 * The session is resolved once here and put on `locals`, so a page that has
 * already been let through does not re-verify the token to learn who is asking.
 *
 * This is a guard, not the only guard. Every admin API route calls
 * `requireSession` itself. Middleware ordering and route matching are the kind
 * of thing that quietly changes under a framework upgrade, and an authorisation
 * check that exists in exactly one place is one refactor away from not existing.
 */
import { defineMiddleware } from 'astro:middleware'
import { isAdminConfigured } from '@/config/env'
import { readSession } from '@/lib/admin/auth'

const SIGN_IN_PATH = '/admin/sign-in'
const UNAVAILABLE_PATH = '/admin/unavailable'

/** Paths under /admin that must stay reachable without a session. */
const PUBLIC_ADMIN_PATHS = new Set([SIGN_IN_PATH, '/admin/setup'])

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  if (!pathname.startsWith('/admin')) return next()

  // Without configuration there is nothing to sign in to. Send the operator to
  // a page that names the missing variables rather than a 500.
  if (!isAdminConfigured()) {
    if (pathname === '/admin/setup') return next()
    return context.redirect('/admin/setup')
  }

  const session = await readSession(context.cookies)
  context.locals.adminSession = session

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    // Already signed in: skip the sign-in form.
    if (session && pathname === SIGN_IN_PATH) return context.redirect('/admin')
    return next()
  }

  if (!session) {
    // Carry the intended destination so signing in lands where they were going.
    const target = `${context.url.pathname}${context.url.search}`
    const redirect = target === '/admin' ? '' : `?next=${encodeURIComponent(target)}`
    return context.redirect(`${SIGN_IN_PATH}${redirect}`)
  }

  if (pathname === UNAVAILABLE_PATH) return next()

  /*
   * Admin pages load their data in frontmatter, outside any try/catch. A single
   * failed query (a dropped connection, a migration not yet run) used to escape
   * as an uncaught AppError and reach the browser as Vercel's bare HTTP 500.
   * Catching it once here covers every admin page, present and future, and
   * keeps the operator inside the admin shell with a way to retry.
   */
  try {
    return await next()
  } catch (cause) {
    console.error(`[admin-render] ${pathname}`, cause)
    const response = await context.rewrite(UNAVAILABLE_PATH)
    return new Response(response.body, { status: 503, headers: response.headers })
  }
})
