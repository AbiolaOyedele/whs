import type { ReactNode } from 'react'
import { Button } from '@v2/components/ui/Button'

interface RelatedRowProps {
  title: string
  seeAllHref: string
  /** One card per item; each is given the row's column width. */
  cards: { key: string; node: ReactNode }[]
}

/**
 * "Related articles" under a post: three cards in a row on a wide screen,
 * a row you swipe on a phone or tablet.
 */
export function RelatedRow({ title, seeAllHref, cards }: RelatedRowProps) {
  return (
    <section className="slate overflow-hidden rounded-b-4xl bg-slate-50 pb-fluid-3xl" aria-labelledby="related-title">
      <div className="container mt-fluid-2xl">
        <div className="mb-fluid-lg flex items-center justify-between gap-gutter">
          <h2 id="related-title" className="text-heading-sm">
            {title}
          </h2>
          <Button label="See all" variant="light" href={seeAllHref} className="shrink-0" />
        </div>
        <div className="c-related no-scrollbar gap-gutter max-md:flex max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:pb-gutter md:grid md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.key} className="c-related_item max-md:shrink-0 max-md:snap-start">
              {card.node}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
