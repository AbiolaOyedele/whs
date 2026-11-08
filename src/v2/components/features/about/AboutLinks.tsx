import { LinkCard } from '@v2/components/features/about/LinkCard'
import { aboutLinkCards } from '@v2/content/about'

/** Three link cards: copy our email, see the work, open the brand assets. */
export function AboutLinks() {
  return (
    <div className="section-spacing container">
      <ul className="mb-fluid-2xl grid gap-gutter sm:grid-cols-2 md:grid-cols-3">
        {aboutLinkCards.map((card) => (
          <li key={card.label}>
            {card.type === 'email' ? (
              <LinkCard type="email" label={card.label} email={card.email} />
            ) : (
              <LinkCard type={card.type} label={card.label} title={card.title} href={card.href} />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
