/**
 * A headline number.
 *
 * Deliberately not a chart: a single value is a stat tile, and drawing one bar
 * for it would be decoration. The figure is set in the body face, not the
 * display face — a display or serif hero number reads as brand decoration
 * rather than data.
 */
interface Props {
  label: string
  value: string
  /** Percentage change. Positive is not automatically good, so it is not green. */
  change?: number | null
  changeNote?: string
  hint?: string
}

export function StatTile({ label, value, change, changeNote, hint }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-sans text-4xl leading-none tabular-nums">{value}</p>

      {change !== null && change !== undefined && (
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="text-foreground tabular-nums">
            {change > 0 ? '+' : ''}
            {change}%
          </span>
          {changeNote && <span> {changeNote}</span>}
        </p>
      )}

      {hint && <p className="mt-3 text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}
