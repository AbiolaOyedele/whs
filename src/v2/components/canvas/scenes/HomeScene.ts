import {
  BufferAttribute,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Euler,
  Fog,
  Group,
  HemisphereLight,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  PointLight,
  Quaternion,
  Raycaster,
  Scene,
  type ShaderMaterial,
  Vector3,
} from 'three'
import { createBackdrop } from '../engine/backdrop'
import { disposeTree } from '../engine/dispose'
import { createArcStripGeometry, createArchGeometry } from '../engine/geometry'
import { clamp, createRandom, damp, ease, lerp, mapRange, smoothstep } from '../engine/math'
import { Particles } from '../engine/particles'
import type { BloomSettings, RevealState } from '../engine/post'
import type { BackgroundScene, ScrollChannel, StageContext } from '../engine/types'
import { createPulseMaterial, createSpeckledMaterial, type PulseUniforms } from './home/materials'
import { SecurityView } from './home/security'
import { Streaks } from './home/streaks'

const CLEAR_COLOR = new Color(0x050003)
const RIBBON_COLOR = new Color(0.23, 0, 0.12)
const PATH_LIGHT_COLOR = new Color(0.99, 0.82, 1).multiplyScalar(0.9)
const FOV = 11.133
const FLIGHT_FOV = 26
/** Seconds of holding to fly the whole tunnel. */
const FLIGHT_SECONDS = 4.6
/** On release the flight rewinds this many seconds' worth. */
const REWIND_SECONDS = 1.5
const CAM_STRENGTH = 0.025
const CAM_STRENGTH_HOLD = 0.05
const CAM_EASING = 0.01
/** The about page holds a close, still view across the ribbons' broad faces. */
const ABOUT_FLIGHT = 0

/* Tunnel layout, in world units (the camera rests at the origin looking down -z). */
const TUNNEL_POSITION = new Vector3(0.18, -0.62, -4.3)
const TUNNEL_ROTATION = new Euler(0.25, -0.95, 0.15)
const ARCH_COUNT = 9
const ARCH_SPACING = 0.3
const ARCH_RADIUS = 0.62
const ARCH_WIDTH = 0.15
const ARCH_THICKNESS = 0.032

interface Arch {
  mesh: Mesh
  origin: Vector3
  phase: Vector3
  freq: Vector3
  lift: number
}

interface Circle {
  mesh: Mesh
  origin: Vector3
  phase: Vector3
  freq: Vector3
}

/**
 * The home scene: thick plum arches stacked into a tunnel, with light
 * running along them, dust in the air, and a slow mouse-driven camera.
 * Scrolling the hero lifts the camera away; holding the hero flies through
 * the tunnel; letting go rewinds with a chromatic fisheye reveal. Between the
 * hero and the end of the security section it shows the shield sphere.
 */
export class HomeScene implements BackgroundScene {
  private readonly tunnelScene = new Scene()
  private readonly rig = new Group()
  private readonly mainCamera = new PerspectiveCamera(FOV, 1, 0.02, 40)
  private readonly revealRig = new Group()
  private readonly revealCamera = new PerspectiveCamera(FOV, 1, 0.02, 40)
  private readonly tunnel = new Group()
  private readonly arches: Arch[] = []
  private readonly circles: Circle[] = []
  private readonly pulse: { material: ShaderMaterial; uniforms: PulseUniforms }
  private readonly particles: Particles
  private readonly streaks: Streaks
  private readonly fog = new Fog(CLEAR_COLOR.clone(), 3.5, 5)
  private readonly lights: { light: DirectionalLight | PointLight | HemisphereLight; intensity: number }[] = []
  /** Built when the hero starts scrolling away, so first load only pays for the ribbons. */
  private security: SecurityView | null = null
  private securityReady = false
  private readonly path: CatmullRomCurve3
  private readonly raycaster = new Raycaster()
  private readonly footer: () => HTMLElement | null

  private readonly state = {
    intro: 0,
    flight: 0,
    revealFlight: 0,
    holdCam: 0,
    lineOpacity: 0,
    particles: 1,
    revealRadius: 0,
    revealStrength: 0,
    sweep: -1,
  }
  /** Seconds until the next hero sweep at rest. */
  private nextSweep = 6
  private holding = false
  private rewinding = false
  private introPlayed = false
  private opened = false
  private pendingOpen = false
  private viewWidth = 1
  private viewHeight = 1
  private about = false
  private heroTarget = 0
  private heroEased = 0
  private securityTarget = 0
  private securityEased = 0
  private mouseX = 0
  private mouseY = 0
  private readonly revealState: RevealState

  private readonly tmpPosition = new Vector3()
  private readonly tmpLook = new Vector3()
  private readonly tmpQuat = new Quaternion()
  private readonly tmpMatrix = new Matrix4()
  private readonly up = new Vector3(0, 1, 0)

  constructor(private readonly ctx: StageContext) {
    this.footer = () => document.querySelector<HTMLElement>('footer[data-background-canvas-inview]')

    this.tunnelScene.fog = this.fog
    this.tunnelScene.add(createBackdrop(CLEAR_COLOR))
    this.rig.add(this.mainCamera)
    this.revealRig.add(this.revealCamera)
    this.tunnelScene.add(this.rig, this.revealRig)

    this.pulse = createPulseMaterial(PATH_LIGHT_COLOR)
    this.buildTunnel()
    this.buildLights()
    this.tunnelScene.add(this.tunnel)
    this.tunnel.updateMatrixWorld(true)
    this.path = this.buildPath()

    this.particles = new Particles({
      count: 60 * ctx.quality.particleScale,
      position: new Vector3(0.15, -0.05, -3.4),
      boxSize: new Vector3(2.2, 1.0, 6.5),
      color: new Color(0xff6fc8),
      size: 0.025,
      opacity: 0.35,
      sway: 0.012,
      swaySpeed: 1.23,
      lifeSpeed: 0.12,
      fadeIn: 0.3,
      fadeOut: 0.7,
      seed: 11,
    })
    this.tunnelScene.add(this.particles.points)

    this.streaks = new Streaks({
      count: ctx.quality.small ? 140 : 250,
      boxSize: new Vector3(0.95, 0.95, 4.5),
      wind: new Vector3(0, 0, 1),
      speed: 0.32,
      length: 0.5,
      width: 0.02,
      color: new Color(0xf5a1de),
      seed: 5,
    })
    this.streaks.mesh.position.set(0, 0, -(ARCH_COUNT * ARCH_SPACING) / 2)
    this.tunnel.add(this.streaks.mesh)


    this.revealState = { camera: this.revealCamera, radius: 0, strength: 0 }
    this.setFlightPose(this.mainCamera, 0)
    this.setFlightPose(this.revealCamera, 0)
  }

  /* ── building ─────────────────────────────────────────────── */

  private buildTunnel(): void {
    const random = createRandom(3)
    const material = createSpeckledMaterial(RIBBON_COLOR, CLEAR_COLOR)
    this.tunnel.position.copy(TUNNEL_POSITION)
    this.tunnel.rotation.copy(TUNNEL_ROTATION)

    for (let i = 0; i < ARCH_COUNT; i++) {
      const radius = ARCH_RADIUS * (0.88 + random() * 0.26)
      const width = ARCH_WIDTH * (0.6 + random() * 0.8)
      const start = -0.35 - random() * 0.4
      const end = Math.PI + 0.25 + random() * 0.5
      const geometry = createArchGeometry({ radius, width, thickness: ARCH_THICKNESS, start, end, segments: 120 })
      const mesh = new Mesh(geometry, material)
      const z = -i * ARCH_SPACING - (random() - 0.5) * 0.04
      mesh.position.set((random() - 0.5) * 0.08, (random() - 0.5) * 0.1, z)
      mesh.rotation.set((random() - 0.5) * 0.08, (random() - 0.5) * 0.08, (random() - 0.5) * 0.25)
      this.tunnel.add(mesh)

      const strips = random() > 0.3 ? 2 : 1
      for (let s = 0; s < strips; s++) {
        const stripGeometry = createArcStripGeometry({
          radius: radius - 0.0015,
          z: (s === 0 ? -0.28 : 0.3) * width,
          width: i < 2 ? 0.011 : 0.006,
          start,
          end,
          segments: 120,
        })
        const count = stripGeometry.getAttribute('position').count
        const params = new Float32Array(count * 3)
        const offset = random()
        const interval = random()
        const speed = 0.5 + random() * 0.5
        for (let v = 0; v < count; v++) params.set([offset, interval, speed], v * 3)
        stripGeometry.setAttribute('aParams', new BufferAttribute(params, 3))
        stripGeometry.setAttribute('aFront', new BufferAttribute(new Float32Array(count).fill(i < 2 ? 1 : 0), 1))
        const strip = new Mesh(stripGeometry, this.pulse.material)
        strip.renderOrder = 2
        mesh.add(strip)
      }

      this.arches.push({
        mesh,
        origin: mesh.position.clone(),
        phase: new Vector3(random() * Math.PI * 2, random() * Math.PI * 2, random() * Math.PI * 2),
        freq: new Vector3(0.8 + random() * 0.4, 0.8 + random() * 0.4, 0.8 + random() * 0.4),
        lift: 0,
      })
    }

    // Concentric rings at the far end, where the flight finishes.
    const endZ = -ARCH_COUNT * ARCH_SPACING - 0.32
    for (let i = 0; i < 6; i++) {
      const radius = 0.07 + i * 0.055
      const geometry = createArchGeometry({
        radius,
        width: 0.035,
        thickness: 0.018,
        start: 0,
        end: Math.PI * 2,
        segments: 140,
      })
      const mesh = new Mesh(geometry, material)
      mesh.position.set(0, 0, endZ - i * 0.02)
      this.tunnel.add(mesh)
      this.circles.push({
        mesh,
        origin: mesh.position.clone(),
        phase: new Vector3(random() * Math.PI * 2, random() * Math.PI * 2, random() * Math.PI * 2),
        freq: new Vector3(0.8 + random() * 0.4, 0.8 + random() * 0.4, 0.8 + random() * 0.4),
      })
    }
  }

  private buildLights(): void {
    const key = new DirectionalLight(new Color(1, 0.5, 0.97), 4.5)
    key.position.set(-3.2, 1.6, 1.2)
    const rim = new DirectionalLight(new Color(1, 0.75, 0.95), 2.2)
    rim.position.set(1.5, 2.5, -1)
    const glow = new PointLight(new Color(1, 0.55, 0.9), 2.4, 3.5, 2)
    glow.position.set(-0.2, 0.1, -3.2)
    const sky = new HemisphereLight(new Color(0.5, 0.2, 0.45), new Color(0.02, 0, 0.02), 0.6)
    this.tunnelScene.add(key, rim, glow, sky)
    this.lights.push({ light: key, intensity: 4.5 }, { light: rim, intensity: 2.2 }, { light: glow, intensity: 2.4 }, { light: sky, intensity: 0.6 })
  }

  /** The hold flight: from the resting camera, in through the mouth, down the tunnel to the rings. */
  private buildPath(): CatmullRomCurve3 {
    const local = [
      new Vector3(-0.28, 0.32, 0.75),
      new Vector3(-0.06, 0.24, 0.12),
      new Vector3(0.02, 0.2, -0.45),
      new Vector3(-0.03, 0.15, -1.0),
      new Vector3(0.02, 0.09, -1.45),
      new Vector3(0, 0.02, -ARCH_COUNT * ARCH_SPACING + 0.05),
    ]
    const points = [new Vector3(0, 0, 0), ...local.map((point) => this.tunnel.localToWorld(point.clone()))]
    return new CatmullRomCurve3(points, false, 'centripetal')
  }

  /* ── camera ───────────────────────────────────────────────── */

  private readonly aboutPosition = new Vector3(0.3, -0.75, -2.9)
  private readonly aboutTarget = new Vector3(0.1, -0.1, -4.6)

  private setFlightPose(camera: PerspectiveCamera, flight: number): void {
    if (this.about && flight <= 0.0001) {
      camera.position.copy(this.aboutPosition)
      this.tmpMatrix.lookAt(this.aboutPosition, this.aboutTarget, this.up)
      camera.quaternion.setFromRotationMatrix(this.tmpMatrix)
      return
    }
    if (flight <= 0.0001) {
      camera.position.set(0, 0, 0)
      camera.quaternion.identity()
      if (camera.fov !== FOV) {
        camera.fov = FOV
        camera.updateProjectionMatrix()
      }
      return
    }
    const u = ease.power2InOut(clamp(flight, 0, 1))
    this.path.getPointAt(u, this.tmpPosition)
    this.path.getPointAt(Math.min(1, u + 0.05), this.tmpLook)
    if (u > 0.95) {
      const endLook = this.tunnel.localToWorld(new Vector3(0, 0, -ARCH_COUNT * ARCH_SPACING - 0.6))
      this.tmpLook.lerp(endLook, smoothstep(0.95, 1, u))
    }
    this.tmpMatrix.lookAt(this.tmpPosition, this.tmpLook, this.up)
    this.tmpQuat.setFromRotationMatrix(this.tmpMatrix)
    camera.position.copy(this.tmpPosition)
    camera.quaternion.identity().slerp(this.tmpQuat, smoothstep(0, 0.18, flight))
    const fov = lerp(FOV, FLIGHT_FOV, smoothstep(0.02, 0.4, flight))
    if (Math.abs(camera.fov - fov) > 0.001) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  }

  /* ── BackgroundScene ──────────────────────────────────────── */

  get scene(): Scene {
    return this.opened && this.security ? this.security.scene : this.tunnelScene
  }

  get camera(): PerspectiveCamera {
    return this.opened && this.security ? this.security.camera : this.mainCamera
  }

  get bloom(): BloomSettings {
    return this.opened
      ? { enabled: true, strength: 0.14, radius: 0.3, threshold: 0.22 }
      : { enabled: true, strength: 0.3, radius: 0.25, threshold: 0.43 }
  }

  get reveal(): RevealState | null {
    if (this.opened || this.state.revealStrength <= 0.001) return null
    this.revealState.radius = this.state.revealRadius
    this.revealState.strength = this.state.revealStrength
    return this.revealState
  }

  setAbout(about: boolean): void {
    this.about = about
    if (!this.holding && !this.rewinding) this.state.flight = about ? ABOUT_FLIGHT : 0
    this.state.revealFlight = this.state.flight
  }

  enter(): void {
    if (this.introPlayed) return
    this.introPlayed = true
    this.ctx.tweens.to(this.state, 'intro', { from: 0, to: 1, duration: 2, ease: ease.power4Out })
    this.playSweep(0.7)
  }

  /** Runs the bright light along the front ribbons once. */
  private playSweep(delay = 0): void {
    this.nextSweep = 5 + Math.random() * 3
    this.ctx.tweens.to(this.state, 'sweep', {
      from: 0,
      to: 1,
      delay,
      duration: 1.9,
      ease: ease.power2InOut,
      onComplete: () => {
        this.state.sweep = -1
      },
    })
  }

  leave(): void {
    this.introPlayed = false
    this.ctx.tweens.kill(this.state)
    this.holding = false
    this.rewinding = false
    this.state.revealStrength = 0
    this.state.revealRadius = 0
    this.state.lineOpacity = 0
    this.state.sweep = -1
    this.state.particles = 1
    this.state.holdCam = 0
    this.state.flight = this.about ? ABOUT_FLIGHT : 0
    this.state.revealFlight = this.state.flight
  }

  settle(): void {
    this.ctx.tweens.kill(this.state)
    this.state.intro = 1
    this.heroEased = this.heroTarget
    this.securityEased = this.securityTarget
  }

  onScroll(channel: ScrollChannel, progress: number): void {
    if (channel === 'hero') {
      this.heroTarget = progress
      if (progress >= 1) this.open()
      else this.close()
    } else if (channel === 'security') {
      this.securityTarget = progress
      if (progress >= 1) this.close()
      else this.open()
    }
  }

  private open(): void {
    if (this.opened || this.holding) return
    this.ensureSecurity()
    if (this.securityReady) this.opened = true
    else this.pendingOpen = true
  }

  /** Builds the security view and compiles its shaders in the background. */
  private ensureSecurity(): void {
    if (this.security) return
    const security = new SecurityView(this.ctx.quality, CLEAR_COLOR)
    security.resize(this.viewWidth, this.viewHeight)
    security.setViewport(this.viewHeight * this.ctx.renderer.getPixelRatio())
    this.security = security
    void this.ctx.compile(security.scene, security.camera).then(() => {
      this.securityReady = true
      if (this.pendingOpen) {
        this.pendingOpen = false
        this.opened = true
      }
    })
  }

  private close(): void {
    this.opened = false
    this.pendingOpen = false
  }

  onHold(active: boolean): void {
    if (this.opened || this.about) return
    const { tweens } = this.ctx
    const s = this.state
    if (active) {
      if (this.holding) return
      this.holding = true
      this.rewinding = false
      tweens.kill(s, 'flight')
      tweens.kill(s, 'revealFlight')
      tweens.kill(s, 'revealRadius')
      s.flight = 0
      s.revealStrength = 0
      s.revealRadius = 0
      tweens.to(s, 'holdCam', { to: 1, duration: 2, ease: ease.power2Out })
      tweens.to(s, 'lineOpacity', { to: 0.15, duration: 1.5, ease: ease.power2InOut })
      tweens.to(s, 'particles', { to: 0, duration: 10, ease: ease.power2Out })
      return
    }
    if (!this.holding) return
    this.holding = false
    this.rewinding = true
    const from = s.flight
    tweens.to(s, 'flight', { to: Math.max(0, from - REWIND_SECONDS / FLIGHT_SECONDS), duration: 1.5, ease: ease.power4Out })
    tweens.to(s, 'revealFlight', { from: Math.max(0, from - 0.3 / FLIGHT_SECONDS), to: 0, duration: 3, ease: ease.power4Out })
    tweens.to(s, 'lineOpacity', { to: 0, duration: 1.5, ease: ease.power4Out })
    tweens.to(s, 'holdCam', { to: 0, duration: 1.75, delay: 0.3, ease: ease.power2Out })
    tweens.to(s, 'particles', { to: 1, duration: 2, ease: ease.power2InOut })
    tweens.to(s, 'revealRadius', {
      from: 0,
      to: 1,
      delay: 0.3,
      duration: 1.75,
      ease: ease.power2Out,
      onStart: () => {
        s.revealStrength = 1
      },
      onComplete: () => {
        tweens.kill(s, 'flight')
        tweens.kill(s, 'revealFlight')
        s.flight = 0
        s.revealFlight = 0
        s.revealStrength = 0
        s.revealRadius = 0
        this.rewinding = false
      },
    })
  }

  warm(on: boolean): void {
    this.streaks.mesh.visible = on
  }

  resize(width: number, height: number): void {
    const aspect = width / Math.max(1, height)
    this.mainCamera.aspect = aspect
    this.mainCamera.updateProjectionMatrix()
    this.revealCamera.aspect = aspect
    this.revealCamera.updateProjectionMatrix()
    this.streaks.resize(width, height)
    this.viewWidth = width
    this.viewHeight = height
    this.security?.resize(width, height)
    const viewport = height * this.ctx.renderer.getPixelRatio()
    this.particles.setViewport(viewport)
    this.security?.setViewport(viewport)
  }

  update(delta: number, elapsed: number): void {
    const s = this.state
    const { quality, pointer } = this.ctx

    if (this.holding) s.flight = Math.min(1, s.flight + delta / FLIGHT_SECONDS)
    if (!this.rewinding) s.revealFlight = this.about ? s.flight : Math.max(0, s.flight - 0.3 / FLIGHT_SECONDS)

    this.heroEased = damp(this.heroEased, this.heroTarget, 0.12, delta)
    this.securityEased = damp(this.securityEased, this.securityTarget, 0.05, delta)

    if (this.heroTarget > 0.3) this.ensureSecurity()
    if (this.opened && this.security) {
      this.security.update(delta, elapsed, pointer, this.ctx.pointerActive(), this.securityEased)
      return
    }

    // Mouse and scroll drive the camera rig, like the reference.
    const flight = s.flight
    const strength = lerp(CAM_STRENGTH_HOLD, CAM_STRENGTH, s.particles)
    const reach = Math.max(0.1, Math.abs(flight - 1))
    const active = this.ctx.pointerActive()
    const targetX = active ? pointer.x * reach * strength : 0
    const targetY = active ? pointer.y * reach * strength : 0
    this.mouseX = damp(this.mouseX, targetX, CAM_EASING, delta)
    this.mouseY = damp(this.mouseY, targetY, CAM_EASING, delta)
    const footerInView = this.footer()?.classList.contains('is-inview') ?? false
    const neutral = footerInView || this.securityTarget >= 1 || this.about
    let scroll = neutral || quality.touch ? 0 : this.heroEased
    scroll *= 1 - clamp(s.holdCam, 0, 1)
    for (const rig of [this.rig, this.revealRig]) {
      rig.rotation.set(this.mouseY, this.mouseX + scroll * Math.PI * -0.05, 0)
      rig.position.set(neutral ? 0 : scroll * -0.05, neutral ? 0 : 1 - s.intro - scroll, 0)
    }
    this.setFlightPose(this.mainCamera, flight)
    this.setFlightPose(this.revealCamera, s.revealFlight)

    this.updateFog(elapsed)
    this.updateLights(elapsed, flight)
    this.updateArches(delta, elapsed)

    const pulse = this.pulse.uniforms
    pulse.uTime.value = elapsed
    pulse.uMaxDepth.value = flight >= 0.5 ? 0 : 6
    pulse.uSweep.value = this.state.sweep
    if (!this.holding && flight < 0.01 && this.state.sweep < 0) {
      this.nextSweep -= delta
      if (this.nextSweep <= 0) this.playSweep()
    }
    pulse.uSpeed.value = 0.19 * (1 + s.holdCam * 1.5)

    this.particles.update(elapsed, s.particles)
    this.streaks.update(elapsed, s.lineOpacity * smoothstep(0.12, 0.3, flight) * 6)
  }

  private updateFog(elapsed: number): void {
    const t = this.state.flight * (this.state.revealRadius > 0 ? 1 - this.state.revealRadius : 1)
    const near0 = mapRange(t, 0.05, 0.35, 3.5, 1.1)
    const far0 = mapRange(t, 0.05, 0.35, 5.2, 3.6)
    const near = near0 + Math.sin(elapsed * 1.5 + 0.5) * 0.11 + Math.sin(elapsed * 2.8 + 1.4) * 0.06
    const far = far0 + Math.sin(elapsed * 1.5 + 0.25) * 0.11 + Math.sin(elapsed * 3.1 + 0.8) * 0.06
    this.fog.near = Math.min(near, far - 0.02)
    this.fog.far = Math.max(far, near + 0.02)
  }

  private updateLights(elapsed: number, flight: number): void {
    this.lights.forEach(({ light, intensity }, index) => {
      const seed = index * 1.7
      const flicker = 0.85 + 0.15 * Math.sin(elapsed * 0.6 + seed) * Math.cos(elapsed * 1.1 + seed * 0.5)
      light.intensity = lerp(intensity * flicker, intensity, smoothstep(0.92, 1, flight))
    })
  }

  private updateArches(delta: number, elapsed: number): void {
    const { pointer, quality } = this.ctx
    let hovered: Mesh | null = null
    if (!quality.touch && this.ctx.pointerActive() && this.state.flight < 0.05) {
      this.raycaster.setFromCamera(pointer, this.mainCamera)
      const hits = this.raycaster.intersectObjects(
        this.arches.map((arch) => arch.mesh),
        false,
      )
      const first = hits[0]
      if (first && first.object instanceof Mesh) hovered = first.object
    }
    for (const arch of this.arches) {
      const target = arch.mesh === hovered ? 0.03 : 0
      arch.lift = damp(arch.lift, target, target > 0 ? 0.02 : 0.01, delta)
      arch.mesh.position.set(
        arch.origin.x + Math.sin(elapsed * arch.freq.x + arch.phase.x) * 0.008,
        arch.origin.y + Math.sin(elapsed * arch.freq.y + arch.phase.y) * 0.008 + arch.lift,
        arch.origin.z + Math.sin(elapsed * arch.freq.z + arch.phase.z) * 0.008,
      )
    }
    for (const circle of this.circles) {
      circle.mesh.position.set(
        circle.origin.x + Math.sin(elapsed * 1.2 * circle.freq.x + circle.phase.x) * 0.006,
        circle.origin.y + Math.sin(elapsed * 1.2 * circle.freq.y + circle.phase.y) * 0.006,
        circle.origin.z + Math.sin(elapsed * 1.2 * circle.freq.z + circle.phase.z) * 0.006,
      )
      circle.mesh.rotation.x = elapsed * 0.5 * circle.freq.x + circle.phase.x
    }
  }

  dispose(): void {
    this.particles.dispose()
    this.streaks.dispose()
    this.security?.dispose()
    disposeTree(this.tunnelScene)
    this.pulse.material.dispose()
  }
}
