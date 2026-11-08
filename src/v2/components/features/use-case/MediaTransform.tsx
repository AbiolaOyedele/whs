'use client'

import { useEffect, useRef } from 'react'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { getGsap, motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'

type MediaType = 'image' | 'video'

/** An empty photo frame: a cross corner to corner. */
const IMAGE_PATH = 'M1 1L221 221M1 221L221 1'
/** A play button: a ring with a triangle in it. */
const VIDEO_PATH = 'M141 111A30 30 0 1 1 81 111A30 30 0 1 1 141 111ZM104 99V123L124 111Z'
const PATHS: Record<MediaType, string> = { image: IMAGE_PATH, video: VIDEO_PATH }

const START: MediaType[] = ['image', 'image', 'image', 'video', 'image', 'video']
const MORPH_EVERY = 3000
const MORPH_DURATION = 0.8
const NARROW_BELOW = 720
const NARROW_COUNT = 4
const WIDE_COUNT = 6

function randomTone(): 'is-white' | 'is-pink' {
  return Math.random() < 0.5 ? 'is-white' : 'is-pink'
}

/**
 * A row of square outlines under the hero, each an empty photo frame or a
 * play button. Every three seconds one of them morphs into the other kind
 * and picks a new colour, always keeping a mix of both on screen.
 */
export function MediaTransform() {
  const host = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLDivElement | null)[]>([])
  const morphs = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    const root = host.current
    if (!root) return
    const gsap = getGsap()
    gsap.registerPlugin(MorphSVGPlugin)
    const types = [...START]
    const paths = morphs.current.filter((path): path is SVGPathElement => !!path)
    items.current.forEach((item) => item?.classList.add(randomTone()))
    if (!motionAllowed()) return

    let timer: number | null = null
    let last: number | null = null

    const morphOne = () => {
      const visible = Math.min(window.innerWidth < NARROW_BELOW ? NARROW_COUNT : WIDE_COUNT, types.length)
      const keep = visible <= NARROW_COUNT ? 1 : 2
      const images = types.slice(0, visible).filter((type) => type === 'image').length
      const videos = visible - images
      const options: number[] = []
      for (let i = 0; i < visible; i++) {
        if (i === last) continue
        const isImage = types[i] === 'image'
        const imagesAfter = isImage ? images - 1 : images + 1
        const videosAfter = isImage ? videos + 1 : videos - 1
        if (imagesAfter >= keep && videosAfter >= keep) options.push(i)
      }
      const index = options[Math.floor(Math.random() * options.length)]
      if (index === undefined) return
      const item = items.current[index]
      const path = morphs.current[index]
      const next: MediaType = types[index] === 'image' ? 'video' : 'image'
      last = index
      item?.classList.remove('is-white', 'is-pink')
      item?.classList.add(randomTone())
      if (!path) {
        types[index] = next
        return
      }
      gsap.to(path, {
        morphSVG: PATHS[next],
        duration: MORPH_DURATION,
        ease: 'power2.inOut',
        onComplete: () => {
          types[index] = next
        },
      })
    }

    const stop = () => {
      if (timer !== null) window.clearInterval(timer)
      timer = null
    }
    const unobserve = observeInview(root, (_entry, visible) => {
      if (visible && timer === null) timer = window.setInterval(morphOne, MORPH_EVERY)
      if (!visible) stop()
    })
    return () => {
      unobserve()
      stop()
      gsap.killTweensOf(paths)
    }
  }, [])

  return (
    <div ref={host} className="c-media-transform" aria-hidden="true">
      {START.map((type, index) => (
        <div
          key={index}
          ref={(node) => {
            items.current[index] = node
          }}
          className="c-media-transform_item"
        >
          <div className="c-media-transform_svg-wrap">
            <svg viewBox="0 0 222 222" fill="none" className="c-media-transform_svg">
              <path
                ref={(node) => {
                  morphs.current[index] = node
                }}
                className="c-media-transform_morph"
                d={PATHS[type]}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}
