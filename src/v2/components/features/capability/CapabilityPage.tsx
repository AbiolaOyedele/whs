import { site } from '@v2/config/site'
import { Icon } from '@v2/components/ui/Icon'
import { guideBySlug, type HelpGuide } from '@v2/content/resources'
import type { Capability } from '@v2/content/capabilities'
import { CapabilityCallToAction } from './CapabilityCallToAction'
import { CapabilityHero } from './CapabilityHero'
import { CapabilitySection } from './CapabilitySection'
import { MoreWeBuild } from './MoreWeBuild'
import { RelatedWorkCard } from './RelatedWorkCard'

interface CapabilityPageProps {
  capability: Capability
}

/**
 * One "What we build" page: the dark hero with the live preview, a white
 * panel that says what it is, who it is for, what you get and how we build
 * it, then a slate panel with the real projects behind it, a call to action
 * and every other thing we build.
 */
export function CapabilityPage({ capability }: CapabilityPageProps) {
  const related = capability.related
    .map((slug) => guideBySlug(slug))
    .filter((guide): guide is HelpGuide => guide !== undefined)

  return (
    <div className="c-capability">
      <CapabilityHero capability={capability} />

      <div className="relative z-above -mt-7.5 rounded-4xl bg-white md:-mt-15">
        <div className="wrapper">
          <div className="container">
            <CapabilitySection label="What it is">
              <p className="text-heading-md text-balance">{capability.whatItIs.statement}</p>
              <p className="text-body-lg mt-fluid-sm max-w-160 text-navy-500">{capability.whatItIs.body}</p>
            </CapabilitySection>

            <CapabilitySection label="Who it is for">
              <ul className="grid gap-x-gutter sm:grid-cols-3">
                {capability.whoFor.map((item) => (
                  <li key={item} className="flex gap-3 border-t border-slate-200 py-5">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-pink-500 text-charcoal">
                      <Icon name="check" className="size-4" />
                    </span>
                    <span className="text-heading-2xs text-balance">{item}</span>
                  </li>
                ))}
              </ul>
            </CapabilitySection>

            <CapabilitySection label="What you get">
              <ul className="grid gap-gutter sm:grid-cols-2">
                {capability.youGet.map((point) => (
                  <li key={point.title} className="rounded-lg bg-slate-50 p-fluid-md">
                    <span className="grid size-12 place-items-center rounded-md bg-charcoal text-pink-500">
                      <Icon name={point.icon} />
                    </span>
                    <h3 className="text-heading-xs mt-6 text-balance">{point.title}</h3>
                    <p className="text-body-md mt-2 text-navy-500">{point.body}</p>
                  </li>
                ))}
              </ul>
            </CapabilitySection>

            <CapabilitySection label="How we build it">
              <ol className="grid gap-x-gutter gap-y-fluid-md sm:grid-cols-2">
                {capability.howWeBuild.map((step, index) => (
                  <li key={step.title} className="border-t border-charcoal pt-5">
                    <span className="text-label text-navy-500">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="text-heading-xs mt-4">{step.title}</h3>
                    <p className="text-body-md mt-2 text-navy-500">{step.body}</p>
                  </li>
                ))}
              </ol>
            </CapabilitySection>
          </div>
        </div>

        <div className="slate wrapper relative z-above -mt-7.5 bg-slate-50 md:-mt-15">
          <div className="container">
            {related.length > 0 ? (
              <section className="section-spacing" aria-labelledby="capability-related">
                <h2 id="capability-related" className="text-heading-sm mb-fluid-lg">
                  Built by {site.name}
                </h2>
                <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((guide) => (
                    <RelatedWorkCard key={guide.slug} guide={guide} />
                  ))}
                </div>
              </section>
            ) : null}
            <CapabilityCallToAction subject={capability.subject} />
            <MoreWeBuild current={capability.slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
