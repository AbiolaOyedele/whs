import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'
import type { HelpGuide } from '@v2/content/resources'

interface RelatedWorkCardProps {
  guide: HelpGuide
}

/**
 * A case study behind a capability: the product's logo on its own, then its
 * title, one-line summary and a link. The whole card is the link; the arrow
 * nudges right on hover or focus.
 */
export function RelatedWorkCard({ guide }: RelatedWorkCardProps) {
  return (
    <div
      className="group anim-scale relative flex h-full flex-col gap-8 rounded-md bg-white p-6 md:p-8"
      data-scroll=""
    >
      <img
        src={guide.logo}
        alt=""
        loading="lazy"
        className="h-10 w-auto max-w-40 self-start object-contain object-left transition-transform duration-200 ease-in-out group-focus-within:scale-105 group-hover:scale-105 md:h-12"
      />
      <div className="flex grow flex-col gap-3">
        <h3 className="text-heading-xs text-navy-900">{guide.title}</h3>
        <p className="text-body-md text-navy-900">{guide.lede}</p>
      </div>
      <span
        className="text-body-md text-navy-900 inline-flex items-center gap-2 font-medium"
        aria-hidden="true"
      >
        Read the case study
        <Icon
          name="arrowRight"
          className="size-5 transition-transform duration-200 ease-in-out group-focus-within:translate-x-1 group-hover:translate-x-1"
        />
      </span>
      <SmartLink
        href={`/resources/${guide.slug}`}
        className="z-above absolute inset-0 rounded-md -outline-offset-2"
      >
        <span className="sr-only">{guide.title}</span>
      </SmartLink>
    </div>
  )
}
