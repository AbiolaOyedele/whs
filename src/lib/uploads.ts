/**
 * Server-side upload validation. The client-side size check is UX only —
 * everything here re-validates from scratch against the real File object.
 */
import { AppError } from './errors'
import { CV_MAX_BYTES, CV_MIME_TYPES } from './schemas/forms'

const EXTENSION_BY_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

export interface ValidatedUpload {
  /** Storage-safe name. The client's original filename is never trusted. */
  filename: string
  content: Buffer
}

/**
 * Validates a CV upload by MIME type and size, then renames it deterministically.
 * @param file The File pulled from multipart FormData.
 * @param ownerSlug Slugified applicant name, used to build the safe filename.
 */
export async function validateCvUpload(file: unknown, ownerSlug: string): Promise<ValidatedUpload> {
  if (!(file instanceof File) || file.size === 0) {
    throw new AppError(422, 'Please attach your CV.', 'UPLOAD_CV_MISSING')
  }

  if (file.size > CV_MAX_BYTES) {
    throw new AppError(
      422,
      'Your CV is larger than 3.5MB. Please upload a smaller file.',
      'UPLOAD_CV_TOO_LARGE'
    )
  }

  if (!CV_MIME_TYPES.includes(file.type as (typeof CV_MIME_TYPES)[number])) {
    throw new AppError(
      422,
      'Please upload your CV as a PDF, DOC, or DOCX file.',
      'UPLOAD_CV_INVALID_TYPE'
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Re-check the decoded length: a client can lie about File.size.
  if (buffer.byteLength > CV_MAX_BYTES) {
    throw new AppError(
      422,
      'Your CV is larger than 3.5MB. Please upload a smaller file.',
      'UPLOAD_CV_TOO_LARGE'
    )
  }

  const extension = EXTENSION_BY_MIME[file.type] ?? 'bin'
  const safeOwner = ownerSlug.replace(/[^a-z0-9-]/gi, '').slice(0, 60) || 'applicant'

  return { filename: `cv-${safeOwner}.${extension}`, content: buffer }
}

/** Lowercases and hyphenates a string for use in filenames and slugs. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
