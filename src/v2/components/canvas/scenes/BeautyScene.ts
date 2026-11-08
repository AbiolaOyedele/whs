import {
  AmbientLight,
  Color,
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  SpotLight,
  Vector3,
  type WebGLProgramParametersWithUniforms,
} from 'three'
import { createArchGeometry } from '../engine/geometry'
import { createRandom } from '../engine/math'
import { Particles } from '../engine/particles'
import type { StageContext } from '../engine/types'
import { UseCaseScene } from './UseCaseScene'

const DISTANCE = 20
const RADIUS = 0.75
const PLUM = new Color(0x6f9a1f)
const PLUM_EMISSIVE = new Color(0x0d110a)

/** Thin grooves along lines of latitude and longitude. */
function grooveGlobe(material: MeshStandardMaterial): void {
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGlobe;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlobe = normalize(position);')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGlobe;')
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `float lat = asin(clamp(vGlobe.y, -1.0, 1.0)) / 3.14159265 * 9.0;
        float lon = atan(vGlobe.z, vGlobe.x) / 3.14159265 * 9.0;
        float gLat = abs(fract(lat) - 0.5);
        float gLon = abs(fract(lon) - 0.5);
        float groove = max(smoothstep(0.485, 0.5, gLat), smoothstep(0.485, 0.5, gLon) * step(abs(vGlobe.y), 0.92));
        vec4 diffuseColor = vec4(diffuse * (1.0 - groove * 0.55), opacity);`,
      )
  }
  material.customProgramCacheKey = () => 'beauty-globe'
}

/** Paths that draw themselves round the globe and wipe away again. */
function drawingPath(material: MeshStandardMaterial, uniforms: { uProgress: { value: number }; uOffset: { value: number } }): void {
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vPathV;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPathV = uv.y;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vPathV;\nuniform float uProgress;\nuniform float uOffset;')
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `float size = 0.9;
        float margin = size + 0.001;
        float head = fract(uProgress + uOffset) * (1.0 + margin * 2.0) - margin;
        if (abs(vPathV - head) > size) discard;
        vec4 diffuseColor = vec4( diffuse, opacity );`,
      )
  }
  material.customProgramCacheKey = () => 'beauty-path'
}

/**
 * Beauty (the reference's LLM scene): a large grooved globe low on the right,
 * slowly turning, with fins that draw round it, under spotlights.
 */
export class BeautyScene extends UseCaseScene {
  private readonly pivot = new Group()
  private readonly pathUniforms: { uProgress: { value: number }; uOffset: { value: number } }[] = []
  private readonly framing = new Vector3()
  private pathProgress = 0

  constructor(ctx: StageContext) {
    super(ctx, {
      fov: 3.5,
      near: 1,
      far: 60,
      fog: { near: 16.6, far: 29.6 },
      backdrop: 1,
      camStrength: 0.004,
      scrollEasing: 0.04,
    })
    const random = createRandom(29)
    const globeMaterial = new MeshStandardMaterial({ color: PLUM, emissive: PLUM_EMISSIVE, roughness: 0.62, metalness: 0 })
    grooveGlobe(globeMaterial)
    const globe = new Mesh(new SphereGeometry(RADIUS, 128, 96), globeMaterial)
    globe.receiveShadow = ctx.quality.shadows
    this.pivot.add(globe)

    const paths = 7
    for (let i = 0; i < paths; i++) {
      const uniforms = { uProgress: { value: 0 }, uOffset: { value: i / paths } }
      const material = new MeshStandardMaterial({ color: PLUM, emissive: PLUM_EMISSIVE, roughness: 0.5, metalness: 0 })
      drawingPath(material, uniforms)
      this.pathUniforms.push(uniforms)
      const start = random() * Math.PI * 2
      const geometry = createArchGeometry({
        radius: RADIUS * (0.995 + random() * 0.01),
        width: 0.008 + random() * 0.01,
        thickness: RADIUS * (0.04 + random() * 0.1),
        start,
        end: start + Math.PI * (1.2 + random() * 0.8),
        segments: 200,
      })
      const arch = new Mesh(geometry, material)
      arch.rotation.copy(new Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI))
      this.pivot.add(arch)
    }
    this.pivot.rotation.set(0.3, 0.2, -0.2)
    this.scene.add(this.pivot)

    this.scene.add(new AmbientLight(0xffffff, 0.04))
    const spots: [Vector3, number][] = [
      [new Vector3(-2.2, 2.4, 3.2), 11],
      [new Vector3(2.4, 2.8, 1.2), 5],
    ]
    for (const [position, intensity] of spots) {
      const spot = new SpotLight(0xffffff, intensity, 0, 0.7, 1, 2)
      spot.position.copy(position)
      spot.target.position.set(0, 0, 0)
      if (ctx.quality.shadows) {
        spot.castShadow = true
        spot.shadow.mapSize.setScalar(1024)
        spot.shadow.radius = 10
        spot.shadow.bias = -0.0004
      }
      this.scene.add(spot, spot.target)
    }

    this.particles = new Particles({
      count: 90 * ctx.quality.particleScale,
      position: new Vector3(-0.2, 0.05, 6),
      rotation: new Euler(-0.3, -0.1, -0.2),
      boxSize: new Vector3(1.6, 1.0, 26),
      color: new Color(0xc6fd78),
      size: 0.03,
      opacity: 0.35,
      sway: 0.004,
      swaySpeed: 0.02,
      lifeSpeed: 0.12,
      fadeIn: 0.22,
      fadeOut: 0.72,
      seed: 41,
    })
    this.scene.add(this.particles.points)
  }

  override resize(width: number, height: number): void {
    super.resize(width, height)
    // Portrait screens: pull back (fog follows) and keep the globe low on the right, mostly off screen.
    const factor = Math.max(1, 1.25 / this.camera.aspect)
    const distance = DISTANCE * factor
    this.scaleFog(factor)
    const halfHeight = distance * Math.tan((this.camera.fov * Math.PI) / 360)
    const halfWidth = halfHeight * this.camera.aspect
    const narrow = this.camera.aspect < 1
    this.framing.set(-halfWidth * (narrow ? 0.85 : 0.72), halfHeight * (narrow ? 0.78 : 0.8), distance)
  }

  protected animate(delta: number, _elapsed: number, scroll: number): void {
    const away = 1 - this.intro.value
    this.rig.position.set(this.framing.x + away * 0.35, this.framing.y - away * 0.8 - scroll * 0.3, this.framing.z)
    this.pivot.rotation.y += delta * 0.06
    this.pivot.rotation.z += delta * 0.06
    this.pathProgress = (this.pathProgress + delta * 0.08) % 1
    for (const uniforms of this.pathUniforms) uniforms.uProgress.value = this.pathProgress
  }
}
