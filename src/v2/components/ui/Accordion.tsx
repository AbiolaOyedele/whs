'use client'

import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motionAllowed } from '@v2/lib/gsap'

const DURATION_MS = 300
const EASE = 'cubic-bezier(0.645, 0.045, 0.355, 1)'

interface AccordionProps {
  title: string
  children: ReactNode
  className?: string
}

/**
 * A question that opens to its answer. Built on <details> so it works with no
 * script; with script the height eases open and shut over 300ms.
 */
export function Accordion({ title, children, className = '' }: AccordionProps) {
  const details = useRef<HTMLDetailsElement>(null)
  const summary = useRef<HTMLElement>(null)
  const animation = useRef<Animation | null>(null)
  const closing = useRef(false)

  const finish = (open: boolean) => {
    const el = details.current
    if (!el) return
    animation.current = null
    closing.current = false
    el.open = open
    el.style.removeProperty('height')
    el.style.removeProperty('overflow')
  }

  const onClick = (event: MouseEvent) => {
    const el = details.current
    const head = summary.current
    if (!el || !head || !motionAllowed()) return
    event.preventDefault()
    animation.current?.cancel()

    if (closing.current || !el.open) {
      el.style.overflow = 'hidden'
      el.style.height = `${el.offsetHeight}px`
      el.open = true
      requestAnimationFrame(() => {
        const from = el.offsetHeight
        const to = el.scrollHeight
        if (to <= from) return finish(true)
        animation.current = el.animate([{ height: `${from}px` }, { height: `${to}px` }], {
          duration: DURATION_MS,
          easing: EASE,
        })
        animation.current.onfinish = () => finish(true)
      })
      closing.current = false
      return
    }

    closing.current = true
    el.style.overflow = 'hidden'
    animation.current = el.animate([{ height: `${el.offsetHeight}px` }, { height: `${head.offsetHeight}px` }], {
      duration: DURATION_MS,
      easing: EASE,
    })
    animation.current.onfinish = () => finish(false)
  }

  return (
    <details ref={details} className={`c-accordion ${className}`}>
      <summary ref={summary} className="c-accordion_summary" onClick={onClick}>
        <span className="c-accordion_summary_button">
          <span className="c-plus-icon" />
        </span>
        <span className="c-accordion_summary_title">{title}</span>
      </summary>
      <div className="c-accordion_content">
        <div className="wysiwyg wysiwyg-navy">{children}</div>
      </div>
    </details>
  )
}
