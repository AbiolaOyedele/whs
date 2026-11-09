import { SmartLink } from '@v2/components/ui/SmartLink'
import { FEATURE_LINKS, FEATURES_LABEL } from '@v2/content/home-lower'
import { SplitArrow } from './SplitArrow'

/**
 * Label on the left, every built-in feature in two columns on the right.
 * Each row slides in as it scrolls into view, so rows arrive one after
 * another; on a wide screen with a mouse, the hovered row lights up and its
 * text and arrow draw toward each other.
 */
export function FeatureListSection() {
  return (
    <div className="c-home-lower-spacing container">
      <div className="c-feature-list my-fluid-3xl grid gap-gutter md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-heading-sm text-balance">{FEATURES_LABEL}</h2>
        </div>
        <div className="@container md:col-span-2">
          <ul className="c-feature-list_list">
            {FEATURE_LINKS.map((feature) => (
              <li key={feature.label} className="c-feature-list_item" data-scroll="">
                <SmartLink href={feature.href} className="c-feature-list_link">
                  <span className="c-feature-list_link_label">{feature.label}</span>
                  <span className="c-feature-list_link_icon" aria-hidden="true">
                    <SplitArrow />
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
