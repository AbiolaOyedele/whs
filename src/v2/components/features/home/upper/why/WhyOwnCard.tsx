'use client'

import { Icon } from '@v2/components/ui/Icon'
import { ownCard } from '@v2/content/home-upper'
import { useRevealOnce } from './useRevealOnce'
import { WhyPanel } from './WhyPanel'

/**
 * Ink panel set as a handover ledger: the site, the domain, the code and
 * everything on it, each marked yours, then a lime block (the card's one
 * lime) saying who builds the project. Rows arrive one after another.
 */
export function WhyOwnCard() {
  const [ref, stage] = useRevealOnce<HTMLDivElement>()

  return (
    <WhyPanel tone="ink" stage={stage} panelRef={ref} className="justify-between gap-8">
      <ul>
        {ownCard.rows.map((row, index) => (
          <li
            key={row}
            data-why-step=""
            style={{ ['--why-step' as string]: index }}
            className="flex min-h-16 items-center justify-between gap-4 border-white py-3 not-last:border-b"
          >
            <span className="c-why-display text-[clamp(1.375rem,5cqw,2rem)]">{row}</span>
            <span className="text-body-sm flex shrink-0 items-center gap-1.5">
              <Icon name="check" className="size-4" strokeWidth={2.25} />
              {ownCard.owner}
            </span>
          </li>
        ))}
      </ul>
      <p
        data-why-step=""
        style={{ ['--why-step' as string]: ownCard.rows.length }}
        className="text-body-md flex items-center gap-3 rounded-md bg-pink-500 p-4 text-charcoal sm:p-5"
      >
        <Icon name="handshake" className="size-6 shrink-0" />
        {ownCard.footer}
      </p>
    </WhyPanel>
  )
}
