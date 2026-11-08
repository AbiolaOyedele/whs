/** A small clock face, drawn for the trial tab on the Growth card. */
export function TrialIcon({ className = '-my-4 -mr-4 size-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 41 41" fill="none" aria-hidden="true">
      <circle cx="20.5" cy="21" r="10" stroke="currentColor" strokeWidth="1.2" />
      <path d="M20.5 15v6l4 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 8.5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
