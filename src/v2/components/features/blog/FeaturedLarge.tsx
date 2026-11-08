import type { BlogCardData } from '@v2/content/blog'
import { ArtPanel } from '@v2/components/ui/ArtPanel'
import { Icon } from '@v2/components/ui/Icon'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { SmartLink } from '@v2/components/ui/SmartLink'

interface FeaturedLargeProps {
  post: BlogCardData
}

/** The newest post, large: title over drifting art, the pictogram centred below it. */
export function FeaturedLarge({ post }: FeaturedLargeProps) {
  return (
    <div className="anim-transform-opacity md:col-span-8">
      <div className="group relative z-above overflow-hidden rounded-md bg-charcoal max-md:aspect-4/5 md:h-full md:min-h-[40vw] 4xl:min-h-[895px]">
        <div className="flex h-full flex-col gap-6 p-6">
          <div>
            <ul className="text-label mb-4 flex flex-wrap gap-x-3.5 gap-y-1.5">
              <li>
                <time dateTime={post.date} className="text-white">
                  {post.dateLabel}
                </time>
              </li>
              {post.labels.map((label) => (
                <li key={label} className="text-white/70">
                  {label}
                </li>
              ))}
            </ul>
            <h2 className="text-heading-md text-balance text-white sm:w-3/4">{post.title}</h2>
          </div>
          <div className="relative z-above flex max-w-[220px] grow items-center justify-center self-center py-6 max-md:w-[30%] md:w-[20%]">
            <div className="aspect-square w-full">
              <Icon name={post.icon} strokeWidth={1} className="size-full text-white" />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="shrink-0 translate-x-1 text-white opacity-0 transition-all duration-200 ease-in-out group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100"
          >
            <Icon name="arrowRight" />
          </div>
        </div>
        <ParallaxMedia speed={-0.1} className="z-below">
          <div className="c-blog-art absolute inset-0 group-hover:scale-105">
            <ArtPanel seed={post.artSeed} />
          </div>
        </ParallaxMedia>
        <SmartLink href={post.href} className="absolute inset-0 z-above rounded-md -outline-offset-2">
          <span className="sr-only">{post.title}</span>
        </SmartLink>
      </div>
    </div>
  )
}
