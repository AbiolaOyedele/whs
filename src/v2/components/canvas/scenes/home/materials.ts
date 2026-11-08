import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MeshStandardMaterial,
  ShaderMaterial,
  type WebGLProgramParametersWithUniforms,
} from 'three'

/**
 * The ribbons' matte plum with a fine speckle: each fragment is pulled a
 * little towards the background colour by a stable hash of its position.
 */
export function createSpeckledMaterial(color: Color, clearColor: Color, roughness = 0.82): MeshStandardMaterial {
  const material = new MeshStandardMaterial({ color, roughness, metalness: 0, side: DoubleSide })
  const uniforms = {
    uClearColor: { value: clearColor.clone() },
    uNoiseAmplitude: { value: 0.55 },
  }
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSpeckle;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSpeckle = position;')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vSpeckle;
        uniform vec3 uClearColor;
        uniform float uNoiseAmplitude;
        float speckleHash(vec3 p) {
          p = fract(p * 0.1031);
          p += dot(p, p.yzx + 33.33);
          return fract((p.x + p.y) * p.z);
        }`,
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `vec3 speckleP = vSpeckle * 900.0;
        float speckle = (speckleHash(speckleP) + speckleHash(speckleP * 2.7) * 0.4) / 1.4;
        float darken = mix(uNoiseAmplitude, 1.0, smoothstep(-0.4, 0.1, speckle));
        vec4 diffuseColor = vec4(mix(uClearColor, diffuse, darken), opacity);`,
      )
  }
  material.customProgramCacheKey = () => 'speckled-ribbon'
  return material
}

const PULSE_VERTEX = /* glsl */ `
  attribute vec3 aParams;
  attribute float aFront;
  varying vec2 vUv;
  varying vec3 vParams;
  varying float vFront;
  varying float vDepth;
  void main() {
    vUv = uv;
    vParams = aParams;
    vFront = aFront;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const PULSE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uSize;
  uniform float uSmooth;
  uniform float uMinInterval;
  uniform float uMaxInterval;
  uniform float uDuration;
  uniform float uMaxDepth;
  uniform float uSweep;
  uniform vec3 uSweepColor;
  varying vec2 vUv;
  varying vec3 vParams;
  varying float vFront;
  varying float vDepth;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  float pulseAt(float cycle, float t, float interval) {
    float trigger = cycle * interval + hash11(cycle + vParams.x * 100.0) * interval * 0.4;
    float progress = clamp((t - trigger) / uDuration, 0.0, 1.0);
    float fade = smoothstep(0.0, uSize, progress) * smoothstep(0.0, uSize, 1.0 - progress);
    float y = vUv.y - progress;
    return smoothstep(0.0, uSmooth, y + uSize) * smoothstep(0.0, uSmooth, uSize - y) * fade;
  }

  void main() {
    float interval = mix(uMinInterval, uMaxInterval, vParams.y);
    float t = uTime * uSpeed * vParams.z + vParams.x * interval;
    float cycle = floor(t / interval);
    float pulse = max(pulseAt(cycle, t, interval), pulseAt(cycle - 1.0, t, interval));
    float across = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
    float visible = uMaxDepth <= 0.0 ? 1.0 : step(vDepth, uMaxDepth);
    float alpha = pulse * across * visible * uOpacity;

    // The hero sweep: one long bright light along the front ribbons.
    float sweep = 0.0;
    if (vFront > 0.5 && uSweep >= 0.0) {
      float y = vUv.y - uSweep;
      float window = smoothstep(0.0, 0.16, y + 0.2) * smoothstep(0.0, 0.015, 0.012 - y);
      sweep = window * smoothstep(0.0, 0.06, uSweep) * (1.0 - smoothstep(0.9, 1.0, uSweep)) * across * uOpacity;
    }
    if (alpha + sweep < 0.002) discard;
    gl_FragColor = vec4(uColor * alpha + uSweepColor * sweep, max(alpha, sweep));
  }
`

export type PulseUniforms = {
  uColor: { value: Color }
  uOpacity: { value: number }
  uTime: { value: number }
  uSpeed: { value: number }
  uSize: { value: number }
  uSmooth: { value: number }
  uMinInterval: { value: number }
  uMaxInterval: { value: number }
  uDuration: { value: number }
  uMaxDepth: { value: number }
  /** 0 → 1 position of the hero sweep, below 0 when none is running. */
  uSweep: { value: number }
  uSweepColor: { value: Color }
}

/** Light that runs along a strip now and then: a short bright window sweeping `uv.y` 0 → 1. */
export function createPulseMaterial(color: Color): { material: ShaderMaterial; uniforms: PulseUniforms } {
  const uniforms: PulseUniforms = {
    uColor: { value: color.clone() },
    uOpacity: { value: 1 },
    uTime: { value: 0 },
    uSpeed: { value: 0.19 },
    uSize: { value: 0.035 },
    uSmooth: { value: 0.02 },
    uMinInterval: { value: 0.2 },
    uMaxInterval: { value: 1 },
    uDuration: { value: 0.8 },
    uMaxDepth: { value: 7.5 },
    uSweep: { value: -1 },
    uSweepColor: { value: new Color(0.96, 1, 0.92).multiplyScalar(5) },
  }
  const material = new ShaderMaterial({
    vertexShader: PULSE_VERTEX,
    fragmentShader: PULSE_FRAGMENT,
    uniforms,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
  })
  return { material, uniforms }
}
