'use client'

import { useState, type ChangeEvent } from 'react'
import { CV_ACCEPT_ATTRIBUTE, CV_MAX_BYTES, CV_MIME_TYPES } from '@/lib/schemas/form-constants'
import { FieldError } from './FieldError'

/** What the form keeps for the CV: whether one is attached and whether it passes. */
export type CvState = '' | 'ok' | 'too-large' | 'bad-type'

interface FileFieldProps {
  id: string
  /** The multipart field name the server reads the file from. */
  name: string
  label: string
  hint: string
  required?: boolean
  onChange: (state: CvState) => void
  error?: string | undefined
}

function cvState(file: File | undefined): CvState {
  if (!file || file.size === 0) return ''
  if (file.size > CV_MAX_BYTES) return 'too-large'
  const typeOk = (CV_MIME_TYPES as readonly string[]).includes(file.type)
  const extensionOk = /\.(pdf|docx?)$/i.test(file.name)
  return typeOk || extensionOk ? 'ok' : 'bad-type'
}

function sizeLabel(bytes: number): string {
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1000))}KB`
}

/**
 * A CV upload in the site's input style: the real file input sits under a
 * drawn button, so it still opens the system picker from a tap, a click or the
 * keyboard. The file itself is read from the form when it is sent; this field
 * only reports whether it will pass the server's checks (type and 3.5MB).
 */
export function FileField({ id, name, label, hint, required = false, onChange, error }: FileFieldProps) {
  const [file, setFile] = useState<File | null>(null)
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0]
    setFile(chosen ?? null)
    onChange(cvState(chosen))
  }

  return (
    <div>
      <p id={`${id}-label`} className="input-label">
        {label}
        {required ? (
          <>
            {' '}
            <sup className="text-red" aria-hidden="true">
              *
            </sup>
          </>
        ) : null}
      </p>
      <p id={hintId} className="text-body-sm -mt-1 mb-2 text-navy-900">
        {hint}
      </p>
      <label
        htmlFor={id}
        data-invalid={error ? '' : undefined}
        className="relative flex min-h-[55px] cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 rounded-sm bg-white px-4 py-2.5 outline-1 outline-transparent transition-[outline-color] focus-within:outline-navy-900 data-invalid:outline-red"
      >
        <input
          id={id}
          name={name}
          type="file"
          accept={CV_ACCEPT_ATTRIBUTE}
          onChange={onInput}
          aria-labelledby={`${id}-label`}
          aria-describedby={[hintId, error ? errorId : null].filter(Boolean).join(' ')}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
        <span
          aria-hidden="true"
          className="text-label inline-flex min-h-9 items-center rounded-sm bg-white px-3.5 leading-none text-navy-900"
        >
          {file ? 'Change file' : 'Choose file'}
        </span>
        <span className="text-body-sm min-w-0 break-all text-navy-900" aria-live="polite">
          {file ? `${file.name} (${sizeLabel(file.size)})` : 'No file chosen'}
        </span>
      </label>
      {error ? <FieldError id={errorId} message={error} /> : null}
    </div>
  )
}
