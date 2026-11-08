import { Icon } from '@v2/components/ui/Icon'

/** The small tick before each line of a plan card. */
export function TickIcon({ className = 'mt-1 size-3.5' }: { className?: string }) {
  return <Icon name="check" strokeWidth={2.4} className={className} />
}
