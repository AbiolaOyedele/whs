/**
 * Amber (amber.whstd.com): the team banner tool. Its tables live in the `amber`
 * schema of the shared Supabase project; this admin manages accounts and the
 * heading bank, and reads usage counts.
 */

export const AMBER_TEMPLATES = [
  'spotlight',
  'split',
  'plate',
  'pair',
  'feature',
  'trio',
  'quad',
] as const
export type AmberTemplate = (typeof AMBER_TEMPLATES)[number]

export const AMBER_TEMPLATE_LABELS: Record<AmberTemplate, string> = {
  spotlight: 'Spotlight',
  split: 'Split',
  plate: 'Plate',
  pair: 'Pair',
  feature: 'Feature + Inset',
  trio: 'Trio',
  quad: 'Quad',
}

/** A team account as the admin sees it. The PIN hash never leaves the server. */
export interface AmberUser {
  id: string
  username: string
  displayName: string | null
  isActive: boolean
  lockedUntil: string | null
  lastLoginAt: string | null
  createdAt: string
  bannersMade: number
}

export interface AmberHeadline {
  id: string
  text: string
  position: number
  isActive: boolean
}

export type AmberRange = '7d' | '30d' | '90d' | 'all'

export interface AmberStats {
  range: AmberRange
  banners: number
  bannersAllTime: number
  activePeople: number
  accounts: number
  byTemplate: Array<{ template: AmberTemplate; count: number }>
  perDay: Array<{ day: string; count: number }>
  byWeekday: Array<{ label: string; value: number }>
}
