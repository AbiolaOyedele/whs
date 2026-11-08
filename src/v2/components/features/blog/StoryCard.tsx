import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'

export interface StoryCardProps {
  href: string
  title: string
  /** The shop's name, set as a plain text wordmark. */
  wordmark: string
  headingLevel?: 'h2' | 'h3'
}

/**
 * A seller-story card: a pale panel with the shop's wordmark, the title and
 * "Read story". On hover the panel swells a touch and the words drift up and
 * left while an arrow slides in.
 */
export function StoryCard({ href, title, wordmark, headingLevel = 'h2' }: StoryCardProps) {
  const Heading = headingLevel
  return (
    <div className="group anim-scale relative flex h-full flex-col" data-scroll="">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-md bg-slate-100 transition-transform duration-200 ease-in-out group-focus-within:scale-101 group-hover:scale-101"
      />
      <div className="relative z-2 flex aspect-464/392 items-center justify-center overflow-hidden p-5">
        <span className="c-blog-wordmark" aria-hidden="true">
          {wordmark}
        </span>
      </div>
      <div className="relative z-2 flex grow flex-col justify-between gap-3.5 p-5">
        <Heading className="text-heading-xs transition-transform duration-200 ease-in-out group-focus-within:-translate-x-1 group-hover:-translate-x-1">
          {title}
        </Heading>
        <div className="flex items-center justify-between">
          <span className="text-body-sm text-navy-500 transition-transform duration-200 ease-in-out group-focus-within:-translate-x-1 group-focus-within:translate-y-1 group-hover:-translate-x-1 group-hover:translate-y-1">
            Read story
          </span>
          <span
            aria-hidden="true"
            className="-translate-x-1 opacity-0 transition-all duration-200 ease-in-out group-focus-within:translate-1 group-focus-within:opacity-100 group-hover:translate-1 group-hover:opacity-100"
          >
            <Icon name="arrowRight" />
          </span>
        </div>
      </div>
      <SmartLink href={href} className="absolute inset-0 z-3 rounded-md -outline-offset-2">
        <span className="sr-only">{title}</span>
      </SmartLink>
    </div>
  )
}
