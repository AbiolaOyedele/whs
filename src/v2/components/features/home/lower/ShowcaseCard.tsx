import { SmartLink } from '@v2/components/ui/SmartLink'
import type { ShowcaseCard as ShowcaseCardData } from '@v2/content/home-lower'
import { SplitArrow } from './SplitArrow'

interface ShowcaseCardProps {
  card: ShowcaseCardData
}

const FAST = 'duration-(--transition-duration-fast) ease-in-out'

/**
 * A white card on the dark section: the product's logo on its own, then the
 * title, one line and a link to its case study. On hover the logo grows a
 * touch and the arrow nudges right. The whole card is the link.
 */
export function ShowcaseCard({ card }: ShowcaseCardProps) {
  return (
    <div
      className="group anim-scale relative flex h-full flex-col gap-6 rounded-md bg-white p-6 md:p-8"
      data-scroll=""
    >
      <img
        src={card.logo.src}
        alt={card.logo.alt}
        loading="lazy"
        decoding="async"
        className={`h-10 w-auto max-w-40 self-start object-contain object-left transition-transform group-focus-within:scale-105 group-hover:scale-105 md:h-12 ${FAST}`}
      />
      <div className="flex grow flex-col gap-2">
        <h3 className="text-heading-xs text-navy-900">{card.title}</h3>
        <p className="text-body-md text-navy-900 max-w-110">{card.description}</p>
      </div>
      <span
        className="text-body-md text-navy-900 inline-flex items-center gap-2 font-medium"
        aria-hidden="true"
      >
        {card.linkLabel}
        <span
          className={`transition-transform group-focus-within:translate-x-1 group-hover:translate-x-1 ${FAST}`}
        >
          <SplitArrow className="size-5" />
        </span>
      </span>
      <SmartLink href={card.href} className="z-above absolute inset-0 rounded-md -outline-offset-2">
        <span className="sr-only">
          {card.title}: {card.linkLabel}
        </span>
      </SmartLink>
    </div>
  )
}
