/**
 * Command Center: one hub for every product on the studio's infrastructure (the shop platform
 * included, read from its own summary endpoint),
 * plus the combined, cross-product picture.
 *
 * This is orchestration only — it opens no connection of its own. It just
 * runs each product's existing, already-aggregated, already privacy-safe
 * fetch function in parallel and reshapes the results. Nothing here ever
 * sees a row Rayo, Dory, Planes, Amber or Marque didn't already decide was safe to
 * surface in their own panel.
 *
 * The shared range is the intersection of what all five products support:
 * Amber has no `24h` bucket, so Command Center doesn't offer one either —
 * better that than a window that silently means something different for one
 * card than for the other four.
 */
import { fetchDoryStats } from './dory-stats'
import { fetchRayoStats } from './rayo-stats'
import { fetchPlanesStats } from './planes-stats'
import { loadAmber } from './amber'
import { fetchMarqueStats } from './marque-stats'
import { fetchShopPlatformStats, SHOP_PLATFORM_FALLBACK_NAME } from './shop-platform-stats'

export type CommandCenterRange = '7d' | '30d' | '90d' | 'all'

export const COMMAND_CENTER_RANGE_LABELS: Record<CommandCenterRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

export function parseCommandCenterRange(value: string | null): CommandCenterRange {
  return value === '7d' || value === '30d' || value === '90d' || value === 'all' ? value : '30d'
}

type AppId = 'rayo' | 'dory' | 'planes' | 'amber' | 'marque' | 'shops'

export interface AppCard {
  id: AppId
  name: string
  blurb: string
  /** This studio's own detailed analytics page for the product. */
  href: string
  /** The product itself, for the team member who wants to look around. */
  liveHref: string
  status:
    | { ok: true; accountsTotal: number; activeLast30d: number; newInRange: number }
    | { ok: false; reason: string }
}

export interface CommandCenterData {
  range: CommandCenterRange
  apps: AppCard[]
  combined: {
    accountsTotal: number
    activeLast30d: number
    newInRange: number
    accountsByProduct: Array<{ label: string; value: number }>
    activeByProduct: Array<{ label: string; value: number }>
  }
}

/** Ranked descending — this is a comparison, not a calendar. */
function ranked(rows: Array<{ label: string; value: number }>): Array<{ label: string; value: number }> {
  return [...rows].sort((a, b) => b.value - a.value)
}

export async function loadCommandCenter(range: CommandCenterRange): Promise<CommandCenterData> {
  const [rayo, dory, planes, amber, marque, shops] = await Promise.all([
    fetchRayoStats(range),
    fetchDoryStats(range),
    fetchPlanesStats(range),
    loadAmber(range),
    fetchMarqueStats(range),
    fetchShopPlatformStats(range),
  ])

  const apps: AppCard[] = [
    {
      id: 'rayo',
      name: 'Rayo',
      blurb: 'Quoting and invoicing for the studio’s client work.',
      href: '/admin/rayo',
      liveHref: 'https://rayo.whstd.com',
      status: rayo.ok
        ? {
            ok: true,
            accountsTotal: rayo.data.accounts.total,
            activeLast30d: rayo.data.accounts.activeLast30d,
            newInRange: rayo.data.accounts.newInRange,
          }
        : { ok: false, reason: rayo.reason },
    },
    {
      id: 'dory',
      name: 'Dory',
      blurb: 'Personal finance: budgets, spending, loans.',
      href: '/admin/dory',
      liveHref: 'https://dory.whstd.com',
      status: dory.ok
        ? {
            ok: true,
            accountsTotal: dory.data.accounts.total,
            activeLast30d: dory.data.accounts.activeLast30d,
            newInRange: dory.data.accounts.newInRange,
          }
        : { ok: false, reason: dory.reason },
    },
    {
      id: 'planes',
      name: 'Planes',
      blurb: 'Task planning, timers and passing work to a crew.',
      href: '/admin/planes',
      liveHref: 'https://planes.whstd.com',
      status: planes.ok
        ? {
            ok: true,
            accountsTotal: planes.data.accounts.total,
            activeLast30d: planes.data.accounts.activeLast30d,
            newInRange: planes.data.accounts.newInRange,
          }
        : { ok: false, reason: planes.reason },
    },
    {
      id: 'amber',
      name: 'Amber',
      blurb: 'The banner tool for Daash storefronts.',
      href: '/admin/amber',
      liveHref: 'https://amber.whstd.com',
      status: amber.ok
        ? {
            ok: true,
            accountsTotal: amber.data.stats.accounts,
            activeLast30d: amber.data.stats.activePeople,
            newInRange: amber.data.stats.banners,
          }
        : { ok: false, reason: amber.reason },
    },
    {
      id: 'marque',
      name: 'Marque',
      blurb: 'Brand guidelines, edited by people and their AI assistants.',
      href: '/admin/marque',
      liveHref: 'https://marque.whstd.com',
      status: marque.ok
        ? {
            ok: true,
            accountsTotal: marque.data.accounts.total,
            activeLast30d: marque.data.accounts.activeLast30d,
            newInRange: marque.data.accounts.newInRange,
          }
        : { ok: false, reason: marque.reason },
    },
    {
      id: 'shops',
      // The platform's name is still a placeholder, so it is read from the platform itself.
      name: shops.ok ? shops.data.product.name : SHOP_PLATFORM_FALLBACK_NAME,
      blurb: 'Online shops for Nigerian sellers: storefronts, orders and payments.',
      href: '/admin/shop-platform',
      liveHref: shops.ok ? shops.data.product.commandCenterUrl : '/admin/shop-platform',
      status: shops.ok
        ? {
            ok: true,
            accountsTotal: shops.data.accounts.total,
            activeLast30d: shops.data.accounts.activeLast30d,
            newInRange: shops.data.accounts.newInRange,
          }
        : { ok: false, reason: shops.reason },
    },
  ]

  const connected = apps.filter(
    (app): app is AppCard & { status: { ok: true; accountsTotal: number; activeLast30d: number; newInRange: number } } =>
      app.status.ok
  )

  const accountsByProduct = ranked(
    connected.map((app) => ({ label: app.name, value: app.status.accountsTotal }))
  )
  const activeByProduct = ranked(
    connected.map((app) => ({ label: app.name, value: app.status.activeLast30d }))
  )

  return {
    range,
    apps,
    combined: {
      accountsTotal: connected.reduce((sum, app) => sum + app.status.accountsTotal, 0),
      activeLast30d: connected.reduce((sum, app) => sum + app.status.activeLast30d, 0),
      newInRange: connected.reduce((sum, app) => sum + app.status.newInRange, 0),
      accountsByProduct,
      activeByProduct,
    },
  }
}
