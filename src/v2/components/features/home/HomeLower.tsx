import { DesignsSection } from './lower/DesignsSection'
import { FeatureListSection } from './lower/FeatureListSection'
import { LatestPosts } from './lower/LatestPosts'
import { SecuritySection } from './lower/SecuritySection'

/**
 * The lower half of the home page: the dark trust section and "built with"
 * tabs over the 3D background, then one rounded slate panel holding the
 * designs carousel, the feature list and the latest blog posts.
 */
export function HomeLower() {
  return (
    <>
      <SecuritySection />
      <div className="slate c-home-lower-panel -mt-7.5 bg-slate-50 md:-mt-15">
        <DesignsSection />
        <FeatureListSection />
        <LatestPosts />
      </div>
    </>
  )
}
