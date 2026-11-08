import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { introCopy } from '@v2/content/home-upper'

/** "Made for Nigerian sellers, / run from your phone": the big intro title, used beside the lead and above the cards on phones. */
export function HomeIntroTitle({ className = '' }: { className?: string }) {
  return (
    <SplitTitle as="p" className={`text-heading-xl ${className}`}>
      {introCopy.title.before}
      <br />
      <span className="text-gradient">{introCopy.title.highlight}</span>
    </SplitTitle>
  )
}
