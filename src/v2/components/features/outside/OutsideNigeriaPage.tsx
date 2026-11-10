import { Button } from '@v2/components/ui/Button'
import { Icon } from '@v2/components/ui/Icon'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { OUTSIDE_NIGERIA } from '@v2/content/outside-nigeria'

/**
 * /outside-nigeria: the title and an honest intro, the four steps a project
 * follows across time zones, then the two ways to start.
 */
export function OutsideNigeriaPage() {
  return (
    <div className="slate rounded-b-4xl bg-white pt-safe-header pb-fluid-3xl">
      <div className="container pt-fluid-lg">
        <SplitTitle as="h1" className="text-heading-xl mb-6 max-w-[16ch]">
          {OUTSIDE_NIGERIA.title}
        </SplitTitle>
        <p className="text-body-lg mb-fluid-xl max-w-150 text-pretty">{OUTSIDE_NIGERIA.intro}</p>
        <ol className="gap-gutter mb-fluid-xl grid md:grid-cols-2">
          {OUTSIDE_NIGERIA.steps.map((step) => (
            <li key={step.title} className="border-charcoal flex flex-col gap-3 border-t pt-6">
              <div className="flex items-center gap-3">
                <Icon name={step.icon} className="text-navy-900 size-7 shrink-0" />
                <h2 className="text-heading-xs text-navy-900">{step.title}</h2>
              </div>
              <p className="text-body-md text-navy-900 max-w-130 text-pretty">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-4">
          <Button label={OUTSIDE_NIGERIA.primary.label} href={OUTSIDE_NIGERIA.primary.href} variant="pink" />
          <Button label={OUTSIDE_NIGERIA.secondary.label} href={OUTSIDE_NIGERIA.secondary.href} variant="outline" />
        </div>
      </div>
    </div>
  )
}
