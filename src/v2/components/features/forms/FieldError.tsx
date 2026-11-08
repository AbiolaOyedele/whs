interface FieldErrorProps {
  id: string
  message: string
}

/**
 * The line under a field that failed its check. The text stays navy so it
 * reads at small sizes; the red mark and the field's red outline flag it.
 */
export function FieldError({ id, message }: FieldErrorProps) {
  return (
    <p id={id} className="anim-fade-slide-in mt-2 flex items-start gap-2 text-body-sm text-navy-900">
      <svg className="mt-px size-4 shrink-0 text-red" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.5v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
      </svg>
      <span>{message}</span>
    </p>
  )
}
