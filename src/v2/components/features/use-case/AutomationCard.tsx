'use client'

import { useRef } from 'react'
import { Icon } from '@v2/components/ui/Icon'
import type { AutomationRun } from '@v2/content/use-cases'
import { MiniWindow } from './MiniWindow'
import { StepTick } from './StepTick'
import { useStepLoop } from './useStepLoop'
import { VisualStage } from './VisualStage'
import { VISUAL_TEXT } from './visualText'

interface AutomationCardProps {
  runs: AutomationRun[]
  artSeed: number
}

/**
 * A real tool's run log, working through the steps a person used to do by
 * hand: each one spins, then ticks, with nobody at the keyboard, and the run
 * ends on a lime line saying what was done. Each loop shows the next tool's
 * run. Used for "manual steps, removed for good".
 */
export function AutomationCard({ runs, artSeed }: AutomationCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const longest = Math.max(1, ...runs.map((run) => run.steps.length))
  const { step, round } = useStepLoop(host, longest + 1, 850, 3)
  const run = runs[round % Math.max(1, runs.length)]
  if (!run) return null
  const finished = step >= run.steps.length

  return (
    <VisualStage
      artSeed={artSeed}
      label={runs.map((item) => `${item.product}: ${item.steps.join(', ')}. ${item.done}`).join(' ')}
    >
      <div ref={host}>
        <MiniWindow
          title={
            <>
              <img src={run.logo.src} alt="" draggable={false} loading="lazy" className="size-5 shrink-0 object-contain" />
              {run.product}
            </>
          }
          aside="Nobody at the keyboard"
        >
          <ol className="flex flex-col gap-1 p-2 sm:p-3">
            {run.steps.map((item, index) => (
              <li key={`${run.product}-${item}`} className="flex items-start gap-3 px-2 py-1.5">
                <StepTick done={index < step} working={index === step} />
                <span className={`min-w-0 ${VISUAL_TEXT}`}>{item}</span>
              </li>
            ))}
          </ol>
          <div className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span
              className={`flex min-h-10 items-center gap-2 rounded-sm px-3 py-2 font-medium motion-safe:transition-colors motion-safe:duration-300 ${VISUAL_TEXT} ${
                finished ? 'bg-pink-500' : 'border border-navy-900 bg-white'
              }`}
            >
              <Icon name={finished ? 'check' : 'clock'} strokeWidth={2.2} className="size-4 shrink-0" />
              <span className="min-w-0">{finished ? run.done : 'Running on its own'}</span>
            </span>
          </div>
        </MiniWindow>
      </div>
    </VisualStage>
  )
}
