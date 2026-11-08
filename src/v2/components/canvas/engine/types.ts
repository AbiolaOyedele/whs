import type { Camera, Object3D, PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three'
import type { BloomSettings, Look, RevealState } from './post'
import type { Tweens } from './tween'

/** What the device can afford, decided once when the canvas starts. */
export interface Quality {
  /** Narrow screen (phones). */
  small: boolean
  /** 700–999px wide (small tablets, landscape phones). */
  medium: boolean
  /** Touch is the main input: no scroll-driven camera, no hover. */
  touch: boolean
  /** Particle counts are multiplied by this. */
  particleScale: number
  shadows: boolean
}

/** Shared bits every scene gets from the stage. */
export interface StageContext {
  renderer: WebGLRenderer
  quality: Quality
  tweens: Tweens
  /** Pointer in normalised device coordinates (-1 → 1), updated on pointermove. */
  pointer: Vector2
  /** True once the pointer has moved at least once (so we never react to a stale 0,0). */
  pointerActive: () => boolean
  /** Compiles shaders ahead without blocking, for content shown later (hidden objects included). */
  compile: (root: Object3D, camera: Camera) => Promise<void>
}

export type ScrollChannel = 'hero' | 'security' | 'useCaseHero' | 'footer'

/**
 * One background scene. The stage owns the renderer and post chain; a scene
 * owns its objects, camera and per-frame behaviour.
 */
export interface BackgroundScene {
  readonly scene: Scene
  /** The camera to render with this frame. */
  readonly camera: PerspectiveCamera
  readonly bloom: BloomSettings
  /** The release-of-hold reveal, when one is playing. */
  readonly reveal: RevealState | null
  /** Lens finish: darkened corners and soft, out-of-focus edges. */
  readonly look?: Look
  update(delta: number, elapsed: number): void
  resize(width: number, height: number): void
  /** The page has finished loading: play the camera intro. */
  enter(): void
  /** The scene is being hidden. */
  leave(): void
  /** Puts every animated value at rest, for a reduced-motion still frame. */
  settle(): void
  onScroll?(channel: ScrollChannel, progress: number): void
  onHold?(active: boolean): void
  /** The about page shows the home scene part-way down the tunnel. */
  setAbout?(about: boolean): void
  /** Shows normally hidden parts for one warm-up frame drawn under the black fade. */
  warm?(on: boolean): void
  dispose(): void
}
