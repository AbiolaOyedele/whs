'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { site, type Scheme } from '@v2/config/site'
import { LIVE_SOCIALS, MAIN_NAV, MORE_NAV, USE_CASES, type NavLink } from '@v2/content/navigation'
import { getGsap } from '@v2/lib/gsap'
import { Button } from '@v2/components/ui/Button'
import { DropdownArrow, Icon, MenuIcon, SocialIcon } from '@v2/components/ui/Icon'
import { LogoMark } from '@v2/components/ui/LogoMark'
import { ScrambleText, type ScrambleHandle } from '@v2/components/ui/ScrambleText'
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
  const scramble = useRef<ScrambleHandle>(null)
  return (
    <li className="c-header_nav_item">
      <SmartLink
        href={link.href}
        className={`c-header_nav_link ${current ? 'is-current-page' : ''}`}
        onMouseEnter={() => scramble.current?.scramble()}
        onMouseLeave={() => scramble.current?.reset()}
      >
        <span className="c-header_nav_link_label c-header_nav_hoverbg">
          <ScrambleText ref={scramble}>{link.label}</ScrambleText>
        </span>
      </SmartLink>
    </li>
  )
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
  const toggleLabels = useRef<(ScrambleHandle | null)[]>([])
  const triggerScramble = useRef<ScrambleHandle>(null)

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
        { height: 'auto', autoAlpha: 1, duration: 0.4, ease: 'power4.inOut' },
      )
    } else {
      gsap.to(content, { height: 0, autoAlpha: 0, duration: 0.3, ease: 'power4.inOut' })
    }
    setAccordionOpen(open)
  }, [])

  const closeMobile = useCallback(() => {
    document.documentElement.classList.remove(MOBILE_OPEN, MOBILE_OPEN_FROM_FIXED)
    setMobileOpen(false)
    toggleLabels.current.forEach((label) => label?.setText('Menu'))
    if (accordionOpen) setAccordion(false)
  }, [accordionOpen, setAccordion])

  const openMobile = useCallback(() => {
    const classes = document.documentElement.classList
    classes.add(MOBILE_OPEN)
    if (fixed) classes.add(MOBILE_OPEN_FROM_FIXED)
    setMobileOpen(true)
    toggleLabels.current.forEach((label) => label?.setText('Close'))
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
            <span className="c-header_logo_text">{site.name}</span>
          </SmartLink>

          <nav className="c-header_nav" aria-label="Main" data-menu-desktop-nav="">
            <ul className="c-header_nav_list">
              <li {...dropdownProps('use-cases')}>
                <button
                  type="button"
                  className="c-header_nav_link"
                  aria-expanded={openDropdown === 'use-cases'}
                  onKeyDown={triggerKey('use-cases')}
                  onMouseEnter={() => triggerScramble.current?.scramble()}
                  onMouseLeave={() => triggerScramble.current?.reset()}
                >
                  <span className="c-header_nav_link_label c-header_nav_hoverbg">
                    <ScrambleText ref={triggerScramble}>Shops</ScrambleText>
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
                        label="See live shops"
                        variant="pink"
                        href="/#live-shops"
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
                    {LIVE_SOCIALS.length > 0 ? (
                      <div className="c-header_nav_dropdown_social">
                        <ul className="flex gap-4">
                          {LIVE_SOCIALS.map((social) => (
                            <li key={social.label}>
                              <a
                                href={social.href}
                                className="inline-flex min-h-11 min-w-11 items-center justify-center"
                              >
                                <span className="sr-only">{social.label}</span>
                                <SocialIcon name={social.label} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            </ul>

            <div className="c-header_nav_buttons">
              <Button
                label="Sign in"
                variant="slate"
                href={site.signInUrl}
                className="max-md:hidden"
              />
              <Button
                label="Sign up"
                variant="pink"
                href={site.signUpUrl}
                className="max-md:hidden"
              />
              <Button
                label="Sign in"
                variant="pink"
                href={site.signInUrl}
                className="max-[400px]:hidden md:hidden"
              />
              <MobileToggle
                variant="glass"
                className="slate:hidden"
                open={mobileOpen}
                onToggle={toggle}
                labelRef={(handle) => (toggleLabels.current[0] = handle)}
              />
              <MobileToggle
                variant="light"
                className="dark:hidden"
                open={mobileOpen}
                onToggle={toggle}
                labelRef={(handle) => (toggleLabels.current[1] = handle)}
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
                      <span className="c-header_mobile_menu_link_label">Shops</span>
                      <span className="c-header_mobile_menu_summary_button">
                        <span className="c-plus-icon" />
                      </span>
                    </button>
                    <div ref={accordionContent} className="c-header_mobile_menu_accordion_content">
                      <div className="py-2">
                        <ul className="flex flex-col gap-3 rounded-sm bg-slate-50 p-3">
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
                              label="See live shops"
                              variant="pink"
                              href="/#live-shops"
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
                  ) : null,
                )}
              </ul>
              <div className="c-header_mobile_menu_buttons">
                <Button
                  label="Sign up"
                  variant="slate"
                  href={site.signUpUrl}
                  className="w-full bg-slate-50!"
                />
                <Button
                  label="Talk to us"
                  variant="light"
                  href="/book-demo"
                  className="w-full bg-slate-50!"
                />
                <div className="col-span-2 min-[400px]:hidden">
                  <Button label="Sign in" variant="pink" href={site.signInUrl} className="w-full" />
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
  labelRef: (handle: ScrambleHandle | null) => void
}

function MobileToggle({ variant, className, open, onToggle, labelRef }: MobileToggleProps) {
  const look =
    variant === 'glass'
      ? { base: 'bg-charcoal/35 backdrop-blur-lg text-white', hover: 'bg-charcoal/50' }
      : {
          base: 'bg-slate-50 slate:bg-white text-navy-900',
          hover: 'bg-slate-100 slate:bg-slate-300',
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
      <ScrambleText
        ref={labelRef}
        className="text-label z-2 inline-block min-w-[42px] leading-none"
      >
        Menu
      </ScrambleText>
      <span className="pointer-events-none relative inline-flex size-5 items-center justify-center">
        <MenuIcon className="c-menu-icon" />
      </span>
    </button>
  )
}
