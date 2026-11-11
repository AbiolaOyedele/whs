/**
 * How pages talk to the fixed 3D background. Pages fire these on `window`;
 * the canvas listens. Scroll-progress events are fired by Locomotive through
 * `data-scroll-event-progress="<name>"` with `detail.progress` 0→1.
 */
export const CANVAS_EVENTS = {
  /** Home hero scrolling away (data-scroll-event-progress on the hero). */
  heroHomeProgress: 'onHeroHomeScrollProgress',
  /** Home "secure" section scrolling through (swaps to the glass-sphere view). */
  securityProgress: 'onSecurityScrollProgress',
  /** Use-case hero scrolling away. */
  heroUseCaseProgress: 'heroUseCase',
  /** About page overview scrolling through. */
  aboutOverviewProgress: 'aboutOverviewScrollProgress',
  /** Footer coming on screen. */
  footerProgress: 'footerScrollProgress',
  /** Home hero "click and hold" started / ended. No detail. */
  holdStart: 'hero:hold-start',
  holdEnd: 'hero:hold-end',
  /** Opaque sections now hide the whole background / part of it shows again. No detail. */
  covered: 'canvas:covered',
  uncovered: 'canvas:uncovered',
} as const

export interface ProgressDetail {
  target: HTMLElement
  progress: number
}

/** Scenes, set on <html data-scene> by the route. */
export type SceneName = 'home' | 'fashion' | 'beauty' | 'home-and-living'
