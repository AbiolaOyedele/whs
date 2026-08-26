/**
 * Animated WebGL gradient.
 *
 * Adapted from the supplied component. The shader and preset maths are intact;
 * the render loop and lifecycle are substantially reworked, because as written
 * it drove `requestAnimationFrame` forever — burning GPU and battery while
 * scrolled out of view, while the tab was hidden, and for visitors who have
 * asked for reduced motion.
 *
 * What changed, and why:
 *  1. Renders only while on screen (IntersectionObserver) and only while the
 *     tab is visible (visibilitychange). A footer gradient no longer animates
 *     behind six screens of content.
 *  2. `prefers-reduced-motion: reduce` draws one static frame and stops. The
 *     gradient still shows; it just does not move.
 *  3. Colours are parsed once, not three times per frame at 60fps, and uniforms
 *     that never change are uploaded once at setup instead of every frame.
 *  4. Device pixel ratio is capped at 2. Uncapped, a 3x phone renders 2.25x the
 *     fragments for no visible gain — this is the single biggest fill-rate win.
 *  5. Shader compile and link status are checked. On failure the component
 *     unmounts itself and the CSS gradient underneath shows through, rather
 *     than leaving a blank canvas where the background should be.
 *  6. The config is compared by value, so a parent re-render no longer tears
 *     down and rebuilds the entire WebGL context.
 *  7. The context is explicitly released on unmount — browsers allow a limited
 *     number of live WebGL contexts, and Astro islands mount per page.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

type PatternShape = 'Checks' | 'Stripes' | 'Edge'

const PATTERN_SHAPES: Record<PatternShape, number> = { Checks: 0, Stripes: 1, Edge: 2 }

export interface GradientParams {
  color1: string
  color2: string
  color3: string
  rotation: number
  proportion: number
  scale: number
  speed: number
  distortion: number
  swirl: number
  swirlIterations: number
  softness: number
  offset: number
  shape: PatternShape
  shapeSize: number
}

/**
 * House presets. `hero` and `footer` are the Prism preset with its blue swapped
 * for the WildHands lime; `footer` is slower and softer so it sits back behind
 * the link columns instead of competing with them.
 *
 * `speed` maps to `(speed / 100) * 5` in the render loop, so 7 is a drift of
 * about 0.35 units/second — slow enough to read as ambient rather than as an
 * animation demanding attention.
 */
export const GRADIENT_PRESETS = {
  hero: {
    color1: '#050505',
    color2: '#befc65',
    color3: '#ffffff',
    rotation: -50,
    proportion: 1,
    scale: 0.01,
    speed: 7,
    distortion: 0,
    swirl: 50,
    swirlIterations: 12,
    softness: 47,
    offset: -299,
    shape: 'Checks',
    shapeSize: 45,
  },
  footer: {
    color1: '#050505',
    color2: '#befc65',
    color3: '#0f0f10',
    rotation: -30,
    proportion: 28,
    scale: 0.03,
    speed: 4,
    distortion: 2,
    swirl: 40,
    swirlIterations: 8,
    softness: 80,
    offset: -120,
    shape: 'Checks',
    shapeSize: 60,
  },
} satisfies Record<string, GradientParams>

export type GradientPreset = keyof typeof GRADIENT_PRESETS

interface AnimatedGradientProps {
  preset?: GradientPreset
  /** Overrides on top of the preset. */
  overrides?: Partial<GradientParams>
  className?: string
  style?: CSSProperties
}

export default function AnimatedGradient({
  preset = 'hero',
  overrides,
  className,
  style,
}: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState(false)

  // Compared by value so a parent re-render does not rebuild the GL context.
  const paramsKey = JSON.stringify({ preset, overrides })
  const params = useMemo<GradientParams>(
    () => ({ ...GRADIENT_PRESETS[preset], ...overrides }),
    [paramsKey]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    })
    if (!gl) {
      setFailed(true)
      return
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[AnimatedGradient] shader compile failed:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) {
      setFailed(true)
      return
    }

    const program = gl.createProgram()
    if (!program) {
      setFailed(true)
      return
    }
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[AnimatedGradient] program link failed:', gl.getProgramInfoLog(program))
      setFailed(true)
      return
    }
    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const u = (name: string) => gl.getUniformLocation(program, name)
    const uTime = u('u_time')
    const uResolution = u('u_resolution')

    // Parsed once. The original re-parsed three hex strings every frame.
    const c1 = hexToRgba(params.color1)
    const c2 = hexToRgba(params.color2)
    const c3 = hexToRgba(params.color3)

    // Uniforms that never change during the loop — upload them once.
    gl.uniform1f(u('u_pixelRatio'), Math.min(window.devicePixelRatio || 1, 2))
    gl.uniform1f(u('u_scale'), params.scale)
    gl.uniform1f(u('u_rotation'), (params.rotation * Math.PI) / 180)
    gl.uniform4f(u('u_color1'), c1[0], c1[1], c1[2], c1[3])
    gl.uniform4f(u('u_color2'), c2[0], c2[1], c2[2], c2[3])
    gl.uniform4f(u('u_color3'), c3[0], c3[1], c3[2], c3[3])
    gl.uniform1f(u('u_proportion'), params.proportion / 100)
    gl.uniform1f(u('u_softness'), params.softness / 100)
    gl.uniform1f(u('u_shape'), PATTERN_SHAPES[params.shape])
    gl.uniform1f(u('u_shapeScale'), params.shapeSize / 100)
    gl.uniform1f(u('u_distortion'), params.distortion / 50)
    gl.uniform1f(u('u_swirl'), params.swirl / 100)
    gl.uniform1f(u('u_swirlIterations'), params.swirl === 0 ? 0 : params.swirlIterations)

    // Cap DPR at 2: a 3x display renders 2.25x the fragments for no visible gain.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const speed = (params.speed / 100) * 5
    const start = performance.now()
    let frameId: number | undefined
    let onScreen = true
    let running = false

    const drawAt = (elapsedSeconds: number) => {
      gl.uniform1f(uTime, elapsedSeconds * speed + params.offset * 0.01)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const tick = (now: number) => {
      drawAt((now - start) / 1000)
      frameId = requestAnimationFrame(tick)
    }

    const stop = () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId)
      frameId = undefined
      running = false
    }

    /** Animate only while on screen, visible, and motion is welcome. */
    const sync = () => {
      const shouldRun = onScreen && !document.hidden && !reduceMotion.matches
      if (shouldRun && !running) {
        running = true
        frameId = requestAnimationFrame(tick)
      } else if (!shouldRun && running) {
        stop()
      }
      // Reduced motion still gets the gradient — just one static frame of it.
      if (reduceMotion.matches) drawAt(0)
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? false
        sync()
      },
      { rootMargin: '120px' }
    )
    intersectionObserver.observe(container)

    document.addEventListener('visibilitychange', sync)
    reduceMotion.addEventListener('change', sync)
    sync()

    return () => {
      stop()
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      reduceMotion.removeEventListener('change', sync)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(positionBuffer)
      // Browsers cap live WebGL contexts; release this one rather than waiting
      // for GC, since islands mount and unmount per page.
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [params])

  // On failure render nothing, so whatever CSS background sits behind shows through.
  if (failed) return null

  return (
    <div
      ref={containerRef}
      className={['wh-gradient', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb(), rgba() into normalised RGBA. */
function hexToRgba(input: string): [number, number, number, number] {
  let r = 0
  let g = 0
  let b = 0
  let a = 1

  if (input.startsWith('rgba(') || input.startsWith('rgb(')) {
    const parts = input.slice(input.indexOf('(') + 1, -1).split(',')
    r = Number(parts[0]) / 255
    g = Number(parts[1]) / 255
    b = Number(parts[2]) / 255
    if (parts[3] !== undefined) a = Number(parts[3])
  } else if (input.startsWith('#')) {
    const c = input.slice(1)
    if (c.length === 3) {
      r = parseInt(c[0]! + c[0]!, 16) / 255
      g = parseInt(c[1]! + c[1]!, 16) / 255
      b = parseInt(c[2]! + c[2]!, 16) / 255
    } else if (c.length >= 6) {
      r = parseInt(c.slice(0, 2), 16) / 255
      g = parseInt(c.slice(2, 4), 16) / 255
      b = parseInt(c.slice(4, 6), 16) / 255
      if (c.length === 8) a = parseInt(c.slice(6, 8), 16) / 255
    }
  }

  return [r, g, b, a]
}

const VERTEX_SHADER = `#version 300 es
in vec4 a_position;
void main() { gl_Position = a_position; }`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_scale;
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
  vec3 color1 = c1.rgb * c1.a;
  vec3 color2 = c2.rgb * c2.a;
  vec3 color3 = c3.rgb * c3.a;
  float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);
  float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);
  vec3 blended_color_2 = mix(color1, color2, r1);
  float blended_opacity_2 = mix(c1.a, c2.a, r1);
  return vec4(mix(blended_color_2, color3, r2), mix(blended_opacity_2, c3.a, r2));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = .5 * u_time;
  float noise_scale = .0005 + .006 * u_scale;

  uv -= .5;
  uv *= (noise_scale * u_resolution);
  uv = rotate(uv, u_rotation * .5 * PI);
  uv /= u_pixelRatio;
  uv += .5;

  float n1 = noise(uv * 1. + t);
  float n2 = noise(uv * 2. - t);
  float angle = n1 * TWO_PI;
  uv.x += 4. * u_distortion * n2 * cos(angle);
  uv.y += 4. * u_distortion * n2 * sin(angle);

  float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
  for (float i = 1.; i <= iterations_number; i++) {
    uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
    uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);
  }

  float proportion = clamp(u_proportion, 0., 1.);
  float shape = 0.;
  float mixer = 0.;

  if (u_shape < .5) {
    vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);
    shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else if (u_shape < 1.5) {
    vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);
    float f = fract(stripes_shape_uv.y);
    shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else {
    float sh = 1. - uv.y;
    sh -= .5;
    sh /= (noise_scale * u_resolution.y);
    sh += .5;
    float shape_scaling = .2 * (1. - u_shapeScale);
    shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
    mixer = shape;
  }

  vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);
  fragColor = vec4(color_mix.rgb, color_mix.a);
}
`
