import { BufferAttribute, BufferGeometry } from 'three'

export interface ArchOptions {
  /** Inner radius. */
  radius: number
  /** Size along the arch's axis (local z). */
  width: number
  /** Radial thickness. */
  thickness: number
  /** Start and end angle in radians, measured from local +x towards +y. */
  start: number
  end: number
  segments: number
}

/**
 * A band bent round an arc, like a slice cut from a pipe: inner and outer
 * faces, two rims and two end caps, each with its own flat normals. The arc
 * lies in the local xy plane and the band's width runs along local z.
 * `uv.y` runs 0 → 1 along the arc so shaders can sweep light along it.
 */
export function createArchGeometry({ radius, width, thickness, start, end, segments }: ArchOptions): BufferGeometry {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const halfWidth = width / 2
  const outer = radius + thickness

  const pushVertex = (x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, v: number) => {
    positions.push(x, y, z)
    normals.push(nx, ny, nz)
    uvs.push(u, v)
    return positions.length / 3 - 1
  }

  /** One face swept along the arc: two edges, each given as (radius, z) at every angle. */
  const sweep = (r0: number, z0: number, r1: number, z1: number, normalKind: 'in' | 'out' | 'front' | 'back') => {
    const base = positions.length / 3
    for (let i = 0; i <= segments; i++) {
      const v = i / segments
      const angle = start + (end - start) * v
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      let nx = 0
      let ny = 0
      let nz = 0
      if (normalKind === 'in') {
        nx = -cos
        ny = -sin
      } else if (normalKind === 'out') {
        nx = cos
        ny = sin
      } else {
        nz = normalKind === 'front' ? 1 : -1
      }
      pushVertex(cos * r0, sin * r0, z0, nx, ny, nz, 0, v)
      pushVertex(cos * r1, sin * r1, z1, nx, ny, nz, 1, v)
    }
    for (let i = 0; i < segments; i++) {
      const a = base + i * 2
      const b = a + 1
      const c = a + 2
      const d = a + 3
      if (normalKind === 'in' || normalKind === 'front') indices.push(a, b, c, b, d, c)
      else indices.push(a, c, b, b, c, d)
    }
  }

  sweep(radius, -halfWidth, radius, halfWidth, 'in')
  sweep(outer, -halfWidth, outer, halfWidth, 'out')
  sweep(radius, halfWidth, outer, halfWidth, 'front')
  sweep(radius, -halfWidth, outer, -halfWidth, 'back')

  const cap = (angle: number, flip: boolean) => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    // Tangent along increasing angle is (-sin, cos); the start cap faces backwards.
    const sign = flip ? 1 : -1
    const nx = -sin * sign
    const ny = cos * sign
    const v = flip ? 1 : 0
    const a = pushVertex(cos * radius, sin * radius, -halfWidth, nx, ny, 0, 0, v)
    const b = pushVertex(cos * outer, sin * outer, -halfWidth, nx, ny, 0, 1, v)
    const c = pushVertex(cos * radius, sin * radius, halfWidth, nx, ny, 0, 0, v)
    const d = pushVertex(cos * outer, sin * outer, halfWidth, nx, ny, 0, 1, v)
    if (flip) indices.push(a, c, b, b, c, d)
    else indices.push(a, b, c, b, d, c)
  }
  cap(start, false)
  cap(end, true)

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  return geometry
}

export interface StripOptions {
  radius: number
  /** Position across the band's width (local z). */
  z: number
  /** Strip width along z. */
  width: number
  start: number
  end: number
  segments: number
}

/** A thin flat strip lying on an arch's inner face, for the travelling light. */
export function createArcStripGeometry({ radius, z, width, start, end, segments }: StripOptions): BufferGeometry {
  const positions = new Float32Array((segments + 1) * 2 * 3)
  const uvs = new Float32Array((segments + 1) * 2 * 2)
  const indices: number[] = []
  for (let i = 0; i <= segments; i++) {
    const v = i / segments
    const angle = start + (end - start) * v
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    positions.set([x, y, z - width / 2, x, y, z + width / 2], i * 6)
    uvs.set([0, v, 1, v], i * 4)
    if (i < segments) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  return geometry
}
