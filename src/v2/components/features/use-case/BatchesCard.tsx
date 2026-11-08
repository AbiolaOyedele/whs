'use client'

import { useCallback, useRef, useState } from 'react'
import { FluidPanel } from '@v2/components/ui/FluidPanel'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { SegmentedControls } from '@v2/components/ui/SegmentedControls'
import { BatchScene, type BatchPattern } from './BatchScene'
import { useInviewPlaying } from './useInviewPlaying'

interface BatchesCardProps {
  tabs: [string, string, string]
  artSeed: number
}

const PATTERNS: BatchPattern[] = ['together', 'groups', 'stream']

/** True when the whole element is inside the window, so clicking its tab cannot scroll the page. */
function fullyVisible(el: Element): boolean {
  const box = el.getBoundingClientRect()
  return box.top >= 0 && box.bottom <= window.innerHeight
}

/**
 * Three tabs over the art, each with its own animation of squares dropping
 * into a cube. When one run ends the next tab is chosen, as if a visitor had
 * tapped it; a visitor can also pick any tab.
 */
export function BatchesCard({ tabs, artSeed }: BatchesCardProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInviewPlaying(wrap)
  const [selected, setSelected] = useState(0)
  const [run, setRun] = useState(0)

  const advance = useCallback(() => {
    const host = wrap.current
    if (!host) return
    const tablist = host.querySelector('[role="tablist"]')
    const buttons = host.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    const next = buttons[(selected + 1) % buttons.length]
    if (next && tablist && fullyVisible(tablist)) next.click()
    else setRun((value) => value + 1)
  }, [selected])

  return (
    <div className="relative flex justify-center gap-6 overflow-hidden rounded-lg bg-charcoal p-6 md:min-h-[500px]">
      <ParallaxMedia>
        <FluidPanel seed={artSeed} />
      </ParallaxMedia>
      <div ref={wrap} className="relative z-2 w-full">
        <SegmentedControls
          tabs={tabs}
          onChange={setSelected}
          className="w-full gap-y-6"
          panelsClassName="mx-auto my-fluid-2xl w-full overflow-hidden rounded-md bg-slate-50 @3xl/feature-card:max-w-3/4 @max-3xl/feature-card:max-w-[500px]"
          panels={tabs.map((label, index) => (
            <BatchScene
              key={`${label}-${index === selected ? run : 'idle'}`}
              pattern={PATTERNS[index] ?? 'together'}
              playing={inView && index === selected}
              onDone={advance}
            />
          ))}
        />
      </div>
    </div>
  )
}
