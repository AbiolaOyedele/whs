import { SmartLink } from '@v2/components/ui/SmartLink'
import { SplitArrow } from '@v2/components/features/home/lower/SplitArrow'
import { CAPABILITIES, capabilityHref } from '@v2/content/capabilities'

interface MoreWeBuildProps {
  /** The page being read, left out of the list. */
  current: string
}

/**
 * Every other "What we build" page, in the same two-column list and hover as
 * the home page's list, so the pages lead into each other.
 */
export function MoreWeBuild({ current }: MoreWeBuildProps) {
  const others = CAPABILITIES.filter((capability) => capability.slug !== current)
  return (
    <nav className="c-feature-list section-spacing grid gap-gutter md:grid-cols-3" aria-label="More we build">
      <div className="md:col-span-1">
        <h2 className="text-heading-sm text-balance">More we build</h2>
      </div>
      <div className="@container md:col-span-2">
        <ul className="c-feature-list_list">
          {others.map((capability) => (
            <li key={capability.slug} className="c-feature-list_item" data-scroll="">
              <SmartLink href={capabilityHref(capability.slug)} className="c-feature-list_link">
                <span className="c-feature-list_link_label">{capability.label}</span>
                <span className="c-feature-list_link_icon" aria-hidden="true">
                  <SplitArrow />
                </span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
