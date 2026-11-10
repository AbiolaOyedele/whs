'use client'

import { useRef } from 'react'
import { Icon } from '@v2/components/ui/Icon'
import type { CardImage } from '@v2/content/photos'
import type { TimeBar } from '@v2/content/use-cases'
import { MiniWindow } from './MiniWindow'
import { useStepLoop } from './useStepLoop'
import { VisualStage } from './VisualStage'
import { VISUAL_SMALL, VISUAL_TEXT } from './visualText'

interface HoursCardProps {
  product: string
  logo: CardImage
  /** The piece of work both bars measure. */
  task: string
  before: TimeBar
  after: TimeBar
  /** The difference, in words. */
  returned: string
  artSeed: number
}

/** "2 hr", "1 hr", "30 min": for the axis under the bars. */
function duration(minutes: number): string {
  if (minutes === 0) return '0'
  if (minutes % 60 === 0) return `${minutes / 60} hr`
  return `${minutes} min`
}

/**
 * The same piece of work timed twice on one scale: an ink bar for how long
 * it took by hand, a short lime bar for how long it takes now, and the gap
 * between them marked out as the time given back. The bars draw in one after
 * the other. Used for "judged on the time it gives back".
 */
export function HoursCard({ product, logo, task, before, after, returned, artSeed }: HoursCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const { step } = useStepLoop(host, 4, 1000, 3)
  const scale = Math.max(before.minutes, after.minutes, 1)
  const ticks = [0, scale / 2, scale]
  const bar = 'origin-left [transform-box:fill-box] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out'

  return (
    <VisualStage
      artSeed={artSeed}
      label={`${product}, ${task.toLowerCase()}: ${before.label.toLowerCase()}, ${before.note.toLowerCase()}; ${after.label.toLowerCase()}, ${after.note.toLowerCase()}. ${returned}.`}
    >
      <div ref={host}>
        <MiniWindow
          title={
            <>
              <img src={logo.src} alt="" draggable={false} loading="lazy" className="size-5 shrink-0 object-contain" />
              {product}
            </>
          }
          aside={task}
        >
          <div className="flex flex-col gap-4 p-3 sm:gap-5 sm:p-4">
            {[before, after].map((row, index) => {
              const shown = step > index
              const lime = index === 1
              return (
                <div key={row.label} className="flex flex-col gap-1.5">
                  <span className="flex flex-col gap-0.5 xs:flex-row xs:items-baseline xs:justify-between xs:gap-3">
                    <span className={`font-medium ${VISUAL_TEXT}`}>{row.label}</span>
                    <span className={VISUAL_SMALL}>{row.note}</span>
                  </span>
                  <svg viewBox={`0 0 ${scale} 10`} preserveAspectRatio="none" className="block h-8 w-full" aria-hidden="true">
                    {lime ? (
                      <rect
                        x={row.minutes}
                        y="0.5"
                        width={scale - row.minutes}
                        height="9"
                        fill="none"
                        rx="0.5"
                        className={`stroke-navy-900 motion-safe:transition-opacity motion-safe:duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}
                        strokeWidth="1.5"
                        strokeDasharray="5 4"
                        vectorEffect="non-scaling-stroke"
                      />
                    ) : null}
                    <rect
                      width={row.minutes}
                      height="10"
                      className={`${lime ? 'fill-pink-500' : 'fill-navy-900'} ${bar} ${shown ? 'scale-x-100' : 'scale-x-0'}`}
                    />
                  </svg>
                </div>
              )
            })}
            <span className={`flex justify-between -mt-2 border-t border-navy-900 pt-1.5 tabular-nums sm:-mt-3 ${VISUAL_SMALL}`}>
              {ticks.map((tick) => (
                <span key={tick}>{duration(tick)}</span>
              ))}
            </span>
            <span
              className={`flex items-center justify-end gap-2 text-right font-medium motion-safe:transition-opacity motion-safe:duration-500 ${VISUAL_TEXT} ${
                step >= 3 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Icon name="clock" className="size-4 shrink-0" />
              {returned}
            </span>
          </div>
        </MiniWindow>
      </div>
    </VisualStage>
  )
}
