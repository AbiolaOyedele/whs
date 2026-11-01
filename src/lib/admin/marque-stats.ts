/**
 * Marque usage numbers, for the WildHands admin.
 *
 * Marque (marque.whstd.com) is the brand-guideline editor. Unlike Dory and Rayo it does not live
 * on the admin's own Supabase project: it shares another project, in its own `marque` schema.
 * This module reads that schema through a service client pinned to it, using its own URL and key
 * (MARQUE_SUPABASE_URL, MARQUE_SUPABASE_SERVICE_ROLE_KEY), so the wildhands client never has a
 * route into another application's tables.
 *
 * Guides are people's brand work, much of it unpublished. So this is counts and dates only: it
 * never selects a guide's name, slug, document, an email or an AI revision's summary.
 */
import { createClient } from '@supabase/supabase-js'
import { adminEnv, isAdminConfigured } from '@/config/env'

const MARQUE_SCHEMA = 'marque'

/** The Marque project's URL and key, or null when the admin has not been given them. */
function marqueConnection(): { url: string; key: string } | null {
  if (!isAdminConfigured()) return null
  const env = adminEnv()
  if (!env.MARQUE_SUPABASE_URL || !env.MARQUE_SUPABASE_SERVICE_ROLE_KEY) return null
  return { url: env.MARQUE_SUPABASE_URL, key: env.MARQUE_SUPABASE_SERVICE_ROLE_KEY }
}

export type MarqueRange = '24h' | '7d' | '30d' | '90d' | 'all'

export const MARQUE_RANGE_LABELS: Record<MarqueRange, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

const RANGE_DAYS: Record<MarqueRange, number | null> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
}

function sinceIso(range: MarqueRange): string | null {
  const days = RANGE_DAYS[range]
  if (days === null) return null
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString()
}

export interface MarqueStats {
  range: MarqueRange
  accounts: {
    /** Marque accounts (a profile is created on someone's first Marque sign-in). */
    total: number
    newInRange: number
    /** Have at least one guide. */
    withGuides: number
    /** Edited a guide in the last 30 days. */
    activeLast30d: number
    /** Have at least one published guide. */
    publishing: number
    /** Have connected an AI assistant through the MCP connector. */
    connectedAssistant: number
  }
  /** Things made inside the range. Counts only. */
  usage: {
    guidesCreated: number
    guidesPublished: number
    assistantEdits: number
    assistantConnections: number
  }
  /** Guides live on the web right now, whatever the range. */
  livePublishedGuides: number
  /** Signups per day for the chart. Empty if the range is `all`. */
  signupSeries: Array<{ day: string; count: number }>
}

export type MarqueStatsResult =
  | { ok: true; data: MarqueStats }
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

export async function fetchMarqueStats(range: MarqueRange): Promise<MarqueStatsResult> {
  const connection = marqueConnection()
  if (!connection) return { ok: false, reason: 'not-configured' }

  const from = sinceIso(range)
  const activeSince = sinceIso('30d')!
  const client = createClient(connection.url, connection.key, {
    db: { schema: MARQUE_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'wildhands-admin:marque' } },
  })

  /** Rows created inside the range for a table, counted (no columns read). */
  const inRange = (table: string, column: string) =>
    safeCount(
      from
        ? client.from(table).select('*', { count: 'exact', head: true }).gte(column, from)
        : client.from(table).select('*', { count: 'exact', head: true })
    )

  try {
    const [
      accountsTotal,
      accountsNew,
      guideOwners,
      recentEditors,
      publishers,
      connectors,
      guidesCreated,
      guidesPublished,
      assistantEdits,
      assistantConnections,
      livePublishedGuides,
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
      // user_id only, to count distinct people. Small at Marque's scale.
      client.from('guides').select('user_id'),
      client.from('guides').select('user_id').gte('updated_at', activeSince),
      client.from('published').select('user_id'),
      client.from('mcp_grants').select('user_id'),
      inRange('guides', 'created_at'),
      inRange('published', 'published_at'),
      inRange('guide_revisions', 'created_at'),
      inRange('mcp_grants', 'created_at'),
      safeCount(client.from('published').select('id', { count: 'exact', head: true })),
      from
        ? client.from('profiles').select('created_at').gte('created_at', from)
        : Promise.resolve({ data: [] as Array<{ created_at: string }>, error: null }),
    ])

    const distinct = (result: unknown): number =>
      new Set(rowsOf(result as Rows<{ user_id: string }>).map((row) => row.user_id)).size

    return {
      ok: true,
      data: {
        range,
        accounts: {
          total: accountsTotal,
          newInRange: accountsNew,
          withGuides: distinct(guideOwners),
          activeLast30d: distinct(recentEditors),
          publishing: distinct(publishers),
          connectedAssistant: distinct(connectors),
        },
        usage: { guidesCreated, guidesPublished, assistantEdits, assistantConnections },
        livePublishedGuides,
        signupSeries: bucketByDay(rowsOf(signupRows as Rows<{ created_at: string }>)),
      },
    }
  } catch (cause) {
    // Supabase errors are plain objects with a message, not Error instances.
    const detail =
      cause instanceof Error
        ? cause.message
        : typeof cause === 'object' && cause !== null && 'message' in cause
          ? String((cause as { message: unknown }).message)
          : String(cause)
    console.warn('[marque-stats] unavailable', cause)
    return { ok: false, reason: 'unavailable', detail }
  }
}
