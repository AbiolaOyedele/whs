/**
 * Method:   POST (multipart/form-data, field name `file`)
 * Path:     /api/v1/admin/uploads
 * Auth:     admin session cookie
 * Response: 200 { url, publicId, width, height } | { error: { code, message } }
 *
 * Validation is server-side and from scratch: type by MIME, size by the decoded
 * byte length rather than the `File.size` the browser claims, and the stored
 * name is generated here — the filename the browser supplied is never used.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { AppError, toErrorResponse } from '@/lib/errors'
import { assertAdminOrigin, requireSession } from '@/lib/admin/auth'
import {
  QUOTE_IMAGE_MAX_BYTES,
  QUOTE_IMAGE_MIME_TYPES,
  isCloudinaryConfigured,
  storeQuoteImage,
} from '@/lib/cloudinary'
import { clientIp, enforceRateLimit } from '@/lib/rate-limit'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    assertAdminOrigin(request, publicEnv.PUBLIC_SITE_URL)
    await requireSession(cookies)
    enforceRateLimit(`admin-upload:${clientIp(request)}`, 30, 60_000)

    if (!isCloudinaryConfigured()) {
      throw new AppError(
        503,
        'Image storage is not connected yet. Add the Cloudinary keys to upload images.',
        'UPLOAD_STORAGE_NOT_CONFIGURED'
      )
    }

    const form = await request.formData()
    const file = form.get('file')

    if (!(file instanceof File) || file.size === 0) {
      throw new AppError(422, 'Choose an image to upload.', 'UPLOAD_IMAGE_MISSING')
    }

    if (!QUOTE_IMAGE_MIME_TYPES.includes(file.type as (typeof QUOTE_IMAGE_MIME_TYPES)[number])) {
      throw new AppError(
        422,
        'Images need to be a JPG, PNG, WebP, AVIF or GIF.',
        'UPLOAD_IMAGE_INVALID_TYPE'
      )
    }

    if (file.size > QUOTE_IMAGE_MAX_BYTES) {
      throw new AppError(422, 'That image is larger than 8MB.', 'UPLOAD_IMAGE_TOO_LARGE')
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    // Re-check the decoded length: a client can lie about File.size.
    if (buffer.byteLength > QUOTE_IMAGE_MAX_BYTES) {
      throw new AppError(422, 'That image is larger than 8MB.', 'UPLOAD_IMAGE_TOO_LARGE')
    }

    const stored = await storeQuoteImage(`quote-image`, buffer, file.type)

    return new Response(JSON.stringify(stored), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error instanceof AppError) return toErrorResponse(error)
    return toErrorResponse(
      new AppError(
        502,
        'That image could not be stored. Please try again.',
        'UPLOAD_IMAGE_FAILED',
        error
      )
    )
  }
}
