import { HONEYPOT_FIELD } from '@/lib/schemas/form-constants'

interface HoneypotProps {
  /** Prefix for the id, so two forms on one page never share one. */
  idPrefix: string
}

/**
 * The anti-spam field. Hidden from people and from assistive tech; bots fill
 * it in, and the server turns away any submission where it has a value.
 */
export function Honeypot({ idPrefix }: HoneypotProps) {
  const id = `${idPrefix}-${HONEYPOT_FIELD}`
  return (
    <div className="sr-only" aria-hidden="true">
      <label htmlFor={id}>Company fax</label>
      <input id={id} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  )
}

/** Reads the honeypot's value from a submitted form, for forms that post JSON built from state. */
export function honeypotValue(form: HTMLFormElement): string {
  const field = form.elements.namedItem(HONEYPOT_FIELD)
  return field instanceof HTMLInputElement ? field.value : ''
}

export { HONEYPOT_FIELD }
