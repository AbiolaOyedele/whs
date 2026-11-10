import { Button } from '@v2/components/ui/Button'
import type { ExampleLink } from '@v2/content/use-cases'

interface ExampleCardProps {
  item: ExampleLink
}

/** One next step: an ink card with the title, a line and a button to act on it. */
export function ExampleCard({ item }: ExampleCardProps) {
  return (
    <div
      className="anim-scale bg-charcoal flex h-full flex-col justify-between gap-8 rounded-lg p-6 text-white md:p-8"
      data-scroll=""
    >
      <div className="flex flex-col gap-3">
        <h3 className="text-heading-xs">{item.title}</h3>
        <p className="text-body-md max-w-110">{item.body}</p>
      </div>
      <div>
        <Button label={item.action} href={item.href} variant="white" />
      </div>
    </div>
  )
}
