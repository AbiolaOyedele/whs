import { Accordion } from '@v2/components/ui/Accordion'

export interface FaqItem {
  question: string
  /** One string per paragraph. */
  answer: string | string[]
}

interface FaqListProps {
  title: string
  faqs: FaqItem[]
}

/** A two-line display title on the left, questions on the right; each question scales up as it scrolls in. */
export function FaqList({ title, faqs }: FaqListProps) {
  if (faqs.length === 0) return null
  return (
    <div className="grid gap-gutter md:grid-cols-2">
      <div>
        <h2 className="text-heading-xl max-w-[9ch] md:sticky md:top-32">{title}</h2>
      </div>
      <div>
        {faqs.map((faq) => (
          <div key={faq.question} className="anim-scale" data-scroll="">
            <Accordion title={faq.question}>
              {(Array.isArray(faq.answer) ? faq.answer : [faq.answer]).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  )
}
