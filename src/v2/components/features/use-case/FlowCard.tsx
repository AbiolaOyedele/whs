'use client'

import { useRef, type CSSProperties } from 'react'
import { FluidPanel } from '@v2/components/ui/FluidPanel'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { useInviewPlaying } from './useInviewPlaying'

interface FlowCardProps {
  hub: string
  sources: [string, string, string]
  sideLabel: string
  artSeed: number
}

/** The panel is drawn on a 558 × 359 grid; boxes are placed in percent of it. */
const W = 558
const H = 359
const HUB = { y: 34, size: 104 }
const SOURCE_Y = 190
const SOURCE_X = [87, 227, 367] as const
const LINKS = [
  { from: [166, 186], to: [234, 142] },
  { from: [279, 186], to: [279, 142] },
  { from: [392, 186], to: [324, 142] },
] as const
const DOT_GAP = 0.8

const pct = (value: number, of: number) => `${(value / of) * 100}%`

/** Position (and size) on the panel grid, handed to the classes as custom properties. */
function place(x: number, y: number, size = 0): CSSProperties {
  return {
    '--left': pct(x, W),
    '--top': pct(y, H),
    '--size-x': pct(size, W),
    '--size-y': pct(size, H),
  } as CSSProperties
}

/**
 * Several sources feeding one pink box on a frosted panel over the art: dots
 * run up each link in turn and the box pulses as they land. Used for
 * "everything a site needs, built in".
 */
export function FlowCard({ hub, sources, sideLabel, artSeed }: FlowCardProps) {
  const panel = useRef<HTMLDivElement>(null)
  const playing = useInviewPlaying(panel)
  const box = 'absolute top-(--top) flex h-(--size-y) w-(--size-x) items-center justify-center rounded-sm text-center leading-none'
  const boxText = 'text-label text-[clamp(0.5rem,2.3cqw,0.8125rem)]!'

  return (
    <div className="relative flex aspect-707/600 items-center justify-center overflow-hidden rounded-lg bg-charcoal p-6">
      <ParallaxMedia>
        <FluidPanel seed={artSeed} />
      </ParallaxMedia>
      <div
        ref={panel}
        aria-hidden="true"
        className={`c-uc-flow @container relative z-2 aspect-558/359 w-full rounded-md bg-white/90 backdrop-blur-[50px] @max-3xl/feature-card:max-w-[500px] ${
          playing ? 'is-playing' : ''
        }`}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" fill="none">
          <defs>
            <marker id="uc-flow-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M1 1L7 4L1 7" stroke="var(--color-navy-500)" strokeWidth="1" fill="none" />
            </marker>
          </defs>
          {LINKS.map((link, index) => (
            <line
              key={index}
              className="c-uc-flow_link"
              x1={link.from[0]}
              y1={link.from[1]}
              x2={link.to[0]}
              y2={link.to[1]}
              markerStart="url(#uc-flow-head)"
              markerEnd="url(#uc-flow-head)"
            />
          ))}
          <path d="M40 85H46V235H40" className="c-uc-flow_link" />
          {LINKS.map((link, index) => (
            <circle
              key={index}
              r="7"
              stroke="#fff"
              strokeWidth="3"
              className="c-uc-flow_dot"
              style={
                {
                  '--x1': `${link.from[0]}px`,
                  '--y1': `${link.from[1]}px`,
                  '--x2': `${link.to[0]}px`,
                  '--y2': `${link.to[1]}px`,
                  '--delay': `${index * DOT_GAP}s`,
                } as CSSProperties
              }
            />
          ))}
        </svg>
        <span
          className={`${boxText} absolute top-(--top) left-(--left) -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-navy-500`}
          style={place(26, 160)}
        >
          {sideLabel}
        </span>
        <span
          className={`c-uc-flow_hub ${box} ${boxText} left-1/2 -translate-x-1/2 bg-pink-500 text-charcoal`}
          style={place(0, HUB.y, HUB.size)}
        >
          {hub}
        </span>
        {sources.map((source, index) => (
          <span
            key={source}
            className={`${box} ${boxText} left-(--left) bg-white text-navy-900`}
            style={place(SOURCE_X[index] ?? 0, SOURCE_Y, HUB.size)}
          >
            {source}
          </span>
        ))}
      </div>
    </div>
  )
}
