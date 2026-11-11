'use client'

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motionAllowed } from '@v2/lib/gsap'
import { CANVAS_READY_EVENT, PAGE_CLASS, READY_EVENT, html } from '@v2/lib/page-state'
import { scrollToTop, startScroll, stopScroll } from '@v2/lib/scroll'

/** Must match --transition-page-duration. */
const LEAVE_MS = 300
/** The loader gives up waiting for the 3D background after this long. */
const LOADER_TIMEOUT_MS = 1000
/**
 * The logo intro on the loader (loader.css) finishes, with a short hold, by
 * this point. The loader then takes 0.6s to slide away: 1.5s in all.
 */
const INTRO_MS = 900

/**
 * How much of the logo intro is still to play. The intro is CSS, so it starts
 * with the first paint, well before this script has downloaded; waiting the
 * full length again from here would hold a finished animation on screen.
 */
function introRemaining(): number {
  if (!motionAllowed()) return 0
  const painted = performance.getEntriesByName('first-contentful-paint')[0]?.startTime
  const [navigation] = performance.getEntriesByType('navigation')
  const arrived = navigation instanceof PerformanceNavigationTiming ? navigation.responseEnd : 0
  const start = painted ?? arrived
  return Math.max(0, INTRO_MS - (performance.now() - start))
}

export const PAGE_LEAVE_EVENT = 'page:leave'

/**
 * Address changes inside one of these groups only swap part of the page
 * (the blog's category filter), so the scroll and the smooth-scroll engine stay.
 */
const SHALLOW_GROUPS: RegExp[] = [/^\/blog(?:\/category\/[^/]+)?\/?$/]

function isShallowChange(from: string, to: string): boolean {
  return SHALLOW_GROUPS.some((group) => group.test(from) && group.test(to))
}

interface TransitionContextValue {
  navigate: (href: string) => void
}

const TransitionContext = createContext<TransitionContextValue>({ navigate: () => {} })

export function usePageTransition(): TransitionContextValue {
  return useContext(TransitionContext)
}

function markReady(): void {
  const root = html()
  root.classList.remove(
    PAGE_CLASS.initialLoading,
    PAGE_CLASS.leaving,
    PAGE_CLASS.changing,
    PAGE_CLASS.transitioning
  )
  root.classList.add(PAGE_CLASS.ready)
  window.dispatchEvent(new CustomEvent(READY_EVENT))
}

/**
 * Runs the page lifecycle: the first-load loader, smooth scrolling, and the
 * fade-and-blur between pages. Internal links call `navigate`, which fades
 * the page out, swaps the route, then fades the new page in.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const pending = useRef(false)
  const firstPath = useRef(pathname)

  useEffect(() => {
    const root = html()
    requestAnimationFrame(() => root.classList.add(PAGE_CLASS.firstLoaded))
    // The page opens once the background is ready (or the wait gives up) and the logo intro has played.
    let done = false
    let backgroundReady = false
    let introPlayed = false
    const finish = () => {
      if (done || !backgroundReady || !introPlayed) return
      done = true
      markReady()
    }
    const onBackground = () => {
      backgroundReady = true
      finish()
    }
    window.addEventListener(CANVAS_READY_EVENT, onBackground, { once: true })
    const timer = window.setTimeout(onBackground, LOADER_TIMEOUT_MS)
    const introTimer = window.setTimeout(() => {
      introPlayed = true
      finish()
    }, introRemaining())
    void startScroll()
    return () => {
      window.removeEventListener(CANVAS_READY_EVENT, onBackground)
      window.clearTimeout(timer)
      window.clearTimeout(introTimer)
    }
  }, [])

  useEffect(() => {
    if (pathname === firstPath.current) return
    const previous = firstPath.current
    firstPath.current = pathname
    pending.current = false
    if (isShallowChange(previous, pathname)) return
    stopScroll()
    scrollToTop()
    const frame = requestAnimationFrame(() => {
      void startScroll().then(() => requestAnimationFrame(markReady))
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  const navigate = useCallback(
    (href: string) => {
      if (pending.current) return
      const target = new URL(href, window.location.href)
      if (target.pathname === window.location.pathname && target.hash) {
        router.push(href)
        return
      }
      pending.current = true
      const root = html()
      window.dispatchEvent(new CustomEvent(PAGE_LEAVE_EVENT))
      root.classList.remove(PAGE_CLASS.ready, 'has-header-fixed-visible')
      root.classList.add(PAGE_CLASS.transitioning, PAGE_CLASS.leaving, PAGE_CLASS.changing)
      window.setTimeout(() => {
        if (target.pathname === window.location.pathname) {
          pending.current = false
          scrollToTop()
          markReady()
          return
        }
        router.push(href)
      }, LEAVE_MS)
    },
    [router]
  )

  return <TransitionContext.Provider value={{ navigate }}>{children}</TransitionContext.Provider>
}
