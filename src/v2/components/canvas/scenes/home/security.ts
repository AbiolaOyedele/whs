import {
  AdditiveBlending,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Ray,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SpotLight,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three'
import { createBackdrop } from '../../engine/backdrop'
import { disposeTree } from '../../engine/dispose'
import { createRandom, damp } from '../../engine/math'
import { Particles } from '../../engine/particles'
import type { Quality } from '../../engine/types'

const SHIELD_VERTEX = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    vLocal = normalize(position);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const SHIELD_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uBrightColor;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uHexScale;
  uniform float uHexEdge;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  varying vec3 vLocal;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = i.x + i.y * 57.0 + i.z * 113.0;
    float a = hash21(vec2(n, 0.0));
    float b = hash21(vec2(n + 1.0, 0.0));
    float c = hash21(vec2(n + 57.0, 0.0));
    float d = hash21(vec2(n + 58.0, 0.0));
    float e = hash21(vec2(n + 113.0, 0.0));
    float g = hash21(vec2(n + 114.0, 0.0));
    float h = hash21(vec2(n + 170.0, 0.0));
    float k = hash21(vec2(n + 171.0, 0.0));
    return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), mix(mix(e, g, f.x), mix(h, k, f.x), f.y), f.z);
  }

  // Distance to the hexagon edge (0 centre, 0.5 edge) and the cell id.
  vec3 hexCell(vec2 uv) {
    const vec2 r = vec2(1.0, 1.7320508);
    const vec2 h = r * 0.5;
    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b;
    vec2 id = floor((uv - gv) / h + 0.5);
    vec2 p = abs(gv);
    float d = max(dot(p, normalize(r)), p.x);
    return vec3(d, hash21(id), 0.0);
  }

  void main() {
    vec3 n = normalize(vNormalView);
    float facing = abs(dot(n, normalize(vViewDir)));
    float rim = 1.0 - facing;
    float fresnelNoise = noise3(vLocal * 3.3 + uTime * 0.57);
    float fresnel = pow(rim, 2.9) * 3.9 * mix(1.0, fresnelNoise * 1.6, 0.4);

    // Project the hex grid from whichever axis the surface faces most.
    vec3 a = abs(vLocal);
    vec2 plane = a.x > a.y && a.x > a.z ? vLocal.yz : (a.y > a.z ? vLocal.xz : vLocal.xy);
    vec3 cell = hexCell(plane * uHexScale);
    float d = cell.x;
    float cellRand = cell.y;
    float edge = smoothstep(0.5 - uHexEdge * 0.5, 0.5, d);
    float hexRim = pow(rim, 4.6);

    float flow = noise3(vLocal * 2.4 + vec3(0.0, uTime * 0.36, uTime * 0.2)) * 0.34;

    float near = dot(vLocal, uPointer);
    float reach = smoothstep(0.955, 0.995, near + (cellRand - 0.5) * 0.03);
    float lit = step(0.35, cellRand) * reach * uPointerStrength;
    float cellFill = (1.0 - smoothstep(0.38, 0.47, d)) * lit;

    vec3 color = uColor * (0.008 + fresnel * 0.07 + flow * 0.025);
    color += uColor * edge * hexRim * 0.18;
    color += uBrightColor * (cellFill * 0.8 + edge * reach * uPointerStrength * 0.35);
    gl_FragColor = vec4(color * uOpacity, 1.0);
  }
`

/**
 * The home "security" view: a glass shield sphere with a hexagon skin that
 * lights up under the pointer, stacked plum discs inside it, a bright orbit
 * ring and drifting dust. It has its own scene and wide camera.
 */
export class SecurityView {
  readonly scene = new Scene()
  readonly camera: PerspectiveCamera
  private readonly group = new Group()
  private readonly discs = new Group()
  private readonly shield: Mesh<SphereGeometry, ShaderMaterial>
  private readonly shieldUniforms = {
    uColor: { value: new Color('#a9dc66') },
    uBrightColor: { value: new Color('#b5e27a') },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uHexScale: { value: 9.5 },
    uHexEdge: { value: 0.22 },
    uPointer: { value: new Vector3(0, 0, 1) },
    uPointerStrength: { value: 0 },
  }
  private readonly particles: Particles
  private readonly basePosition = new Vector3(0, 0, 10)
  private readonly mouse = new Vector2()
  private readonly ray = new Ray()
  private readonly localPointer = new Vector3()
  private pointerStrength = 0
  private scrollZ = 0
  private readonly disposables: { dispose: () => void }[] = []

  constructor(
    private readonly quality: Quality,
    clearColor: Color,
  ) {
    this.camera = new PerspectiveCamera(45, 1, 0.1, 100)
    this.camera.position.copy(this.basePosition)
    this.scene.add(createBackdrop(clearColor))
    this.scene.add(this.group)

    const shieldGeometry = new SphereGeometry(1, 96, 64)
    const shieldMaterial = new ShaderMaterial({
      vertexShader: SHIELD_VERTEX,
      fragmentShader: SHIELD_FRAGMENT,
      uniforms: this.shieldUniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    this.shield = new Mesh(shieldGeometry, shieldMaterial)
    this.shield.renderOrder = 5
    this.group.add(this.shield)
    this.disposables.push(shieldGeometry, shieldMaterial)

    this.buildDiscs()
    this.buildLights()

    this.particles = new Particles({
      count: 140 * quality.particleScale,
      position: new Vector3(0, 0, 0),
      boxSize: new Vector3(8.3, 7.2, 8),
      color: new Color(0xc6fd78),
      size: 0.26,
      opacity: 0.4,
      sway: 0.02,
      swaySpeed: 1.23,
      lifeSpeed: 0.3,
      fadeIn: 0.3,
      fadeOut: 0.7,
      seed: 31,
    })
    this.group.add(this.particles.points)
    this.disposables.push(this.particles)
  }

  private buildDiscs(): void {
    const random = createRandom(7)
    const material = new MeshStandardMaterial({ color: new Color('#8cc63c'), metalness: 0.53, roughness: 0.6 })
    this.disposables.push(material)
    const count = 9
    const sphereRadius = 0.72
    const step = 0.142
    for (let i = 0; i < count; i++) {
      const y = (i - (count - 1) / 2) * step
      const radius = Math.sqrt(Math.max(0.02, sphereRadius * sphereRadius - y * y)) * (0.9 + random() * 0.14)
      const geometry = new CylinderGeometry(radius, radius, step * 0.78, 72, 1)
      this.disposables.push(geometry)
      const disc = new Mesh(geometry, material)
      disc.position.set((random() - 0.5) * 0.12, y, (random() - 0.5) * 0.1)
      this.discs.add(disc)
    }
    const ringGeometry = new TorusGeometry(0.8, 0.004, 8, 220)
    const ringMaterial = new MeshBasicMaterial({ color: new Color(0.75, 1.15, 0.3) })
    this.disposables.push(ringGeometry, ringMaterial)
    const ring = new Mesh(ringGeometry, ringMaterial)
    ring.rotation.set(Math.PI / 2 + 0.12, 0, 0.05)
    this.discs.add(ring)

    this.discs.rotation.copy(new Euler(0.15, -0.25, -0.88))
    this.group.add(this.discs)
  }

  private buildLights(): void {
    const key = new DirectionalLight(0xffffff, 0.5)
    key.position.set(1.39, -0.5, 0.4)
    this.group.add(key, key.target)
    const spots: [string, number, number, number, number, Vector3, Vector3][] = [
      ['#f8fff0', 7, 0.39, 0.99, 0, new Vector3(3.2, 1.4, 5.5), new Vector3(0, 0.2, 0)],
      ['#ffffff', 4, 0.47, 0.41, 7, new Vector3(-4.2, 0.2, 3.8), new Vector3(0, -0.1, 0)],
      ['#dcfda8', 9, 0.9, 0, 0, new Vector3(0.6, -2.8, -4.5), new Vector3(0, 0.5, 0)],
    ]
    for (const [color, intensity, angle, penumbra, distance, position, target] of spots) {
      const spot = new SpotLight(new Color(color), intensity, distance, angle, penumbra, 2)
      spot.position.copy(position)
      spot.target.position.copy(target)
      this.group.add(spot, spot.target)
    }
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height)
    this.camera.updateProjectionMatrix()
    const shieldScale = width < 700 ? 2 : width < 1000 ? 3 : 4.5
    const discScale = width < 700 ? 2.5 : width < 1000 ? 3.5 : 5
    this.shield.scale.setScalar(shieldScale)
    this.discs.scale.setScalar(discScale)
  }

  setViewport(heightInPixels: number): void {
    this.particles.setViewport(heightInPixels)
  }

  /** `scroll` is the security section's eased progress; the sphere drifts back as it runs. */
  update(delta: number, elapsed: number, pointer: Vector2, pointerActive: boolean, scroll: number): void {
    const targetX = pointerActive ? pointer.x * 4.877 : 0
    const targetY = pointerActive ? pointer.y * 4.877 : 0
    this.mouse.x = damp(this.mouse.x, targetX, 0.01, delta)
    this.mouse.y = damp(this.mouse.y, targetY, 0.01, delta)
    this.camera.position.set(this.basePosition.x + this.mouse.x, this.basePosition.y + this.mouse.y, this.basePosition.z)
    this.camera.lookAt(0, 0, 0)
    this.camera.updateMatrixWorld()

    this.scrollZ = scroll
    this.group.position.z = -this.scrollZ
    this.discs.rotation.y = -0.25 + elapsed * 0.05
    this.group.updateMatrixWorld()

    let hit = false
    if (pointerActive && !this.quality.touch) {
      this.ray.origin.setFromMatrixPosition(this.camera.matrixWorld)
      this.ray.direction.set(pointer.x, pointer.y, 0.5).unproject(this.camera).sub(this.ray.origin).normalize()
      const centre = new Vector3().setFromMatrixPosition(this.shield.matrixWorld)
      const radius = this.shield.scale.x
      const toCentre = centre.clone().sub(this.ray.origin)
      const along = toCentre.dot(this.ray.direction)
      const closest = toCentre.lengthSq() - along * along
      if (closest <= radius * radius) {
        const depth = along - Math.sqrt(radius * radius - closest)
        this.localPointer.copy(this.ray.direction).multiplyScalar(depth).add(this.ray.origin).sub(centre).normalize()
        this.shieldUniforms.uPointer.value.lerp(this.localPointer, 1 - Math.pow(0.85, delta * 60)).normalize()
        hit = true
      }
    }
    this.pointerStrength = damp(this.pointerStrength, hit ? 1 : 0, hit ? 0.08 : 0.03, delta)
    this.shieldUniforms.uPointerStrength.value = this.pointerStrength
    this.shieldUniforms.uTime.value = elapsed
    this.particles.update(elapsed)
  }

  dispose(): void {
    for (const item of this.disposables) item.dispose()
    disposeTree(this.scene)
  }
}
