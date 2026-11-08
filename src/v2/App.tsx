'use client'

/**
 * The v2 site as one React tree: the body of the Next app's root layout
 * (website-v2/src/app/layout.tsx) with the route outlet swapped for
 * `resolveRoute`. Rendered by src/layouts/V2Layout.astro as a single island.
 */
import { useEffect } from 'react'
import { BackgroundCanvas } from '@v2/components/canvas/BackgroundCanvas'
import { CookieBanner } from '@v2/components/layout/CookieBanner'
import { Footer } from '@v2/components/layout/Footer'
import { Header } from '@v2/components/layout/Header'
import { InitialLoader } from '@v2/components/layout/InitialLoader'
import { PageHeader, SceneSync } from '@v2/components/layout/SiteChrome'
import { TransitionProvider } from '@v2/components/layout/TransitionProvider'
import { RouterProvider, normalisePath, useRouterContext } from '@v2/router'
import { resolveRoute } from '@v2/routes'

function RouteOutlet() {
  const { pathname } = useRouterContext()
  const route = resolveRoute(pathname)

  useEffect(() => {
    document.title = route.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', route.description)
  }, [route.title, route.description])

  return route.element
}

export default function App({ path }: { path: string }) {
  return (
    <RouterProvider initialPath={normalisePath(path)}>
      <InitialLoader />
      <BackgroundCanvas />
      <TransitionProvider>
        <SceneSync />
        <div className="relative overflow-x-clip">
          <div data-hero-hold-hide="">
            <Header scheme="dark" fixed />
          </div>
          <main>
            <PageHeader />
            <div className="transition-fade">
              <div className="transition-blur">
                <RouteOutlet />
              </div>
            </div>
          </main>
          <Footer />
        </div>
        <CookieBanner />
      </TransitionProvider>
    </RouterProvider>
  )
}
