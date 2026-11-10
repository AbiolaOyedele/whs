'use client'

import { useRef } from 'react'
import { Icon } from '@v2/components/ui/Icon'
import { MiniWindow } from './MiniWindow'
import { useStepLoop } from './useStepLoop'
import { VisualStage } from './VisualStage'
import { VISUAL_SMALL, VISUAL_TEXT } from './visualText'

interface CmsEditCardProps {
  artSeed: number
}

interface EditStep {
  /** What the price field holds at this step. */
  field: string
  editing: boolean
  saved: boolean
}

/** The finished edit: the new price saved and live. */
const SAVED: EditStep = { field: '₦5,500', editing: false, saved: true }

/** A price being retyped: the field is focused, cleared back, typed, then saved. */
const STEPS: EditStep[] = [
  { field: '₦5,200', editing: false, saved: false },
  { field: '₦5,200', editing: true, saved: false },
  { field: '₦5,', editing: true, saved: false },
  { field: '₦5,500', editing: true, saved: false },
  SAVED,
]

const MENU = [
  { name: 'Jollof rice and chicken', price: '₦4,500' },
  { name: 'Ofada rice and stew', price: null },
  { name: 'Small chops', price: '₦3,000' },
] as const

const OLD_PRICE = '₦5,200'

/**
 * The site's own editor beside the live page. The owner retypes a dish's
 * price, saves, and the menu on the site changes with it, no developer in
 * the loop. The editor's fields are the restaurant's (dish, price, on
 * today's menu), not a generic page builder's. Used for "designed for what
 * you publish".
 */
export function CmsEditCard({ artSeed }: CmsEditCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const { step } = useStepLoop(host, STEPS.length, 900, 3)
  const state = STEPS[step] ?? SAVED
  const livePrice = state.saved ? state.field : OLD_PRICE

  return (
    <VisualStage
      artSeed={artSeed}
      label="A restaurant's own editor changing a dish's price, saved and showing straight away on the menu page of its website."
    >
      <div ref={host} className="grid gap-3 sm:grid-cols-2">
        <MiniWindow
          title={
            <>
              <Icon name="penTool" className="size-4 shrink-0" />
              Edit dish
            </>
          }
        >
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="flex flex-col gap-1">
              <span className={VISUAL_SMALL}>Dish</span>
              <span className={`rounded-sm border border-navy-900 px-2.5 py-2 ${VISUAL_TEXT}`}>Ofada rice and stew</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={VISUAL_SMALL}>Price</span>
              <span
                className={`flex items-center rounded-sm border px-2.5 py-2 tabular-nums ${VISUAL_TEXT} ${
                  state.editing ? 'border-navy-900 outline-2 outline-offset-1 outline-navy-900' : 'border-navy-900'
                }`}
              >
                {state.field}
                {state.editing ? <span className="ml-px inline-block h-[1.1em] w-px bg-navy-900" /> : null}
              </span>
            </div>
            <span className={`flex items-center justify-between gap-2 ${VISUAL_TEXT}`}>
              On today&apos;s menu
              <span className="flex h-5 w-9 shrink-0 items-center justify-end rounded-full bg-navy-900 p-0.5">
                <span className="size-4 rounded-full bg-white" />
              </span>
            </span>
            <span
              className={`flex h-10 items-center justify-center rounded-sm border font-medium motion-safe:transition-colors motion-safe:duration-300 ${VISUAL_TEXT} ${
                state.saved ? 'border-pink-500 bg-pink-500' : 'border-navy-900 bg-white'
              }`}
            >
              {state.saved ? 'Saved' : 'Save'}
            </span>
          </div>
        </MiniWindow>

        <MiniWindow
          title={
            <>
              <Icon name="globe" className="size-4 shrink-0" />
              <span className="truncate">yoursite.ng/menu</span>
            </>
          }
        >
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <span className={`font-medium ${VISUAL_TEXT}`}>Today&apos;s menu</span>
            <ul className="flex flex-col gap-2.5">
              {MENU.map((dish) => (
                <li key={dish.name} className="flex flex-col gap-0.5">
                  <span className={`flex items-baseline justify-between gap-3 ${VISUAL_TEXT}`}>
                    <span className="min-w-0">{dish.name}</span>
                    <span className="shrink-0 font-medium tabular-nums">{dish.price ?? livePrice}</span>
                  </span>
                  {dish.price === null ? (
                    <span
                      className={`${VISUAL_SMALL} motion-safe:transition-opacity motion-safe:duration-300 ${
                        state.saved ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      Updated just now
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </MiniWindow>
      </div>
    </VisualStage>
  )
}
