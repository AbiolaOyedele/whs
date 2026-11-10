'use client'

import { useEffect, useRef } from 'react'
import { LIVE_PREVIEWS, type LivePreviewSlug } from '@/config/previews'

type Device = 'laptop' | 'tablet' | 'phone'

/** Narrowest box that gets the laptop layout. */
const LAPTOP_MIN_WIDTH = 600
const PHONE_WIDTH = 390
/** How much slower than recorded the tour runs: each screen holds 1.8x as long. */
const PACE = 1.8

interface LivePreviewProps {
  slug: LivePreviewSlug
  /** Pins a layout. Without it the box's width chooses between laptop and phone. */
  device?: Device
  /** Must position and size the preview; the app fills whatever box it is given. */
  className?: string
}

/**
 * React twin of src/components/sections/LivePreview.astro, for the v2 site:
 * the real app from public/previews/screens running in an iframe, laid out at
 * its true width and scaled to fill the box. The frame is mounted only while
 * the box is within a screen of the viewport, and the wrapper carries the
 * description for screen readers.
 */
export function LivePreview({ slug, device: pinned, className = '' }: LivePreviewProps) {
  const root = useRef<HTMLDivElement>(null)
  const preview = LIVE_PREVIEWS[slug]

  useEffect(() => {
    const element = root.current
    if (!element) return
    const widths: Record<Device, number> = {
      laptop: preview.sizes.laptop.w,
      tablet: preview.sizes.tablet.w,
      phone: PHONE_WIDTH,
    }
    const deviceFor = (): Device => pinned ?? (element.clientWidth >= LAPTOP_MIN_WIDTH ? 'laptop' : 'phone')

    let device = deviceFor()
    let near = false
    let pageLoaded = document.readyState === 'complete'
    const frame = () => element.querySelector('iframe')

    const fit = () => {
      const current = frame()
      if (!current || element.clientWidth === 0) return
      const width = widths[device]
      const scale = element.clientWidth / width
      current.style.width = `${width}px`
      current.style.height = `${element.clientHeight / scale}px`
      current.style.transform = `scale(${scale})`
    }

    const mount = () => {
      if (frame()) return
      const next = document.createElement('iframe')
      next.src = `/previews/screens/${slug}.html?device=${device}&bare=1&pace=${PACE}`
      next.title = preview.label
      next.tabIndex = -1
      next.setAttribute('aria-hidden', 'true')
      // Same-origin is needed: the pages read their own storage on start and
      // render blank under an opaque origin. They are our own static files.
      next.setAttribute('sandbox', 'allow-scripts allow-same-origin')
      next.className = 'wh-live-frame'
      next.addEventListener('load', () => next.setAttribute('data-loaded', ''), { once: true })
      element.append(next)
      fit()
    }
    const unmount = () => frame()?.remove()

    // Crossing 600px swaps the layout, which needs a fresh page; anything else is a rescale.
    const resizeObserver = new ResizeObserver(() => {
      const next = deviceFor()
      if (next !== device) {
        device = next
        if (near && pageLoaded) {
          unmount()
          mount()
        }
      }
      fit()
    })
    resizeObserver.observe(element)

    // A preview is a whole app (up to a few megabytes), so it waits for the
    // page's own text, photos and fonts to finish first, even at the top of
    // the page. Until then the box shows its ink fill.
    const onPageLoad = () => {
      pageLoaded = true
      if (near) mount()
    }
    if (!pageLoaded) window.addEventListener('load', onPageLoad, { once: true })

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        near = entry?.isIntersecting ?? false
        if (near && pageLoaded) mount()
        else if (!near) unmount()
      },
      { rootMargin: '100% 0px' },
    )
    intersectionObserver.observe(element)

    return () => {
      window.removeEventListener('load', onPageLoad)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      unmount()
    }
  }, [slug, pinned, preview])

  return (
    <div
      ref={root}
      data-live-preview=""
      role="img"
      aria-label={preview.label}
      className={`overflow-hidden bg-charcoal ${className}`}
    />
  )
}
