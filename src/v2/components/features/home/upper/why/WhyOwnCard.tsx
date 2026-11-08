'use client'

import { Icon } from '@v2/components/ui/Icon'
import { ownCard } from '@v2/content/home-upper'
import { useRevealOnce } from './useRevealOnce'
import { WhyPanel } from './WhyPanel'

/**
 * Ink panel with a handover list: the site, the domain, the code and
 * everything on it, each marked "Yours" in lime one after another, and a
 * closing line about who builds the project.
 */
export function WhyOwnCard() {
  const [ref, revealed] = useRevealOnce<HTMLDivElement>()

  return (
    <WhyPanel tone="ink" revealed={revealed} panelRef={ref} className="items-center justify-center">
      <div className="w-full max-w-[440px] rounded-md border border-white/15 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
        <p className="text-label mb-3 text-white/60">{ownCard.label}</p>
        <ul>
          {ownCard.rows.map((row, index) => (
            <li
              key={row}
              className="flex min-h-14 items-center justify-between gap-4 border-b border-white/10 last:border-b-0"
            >
              <span className="c-why-display text-[clamp(1.25rem,4.5cqw,1.75rem)]">{row}</span>
              <span
                style={{ ['--why-step' as string]: index }}
                className="c-why-chip text-label inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-pink-500 px-2 py-1.5 text-charcoal"
              >
                <Icon name="check" className="size-3.5" strokeWidth={2.5} />
                {ownCard.owner}
              </span>
            </li>
          ))}
        </ul>
        <p
          style={{ ['--why-step' as string]: ownCard.rows.length }}
          data-why-step=""
          className="text-body-sm mt-4 flex items-center gap-2.5 border-t border-white/15 pt-4 text-white/75"
        >
          <Icon name="handshake" className="size-5 shrink-0 text-pink-500" />
          {ownCard.footer}
        </p>
      </div>
    </WhyPanel>
  )
}
