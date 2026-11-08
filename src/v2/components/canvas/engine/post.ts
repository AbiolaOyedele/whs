import {
  HalfFloatType,
  Mesh,
  type Object3D,
  OrthographicCamera,
  BufferGeometry,
  Float32BufferAttribute,
  Scene as ThreeScene,
  type Camera,
  type Scene,
  type Texture,
  ShaderMaterial,
  Vector2,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three'
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

/** Which parts of the chain to run; the first frames warm them one per frame. */
export interface Stages {
  scene: boolean
  reveal: boolean
  bloom: boolean
  output: boolean
}

export const ALL_STAGES: Stages = { scene: true, reveal: true, bloom: true, output: true }

/** Darkened corners (0 → 1) and blur towards the edges (0 → 1), like a shallow lens. */
export interface Look {
  vignette: number
  edgeBlur: number
}

export interface BloomSettings {
  enabled: boolean
  strength: number
  radius: number
  threshold: number
}

/** The release-of-hold transition: a circle that grows from the centre, revealing a second camera. */
export interface RevealState {
  camera: Camera
  /** 0 → 1, how far the circle has grown. */
  radius: number
  /** 0 → 1, how much of the effect is mixed in. */
  strength: number
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const REVEAL_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform sampler2D tReveal;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uFisheye;
  uniform vec2 uAberration;
  uniform float uAspect;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    float settle = 1.0 - min(uRadius, 1.0);
    float edgeNoise = (valueNoise(vUv * 12.0) - 0.5) * 0.1 * settle;
    float wobble = (valueNoise((vUv + uTime * 0.14) * 5.2) - 0.5) * 0.046 * settle;

    vec2 centred = (vUv - 0.5) * vec2(uAspect, 1.0);
    float corner = 0.5 * sqrt(uAspect * uAspect + 1.0) + 0.14;
    float dist = length(centred) / corner + edgeNoise;
    // 0 inside the growing circle, 1 outside it.
    float outside = smoothstep(uRadius - 0.07, uRadius + 0.07, dist);

    vec2 dir = vUv - 0.5;
    float r2 = dot(dir, dir);
    float k = uFisheye * uRadius;
    vec2 uvG = 0.5 + dir * (1.0 + k * r2);
    vec2 uvR = 0.5 + dir * (1.0 + k * (1.0 + uAberration.x) * r2);
    vec2 uvB = 0.5 + dir * (1.0 + k * (1.0 - uAberration.x) * r2);
    vec3 current = vec3(texture2D(tDiffuse, uvR).r, texture2D(tDiffuse, uvG).g, texture2D(tDiffuse, uvB).b);

    float split = uAberration.y * sin(uRadius * 3.14159265);
    vec2 revealOffset = vec2(wobble * settle);
    vec3 reveal = vec3(
      texture2D(tReveal, 0.5 + dir * (1.0 + split * r2) + revealOffset).r,
      texture2D(tReveal, vUv + revealOffset).g,
      texture2D(tReveal, 0.5 + dir * (1.0 - split * r2) + revealOffset).b
    );

    vec3 clean = texture2D(tDiffuse, vUv).rgb;
    vec3 composed = mix(reveal, current, outside);
    gl_FragColor = vec4(mix(clean, composed, uStrength), 1.0);
  }
`

const OUTPUT_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform float uFade;
  uniform float uVignette;
  uniform float uEdgeBlur;
  uniform float uTime;
  uniform vec2 uTexel;
  varying vec2 vUv;

  vec3 reinhard(vec3 color) {
    return clamp(color / (vec3(1.0) + color), 0.0, 1.0);
  }

  vec3 toSRGB(vec3 color) {
    return mix(pow(color, vec3(0.41666)) * 1.055 - vec3(0.055), color * 12.92, vec3(lessThanEqual(color, vec3(0.0031308))));
  }

  void main() {
    vec2 centred = vUv - 0.5;
    centred.x *= uTexel.y / uTexel.x;
    float edge = length(centred);
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    if (uEdgeBlur > 0.0) {
      // A small disc of taps whose radius grows away from the centre.
      float radius = smoothstep(0.18, 0.75, edge) * uEdgeBlur * 14.0;
      vec3 sum = color;
      for (int i = 0; i < 12; i++) {
        float angle = float(i) * 2.39996;
        float r = sqrt((float(i) + 0.5) / 12.0) * radius;
        sum += texture2D(tDiffuse, vUv + vec2(cos(angle), sin(angle)) * r * uTexel).rgb;
      }
      color = sum / 13.0;
    }
    color *= 1.0 - uVignette * smoothstep(0.2, 0.85, edge);
    color *= 1.0 - uFade;
    color = toSRGB(reinhard(color));
    // Fine film grain, strongest in the darks, which also hides gradient banding.
    vec2 seed = gl_FragCoord.xy + fract(uTime * 7.31) * vec2(113.7, 271.3);
    float grain = fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    float darks = 1.0 - smoothstep(0.0, 0.45, dot(color, vec3(0.299, 0.587, 0.114)));
    gl_FragColor = vec4(color + grain * mix(2.0, 9.0, darks) / 255.0, 1.0);
  }
`

/**
 * Renders a scene through the reference's chain: scene → (reveal transition)
 * → bloom → fade to black, Reinhard tone mapping and sRGB output.
 */
export class Post {
  private readonly sceneTarget: WebGLRenderTarget
  private readonly swapTarget: WebGLRenderTarget
  private revealTarget: WebGLRenderTarget | null = null
  private readonly bloom: UnrealBloomPass
  private readonly revealMaterial: ShaderMaterial
  private readonly outputMaterial: ShaderMaterial
  private readonly revealUniforms = {
    tDiffuse: { value: null as Texture | null },
    tReveal: { value: null as Texture | null },
    uRadius: { value: 0 },
    uStrength: { value: 0 },
    uFisheye: { value: -2.07 },
    uAberration: { value: new Vector2(0.2, 0.2) },
    uAspect: { value: 1 },
    uTime: { value: 0 },
  }
  private readonly outputUniforms = {
    tDiffuse: { value: null as Texture | null },
    uFade: { value: 1 },
    uVignette: { value: 0 },
    uEdgeBlur: { value: 0 },
    uTime: { value: 0 },
    uTexel: { value: new Vector2(1, 1) },
  }
  private readonly quad: FullScreenQuad
  private width = 1
  private height = 1
  private pixelRatio = 1

  constructor(
    private readonly renderer: WebGLRenderer,
    samples: number,
  ) {
    this.sceneTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples })
    this.swapTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: false })
    this.bloom = new UnrealBloomPass(new Vector2(256, 256), 0.3, 0.4, 0.43)
    this.revealMaterial = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: REVEAL_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: this.revealUniforms,
    })
    this.outputMaterial = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: OUTPUT_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: this.outputUniforms,
    })
    this.quad = new FullScreenQuad(this.outputMaterial)
  }

  setSize(width: number, height: number, pixelRatio: number): void {
    this.width = width
    this.height = height
    this.pixelRatio = pixelRatio
    const w = Math.max(1, Math.round(width * pixelRatio))
    const h = Math.max(1, Math.round(height * pixelRatio))
    this.sceneTarget.setSize(w, h)
    this.swapTarget.setSize(w, h)
    this.revealTarget?.setSize(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)))
    this.bloom.setSize(w, h)
    this.revealUniforms.uAspect.value = width / Math.max(1, height)
    this.outputUniforms.uTexel.value.set(1 / w, 1 / h)
  }

  render(
    scene: Scene,
    camera: Camera,
    bloom: BloomSettings,
    fade: number,
    reveal: RevealState | null,
    time: number,
    look: Look,
    stages: Stages = ALL_STAGES,
  ): void {
    const { renderer } = this
    if (stages.scene) {
      renderer.setRenderTarget(this.sceneTarget)
      renderer.clear()
      renderer.render(scene, camera)
    }
    let current = this.sceneTarget

    if (stages.reveal && reveal && reveal.strength > 0.001) {
      if (!this.revealTarget) {
        // Half resolution: the reveal is distorted and split into colours anyway.
        this.revealTarget = new WebGLRenderTarget(
          Math.max(1, Math.round((this.width * this.pixelRatio) / 2)),
          Math.max(1, Math.round((this.height * this.pixelRatio) / 2)),
          { type: HalfFloatType },
        )
      }
      renderer.setRenderTarget(this.revealTarget)
      renderer.clear()
      renderer.render(scene, reveal.camera)
      const uniforms = this.revealUniforms
      uniforms.tDiffuse.value = current.texture
      uniforms.tReveal.value = this.revealTarget.texture
      uniforms.uRadius.value = reveal.radius
      uniforms.uStrength.value = reveal.strength
      uniforms.uTime.value = time
      this.quad.material = this.revealMaterial
      renderer.setRenderTarget(this.swapTarget)
      this.quad.render(renderer)
      current = this.swapTarget
    }

    if (stages.bloom && bloom.enabled && bloom.strength > 0.001) {
      this.bloom.strength = bloom.strength
      this.bloom.radius = bloom.radius
      this.bloom.threshold = bloom.threshold
      this.bloom.render(renderer, current, current, 0, false)
    }

    if (!stages.output) return
    this.outputUniforms.tDiffuse.value = current.texture
    this.outputUniforms.uFade.value = fade
    this.outputUniforms.uVignette.value = look.vignette
    this.outputUniforms.uEdgeBlur.value = look.edgeBlur
    this.outputUniforms.uTime.value = time
    this.quad.material = this.outputMaterial
    renderer.setRenderTarget(null)
    this.quad.render(renderer)
  }

  /**
   * Starts compiling `scene`'s shaders for the target the scene is really
   * drawn into (a linear HDR target, not the screen), so the programs match
   * and the first real frame does not compile again. Hidden objects are
   * included. Resolves once the browser reports the programs ready.
   */
  compile(scene: Object3D, camera: Camera): Promise<void> {
    return this.compileFor(this.sceneTarget, scene, camera)
  }

  /** Warms the post-processing shaders the same way. */
  warmPasses(): Promise<void> {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    // Same attributes as FullScreenQuad's triangle (position + uv, no normals), so the programs match.
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3))
    geometry.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2))
    const offscreen = new ThreeScene()
    const materials = [
      this.revealMaterial,
      this.bloom.materialHighPassFilter,
      ...this.bloom.separableBlurMaterials,
      this.bloom.compositeMaterial,
      this.bloom.blendMaterial,
    ]
    for (const material of materials) offscreen.add(new Mesh(geometry, material))
    const screen = new ThreeScene()
    screen.add(new Mesh(geometry, this.outputMaterial))
    return Promise.all([this.compileFor(this.swapTarget, offscreen, camera), this.compileFor(null, screen, camera)]).then(
      () => geometry.dispose(),
    )
  }

  private compileFor(target: WebGLRenderTarget | null, root: Object3D, camera: Camera): Promise<void> {
    const { renderer } = this
    const hidden: Object3D[] = []
    root.traverse((object) => {
      if (!object.visible) {
        hidden.push(object)
        object.visible = true
      }
    })
    const previous = renderer.getRenderTarget()
    renderer.setRenderTarget(target)
    // three compiles synchronously inside compileAsync, then only waits, so state can be restored at once.
    const ready = renderer.compileAsync(root, camera)
    renderer.setRenderTarget(previous)
    for (const object of hidden) object.visible = false
    return ready.then(() => undefined)
  }

  dispose(): void {
    this.sceneTarget.dispose()
    this.swapTarget.dispose()
    this.revealTarget?.dispose()
    this.bloom.dispose()
    this.revealMaterial.dispose()
    this.outputMaterial.dispose()
    this.quad.dispose()
  }
}
