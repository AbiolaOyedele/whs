/**
 * Database access for editable content and design tokens.
 *
 * Reads here are called during the static build, once per process, for every
 * page. They must never throw: a build that fails because Supabase was briefly
 * unreachable would take the marketing site down to change a headline. Every
 * read returns an empty result on failure and lets the caller fall back to the
 * defaults compiled into the repository.
 *
 * Writes are a different matter and do throw — the operator is standing there,
 * and a save that silently does nothing is worse than an error.
 */
import { isAdminConfigured } from '@/config/env'
import { AppError } from '@/lib/errors'
import { serviceClient } from '@/lib/supabase'

export interface ContentOverride {
  key: string
  value: unknown
  updatedAt: string
}

export interface TokenOverride {
  key: string
  value: string
  updatedAt: string
}

/**
 * Every content override, keyed. Empty when unconfigured or unreachable.
 *
 * Not cached here: the caller in lib/admin/content.ts owns the per-process
 * cache, so a long-lived server does not re-query on every request while the
 * build still gets one read for the whole run.
 */
export async function fetchContentOverrides(): Promise<Map<string, unknown>> {
  if (!isAdminConfigured()) return new Map()

  try {
    const { data, error } = await serviceClient().from('content_blocks').select('key, value')
    if (error) throw error

    const overrides = new Map<string, unknown>()
    for (const row of data as Array<{ key: string; value: unknown }>) {
      if (row.value !== null && row.value !== undefined) overrides.set(row.key, row.value)
    }
    return overrides
  } catch (cause) {
    console.warn(
      '[content] Could not load overrides; rendering the copy committed in the repository.',
      cause
    )
    return new Map()
  }
}

/** Every design-token override, keyed. Same failure contract as above. */
export async function fetchTokenOverrides(): Promise<Map<string, string>> {
  if (!isAdminConfigured()) return new Map()

  try {
    const { data, error } = await serviceClient().from('design_tokens').select('key, value')
    if (error) throw error

    const overrides = new Map<string, string>()
    for (const row of data as Array<{ key: string; value: string | null }>) {
      if (row.value && row.value.trim().length > 0) overrides.set(row.key, row.value.trim())
    }
    return overrides
  } catch (cause) {
    console.warn('[tokens] Could not load overrides; using the values in global.css.', cause)
    return new Map()
  }
}

function fail(operation: string, cause: unknown): never {
  throw new AppError(
    500,
    'We could not save that just then. Please try again.',
    `DB_CONTENT_${operation}_FAILED`,
    cause
  )
}

/**
 * Writes one content override.
 *
 * A blank value DELETES the row rather than storing an empty string, which is
 * what makes "clear the field to restore the original copy" work. Storing ""
 * would render an empty headline and give the operator no way back.
 */
export async function saveContentOverride(
  key: string,
  value: unknown,
  userId: string
): Promise<void> {
  const db = serviceClient()
  const isBlank =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0) ||
    (Array.isArray(value) && value.length === 0)

  if (isBlank) {
    const { error } = await db.from('content_blocks').delete().eq('key', key)
    if (error) fail('CLEAR', error)
    return
  }

  const { error } = await db
    .from('content_blocks')
    .upsert({ key, value, updated_by: userId }, { onConflict: 'key' })
  if (error) fail('SAVE', error)
}

/** Writes one token override. Blank clears it, as above. */
export async function saveTokenOverride(key: string, value: string, userId: string): Promise<void> {
  const db = serviceClient()

  if (value.trim().length === 0) {
    const { error } = await db.from('design_tokens').delete().eq('key', key)
    if (error) fail('TOKEN_CLEAR', error)
    return
  }

  const { error } = await db
    .from('design_tokens')
    .upsert({ key, value: value.trim(), updated_by: userId }, { onConflict: 'key' })
  if (error) fail('TOKEN_SAVE', error)
}

/** Records a publish attempt, for the log in the editor. */
export async function recordPublish(input: {
  status: 'queued' | 'triggered' | 'failed'
  note: string
  error?: string | undefined
  changedKeys: number
  userId: string
  email: string
}): Promise<void> {
  const { error } = await serviceClient()
    .from('publishes')
    .insert({
      status: input.status,
      note: input.note,
      error: input.error ?? null,
      changed_keys: input.changedKeys,
      triggered_by: input.userId,
      triggered_by_email: input.email,
    })
  if (error) console.error('[publish-log]', error)
}

export interface PublishRecord {
  id: string
  status: 'queued' | 'triggered' | 'failed'
  note: string
  error: string | null
  createdAt: string
  email: string | null
}

export async function listPublishes(limit = 10): Promise<PublishRecord[]> {
  try {
    const { data, error } = await serviceClient()
      .from('publishes')
      .select('id, status, note, error, created_at, triggered_by_email')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (
      data as Array<{
        id: string
        status: PublishRecord['status']
        note: string
        error: string | null
        created_at: string
        triggered_by_email: string | null
      }>
    ).map((row) => ({
      id: row.id,
      status: row.status,
      note: row.note,
      error: row.error,
      createdAt: row.created_at,
      email: row.triggered_by_email,
    }))
  } catch {
    return []
  }
}
