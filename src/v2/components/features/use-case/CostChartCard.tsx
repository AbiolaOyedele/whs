'use client'

import { useRef, useState } from 'react'
import { FluidPanel } from '@v2/components/ui/FluidPanel'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { SegmentedControls } from '@v2/components/ui/SegmentedControls'
import type { ChartTab } from '@v2/content/use-cases'
import { CostChart } from './CostChart'
import { useInviewPlaying } from './useInviewPlaying'

interface CostChartCardProps {
  tabs: ChartTab[]
  yLabel: string
  xLabel: string
  artSeed: number
}

const CHIPS = ['bg-[#8A8A93]', 'bg-pink-500'] as const

/**
 * A frosted chart panel over the art, one tab per pair of lines. The chosen
 * chart draws its two lines in on a loop while the card is on screen.
 */
export function CostChartCard({ tabs, yLabel, xLabel, artSeed }: CostChartCardProps) {
  const card = useRef<HTMLDivElement>(null)
  const inView = useInviewPlaying(card)
  const [selected, setSelected] = useState(0)

  return (
    <div
      ref={card}
      className="slate relative flex justify-center gap-6 overflow-hidden rounded-lg bg-charcoal py-10 max-sm:px-6 sm:aspect-707/600"
    >
      <ParallaxMedia>
        <FluidPanel seed={artSeed} />
      </ParallaxMedia>
      <SegmentedControls
        tabs={tabs.map((tab) => tab.label)}
        onChange={setSelected}
        className="relative z-2 w-full grow gap-y-6"
        panelsClassName="m-auto w-full overflow-hidden rounded-md bg-white/90 py-2.5 backdrop-blur-[50px] sm:w-[85%]"
        panels={tabs.map((tab, index) => (
          <div key={tab.label} className="relative flex flex-col justify-center px-12.5 pt-4 max-sm:pb-18 sm:pb-14">
            <span className="text-label absolute top-1/2 left-5 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
              {yLabel}
            </span>
            <span className="text-label absolute right-0 left-0 text-center max-sm:bottom-11 sm:bottom-2">{xLabel}</span>
            <div className="aspect-486/322 w-full">
              <CostChart plans={tab.plans} playing={inView && index === selected} />
            </div>
            <ul className="absolute bottom-0 left-2.5 flex gap-2">
              {tab.plans.map((plan, planIndex) => (
                <li key={plan.name}>
                  <span className={`text-label inline-flex rounded-sm p-2 text-white ${CHIPS[planIndex] ?? ''}`}>
                    {plan.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      />
    </div>
  )
}
