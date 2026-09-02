/**
 * Supabase clients. Server-only, both of them.
 *
 * Nothing in this application talks to Supabase from a browser. The admin UI
 * calls our own /api/v1/admin/* routes, which hold the session in an httpOnly
 * cookie — so no Supabase key of any kind reaches a client bundle, and the
 * layering rule (components call our routes, never a provider) holds.
 *
 * ⚠️ SHARED PROJECT. This Supabase project hosts more than WildHands, so every
 * table we own lives in a dedicated `wildhands` schema and both clients are
 * pinned to it below. A query here can never reach another application's data
 * by accident, and `public` is left untouched.
 *
 * That pinning is the whole safety mechanism, so it is set once, here, rather
 * than schema-qualifying two hundred call sites that would each be one typo
 * away from reading the wrong table.
 *
 * Two clients, because they carry very different authority:
 *
 *  - `serviceClient()` uses the service role key. It bypasses row-level
 *    security entirely and is the only thing that reads or writes application
 *    data. Every caller must have already established who is asking.
 *  - `authClient()` uses the anon key and exists for exactly one job: turning
 *    an email and password into a session, and verifying a token afterwards.
 */
import { createClient } from '@supabase/supabase-js'
import { adminEnv } from '@/config/env'

/**
 * The schema every WildHands table lives in.
 *
 * Must also be listed under Settings → API → Exposed schemas in the Supabase
 * dashboard, or PostgREST refuses to serve it with PGRST106.
 */
export const DB_SCHEMA = 'wildhands'

function assertServer(name: string): void {
  if (typeof window !== 'undefined') {
    throw new Error(`${name} is server-only and must not be called from client code.`)
  }
}

/*
 * Both factories are separate functions so their return types can be INFERRED.
 *
 * `SupabaseClient` is parameterised by schema, so annotating the cache as a
 * plain `SupabaseClient` silently types every query against `public` — which
 * is the one schema we must never touch here. Inferring keeps the `wildhands`
 * parameter attached all the way out to the repositories, and does it without
 * an `any` the lint config would reject anyway.
 */
function createServiceClient() {
  const env = adminEnv()
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'wildhands-admin' } },
  })
}

function createAuthClient() {
  const env = adminEnv()
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    // No `db.schema`: this client only ever calls auth endpoints, which live
    // outside our schema and are shared by the whole project.
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export type ServiceClient = ReturnType<typeof createServiceClient>
export type AuthClient = ReturnType<typeof createAuthClient>

let cachedService: ServiceClient | null = null
let cachedAuth: AuthClient | null = null

/**
 * Full-authority client, scoped to the `wildhands` schema. Bypasses RLS.
 *
 * Only call this from code that has already verified the caller — an admin
 * session, or a PIN the client got right. Reaching for it anywhere else is how
 * a marketing site ends up serving another client's pricing.
 */
export function serviceClient(): ServiceClient {
  assertServer('serviceClient()')
  cachedService ??= createServiceClient()
  return cachedService
}

/** Anon-key client. Sign-in and token verification only. */
export function authClient(): AuthClient {
  assertServer('authClient()')
  cachedAuth ??= createAuthClient()
  return cachedAuth
}
