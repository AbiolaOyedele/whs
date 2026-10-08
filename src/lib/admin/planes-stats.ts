/**
 * Planes usage numbers, for the WildHands admin.
 *
 * Planes (planes.whstd.com) is a task-planning product hosted on the same Supabase project, in
 * its own `planes` schema. This module reads that schema through a second service client pinned
 * to `planes`, the same way dory-stats reads `dory`, so the wildhands client never has a route
 * into another application's tables.
 *
 * Planes holds people's day: what they plan to do and who they pass it to. So, like Dory, this
 * is counts and dates only. It never selects a task title, a description, a pass message, a
 * crew tag or a name, not even to aggregate in memory.
 */
import { createClient } from '@supabase/supabase-js'
import { adminEnv, isAdminConfigured } from '@/config/env'

const PLANES_SCHEMA = 'planes'

function planesClient() {
  const env = adminEnv()
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: PLANES_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'wildhands-admin:planes' } },
  })
}

export type PlanesRange = '24h' | '7d' | '30d' | '90d' | 'all'

export const PLANES_RANGE_LABELS: Record<PlanesRange, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

const RANGE_DAYS: Record<PlanesRange, number | null> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
}

function sinceIso(range: PlanesRange): string | null {
  const days = RANGE_DAYS[range]
  if (days === null) return null
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString()
}

export interface PlanesStats {
  range: PlanesRange
  accounts: {
    /** Planes accounts (a profile is created at sign-up). */
    total: number
    newInRange: number
    /** Added a task in the last 30 days. */
    activeLast30d: number
    /** Have time's-up notifications on, on at least one device. */
    notificationsOn: number
    /** Accepted friend links ("crew"), each pair counted once. */
    crewLinks: number
  }
  /** Things done inside the range. Counts only. */
  usage: {
    tasksAdded: number
    tasksLanded: number
    timersStarted: number
    tasksPassed: number
  }
  /** Signups per day for the chart. Empty if the range is `all`. */
  signupSeries: Array<{ day: string; count: number }>
}

export type PlanesStatsResult =
  | { ok: true; data: PlanesStats }
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

export async function fetchPlanesStats(range: PlanesRange): Promise<PlanesStatsResult> {
  if (!isAdminConfigured()) return { ok: false, reason: 'not-configured' }

  const from = sinceIso(range)
  const activeSince = sinceIso('30d')!
  const client = planesClient()

  /** Rows created inside the range for a table, counted (no columns read). */
  const createdInRange = (table: string) =>
    safeCount(
      from
        ? client.from(table).select('id', { count: 'exact', head: true }).gte('created_at', from)
        : client.from(table).select('id', { count: 'exact', head: true })
    )

  // Tasks people added. Carrying an unfinished task to the next day leaves a faded 'moved' copy
  // behind; that's the app's doing, not the person's, so it isn't counted.
  const addedTasks = () => {
    const base = client
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'moved')
      .is('deleted_at', null)
    return safeCount(from ? base.gte('created_at', from) : base)
  }

  const landedTasks = () => {
    const base = client
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'done')
      .is('deleted_at', null)
    return safeCount(from ? base.gte('completed_at', from) : base)
  }

  try {
    const [
      accountsTotal,
      accountsNew,
      recentPlanners,
      subscribers,
      crewLinks,
      tasksAdded,
      tasksLanded,
      timersStarted,
      tasksPassed,
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
      // user_id only, to count distinct people. Small at Planes' scale.
      client.from('tasks').select('user_id').neq('status', 'moved').gte('created_at', activeSince),
      client.from('push_subscriptions').select('user_id'),
      safeCount(
        client
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'accepted')
      ),
      addedTasks(),
      landedTasks(),
      createdInRange('timers'),
      createdInRange('task_passes'),
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
          activeLast30d: distinct(rowsOf(recentPlanners as Rows<{ user_id: string }>)),
          notificationsOn: distinct(rowsOf(subscribers as Rows<{ user_id: string }>)),
          crewLinks,
        },
        usage: { tasksAdded, tasksLanded, timersStarted, tasksPassed },
        signupSeries: bucketByDay(rowsOf(signupRows as Rows<{ created_at: string }>)),
      },
    }
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    console.warn('[planes-stats] unavailable', cause)
    return { ok: false, reason: 'unavailable', detail }
  }
}
