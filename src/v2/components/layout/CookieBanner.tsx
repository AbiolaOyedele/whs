'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { onReady } from '@v2/lib/page-state'
import { lockScroll } from '@v2/lib/scroll'
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

const HIT_AREA = "relative after:absolute after:inset-x-0 after:-inset-y-3.5 after:content-[''] md:after:hidden"

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

const BOX_BUTTON = 'text-label min-h-11 rounded-sm transition-colors duration-200'
const PRIMARY = `${BOX_BUTTON} bg-pink-500 text-charcoal hover:bg-pink-600`
const SECONDARY = `${BOX_BUTTON} bg-slate-50 text-navy-900 hover:bg-slate-100`

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M19.5 4.5l-15 15M4.5 4.5l15 15" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  )
}

interface SwitchProps {
  label: string
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

function Switch({ label, checked, disabled = false, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed ${
        checked ? (disabled ? 'bg-pink-500/45' : 'bg-pink-500') : 'bg-slate-300'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-1 size-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}
      />
    </button>
  )
}

/**
 * The cookie notice: a small box bottom right once the page is ready, until
 * a choice is made, and a centred preferences window (opened from the box's
 * Settings button or the footer) with a switch per kind of cookie.
 * Analytics stay off until accepted.
 */
export function CookieBanner() {
  const [boxOpen, setBoxOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const dialog = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (readConsent()) return
    return onReady(() => setBoxOpen(true))
  }, [])

  const openPreferences = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setAnalytics(readConsent()?.analytics ?? false)
    setPrefsOpen(true)
  }, [])

  useEffect(() => {
    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences)
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences)
  }, [openPreferences])

  useEffect(() => {
    if (!prefsOpen) return
    lockScroll(true)
    dialog.current?.focus()
    return () => {
      lockScroll(false)
      returnFocus.current?.focus()
    }
  }, [prefsOpen])

  const decide = (consent: Consent) => {
    saveConsent(consent)
    setBoxOpen(false)
    setPrefsOpen(false)
  }

  // While the preferences window is open: Escape closes it and Tab stays inside it.
  useEffect(() => {
    if (!prefsOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPrefsOpen(false)
        return
      }
      if (event.key !== 'Tab' || !dialog.current) return
      const focusable = dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [prefsOpen])

  return (
    <div id="cookie-banner" data-lenis-prevent="">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-text"
        aria-hidden={!boxOpen}
        className={`fixed right-4 bottom-4 left-4 z-(--z-index-modal) max-w-[24rem] rounded-md bg-white text-navy-900 shadow-[0_8px_40px_rgb(16_20_33/0.25)] transition-[opacity,transform,visibility] duration-250 ease-(--ease) sm:left-auto ${
          boxOpen && !prefsOpen ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4 px-4 pt-4">
          <h2 id="cookie-title" className="text-body-md font-semibold">
            Cookies on this site
          </h2>
          <button
            type="button"
            aria-label="Close and keep only the cookies the site needs"
            onClick={() => decide({ necessary: true, analytics: false })}
            className="-mt-2 -mr-2 grid size-11 place-items-center rounded-sm bg-slate-50 hover:bg-slate-100"
          >
            <CloseIcon />
          </button>
        </div>
        <p id="cookie-text" className="text-body-sm px-4 pt-2 text-navy-500">
          We use the cookies the site needs to work. Analytics only run if you accept them.
        </p>
        <div className="grid grid-cols-2 gap-2 px-4 pt-4">
          <button type="button" onClick={() => decide({ necessary: true, analytics: true })} className={PRIMARY}>
            Accept all
          </button>
          <button type="button" onClick={() => decide({ necessary: true, analytics: false })} className={SECONDARY}>
            Reject all
          </button>
          <button type="button" onClick={openPreferences} className={`${SECONDARY} col-span-2`}>
            Settings
          </button>
        </div>
        <div className="mt-4 rounded-b-md bg-slate-50 px-4 py-1">
          <SmartLink href="/privacy" className="text-body-sm inline-flex min-h-11 items-center text-navy-500 underline">
            Privacy Policy
          </SmartLink>
        </div>
      </div>

      <div
        aria-hidden={!prefsOpen}
        className={`fixed inset-0 z-(--z-index-modal) grid place-items-center p-4 transition-[opacity,visibility] duration-250 ease-(--ease) ${
          prefsOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close cookie preferences"
          onClick={() => setPrefsOpen(false)}
          className="absolute inset-0 bg-charcoal/65"
        />
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-prefs-title"
          tabIndex={-1}
          className={`relative flex max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-[40rem] flex-col overflow-hidden rounded-md bg-white text-navy-900 outline-none transition-transform duration-250 ease-(--ease) ${
            prefsOpen ? 'translate-y-0' : 'translate-y-4'
          }`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3">
            <h2 id="cookie-prefs-title" className="text-heading-2xs">
              Cookie preferences
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setPrefsOpen(false)}
              className="grid size-11 place-items-center rounded-sm bg-slate-50 hover:bg-slate-100"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
            <div>
              <h3 className="text-body-md font-semibold">You choose</h3>
              <p className="text-body-sm mt-1 text-navy-500">
                Pick which cookies this site may use. You can change this any time from the footer. More in our{' '}
                <SmartLink href="/privacy" className="underline">
                  Privacy Policy
                </SmartLink>
                .
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-sm bg-slate-50 p-4">
              <div>
                <h3 className="text-body-md font-semibold">Needed for the site to work</h3>
                <p className="text-body-sm mt-1 text-navy-500">These keep the site running. They are always on.</p>
              </div>
              <Switch label="Needed for the site to work" checked disabled />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-sm bg-slate-50 p-4">
              <div>
                <h3 className="text-body-md font-semibold">Analytics</h3>
                <p className="text-body-sm mt-1 text-navy-500">
                  Count visits so we can see which pages help. Off unless you turn them on.
                </p>
              </div>
              <Switch label="Analytics" checked={analytics} onChange={setAnalytics} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
            <button type="button" onClick={() => decide({ necessary: true, analytics: true })} className={`${PRIMARY} px-5`}>
              Accept all
            </button>
            <button
              type="button"
              onClick={() => decide({ necessary: true, analytics: false })}
              className={`${SECONDARY} bg-white px-5`}
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={() => decide({ necessary: true, analytics })}
              className={`${SECONDARY} bg-white px-5 sm:ml-auto`}
            >
              Save my choices
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
