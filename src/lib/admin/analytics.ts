/**
 * Reading analytics.
 *
 * Reads OUR OWN `page_views` table, not Vercel's API.
 *
 * The first version of this queried Vercel's Web Analytics read endpoint, which
 * is not part of their documented, versioned REST surface — it is what their
 * dashboard calls. It returned nothing usable, which was the risk flagged when
 * it was written. Their tracker still runs and their dashboard still works;
 * this panel simply no longer depends on an endpoint nobody promised us.
 *
 * Aggregation happens in Postgres (see migration 0005). Pulling a year of rows
 * across the network to count them in JavaScript would be slow and pointless.
 */
import { serviceClient } from '@/lib/supabase'
import { isAdminConfigured } from '@/config/env'

export type AnalyticsRange = '24h' | '7d' | '30d' | '90d'

export const RANGE_LABELS: Record<AnalyticsRange, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

export interface AnalyticsPoint {
  date: string
  visitors: number
  views: number
}

export interface AnalyticsBreakdown {
  label: string
  value: number
}

export interface AnalyticsData {
  range: AnalyticsRange
  visitors: number
  views: number
  /** Percentage change against the first half of the same window. */
  visitorsChange: number | null
  series: AnalyticsPoint[]
  pages: AnalyticsBreakdown[]
  referrers: AnalyticsBreakdown[]
  countries: AnalyticsBreakdown[]
  devices: AnalyticsBreakdown[]
}

export type AnalyticsResult =
  | { ok: true; data: AnalyticsData }
  | {
      ok: false
      reason: 'not-configured' | 'no-data' | 'unavailable'
      detail?: string | undefined
    }

function since(range: AnalyticsRange): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - RANGE_DAYS[range])
  return date.toISOString()
}

interface SeriesRow {
  day: string
  visitors: number | string
  views: number | string
}

interface BreakdownRow {
  label: string
  value: number | string
}

const toNumber = (value: number | string): number =>
  typeof value === 'string' ? Number(value) : value

/** One breakdown. Returns an empty list rather than failing the whole page. */
async function breakdown(
  from: string,
  dimension: 'path' | 'referrer_host' | 'country' | 'device',
  limit = 8
): Promise<AnalyticsBreakdown[]> {
  try {
    const { data, error } = await serviceClient().rpc('analytics_breakdown', {
      since: from,
      dimension,
      max_rows: limit,
    })
    if (error) throw error

    return (data as BreakdownRow[]).map((row) => ({
      label: row.label,
      value: toNumber(row.value),
    }))
  } catch (cause) {
    // A missing referrer list is not a reason to hide the visitor count.
    console.warn(`[analytics] ${dimension} breakdown unavailable`, cause)
    return []
  }
}

export async function fetchAnalytics(range: AnalyticsRange): Promise<AnalyticsResult> {
  if (!isAdminConfigured()) return { ok: false, reason: 'not-configured' }

  const from = since(range)

  try {
    const { data, error } = await serviceClient().rpc('analytics_timeseries', { since: from })
    if (error) throw error

    const rows = (data as SeriesRow[]) ?? []

    if (rows.length === 0) {
      return { ok: false, reason: 'no-data' }
    }

    const series: AnalyticsPoint[] = rows.map((row) => ({
      date: row.day,
      visitors: toNumber(row.visitors),
      views: toNumber(row.views),
    }))

    const visitors = series.reduce((sum, point) => sum + point.visitors, 0)
    const views = series.reduce((sum, point) => sum + point.views, 0)

    /* Against the first half of the same window, not a true preceding period —
       and labelled that way in the UI rather than dressed up as one. */
    const half = Math.floor(series.length / 2)
    const older = series.slice(0, half).reduce((sum, point) => sum + point.visitors, 0)
    const newer = series.slice(half).reduce((sum, point) => sum + point.visitors, 0)
    const visitorsChange = older > 0 ? Math.round(((newer - older) / older) * 100) : null

    const [pages, referrers, countries, devices] = await Promise.all([
      breakdown(from, 'path'),
      breakdown(from, 'referrer_host'),
      breakdown(from, 'country'),
      breakdown(from, 'device', 4),
    ])

    return {
      ok: true,
      data: {
        range,
        visitors,
        views,
        visitorsChange,
        series,
        pages,
        referrers,
        countries,
        devices,
      },
    }
  } catch (cause) {
    return {
      ok: false,
      reason: 'unavailable',
      detail: cause instanceof Error ? cause.message : undefined,
    }
  }
}
