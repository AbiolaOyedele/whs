'use client'

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { observeInview } from '@v2/lib/inview'
import { safeHeaderOffset, scrollToElement } from '@v2/lib/scroll'

export interface FeatureCardItem {
  /** Anchor id; also links the nav entry to its card. */
  id: string
  /** Big entry in the sticky list on the left. */
  navTitle: string
  /** The animated visual (a card component). */
  visual: ReactNode
  title: string
  body: ReactNode
  /** Optional buttons under the text. */
  actions?: ReactNode
}

interface FeatureCardsProps {
  label: string
  /** Shown above the cards on phones, where the sticky list is hidden. */
  mobileHeading?: ReactNode
  items: FeatureCardItem[]
  className?: string
}

/**
 * Two columns: a sticky list of feature names on the left, the cards
 * scrolling on the right. The name whose card is most in view turns navy;
 * clicking a name smooth-scrolls to its card.
 */
export function FeatureCards({ label, mobileHeading, items, className = '' }: FeatureCardsProps) {
  const cards = useRef<Map<string, HTMLDivElement>>(new Map())
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const ratios = new Map<string, number>()
    const stops: (() => void)[] = []
    cards.current.forEach((card, id) => {
      stops.push(
        observeInview(
          card,
          (entry, visible) => {
            if (visible) ratios.set(id, entry.intersectionRatio)
            else ratios.delete(id)
            let best: string | null = null
            let bestRatio = -1
            ratios.forEach((ratio, key) => {
              if (ratio > bestRatio) {
                bestRatio = ratio
                best = key
              }
            })
            setActive(best)
          },
          // One threshold, as on the reference: a name stays lit until its card leaves.
          '0px 0px -30% 0px',
        ),
      )
    })
    return () => stops.forEach((stop) => stop())
  }, [items])

  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    const card = cards.current.get(id)
    if (card) scrollToElement(card, safeHeaderOffset())
  }

  return (
    <div className={`grid gap-gutter md:grid-cols-2 ${className}`}>
      <div>
        <div className="md:sticky md:top-safe-header">
          {/* Named for screen readers only: a visible label here would sit above the list as an eyebrow. */}
          <h2 className="sr-only">{label}</h2>
          {mobileHeading ? <div className="mb-fluid-2xl md:hidden">{mobileHeading}</div> : null}
          <ul className="max-md:hidden">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => jump(event, item.id)}
                  className={`text-heading-md transition-colors duration-200 hover:text-navy-900 ${
                    active === item.id ? 'text-navy-900' : 'text-slate-300'
                  }`}
                >
                  {item.navTitle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid max-w-3xl gap-fluid-2xl">
        {items.map((item) => (
          <div
            key={item.id}
            id={item.id}
            ref={(node) => {
              if (node) cards.current.set(item.id, node)
              else cards.current.delete(item.id)
            }}
            className="scroll-mt-(--spacing-safe-header)"
          >
            <div className="@container/feature-card flex flex-col gap-6">
              {item.visual}
              <div className="flex flex-col gap-4 sm:pr-[30%] md:pr-[15%]">
                <h3 className="max-md:text-heading-sm md:text-heading-xs">{item.title}</h3>
                <div className="wysiwyg wysiwyg-navy">{item.body}</div>
                {item.actions ? <div className="flex flex-wrap gap-4">{item.actions}</div> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
