/**
 * Geometry for the hex-dot map of Nigeria drawn by MapCard: a rough outline
 * of the country, a hex lattice laid over a 707×600 box (the reference's map
 * size) and helpers to place cities and pick the cells around them.
 */

export const MAP_WIDTH = 707
export const MAP_HEIGHT = 600

/** Lattice spacing, matching the reference's dot map. */
const COL = 5.67
const ROW = 6.54
/** A flat-topped hex around (0, 0). */
export const HEX_POINTS: readonly (readonly [number, number])[] = [
  [-1.498, 2.606],
  [1.498, 2.606],
  [3.018, 0],
  [1.498, -2.606],
  [-1.498, -2.606],
  [-3.018, 0],
]
export const HEX_PATH = `M${HEX_POINTS.map(([x, y]) => `${x},${y}`).join('L')}Z`

/** Longitude and latitude of the box edges, and pixels per degree. */
const WEST = 2.6
const NORTH = 14
const SCALE = 51
const PAD_X = (MAP_WIDTH - 12.2 * SCALE) / 2
const PAD_Y = (MAP_HEIGHT - 9.8 * SCALE) / 2

/** Nigeria's border, simplified, as [longitude, latitude], clockwise from Badagry. */
const BORDER: readonly (readonly [number, number])[] = [
  [2.7, 6.37], [2.75, 7.0], [2.78, 7.9], [2.72, 8.5], [2.77, 9.05], [3.1, 9.45], [3.35, 9.85], [3.6, 10.3],
  [3.75, 10.75], [3.58, 11.1], [3.62, 11.7], [3.65, 12.3], [3.95, 12.75], [4.1, 13.3], [4.25, 13.5],
  [4.95, 13.75], [5.55, 13.9], [6.2, 13.65], [6.75, 13.15], [7.4, 13.1], [7.85, 13.35], [8.5, 13.05],
  [9.0, 12.85], [9.6, 12.8], [10.15, 13.25], [10.7, 13.35], [11.4, 13.37], [12.1, 13.1], [12.5, 13.1],
  [12.9, 13.5], [13.35, 13.7], [13.65, 13.7], [14.1, 13.08], [14.2, 12.45], [14.55, 12.2], [14.6, 11.5],
  [14.15, 11.2], [13.85, 10.95], [13.55, 10.6], [13.25, 10.1], [13.15, 9.55], [12.9, 9.3], [12.75, 8.75],
  [12.4, 8.55], [12.2, 8.1], [12.05, 7.6], [11.85, 7.1], [11.55, 6.85], [11.1, 6.45], [10.85, 6.85],
  [10.55, 7.05], [10.2, 6.9], [9.8, 6.7], [9.45, 6.4], [9.2, 6.05], [8.85, 5.75], [8.82, 5.3], [8.6, 4.85],
  [8.55, 4.55], [8.25, 4.55], [7.75, 4.45], [7.1, 4.4], [6.6, 4.3], [6.1, 4.27], [5.75, 4.4], [5.45, 4.85],
  [5.3, 5.3], [5.05, 5.65], [4.75, 6.05], [4.45, 6.3], [4.0, 6.4], [3.5, 6.42], [3.1, 6.39],
]

/** Cities a map can mark, as [longitude, latitude]. */
export const NIGERIA_CITIES = {
  Abuja: [7.49, 9.06],
  Benin: [5.63, 6.34],
  Calabar: [8.32, 4.96],
  Enugu: [7.49, 6.44],
  Ibadan: [3.93, 7.38],
  Ilorin: [4.55, 8.5],
  Jos: [8.89, 9.9],
  Kaduna: [7.44, 10.52],
  Kano: [8.52, 12.0],
  Lagos: [3.38, 6.52],
  Maiduguri: [13.16, 11.83],
  'Port Harcourt': [7.01, 4.82],
  Sokoto: [5.24, 13.06],
} as const satisfies Record<string, readonly [number, number]>

export type NigeriaCity = keyof typeof NIGERIA_CITIES

/** Longitude/latitude to a point in the 707×600 box. */
function project(lon: number, lat: number): [number, number] {
  return [PAD_X + (lon - WEST) * SCALE, PAD_Y + (NORTH - lat) * SCALE]
}

/** A city's spot on the map, in percent across and down, for MapCard's points. */
export function nigeriaCityPoint(city: NigeriaCity, label: string = city): { x: number; y: number; label: string } {
  const [lon, lat] = NIGERIA_CITIES[city]
  const [x, y] = project(lon, lat)
  return { x: (x / MAP_WIDTH) * 100, y: (y / MAP_HEIGHT) * 100, label }
}

/* ── lattice ──────────────────────────────────────────────────────── */

export interface Cell {
  q: number
  r: number
  x: number
  y: number
}

const OUTLINE = BORDER.map(([lon, lat]) => project(lon, lat))

function inside(x: number, y: number): boolean {
  let hit = false
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const a = OUTLINE[i]
    const b = OUTLINE[j]
    if (!a || !b) continue
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) hit = !hit
  }
  return hit
}

export function cellAt(q: number, r: number): Cell {
  return { q, r, x: q * COL + COL / 2, y: r * ROW + (q % 2 === 0 ? 0 : ROW / 2) + ROW / 2 }
}

let landCache: Cell[] | null = null

/** Every lattice cell whose centre falls inside the border. */
export function landCells(): Cell[] {
  if (landCache) return landCache
  const cells: Cell[] = []
  const cols = Math.floor(MAP_WIDTH / COL)
  const rows = Math.floor(MAP_HEIGHT / ROW)
  for (let q = 0; q < cols; q++) {
    for (let r = 0; r < rows; r++) {
      const cell = cellAt(q, r)
      if (inside(cell.x, cell.y)) cells.push(cell)
    }
  }
  landCache = cells
  return cells
}

/** Hex distance between two lattice cells (odd columns shifted down). */
function hexDistance(a: Cell, b: Cell): number {
  const cube = (c: Cell) => {
    const x = c.q
    const z = c.r - (c.q - (c.q & 1)) / 2
    return [x, -x - z, z] as const
  }
  const [ax, ay, az] = cube(a)
  const [bx, by, bz] = cube(b)
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by), Math.abs(az - bz))
}

export interface BurstCell extends Cell {
  /** 0 at the centre, 3 on the faint outer ring. */
  ring: number
}

/** The 37 cells of a burst: the cell nearest (x, y) and three rings around it. */
export function burstCells(x: number, y: number): BurstCell[] {
  const q = Math.round((x - COL / 2) / COL)
  const r = Math.round((y - ROW / 2 - (q % 2 === 0 ? 0 : ROW / 2)) / ROW)
  const centre = cellAt(q, r)
  const cells: BurstCell[] = []
  for (let dq = -3; dq <= 3; dq++) {
    for (let dr = -4; dr <= 4; dr++) {
      const cell = cellAt(q + dq, r + dr)
      const ring = hexDistance(centre, cell)
      if (ring <= 3) cells.push({ ...cell, ring })
    }
  }
  return cells
}
