import { NoToneMapping, SRGBColorSpace, Vector2, WebGLRenderer } from 'three'
import { CANVAS_EVENTS, type ProgressDetail, type SceneName } from '@v2/lib/canvas-events'
import { CANVAS_READY_EVENT, PAGE_CLASS, READY_EVENT } from '@v2/lib/page-state'
import { ease } from './math'
import { ALL_STAGES, type Look, Post, type Stages } from './post'
import { Tweens } from './tween'
import type { BackgroundScene, Quality, ScrollChannel, StageContext } from './types'

export type SceneFactory = (name: SceneName, ctx: StageContext) => BackgroundScene

/** Elements whose presence on screen means the background is visible. */
const INVIEW_SELECTOR = [
  '[data-background-canvas-inview]',
  `[data-scroll-event-progress="${CANVAS_EVENTS.heroHomeProgress}"]`,
  `[data-scroll-event-progress="${CANVAS_EVENTS.securityProgress}"]`,
  `[data-scroll-event-progress="${CANVAS_EVENTS.heroUseCaseProgress}"]`,
].join(',')

/** On /about the reference draws the scene inside the hero card, pinned while the card closes in. */
const ABOUT_MOUNT_SELECTOR = '[data-hero-about-canvas]'

const SCROLL_EVENTS: readonly [string, ScrollChannel][] = [
  [CANVAS_EVENTS.heroHomeProgress, 'hero'],
  [CANVAS_EVENTS.securityProgress, 'security'],
  [CANVAS_EVENTS.heroUseCaseProgress, 'useCaseHero'],
  [CANVAS_EVENTS.footerProgress, 'footer'],
]

const NO_LOOK: Look = { vignette: 0, edgeBlur: 0 }

const WARM_STEPS: readonly Stages[] = [
  { scene: true, reveal: false, bloom: false, output: false },
  { scene: false, reveal: true, bloom: false, output: false },
  { scene: false, reveal: false, bloom: true, output: false },
  { scene: false, reveal: false, bloom: false, output: true },
]

const SCENES: readonly SceneName[] = ['home', 'fashion', 'beauty', 'home-and-living']

function isSceneName(value: string | undefined): value is SceneName {
  return SCENES.some((name) => name === value)
}

function readQuality(): Quality {
  const width = window.innerWidth
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches
  const small = width < 700 || (touch && Math.min(window.screen.width, window.screen.height) < 700)
  return {
    small,
    medium: !small && width < 1000,
    touch,
    particleScale: small ? 0.6 : touch ? 0.8 : 1,
    shadows: !small,
  }
}

export interface StageOptions {
  /** The element the canvas normally lives in (fixed, full screen). */
  host: HTMLElement
  reducedMotion: boolean
  createScene: SceneFactory
  /** Called once the first frame of the first scene is on screen. */
  onFirstFrame: () => void
}

/**
 * Owns the WebGL renderer behind every page: picks the scene from
 * `<html data-scene>`, forwards scroll / hold events, fades through black
 * between scenes and route changes, and only renders while a dark part of
 * the page that shows it is on screen.
 */
export class Stage {
  readonly canvas: HTMLCanvasElement
  private readonly renderer: WebGLRenderer
  private readonly post: Post
  private readonly tweens = new Tweens()
  private readonly pointer = new Vector2()
  private pointerMoved = false
  private readonly quality: Quality
  private readonly ctx: StageContext
  private readonly scenes = new Map<SceneName, BackgroundScene>()
  private readonly compiled = new WeakSet<BackgroundScene>()
  private passesReady: Promise<void> = Promise.resolve()
  private active: BackgroundScene | null = null
  private activeName: SceneName | null = null
  private readonly fade = { value: 1 }
  private readonly inview = new Set<Element>()
  private observer: IntersectionObserver | null = null
  private htmlObserver: MutationObserver | null = null
  private frame: number | null = null
  private lastTime = 0
  private elapsed = 0
  private needsFrame = true
  private firstFrameDone = false
  private disposed = false
  private width = 1
  private height = 1
  private wasLeaving = false
  private frameSamples = 0
  private adaptAfter = Infinity
  private warmStep = 0
  private readonly warmed = new WeakSet<BackgroundScene>()
  private resizeFrame: number | null = null
  private frameTime = 0

  constructor(private readonly options: StageOptions) {
    this.quality = readQuality()
    this.renderer = new WebGLRenderer({
      antialias: false,
      alpha: false,
      stencil: false,
      powerPreference: 'high-performance',
    })
    this.renderer.toneMapping = NoToneMapping
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.setClearColor(0x050003, 1)
    this.renderer.shadowMap.enabled = this.quality.shadows
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality.small ? 1 : 1.25))
    this.canvas = this.renderer.domElement
    this.canvas.setAttribute('aria-hidden', 'true')
    this.canvas.dataset.engine = 'three.js'
    this.post = new Post(this.renderer, this.quality.small ? 0 : 2)
    this.ctx = {
      renderer: this.renderer,
      quality: this.quality,
      tweens: this.tweens,
      pointer: this.pointer,
      pointerActive: () => this.pointerMoved,
      compile: (root, camera) => this.post.compile(root, camera),
    }
    this.passesReady = this.post.warmPasses().catch(() => undefined)
    options.host.appendChild(this.canvas)
    this.resize()
    this.bindEvents()
    this.switchScene(this.sceneFromDocument())
    this.syncTemplate()
    this.refreshInview()
    this.wake()
  }

  /* ── events ───────────────────────────────────────────────── */

  private bindEvents(): void {
    for (const [name] of SCROLL_EVENTS) window.addEventListener(name, this.onScrollEvent)
    window.addEventListener(CANVAS_EVENTS.holdStart, this.onHoldStart)
    window.addEventListener(CANVAS_EVENTS.holdEnd, this.onHoldEnd)
    window.addEventListener(CANVAS_EVENTS.aboutOverviewProgress, this.onAboutOverview)
    window.addEventListener(READY_EVENT, this.onPageReady)
    window.addEventListener('pointermove', this.onPointerMove, { passive: true })
    window.addEventListener('resize', this.onResize)
    document.addEventListener('visibilitychange', this.onVisibility)
    this.canvas.addEventListener('webglcontextlost', this.onContextLost)
    this.htmlObserver = new MutationObserver(this.onHtmlChange)
    this.htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-scene', 'data-template'],
    })
  }

  private unbindEvents(): void {
    for (const [name] of SCROLL_EVENTS) window.removeEventListener(name, this.onScrollEvent)
    window.removeEventListener(CANVAS_EVENTS.holdStart, this.onHoldStart)
    window.removeEventListener(CANVAS_EVENTS.holdEnd, this.onHoldEnd)
    window.removeEventListener(CANVAS_EVENTS.aboutOverviewProgress, this.onAboutOverview)
    window.removeEventListener(READY_EVENT, this.onPageReady)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    this.htmlObserver?.disconnect()
    this.observer?.disconnect()
  }

  private onScrollEvent = (event: Event): void => {
    const entry = SCROLL_EVENTS.find(([name]) => name === event.type)
    if (!entry || !(event instanceof CustomEvent)) return
    const detail = event.detail as Partial<ProgressDetail> | null
    const progress = typeof detail?.progress === 'number' ? detail.progress : 0
    this.active?.onScroll?.(entry[1], progress)
    if (this.options.reducedMotion) this.requestFrame()
  }

  private onHoldStart = (): void => {
    if (this.options.reducedMotion) return
    this.active?.onHold?.(true)
    this.wake()
  }

  private onHoldEnd = (): void => {
    if (this.options.reducedMotion) return
    this.active?.onHold?.(false)
    this.wake()
  }

  private onAboutOverview = (event: Event): void => {
    if (!(event instanceof CustomEvent)) return
    const detail = event.detail as Partial<ProgressDetail> | null
    const progress = typeof detail?.progress === 'number' ? detail.progress : 0
    this.placeCanvas(progress < 0.5)
  }

  private onPageReady = (): void => {
    this.syncTemplate()
    this.refreshInview()
    if (this.active) this.enterScene(this.active)
    if (this.active && this.fade.value > 0) this.fadeFromBlack(0)
    this.requestFrame()
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return
    this.pointerMoved = true
    this.pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
  }

  /** Resizes at most once per frame, from window sizes (no layout reads). */
  private onResize = (): void => {
    if (this.resizeFrame !== null) return
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = null
      // Phones resize the viewport as the address bar slides; ignore small height-only changes.
      const sameWidth = window.innerWidth === this.width
      if (this.quality.touch && sameWidth && Math.abs(window.innerHeight - this.height) < 160) return
      this.resize()
      this.requestFrame()
    })
  }

  private onVisibility = (): void => {
    if (document.hidden) {
      this.sleep()
      return
    }
    if (this.firstFrameDone) this.adaptAfter = performance.now() + 1000
    this.wake()
  }

  private onContextLost = (event: Event): void => {
    event.preventDefault()
    this.sleep()
  }

  private onHtmlChange = (mutations: MutationRecord[]): void => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-scene') this.switchScene(this.sceneFromDocument())
      if (mutation.attributeName === 'data-template') this.syncTemplate()
    }
    const root = document.documentElement
    const leaving = root.classList.contains(PAGE_CLASS.leaving) || root.classList.contains(PAGE_CLASS.changing)
    if (leaving && !this.wasLeaving) {
      this.active?.onHold?.(false)
      this.tweens.to(this.fade, 'value', { to: 1, duration: 0.2, ease: ease.power2Out })
      this.wake()
    }
    this.wasLeaving = leaving
  }

  /* ── scenes ───────────────────────────────────────────────── */

  private sceneFromDocument(): SceneName {
    const value = document.documentElement.dataset.scene
    return isSceneName(value) ? value : 'home'
  }

  private switchScene(name: SceneName): void {
    if (name === this.activeName) return
    this.active?.leave()
    let scene = this.scenes.get(name)
    if (!scene) {
      scene = this.options.createScene(name, this.ctx)
      scene.resize(this.width, this.height)
      this.scenes.set(name, scene)
      this.compile(scene)
    }
    this.active = scene
    this.activeName = name
    this.warmStep = 0
    this.syncTemplate()
    if (this.options.reducedMotion) scene.settle()
    this.fade.value = 1
    this.tweens.kill(this.fade)
    if (document.documentElement.classList.contains(PAGE_CLASS.ready)) {
      this.enterScene(scene)
      this.fadeFromBlack(0.1)
    }
    this.requestFrame()
  }

  /** Plays the scene's camera intro, or jumps straight to its end with reduced motion. */
  private enterScene(scene: BackgroundScene): void {
    if (this.options.reducedMotion) scene.settle()
    else scene.enter()
  }

  /**
   * Compiles the scene's shaders off the main thread where the browser
   * allows it (KHR_parallel_shader_compile), so starting up never freezes
   * the page; the scene is drawn once its programs are ready.
   */
  private compile(scene: BackgroundScene): void {
    const done = () => {
      this.compiled.add(scene)
      this.requestFrame()
    }
    Promise.all([this.post.compile(scene.scene, scene.camera), this.passesReady]).then(done, done)
  }


  private fadeFromBlack(delay: number): void {
    if (this.options.reducedMotion) {
      this.fade.value = 0
      return
    }
    this.tweens.to(this.fade, 'value', { to: 0, delay, duration: 2, ease: ease.power2Out })
    this.wake()
  }

  private syncTemplate(): void {
    const about = document.documentElement.dataset.template === 'about'
    this.scenes.get('home')?.setAbout?.(about)
    this.placeCanvas(about)
  }

  /** Moves the canvas into the about hero card while it is on screen, and back to the fixed host otherwise. */
  private placeCanvas(inAboutHero: boolean): void {
    const onAbout = document.documentElement.dataset.template === 'about'
    const mount = inAboutHero && onAbout ? document.querySelector<HTMLElement>(ABOUT_MOUNT_SELECTOR) : null
    const parent = mount ?? this.options.host
    if (this.canvas.parentElement === parent) return
    parent.appendChild(this.canvas)
    this.requestFrame()
  }

  /* ── visibility ───────────────────────────────────────────── */

  private refreshInview(): void {
    this.observer?.disconnect()
    this.inview.clear()
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) this.inview.add(entry.target)
        else this.inview.delete(entry.target)
      }
      this.wake()
    })
    document.querySelectorAll(INVIEW_SELECTOR).forEach((element) => this.observer?.observe(element))
  }

  private get visible(): boolean {
    return this.inview.size > 0
  }

  /* ── loop ─────────────────────────────────────────────────── */

  private requestFrame(): void {
    this.needsFrame = true
    this.wake()
  }

  private wake(): void {
    if (this.disposed || this.frame !== null || document.hidden) return
    this.lastTime = performance.now()
    this.frame = requestAnimationFrame(this.tick)
  }

  private sleep(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.frame = null
  }

  private tick = (now: number): void => {
    this.frame = null
    if (this.disposed) return
    const rawDelta = Math.max(0, (now - this.lastTime) / 1000)
    const delta = Math.min(0.05, rawDelta)
    this.lastTime = now
    const animate = !this.options.reducedMotion && this.visible
    const ready = this.active !== null && this.compiled.has(this.active)
    const render = ready && (animate || this.needsFrame || !this.firstFrameDone)

    if (!this.options.reducedMotion) this.tweens.update(delta)
    if (render && this.active && !this.warmed.has(this.active)) {
      // Before the first visible frame, touch each pass once, one per frame, under the
      // loader: GPUs set up pipelines on first use, and doing it all at once is a long stall.
      const scene = this.active
      const stages = WARM_STEPS[this.warmStep] ?? ALL_STAGES
      scene.warm?.(true)
      const warmReveal = { camera: scene.camera, radius: 0.5, strength: 1 }
      this.post.render(scene.scene, scene.camera, scene.bloom, 1, warmReveal, this.elapsed, scene.look ?? NO_LOOK, stages)
      scene.warm?.(false)
      this.warmStep += 1
      if (this.warmStep >= WARM_STEPS.length) {
        this.warmed.add(scene)
        this.warmStep = 0
      }
      this.needsFrame = true
    } else if (render && this.active) {
      if (animate) {
        this.elapsed += delta
        this.adaptResolution(rawDelta)
      }
      this.active.update(animate ? delta : 0, this.elapsed)
      const scene = this.active
      this.post.render(scene.scene, scene.camera, scene.bloom, this.fade.value, scene.reveal, this.elapsed, scene.look ?? NO_LOOK)
      this.needsFrame = false
      if (!this.firstFrameDone) {
        this.firstFrameDone = true
        this.adaptAfter = performance.now() + 4000
        this.options.onFirstFrame()
        window.dispatchEvent(new CustomEvent(CANVAS_READY_EVENT))
        if (document.documentElement.classList.contains(PAGE_CLASS.ready)) this.enterScene(this.active)
        this.fadeFromBlack(0.1)
        if (this.options.reducedMotion) this.needsFrame = true
      }
    }

    // Something in this frame (a fade, an observer) may already have asked for the next one.
    if (this.frame === null && (animate || this.tweens.active || this.needsFrame)) {
      this.frame = requestAnimationFrame(this.tick)
    }
  }

  /**
   * If the GPU cannot keep up (average frame over ~22ms for 1.5s), draw at a
   * lower pixel ratio. Only ever steps down, so it never oscillates.
   */
  private adaptResolution(rawDelta: number): void {
    // Ignore start-up (shader compiles, page load) and long gaps (tab switches).
    if (rawDelta > 0.1 || performance.now() < this.adaptAfter) {
      this.frameSamples = 0
      this.frameTime = 0
      return
    }
    this.frameSamples += 1
    this.frameTime += rawDelta
    if (this.frameSamples < 90) return
    const average = this.frameTime / this.frameSamples
    this.frameSamples = 0
    this.frameTime = 0
    const current = this.renderer.getPixelRatio()
    const floor = this.quality.small ? 0.75 : 1
    if (average > 0.022 && current > floor) {
      this.renderer.setPixelRatio(Math.max(floor, current - 0.25))
      this.resize()
    }
  }

  private resize(): void {
    // The host is fixed to the viewport, so the window size is its size.
    this.width = Math.max(1, window.innerWidth)
    this.height = Math.max(1, window.innerHeight)
    const pixelRatio = this.renderer.getPixelRatio()
    this.renderer.setSize(this.width, this.height, false)
    this.post.setSize(this.width, this.height, pixelRatio)
    for (const scene of this.scenes.values()) scene.resize(this.width, this.height)
  }

  dispose(): void {
    this.disposed = true
    this.sleep()
    if (this.resizeFrame !== null) cancelAnimationFrame(this.resizeFrame)
    this.unbindEvents()
    this.tweens.clear()
    for (const scene of this.scenes.values()) scene.dispose()
    this.scenes.clear()
    this.post.dispose()
    this.renderer.dispose()
    this.canvas.remove()
  }
}
