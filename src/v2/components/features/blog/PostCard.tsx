import { Icon } from '@v2/components/ui/Icon'
import { LogoMark } from '@v2/components/ui/LogoMark'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { SmartLink } from '@v2/components/ui/SmartLink'
import type { Photo } from '@v2/content/photos'

export interface PostCardProps {
  href: string
  title: string
  /** ISO date. */
  date: string
  /** Already formatted for display. */
  dateLabel: string
  labels: string[]
  /** A photo filling the media box (Insights posts). */
  photo?: Photo | undefined
  /** The product's logo on a white panel (case studies). Without a photo or logo, the WildHands mark. */
  logo?: string | undefined
  /** Heading level for the title, so the page's outline stays in order. */
  headingLevel?: 'h2' | 'h3'
}

/**
 * An article card: a photo (or the product's logo on white) that drifts with
 * the scroll and grows a little on hover, then the title with its date and
 * labels under it. An arrow slides in on hover or focus; the whole card is
 * the link.
 */
export function PostCard({
  href,
  title,
  date,
  dateLabel,
  labels,
  logo,
  photo,
  headingLevel = 'h2',
}: PostCardProps) {
  const Heading = headingLevel
  return (
    <div className="group anim-scale relative flex h-full flex-col overflow-hidden rounded-md" data-scroll="">
      <div className="relative flex aspect-464/392 items-center justify-center overflow-hidden">
        {photo ? (
          <ParallaxMedia speed={-0.1}>
            <div className="c-blog-art absolute inset-0 group-focus-within:scale-105 group-hover:scale-105">
              <img src={photo.src} alt={photo.alt} className="size-full object-cover" />
            </div>
          </ParallaxMedia>
        ) : logo ? (
          <div className="c-blog-art absolute inset-0 flex items-center justify-center bg-white group-focus-within:scale-105 group-hover:scale-105">
            <img src={logo} alt="" className="max-h-[34%] max-w-[46%] object-contain" />
          </div>
        ) : (
          <div className="c-blog-art absolute inset-0 flex items-center justify-center bg-white group-focus-within:scale-105 group-hover:scale-105">
            <LogoMark className="w-[34%] text-navy-900" />
          </div>
        )}
      </div>
      <div className="flex grow flex-col gap-3.5 bg-white p-5 pb-7 slate:bg-white">
        <Heading className="text-heading-xs">{title}</Heading>
        <div className="mt-auto flex items-center justify-between">
          <ul className="text-label flex flex-wrap gap-x-3.5 gap-y-1.5">
            <li>
              <time dateTime={date}>{dateLabel}</time>
            </li>
            {labels.map((label) => (
              <li
                key={label}
                className="text-navy-900 transition-all duration-200 ease-in-out group-hover:text-navy-900"
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
      </div>
      <SmartLink href={href} className="absolute inset-0 z-above rounded-md -outline-offset-2">
        <span className="sr-only">{title}</span>
      </SmartLink>
    </div>
  )
}
