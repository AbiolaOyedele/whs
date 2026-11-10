import type { ReactNode } from 'react'
import { FieldError } from './FieldError'
import { Icon } from '@v2/components/ui/Icon'

interface CheckboxFieldProps {
  id: string
  name: string
  children: ReactNode
  /** 'true' when ticked, '' when not: kept as text so it sits with the other values. */
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string | undefined
}

/**
 * A tick box drawn in the site's style over a real checkbox, so it keeps the
 * browser's keyboard and screen reader behaviour. The whole row is the target.
 */
export function CheckboxField({ id, name, children, value, onChange, required = false, error }: CheckboxFieldProps) {
  const errorId = `${id}-error`
  const checked = value === 'true'

  return (
    <div>
      <label htmlFor={id} className="group flex min-h-11 cursor-pointer items-start gap-3 py-2.5">
        <span className="relative mt-0.5 inline-flex size-5 shrink-0">
          <input
            id={id}
            name={name}
            type="checkbox"
            value="true"
            checked={checked}
            onChange={(event) => onChange(event.target.checked ? 'true' : '')}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="peer absolute inset-0 size-5 cursor-pointer appearance-none rounded-[4px] bg-white outline outline-charcoal transition-colors checked:bg-navy-900 checked:outline-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 aria-[invalid=true]:outline-red"
          />
          <Icon name="check" strokeWidth={3} className="pointer-events-none absolute inset-0 m-auto size-3 text-pink-500 opacity-0 transition-opacity peer-checked:opacity-100" />
        </span>
        <span className="text-body-md text-navy-900">
          {children}
          {required ? (
            <>
              {' '}
              <sup className="text-red" aria-hidden="true">
                *
              </sup>
            </>
          ) : null}
        </span>
      </label>
      {error ? <FieldError id={errorId} message={error} /> : null}
    </div>
  )
}
