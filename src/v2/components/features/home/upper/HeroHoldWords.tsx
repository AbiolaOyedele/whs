import { forwardRef } from 'react'

interface HeroHoldWordsProps {
  /** Three words: shown left, centre and right on wide screens. */
  words: readonly string[]
}

/** Where each word sits across the screen, like the reference. */
const ALIGN = ['max-md:text-center', 'text-center', 'max-md:text-center md:text-right'] as const

/**
 * The big words that flicker in, letter by letter, while the hero is held.
 * Each letter is its own span so the hero can light them one at a time;
 * they start hidden and the hero script drives them.
 */
export const HeroHoldWords = forwardRef<HTMLDivElement, HeroHoldWordsProps>(function HeroHoldWords({ words }, ref) {
  return (
    <div ref={ref} className="absolute inset-0 h-screen w-full" aria-hidden="true">
      {words.map((word, index) => (
        <div
          key={word}
          className={`absolute top-1/2 right-(--grid-margin) left-(--grid-margin) -translate-y-1/2 font-secondary text-7xl leading-none md:text-[10vw] ${ALIGN[index] ?? 'text-center'}`}
        >
          <div data-hero-hold-word="">
            {Array.from(word).map((letter, i) => (
              <span key={i} className="c-hero-hold-letter inline-block" data-hero-hold-letter="">
                {letter === ' ' ? ' ' : letter}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
})
