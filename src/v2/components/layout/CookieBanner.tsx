'use client'

import { useEffect, useState } from 'react'
import { onReady } from '@v2/lib/page-state'
import { SmartLink } from '@v2/components/ui/SmartLink'

const STORAGE_KEY = 'cookie-consent'
const OPEN_PREFERENCES_EVENT = 'cookie:preferences'

interface Consent {
  /** Always true: the site does not work without these. */
  necessary: true
  analytics: boolean
}

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null && 'analytics' in parsed) {
      return { necessary: true, analytics: (parsed as { analytics: unknown }).analytics === true }
    }
    return null
  } catch {
    return null
  }
}

function saveConsent(consent: Consent): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
  } catch {
    // Private windows refuse storage; the box simply shows again next visit.
  }
}

const HIT_AREA =
  "relative after:absolute after:inset-x-0 after:-inset-y-3.5 after:content-[''] md:after:hidden"

/** Opens the cookie preferences from the footer. */
export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className={`text-label ${HIT_AREA} cursor-pointer text-left hover:underline`}
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT))}
    >
      Cookie preferences
    </button>
  )
}

const BUTTON = 'text-label min-h-11 rounded-sm transition-colors duration-200'
const ACCEPT = `${BUTTON} bg-pink-500 text-charcoal hover:bg-pink-600`
const REJECT = `${BUTTON} bg-charcoal text-white hover:bg-navy-900`

/**
 * The cookie notice: a small box bottom right once the page is ready, until
 * a choice is made, with Accept and Reject. The footer's "Cookie preferences"
 * opens it again so a choice can be changed. Analytics stay off until accepted.
 */
export function CookieBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (readConsent()) return
    return onReady(() => setOpen(true))
  }, [])

  useEffect(() => {
    const reopen = () => setOpen(true)
    window.addEventListener(OPEN_PREFERENCES_EVENT, reopen)
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, reopen)
  }, [])

  const decide = (analytics: boolean) => {
    saveConsent({ necessary: true, analytics })
    setOpen(false)
  }

  return (
    <div
      id="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-text"
      aria-hidden={!open}
      data-lenis-prevent=""
      className={`text-navy-900 fixed right-4 bottom-4 left-4 z-(--z-index-modal) max-w-[24rem] rounded-md bg-white p-4 shadow-[0_8px_40px_rgb(19_19_20/0.25)] transition-[opacity,transform,visibility] duration-250 ease-(--ease) sm:left-auto ${
        open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-4 opacity-0'
      }`}
    >
      <h2 id="cookie-title" className="text-body-md font-semibold">
        Cookies on this site
      </h2>
      <p id="cookie-text" className="text-body-sm text-navy-900 pt-2">
        We use the cookies the site needs to work. Analytics only run if you accept them. More in
        our{' '}
        <SmartLink href="/privacy" className="underline">
          Privacy Policy
        </SmartLink>
        .
      </p>
      <div className="grid grid-cols-2 gap-2 pt-4">
        <button type="button" onClick={() => decide(true)} className={ACCEPT}>
          Accept
        </button>
        <button type="button" onClick={() => decide(false)} className={REJECT}>
          Reject
        </button>
      </div>
    </div>
  )
}
