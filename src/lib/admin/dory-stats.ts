/**
 * Dory usage numbers, for the WildHands admin.
 *
 * Dory (dory.whstd.com) is a personal-finance product hosted on the same Supabase project, in
 * its own `dory` schema. This module reads that schema through a second service client pinned
 * to `dory`, the same way rayo-stats reads `rayo`, so the wildhands client never has a route
 * into another application's tables.
 *
 * Dory holds people's money: budgets, spending, loans. So this is stricter than Rayo's panel:
 * counts and dates only. It never selects an amount, a name, a description or an email, not
 * even to aggregate in memory.
 */
import { createClient } from '@supabase/supabase-js'
import { adminEnv, isAdminConfigured } from '@/config/env'

const DORY_SCHEMA = 'dory'

function doryClient() {
  const env = adminEnv()
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: DORY_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'wildhands-admin:dory' } },
  })
}

export type DoryRange = '24h' | '7d' | '30d' | '90d' | 'all'

export const DORY_RANGE_LABELS: Record<DoryRange, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

const RANGE_DAYS: Record<DoryRange, number | null> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
}

function sinceIso(range: DoryRange): string | null {
  const days = RANGE_DAYS[range]
  if (days === null) return null
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString()
}

export interface DoryStats {
  range: DoryRange
  accounts: {
    /** Dory accounts (a profile is created when an allowed person signs in). */
    total: number
    newInRange: number
    /** Emails allowed in (dory.members), including people who haven't signed in yet. */
    allowed: number
    /** Have set up a monthly budget at least once. */
    setUp: number
    /** Logged spending in the last 30 days. */
    activeLast30d: number
  }
  /** Things logged inside the range. Counts only. */
  usage: {
    expenses: number
    shoppingTrips: number
    loans: number
    subscriptions: number
  }
  /** Signups per day for the chart. Empty if the range is `all`. */
  signupSeries: Array<{ day: string; count: number }>
}

export type DoryStatsResult =
  | { ok: true; data: DoryStats }
  | { ok: false; reason: 'not-configured' | 'unavailable'; detail?: string }

interface Rows<T> {
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

function rowsOf<T>(result: Rows<T>): T[] {
  if (result.error) throw result.error
  return result.data ?? []
}

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

export async function fetchDoryStats(range: DoryRange): Promise<DoryStatsResult> {
  if (!isAdminConfigured()) return { ok: false, reason: 'not-configured' }

  const from = sinceIso(range)
  const activeSince = sinceIso('30d')!
  const client = doryClient()

  /** Rows created inside the range for a table, counted (no columns read). */
  const createdInRange = (table: string) =>
    safeCount(
      from
        ? client.from(table).select('id', { count: 'exact', head: true }).gte('created_at', from)
        : client.from(table).select('id', { count: 'exact', head: true })
    )

  try {
    const [
      accountsTotal,
      accountsNew,
      allowed,
      budgetOwners,
      recentSpenders,
      expenses,
      shoppingTrips,
      loans,
      subscriptions,
      signupRows,
    ] = await Promise.all([
      safeCount(client.from('profiles').select('id', { count: 'exact', head: true })),
      from
        ? safeCount(
            client
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', from)
          )
        : Promise.resolve(0),
      safeCount(client.from('members').select('email', { count: 'exact', head: true })),
      // user_id only, to count distinct people. Small at Dory's scale.
      client.from('budget_months').select('user_id'),
      client.from('expenses').select('user_id').gte('created_at', activeSince),
      createdInRange('expenses'),
      createdInRange('shopping_sessions'),
      createdInRange('loans'),
      createdInRange('subscriptions'),
      from
        ? client.from('profiles').select('created_at').gte('created_at', from)
        : Promise.resolve({ data: [] as Array<{ created_at: string }>, error: null }),
    ])

    const distinct = (rows: Array<{ user_id: string }>) => new Set(rows.map((r) => r.user_id)).size

    return {
      ok: true,
      data: {
        range,
        accounts: {
          total: accountsTotal,
          newInRange: accountsNew,
          allowed,
          setUp: distinct(rowsOf(budgetOwners as Rows<{ user_id: string }>)),
          activeLast30d: distinct(rowsOf(recentSpenders as Rows<{ user_id: string }>)),
        },
        usage: { expenses, shoppingTrips, loans, subscriptions },
        signupSeries: bucketByDay(rowsOf(signupRows as Rows<{ created_at: string }>)),
      },
    }
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    console.warn('[dory-stats] unavailable', cause)
    return { ok: false, reason: 'unavailable', detail }
  }
}
