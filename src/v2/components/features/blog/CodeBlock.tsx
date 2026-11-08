'use client'

import { useEffect, useRef, useState } from 'react'

interface CodeBlockProps {
  code: string
  language: string
}

type CopyState = 'idle' | 'copied' | 'failed'

const LABELS: Record<CopyState, string> = { idle: 'Copy', copied: 'Copied', failed: 'Failed' }
const RESET_MS = 2000

/** Writes `text` to the clipboard, falling back to a hidden textarea where the API is missing or blocked. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.className = 'fixed -left-[9999px]'
    document.body.appendChild(area)
    try {
      area.select()
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      area.remove()
    }
  }
}

/**
 * A code sample in an article. A copy button shows on hover or focus on a
 * computer, and is always showing on a touch screen; it says "Copied" for
 * two seconds after a press.
 */
export function CodeBlock({ code, language }: CodeBlockProps) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onCopy = async () => {
    const copied = await copyText(code)
    setState(copied ? 'copied' : 'failed')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), RESET_MS)
  }

  return (
    <pre className="c-code" data-language={language}>
      <code>{code}</code>
      <button type="button" className="c-code_copy" onClick={onCopy} aria-label="Copy code to clipboard">
        <span aria-live="polite">{LABELS[state]}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
          <rect x="8" y="8" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </pre>
  )
}
