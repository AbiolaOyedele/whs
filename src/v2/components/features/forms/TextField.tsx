import type { HTMLInputAutoCompleteAttribute } from 'react'
import { FieldError } from './FieldError'

interface TextFieldProps {
  id: string
  name: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'tel'
  autoComplete?: HTMLInputAutoCompleteAttribute
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
  error,
}: TextFieldProps) {
  const errorId = `${id}-error`
  const shared = {
    id,
    name,
    placeholder,
    value,
    ...(maxLength ? { maxLength } : {}),
    ...(autoComplete ? { autoComplete } : {}),
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
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
          {...(type === 'tel' ? { inputMode: 'tel' as const } : {})}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? <FieldError id={errorId} message={error} /> : null}
    </div>
  )
}
