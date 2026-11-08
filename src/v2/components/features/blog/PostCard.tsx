import { ArtPanel } from '@v2/components/ui/ArtPanel'
import { Icon, type IconName } from '@v2/components/ui/Icon'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { LivePreview } from '@v2/components/ui/LivePreview'
import type { LivePreviewSlug } from '@/config/previews'

export interface PostCardProps {
  href: string
  title: string
  /** ISO date. */
  date: string
  /** Already formatted for display. */
  dateLabel: string
  labels: string[]
  artSeed: number
  icon: IconName
  /** A live preview of the project, shown in place of the art (case studies). */
  preview?: LivePreviewSlug | undefined
  /** Heading level for the title, so the page's outline stays in order. */
  headingLevel?: 'h2' | 'h3'
}

/**
 * An article card: art that drifts with the scroll and grows a little on
 * hover, a pictogram over it, then the date, labels and title. An arrow
 * slides in on hover or focus; the whole card is the link.
 */
export function PostCard({
  href,
  title,
  date,
  dateLabel,
  labels,
  artSeed,
  icon,
  preview,
  headingLevel = 'h2',
}: PostCardProps) {
  const Heading = headingLevel
  return (
    <div className="group anim-scale relative flex h-full flex-col overflow-hidden rounded-md" data-scroll="">
      <div className="relative flex aspect-464/392 items-center justify-center overflow-hidden">
        {preview ? (
          <div className="c-blog-art absolute inset-0 group-focus-within:scale-105 group-hover:scale-105">
            <LivePreview slug={preview} className="absolute inset-0" />
          </div>
        ) : (
          <>
            <ParallaxMedia speed={-0.1}>
              <div className="c-blog-art absolute inset-0 group-focus-within:scale-105 group-hover:scale-105">
                <ArtPanel seed={artSeed} />
              </div>
            </ParallaxMedia>
            <Icon name={icon} strokeWidth={1} className="relative h-[38%] w-[25%] text-white" />
          </>
        )}
      </div>
      <div className="flex grow flex-col gap-3.5 bg-slate-50 p-5 pb-7 slate:bg-white">
        <div className="flex items-center justify-between">
          <ul className="text-label flex flex-wrap gap-x-3.5 gap-y-1.5">
            <li>
              <time dateTime={date}>{dateLabel}</time>
            </li>
            {labels.map((label) => (
              <li
                key={label}
                className="text-navy-500 transition-all duration-200 ease-in-out group-hover:text-navy-900"
              >
                {label}
              </li>
            ))}
          </ul>
          <span
            aria-hidden="true"
            className="shrink-0 translate-x-1 opacity-0 transition-all duration-200 ease-in-out group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100"
          >
            <Icon name="arrowRight" />
          </span>
        </div>
        <Heading className="text-heading-xs">{title}</Heading>
      </div>
      <SmartLink href={href} className="absolute inset-0 z-above rounded-md -outline-offset-2">
        <span className="sr-only">{title}</span>
      </SmartLink>
    </div>
  )
}
