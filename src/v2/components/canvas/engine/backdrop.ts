import { Color, Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three'

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uClear;
  uniform vec2 uCenter;
  uniform float uOffset;
  uniform float uSoftness;
  uniform float uSpread;
  uniform float uNoise;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    float radial = length(vUv - uCenter) * 2.0;
    float t = clamp(radial + uOffset, 0.0, 1.0);
    t = clamp((t - 0.5) / max(uSoftness, 0.0001) + 0.5, 0.0, 1.0);
    // Per-pixel noise (cheap); the output pass adds the moving film grain on top.
    float n = hash(gl_FragCoord.xy) * 2.0 - 1.0;
    t = clamp(t + n * uNoise, 0.0, 1.0);
    t = pow(t, uSpread);
    vec3 gradient = mix(uColorA, uColorB, t);
    gl_FragColor = vec4(mix(uClear, gradient, uOpacity), 1.0);
  }
`

/**
 * The dark radial glow behind the home and use-case scenes: black in the top
 * left warming to plum in the bottom right. Drawn first, outside the fog.
 */
export function createBackdrop(clearColor: Color, opacity = 1): Mesh<PlaneGeometry, ShaderMaterial> {
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    depthTest: false,
    depthWrite: false,
    fog: false,
    uniforms: {
      uColorA: { value: new Color('#000000') },
      uColorB: { value: new Color('#2d0b23') },
      uClear: { value: clearColor.clone() },
      uCenter: { value: new Vector2(0.2, 0.77) },
      uOffset: { value: 0.08 },
      uSoftness: { value: 0.95 },
      uSpread: { value: 6.6 },
      uNoise: { value: 0.05 },
      uOpacity: { value: opacity },
    },
  })
  const mesh = new Mesh(new PlaneGeometry(2, 2), material)
  mesh.frustumCulled = false
  mesh.renderOrder = -1000
  return mesh
}
