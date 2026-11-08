import { Color, Fog, Group, PerspectiveCamera, Scene, type Mesh, type PlaneGeometry, type ShaderMaterial } from 'three'
import { createBackdrop } from '../engine/backdrop'
import { disposeTree } from '../engine/dispose'
import { damp, ease } from '../engine/math'
import type { Particles } from '../engine/particles'
import type { BloomSettings, Look } from '../engine/post'
import type { BackgroundScene, ScrollChannel, StageContext } from '../engine/types'

export const CLEAR_COLOR = new Color(0x030402)

export interface UseCaseOptions {
  fov: number
  near: number
  far: number
  fog: { near: number; far: number } | null
  /** 0 hides the plum glow behind the scene (plain near-black). */
  backdrop: number
  /** Mouse rotation strength in radians. */
  camStrength: number
  /** Scroll easing per 60fps frame. */
  scrollEasing: number
}

/**
 * Shared behaviour of the three use-case scenes: a camera on a rig that the
 * mouse tilts, a 3s camera intro once the page is ready, the hero's scroll
 * progress, dust particles and the backdrop glow. Subclasses add their
 * objects and say how intro and scroll move the camera.
 */
export abstract class UseCaseScene implements BackgroundScene {
  readonly scene = new Scene()
  readonly camera: PerspectiveCamera
  readonly bloom: BloomSettings = { enabled: false, strength: 0, radius: 0, threshold: 1 }
  readonly reveal = null
  look: Look = { vignette: 0, edgeBlur: 0 }
  protected readonly rig = new Group()
  protected readonly intro = { value: 0 }
  protected scrollTarget = 0
  protected scroll = 0
  protected mouseX = 0
  protected mouseY = 0
  protected particles: Particles | null = null
  protected readonly backdrop: Mesh<PlaneGeometry, ShaderMaterial>
  private started = false

  constructor(
    protected readonly ctx: StageContext,
    protected readonly options: UseCaseOptions,
  ) {
    this.camera = new PerspectiveCamera(options.fov, 1, options.near, options.far)
    this.rig.add(this.camera)
    this.scene.add(this.rig)
    this.backdrop = createBackdrop(CLEAR_COLOR, options.backdrop)
    this.scene.add(this.backdrop)
    if (options.fog) this.scene.fog = new Fog(CLEAR_COLOR.clone(), options.fog.near, options.fog.far)
  }

  /** Moves the fog with the camera when a scene pulls back for a narrow screen. */
  protected scaleFog(factor: number): void {
    const { fog } = this.options
    if (!fog || !(this.scene.fog instanceof Fog)) return
    this.scene.fog.near = fog.near * factor
    this.scene.fog.far = fog.far * factor
  }

  enter(): void {
    if (this.started) return
    this.started = true
    this.ctx.tweens.to(this.intro, 'value', { from: 0, to: 1, duration: 3, ease: ease.power4InOut })
  }

  leave(): void {
    this.started = false
    this.ctx.tweens.kill(this.intro)
    this.intro.value = 0
  }

  settle(): void {
    this.ctx.tweens.kill(this.intro)
    this.intro.value = 1
    this.scroll = this.scrollTarget
  }

  onScroll(channel: ScrollChannel, progress: number): void {
    if (channel === 'useCaseHero') this.scrollTarget = progress
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height)
    this.camera.updateProjectionMatrix()
    this.particles?.setViewport(height * this.ctx.renderer.getPixelRatio())
  }

  update(delta: number, elapsed: number): void {
    const { pointer, quality } = this.ctx
    const active = this.ctx.pointerActive() && !quality.touch
    this.mouseX = damp(this.mouseX, active ? pointer.x * this.options.camStrength : 0, 0.01, delta)
    this.mouseY = damp(this.mouseY, active ? pointer.y * this.options.camStrength : 0, 0.01, delta)
    this.rig.rotation.set(this.mouseY, -this.mouseX, 0)
    this.scroll = damp(this.scroll, this.scrollTarget, this.options.scrollEasing, delta)
    const footer = document.querySelector('footer[data-background-canvas-inview]')
    const scroll = quality.touch || footer?.classList.contains('is-inview') ? 0 : this.scroll
    this.animate(delta, elapsed, scroll)
    this.particles?.update(elapsed)
  }

  /** Per-frame work: place the camera from `this.intro.value` and `scroll`, move the objects. */
  protected abstract animate(delta: number, elapsed: number, scroll: number): void

  dispose(): void {
    this.particles?.dispose()
    disposeTree(this.scene)
  }
}
