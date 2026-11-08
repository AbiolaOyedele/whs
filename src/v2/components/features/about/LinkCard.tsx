'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'

/** How long "Copied to clipboard" stays up. */
const COPIED_MS = 2000

type LinkCardProps =
  | { type: 'email'; label: string; email: string; className?: string; children?: ReactNode }
  | { type: 'download' | 'link'; label: string; title: string; href: string; className?: string; children?: ReactNode }

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Clipboard blocked (insecure origin or denied); fall through to the textarea copy.
  }
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.className = 'fixed -left-[9999px]'
  document.body.appendChild(field)
  field.select()
  const copied = document.execCommand('copy')
  field.remove()
  return copied
}

/**
 * A tile with a mono label top left and a title in the middle. On hover the
 * fill shrinks a touch, the label slides in and an arrow appears. Email cards
 * copy the address on click or tap and say so in a tooltip; download and link
 * cards are one big link. `children` replaces the title, e.g. artwork.
 */
export function LinkCard(props: LinkCardProps) {
  const { type, label, className = '', children } = props
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  const onCopy = async () => {
    if (props.type !== 'email') return
    const ok = await copyText(props.email)
    if (!ok) {
      window.location.href = `mailto:${props.email}`
      return
    }
    setCopied(true)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setCopied(false)
      timer.current = null
    }, COPIED_MS)
  }

  const title = props.type === 'email' ? props.email : props.title

  return (
    <div className={`c-link-card anim-scale ${copied ? 'is-copied' : ''} ${className}`} data-type={type} data-scroll="">
      <div className="c-link-card_top">
        <span className="c-label c-link-card_label" data-scroll="" data-scroll-offset="20%">
          <span className="c-label_circle" />
          <span className="c-label_text">{label}</span>
        </span>
        <span className="c-icon c-link-card_icon" aria-hidden="true">
          <Icon name={type === 'download' ? 'download' : 'arrowRight'} className="size-6.5" />
        </span>
      </div>
      {children ?? <div className="c-link-card_title">{title}</div>}
      {props.type === 'email' ? (
        <>
          <button className="c-link-card_button" type="button" onClick={onCopy}>
            <span className="sr-only">Copy email address to clipboard</span>
          </button>
          <span className="c-link-card_copy -copy" aria-hidden="true">
            Copy to clipboard
          </span>
          <span className="c-link-card_copy -copied" aria-hidden="true">
            Copied to clipboard
          </span>
          <span className="sr-only" role="status">
            {copied ? 'Email address copied' : ''}
          </span>
        </>
      ) : (
        <SmartLink className="c-link-card_link" href={props.href}>
          <span className="sr-only">{props.type === 'download' ? `Download: ${title}` : title}</span>
        </SmartLink>
      )}
    </div>
  )
}
