/**
 * Flow button — React version, for use inside islands.
 *
 * The whole effect is CSS `group-hover`, so the static twin
 * (`FlowButton.astro`) renders identically with zero JavaScript. Prefer that
 * one anywhere outside an island.
 *
 * Adapted from the supplied component in two ways:
 *  1. Colours come from theme tokens instead of hardcoded `#111111`, so the
 *     button works on light and dark surfaces and follows the brand accent.
 *  2. It renders an <a> when `href` is set, so it is a real link — the original
 *     was always a <button>, which is wrong for navigation and breaks
 *     middle-click, open-in-new-tab, and the browser's own link affordances.
 */
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type FlowVariant = 'outline' | 'accent' | 'primary'

interface FlowButtonProps {
  text: string
  href?: string
  variant?: FlowVariant
  /** Inverts the outline treatment for use on dark surfaces. */
  onDark?: boolean
  className?: string
  type?: 'button' | 'submit'
}

/** Resting surface, and the colour the expanding circle fills with. */
const VARIANTS: Record<FlowVariant, { base: string; circle: string; hoverText: string }> = {
  outline: {
    base: 'border-[1.5px] border-current/40 bg-transparent',
    circle: 'bg-foreground',
    hoverText: 'hover:text-background',
  },
  accent: {
    base: 'border-[1.5px] border-transparent bg-accent text-accent-foreground',
    circle: 'bg-foreground',
    hoverText: 'hover:text-background',
  },
  primary: {
    base: 'border-[1.5px] border-transparent bg-primary text-primary-foreground',
    circle: 'bg-accent',
    hoverText: 'hover:text-accent-foreground',
  },
}

export function FlowButton({
  text,
  href,
  variant = 'outline',
  onDark = false,
  className = '',
  type = 'button',
}: FlowButtonProps) {
  const tone = VARIANTS[variant]

  const classes = cn(
    'group relative inline-flex items-center justify-center gap-1 overflow-hidden',
    'rounded-[100px] px-8 py-3 text-base font-medium',
    'min-h-12 cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
    'hover:rounded-[12px] hover:border-transparent active:scale-[0.97]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    tone.base,
    tone.hoverText,
    variant === 'outline' && onDark && 'text-white',
    className
  )

  const inner = (
    <>
      {/* Arrow that slides in from the left on hover. */}
      <ArrowRight
        aria-hidden="true"
        className="absolute left-[-25%] z-[9] h-4 w-4 fill-none stroke-current transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4"
      />

      <span className="relative z-[1] -translate-x-3 transition-all duration-[800ms] ease-out group-hover:translate-x-3">
        {text}
      </span>

      {/* Circle that expands from the centre to flood the button. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0',
          'transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]',
          'group-hover:h-[220px] group-hover:w-[220px] group-hover:opacity-100',
          tone.circle
        )}
      />

      {/* Arrow that slides out to the right on hover. */}
      <ArrowRight
        aria-hidden="true"
        className="absolute right-4 z-[9] h-4 w-4 fill-none stroke-current transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%]"
      />
    </>
  )

  return href ? (
    <a href={href} className={classes}>
      {inner}
    </a>
  ) : (
    <button type={type} className={classes}>
      {inner}
    </button>
  )
}

export default FlowButton
