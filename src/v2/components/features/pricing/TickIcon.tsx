/** The small tick before each line of a plan card. */
export function TickIcon({ className = 'mt-1 size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 15 11" fill="none" aria-hidden="true">
      <path d="M1 5.4 4.9 9.2 13.8.9" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
