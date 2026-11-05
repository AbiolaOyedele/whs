/**
 * The shop platform's usage numbers, for the WildHands admin.
 *
 * The shop platform (its own repo and its own Supabase project) is the one product here that is
 * read over HTTP rather than through a database client: it adds its figures up itself and serves
 * them at /api/v1/cc/summary behind a shared token. This module never sees a row, a name or an
 * email — only the totals that endpoint chose to send. Its own detailed control room is the
 * platform's command center (cc.<its domain>), linked from here.
 */
import { adminEnv, isAdminConfigured } from '@/config/env'

export type ShopPlatformRange = '7d' | '30d' | '90d' | 'all'

export const SHOP_PLATFORM_RANGE_LABELS: Record<ShopPlatformRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

export interface ShopPlatformStats {
  product: { name: string; siteUrl: string; commandCenterUrl: string }
  range: ShopPlatformRange
  accounts: { total: number; newInRange: number; activeLast30d: number; sellers: number }
  shops: { total: number; open: number; newInRange: number; selling: number }
  money: { salesKobo: number; feesKobo: number; orders: number }
  traffic: { shopVisitors: number; landingVisitors: number; browsingNow: number }
  support: { waiting: number }
  signupSeries: Array<{ day: string; count: number }>
}

export type ShopPlatformStatsResult =
  | { ok: true; data: ShopPlatformStats }
  | { ok: false; reason: 'not-configured' | 'unavailable'; detail?: string }

/** What the card is called before the platform has answered with its own name. */
export const SHOP_PLATFORM_FALLBACK_NAME = 'Dooja'

export async function fetchShopPlatformStats(range: ShopPlatformRange): Promise<ShopPlatformStatsResult> {
  if (!isAdminConfigured()) return { ok: false, reason: 'not-configured' }
  const env = adminEnv()
  if (!env.SHOP_PLATFORM_SUMMARY_URL || !env.SHOP_PLATFORM_SUMMARY_TOKEN) {
    return { ok: false, reason: 'not-configured' }
  }

  const url = new URL(env.SHOP_PLATFORM_SUMMARY_URL)
  url.searchParams.set('range', range)
  try {
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${env.SHOP_PLATFORM_SUMMARY_TOKEN}` },
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) return { ok: false, reason: 'unavailable', detail: `HTTP ${response.status}` }
    return { ok: true, data: (await response.json()) as ShopPlatformStats }
  } catch (error) {
    return { ok: false, reason: 'unavailable', detail: error instanceof Error ? error.message : 'unknown' }
  }
}
