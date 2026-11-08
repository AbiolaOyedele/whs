import { Icon } from '@v2/components/ui/Icon'

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
      <Icon name="circleAlert" strokeWidth={1.6} className="mt-px size-4 shrink-0 text-red" />
      <span>{message}</span>
    </p>
  )
}
