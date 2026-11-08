/**
 * Stand-in for 'next/navigation', aliased in astro.config.mjs and
 * tsconfig.json so the clone's components import it unchanged.
 */
import { useRouterContext } from '@v2/router'

export function usePathname(): string {
  return useRouterContext().pathname
}

export function useRouter(): { push: (href: string) => void } {
  const { push } = useRouterContext()
  return { push }
}

/** Route resolution in routes.tsx handles missing pages; this only guards misuse. */
export function notFound(): never {
  throw new Error('notFound() is not supported in the v2 router; resolve the route in routes.tsx.')
}
