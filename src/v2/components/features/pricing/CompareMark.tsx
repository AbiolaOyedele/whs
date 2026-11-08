interface CompareMarkProps {
  included: boolean
  className?: string
}

/** A tick for "included" or a dash for "not included", with the words for screen readers. */
export function CompareMark({ included, className = 'mt-1 size-5' }: CompareMarkProps) {
  return (
    <>
      <svg className={className} viewBox="0 0 256 256" fill="none" aria-hidden="true">
        {included ? (
          <path d="M44 140 98 194 212 76" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M44 128h168" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
        )}
      </svg>
      <span className="sr-only">{included ? 'Included' : 'Not included'}</span>
    </>
  )
}
