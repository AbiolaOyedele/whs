/**
 * Method:   POST
 * Path:     /api/v1/track
 * Auth:     none — this is the public site's own beacon
 * Response: 204, always and quickly
 *
 * Records one page view.
 *
 * Cookie-free and identifier-free. `visitor_hash` is a digest of
 * (date, address, user agent, secret): enough to count one person once per day,
 * impossible to link across days because the date is inside the digest, and not
 * reversible without the pepper. That is the whole privacy story, and it is why
 * this needs no cookie banner of its own.
 *
 * Always 204, never an error body. A visitor's page must not be affected in any
 * way by our analytics failing, and an attacker learns nothing from the shape
 * of the response.
 */
import type { APIRoute } from 'astro'
import { z } from 'zod'
import { isAdminConfigured, publicEnv } from '@/config/env'
import { serviceClient } from '@/lib/supabase'
import { hashIp } from '@/lib/admin/quote-session'
import { assertSameOrigin } from '@/lib/forms'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

const beaconSchema = z.object({
  path: z.string().max(512),
  referrer: z.string().max(2048).default(''),
})

const NO_CONTENT = new Response(null, { status: 204 })

/** Coarse device class from the user agent. Three buckets, no fingerprinting. */
function deviceOf(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Tablet/i.test(userAgent)) return 'tablet'
  if (/Mobi|Android|iPhone/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

/** Host only. A full referrer URL can carry a search query or a session id. */
function referrerHost(referrer: string, ownOrigin: string): string | null {
  if (!referrer) return null
  try {
    const url = new URL(referrer)
    if (url.origin === ownOrigin) return null // internal navigation is not a source
    return url.hostname.replace(/^www\./, '').slice(0, 253)
  } catch {
    return null
  }
}

export const POST: APIRoute = async ({ request, url }) => {
  try {
    if (!isAdminConfigured()) return NO_CONTENT

    assertSameOrigin(request, publicEnv.PUBLIC_SITE_URL)
    // Generous: a real person browsing quickly should never be dropped, but one
    // script hammering this should not be able to write unbounded rows.
    enforceRateLimit(`track:${clientIp(request)}`, 60, 60_000)

    const parsed = beaconSchema.safeParse(await request.json())
    if (!parsed.success) return NO_CONTENT

    const userAgent = request.headers.get('user-agent') ?? ''

    // Obvious bots do not need counting, and counting them makes every other
    // number a lie.
    if (/bot|crawl|spider|preview|monitor|curl|wget|headless/i.test(userAgent)) {
      return NO_CONTENT
    }

    const path = parsed.data.path.split('?')[0]?.slice(0, 512) ?? '/'
    const search = new URL(parsed.data.path, url.origin).searchParams

    /* The date is inside the digest, so the same person is one visitor today
       and an unrelated one tomorrow. That is intentional: it supports "how many
       people came today" and refuses to support "follow this person". */
    const today = new Date().toISOString().slice(0, 10)
    const visitorHash = (await hashIp(`${today}:${clientIp(request)}:${userAgent}`)).slice(0, 32)

    const { error } = await serviceClient()
      .from('page_views')
      .insert({
        path,
        referrer_host: referrerHost(parsed.data.referrer, url.origin),
        utm_source: search.get('utm_source')?.slice(0, 120) ?? null,
        utm_medium: search.get('utm_medium')?.slice(0, 120) ?? null,
        utm_campaign: search.get('utm_campaign')?.slice(0, 120) ?? null,
        country: request.headers.get('x-vercel-ip-country')?.slice(0, 2) ?? null,
        device: deviceOf(userAgent),
        visitor_hash: visitorHash,
      })

    if (error) console.error('[track]', error)
    return NO_CONTENT
  } catch {
    // Deliberately silent. Analytics must never surface to a visitor.
    return NO_CONTENT
  }
}
