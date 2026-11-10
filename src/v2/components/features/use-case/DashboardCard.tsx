'use client'

import { useRef } from 'react'
import { Icon, type IconName } from '@v2/components/ui/Icon'
import { MiniWindow } from './MiniWindow'
import { useStepLoop } from './useStepLoop'
import { VisualStage } from './VisualStage'
import { VISUAL_SMALL, VISUAL_TEXT } from './visualText'

interface DashboardCardProps {
  artSeed: number
}

interface Feed {
  /** The tool the number comes from. */
  source: string
  icon: IconName
  /** What the number is. */
  label: string
  before: string
  after: string
}

/** Three tools a business already has, each feeding one number on the dashboard. */
const FEEDS: Feed[] = [
  { source: 'Shop', icon: 'store', label: 'Orders', before: '126', after: '128' },
  { source: 'Bank', icon: 'bank', label: 'Paid in', before: '₦1.82m', after: '₦1.86m' },
  { source: 'Ads', icon: 'target', label: 'Ad spend', before: '₦240k', after: '₦252k' },
]

/** Orders by day, Monday to Saturday, as bar heights. Written out so Tailwind generates them; today's bar is drawn apart. */
const WEEK = ['h-[38%]', 'h-[52%]', 'h-[46%]', 'h-[60%]', 'h-[55%]', 'h-[70%]'] as const
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

/**
 * One live dashboard fed by three separate tools: a dot drops from each
 * tool in turn and the number it feeds updates, then today's bar (the lime
 * one) rises with the new orders. Used for "the numbers in one place".
 */
export function DashboardCard({ artSeed }: DashboardCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const { step } = useStepLoop(host, FEEDS.length + 1, 1200, 3)
  const todayIn = step >= FEEDS.length

  return (
    <VisualStage
      artSeed={artSeed}
      label={`A dashboard pulling orders, money paid in and ad spend from three separate tools (${FEEDS.map((feed) => feed.source.toLowerCase()).join(', ')}) into one live view.`}
    >
      <div ref={host}>
        <MiniWindow
          title={
            <>
              <Icon name="layoutDashboard" className="size-4 shrink-0" />
              This week
            </>
          }
          aside="Updated live"
        >
          <div className="flex flex-col p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-2">
              {FEEDS.map((feed, index) => {
                const updated = step > index
                const arriving = step === index + 1
                return (
                  <div key={feed.source} className="flex min-w-0 flex-col items-stretch">
                    <span className={`flex items-center justify-center gap-1.5 rounded-sm border border-navy-900 px-1.5 py-1.5 ${VISUAL_SMALL}`}>
                      <Icon name={feed.icon} className="size-4 shrink-0" />
                      <span className="truncate">{feed.source}</span>
                    </span>
                    <span aria-hidden="true" className="relative mx-auto block h-6 w-px bg-navy-900">
                      {arriving ? (
                        <span className="c-uc-feed-dot absolute top-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-navy-900 motion-reduce:hidden" />
                      ) : null}
                    </span>
                    <span className="flex flex-col gap-1 rounded-sm border border-navy-900 px-2 py-2">
                      <span className={`truncate ${VISUAL_SMALL}`}>{feed.label}</span>
                      <span
                        key={updated ? 'after' : 'before'}
                        className={`truncate font-medium tabular-nums ${VISUAL_TEXT} ${arriving ? 'c-uc-value-in' : ''}`}
                      >
                        {updated ? feed.after : feed.before}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex h-20 items-end gap-1.5 border-b border-navy-900 sm:h-24">
              {WEEK.map((height, index) => (
                <span key={index} className={`grow basis-0 rounded-t-sm bg-navy-900 ${height}`} />
              ))}
              <span
                className={`h-[78%] grow basis-0 origin-bottom rounded-t-sm bg-pink-500 motion-safe:transition-transform motion-safe:duration-700 ${
                  todayIn ? 'scale-y-100' : 'scale-y-50'
                }`}
              />
            </div>
            <div className={`mt-1 flex gap-1.5 ${VISUAL_SMALL}`}>
              {DAYS.map((day, index) => (
                <span key={index} className="grow basis-0 text-center">
                  {day}
                </span>
              ))}
            </div>
          </div>
        </MiniWindow>
      </div>
    </VisualStage>
  )
}
