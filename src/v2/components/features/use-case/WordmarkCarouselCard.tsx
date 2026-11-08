'use client'

import { useEffect, useRef } from 'react'
import { FluidPanel } from '@v2/components/ui/FluidPanel'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { getGsap, motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'
import type { CardImage } from '@v2/content/photos'

interface WordmarkCarouselCardProps {
  logos: CardImage[]
  artSeed: number
}

const SCALE_INACTIVE = 0.7
const ADVANCE_EVERY = 2500
const DURATION = 0.6
const EASE = 'power2.inOut'
const CLONES = 2
const GAP_RATIO = 0.3

/**
 * A column of white square tiles over the fluid panel, each holding a
 * product's logo. Every 2.5 seconds it rolls up one; the middle tile grows to
 * full size, the rest stay smaller.
 */
export function WordmarkCarouselCard({ logos, artSeed }: WordmarkCarouselCardProps) {
  const list = useRef<HTMLDivElement>(null)
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const count = logos.length
  const loop =
    count > 1
      ? [
          ...Array.from({ length: CLONES }, (_, i) => logos[(((count - CLONES + i) % count) + count) % count]),
          ...logos,
          ...Array.from({ length: CLONES }, (_, i) => logos[i % count]),
        ]
      : logos

  useEffect(() => {
    const host = list.current
    if (!host) return
    const gsap = getGsap()
    const all = nodes.current.slice(0, loop.length)

    if (count <= 1) {
      const only = all[0]
      if (only) gsap.set(only, { top: '50%', yPercent: -50, scale: 1 })
      return
    }

    let current = CLONES
    let size = 0
    let busy = false

    const place = (animate: boolean, done?: () => void) => {
      const middle = host.offsetHeight / 2
      const step = size * (1 + GAP_RATIO)
      all.forEach((node, index) => {
        if (!node) return
        const offset = index - current
        const vars = {
          top: middle + offset * step - size / 2,
          scale: offset === 0 ? 1 : SCALE_INACTIVE,
        }
        if (!animate) {
          gsap.set(node, vars)
          return
        }
        const last = index === all.length - 1
        gsap.to(node, {
          ...vars,
          duration: DURATION,
          ease: EASE,
          overwrite: true,
          ...(last && done ? { onComplete: done } : {}),
        })
      })
      if (!animate) done?.()
    }

    const measure = () => {
      size = host.offsetWidth
    }

    const advance = () => {
      if (busy) return
      busy = true
      current += 1
      place(true, () => {
        busy = false
        if (current >= CLONES + count) {
          current -= count
          place(false)
        }
      })
    }

    measure()
    place(false)

    let timer: number | null = null
    const stop = () => {
      if (timer !== null) window.clearInterval(timer)
      timer = null
    }
    const unobserve = observeInview(host, (_entry, visible) => {
      if (visible && timer === null && motionAllowed()) timer = window.setInterval(advance, ADVANCE_EVERY)
      if (!visible) stop()
    })
    const resize = new ResizeObserver(() => {
      measure()
      place(false)
    })
    resize.observe(host)

    return () => {
      stop()
      unobserve()
      resize.disconnect()
      gsap.killTweensOf(all)
    }
  }, [count, loop.length])

  return (
    <div className="c-uc-logo-carousel_container">
      <ParallaxMedia>
        <FluidPanel seed={artSeed} />
      </ParallaxMedia>
      <div ref={list} className="c-uc-logo-carousel_list">
        {loop.map((logo, index) => {
          if (!logo) return null
          const clone = count > 1 && (index < CLONES || index >= CLONES + count)
          return (
            <div
              key={`${logo.src}-${index}`}
              ref={(node) => {
                nodes.current[index] = node
              }}
              className="c-uc-logo-carousel_item"
              aria-hidden={clone ? 'true' : undefined}
            >
              <img src={logo.src} alt={clone ? '' : logo.alt} draggable={false} className="max-h-[38%] max-w-[64%] object-contain" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
