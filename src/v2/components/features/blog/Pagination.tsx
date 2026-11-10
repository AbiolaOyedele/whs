import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'

interface PaginationProps {
  /** e.g. "/blog". Page 1 is this path; later pages are `${basePath}/page/n`. */
  basePath: string
  current: number
  total: number
}

export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`
}

const ARROW =
  'button group relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white text-navy-900 slate:bg-white max-md:size-11 md:size-8.5'

function ArrowFill() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-pink-100 opacity-0 transition-[transform,opacity] duration-200 ease-(--ease) [transform:scale3d(0.9,0.7,1)] group-hover:opacity-100 group-hover:[transform:scale3d(1,1,1)] group-disabled:opacity-0"
    />
  )
}

interface ArrowProps {
  direction: 'previous' | 'next'
  href: string | null
}

function Arrow({ direction, href }: ArrowProps) {
  const label = direction === 'previous' ? 'Previous page' : 'Next page'
  const icon = <Icon name={direction === 'previous' ? 'arrowLeft' : 'arrowRight'} className="relative size-5" />
  if (!href) {
    return (
      <button type="button" disabled className={`${ARROW} cursor-not-allowed opacity-50`}>
        <ArrowFill />
        <span className="sr-only">{label}</span>
        {icon}
      </button>
    )
  }
  return (
    <SmartLink href={href} className={ARROW}>
      <ArrowFill />
      <span className="sr-only">{label}</span>
      {icon}
    </SmartLink>
  )
}

/** Previous and next arrows either side of the page numbers, on a white pill. */
export function Pagination({ basePath, current, total }: PaginationProps) {
  const pages = Array.from({ length: Math.max(total, 1) }, (_, index) => index + 1)
  return (
    <nav aria-label="Pages" className="c-pagination">
      <Arrow direction="previous" href={current > 1 ? pageHref(basePath, current - 1) : null} />
      <ul className="c-pagination_list flex items-center justify-center">
        {pages.map((page) => (
          <li key={page} className="c-pagination_item">
            <SmartLink
              href={pageHref(basePath, page)}
              aria-current={page === current ? 'page' : undefined}
              className={`c-pagination_link max-md:inline-flex max-md:min-h-11 max-md:min-w-11 max-md:items-center max-md:justify-center ${page === current ? 'underline' : ''}`}
            >
              <span className="sr-only">Page </span>
              {page}
            </SmartLink>
          </li>
        ))}
      </ul>
      <Arrow direction="next" href={current < total ? pageHref(basePath, current + 1) : null} />
    </nav>
  )
}
