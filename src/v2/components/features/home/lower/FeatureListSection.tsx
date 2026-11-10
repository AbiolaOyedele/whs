import { Button } from '@v2/components/ui/Button'
import { FEATURES } from '@v2/content/home-lower'

/**
 * A pointer to the full list of what we build: the heading and a line on the
 * left, one button on the right that opens /what-we-build.
 */
export function FeatureListSection() {
  return (
    <div className="c-home-lower-spacing container">
      <div className="my-fluid-3xl gap-gutter grid gap-y-6 md:grid-cols-3 md:items-end">
        <div className="flex flex-col gap-4 md:col-span-2">
          <h2 className="text-heading-xl text-balance">{FEATURES.title}</h2>
          <p className="text-body-md max-w-140 text-pretty">{FEATURES.body}</p>
        </div>
        <div className="md:justify-self-end">
          <Button label={FEATURES.action.label} href={FEATURES.action.href} variant="outline" />
        </div>
      </div>
    </div>
  )
}
