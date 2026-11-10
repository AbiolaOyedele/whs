'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { observeInview } from '@v2/lib/inview'
import { motionAllowed } from '@v2/lib/gsap'
import { burstCells, HEX_PATH, HEX_POINTS, landCells, MAP_HEIGHT, MAP_WIDTH } from './HomeMapGeometry'

export interface MapPoint {
  /** 0–100 across the map (use nigeriaCityPoint() from HomeMapGeometry). */
  x: number
  /** 0–100 down the map. */
  y: number
  label: string
}

export interface MapCardProps {
  points: MapPoint[]
}

/** One wave of bursts every 178 frames at 60fps, like the reference's map. */
const WAVE_MS = 2967
const WAVES = 3
/** Dot colour of the land, from the reference. */
const LAND = '#131314'

/** Splits the points into three waves (fewer if there are only one or two). */
function toWaves(points: MapPoint[]): MapPoint[][] {
  const count = Math.min(WAVES, points.length)
  if (count === 0) return []
  const size = Math.ceil(points.length / count)
  return Array.from({ length: count }, (_, i) => points.slice(i * size, (i + 1) * size)).filter((w) => w.length > 0)
}

function drawLand(canvas: HTMLCanvasElement): void {
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (!width || !height) return
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const scale = (width / MAP_WIDTH) * ratio
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Filling thousands of hexagons as one path is slow; draw one into a small
  // sprite and stamp it at every land cell instead.
  const xs = HEX_POINTS.map(([x]) => x)
  const ys = HEX_POINTS.map(([, y]) => y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const spriteW = Math.ceil((Math.max(...xs) - minX) * scale) + 2
  const spriteH = Math.ceil((Math.max(...ys) - minY) * scale) + 2
  const sprite = document.createElement('canvas')
  sprite.width = spriteW
  sprite.height = spriteH
  const sctx = sprite.getContext('2d')
  if (!sctx) return
  sctx.setTransform(scale, 0, 0, scale, 1 - minX * scale, 1 - minY * scale)
  sctx.fillStyle = LAND
  sctx.beginPath()
  HEX_POINTS.forEach(([x, y], i) => (i === 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y)))
  sctx.closePath()
  sctx.fill()

  const offsetX = minX * scale - 1
  const offsetY = minY * scale - 1
  for (const cell of landCells()) {
    ctx.drawImage(sprite, Math.round(cell.x * scale + offsetX), Math.round(cell.y * scale + offsetY))
  }
}

/**
 * A white card holding a hex-dot map of Nigeria. Pink bursts of dots
 * bloom over the given places in three waves, each with a small navy name
 * tag that rises in, then the wave fades and the next one starts. Still and
 * showing the first wave when motion is reduced.
 */
export function MapCard({ points }: MapCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [tick, setTick] = useState(0)
  const [animated, setAnimated] = useState(false)
  const waves = useMemo(() => toWaves(points), [points])

  // The map sits far below the fold: draw it only when it is about a screen away, so it costs nothing at load.
  useEffect(() => {
    const el = canvas.current
    if (!el) return
    let resize: ResizeObserver | null = null
    const stopWatching = observeInview(
      el,
      (_entry, near) => {
        if (!near || resize) return
        stopWatching()
        drawLand(el)
        resize = new ResizeObserver(() => drawLand(el))
        resize.observe(el)
      },
      '100% 0px 100% 0px',
    )
    return () => {
      stopWatching()
      resize?.disconnect()
    }
  }, [])

  useEffect(() => {
    const el = host.current
    if (!el || !motionAllowed() || waves.length < 2) return
    let timer: number | null = null
    const stop = () => {
      if (timer !== null) window.clearInterval(timer)
      timer = null
    }
    const stopObserving = observeInview(el, (_entry, visible) => {
      stop()
      if (!visible) return
      setAnimated(true)
      setTick((t) => t + 1)
      timer = window.setInterval(() => setTick((t) => t + 1), WAVE_MS)
    })
    return () => {
      stop()
      stopObserving()
    }
  }, [waves.length])

  /** The current wave, plus the one before it while it fades out. */
  const shown = animated ? [tick - 1, tick].filter((t) => t > 0) : [0]

  return (
    <div className="c-map-card relative">
      <div
        ref={host}
        className="relative overflow-hidden rounded-lg bg-white max-sm:aspect-square sm:aspect-707/600"
        role="img"
        aria-label={`Map of Nigeria marking ${points.map((p) => p.label).join(', ')}`}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 top-1/2 aspect-707/600 -translate-y-1/2">
            <canvas ref={canvas} className="absolute inset-0 size-full" />
            {shown.map((t) => {
              const wave = waves[animated ? (t - 1) % waves.length : 0] ?? []
              return (
                <div key={t} className={`absolute inset-0 ${animated ? 'c-map-wave' : ''}`}>
                  <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0 size-full" aria-hidden="true">
                    {wave.map((point, index) => (
                      <g key={point.label} style={{ ['--map-i' as string]: index } as CSSProperties}>
                        {burstCells((point.x / 100) * MAP_WIDTH, (point.y / 100) * MAP_HEIGHT).map((cell) => (
                          <g key={`${cell.q}:${cell.r}`} transform={`translate(${cell.x} ${cell.y})`}>
                            <path
                              d={HEX_PATH}
                              className="c-map-cell fill-pink-500"
                              opacity={cell.ring === 3 ? 0.4 : 1}
                              style={{ ['--map-ring' as string]: Math.min(cell.ring, 3) } as CSSProperties}
                            />
                          </g>
                        ))}
                      </g>
                    ))}
                  </svg>
                  {wave.map((point, index) => (
                    <span
                      key={point.label}
                      aria-hidden="true"
                      className={`c-map-tag absolute rounded-[4px] bg-navy-900 px-1.5 py-[3px] text-[12px] leading-none tracking-[0.01em] text-nowrap text-white ${
                        point.x > 72 ? '-is-left' : ''
                      }`}
                      style={{ left: `${point.x}%`, top: `${point.y}%`, ['--map-i' as string]: index } as CSSProperties}
                    >
                      {point.label}
                    </span>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
