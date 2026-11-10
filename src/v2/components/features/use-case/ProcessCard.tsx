'use client'

import { useRef } from 'react'
import { Icon } from '@v2/components/ui/Icon'
import type { ProcessStep } from '@v2/content/use-cases'
import { StepTick } from './StepTick'
import { useStepLoop } from './useStepLoop'
import { VisualStage } from './VisualStage'
import { VISUAL_SMALL, VISUAL_TEXT } from './visualText'

interface ProcessCardProps {
  steps: [ProcessStep, ProcessStep, ProcessStep]
  artSeed: number
}

/**
 * The three stages of starting a project, in order: each one is picked out
 * in turn and ticked off as the next begins, and the last ends on a single
 * price with a lime button to accept it. Used for "discovery, proposal,
 * quote".
 */
export function ProcessCard({ steps, artSeed }: ProcessCardProps) {
  const host = useRef<HTMLOListElement>(null)
  const { step } = useStepLoop(host, steps.length + 1, 1300, 2)
  const accepted = step >= steps.length

  return (
    <VisualStage
      artSeed={artSeed}
      label={`Three steps in order: ${steps.map((item) => item.title.toLowerCase()).join(', then ')}, ending on one price to accept.`}
    >
      <ol ref={host} className="flex flex-col rounded-md bg-white p-3 sm:p-4">
        {steps.map((item, index) => {
          const done = index < step
          const current = index === step
          const last = index === steps.length - 1
          return (
            <li key={item.title} className="flex gap-3">
              <span className="flex flex-col items-center pt-3.5">
                <StepTick done={done} />
                {last ? null : <span aria-hidden="true" className="mt-1 w-px grow bg-navy-900" />}
              </span>
              <span
                className={`flex min-w-0 grow flex-wrap items-center gap-3 rounded-sm border px-3 py-2.5 motion-safe:transition-colors motion-safe:duration-300 ${
                  current ? 'border-navy-900 shadow-[inset_0_0_0_1px_var(--color-navy-900)]' : 'border-transparent'
                } ${last ? '' : 'mb-2'}`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-navy-900">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <span className="flex min-w-0 grow flex-col gap-0.5">
                  <span className={`font-medium ${VISUAL_TEXT}`}>
                    {index + 1}. {item.title}
                  </span>
                  <span className={VISUAL_SMALL}>{item.detail}</span>
                </span>
                {last ? (
                  <span
                    className={`flex h-9 shrink-0 items-center rounded-sm px-3 font-medium motion-safe:transition-colors motion-safe:duration-300 max-xs:basis-full max-xs:justify-center ${VISUAL_TEXT} ${
                      accepted ? 'bg-pink-500' : 'border border-navy-900 bg-white'
                    }`}
                  >
                    {accepted ? 'Accepted' : 'Accept'}
                  </span>
                ) : null}
              </span>
            </li>
          )
        })}
      </ol>
    </VisualStage>
  )
}
