/**
 * Cloudinary storage for CV uploads.
 *
 * Before this, an applicant's CV existed in exactly one place: as an attachment
 * on a notification email. That made the mailbox the filing system — nothing
 * was addressable, nothing could be re-read once the message was archived, and
 * a 3.5MB attachment rode along on every application.
 *
 * The upload is signed and performed server-side. The browser never sees a
 * Cloudinary credential and never talks to Cloudinary, so there is no unsigned
 * preset for anyone to abuse.
 *
 * Two decisions worth keeping:
 *
 *  - `resource_type: raw`, because a CV is a PDF or a Word file, not an image.
 *  - `type: authenticated`, because a CV is personal data. Authenticated assets
 *    are not served from a guessable public URL; delivery needs a signature,
 *    which `signedCvUrl` mints with a short expiry. A public `upload` type here
 *    would put every applicant's CV one URL guess away.
 *
 * Optional by design: with no credentials set, `storeCv` returns null and the
 * caller falls back to attaching the file to the email as before. A missing
 * environment variable must not lose someone's application.
 */
import crypto from 'node:crypto'
import { serverEnv } from '@/config/env'

/** Everything under one prefix, so retention can be applied to the folder. */
const CV_FOLDER = 'wildhands/cv'

/** How long a download link in a notification email stays valid. */
const LINK_TTL_SECONDS = 60 * 60 * 24 * 30

export interface StoredCv {
  /** Cloudinary public_id, including the folder prefix. */
  publicId: string
  /** Signed delivery URL, valid for LINK_TTL_SECONDS. */
  url: string
  bytes: number
}

interface CloudinaryCredentials {
  cloudName: string
  apiKey: string
  apiSecret: string
}

/** Returns credentials, or null when storage is not configured. */
function credentials(): CloudinaryCredentials | null {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = serverEnv()
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
  }
}

/** True when CV uploads will be stored rather than only emailed. */
export function isCloudinaryConfigured(): boolean {
  return credentials() !== null
}

/**
 * Cloudinary signs the alphabetically-sorted `key=value` pairs of every
 * parameter it is sent, excluding `file`, `api_key` and `resource_type`, with
 * the API secret appended.
 */
function sign(params: Record<string, string | number>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return crypto
    .createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex')
}

/**
 * Uploads a validated CV and returns its stored location.
 *
 * @param filename Storage-safe name from validateCvUpload — never the name the
 *                 browser supplied.
 * @param content  The file bytes.
 * @returns The stored asset, or null when storage is not configured.
 * @throws Never. A storage failure must not cost someone their application, so
 *         the caller keeps the email attachment as the fallback path.
 */
export async function storeCv(filename: string, content: Buffer): Promise<StoredCv | null> {
  const creds = credentials()
  if (!creds) return null

  try {
    const timestamp = Math.floor(Date.now() / 1000)
    // `public_id` carries the extension: raw public_ids keep it, unlike images.
    const publicId = `${CV_FOLDER}/${timestamp}-${filename}`
    const params = { public_id: publicId, timestamp, type: 'authenticated' }

    const form = new FormData()
    form.append('file', new Blob([new Uint8Array(content)]), filename)
    form.append('api_key', creds.apiKey)
    form.append('public_id', publicId)
    form.append('timestamp', String(timestamp))
    form.append('type', 'authenticated')
    form.append('signature', sign(params, creds.apiSecret))

    const response = await fetch(`https://api.cloudinary.com/v1_1/${creds.cloudName}/raw/upload`, {
      method: 'POST',
      body: form,
    })
    if (!response.ok) return null

    const result = (await response.json()) as { public_id?: string; bytes?: number }
    if (typeof result.public_id !== 'string') return null

    return {
      publicId: result.public_id,
      url: signedCvUrl(result.public_id) ?? '',
      bytes: result.bytes ?? content.byteLength,
    }
  } catch {
    // Deliberately swallowed: the notification still goes out with the
    // attachment, which is what the applicant actually needs to happen.
    return null
  }
}

/**
 * Mints a time-limited download URL for a stored CV.
 *
 * This goes through Cloudinary's signed `download` endpoint rather than a
 * `res.cloudinary.com` delivery URL, because only the former honours an
 * expiry. A plain signed delivery URL for an authenticated asset works, but it
 * works forever — which is the wrong lifetime for a stranger's CV sitting in an
 * email thread.
 *
 * Verified against the live API: the signature must cover exactly
 * `expires_at`, `public_id`, `timestamp` and `type`, alphabetically sorted.
 * Including `resource_type` (which belongs in the path, not the payload) is
 * rejected with a 401.
 *
 * @returns The URL, or null when storage is not configured.
 */
export function signedCvUrl(publicId: string, ttlSeconds = LINK_TTL_SECONDS): string | null {
  const creds = credentials()
  if (!creds) return null

  const now = Math.floor(Date.now() / 1000)
  const params = {
    expires_at: now + ttlSeconds,
    public_id: publicId,
    timestamp: now,
    type: 'authenticated',
  }

  const query = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    api_key: creds.apiKey,
    signature: sign(params, creds.apiSecret),
  })

  return `https://api.cloudinary.com/v1_1/${creds.cloudName}/raw/download?${query}`
}
