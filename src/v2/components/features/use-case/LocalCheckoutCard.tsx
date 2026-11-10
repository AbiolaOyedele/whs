'use client'

import { useRef } from 'react'
import { Icon, type IconName } from '@v2/components/ui/Icon'
import { MiniWindow } from './MiniWindow'
import { useStepLoop } from './useStepLoop'
import { VisualStage } from './VisualStage'
import { VISUAL_SMALL, VISUAL_TEXT } from './visualText'

interface LocalCheckoutCardProps {
  artSeed: number
}

interface PaymentMethod {
  icon: IconName
  name: string
  detail: string
}

/** The three ways people in Nigeria actually pay online. */
const METHODS: PaymentMethod[] = [
  { icon: 'creditCard', name: 'Card', detail: 'Verve, Visa or Mastercard' },
  { icon: 'bank', name: 'Bank transfer', detail: 'To a one-time account number' },
  { icon: 'phone', name: 'USSD', detail: 'Dial a code, no data needed' },
]

const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
const TOTAL = naira.format(48500)

/**
 * A checkout as a Nigerian shopper sees it: priced in naira, with card, bank
 * transfer and USSD side by side, the choice moving down the list in turn,
 * and a line on page weight for a slow connection. Used for "built for local
 * realities".
 */
export function LocalCheckoutCard({ artSeed }: LocalCheckoutCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const { step } = useStepLoop(host, METHODS.length, 1500, 1)

  return (
    <VisualStage
      artSeed={artSeed}
      label={`A checkout priced in naira, offering payment by ${METHODS.map((method) => method.name.toLowerCase()).join(', ')}, on a page light enough for a slow connection.`}
    >
      <div ref={host}>
        <MiniWindow
          title={
            <>
              <Icon name="lock" className="size-4 shrink-0" />
              Checkout
            </>
          }
          aside="Delivery in Lagos"
        >
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <span className={`flex items-baseline justify-between gap-3 ${VISUAL_TEXT}`}>
              <span className="min-w-0">Adire two-piece set, with delivery</span>
              <span className="shrink-0 font-medium tabular-nums">{TOTAL}</span>
            </span>
            <ul className="flex flex-col gap-2">
              {METHODS.map((method, index) => {
                const chosen = index === step
                return (
                  <li
                    key={method.name}
                    className={`flex items-center gap-3 rounded-sm border border-navy-900 px-3 py-2 motion-safe:transition-shadow motion-safe:duration-300 ${
                      chosen ? 'shadow-[inset_0_0_0_1px_var(--color-navy-900)]' : ''
                    }`}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] border-navy-900">
                      <span
                        className={`size-2 rounded-full bg-navy-900 motion-safe:transition-transform motion-safe:duration-300 ${
                          chosen ? 'scale-100' : 'scale-0'
                        }`}
                      />
                    </span>
                    <Icon name={method.icon} className="size-4 shrink-0" />
                    <span className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
                      <span className={`font-medium ${VISUAL_TEXT}`}>{method.name}</span>
                      <span className={VISUAL_SMALL}>{method.detail}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
            <span className={`flex h-10 items-center justify-center rounded-sm bg-pink-500 font-medium tabular-nums ${VISUAL_TEXT}`}>
              Pay {TOTAL}
            </span>
            <span className={`flex items-center gap-2 ${VISUAL_SMALL}`}>
              <Icon name="zap" className="size-4 shrink-0" />
              A light page that loads on a slow connection
            </span>
          </div>
        </MiniWindow>
      </div>
    </VisualStage>
  )
}
