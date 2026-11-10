import { LivePreview } from '@v2/components/ui/LivePreview'
import { LIVE_PREVIEWS, type LivePreviewSlug } from '@/config/previews'

/**
 * A live preview set inside a case study's write-up, with its caption
 * ("The app", "The website"). The box picks the layout: the laptop view in
 * the wide reading column, the phone view on small screens.
 */
export function CaseStudyPreview({ slug }: { slug: LivePreviewSlug }) {
  return (
    <figure className="not-first:mt-fluid-xl not-last:mb-fluid-xl">
      <figcaption className="text-label mb-4 text-navy-900">{LIVE_PREVIEWS[slug].caption}</figcaption>
      <LivePreview slug={slug} className="relative aspect-4/5 w-full rounded-md md:aspect-8/5" />
    </figure>
  )
}
