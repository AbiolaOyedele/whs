'use client'

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CANVAS_READY_EVENT, PAGE_CLASS, READY_EVENT, html } from '@v2/lib/page-state'
import { scrollToTop, startScroll, stopScroll } from '@v2/lib/scroll'

/** Must match --transition-page-duration. */
const LEAVE_MS = 300
/** The loader gives up waiting for the 3D background after this long. */
const LOADER_TIMEOUT_MS = 1000

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
  root.classList.remove(PAGE_CLASS.initialLoading, PAGE_CLASS.leaving, PAGE_CLASS.changing, PAGE_CLASS.transitioning)
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
    let done = false
    const finish = () => {
      if (done) return
      done = true
      markReady()
    }
    window.addEventListener(CANVAS_READY_EVENT, finish, { once: true })
    const timer = window.setTimeout(finish, LOADER_TIMEOUT_MS)
    void startScroll()
    return () => {
      window.removeEventListener(CANVAS_READY_EVENT, finish)
      window.clearTimeout(timer)
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
    [router],
  )

  return <TransitionContext.Provider value={{ navigate }}>{children}</TransitionContext.Provider>
}
