import { site } from '@v2/config/site'
import { Button } from '@v2/components/ui/Button'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { CANVAS_EVENTS } from '@v2/lib/canvas-events'
import type { HeroVisual, TitlePart } from '@v2/content/use-cases'
import { CrosswordGrid } from './CrosswordGrid'
import { MediaTransform } from './MediaTransform'
import { TitleText } from './TitleText'
import { VoiceVisualizer } from './VoiceVisualizer'

interface HeroUseCaseProps {
  title: TitlePart[]
  intro: string
  visual: HeroVisual
}

/**
 * The dark first screen: a line that draws in, the big title on the left, the pitch and two buttons on the right, then
 * the page's own animation below. Its scroll progress drives the background.
 */
export function HeroUseCase({ title, intro, visual }: HeroUseCaseProps) {
  return (
    <section
      className="dark relative block pb-[calc(--spacing(18)+var(--spacing-fluid-lg))] text-white"
      data-scroll=""
      data-scroll-event-progress={CANVAS_EVENTS.heroUseCaseProgress}
      data-background-canvas-inview=""
    >
      <div className="relative z-above flex min-h-svh flex-col justify-end pt-header">
        <div className="container">
          <div className="my-5">
            <div className="animated-line" />
          </div>
          <div className="grid min-h-[50svh] gap-x-gutter gap-y-fluid-lg max-md:pb-fluid-xl sm:grid-cols-12 md:pb-fluid-2xl">
            <div className="sm:col-start-1 sm:col-end-7">
              <SplitTitle as="h1" className="text-heading-2xl">
                <TitleText parts={title} />
              </SplitTitle>
            </div>
            <div className="sm:col-start-9 sm:col-end-13 lg:col-end-12">
              <div className="flex max-w-100 flex-col gap-7.5">
                <div className="wysiwyg wysiwyg-navy wysiwyg-p:text-body-md! anim-transform-opacity text-balance">
                  <p>{intro}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="anim-transform-opacity -delay-2">
                    <Button label="Get in touch" href={site.signUpUrl} />
                  </div>
                  <div className="anim-transform-opacity -delay-3">
                    <Button label="Request a quote" href="/request-a-quote" variant="glass" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {visual.kind === 'voice' ? (
        <div className="container">
          <VoiceVisualizer />
        </div>
      ) : null}
      {visual.kind === 'crossword' ? (
        <CrosswordGrid
          className="container"
          words={visual.words}
          mobileWords={visual.mobileWords}
          sequence={visual.sequence}
          mobileSequence={visual.mobileSequence}
        />
      ) : null}
      {visual.kind === 'media' ? (
        <div className="container">
          <MediaTransform />
        </div>
      ) : null}
    </section>
  )
}
