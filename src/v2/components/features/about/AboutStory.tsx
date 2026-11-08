import { Button } from '@v2/components/ui/Button'
import { aboutStory } from '@v2/content/about'

/** "Why we built it": a two-line heading on the left, a lead line, a paragraph and a button on the right. */
export function AboutStory() {
  return (
    <div className="section-spacing container">
      <div className="grid gap-x-gutter gap-y-fluid-xl max-md:mb-fluid-3xl md:mb-fluid-4xl md:grid-cols-12">
        <div className="md:col-start-1 md:col-end-5">
          <div className="flex flex-col gap-fluid-sm">
            <h2 className="text-heading-lg">
              {aboutStory.headingLead}
              <br />
              <span className="text-gradient">{aboutStory.headingHighlight}</span>
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-fluid-lg md:col-start-7 md:col-end-12">
          <div className="text-heading-2xs">
            <p>{aboutStory.lead}</p>
          </div>
          <div className="wysiwyg-navy wysiwyg">
            <p>{aboutStory.body}</p>
            <div className="not-first:mt-fluid-xl not-last:mb-fluid-xl">
              <Button label={aboutStory.cta.label} href={aboutStory.cta.href} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
