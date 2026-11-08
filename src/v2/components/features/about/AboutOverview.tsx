import { AboutGallery } from '@v2/components/features/about/AboutGallery'
import { AboutLinks } from '@v2/components/features/about/AboutLinks'
import { AboutStory } from '@v2/components/features/about/AboutStory'
import { Label } from '@v2/components/ui/Label'
import { aboutOverview } from '@v2/content/about'
import { CANVAS_EVENTS } from '@v2/lib/canvas-events'

/**
 * The white panel that slides up over the hero: who we are, the images,
 * why we built it and the link cards. Its scroll progress drives the
 * 3D background (aboutOverviewScrollProgress).
 */
export function AboutOverview() {
  return (
    <div
      className="wrapper relative z-above -mt-7.5 bg-white md:-mt-15"
      data-scroll=""
      data-scroll-event-progress={CANVAS_EVENTS.aboutOverviewProgress}
    >
      <div className="section-spacing container">
        <div className="grid gap-x-gutter gap-y-fluid-xl md:grid-cols-12">
          <div className="md:col-start-1 md:col-end-5">
            <div className="flex flex-col max-md:gap-fluid-md md:gap-fluid-sm">
              <Label>{aboutOverview.label}</Label>
              <h3 className="text-heading-xs text-balance">{aboutOverview.heading}</h3>
            </div>
          </div>
          <div className="md:col-start-7 md:col-end-12">
            <div className="wysiwyg-navy wysiwyg">
              {aboutOverview.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AboutGallery />
      <AboutStory />
      <AboutLinks />
    </div>
  )
}
