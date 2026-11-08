import { FaqList } from '@v2/components/features/faq/FaqList'
import { FAQ_TITLE, FAQS } from '@v2/content/pricing'

export function PricingFaqs() {
  return <FaqList title={FAQ_TITLE} faqs={FAQS} />
}
