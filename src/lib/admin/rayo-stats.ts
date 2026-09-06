/**
 * Rayo usage numbers, for the WildHands admin.
 *
 * Rayo is a separate product hosted on the same Supabase project, in its own
 * `rayo` schema. This module reads that schema through a second service
 * client, pinned to `rayo`, so the wildhands client never has a route into
 * another application's tables.
 *
 * NOTHING personal, ever. The whole point of the panel is to know how the
 * product is doing without reading anyone's private work. The queries return
 * counts and buckets — never a client name, never a project title, never an
 * amount owed by a specific account.
 *
 * Aggregation is done in JavaScript (small totals, a handful of hundreds at
 * most) rather than as Postgres views, so this stays self-contained: adding
 * the panel does not require a migration into someone else's schema.
 */
import { createClient } from '@supabase/supabase-js'
import { adminEnv, isAdminConfigured } from '@/config/env'

/** Rayo lives in its own schema; the wildhands client cannot see it. */
const RAYO_SCHEMA = 'rayo'

function rayoClient() {
  const env = adminEnv()
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: RAYO_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'wildhands-admin:rayo' } },
  })
}

export type RayoRange = '24h' | '7d' | '30d' | '90d' | 'all'

export const RAYO_RANGE_LABELS: Record<RayoRange, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

const RANGE_DAYS: Record<RayoRange, number | null> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
}

function sinceIso(range: RayoRange): string | null {
  const days = RANGE_DAYS[range]
  if (days === null) return null
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString()
}

/**
 * The aggregate picture, sized to fit on one screen.
 *
 * `signups` and cumulative counts ignore the range — a total is a total. The
 * range gates `newInRange`, so the operator can see whether the last week
 * looked different from the month before it.
 */
export interface RayoStats {
  range: RayoRange
  accounts: {
    total: number
    newInRange: number
    /** Have written or read anything in the last 30 days. */
    activeLast30d: number
  }
  quotes: {
    total: number
    newInRange: number
    byStatus: Array<{ status: string; count: number }>
    sent: number
    accepted: number
  }
  invoices: {
    total: number
    newInRange: number
  }
  drafter: {
    /** Number of AI drafts run (negative credit entries). */
    draftsInRange: number
    /** Credits bought in range, integer count. */
    creditsBoughtInRange: number
  }
  /** Signups per day for the chart. Empty if the range is `all`. */
  signupSeries: Array<{ day: string; count: number }>
}

export type RayoStatsResult =
  | { ok: true; data: RayoStats }
  | { ok: false; reason: 'not-configured' | 'unavailable'; detail?: string }

interface Row<T> {
  data: T[] | null
  error: unknown
}

async function safeCount(
  builder: PromiseLike<{ count: number | null; error: unknown }>
): Promise<number> {
  const result = await builder
  if (result.error) throw result.error
  return result.count ?? 0
}

/**
 * Signups per calendar day inside the range.
 *
 * Grouped in JavaScript because there is no view for it and there does not
 * need to be one: at Rayo's current scale a full month of accounts is a few
 * dozen rows. If that assumption stops holding, this becomes a rollup.
 */
function bucketByDay(rows: Array<{ created_at: string }>): Array<{ day: string; count: number }> {
  const buckets = new Map<string, number>()
  for (const row of rows) {
    const day = row.created_at.slice(0, 10)
    buckets.set(day, (buckets.get(day) ?? 0) + 1)
  }
  return [...buckets.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day))
}

export async function fetchRayoStats(range: RayoRange): Promise<RayoStatsResult> {
  if (!isAdminConfigured()) return { ok: false, reason: 'not-configured' }

  const from = sinceIso(range)
  const activeSince = sinceIso('30d')!
  const client = rayoClient()

  try {
    /* Count queries run in parallel: nine round trips at Postgres speed are
       fine, and blocking one on the next would double the wait. */
    const [
      accountsTotal,
      accountsNew,
      accountsActive30,
      quotesTotal,
      quotesNew,
      quotesByStatusRaw,
      invoicesTotal,
      invoicesNew,
      creditEntriesRaw,
      signupRowsRaw,
    ] = await Promise.all([
      safeCount(client.from('accounts').select('*', { count: 'exact', head: true })),
      from
        ? safeCount(
            client
              .from('accounts')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', from)
          )
        : Promise.resolve(0),
      safeCount(
        client
          .from('accounts')
          .select('*', { count: 'exact', head: true })
          .gte('updated_at', activeSince)
      ),
      safeCount(client.from('quotes').select('*', { count: 'exact', head: true })),
      from
        ? safeCount(
            client
              .from('quotes')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', from)
          )
        : Promise.resolve(0),
      client.from('quotes').select('status'),
      safeCount(client.from('invoices').select('*', { count: 'exact', head: true })),
      from
        ? safeCount(
            client
              .from('invoices')
              .select('*', { count: 'exact', head: true })
              .gte('issued_at', from)
          )
        : Promise.resolve(0),
      from
        ? client.from('credit_entries').select('amount').gte('created_at', from)
        : Promise.resolve({ data: [] as Array<{ amount: number }>, error: null }),
      from
        ? client.from('accounts').select('created_at').gte('created_at', from)
        : Promise.resolve({ data: [] as Array<{ created_at: string }>, error: null }),
    ])

    /* Group quotes by status client-side. Nine statuses at most, and the same
       small set every read, so a rollup would be more scaffolding than value. */
    const statusRows = (quotesByStatusRaw as Row<{ status: string }>).data ?? []
    const statusCounts = new Map<string, number>()
    for (const row of statusRows) {
      statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1)
    }
    const byStatus = [...statusCounts.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    const sent = statusCounts.get('sent') ?? 0
    const viewed = statusCounts.get('viewed') ?? 0
    const accepted = statusCounts.get('accepted') ?? 0

    /* A draft costs credits (negative entries); a top-up adds them (positive).
       Reporting both gives the operator a read on both revenue-side (credits
       bought) and usage-side (drafts run). */
    const creditRows =
      (creditEntriesRaw as Row<{ amount: number }>).data ??
      ([] as Array<{ amount: number }>)
    let draftsInRange = 0
    let creditsBoughtInRange = 0
    for (const row of creditRows) {
      if (row.amount < 0) draftsInRange += 1
      else creditsBoughtInRange += row.amount
    }

    const signupRows =
      (signupRowsRaw as Row<{ created_at: string }>).data ??
      ([] as Array<{ created_at: string }>)

    return {
      ok: true,
      data: {
        range,
        accounts: {
          total: accountsTotal,
          newInRange: accountsNew,
          activeLast30d: accountsActive30,
        },
        quotes: {
          total: quotesTotal,
          newInRange: quotesNew,
          byStatus,
          sent: sent + viewed,
          accepted,
        },
        invoices: {
          total: invoicesTotal,
          newInRange: invoicesNew,
        },
        drafter: {
          draftsInRange,
          creditsBoughtInRange,
        },
        signupSeries: bucketByDay(signupRows),
      },
    }
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    console.warn('[rayo-stats] unavailable', cause)
    return { ok: false, reason: 'unavailable', detail }
  }
}
