/**
 * The analytics dashboard.
 *
 * Filters in one row above the charts. Changing the range navigates rather than
 * fetching: the data is resolved server-side, so a range is a URL, which means
 * it can be bookmarked and the back button behaves.
 */
import { StatTile } from './StatTile'
import { TimeSeriesChart } from './TimeSeriesChart'
import { BreakdownBars } from './BreakdownBars'
import { cn } from '@/lib/utils'
import { RANGE_LABELS, type AnalyticsData, type AnalyticsRange } from '@/lib/admin/analytics'

interface Props {
  data: AnalyticsData
}

const RANGES: AnalyticsRange[] = ['24h', '7d', '30d', '90d']

/** Strips the origin from a referrer so the list reads as sources, not URLs. */
function hostOnly(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value === '' ? 'Direct' : value
  }
}

export function AnalyticsDashboard({ data }: Props) {
  const perVisitor = data.visitors > 0 ? (data.views / data.visitors).toFixed(1) : '0.0'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-1">
        {RANGES.map((range) => (
          <a
            key={range}
            href={`/admin/analytics?range=${range}`}
            aria-current={data.range === range ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-11 items-center rounded-full px-4 text-base transition-colors',
              data.range === range
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {RANGE_LABELS[range]}
          </a>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Visitors"
          value={data.visitors.toLocaleString('en-GB')}
          change={data.visitorsChange}
          changeNote="against the first half of this period"
        />
        <StatTile label="Page views" value={data.views.toLocaleString('en-GB')} />
        <StatTile
          label="Pages per visitor"
          value={perVisitor}
          hint="Higher means people are reading on rather than bouncing."
        />
      </div>

      <TimeSeriesChart series={data.series} label="Visitors over time" />

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownBars
          title="Most-read pages"
          rows={data.pages}
          emptyMessage="No page data for this period yet."
        />
        <BreakdownBars
          title="Where they came from"
          rows={data.referrers}
          formatLabel={hostOnly}
          emptyMessage="No referrer data for this period yet."
        />
        <BreakdownBars
          title="Countries"
          rows={data.countries}
          emptyMessage="No country data for this period yet."
        />
        <BreakdownBars
          title="Devices"
          rows={data.devices}
          emptyMessage="No device data for this period yet."
        />
      </div>
    </div>
  )
}
