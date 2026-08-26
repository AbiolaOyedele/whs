/**
 * Floating navigation pill.
 *
 * Collapses to a circle when the visitor scrolls down and springs back open
 * when they scroll up, using Framer Motion's spring physics. Adapted from the
 * supplied component in three ways:
 *
 *  1. It keeps the mega menus. Work / Services / Stack open a panel on hover
 *     and focus; the supplied version had plain links only.
 *  2. The `"use client"` directive is dropped — this is Astro, where the
 *     island boundary is set by the `client:*` directive at the call site.
 *  3. Menu data arrives as a prop so Astro can read the content collections at
 *     build time. The links are therefore present in the served HTML, which
 *     matters: internal linking is a ranking signal and AI crawlers generally
 *     do not execute JS.
 */
import * as React from 'react'
import {
  LazyMotion,
  domAnimation,
  m,
  useMotionValueEvent,
  useScroll,
  type Variants,
} from 'framer-motion'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

export interface NavMenuColumn {
  label: string
  links: ReadonlyArray<{ label: string; href: string }>
  allLink?: { label: string; href: string } | undefined
}

export interface NavMenuFeature {
  label: string
  body: string
  href: string
  ctaLabel: string
}

export interface NavMenu {
  id: string
  label: string
  columns: readonly NavMenuColumn[]
  feature?: NavMenuFeature | undefined
}

export interface AnimatedNavProps {
  menus: readonly NavMenu[]
  plainLinks: ReadonlyArray<{ label: string; href: string }>
  ctaLabel: string
  ctaHref: string
  siteName: string
}

/** Scroll-up distance, in px, required to spring the pill back open. */
const EXPAND_SCROLL_THRESHOLD = 80
/** Scroll depth below which the pill never collapses. */
const COLLAPSE_AFTER = 150

const containerVariants: Variants = {
  expanded: {
    width: 'auto',
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      staggerChildren: 0.07,
      delayChildren: 0.12,
    },
  },
  collapsed: {
    // Wide enough for the "whs." mark plus even padding. The mark is 2.6:1, so
    // a circle would crop it — the pill collapses to a short capsule instead.
    width: '7.5rem',
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

const itemVariants: Variants = {
  expanded: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', damping: 15 } },
  collapsed: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } },
}

const logoVariants: Variants = {
  expanded: { opacity: 1, x: 0, transition: { type: 'spring', damping: 15 } },
  collapsed: { opacity: 0, x: -25, transition: { duration: 0.3 } },
}

export function AnimatedNav({ menus, plainLinks, ctaLabel, ctaHref, siteName }: AnimatedNavProps) {
  const [isExpanded, setExpanded] = React.useState(true)
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [reducedMotion, setReducedMotion] = React.useState(false)

  const { scrollY } = useScroll()
  const lastScrollY = React.useRef(0)
  /**
   * Deepest scroll position reached since the pill collapsed — i.e. where the
   * user turned around. The supplied component tracked the position at which
   * the pill *collapsed* instead, which meant that after collapsing at 600px
   * and reading down to 3000px, scrolling back up never re-expanded the nav
   * until you passed above 520px again. Measuring from the turnaround point is
   * what makes "scroll up a little to get the nav back" actually work.
   */
  const deepestSinceCollapse = React.useRef(0)
  const closeTimer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = lastScrollY.current

    if (isExpanded && latest > previous && latest > COLLAPSE_AFTER) {
      setExpanded(false)
      setOpenMenu(null)
      deepestSinceCollapse.current = latest
    } else if (!isExpanded) {
      // Track how far down they got before turning around.
      if (latest > deepestSinceCollapse.current) deepestSinceCollapse.current = latest

      if (latest < previous && deepestSinceCollapse.current - latest > EXPAND_SCROLL_THRESHOLD) {
        setExpanded(true)
      }
    }

    // Always show the full nav at the very top of the page.
    if (!isExpanded && latest <= COLLAPSE_AFTER) setExpanded(true)

    lastScrollY.current = latest
  })

  /** Clicking the collapsed pill springs it open instead of following a link. */
  const onPillClick = (event: React.MouseEvent) => {
    if (!isExpanded) {
      event.preventDefault()
      setExpanded(true)
    }
  }

  const openWithHover = (id: string) => {
    if (!isExpanded) return
    window.clearTimeout(closeTimer.current)
    setOpenMenu(id)
  }

  const closeWithDelay = () => {
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 120)
  }

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const state = isExpanded ? 'expanded' : 'collapsed'

  /**
   * Omits `variants` entirely under reduced motion. Passing `undefined` is not
   * allowed by `exactOptionalPropertyTypes`, and omitting it also stops Framer
   * running the animation at all rather than merely shortening it.
   */
  const withVariants = (variants: Variants) => (reducedMotion ? {} : { variants })

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
        <m.nav
          aria-label="Primary"
          initial={false}
          animate={state}
          {...withVariants(containerVariants)}
          {...(!isExpanded ? { whileHover: { scale: 1.06 }, whileTap: { scale: 0.95 } } : {})}
          onClick={onPillClick}
          onMouseLeave={closeWithDelay}
          className={cn(
            'relative flex h-16 items-center rounded-full border border-white/15 bg-[color-mix(in_oklab,var(--primary)_70%,transparent)] shadow-lg backdrop-blur-md',
            isExpanded ? 'overflow-visible' : 'cursor-pointer justify-center overflow-hidden'
          )}
        >
          <m.a
            href="/"
            {...withVariants(logoVariants)}
            aria-label={`${siteName} — home`}
            onClick={(event) => event.stopPropagation()}
            className="flex min-h-12 shrink-0 items-center gap-2 pr-3 pl-5 text-white"
          >
            <Logo variant="full" className="h-11 w-auto" label="" />
          </m.a>

          <m.div
            className={cn('flex items-center gap-0.5 pr-2', !isExpanded && 'pointer-events-none')}
          >
            {menus.map((menu) => (
              <m.div
                key={menu.id}
                {...withVariants(itemVariants)}
                className="relative"
                onMouseEnter={() => openWithHover(menu.id)}
                onFocus={() => openWithHover(menu.id)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                    setOpenMenu(null)
                  }
                }}
              >
                <button
                  type="button"
                  aria-expanded={openMenu === menu.id}
                  aria-controls={menu.id}
                  onClick={(event) => {
                    event.stopPropagation()
                    setOpenMenu(openMenu === menu.id ? null : menu.id)
                  }}
                  className={cn(
                    'inline-flex min-h-12 items-center rounded-full px-4 text-base whitespace-nowrap',
                    'text-white transition-colors',
                    openMenu === menu.id ? 'bg-white/15' : 'hover:bg-white/10'
                  )}
                >
                  {menu.label}
                </button>

                <MegaPanel menu={menu} open={openMenu === menu.id} reducedMotion={reducedMotion} />
              </m.div>
            ))}

            {plainLinks.map((link) => (
              <m.a
                key={link.href}
                href={link.href}
                {...withVariants(itemVariants)}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex min-h-12 items-center rounded-full px-4 text-base whitespace-nowrap text-white transition-colors hover:bg-white/10"
              >
                {link.label}
              </m.a>
            ))}

            <m.a
              href={ctaHref}
              {...withVariants(itemVariants)}
              onClick={(event) => event.stopPropagation()}
              className="ml-1 inline-flex h-12 items-center rounded-full bg-accent px-5 text-base font-medium whitespace-nowrap text-accent-foreground transition-transform hover:scale-[1.02]"
            >
              {ctaLabel}
            </m.a>
          </m.div>

          {/*
            The "whs." mark, cross-faded in as the pill collapses down to it.
            Animated with direct target values rather than variants: an explicit
            `animate` on a child overrides the variant propagating down from the
            parent nav, which left the glyph stranded at ~0.7 opacity and showing
            through the links. Direct values sidestep propagation entirely.
          */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <m.div
              initial={false}
              animate={{ opacity: isExpanded ? 0 : 1, scale: isExpanded ? 0.8 : 1 }}
              transition={
                isExpanded
                  ? { duration: 0.2 }
                  : { type: 'spring', damping: 15, stiffness: 300, delay: 0.15 }
              }
            >
              <Logo variant="mark" className="h-6 w-auto text-white" label="" />
            </m.div>
          </div>
        </m.nav>
      </div>
    </LazyMotion>
  )
}

interface MegaPanelProps {
  menu: NavMenu
  open: boolean
  reducedMotion: boolean
}

/**
 * The dropdown panel. Rendered in the DOM at all times — only visibility is
 * toggled — so its links stay in the served HTML for crawlers.
 */
function MegaPanel({ menu, open, reducedMotion }: MegaPanelProps) {
  return (
    <div
      id={menu.id}
      hidden={!open}
      className={cn(
        'absolute top-full left-1/2 mt-3 -translate-x-1/2 rounded-[1.25rem] text-white',
        'bg-[color-mix(in_oklab,var(--primary)_48%,transparent)] backdrop-blur-[24px]',
        reducedMotion
          ? ''
          : 'transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.96] opacity-0'
      )}
    >
      <div className="grid w-[47.75rem] max-w-[calc(100vw-3rem)] grid-cols-[repeat(4,9.4375rem)] items-stretch gap-x-8 gap-y-6 px-8 py-5">
        {menu.columns.map((column) => (
          <div key={column.label} className="flex min-h-[15.75rem] flex-col gap-4">
            <p className="text-xs leading-normal text-white/65">({column.label})</p>

            <div className="flex flex-col gap-3">
              {column.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center rounded-lg px-2 text-xl leading-8 text-white transition-colors hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {column.allLink && (
              <a
                href={column.allLink.href}
                className="mt-auto inline-flex min-h-11 w-fit items-center text-base leading-8 text-white underline underline-offset-2"
              >
                {column.allLink.label}
              </a>
            )}
          </div>
        ))}

        {menu.feature && (
          <a
            href={menu.feature.href}
            className="group col-span-4 flex gap-4 rounded-xl bg-white p-3 text-[#131314] transition-colors hover:bg-white/95"
          >
            {/* 159x128 image box, per the reference. TODO: real artwork. */}
            <span
              aria-hidden="true"
              className="hidden h-32 w-[159px] shrink-0 overflow-hidden rounded-[4px] bg-[#f3f3f4] sm:block"
            >
              <span
                className="block size-full transition-transform duration-300 group-hover:scale-[1.03]"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in oklab, var(--accent) 45%, white) 0%, color-mix(in oklab, var(--accent) 20%, white) 45%, #e8e8ea 100%)',
                }}
              />
            </span>

            <span className="flex min-w-0 flex-col items-start py-1 text-left">
              <span className="text-xs leading-normal text-[#66646d]">({menu.feature.label})</span>
              <span className="mt-2 max-w-[21rem] text-base leading-normal font-medium">
                {menu.feature.body}
              </span>
              <span className="mt-auto text-base leading-8 font-medium underline underline-offset-2">
                {menu.feature.ctaLabel}
              </span>
            </span>
          </a>
        )}
      </div>
    </div>
  )
}

export default AnimatedNav
