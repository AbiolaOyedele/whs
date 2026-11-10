'use client'

import { useRef } from 'react'
import { Icon } from '@v2/components/ui/Icon'
import type { ChecklistItem } from '@v2/content/use-cases'
import { MiniWindow } from './MiniWindow'
import { StepTick } from './StepTick'
import { useStepLoop } from './useStepLoop'
import { VisualStage } from './VisualStage'
import { VISUAL_SMALL, VISUAL_TEXT } from './visualText'

interface ChecklistCardProps {
  /** The site's address in the title bar. */
  address: string
  items: ChecklistItem[]
  artSeed: number
}

/**
 * A new site's launch list: each piece that ships with every build ticks
 * itself off in turn, and once all of them are in, the publish button turns
 * lime. Used for "everything a site needs, built in".
 */
export function ChecklistCard({ address, items, artSeed }: ChecklistCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const { step } = useStepLoop(host, items.length + 2, 750, 3)
  const ticked = Math.min(step, items.length)
  const live = step > items.length

  return (
    <VisualStage
      artSeed={artSeed}
      label={`A launch checklist for ${address} with ${items.map((item) => item.label).join(', ')} all ticked off, and the site published.`}
    >
      <div ref={host}>
        <MiniWindow
          title={
            <>
              <Icon name="globe" className="size-4 shrink-0" />
              <span className="truncate">{address}</span>
            </>
          }
          aside={`${ticked} of ${items.length} in place`}
        >
          <ul className="flex flex-col gap-1 p-2 sm:p-3">
            {items.map((item, index) => (
              <li key={item.label} className="flex items-start gap-3 rounded-sm px-2 py-1.5 sm:items-center">
                <StepTick done={index < ticked} />
                <span className="flex min-w-0 grow flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                  <span className={`font-medium ${VISUAL_TEXT}`}>{item.label}</span>
                  <span className={`${VISUAL_SMALL} sm:text-right`}>{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span
              className={`flex h-10 items-center justify-center gap-2 rounded-sm border border-navy-900 font-medium motion-safe:transition-colors motion-safe:duration-300 ${VISUAL_TEXT} ${
                live ? 'border-pink-500 bg-pink-500' : 'bg-white'
              }`}
            >
              {live ? (
                <>
                  <Icon name="check" strokeWidth={2.5} className="size-4" />
                  Published
                </>
              ) : (
                'Publish'
              )}
            </span>
          </div>
        </MiniWindow>
      </div>
    </VisualStage>
  )
}
