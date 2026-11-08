import { AmbientLight, Color, LatheGeometry, Mesh, MeshStandardMaterial, SpotLight, Vector2, Vector3 } from 'three'
import { createRandom } from '../engine/math'
import { Particles } from '../engine/particles'
import type { StageContext } from '../engine/types'
import { UseCaseScene } from './UseCaseScene'

const DISTANCE = 9
/** [inner radius, outer radius, height] from the centre out. */
const RINGS: readonly [number, number, number][] = [
  [0, 0.08, 0.12],
  [0.1, 0.22, 0.07],
  [0.235, 0.44, 0.04],
  [0.455, 0.64, 0.06],
  [0.655, 0.76, 0.03],
  [0.775, 1.06, 0.05],
  [1.075, 1.5, 0.03],
  [1.515, 2.4, 0.045],
]

/** A ring with softly bevelled edges, spun from a profile and turned to face the camera. */
function ringGeometry(inner: number, outer: number, height: number): LatheGeometry {
  const bevel = Math.min(0.012, (outer - inner) / 4, height / 3)
  const points: Vector2[] = []
  if (inner > 0) points.push(new Vector2(inner, -0.2), new Vector2(inner, height - bevel), new Vector2(inner + bevel, height))
  else points.push(new Vector2(0.0001, height))
  points.push(new Vector2(outer - bevel, height), new Vector2(outer, height - bevel), new Vector2(outer, -0.2))
  const geometry = new LatheGeometry(points.reverse(), 160)
  geometry.rotateX(Math.PI / 2)
  return geometry
}

/**
 * Fashion (the reference's voice scene): concentric rings like a speaker
 * cone, pulsing towards the camera in a slow wave under two spotlights.
 */
export class FashionScene extends UseCaseScene {
  private readonly rings: { mesh: Mesh; base: number; index: number }[] = []

  constructor(ctx: StageContext) {
    super(ctx, {
      fov: 10,
      near: 0.5,
      far: 40,
      fog: null,
      backdrop: 1,
      camStrength: 0.004,
      scrollEasing: 0.025,
    })
    this.look = { vignette: 0.8, edgeBlur: 0.9 }
    const material = new MeshStandardMaterial({ color: new Color(0x6f9a1f), emissive: new Color(0x0d110a), roughness: 0.55, metalness: 0 })
    const random = createRandom(17)
    RINGS.forEach(([inner, outer, height], index) => {
      const mesh = new Mesh(ringGeometry(inner, outer, height), material)
      const base = -index * 0.035 + (random() - 0.5) * 0.02
      mesh.position.z = base
      mesh.castShadow = ctx.quality.shadows
      mesh.receiveShadow = ctx.quality.shadows
      this.scene.add(mesh)
      this.rings.push({ mesh, base, index })
    })

    this.scene.add(new AmbientLight(0xffffff, 0.03))
    const spots: [Vector3, number][] = [
      [new Vector3(-1.4, 1.9, 3.2), 6],
      [new Vector3(1.8, -0.6, 2.6), 3],
    ]
    for (const [position, intensity] of spots) {
      const spot = new SpotLight(0xffffff, intensity, 0, 0.42, 1, 2)
      spot.position.copy(position)
      spot.target.position.set(0, 0, 0)
      if (ctx.quality.shadows) {
        spot.castShadow = true
        spot.shadow.mapSize.setScalar(1024)
        spot.shadow.radius = 8
        spot.shadow.bias = -0.0005
      }
      this.scene.add(spot, spot.target)
    }

    this.particles = new Particles({
      count: 70 * ctx.quality.particleScale,
      position: new Vector3(0, 0, 4.2),
      boxSize: new Vector3(1.4, 1.6, 7),
      color: new Color(0xc6fd78),
      size: 0.03,
      opacity: 0.35,
      sway: 0.004,
      swaySpeed: 0.08,
      lifeSpeed: 0.12,
      fadeIn: 0.22,
      fadeOut: 0.72,
      seed: 23,
    })
    this.scene.add(this.particles.points)
  }

  protected animate(_delta: number, elapsed: number, scroll: number): void {
    // The intro dollies in from far back; scrolling the hero carries on forward and pans, so the rings grow and drift up-left.
    const away = (1 - this.intro.value) * DISTANCE * 1.2
    this.rig.position.set(scroll * 0.35, -scroll * 0.25, DISTANCE + away - scroll * DISTANCE * 0.55)
    const swell = 0.5 + 0.5 * Math.sin(elapsed * 0.7)
    for (const ring of this.rings) {
      const wave = Math.sin(elapsed * 2.6 - ring.index * 0.75) * 0.018 * (0.4 + swell * 0.6)
      ring.mesh.position.z = ring.base + wave
    }
  }
}
