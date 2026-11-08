import { forwardRef, type RefObject } from 'react'

interface HeroCursorProps {
  /** The progress circle; the hero fills it while the pointer is held down. */
  progressRef: RefObject<SVGCircleElement | null>
  hint: string
}

/**
 * The ring that trails the mouse over the home hero: a faint circle, a bright
 * progress stroke and two dots that turn into a pause sign while held.
 * Hidden on touch screens; the hero script moves and shows it.
 */
export const HeroCursor = forwardRef<HTMLDivElement, HeroCursorProps>(function HeroCursor({ progressRef, hint }, ref) {
  return (
    <div ref={ref} className="c-cursor max-md:hidden" aria-hidden="true">
      <div className="c-cursor_container">
        <svg className="c-cursor_svg" viewBox="0 0 150 150">
          <circle className="c-cursor_ring" cx="75" cy="75" r="71" />
          <circle ref={progressRef} className="c-cursor_progress" cx="75" cy="75" r="71" />
        </svg>
        <div className="c-cursor_content">
          <div className="c-cursor_content_bar" />
          <div className="c-cursor_content_bar" />
        </div>
      </div>
      <span className="c-cursor_text text-label text-center" data-hero-hold-hide="">
        {hint}
      </span>
    </div>
  )
})
