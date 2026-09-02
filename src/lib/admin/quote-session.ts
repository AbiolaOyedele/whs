/**
 * Client-side access to a quote, after the PIN is right.
 *
 * A correct PIN mints a short-lived signed token in a cookie so the client can
 * read, re-read and refresh their quote without retyping the code. The token is
 * bound to one slug and carries an expiry, both inside the signature — so it
 * cannot be edited into access to a different client's quote, and it stops
 * working on its own.
 *
 * HMAC over the same pepper that hashes the PINs, which means rotating that one
 * environment variable invalidates every PIN and every live session at once.
 */
import type { AstroCookies } from 'astro'
import { adminEnv, isProduction } from '@/config/env'

const COOKIE = 'wh_quote_access'
const TTL_SECONDS = 60 * 60 * 12

function base64url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(adminEnv().QUOTE_PIN_PEPPER),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return base64url(new Uint8Array(signature))
}

/** Constant-time comparison. See quote-access.ts for why this is not `===`. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Writes an access cookie for one quote. */
export async function grantQuoteAccess(slug: string, cookies: AstroCookies): Promise<void> {
  const expires = Date.now() + TTL_SECONDS * 1000
  const payload = `${slug}.${expires}`
  const token = `${payload}.${await sign(payload)}`

  /*
   * Path is '/', not '/quote'.
   *
   * The document lives at /quote/<slug>, but the endpoints that serve it —
   * the invoice PDF and the payment initialiser — are under /api/v1/quote/...,
   * which is NOT beneath /quote. Cookie paths are prefix matches with no way
   * to list two, so a '/quote' cookie was simply never sent to those routes and
   * both answered QUOTE_ACCESS_EXPIRED to a client who had just unlocked the
   * page.
   *
   * Widening the path costs nothing that matters: the token is httpOnly, HMAC
   * signed, bound to one slug and expires on its own, so being sent on more
   * requests does not widen what it grants.
   */
  cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_SECONDS,
  })
}

/** True when the caller holds a valid, unexpired token for this slug. */
export async function hasQuoteAccess(slug: string, cookies: AstroCookies): Promise<boolean> {
  const token = cookies.get(COOKIE)?.value
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [tokenSlug, expiresRaw, signature] = parts as [string, string, string]
  if (tokenSlug !== slug) return false

  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || expires < Date.now()) return false

  // Verify the signature last: an expired or mismatched token is rejected
  // without spending a HMAC, and neither branch reveals anything a caller
  // could not already determine from their own cookie.
  return timingSafeEqual(await sign(`${tokenSlug}.${expiresRaw}`), signature)
}

/**
 * Salted digest of a client IP, for the view log.
 *
 * Enough to tell two viewers apart within a quote; not enough to identify
 * anyone, and not reversible without the pepper. A quote view log does not need
 * an IP address, so it does not get one.
 */
export async function hashIp(ip: string): Promise<string> {
  const encoded = new TextEncoder().encode(`${adminEnv().QUOTE_PIN_PEPPER}:ip:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}
