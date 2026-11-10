'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { site, type Scheme } from '@v2/config/site'
import { MAIN_NAV, MORE_NAV, USE_CASES, type NavLink } from '@v2/content/navigation'
import { getGsap } from '@v2/lib/gsap'
import { Button } from '@v2/components/ui/Button'
import { DropdownArrow, Icon, MenuIcon } from '@v2/components/ui/Icon'
import { LogoMark } from '@v2/components/ui/LogoMark'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { PAGE_LEAVE_EVENT } from '@v2/components/layout/TransitionProvider'

const MOBILE_OPEN = 'has-menu-mobile-open'
const MOBILE_OPEN_FROM_FIXED = 'has-menu-mobile-open-from-fixed'
const DROPDOWN_OPEN = 'has-menu-dropdown-open'

interface HeaderProps {
  scheme: Scheme
  /** The copy that slides down from the top when scrolling up. */
  fixed?: boolean
}

type DropdownId = 'use-cases' | 'more'

function isCurrent(pathname: string, href: string): boolean {
  return href === pathname || (href !== '/' && pathname.startsWith(`${href}/`))
}

function DropdownRow({ link, current }: { link: NavLink; current: boolean }) {
  return (
    <li className="c-header_nav_dropdown_item">
      <SmartLink
        href={link.href}
        className={`c-header_nav_dropdown_link ${current ? 'is-current-page' : ''}`}
        data-menu-dropdown-link=""
      >
        <span className="c-header_nav_dropdown_link_icon">
          {link.icon ? <Icon name={link.icon} className="relative z-2 size-6" /> : null}
        </span>
        <span className="c-header_nav_dropdown_link_label">
          {link.label}
          <DropdownArrow className="c-header_nav_dropdown_link_arrow" />
        </span>
      </SmartLink>
    </li>
  )
}

function NavTextLink({ link, current }: { link: NavLink; current: boolean }) {
  return (
    <li className="c-header_nav_item">
      <SmartLink
        href={link.href}
        className={`c-header_nav_link ${current ? 'is-current-page' : ''}`}
      >
        <span className="c-header_nav_link_label c-header_nav_hoverbg">{link.label}</span>
      </SmartLink>
    </li>
  )
}

/**
 * Whether the page behind a point is dark: the first opaque background under
 * it, skipping the header itself. Nothing opaque means the dark 3D background.
 */
function isDarkBehind(x: number, y: number, header: HTMLElement): boolean {
  for (const el of document.elementsFromPoint(x, y)) {
    if (header.contains(el)) continue
    const match = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)
    if (!match) continue
    const [r = 0, g = 0, b = 0, a = 1] = match.map(Number)
    if (a < 0.5) continue
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128
  }
  return true
}

/**
 * The site header. Desktop: a pill of nav links whose dropdowns open on hover,
 * then sign-in and sign-up. Phone: a Menu button that opens a white panel with
 * the same links. Open state lives on <html> so both header copies agree.
 */
export function Header({ scheme, fixed = false }: HeaderProps) {
  const pathname = usePathname()
  const root = useRef<HTMLElement>(null)
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState(false)
  const accordionContent = useRef<HTMLDivElement>(null)

  const closeDropdowns = useCallback(() => {
    setOpenDropdown(null)
    document.documentElement.classList.remove(DROPDOWN_OPEN)
  }, [])

  const openDropdownFor = useCallback((id: DropdownId) => {
    setOpenDropdown(id)
    document.documentElement.classList.add(DROPDOWN_OPEN)
  }, [])

  const setAccordion = useCallback((open: boolean) => {
    const content = accordionContent.current
    if (!content) return
    const gsap = getGsap()
    gsap.killTweensOf(content)
    if (open) {
      gsap.fromTo(
        content,
        { height: 0, autoAlpha: 0 },
        { height: 'auto', autoAlpha: 1, duration: 0.4, ease: 'power4.inOut' }
      )
    } else {
      gsap.to(content, { height: 0, autoAlpha: 0, duration: 0.3, ease: 'power4.inOut' })
    }
    setAccordionOpen(open)
  }, [])

  const closeMobile = useCallback(() => {
    document.documentElement.classList.remove(MOBILE_OPEN, MOBILE_OPEN_FROM_FIXED)
    setMobileOpen(false)
    if (accordionOpen) setAccordion(false)
  }, [accordionOpen, setAccordion])

  const openMobile = useCallback(() => {
    const classes = document.documentElement.classList
    classes.add(MOBILE_OPEN)
    if (fixed) classes.add(MOBILE_OPEN_FROM_FIXED)
    setMobileOpen(true)
  }, [fixed])

  useEffect(() => {
    const onLeave = () => {
      closeMobile()
      closeDropdowns()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDropdowns()
    }
    const onClickOutside = (event: MouseEvent) => {
      const nav = root.current?.querySelector('[data-menu-desktop-nav]')
      if (nav && event.target instanceof Node && !nav.contains(event.target)) closeDropdowns()
    }
    window.addEventListener(PAGE_LEAVE_EVENT, onLeave)
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClickOutside)
    return () => {
      window.removeEventListener(PAGE_LEAVE_EVENT, onLeave)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClickOutside)
    }
  }, [closeMobile, closeDropdowns])

  // The fixed header floats over every section: the logo turns white over dark ones.
  useEffect(() => {
    const header = root.current
    const logo = header?.querySelector<HTMLElement>('.c-header_logo')
    if (!fixed || !header || !logo) return
    let frame = 0
    const check = () => {
      frame = 0
      const box = logo.getBoundingClientRect()
      header.classList.toggle(
        'is-over-dark',
        isDarkBehind(box.left + box.width / 2, box.top + box.height / 2, header)
      )
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [fixed, pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (!target) return
      if (target.closest('[data-menu-mobile-toggle]') || target.closest('[data-menu-mobile-inner]'))
        return
      closeMobile()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [mobileOpen, closeMobile])

  const onNavBlur = useCallback(() => {
    window.setTimeout(() => {
      const nav = root.current?.querySelector('[data-menu-desktop-nav]')
      if (!nav?.contains(document.activeElement)) closeDropdowns()
    }, 0)
  }, [closeDropdowns])

  const dropdownProps = (id: DropdownId) => ({
    className: `c-header_nav_item ${openDropdown === id ? 'is-dropdown-open' : ''}`,
    onMouseEnter: () => openDropdownFor(id),
    onMouseLeave: closeDropdowns,
    onBlur: onNavBlur,
  })

  const triggerKey = (id: DropdownId) => (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    if (openDropdown === id) closeDropdowns()
    else openDropdownFor(id)
  }

  const toggle = () => (mobileOpen ? closeMobile() : openMobile())

  return (
    <div className={scheme}>
      <header ref={root} className={`c-header ${fixed ? 'is-fixed dark' : ''}`} data-menu-header="">
        <div className="c-header_container">
          <SmartLink href="/" className="c-header_logo" aria-label={`${site.name} home`}>
            <LogoMark />
          </SmartLink>

          <nav className="c-header_nav" aria-label="Main" data-menu-desktop-nav="">
            <ul className="c-header_nav_list">
              <li {...dropdownProps('use-cases')}>
                <button
                  type="button"
                  className="c-header_nav_link"
                  aria-expanded={openDropdown === 'use-cases'}
                  onKeyDown={triggerKey('use-cases')}
                >
                  <span className="c-header_nav_link_label c-header_nav_hoverbg">
                    Services
                    <span className="c-header_nav_link_label_dot" />
                  </span>
                </button>
                <div className="c-header_nav_dropdown">
                  <div className="c-header_nav_dropdown_inner">
                    <ul className="c-header_nav_dropdown_list">
                      {USE_CASES.map((link) => (
                        <DropdownRow
                          key={link.href}
                          link={link}
                          current={isCurrent(pathname, link.href)}
                        />
                      ))}
                    </ul>
                    <div className="c-header_nav_dropdown_button">
                      <Button
                        label="See our work"
                        variant="pink"
                        href="/resources"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </li>

              {MAIN_NAV.map((link) => (
                <NavTextLink key={link.href} link={link} current={isCurrent(pathname, link.href)} />
              ))}

              <li {...dropdownProps('more')}>
                <button
                  type="button"
                  className="c-header_nav_button"
                  aria-expanded={openDropdown === 'more'}
                  onKeyDown={triggerKey('more')}
                >
                  <span className="sr-only">Open menu</span>
                  <span className="c-header_nav_button_inner c-header_nav_hoverbg">
                    <span className="c-header_nav_button_icon">
                      <span className="c-header_nav_button_icon_line">
                        <span className="c-header_nav_button_dot" />
                        <span className="c-header_nav_button_dot" />
                      </span>
                      <span className="c-header_nav_button_icon_line">
                        <span className="c-header_nav_button_dot" />
                        <span className="c-header_nav_button_dot" />
                      </span>
                    </span>
                  </span>
                </button>
                <div className="c-header_nav_dropdown">
                  <div className="c-header_nav_dropdown_inner">
                    <ul className="c-header_nav_dropdown_list">
                      {MORE_NAV.map((link) => (
                        <DropdownRow
                          key={link.href}
                          link={link}
                          current={isCurrent(pathname, link.href)}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            </ul>

            <div className="c-header_nav_buttons">
              <Button
                label="Request a quote"
                variant="slate"
                href={site.signInUrl}
                className="max-md:hidden"
              />
              <Button
                label="Get in touch"
                variant="pink"
                href={site.signUpUrl}
                className="max-md:hidden"
              />
              <Button
                label="Get in touch"
                variant="pink"
                href={site.signUpUrl}
                className="max-[400px]:hidden md:hidden"
              />
              <MobileToggle
                variant="glass"
                className="slate:hidden"
                open={mobileOpen}
                onToggle={toggle}
              />
              <MobileToggle
                variant="light"
                className="dark:hidden"
                open={mobileOpen}
                onToggle={toggle}
              />
            </div>
          </nav>
        </div>

        <div className="c-header_mobile_menu slate" data-lenis-prevent="" aria-hidden={!mobileOpen}>
          <div className="c-header_mobile_menu_inner" data-menu-mobile-inner="">
            <div className="c-header_mobile_menu_scroll">
              <ul className="c-header_mobile_menu_list">
                <li className="c-header_mobile_menu_item">
                  <div
                    className={`c-header_mobile_menu_accordion ${accordionOpen ? 'is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="c-header_mobile_menu_summary"
                      aria-expanded={accordionOpen}
                      onClick={() => setAccordion(!accordionOpen)}
                    >
                      <span className="c-header_mobile_menu_link_label">Services</span>
                      <span className="c-header_mobile_menu_summary_button">
                        <span className="c-plus-icon" />
                      </span>
                    </button>
                    <div ref={accordionContent} className="c-header_mobile_menu_accordion_content">
                      <div className="py-2">
                        <ul className="flex flex-col gap-3 rounded-sm bg-white p-3">
                          {USE_CASES.map((link) => (
                            <li key={link.href}>
                              <SmartLink
                                href={link.href}
                                className={`c-header_mobile_menu_dropdown_link ${isCurrent(pathname, link.href) ? 'is-current-page' : ''}`}
                              >
                                <span className="c-header_mobile_menu_dropdown_link_icon">
                                  {link.icon ? (
                                    <Icon name={link.icon} className="relative z-2 size-6" />
                                  ) : null}
                                </span>
                                <span className="text-label">{link.label}</span>
                              </SmartLink>
                            </li>
                          ))}
                          <li className="pt-2">
                            <Button
                              label="See our work"
                              variant="pink"
                              href="/resources"
                              className="w-full"
                            />
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
                {[...MAIN_NAV, MORE_NAV[1]].map((link) =>
                  link ? (
                    <li key={link.href} className="c-header_mobile_menu_item">
                      <SmartLink
                        href={link.href}
                        className={`c-header_mobile_menu_link ${isCurrent(pathname, link.href) ? 'is-current-page' : ''}`}
                      >
                        <span className="c-header_mobile_menu_link_label">{link.label}</span>
                      </SmartLink>
                    </li>
                  ) : null
                )}
              </ul>
              <div className="c-header_mobile_menu_buttons">
                <Button
                  label="Request a quote"
                  variant="slate"
                  href={site.signInUrl}
                  className="w-full bg-white!"
                />
                <Button
                  label="See our work"
                  variant="light"
                  href="/resources"
                  className="w-full bg-white!"
                />
                <div className="col-span-2 min-[400px]:hidden">
                  <Button
                    label="Get in touch"
                    variant="pink"
                    href={site.signUpUrl}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="c-header_overlay" aria-hidden="true" />
      </header>
    </div>
  )
}

interface MobileToggleProps {
  variant: 'glass' | 'light'
  className: string
  open: boolean
  onToggle: () => void
}

function MobileToggle({ variant, className, open, onToggle }: MobileToggleProps) {
  const look =
    variant === 'glass'
      ? { base: 'bg-charcoal text-white ring-1 ring-white ring-inset', hover: 'bg-black' }
      : {
          base: 'bg-white slate:bg-white text-navy-900',
          hover: 'bg-pink-100',
        }
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      data-menu-mobile-toggle=""
      className={`button group c-header_mobile_menu_toggle relative isolate inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-sm px-3.5 md:hidden ${look.base} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 [transform:scale3d(0.9,0.7,1)] rounded-[inherit] opacity-0 transition-[transform,opacity] duration-200 ease-(--ease) group-hover:[transform:scale3d(1,1,1)] group-hover:opacity-100 ${look.hover}`}
      />
      <span className="text-label z-2 inline-block min-w-[42px] leading-none">
        {open ? 'Close' : 'Menu'}
      </span>
      <span className="pointer-events-none relative inline-flex size-5 items-center justify-center">
        <MenuIcon className="c-menu-icon" />
      </span>
    </button>
  )
}
