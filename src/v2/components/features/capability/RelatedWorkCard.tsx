import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'
import type { HelpGuide } from '@v2/content/resources'

interface RelatedWorkCardProps {
  guide: HelpGuide
}

/**
 * A case study behind a capability: the product's logo on a white panel,
 * then its title and one-line summary. The whole card is the link; an arrow
 * slides in on hover or focus.
 */
export function RelatedWorkCard({ guide }: RelatedWorkCardProps) {
  return (
    <div className="group anim-scale relative flex h-full flex-col overflow-hidden rounded-md bg-white" data-scroll="">
      <div className="relative flex aspect-16/10 items-center justify-center overflow-hidden border-b border-slate-100">
        <img
          src={guide.logo}
          alt=""
          loading="lazy"
          className="max-h-[34%] max-w-[46%] object-contain transition-transform duration-300 group-focus-within:scale-105 group-hover:scale-105"
        />
      </div>
      <div className="flex grow flex-col gap-3 p-5 pb-7">
        <div className="flex items-center justify-between gap-4">
          <span className="text-label text-navy-500">Case study</span>
          <span
            aria-hidden="true"
            className="translate-x-1 opacity-0 transition-all duration-200 ease-in-out group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100"
          >
            <Icon name="arrowRight" />
          </span>
        </div>
        <h3 className="text-heading-xs text-balance">{guide.title}</h3>
        <p className="text-body-sm text-navy-500">{guide.lede}</p>
      </div>
      <SmartLink href={`/resources/${guide.slug}`} className="absolute inset-0 z-above rounded-md -outline-offset-2">
        <span className="sr-only">{guide.title}</span>
      </SmartLink>
    </div>
  )
}
