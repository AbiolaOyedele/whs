import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three'
import { createRandom } from './math'

export interface ParticleOptions {
  count: number
  position: Vector3
  rotation?: Euler
  boxSize: Vector3
  color: Color
  /** Dot diameter in world units. */
  size: number
  opacity: number
  /** How far each dot sways from home, in world units. */
  sway: number
  swaySpeed: number
  /** Fraction of a life cycle per second. */
  lifeSpeed: number
  fadeIn: number
  fadeOut: number
  seed: number
}

const VERTEX = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uTime;
  uniform float uSize;
  uniform float uViewport;
  uniform float uSway;
  uniform float uSwaySpeed;
  uniform float uLifeSpeed;
  uniform float uFadeIn;
  uniform float uFadeOut;
  uniform vec3 uBoxSize;
  varying float vAlpha;

  void main() {
    float life = fract(aSeed.w + uTime * uLifeSpeed * (0.75 + aSeed.x * 0.5));
    float phase = aSeed.y * 6.2831;
    float t = uTime * uSwaySpeed;
    vec3 pos = position + vec3(sin(t + phase), cos(t * 0.7 + phase), sin(t * 0.5 + phase * 1.3)) * uSway;

    float lifeFade = smoothstep(0.0, uFadeIn, life) * (1.0 - smoothstep(uFadeOut, 1.0, life));
    vec3 halfBox = uBoxSize * 0.5;
    vec3 edge = halfBox * 0.2;
    vec3 toEdge = halfBox - abs(pos);
    float edgeFade = min(smoothstep(0.0, edge.x, toEdge.x), min(smoothstep(0.0, edge.y, toEdge.y), smoothstep(0.0, edge.z, toEdge.z)));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = max(0.001, -mvPosition.z);
    vAlpha = lifeFade * edgeFade;
    // uSize is the dot's diameter in world units, so it reads the same under any lens.
    float pixels = uSize * projectionMatrix[1][1] * uViewport * 0.5 / dist;
    gl_PointSize = min(pixels * (0.5 + aSeed.z), 120.0) * lifeFade * edgeFade;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    // A soft out-of-focus dot: gaussian falloff, no hard core.
    float d = length(gl_PointCoord - 0.5);
    float soft = exp(-d * d * 14.0) * (1.0 - smoothstep(0.38, 0.5, d));
    float alpha = soft * vAlpha * uOpacity;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`

/**
 * Soft dots that fade in and out in place inside a box, drifting a little.
 * Everything moves in the vertex shader, so the CPU does nothing per frame.
 */
export class Particles {
  readonly points: Points<BufferGeometry, ShaderMaterial>
  readonly uniforms: {
    uTime: { value: number }
    uOpacity: { value: number }
    uSize: { value: number }
    uViewport: { value: number }
    uSway: { value: number }
    uSwaySpeed: { value: number }
    uLifeSpeed: { value: number }
    uFadeIn: { value: number }
    uFadeOut: { value: number }
    uBoxSize: { value: Vector3 }
    uColor: { value: Color }
  }
  private readonly baseOpacity: number

  constructor(options: ParticleOptions) {
    const random = createRandom(options.seed)
    const count = Math.max(1, Math.round(options.count))
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * options.boxSize.x
      positions[i * 3 + 1] = (random() - 0.5) * options.boxSize.y
      positions[i * 3 + 2] = (random() - 0.5) * options.boxSize.z
      seeds[i * 4] = random()
      seeds[i * 4 + 1] = random()
      seeds[i * 4 + 2] = random()
      seeds[i * 4 + 3] = random()
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('aSeed', new BufferAttribute(seeds, 4))

    this.baseOpacity = options.opacity
    this.uniforms = {
      uTime: { value: 0 },
      uOpacity: { value: options.opacity },
      uSize: { value: options.size },
      uViewport: { value: 800 },
      uSway: { value: options.sway },
      uSwaySpeed: { value: options.swaySpeed },
      uLifeSpeed: { value: options.lifeSpeed },
      uFadeIn: { value: options.fadeIn },
      uFadeOut: { value: options.fadeOut },
      uBoxSize: { value: options.boxSize.clone() },
      uColor: { value: options.color.clone() },
    }
    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    this.points = new Points(geometry, material)
    this.points.position.copy(options.position)
    if (options.rotation) this.points.rotation.copy(options.rotation)
    this.points.frustumCulled = false
    this.points.renderOrder = 3
  }

  /** `visibility` 0 → 1 scales the configured opacity. */
  update(elapsed: number, visibility = 1): void {
    this.uniforms.uTime.value = elapsed
    this.uniforms.uOpacity.value = this.baseOpacity * visibility
    this.points.visible = visibility > 0.001
  }

  /** Drawing-buffer height in pixels (CSS height × pixel ratio). */
  setViewport(heightInPixels: number): void {
    this.uniforms.uViewport.value = heightInPixels
  }

  dispose(): void {
    this.points.geometry.dispose()
    this.points.material.dispose()
  }
}
