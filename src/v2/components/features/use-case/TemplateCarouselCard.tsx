'use client'

import { useEffect, useRef } from 'react'
import { getGsap, motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'
import type { TemplateSlide } from '@v2/content/use-cases'
import { TemplateGlyph } from './TemplateGlyph'

interface TemplateCarouselCardProps {
  items: TemplateSlide[]
}

/** Centre card full size; neighbours smaller and washed out; edges smaller still. */
const SCALE = [1, 0.85, 0.65] as const
const OVERLAY = [0, 0.3, 0.6] as const
const ADVANCE_EVERY = 2500
const DURATION = 0.6
const EASE = 'power2.inOut'
const CLONES = 3
const GAP_RATIO = 0.175

function level(offset: number): 0 | 1 | 2 {
  const away = Math.abs(offset)
  return away === 0 ? 0 : away === 1 ? 1 : 2
}

/**
 * A vertical wheel of template cards on a light panel. Every 2.5 seconds it
 * rolls up one: the middle card is full size, the ones around it shrink and
 * fade. Copies at both ends make it loop without a jump.
 */
export function TemplateCarouselCard({ items }: TemplateCarouselCardProps) {
  const list = useRef<HTMLDivElement>(null)
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const count = items.length
  const loop =
    count > 1
      ? [
          ...Array.from({ length: CLONES }, (_, i) => items[(((count - CLONES + i) % count) + count) % count]),
          ...items,
          ...Array.from({ length: CLONES }, (_, i) => items[i % count]),
        ]
      : items

  useEffect(() => {
    const host = list.current
    if (!host) return
    const gsap = getGsap()
    const all = nodes.current.slice(0, loop.length)
    const overlayOf = (node: HTMLDivElement | null) => node?.querySelector<HTMLElement>('[data-overlay]') ?? null

    if (count <= 1) {
      const only = all[0]
      if (only) gsap.set(only, { top: '50%', yPercent: -50, scale: 1 })
      return
    }

    let current = CLONES
    let itemHeight = 0
    let busy = false

    const centreY = (offset: number, listHeight: number) => {
      const gap = itemHeight * GAP_RATIO
      let y = listHeight / 2
      const dir = offset > 0 ? 1 : -1
      for (let i = 0; i !== offset; i += dir) {
        const a = SCALE[level(i)]
        const b = SCALE[level(i + dir)]
        y += dir * (((a + b) * itemHeight) / 2 + gap)
      }
      return y
    }

    const place = (animate: boolean, done?: () => void) => {
      const listHeight = host.offsetHeight
      all.forEach((node, index) => {
        if (!node) return
        const offset = index - current
        const step = level(offset)
        const top = centreY(offset, listHeight) - itemHeight / 2
        const overlay = overlayOf(node)
        const last = index === all.length - 1
        if (animate) {
          gsap.to(node, { top, scale: SCALE[step], duration: DURATION, ease: EASE, overwrite: true })
          if (overlay)
            gsap.to(overlay, {
              opacity: OVERLAY[step],
              duration: DURATION,
              ease: EASE,
              overwrite: true,
              ...(last && done ? { onComplete: done } : {}),
            })
        } else {
          gsap.set(node, { top, scale: SCALE[step] })
          if (overlay) gsap.set(overlay, { opacity: OVERLAY[step] })
        }
      })
      if (!animate) done?.()
    }

    const measure = () => {
      itemHeight = all[CLONES]?.offsetHeight || host.offsetWidth
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
    <div className="c-uc-gpu-carousel_container">
      <div ref={list} className="c-uc-gpu-carousel_list">
        {loop.map((item, index) => {
          if (!item) return null
          const clone = count > 1 && (index < CLONES || index >= CLONES + count)
          return (
            <div
              key={`${item.glyph}-${index}`}
              ref={(node) => {
                nodes.current[index] = node
              }}
              className="c-uc-gpu-carousel_item"
              aria-hidden={clone ? 'true' : undefined}
            >
              <div className="c-uc-gpu-carousel_card">
                <div className="c-uc-gpu-carousel_card_logo">
                  <TemplateGlyph name={item.glyph} className="size-[70%]" />
                </div>
                <div className="c-uc-gpu-carousel_card_content">
                  <h3 className="text-heading-2xs sm:text-heading-xs">{item.name}</h3>
                  <p className="text-balance text-navy-500 max-sm:text-[12px] max-sm:leading-[1.3] max-sm:tracking-[0.01em] sm:text-body-sm">
                    {item.bestFor}
                  </p>
                </div>
                <div data-overlay="" className="c-uc-gpu-carousel_card_overlay" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
