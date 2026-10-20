/**
 * Amber in the admin: team accounts, the heading bank, and usage numbers.
 *
 * PINs are hashed here exactly as Amber checks them (amber/src/utils/pin.ts):
 * HMAC-SHA256 of `amber-pin:<username>:<pin>` under AMBER_PIN_SECRET, which both
 * projects share. The username is part of the hash, so usernames cannot be
 * renamed; delete and re-add instead. The PIN is never stored or logged.
 */
import { createHmac } from 'node:crypto'
import { z } from 'zod'
import { adminEnv, isAdminConfigured } from '@/config/env'
import { AppError } from '@/lib/errors'
import * as repo from '@/lib/admin/repositories/amber'
import {
  AMBER_TEMPLATES,
  type AmberRange,
  type AmberStats,
  type AmberTemplate,
} from '@/types/amber'

/* ---------------------------------------------------------------- hashing */

export function normaliseUsername(username: string): string {
  return username.trim().toLowerCase()
}

/** Must stay byte-for-byte identical to Amber's `hashPin`. Covered by a shared test vector. */
export function hashAmberPin(secret: string, username: string, pin: string): string {
  return createHmac('sha256', Buffer.from(secret, 'hex'))
    .update(`amber-pin:${normaliseUsername(username)}:${pin}`)
    .digest('hex')
}

function pinSecret(): string {
  const secret = adminEnv().AMBER_PIN_SECRET
  if (!secret) {
    throw new AppError(
      503,
      'Amber accounts can’t be changed until AMBER_PIN_SECRET is set for this site.',
      'AMBER_SECRET_MISSING'
    )
  }
  return secret
}

export function canManageAccounts(): boolean {
  return isAdminConfigured() && Boolean(adminEnv().AMBER_PIN_SECRET)
}

/* ---------------------------------------------------------------- input */

const pin = z.string().regex(/^\d{4}$/, 'The PIN must be exactly 4 digits.')

const displayName = z
  .string()
  .trim()
  .max(60, 'Keep the name under 60 characters.')
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional()

export const newUserSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9._-]{3,32}$/,
      'Usernames are 3 to 32 characters: letters, numbers, dot, dash or underscore.'
    ),
  displayName,
  pin,
})

export const userUpdateSchema = z
  .object({
    displayName,
    pin: pin.optional(),
    isActive: z.boolean().optional(),
    /** Clears a lockout after too many wrong PINs. */
    unlock: z.literal(true).optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), 'Nothing to change.')

const headlineText = z
  .string()
  .trim()
  .min(3, 'A heading needs at least 3 characters.')
  .max(60, 'Keep headings under 60 characters so they fit the banner.')

export const newHeadlineSchema = z.object({ text: headlineText })

export const headlineUpdateSchema = z
  .object({
    text: headlineText.optional(),
    isActive: z.boolean().optional(),
    move: z.enum(['up', 'down']).optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), 'Nothing to change.')

export const idSchema = z.uuid('That item could not be found.')

function parse<T>(schema: z.ZodType<T>, body: unknown, code: string): T {
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new AppError(
      422,
      parsed.error.issues[0]?.message ?? 'Check the form and try again.',
      code
    )
  }
  return parsed.data
}

/* ---------------------------------------------------------------- accounts */

export async function createUser(body: unknown): Promise<void> {
  const input = parse(newUserSchema, body, 'AMBER_USER_INVALID_INPUT')
  await repo.insertUser({
    username: input.username,
    display_name: input.displayName ?? null,
    pin_hash: hashAmberPin(pinSecret(), input.username, input.pin),
  })
}

export async function updateUser(id: string, body: unknown): Promise<void> {
  const userId = parse(idSchema, id, 'AMBER_USER_INVALID_ID')
  const input = parse(userUpdateSchema, body, 'AMBER_USER_INVALID_INPUT')
  const username = await repo.findUsername(userId)
  if (!username) throw new AppError(404, 'That person no longer exists.', 'AMBER_USER_NOT_FOUND')

  const patch: Parameters<typeof repo.updateUser>[1] = {}
  if (input.displayName !== undefined) patch.display_name = input.displayName
  if (input.isActive !== undefined) patch.is_active = input.isActive
  if (input.pin) {
    patch.pin_hash = hashAmberPin(pinSecret(), username, input.pin)
    patch.failed_attempts = 0
    patch.locked_until = null
  }
  if (input.unlock) {
    patch.failed_attempts = 0
    patch.locked_until = null
  }
  await repo.updateUser(userId, patch)
  // A new PIN or a switched-off account signs them out on every device.
  if (input.pin || input.isActive === false) await repo.deleteSessions(userId)
}

export async function deleteUser(id: string): Promise<void> {
  await repo.deleteUser(parse(idSchema, id, 'AMBER_USER_INVALID_ID'))
}

/* ---------------------------------------------------------------- headings */

export async function createHeadline(body: unknown): Promise<void> {
  const input = parse(newHeadlineSchema, body, 'AMBER_HEADLINE_INVALID_INPUT')
  const existing = await repo.listHeadlines()
  const last = existing.reduce((max, h) => Math.max(max, h.position), 0)
  await repo.insertHeadline(input.text, last + 1)
}

export async function updateHeadline(id: string, body: unknown): Promise<void> {
  const headlineId = parse(idSchema, id, 'AMBER_HEADLINE_INVALID_ID')
  const input = parse(headlineUpdateSchema, body, 'AMBER_HEADLINE_INVALID_INPUT')

  if (input.move) {
    // Swap positions with the neighbour, renumbering first so ties can't stall a move.
    const list = await repo.listHeadlines()
    const i = list.findIndex((h) => h.id === headlineId)
    const j = input.move === 'up' ? i - 1 : i + 1
    if (i >= 0 && j >= 0 && j < list.length) {
      const order = list.map((h) => h.id)
      ;[order[i], order[j]] = [order[j]!, order[i]!]
      await Promise.all(order.map((hid, position) => repo.updateHeadline(hid, { position })))
    }
  }

  const patch: { text?: string; is_active?: boolean } = {}
  if (input.text !== undefined) patch.text = input.text
  if (input.isActive !== undefined) patch.is_active = input.isActive
  if (Object.keys(patch).length) await repo.updateHeadline(headlineId, patch)
}

export async function deleteHeadline(id: string): Promise<void> {
  await repo.deleteHeadline(parse(idSchema, id, 'AMBER_HEADLINE_INVALID_ID'))
}

/* ---------------------------------------------------------------- usage */

export const AMBER_RANGE_LABELS: Record<AmberRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

const RANGE_DAYS: Record<AmberRange, number | null> = { '7d': 7, '30d': 30, '90d': 90, all: null }

export function parseRange(value: string | null): AmberRange {
  return value === '7d' || value === '30d' || value === '90d' || value === 'all' ? value : '30d'
}

export type AmberLoad<T> =
  { ok: true; data: T } | { ok: false; reason: 'not-configured' | 'unavailable'; detail?: string }

export async function loadAmber(range: AmberRange): Promise<
  AmberLoad<{
    stats: AmberStats
    users: Awaited<ReturnType<typeof repo.listUsers>>
    headlines: Awaited<ReturnType<typeof repo.listHeadlines>>
  }>
> {
  if (!isAdminConfigured()) return { ok: false, reason: 'not-configured' }
  const days = RANGE_DAYS[range]
  const since = days === null ? null : new Date(Date.now() - days * 86_400_000).toISOString()
  try {
    const [users, headlines, exports, allTime] = await Promise.all([
      repo.listUsers(),
      repo.listHeadlines(),
      repo.listExports(since),
      repo.countExports(),
    ])
    const byTemplate = new Map<AmberTemplate, number>()
    const perDay = new Map<string, number>()
    const people = new Set<string>()
    for (const row of exports) {
      byTemplate.set(row.template, (byTemplate.get(row.template) ?? 0) + 1)
      perDay.set(row.created_at.slice(0, 10), (perDay.get(row.created_at.slice(0, 10)) ?? 0) + 1)
      if (row.user_id) people.add(row.user_id)
    }
    return {
      ok: true,
      data: {
        users,
        headlines,
        stats: {
          range,
          banners: exports.length,
          bannersAllTime: allTime,
          activePeople: people.size,
          accounts: users.filter((u) => u.isActive).length,
          byTemplate: AMBER_TEMPLATES.map((template) => ({
            template,
            count: byTemplate.get(template) ?? 0,
          })),
          perDay: [...perDay.entries()]
            .map(([day, count]) => ({ day, count }))
            .sort((a, b) => a.day.localeCompare(b.day)),
        },
      },
    }
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    console.warn('[amber] unavailable', cause)
    return { ok: false, reason: 'unavailable', detail }
  }
}
