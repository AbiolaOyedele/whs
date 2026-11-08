'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { pageScheme } from '@v2/config/site'
import { Header } from '@v2/components/layout/Header'

const SCENES: Record<string, string> = {
  '/use-cases/fashion': 'fashion',
  '/use-cases/beauty': 'beauty',
  '/use-cases/home-and-living': 'home-and-living',
}

/** Keeps <html data-scene> in step with the route so the background can switch scenes. */
export function SceneSync() {
  const pathname = usePathname()
  useEffect(() => {
    document.documentElement.dataset.scene = SCENES[pathname] ?? 'home'
    document.documentElement.dataset.template = pathname === '/about' ? 'about' : 'default'
  }, [pathname])
  return null
}

/** The header that sits in the page, in the page's own colour scheme. */
export function PageHeader() {
  const pathname = usePathname()
  return (
    <div data-hero-hold-hide="">
      <Header scheme={pageScheme(pathname)} />
    </div>
  )
}
