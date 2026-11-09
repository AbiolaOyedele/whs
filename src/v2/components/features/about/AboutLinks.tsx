import { LinkCard } from '@v2/components/features/about/LinkCard'
import { aboutLinkCards, type AboutLinkTone } from '@v2/content/about'

/** Modifier class per brand fill; the fills live in pages/about.css. */
const TONE_CLASS: Record<AboutLinkTone, string> = {
  lime: '-lime',
  ink: '-ink',
  white: '-white',
}

/** Three link cards, each on its own brand fill: copy our email, see the work, open the brand assets. */
export function AboutLinks() {
  return (
    <div className="c-about-links section-spacing container">
      <ul className="mb-fluid-2xl grid gap-gutter sm:grid-cols-2 md:grid-cols-3">
        {aboutLinkCards.map((card) => (
          <li key={card.type === 'email' ? card.email : card.href}>
            {card.type === 'email' ? (
              <LinkCard type="email" email={card.email} className={TONE_CLASS[card.tone]} />
            ) : (
              <LinkCard
                type={card.type}
                title={card.title}
                href={card.href}
                className={TONE_CLASS[card.tone]}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
