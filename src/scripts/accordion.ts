/**
 * Height-animates every `<details class="wh-faq">` on the page.
 *
 * This lived inside FAQAccordion.astro, alongside Astro-scoped styles. Astro
 * only ships a component's styles and scripts on pages that render it, and
 * scoped styles carry a component hash — so /services, which copies the
 * `.wh-faq` markup rather than using the component, got neither. Its accordions
 * snapped open natively while the identical-looking ones on /enterprise eased.
 *
 * Loaded once from BaseLayout. It is a no-op on pages with no accordions.
 *
 * Progressive enhancement only: with JS off, `<details>` toggles instantly.
 */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)')

document.querySelectorAll<HTMLDetailsElement>('.wh-faq').forEach((details) => {
  const panel = details.querySelector<HTMLElement>('.wh-faq__panel')
  if (!panel) return
  const summary = details.querySelector('summary')
  if (!summary) return

  let animating = false

  const setHeight = () => {
    details.style.setProperty('--accordion-content-height', `${panel.scrollHeight}px`)
  }

  const finish = () => {
    details.removeAttribute('data-animating')
    animating = false
  }

  summary.addEventListener('click', (event) => {
    if (REDUCED.matches) return
    event.preventDefault()
    if (animating) return

    animating = true
    setHeight()

    if (details.open) {
      details.setAttribute('data-animating', 'close')
      panel.addEventListener(
        'animationend',
        () => {
          details.open = false
          finish()
        },
        { once: true }
      )
    } else {
      details.open = true
      setHeight()
      details.setAttribute('data-animating', 'open')
      panel.addEventListener('animationend', finish, { once: true })
    }
  })
})
