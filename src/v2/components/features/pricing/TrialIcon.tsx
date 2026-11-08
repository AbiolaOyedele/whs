import { Icon } from '@v2/components/ui/Icon'

/** A small timer for the tab on the featured plan's card. */
export function TrialIcon({ className = '-my-1 size-5' }: { className?: string }) {
  return <Icon name="timer" strokeWidth={1.4} className={className} />
}
