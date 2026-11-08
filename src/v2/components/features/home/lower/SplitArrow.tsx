interface SplitArrowProps {
  direction?: 'left' | 'right'
  className?: string
}

/**
 * The arrow used on cards, tiles and list links: a head and shaft with a
 * short detached tail. Colour follows the text.
 */
export function SplitArrow({ direction = 'right', className = 'size-6' }: SplitArrowProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`${direction === 'left' ? '-scale-x-100' : ''} ${className}`}
    >
      <path d="M14.2 18.4l6.5-6.4-6.5-6.4" />
      <path d="M20.6 12H9.3" />
      <path d="M3.4 12h2.7" />
    </svg>
  )
}
