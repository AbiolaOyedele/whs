import { Button } from '@v2/components/ui/Button'
import { Icon } from '@v2/components/ui/Icon'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { CANVAS_EVENTS } from '@v2/lib/canvas-events'
import { TRUST } from '@v2/content/home-lower'
import { BuiltWithSection } from './BuiltWithSection'

/**
 * The dark stretch over the 3D background: trust facts on the left and
 * right while the glass sphere turns behind (the canvas follows this
 * section's scroll progress), then the dot grid and the "built with" tabs.
 */
export function SecuritySection() {
  return (
    <section
      className="dark overflow-hidden pt-fluid-3xl pb-fluid-4xl"
      data-background-canvas-inview=""
      data-scroll=""
      data-scroll-event-progress={CANVAS_EVENTS.securityProgress}
    >
      <div className="c-home-lower-spacing container mb-[calc(var(--spacing-fluid-3xl)*3)] text-white">
        <div className="grid grid-cols-1 gap-gutter max-md:gap-y-[40vh] md:grid-cols-2">
          <div className="flex flex-col gap-9">
            <div className="flex max-w-150 flex-col gap-12.5">
              <SplitTitle as="h2" className="max-md:text-heading-xl md:text-heading-lg">
                {TRUST.title.before} {TRUST.title.highlight}{' '}
                {TRUST.title.after}
              </SplitTitle>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                label={TRUST.primary.label}
                href={TRUST.primary.href}
                variant="pink"
              />
              <Button label={TRUST.secondary.label} href={TRUST.secondary.href} variant="outline" />
            </div>
          </div>
          <div>
            <ul className="flex flex-col gap-12.5">
              {TRUST.points.map((point) => (
                <li key={point.title} className="flex max-w-[460px] flex-col gap-1 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Icon name={point.icon} className="size-7 shrink-0" />
                    <h3 className="text-heading-xs">{point.title}</h3>
                  </div>
                  <p>{point.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <BuiltWithSection />
    </section>
  )
}
