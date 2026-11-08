import { Icon } from '@v2/components/ui/Icon'

/** A solid play triangle for the phone "play the intro" button. */
export function PlayIcon({ className = 'size-[26px] max-w-none shrink-0' }: { className?: string }) {
  return <Icon name="play" fill="currentColor" strokeWidth={1} className={className} />
}
