'use client'

import { useRef, type ReactNode } from 'react'
import { Icon, type IconName } from '@v2/components/ui/Icon'
import { useStepLoop } from './useStepLoop'
import { VisualStage } from './VisualStage'
import { VISUAL_SMALL, VISUAL_TEXT } from './visualText'

interface WorkflowCardProps {
  artSeed: number
}

const BOX = 'flex w-full items-center gap-3 rounded-sm border px-3 py-2.5 text-left'

/** One box in the chain: an icon, a name and a line under it. */
function boxContent(icon: IconName, name: ReactNode, detail: string): ReactNode {
  return (
    <>
      <Icon name={icon} className="size-5 shrink-0" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={`font-medium ${VISUAL_TEXT}`}>{name}</span>
        <span className={VISUAL_SMALL}>{detail}</span>
      </span>
    </>
  )
}

/**
 * Two tools a business already uses, with the job between them done by
 * hand: the hand-copying step is struck out and a lime box, the app, takes
 * its place, with the work now flowing through it. Used for "built around
 * the real process".
 */
export function WorkflowCard({ artSeed }: WorkflowCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const { step } = useStepLoop(host, 4, 1300, 3)
  const struck = step >= 1
  const replaced = step >= 2
  const link = (delayClass: string) => (
    <span aria-hidden="true" className="relative block h-7 w-px bg-navy-900">
      {replaced ? (
        <span
          className={`c-uc-link-dot absolute top-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-navy-900 motion-reduce:hidden ${delayClass}`}
        />
      ) : null}
    </span>
  )

  return (
    <VisualStage
      artSeed={artSeed}
      label="An order form and an accounting tool, with the step of copying between them by hand replaced by a custom app that the team and customers sign in to."
    >
      <div ref={host} className="flex flex-col items-center rounded-md bg-white p-4 sm:p-6">
        <div className="flex w-full max-w-[340px] flex-col items-center">
          <div className={`${BOX} border-navy-900 bg-white`}>
            {boxContent('fileText', 'Order form', 'A tool you already use')}
          </div>
          {link('[animation-delay:0s]')}
          <div className="grid w-full">
            <div
              className={`${BOX} border-dashed border-navy-900 bg-white [grid-area:1/1] motion-safe:transition-[opacity,transform] motion-safe:duration-500 ${
                replaced ? '-translate-x-6 opacity-0' : 'translate-x-0 opacity-100'
              }`}
            >
              {boxContent(
                'repeat',
                <span className={`decoration-2 ${struck ? 'line-through' : ''}`}>Copied across by hand</span>,
                'Every order, every day',
              )}
            </div>
            <div
              className={`${BOX} border-pink-500 bg-pink-500 [grid-area:1/1] motion-safe:transition-[opacity,transform] motion-safe:duration-500 ${
                replaced ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
              }`}
            >
              {boxContent('layoutDashboard', 'Your app', 'Your team and your customers sign in here')}
            </div>
          </div>
          {link('[animation-delay:0.6s]')}
          <div className={`${BOX} border-navy-900 bg-white`}>
            {boxContent('receipt', 'Accounting', 'Another tool you already use')}
          </div>
        </div>
      </div>
    </VisualStage>
  )
}
