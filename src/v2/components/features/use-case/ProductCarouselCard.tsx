'use client'

import { useEffect, useRef } from 'react'
import { FluidPanel } from '@v2/components/ui/FluidPanel'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { getGsap, motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'
import type { ProductSlide } from '@v2/content/use-cases'

interface ProductCarouselCardProps {
  items: ProductSlide[]
  artSeed: number
}

/** Centre card full size; its neighbours smaller; the ones past them smaller still. */
const SCALE = [1, 0.85, 0.7] as const
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
 * A vertical wheel of real products over the art, each card carrying the
 * product's own logo, its name and what it does in one line. Every 2.5
 * seconds it rolls up one; the middle card is full size and the ones around
 * it shrink. Copies at both ends make it loop without a jump. Used for "see
 * what we have built" and "no two apps alike".
 */
export function ProductCarouselCard({ items, artSeed }: ProductCarouselCardProps) {
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
        const vars = { top: centreY(offset, listHeight) - itemHeight / 2, scale: SCALE[level(offset)] }
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
    <div className="c-uc-products">
      <ParallaxMedia className="rounded-[inherit]">
        <FluidPanel seed={artSeed} />
      </ParallaxMedia>
      <div ref={list} className="c-uc-products_list">
        {loop.map((item, index) => {
          if (!item) return null
          const clone = count > 1 && (index < CLONES || index >= CLONES + count)
          return (
            <div
              key={`${item.name}-${index}`}
              ref={(node) => {
                nodes.current[index] = node
              }}
              className="c-uc-products_item"
              aria-hidden={clone ? 'true' : undefined}
            >
              <div className="flex w-full items-center gap-4 rounded-md bg-white p-2.5 sm:gap-5">
                <div className="flex aspect-square w-[30%] shrink-0 items-center justify-center rounded-md border border-navy-900 bg-white">
                  <img
                    src={item.logo.src}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    className="size-[64%] object-contain"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
                  <p className="text-heading-2xs text-balance sm:text-heading-xs">{item.name}</p>
                  <p className="text-pretty text-navy-900 max-sm:text-[12px] max-sm:leading-[1.3] max-sm:tracking-[0.01em] sm:text-body-sm">
                    {item.line}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
