/**
 * A solid play triangle for the phone "play the intro" button. Drawn at 26px
 * (the reference's icon size) and left to overflow its small centred wrapper,
 * as the reference does.
 */
export function PlayIcon({ className = 'size-[26px] max-w-none shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden="true">
      <path
        d="M70 42.5c0-10 10.9-16.2 19.5-11l136 85.5c8 5 8 16.9 0 21.9l-136 85.5c-8.6 5.4-19.5-.8-19.5-11z"
        fill="currentColor"
      />
    </svg>
  )
}
