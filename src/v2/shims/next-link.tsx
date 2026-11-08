/**
 * Stand-in for 'next/link', aliased in astro.config.mjs and tsconfig.json.
 * A plain anchor that routes internal clicks through the v2 router. The
 * clone's SmartLink already intercepts clicks to run the page fade, so this
 * only acts when nothing upstream has handled the click.
 */
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react'
import { useRouterContext } from '@v2/router'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, onClick, children, ...rest }, ref) {
  const { push } = useRouterContext()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!href.startsWith('/') || href.startsWith('//')) return
    event.preventDefault()
    push(href)
  }

  return (
    <a ref={ref} href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
})

export default Link
