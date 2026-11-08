/**
 * The page's lifecycle lives in classes on <html>, so CSS can key every
 * entrance off one place:
 *
 *   is-initial-loading  loader showing, first paint not ready
 *   is-first-loaded     set one frame after the first paint
 *   is-ready            content may animate in
 *   is-leaving          an internal link was followed; content fades out
 *   is-changing         the route is swapping
 */
export const PAGE_CLASS = {
  initialLoading: 'is-initial-loading',
  firstLoaded: 'is-first-loaded',
  ready: 'is-ready',
  leaving: 'is-leaving',
  changing: 'is-changing',
  transitioning: 'is-transitioning',
} as const

export const READY_EVENT = 'page:ready'
export const CANVAS_READY_EVENT = 'canvas:ready'

export function html(): HTMLElement {
  return document.documentElement
}

export function isReady(): boolean {
  return html().classList.contains(PAGE_CLASS.ready)
}

/** Runs `callback` once <html> has `is-ready`, straight away if it already has. */
export function onReady(callback: () => void): () => void {
  if (isReady()) {
    callback()
    return () => {}
  }
  const observer = new MutationObserver(() => {
    if (!isReady()) return
    observer.disconnect()
    callback()
  })
  observer.observe(html(), { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}
