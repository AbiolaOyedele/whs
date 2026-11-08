import {
  AdditiveBlending,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Float32BufferAttribute,
  Mesh,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'
import { createRandom } from '../../engine/math'

const VERTEX = /* glsl */ `
  attribute vec2 aCorner;
  attribute vec3 aOffset;
  attribute vec3 aParams;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uBoxSize;
  uniform vec3 uWind;
  uniform float uLength;
  uniform float uWidth;
  uniform float uTaper;
  uniform vec2 uResolution;
  varying vec2 vLineUv;
  varying float vFade;

  vec2 toScreen(vec4 p, float aspect) {
    vec2 r = p.xy / p.w;
    r.x *= aspect;
    return r;
  }

  void main() {
    float life = fract(uTime * uSpeed * aParams.y + aParams.x);
    float extent = dot(abs(uWind), uBoxSize);
    vec3 halfBox = uBoxSize * 0.5;
    vec3 centre = aOffset + uWind * life * extent;
    centre = fract((centre + halfBox) / uBoxSize) * uBoxSize - halfBox;
    float len = uLength * aParams.z;
    vec3 a = centre - uWind * len * 0.5;
    vec3 b = centre + uWind * len * 0.5;

    mat4 mvp = projectionMatrix * modelViewMatrix;
    vec4 pa = mvp * vec4(a, 1.0);
    vec4 pb = mvp * vec4(b, 1.0);
    float aspect = uResolution.x / uResolution.y;
    vec2 dir = normalize(toScreen(pb, aspect) - toScreen(pa, aspect) + 1e-5);
    vec4 current = mix(pa, pb, aCorner.x);
    float taper = smoothstep(0.0, uTaper, aCorner.x) * smoothstep(0.0, uTaper, 1.0 - aCorner.x);
    current.xy += vec2(-dir.y / aspect, dir.x) * uWidth * aCorner.y * taper;

    vLineUv = vec2(aCorner.x, aCorner.y * 0.5 + 0.5);
    vFade = smoothstep(0.0, 0.5, life) * (1.0 - smoothstep(0.5, 1.0, life));
    gl_Position = current;
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vLineUv;
  varying float vFade;
  void main() {
    float edge = 1.0 - smoothstep(0.85, 1.0, abs(vLineUv.y - 0.5) * 2.0);
    float alpha = uOpacity * vFade * edge;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`

export interface StreakOptions {
  count: number
  boxSize: Vector3
  wind: Vector3
  speed: number
  length: number
  width: number
  color: Color
  seed: number
}

/** The warp lines that rush past while the hero is held. Instanced quads, moved on the GPU. */
export class Streaks {
  readonly mesh: Mesh<InstancedBufferGeometry, ShaderMaterial>
  readonly uniforms: {
    uTime: { value: number }
    uSpeed: { value: number }
    uBoxSize: { value: Vector3 }
    uWind: { value: Vector3 }
    uLength: { value: number }
    uWidth: { value: number }
    uTaper: { value: number }
    uResolution: { value: Vector2 }
    uColor: { value: Color }
    uOpacity: { value: number }
  }

  constructor(options: StreakOptions) {
    const random = createRandom(options.seed)
    const geometry = new InstancedBufferGeometry()
    const segments = 8
    const corners: number[] = []
    const indices: number[] = []
    for (let i = 0; i <= segments; i++) {
      const x = i / segments
      corners.push(x, -1, x, 1)
      if (i < segments) {
        const a = i * 2
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
    }
    geometry.setAttribute('position', new Float32BufferAttribute(new Float32Array(corners.length / 2 * 3), 3))
    geometry.setAttribute('aCorner', new Float32BufferAttribute(corners, 2))
    geometry.setIndex(indices)

    const offsets = new Float32Array(options.count * 3)
    const params = new Float32Array(options.count * 3)
    for (let i = 0; i < options.count; i++) {
      offsets[i * 3] = (random() - 0.5) * options.boxSize.x
      offsets[i * 3 + 1] = (random() - 0.5) * options.boxSize.y
      offsets[i * 3 + 2] = (random() - 0.5) * options.boxSize.z
      params[i * 3] = random()
      params[i * 3 + 1] = 0.7 + random() * 0.6
      params[i * 3 + 2] = 0.6 + random() * 0.8
    }
    geometry.setAttribute('aOffset', new InstancedBufferAttribute(offsets, 3))
    geometry.setAttribute('aParams', new InstancedBufferAttribute(params, 3))
    geometry.instanceCount = options.count

    this.uniforms = {
      uTime: { value: 0 },
      uSpeed: { value: options.speed },
      uBoxSize: { value: options.boxSize.clone() },
      uWind: { value: options.wind.clone().normalize() },
      uLength: { value: options.length },
      uWidth: { value: options.width },
      uTaper: { value: 0.29 },
      uResolution: { value: new Vector2(1, 1) },
      uColor: { value: options.color.clone() },
      uOpacity: { value: 0 },
    }
    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    this.mesh = new Mesh(geometry, material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 4
    this.mesh.visible = false
  }

  update(elapsed: number, opacity: number): void {
    this.uniforms.uTime.value = elapsed
    this.uniforms.uOpacity.value = opacity
    this.mesh.visible = opacity > 0.001
  }

  resize(width: number, height: number): void {
    this.uniforms.uResolution.value.set(width, height)
  }

  dispose(): void {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}
