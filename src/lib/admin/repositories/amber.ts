/**
 * Every query against Amber's `amber` schema.
 *
 * A second service client pinned to that schema, the same way dory-stats and
 * planes-stats read theirs, so the wildhands client never has a route into
 * another application's tables. Amber stores no images or text people write:
 * the export log is template, photo count, font and time only.
 */
import { createClient } from '@supabase/supabase-js'
import { adminEnv } from '@/config/env'
import { AppError } from '@/lib/errors'
import type { AmberHeadline, AmberTemplate, AmberUser } from '@/types/amber'

const AMBER_SCHEMA = 'amber'

function amberClient() {
  const env = adminEnv()
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: AMBER_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'wildhands-admin:amber' } },
  })
}

function dbError(error: { code?: string; message: string }, code: string): AppError {
  if (error.code === '23505') {
    return new AppError(
      409,
      'That username is already taken. Pick another.',
      'AMBER_USERNAME_TAKEN'
    )
  }
  return new AppError(500, 'Amber’s data could not be updated. Try again.', code, {
    dbCode: error.code ?? null,
    dbMessage: error.message,
  })
}

/* ---------------------------------------------------------------- users */

interface UserRow {
  id: string
  username: string
  display_name: string | null
  is_active: boolean
  locked_until: string | null
  last_login_at: string | null
  created_at: string
}

export async function listUsers(): Promise<AmberUser[]> {
  const db = amberClient()
  const [users, exports] = await Promise.all([
    db
      .from('users')
      .select('id, username, display_name, is_active, locked_until, last_login_at, created_at')
      .order('created_at', { ascending: true }),
    db.from('exports').select('user_id'),
  ])
  if (users.error) throw dbError(users.error, 'AMBER_USERS_LIST_FAILED')
  if (exports.error) throw dbError(exports.error, 'AMBER_USERS_LIST_FAILED')

  const made = new Map<string, number>()
  for (const row of (exports.data ?? []) as Array<{ user_id: string | null }>) {
    if (row.user_id) made.set(row.user_id, (made.get(row.user_id) ?? 0) + 1)
  }
  return ((users.data ?? []) as UserRow[]).map((row) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    isActive: row.is_active,
    lockedUntil: row.locked_until,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    bannersMade: made.get(row.id) ?? 0,
  }))
}

export async function insertUser(row: {
  username: string
  display_name: string | null
  pin_hash: string
}): Promise<void> {
  const { error } = await amberClient().from('users').insert(row)
  if (error) throw dbError(error, 'AMBER_USER_CREATE_FAILED')
}

export async function findUsername(id: string): Promise<string | null> {
  const { data, error } = await amberClient()
    .from('users')
    .select('username')
    .eq('id', id)
    .maybeSingle()
  if (error) throw dbError(error, 'AMBER_USER_READ_FAILED')
  return (data as { username: string } | null)?.username ?? null
}

export async function updateUser(
  id: string,
  patch: Partial<{
    display_name: string | null
    pin_hash: string
    is_active: boolean
    failed_attempts: number
    locked_until: string | null
  }>
): Promise<void> {
  const { error } = await amberClient().from('users').update(patch).eq('id', id)
  if (error) throw dbError(error, 'AMBER_USER_UPDATE_FAILED')
}

/** Signs someone out everywhere: used on PIN reset and when switching an account off. */
export async function deleteSessions(userId: string): Promise<void> {
  const { error } = await amberClient().from('sessions').delete().eq('user_id', userId)
  if (error) throw dbError(error, 'AMBER_SESSIONS_DELETE_FAILED')
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await amberClient().from('users').delete().eq('id', id)
  if (error) throw dbError(error, 'AMBER_USER_DELETE_FAILED')
}

/* ---------------------------------------------------------------- headlines */

export async function listHeadlines(): Promise<AmberHeadline[]> {
  const { data, error } = await amberClient()
    .from('headlines')
    .select('id, text, position, is_active')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw dbError(error, 'AMBER_HEADLINES_LIST_FAILED')
  return (
    (data ?? []) as Array<{ id: string; text: string; position: number; is_active: boolean }>
  ).map((row) => ({ id: row.id, text: row.text, position: row.position, isActive: row.is_active }))
}

export async function insertHeadline(text: string, position: number): Promise<void> {
  const { error } = await amberClient().from('headlines').insert({ text, position })
  if (error) throw dbError(error, 'AMBER_HEADLINE_CREATE_FAILED')
}

export async function updateHeadline(
  id: string,
  patch: Partial<{ text: string; is_active: boolean; position: number }>
): Promise<void> {
  const { error } = await amberClient().from('headlines').update(patch).eq('id', id)
  if (error) throw dbError(error, 'AMBER_HEADLINE_UPDATE_FAILED')
}

export async function deleteHeadline(id: string): Promise<void> {
  const { error } = await amberClient().from('headlines').delete().eq('id', id)
  if (error) throw dbError(error, 'AMBER_HEADLINE_DELETE_FAILED')
}

/* ---------------------------------------------------------------- usage */

export interface ExportRow {
  user_id: string | null
  template: AmberTemplate
  created_at: string
}

/** Export log rows since a date (or all). Three small columns; Amber's volume is a team's. */
export async function listExports(since: string | null): Promise<ExportRow[]> {
  const base = amberClient().from('exports').select('user_id, template, created_at')
  const { data, error } = await (since ? base.gte('created_at', since) : base)
  if (error) throw dbError(error, 'AMBER_EXPORTS_LIST_FAILED')
  return (data ?? []) as ExportRow[]
}

export async function countExports(): Promise<number> {
  const { count, error } = await amberClient()
    .from('exports')
    .select('id', { count: 'exact', head: true })
  if (error) throw dbError(error, 'AMBER_EXPORTS_COUNT_FAILED')
  return count ?? 0
}
