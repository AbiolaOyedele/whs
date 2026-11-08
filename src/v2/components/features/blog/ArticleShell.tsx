import type { ReactNode } from 'react'
import type { Author } from '@v2/content/blog'
import type { IconName } from '@v2/components/ui/Icon'
import { ArtPanel } from '@v2/components/ui/ArtPanel'
import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { AuthorChip } from '@v2/components/features/blog/AuthorChip'
import { Button } from '@v2/components/ui/Button'
import type { Photo } from '@v2/content/photos'

interface ArticleShellProps {
  title: string
  /** ISO date and its display form. */
  date: string
  dateLabel: string
  /** Category links beside the date. */
  labels?: { label: string; href: string }[]
  author: Author
  artSeed: number
  icon: IconName
  /** The product's logo (case studies): shown in the header panel in place of the art. */
  logo?: string | undefined
  /** A photo (Insights posts): shown as the banner in place of the art. */
  photo?: Photo | undefined
  /** The "See all" button that rides down beside the article. */
  back: { label: string; href: string }
  /** The body column: lede, rich text and any closing sections. */
  children: ReactNode
  /** Rendered under the article, e.g. the related row. */
  after?: ReactNode
}

/**
 * An article page in the reference's layout: a centred header with the date,
 * title and author, a wide art panel that unclips on arrival, then the body
 * beside a sticky copy of the title. A navy button to the list sticks to the
 * bottom of the screen on the left while you read.
 */
export function ArticleShell({
  title,
  date,
  dateLabel,
  labels = [],
  author,
  artSeed,
  icon,
  logo,
  photo,
  back,
  children,
  after,
}: ArticleShellProps) {
  return (
    <>
      <div className="slate bg-slate-50 pb-1">
        <div className="container">
          <div className="relative pt-safe-header">
            <article className="mt-fluid-3xl max-md:mb-fluid-2xl md:mb-fluid-4xl">
              <header>
                <div className="grid gap-gutter max-sm:mb-fluid-xl sm:mb-fluid-4xl lg:grid-cols-12">
                  <div className="lg:col-start-3 lg:col-end-11">
                    <div className="flex flex-col justify-center gap-8.5 text-center">
                      <ul className="text-label flex flex-wrap justify-center gap-x-5 gap-y-2">
                        <li className="anim-transform-opacity -delay-1">
                          <time dateTime={date}>{dateLabel}</time>
                        </li>
                        {labels.map((item) => (
                          <li key={item.href} className="anim-transform-opacity -delay-2">
                            <SmartLink
                              href={item.href}
                              className="relative text-navy-500 before:absolute before:-inset-x-2 before:-inset-y-4 before:content-[''] hover:underline"
                            >
                              {item.label}
                            </SmartLink>
                          </li>
                        ))}
                      </ul>
                      <SplitTitle as="h1" className="text-heading-xl mx-auto max-w-300 text-balance">
                        {title}
                      </SplitTitle>
                      <div className="anim-transform-opacity -delay-3 flex justify-center">
                        <AuthorChip author={author} seed={artSeed + 40} />
                      </div>
                    </div>
                  </div>
                </div>
                {photo ? (
                  <div className="anim-image-clip-path relative mb-fluid-lg overflow-hidden rounded-md">
                    <img src={photo.src} alt={photo.alt} className="aspect-4/3 w-full object-cover md:aspect-2/1" />
                  </div>
                ) : logo ? (
                  <div className="anim-image-clip-path relative mb-fluid-lg flex justify-center overflow-hidden rounded-md bg-white py-fluid-2xl">
                    <div className="relative aspect-880/744 w-[50%] max-w-180">
                      <div className="flex h-full w-full items-center justify-center">
                        <img src={logo} alt="" className="m-auto max-h-1/2 max-w-3/4 object-contain" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="anim-image-clip-path relative mb-fluid-lg flex justify-center overflow-hidden bg-slate-100 py-fluid-2xl">
                    <ArtPanel seed={artSeed} />
                    <div className="relative z-above aspect-880/744 w-[50%] max-w-180">
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon name={icon} strokeWidth={0.75} className="m-auto h-1/2 w-1/2 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </header>
              <div className="grid gap-gutter md:grid-cols-12">
                <div className="md:col-span-4">
                  <p aria-hidden="true" className="text-heading-sm sticky top-safe-header pb-20 text-balance max-md:hidden">
                    {title}
                  </p>
                </div>
                <div className="min-w-0 md:col-span-8">{children}</div>
              </div>
            </article>
            <div className="pointer-events-none md:absolute md:top-0 md:left-0 md:h-[calc(100%+var(--grid-gutter))]">
              <div className="sticky top-0 flex h-screen items-end pb-gutter max-md:hidden">
                <Button label={back.label} variant="navy" href={back.href} className="pointer-events-auto" />
              </div>
            </div>
          </div>
          <hr className="border-slate-300 max-md:my-fluid-xl md:mt-fluid-3xl" />
        </div>
      </div>
      {after}
    </>
  )
}
