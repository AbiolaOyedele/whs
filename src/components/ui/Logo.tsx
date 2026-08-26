/**
 * React twin of Logo.astro, for use inside the nav island.
 * Both render from the same path data in ./logo-paths.
 */
import { FULL_PATHS, FULL_VIEW_BOX, MARK_PATHS, MARK_VIEW_BOX } from './logo-paths'

interface LogoProps {
  variant?: 'mark' | 'full'
  className?: string
  /** Accessible name. Pass an empty string when a nearby label already names it. */
  label?: string
}

export function Logo({ variant = 'mark', className = '', label = 'WildHands' }: LogoProps) {
  const isMark = variant === 'mark'
  const paths = isMark ? MARK_PATHS : FULL_PATHS

  return (
    <svg
      viewBox={isMark ? MARK_VIEW_BOX : FULL_VIEW_BOX}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {paths.map((path) => (
        <path
          key={path.d.slice(0, 24)}
          fill={path.accent ? 'var(--accent)' : 'currentColor'}
          d={path.d}
        />
      ))}
    </svg>
  )
}

export default Logo
