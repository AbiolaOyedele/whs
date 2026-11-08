'use client'

import { useEffect, useRef } from 'react'
import { getGsap, motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'

/**
 * Cubes are drawn at "close-up" size on a wide grid, then the whole grid is
 * scaled down around the card's centre: at 1 the pink centre cube fills the
 * card, at ZOOM_OUT the full grid shows.
 */
const VIEW_W = 707
const VIEW_H = 600
const PIVOT = { x: 353.5, y: 300 }
const ZOOM_OUT = 0.35
/** Close-up cube: half-width and half-height of the top face, side height. */
const A = 125
const B = 74.5
const RISE = 149
const STEP_X = 294.3
const STEP_Y = 265
/** Rows above and below the centre row, and cubes either side of centre. */
const ROWS = 3
const COLS = 4

/** One run lasts seven seconds, then starts again. */
const RUN = 7
const ZOOM_OUT_AT = 0.27
const ZOOM_OUT_FOR = 2.73
const ZOOM_IN_AT = 4
const ZOOM_IN_FOR = 2.63
/** Grey cubes start 0–1.5s in, rise half a second later and sink 3.8s after starting. */
const START_SPREAD = 1.5
const RISE_DELAY = 0.5
const RISE_FOR = 1.32
const SINK_AFTER = 3.82
const SINK_FOR = 1.27

const BACKGROUND = '#eef2f5'
const GREY = { top: [224, 231, 236], left: '#cdd7db', right: '#b5bbbf', edge: '#d3dbe1' } as const
const PINK = { top: '#fec1f1', left: '#f1a8e1', right: '#e858b8' } as const

interface CubeSpot {
  x: number
  y: number
  center: boolean
}

/** A honeycomb of cubes, rows alternately shifted half a step, one cube dead centre. */
function layoutCubes(): CubeSpot[] {
  const spots: CubeSpot[] = []
  for (let r = -ROWS; r <= ROWS; r++) {
    const shifted = Math.abs(r) % 2 === 1
    for (let c = -COLS; c <= COLS; c++) {
      const x = PIVOT.x + c * STEP_X + (shifted ? STEP_X / 2 : 0)
      const y = PIVOT.y + r * STEP_Y
      spots.push({ x, y, center: r === 0 && c === 0 })
    }
  }
  return spots
}

const SPOTS = layoutCubes()

/** The faces of a cube whose sides stand `p` (0 flat, 1 full) high, base fixed. */
function faces(spot: CubeSpot, p: number): { top: string; left: string; right: string } {
  const { x, y } = spot
  const base = y + RISE / 2
  const top = base - RISE * p
  const pts = (list: [number, number][]) => list.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')
  return {
    top: pts([
      [x, top - B],
      [x + A, top],
      [x, top + B],
      [x - A, top],
    ]),
    left: pts([
      [x - A, top],
      [x, top + B],
      [x, base + B],
      [x - A, base],
    ]),
    right: pts([
      [x + A, top],
      [x, top + B],
      [x, base + B],
      [x + A, base],
    ]),
  }
}

/** The grey top face fades in from the background colour as the cube rises. */
function greyTop(p: number): string {
  const from = [238, 242, 245]
  const mix = GREY.top.map((to, i) => Math.round((from[i] ?? 0) + (to - (from[i] ?? 0)) * p))
  return `rgb(${mix.join(' ')})`
}

function zoomTransform(scale: number): string {
  return `translate(${PIVOT.x} ${PIVOT.y}) scale(${scale}) translate(${-PIVOT.x} ${-PIVOT.y})`
}

/**
 * A light card that opens close up on one pink cube, then pulls back while
 * grey cubes rise one by one from flat outlines around it until the grid is
 * full; they sink again as it zooms back in. Starts over each time the card
 * comes back on screen.
 */
export function CubesCard() {
  const svg = useRef<SVGSVGElement>(null)
  const camera = useRef<SVGGElement>(null)
  const cubes = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    const root = svg.current
    const cam = camera.current
    if (!root || !cam) return

    const draw = (index: number, p: number) => {
      const group = cubes.current[index]
      const spot = SPOTS[index]
      if (!group || !spot || spot.center) return
      const shape = faces(spot, p)
      const [topFace, leftFace, rightFace] = Array.from(group.children) as SVGPolygonElement[]
      topFace?.setAttribute('points', shape.top)
      topFace?.setAttribute('fill', greyTop(p))
      topFace?.setAttribute('stroke-opacity', String(Math.max(0, 1 - p * 3)))
      leftFace?.setAttribute('points', shape.left)
      rightFace?.setAttribute('points', shape.right)
      const hidden = p < 0.001 ? '0' : '1'
      leftFace?.setAttribute('opacity', hidden)
      rightFace?.setAttribute('opacity', hidden)
    }

    if (!motionAllowed()) {
      cam.setAttribute('transform', zoomTransform(ZOOM_OUT))
      SPOTS.forEach((_, index) => draw(index, 1))
      return
    }

    const gsap = getGsap()
    const view = { scale: 1 }
    const heights = SPOTS.map(() => ({ p: 0 }))
    const render = () => {
      cam.setAttribute('transform', zoomTransform(view.scale))
      heights.forEach((height, index) => draw(index, height.p))
    }

    const tl = gsap.timeline({ paused: true, repeat: -1, onUpdate: render, onRepeat: render })
    tl.set(view, { scale: 1 }, 0)
    tl.set(heights, { p: 0 }, 0)
    tl.to(view, { scale: ZOOM_OUT, duration: ZOOM_OUT_FOR, ease: 'power3.out' }, ZOOM_OUT_AT)
    tl.to(view, { scale: 1, duration: ZOOM_IN_FOR, ease: 'power2.inOut' }, ZOOM_IN_AT)
    heights.forEach((height, index) => {
      if (SPOTS[index]?.center) return
      const start = 0.02 + Math.random() * START_SPREAD
      tl.to(height, { p: 1, duration: RISE_FOR, ease: 'power3.out' }, start + RISE_DELAY)
      tl.to(height, { p: 0, duration: SINK_FOR, ease: 'power2.inOut' }, start + SINK_AFTER)
    })
    tl.to({}, { duration: 0.01 }, RUN)

    const unobserve = observeInview(root, (_entry, visible) => {
      if (visible) tl.restart()
      else tl.pause(0)
    })
    return () => {
      unobserve()
      tl.kill()
    }
  }, [])

  return (
    <div className="aspect-707/600 overflow-hidden rounded-lg bg-slate-100">
      <svg
        ref={svg}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="block size-full"
        aria-hidden="true"
      >
        <rect width={VIEW_W} height={VIEW_H} fill={BACKGROUND} />
        <g ref={camera} transform={zoomTransform(1)}>
          {SPOTS.map((spot, index) => {
            const tone = spot.center ? PINK : null
            const shape = faces(spot, spot.center ? 1 : 0)
            return (
              <g
                key={index}
                ref={(node) => {
                  cubes.current[index] = node
                }}
              >
                <polygon
                  points={shape.top}
                  fill={tone ? tone.top : greyTop(0)}
                  stroke={tone ? 'none' : GREY.edge}
                  strokeWidth="3"
                />
                <polygon points={shape.left} fill={tone ? tone.left : GREY.left} opacity={tone ? 1 : 0} />
                <polygon points={shape.right} fill={tone ? tone.right : GREY.right} opacity={tone ? 1 : 0} />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
