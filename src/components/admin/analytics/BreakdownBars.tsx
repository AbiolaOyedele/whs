/**
 * A ranked breakdown: top pages, referrers, countries, devices.
 *
 * Horizontal bars, because the labels are long strings (URL paths, domain
 * names) and a vertical bar chart would either truncate them or rotate them.
 *
 * One hue for every bar. Shading each bar darker-where-bigger would encode
 * length twice and burn the only free channel on information the bar already
 * carries.
 *
 * Values sit outside the bar end rather than inside it, so a short bar never
 * clips its own label.
 */
import { CHART_INK } from './chart-tokens'

interface Props {
  title: string
  rows: Array<{ label: string; value: number }>
  /** Rendered when there is nothing to show. */
  emptyMessage: string
  /** Formats the label for display, e.g. trimming a URL to its path. */
  formatLabel?: (label: string) => string
}

export function BreakdownBars({ title, rows, emptyMessage, formatLabel }: Props) {
  const max = Math.max(...rows.map((row) => row.value), 1)
  const total = rows.reduce((sum, row) => sum + row.value, 0)

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-lg">{title}</h3>

      {rows.length === 0 ? (
        <p className="text-base text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((row) => {
            const share = total > 0 ? Math.round((row.value / total) * 100) : 0
            return (
              <li key={row.label} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="min-w-0 truncate text-base" title={row.label}>
                    {formatLabel ? formatLabel(row.label) : row.label}
                  </span>
                  <span className="shrink-0 text-base tabular-nums">
                    {row.value.toLocaleString('en-GB')}
                    <span className="ml-2 text-sm text-muted-foreground">{share}%</span>
                  </span>
                </div>

                {/* Track is the muted surface, not a border: a border around a
                    mark is chrome, a track is context. */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max((row.value / max) * 100, 2)}%`,
                      backgroundColor: CHART_INK,
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
