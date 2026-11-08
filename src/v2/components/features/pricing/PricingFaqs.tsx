import { Accordion } from '@v2/components/ui/Accordion'
import { FAQ_TITLE, FAQS } from '@v2/content/pricing'

/** Title on the left, questions on the right; each question scales up as it scrolls in. */
export function PricingFaqs() {
  return (
    <div className="grid gap-gutter md:grid-cols-2">
      <div>
        <h2 className="text-heading-sm">{FAQ_TITLE}</h2>
      </div>
      <div>
        {FAQS.map((faq) => (
          <div key={faq.question} className="anim-scale" data-scroll="">
            <Accordion title={faq.question}>
              {faq.answer.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  )
}
