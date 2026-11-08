import type { HTMLInputAutoCompleteAttribute } from 'react'
import { FieldError } from './FieldError'

interface TextFieldProps {
  id: string
  name: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'url'
  autoComplete?: HTMLInputAutoCompleteAttribute
  /** A line under the label that explains what to put in. */
  hint?: string
  required?: boolean
  multiline?: boolean
  maxLength?: number
  error?: string | undefined
}

/** A labelled text box (or text area) in the reference's input style, with its error line. */
export function TextField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  autoComplete,
  required = false,
  multiline = false,
  maxLength,
  hint,
  error,
}: TextFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')
  const shared = {
    id,
    name,
    placeholder,
    value,
    ...(maxLength ? { maxLength } : {}),
    ...(autoComplete ? { autoComplete } : {}),
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  }

  return (
    <div>
      <label htmlFor={id} className="input-label">
        {label}
        {required ? (
          <>
            {' '}
            <sup className="text-red" aria-hidden="true">
              *
            </sup>
          </>
        ) : null}
      </label>
      {hint ? (
        <p id={hintId} className="text-body-sm -mt-1 mb-2 text-navy-500">
          {hint}
        </p>
      ) : null}
      {multiline ? (
        <textarea
          {...shared}
          rows={4}
          className="input-base min-h-[120px] resize-y py-3"
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          {...shared}
          type={type}
          className="input-base"
          {...(type === 'tel' ? { inputMode: 'tel' as const } : type === 'url' ? { inputMode: 'url' as const } : {})}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? <FieldError id={errorId} message={error} /> : null}
    </div>
  )
}
