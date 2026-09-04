/**
 * Inline SVG icons for React islands. The Astro twin is `Icon.astro`, and both
 * draw from `icon-paths.ts` so the two can never disagree about a shape.
 */
import { ICONS, type IconName } from './icon-paths'

interface Props {
  name: IconName
  className?: string
  /** Only when the icon is the sole carrier of meaning. */
  label?: string
  strokeWidth?: number
}

export function Icon({ name, className = 'size-4', label, strokeWidth = 1.8 }: Props) {
  const icon = ICONS[name]
  return (
    <svg
      viewBox={icon.box}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {icon.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
