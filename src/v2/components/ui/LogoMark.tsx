/** The logo mark: three rows of bars, the middle row split; the split slides on hover. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <span className={`c-logo-mark ${className}`} aria-hidden="true">
      <span className="c-logo-mark_line">
        <span className="c-logo-mark_bar" />
      </span>
      <span className="c-logo-mark_line">
        <span className="c-logo-mark_bar" />
        <span className="c-logo-mark_bar" />
      </span>
      <span className="c-logo-mark_line">
        <span className="c-logo-mark_bar" />
      </span>
    </span>
  )
}
