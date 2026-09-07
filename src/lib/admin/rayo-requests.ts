/**
 * Rayo customisation requests, for the WildHands admin.
 *
 * A request is a Rayo user asking WildHands to build something on top of the
 * product. It carries client detail (the requesting business) because that is
 * the point — WildHands is going to reply to a person about a job. Unlike
 * rayo-stats.ts, which stays aggregate-only, this is by design personal:
 * without the who and what, the admin cannot do anything with it.
 *
 * Rayo lives in its own `rayo` schema on a shared Supabase project. This
 * module reads that schema through a service client pinned to `rayo` so the
 * wildhands client never has a route into another application's tables.
 */
import { createClient } from '@supabase/supabase-js'
import { adminEnv, isAdminConfigured } from '@/config/env'

const RAYO_SCHEMA = 'rayo'

function rayoClient() {
  const env = adminEnv()
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: RAYO_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'wildhands-admin:rayo-requests' } },
  })
}

export type RequestStatus = 'new' | 'in_progress' | 'closed'

export interface RayoRequest {
  id: string
  userId: string
  services: string[]
  message: string
  status: RequestStatus
  createdAt: string
  /** Joined from `rayo.accounts`. */
  contactName: string | null
  businessName: string | null
  businessEmail: string | null
  sector: string | null
}

export type RayoRequestsResult =
  | { ok: true; data: RayoRequest[] }
  | { ok: false; reason: 'not-configured' | 'unavailable'; detail?: string }

interface RequestRow {
  id: string
  user_id: string
  services: string[]
  message: string
  status: RequestStatus
  created_at: string
}

interface AccountRow {
  user_id: string
  contact_name: string | null
  business_name: string | null
  business_email: string | null
  sector: string | null
}

/**
 * All customisation requests, newest first, joined to their submitter's
 * account row for context. Two queries and a JS join — PostgREST cannot
 * express an FK join across schemas here without a foreign wrapper, and the
 * row count is small enough that a second query is cheaper than that setup.
 */
export async function fetchRayoRequests(): Promise<RayoRequestsResult> {
  if (!isAdminConfigured()) return { ok: false, reason: 'not-configured' }

  const client = rayoClient()

  try {
    const [requestsRes, accountsRes] = await Promise.all([
      client
        .from('customisation_requests')
        .select('id, user_id, services, message, status, created_at')
        .order('created_at', { ascending: false }),
      client
        .from('accounts')
        .select('user_id, contact_name, business_name, business_email, sector'),
    ])

    if (requestsRes.error) throw requestsRes.error
    if (accountsRes.error) throw accountsRes.error

    const requests = (requestsRes.data ?? []) as RequestRow[]
    const accounts = (accountsRes.data ?? []) as AccountRow[]
    const byUser = new Map(accounts.map((a) => [a.user_id, a]))

    const enriched: RayoRequest[] = requests.map((row) => {
      const account = byUser.get(row.user_id) ?? null
      return {
        id: row.id,
        userId: row.user_id,
        services: Array.isArray(row.services) ? row.services : [],
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
        contactName: account?.contact_name ?? null,
        businessName: account?.business_name ?? null,
        businessEmail: account?.business_email ?? null,
        sector: account?.sector ?? null,
      }
    })

    return { ok: true, data: enriched }
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    console.warn('[rayo-requests] unavailable', cause)
    return { ok: false, reason: 'unavailable', detail }
  }
}
