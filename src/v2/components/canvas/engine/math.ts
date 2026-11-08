/** Small numeric helpers shared by the background scenes. Pure, no three.js. */

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

/** Maps `value` from [inMin, inMax] onto [outMin, outMax], clamped at both ends. */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (Math.abs(inMax - inMin) < 1e-6) return outMin
  return lerp(outMin, outMax, clamp((value - inMin) / (inMax - inMin), 0, 1))
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp((value - edge0) / Math.max(1e-6, edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Frame-rate independent version of `current += (target - current) * factor` tuned at 60fps. */
export function damp(current: number, target: number, factor: number, delta: number): number {
  return lerp(current, target, 1 - Math.pow(1 - factor, delta * 60))
}

/** Deterministic pseudo-random numbers, so every visit builds the same scene. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Ease = (t: number) => number

export const ease = {
  linear: (t: number) => t,
  power2Out: (t: number) => 1 - Math.pow(1 - t, 2),
  power2InOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  power4Out: (t: number) => 1 - Math.pow(1 - t, 4),
  power4InOut: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
} satisfies Record<string, Ease>
