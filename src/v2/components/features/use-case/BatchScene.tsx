'use client'

import { useEffect, useRef } from 'react'
import { getGsap, motionAllowed } from '@v2/lib/gsap'

export type BatchPattern = 'together' | 'groups' | 'stream'

interface BatchSceneProps {
  pattern: BatchPattern
  /** True while this scene's tab is chosen and the card is on screen. */
  playing: boolean
  /** Called when one run of the scene ends, so the card can move on. */
  onDone: () => void
}

/** The panel is drawn on a 558 × 359 grid, the same shape as its frame. */
const VIEW_W = 558
const VIEW_H = 359
const TRAY_Y = 75
const SQUARE = 52
const PITCH = 62
const PAD = 10
const TRAY_H = 72
/** Cube: centre of its top face, half-width, half-height, side height. */
const CUBE = { x: 279.5, y: 199, a: 71, b: 42, rise: 84 }
/** Where a tray lands as it shrinks away: the middle of the cube. */
const LANDING = { x: CUBE.x, y: CUBE.y + CUBE.b }
const RUN = 4.5

interface Tray {
  x: number
  slots: number
  /** When each slot's square pops in, in seconds. */
  fills: number[]
  /** When the full tray drops into the cube. */
  drop: number
  /** When an empty tray pops back in its place. */
  refill: number
}

const STREAM_PITCH = 85.5
const streamX = (index: number) => CUBE.x + (index - 1.5) * STREAM_PITCH

/** One tray of four; two trays of two; four trays of one, each dropping on its own. */
const SCENES: Record<BatchPattern, Tray[]> = {
  together: [{ x: CUBE.x, slots: 4, fills: [0, 0.5, 1, 1.5], drop: 2.75, refill: 3.5 }],
  groups: [
    { x: 205.5, slots: 2, fills: [0, 0.5], drop: 1.47, refill: 3.13 },
    { x: 353.5, slots: 2, fills: [1, 1.5], drop: 2.58, refill: 3.5 },
  ],
  stream: [0, 1, 2, 3].map((index) => ({
    x: streamX(index),
    slots: 1,
    fills: [index * 0.5],
    drop: [0.9, 1.5, 2.17, 2.78][index] ?? 0.9,
    refill: 3.32 + index * 0.18,
  })),
}

const trayWidth = (slots: number) => slots * SQUARE + (slots - 1) * PAD + PAD * 2
const slotX = (slot: number, slots: number) => (slot - (slots - 1) / 2) * PITCH - SQUARE / 2

const face = (list: [number, number][]) => list.map(([x, y]) => `${x},${y}`).join(' ')
const { x: cx, y: cy, a, b, rise } = CUBE
const CUBE_FACES = {
  bottom: face([
    [cx - a, cy + rise],
    [cx, cy + rise - b],
    [cx + a, cy + rise],
    [cx, cy + rise + b],
  ]),
  top: face([
    [cx - a, cy],
    [cx, cy - b],
    [cx + a, cy],
    [cx, cy + b],
  ]),
  left: face([
    [cx - a, cy],
    [cx, cy + b],
    [cx, cy + b + rise],
    [cx - a, cy + rise],
  ]),
  right: face([
    [cx + a, cy],
    [cx, cy + b],
    [cx, cy + b + rise],
    [cx + a, cy + rise],
  ]),
}

/**
 * A light panel with white trays above a see-through pink cube. Squares pop
 * into the tray slots one by one, then a full tray drops into the cube and
 * shrinks away while an empty one pops back. The tabs differ in how the
 * trays are split: one tray of four, two of two, or four of one.
 */
export function BatchScene({ pattern, playing, onDone }: BatchSceneProps) {
  const root = useRef<SVGSVGElement>(null)
  const done = useRef(onDone)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const trays = SCENES[pattern]

  useEffect(() => {
    done.current = onDone
  }, [onDone])

  useEffect(() => {
    const svg = root.current
    if (!svg) return
    const gsap = getGsap()
    const leaving = Array.from(svg.querySelectorAll<SVGGElement>('[data-tray="leaving"]'))
    const returning = Array.from(svg.querySelectorAll<SVGGElement>('[data-tray="returning"]'))
    const squares = leaving.map((tray) => Array.from(tray.querySelectorAll<SVGRectElement>('[data-square]')))
    const origin = { transformOrigin: '50% 50%' }

    if (!motionAllowed()) {
      gsap.set(returning, { opacity: 0 })
      return
    }
    gsap.set(squares.flat(), { scale: 0, ...origin })

    const tl = gsap.timeline({ paused: true, onComplete: () => done.current() })
    tl.set(leaving, { x: 0, y: 0, scale: 1, opacity: 1, ...origin }, 0)
    tl.set(squares.flat(), { scale: 0, ...origin }, 0)
    tl.set(returning, { scale: 0.5, opacity: 0, ...origin }, 0)
    trays.forEach((tray, index) => {
      const group = leaving[index]
      const back = returning[index]
      squares[index]?.forEach((square, slot) => {
        tl.to(square, { scale: 1, duration: 0.6, ease: 'back.out(3)' }, (tray.fills[slot] ?? 0) + 0.27)
      })
      if (group) {
        tl.to(
          group,
          { x: LANDING.x - tray.x, y: LANDING.y - TRAY_Y, scale: 0, duration: 0.95, ease: 'power2.in' },
          tray.drop,
        )
      }
      if (back) tl.to(back, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.5)' }, tray.refill)
    })
    tl.to({}, { duration: 0.01 }, RUN)
    timeline.current = tl
    if (playing) tl.play()
    return () => {
      tl.kill()
      timeline.current = null
    }
    // `playing` is read once at build time; the effect below handles changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trays])

  useEffect(() => {
    const tl = timeline.current
    if (!tl) return
    if (playing) tl.restart()
    else tl.pause(0)
  }, [playing])

  const trayRect = (tray: Tray) => {
    const width = trayWidth(tray.slots)
    return <rect x={-width / 2} y={-TRAY_H / 2} width={width} height={TRAY_H} rx="8" fill="#fff" />
  }

  return (
    <svg ref={root} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full" aria-hidden="true">
      {trays.map((tray, index) => (
        <g key={`back-${index}`} transform={`translate(${tray.x} ${TRAY_Y})`}>
          <g data-tray="returning">{trayRect(tray)}</g>
        </g>
      ))}
      {trays.map((tray, index) => (
        <g key={`tray-${index}`} transform={`translate(${tray.x} ${TRAY_Y})`}>
          <g data-tray="leaving">
            {trayRect(tray)}
            {Array.from({ length: tray.slots }, (_, slot) => (
              <rect
                key={slot}
                data-square=""
                x={slotX(slot, tray.slots)}
                y={-SQUARE / 2}
                width={SQUARE}
                height={SQUARE}
                rx="8"
                className="fill-pink-500"
              />
            ))}
          </g>
        </g>
      ))}
      <polygon points={CUBE_FACES.bottom} fill="#f1a8e1" />
      <polygon points={CUBE_FACES.top} fill="#f1a8e1" opacity="0.8" />
      <polygon points={CUBE_FACES.left} fill="#f1a8e1" opacity="0.5" />
      <polygon points={CUBE_FACES.right} fill="#e858b8" opacity="0.5" />
    </svg>
  )
}
