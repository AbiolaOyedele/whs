import { AmbientLight, Color, DirectionalLight, Euler, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { createRandom } from '../engine/math'
import { Particles } from '../engine/particles'
import type { StageContext } from '../engine/types'
import { UseCaseScene } from './UseCaseScene'

const DISTANCE = 12
const FOV = 4.5
const COUNT = 36

interface Panel {
  mesh: Mesh
  origin: Vector3
  tilt: Euler
  phase: number
  speed: number
  drift: number
}

/**
 * Home and living (the reference's image & video scene): bevelled plum slabs
 * hanging at different depths on near-black, casting soft shadows on each
 * other and drifting slowly back and forth so the fog fades them in and out.
 * On portrait screens the camera moves in so the slabs fill the frame.
 */
export class LivingScene extends UseCaseScene {
  private readonly panels: Panel[] = []
  private spreadY = 1

  constructor(ctx: StageContext) {
    super(ctx, {
      fov: FOV,
      near: 0.3,
      far: 60,
      fog: { near: 8.7, far: 17.6 },
      backdrop: 0,
      camStrength: 0.0075,
      scrollEasing: 1,
    })
    const random = createRandom(53)
    const material = new MeshStandardMaterial({ color: new Color(0.45, 0, 0.29), emissive: new Color(0x050003), roughness: 0.7, metalness: 0 })
    const shadows = ctx.quality.shadows
    for (let i = 0; i < COUNT; i++) {
      const size = 0.08 + Math.pow(random(), 1.5) * 0.32
      const width = size * (0.85 + random() * 0.3)
      const height = size * (0.85 + random() * 0.4)
      const depth = 0.08 + random() * 0.07
      const geometry = new RoundedBoxGeometry(width, height, depth, 2, Math.min(0.012, depth / 4))
      const mesh = new Mesh(geometry, material)
      const origin = new Vector3((random() - 0.5) * 2.2, (random() - 0.5) * 1.3, -6 + random() * 9)
      const tilt = new Euler((random() - 0.5) * 0.35, (random() - 0.5) * 0.45, (random() - 0.5) * 0.08)
      mesh.position.copy(origin)
      mesh.rotation.copy(tilt)
      mesh.castShadow = shadows
      mesh.receiveShadow = shadows
      this.scene.add(mesh)
      this.panels.push({ mesh, origin, tilt, phase: random() * Math.PI * 2, speed: 0.12 + random() * 0.18, drift: 0.4 + random() * 0.9 })
    }

    this.scene.add(new AmbientLight(0xffffff, 0.35))
    const key = new DirectionalLight(0xffffff, 1.6)
    key.position.set(-1.2, 1.6, 6)
    key.target.position.set(0, 0, -2)
    if (shadows) {
      key.castShadow = true
      key.shadow.mapSize.setScalar(2048)
      key.shadow.radius = 6
      key.shadow.bias = -0.0008
      const box = key.shadow.camera
      box.left = -1.8
      box.right = 1.8
      box.top = 1.4
      box.bottom = -1.4
      box.near = 0.5
      box.far = 16
    }
    this.scene.add(key.target)
    const fill = new DirectionalLight(0xff9fe5, 0.8)
    fill.position.set(0.8, -0.4, 1)
    this.scene.add(key, fill)

    this.particles = new Particles({
      count: 60 * ctx.quality.particleScale,
      position: new Vector3(0.4, -0.2, -2),
      boxSize: new Vector3(2.6, 1.6, 12),
      color: new Color(0xff6fc8),
      size: 0.04,
      opacity: 0.35,
      sway: 0.01,
      swaySpeed: 1.23,
      lifeSpeed: 0.12,
      fadeIn: 0.22,
      fadeOut: 0.72,
      seed: 61,
    })
    this.scene.add(this.particles.points)
  }

  override resize(width: number, height: number): void {
    super.resize(width, height)
    // Portrait screens: show 60% of the desktop width, so the slabs read big,
    // and spread them taller to fill the extra height.
    const aspect = this.camera.aspect
    const tanHalf = Math.tan((FOV * Math.PI) / 360)
    if (aspect < 1.2) {
      const visibleHeight = (2 * DISTANCE * tanHalf * 1.6 * 0.6) / aspect
      this.camera.fov = (2 * Math.atan(visibleHeight / (2 * DISTANCE)) * 180) / Math.PI
      this.spreadY = visibleHeight / (2 * DISTANCE * tanHalf)
    } else {
      this.camera.fov = FOV
      this.spreadY = 1
    }
    this.camera.updateProjectionMatrix()
  }

  protected animate(_delta: number, elapsed: number, scroll: number): void {
    const p = this.intro.value
    this.rig.position.set(scroll * 0.4 * p, scroll * -0.5 * p, DISTANCE + (1 - p) * 6)
    for (const panel of this.panels) {
      const t = elapsed * panel.speed + panel.phase
      panel.mesh.position.set(
        panel.origin.x + Math.sin(t * 0.7) * 0.03,
        panel.origin.y * this.spreadY + Math.cos(t * 0.5) * 0.02,
        panel.origin.z + Math.sin(t) * panel.drift,
      )
      panel.mesh.rotation.set(panel.tilt.x + Math.sin(t * 0.6) * 0.05, panel.tilt.y + Math.cos(t * 0.4) * 0.06, panel.tilt.z)
    }
  }
}
