'use client'

/**
 * The client-side router that replaces Next's App Router for the v2 site.
 *
 * Every v2 page in Astro renders one React island (`App`), so the 3D
 * background, header and page-transition state live in a single tree, just
 * as they did under Next's root layout. Internal navigation swaps the route
 * inside that tree with history.pushState instead of loading a new document,
 * so the background keeps running between pages and the fade/blur from
 * TransitionProvider plays the same way it did before.
 *
 * Astro still prerenders each route to its own HTML file, so a direct visit,
 * a reload or a crawler gets the right page without JavaScript.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface RouterValue {
  pathname: string
  push: (href: string) => void
}

const RouterContext = createContext<RouterValue | null>(null)

/** Drops a trailing slash so '/pricing/' and '/pricing' resolve the same. */
export function normalisePath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function scrollToHash(hash: string): void {
  const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
  target?.scrollIntoView()
}

export function RouterProvider({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [pathname, setPathname] = useState(() => normalisePath(initialPath))

  const push = useCallback((href: string) => {
    const target = new URL(href, window.location.href)
    if (target.origin !== window.location.origin) {
      window.location.assign(target.href)
      return
    }
    window.history.pushState(null, '', target.pathname + target.search + target.hash)
    setPathname(normalisePath(target.pathname))
    if (target.hash) requestAnimationFrame(() => scrollToHash(target.hash))
  }, [])

  useEffect(() => {
    const onPop = () => setPathname(normalisePath(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const value = useMemo(() => ({ pathname, push }), [pathname, push])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouterContext(): RouterValue {
  const value = useContext(RouterContext)
  if (!value) throw new Error('v2 components must render inside <RouterProvider>.')
  return value
}
