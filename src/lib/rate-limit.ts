/**
 * In-memory, per-IP fixed-window rate limiter for the public form endpoints.
 *
 * DELIBERATE TRADE-OFF, flagged in docs/PROGRESS.md § F-9: this is per-instance
 * memory, so it does not coordinate across Vercel function instances. For a
 * low-traffic marketing site with four unauthenticated form endpoints it raises
 * the cost of casual abuse without adding a Redis dependency the brief's stack
 * does not include. If abuse becomes real, move to Vercel Firewall rate limiting
 * or a durable store — do not scale this file up.
 */
import { AppError } from './errors'

interface Window {
  count: number
  resetAt: number
}

const buckets = new Map<string, Window>()

/** Drops expired windows so the map cannot grow without bound. */
function sweep(now: number): void {
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key)
  }
}

/**
 * Resolves the client IP from Vercel's proxy headers.
 * Falls back to a shared bucket when no header is present.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() ?? 'unknown'
}

/**
 * Consumes one token for `key`. Throws a 429 AppError once the limit is hit.
 * @param key Bucket identity — normally `${routeName}:${clientIp(request)}`.
 * @param limit Requests permitted per window.
 * @param windowMs Window length in milliseconds.
 */
export function enforceRateLimit(key: string, limit = 5, windowMs = 60_000): void {
  const now = Date.now()
  if (buckets.size > 5_000) sweep(now)

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  existing.count += 1
  if (existing.count > limit) {
    throw new AppError(
      429,
      'That is a lot of submissions in a short space of time. Please wait a minute and try again.',
      'FORM_SUBMIT_RATE_LIMITED'
    )
  }
}
