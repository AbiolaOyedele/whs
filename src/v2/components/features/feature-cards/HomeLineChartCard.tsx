'use client'

import { useState } from 'react'
import { SegmentedControls } from '@v2/components/ui/SegmentedControls'
import { chartTabs, chartXLabel, chartXTicks } from '@v2/content/home-upper'
import { HomeAnimatedChart } from './HomeAnimatedChart'

/**
 * A light slate card with tabs over a line chart of example shop figures.
 * Each tab has an axis title, the chart and coloured legend chips; the
 * chosen tab's lines draw themselves while the card is on screen.
 */
export function HomeLineChartCard() {
  const [selected, setSelected] = useState(0)

  return (
    <div className="slate relative flex justify-center gap-6 overflow-hidden rounded-lg bg-slate-50 max-sm:aspect-square max-sm:py-2.5 sm:aspect-707/600 sm:py-6">
      <SegmentedControls
        tabs={chartTabs.map((tab) => tab.tab)}
        onChange={setSelected}
        className="relative z-2 flex w-full grow gap-y-6"
        panelsClassName="h-full w-full overflow-hidden"
        panels={chartTabs.map((tab, index) => (
          <div
            key={tab.tab}
            className="relative flex h-full flex-col justify-center pt-4 pb-18 max-sm:px-8.5 sm:px-22"
          >
            <span className="text-label absolute top-[calc(50%-var(--spacing)*18)] -translate-x-1/2 -rotate-90 pt-3 text-nowrap max-sm:left-2.5 sm:left-7">
              {tab.yLabel}
            </span>
            <span className="text-label absolute right-0 left-0 text-center max-sm:bottom-11 sm:bottom-2">
              {chartXLabel}
            </span>
            <HomeAnimatedChart
              series={tab.series}
              max={tab.max}
              xTicks={chartXTicks}
              active={selected === index}
              title={`${tab.tab} (${tab.yLabel}), by day of the month. Lines: ${tab.series.map((s) => s.label).join(', ')}`}
            />
            <ul className="absolute bottom-0 flex gap-2 max-sm:left-2.5 sm:left-7">
              {tab.series.map((line) => (
                <li key={line.label}>
                  <span
                    className="text-label inline-flex rounded-sm bg-(--chip) p-2 text-white"
                    style={{ ['--chip' as string]: line.colour }}
                  >
                    {line.label}
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
