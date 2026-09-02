/**
 * Slugs and PINs — how a client reaches their quote, and nobody else does.
 *
 * The threat this defends against is mundane and real: a quote URL is pasted
 * into an email, forwarded, sat in a thread for a year, and pricing is
 * commercially sensitive. So the link is readable (the client should recognise
 * their own name in it) and the PIN, not the URL, is the secret.
 *
 * PINs are stored as SHA-256 over (pepper, slug, pin):
 *
 *  - the pepper is an environment secret, so a database dump alone cannot be
 *    brute-forced offline without also stealing the deployment config;
 *  - the slug is in the digest so an identical PIN on two quotes produces two
 *    different hashes, and equal hashes never reveal equal PINs;
 *  - comparison is constant-time, so response timing leaks nothing.
 *
 * Six digits is one million combinations, which is only adequate because the
 * verification endpoint is rate limited per quote and per address. Those two
 * controls are a pair. Removing the rate limit turns this into a weekend of
 * scripted guessing.
 */
import { adminEnv } from '@/config/env'
import { AppError } from '@/lib/errors'
import { slugify as baseSlugify } from '@/lib/uploads'

const PIN_LENGTH = 6
const RESERVED_SLUGS = new Set([
  'about',
  'admin',
  'agent',
  'api',
  'careers',
  'contact',
  'enterprise',
  'freelance-hub',
  'get-in-touch',
  'industries',
  'insights',
  'legal',
  'llms',
  'new',
  'privacy',
  'quote',
  'robots',
  'services',
  'sitemap',
  'stack',
  'tools',
  'work',
])

/**
 * Lowercase, hyphenated, ASCII, capped at a length that still reads as a link.
 *
 * Delegates to the shared slugifier in lib/uploads rather than carrying a
 * second copy — two implementations of this drift, and the day they disagree is
 * the day a stored slug stops matching the one the router looks up.
 */
export function slugify(input: string): string {
  return baseSlugify(input).slice(0, 60).replace(/-+$/g, '')
}

/**
 * Builds a quote slug from the client or company name.
 *
 * Quotes live under /quote/, which is its own namespace, so a collision with a
 * marketing route is impossible by construction. The reserved list is still
 * enforced because a slug of "admin" or "api" reads as a mistake in a link sent
 * to a client, and costs nothing to refuse.
 */
export function quoteSlug(name: string): string {
  const base = slugify(name)
  if (base.length < 2) {
    throw new AppError(
      422,
      'That name is too short to build a link from. Add a couple more characters.',
      'QUOTE_SLUG_TOO_SHORT'
    )
  }
  if (RESERVED_SLUGS.has(base)) return `${base}-quote`
  return base
}

/** True when a slug is well-formed and not reserved. */
export function isValidQuoteSlug(slug: string): boolean {
  return (
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) &&
    slug.length >= 2 &&
    slug.length <= 80 &&
    !RESERVED_SLUGS.has(slug)
  )
}

/**
 * Generates a PIN with a cryptographic RNG and rejection sampling.
 *
 * `crypto.getRandomValues` over a byte range that is not a multiple of ten
 * would bias the low digits; discarding the tail removes that. It is a small
 * point, but a biased PIN is a smaller keyspace than it looks.
 */
export function generatePin(): string {
  const digits: number[] = []
  const buffer = new Uint8Array(PIN_LENGTH * 2)

  while (digits.length < PIN_LENGTH) {
    crypto.getRandomValues(buffer)
    for (const byte of buffer) {
      if (byte >= 250) continue // 250..255 would over-represent 0..5
      digits.push(byte % 10)
      if (digits.length === PIN_LENGTH) break
    }
  }

  return digits.join('')
}

/** Exactly six digits, nothing else. */
export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)
}

/** SHA-256 over (pepper, slug, pin), hex encoded. */
export async function hashPin(pin: string, slug: string): Promise<string> {
  const pepper = adminEnv().QUOTE_PIN_PEPPER
  const encoded = new TextEncoder().encode(`${pepper}:${slug}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/** Constant-time string comparison. Length is not secret; content is. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/** Verifies a submitted PIN against a stored hash. */
export async function verifyPin(pin: string, slug: string, storedHash: string): Promise<boolean> {
  if (!isValidPin(pin)) return false
  return timingSafeEqual(await hashPin(pin, slug), storedHash)
}

/* -------------------------------------------------------------------------
 * Recoverable storage
 *
 * The PIN is additionally stored encrypted so the operator can look up a code
 * they already sent, instead of reissuing one and locking the client out.
 *
 * Verification never touches this path — `verifyPin` still compares digests in
 * constant time. Decryption exists only to show a code to someone who has
 * already authenticated as an administrator.
 *
 * AES-256-GCM with a random 12-byte IV per encryption, keyed by SHA-256 of the
 * pepper. GCM is authenticated, so tampered ciphertext fails to decrypt rather
 * than yielding a wrong-but-plausible six digits.
 * ---------------------------------------------------------------------- */

/** Derives the AES key from the pepper. Cached per process. */
let cachedKey: CryptoKey | null = null

async function pinKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${adminEnv().QUOTE_PIN_PEPPER}:pin-encryption-v1`)
  )
  cachedKey = await crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
  return cachedKey
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/* Backed by an explicit ArrayBuffer: WebCrypto's BufferSource wants
   `Uint8Array<ArrayBuffer>`, and the bare `new Uint8Array(n)` form widens to
   ArrayBufferLike, which does not satisfy it under this tsconfig. */
function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Encrypts a PIN for storage. Returns `base64(iv).base64(ciphertext)`. */
export async function encryptPin(pin: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await pinKey(),
    new TextEncoder().encode(pin)
  )
  return `${toBase64(iv)}.${toBase64(new Uint8Array(ciphertext))}`
}

/**
 * Decrypts a stored PIN.
 *
 * Returns null rather than throwing on anything malformed, tampered with, or
 * encrypted under a previous pepper. The caller shows "reissue the code",
 * which is the correct and only remedy in every one of those cases.
 */
export async function decryptPin(stored: string | null): Promise<string | null> {
  if (!stored) return null

  const [ivPart, cipherPart] = stored.split('.')
  if (!ivPart || !cipherPart) return null

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(ivPart) },
      await pinKey(),
      fromBase64(cipherPart)
    )
    const pin = new TextDecoder().decode(plaintext)
    return isValidPin(pin) ? pin : null
  } catch {
    return null
  }
}

export { PIN_LENGTH }
