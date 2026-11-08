'use client'

import { useEffect, useRef } from 'react'
import { CANVAS_READY_EVENT } from '@v2/lib/page-state'

/**
 * The fixed 3D backdrop behind every page. three.js loads after first paint
 * in its own chunk; until it is ready (or if WebGL is missing) the element
 * stays transparent and the page background shows through. With reduced
 * motion it draws one still frame per scene.
 */
export function BackgroundCanvas() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = host.current
    if (!element) return
    let cancelled = false
    let dispose: (() => void) | null = null

    const markReady = () => {
      element.dataset.ready = ''
    }
    const fallback = () => {
      element.dataset.fallback = ''
      markReady()
      window.dispatchEvent(new CustomEvent(CANVAS_READY_EVENT))
    }

    // Load three.js once the browser is idle, so evaluating it never delays first paint or input.
    const load = () =>
      import('./engine/start')
        .then(({ startStage }) => {
          if (cancelled) return
          // No separate WebGL probe: a throwaway context costs a second GPU start-up and,
          // with different settings, can switch graphics chips. Creating the real renderer
          // throws when WebGL is missing, and the catch below falls back.
          const stage = startStage({
            host: element,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            onFirstFrame: markReady,
          })
          dispose = () => stage.dispose()
        })
        .catch((error: unknown) => {
          console.error('Background canvas failed to start', error)
          if (!cancelled) fallback()
        })
    const idle = typeof window.requestIdleCallback === 'function'
    const handle = idle
      ? window.requestIdleCallback(() => void load(), { timeout: 700 })
      : window.setTimeout(() => void load(), 50)

    return () => {
      cancelled = true
      if (idle) window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
      dispose?.()
      delete element.dataset.ready
    }
  }, [])

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="c-background-canvas pointer-events-none fixed inset-0 -z-2 h-full w-full"
    />
  )
}
