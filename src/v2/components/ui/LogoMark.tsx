import { MARK_PATHS, MARK_VIEW_BOX } from '@/components/ui/logo-paths'

/**
 * The WildHands "whs." mark, drawn from the same path data as the main
 * site's Logo component. Letters take the current text colour; the accent
 * paths stay lime.
 */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEW_BOX}
      className={`c-logo-mark c-logo-mark--whs ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {MARK_PATHS.map((path) => (
        <path key={path.d.slice(0, 24)} fill={path.accent ? 'var(--color-pink-500)' : 'currentColor'} d={path.d} />
      ))}
    </svg>
  )
}
