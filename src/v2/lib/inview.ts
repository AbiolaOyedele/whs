type InviewCallback = (entry: IntersectionObserverEntry, isIntersecting: boolean) => void

interface InviewOptions {
  rootMargin?: string
  /** Report at these visible ratios too, not just on enter and leave. */
  threshold?: number[]
}

const observers = new Map<string, IntersectionObserver>()
const callbacks = new Map<Element, { key: string; callback: InviewCallback }>()

function keyFor(rootMargin: string, threshold: number[]): string {
  return `${rootMargin}|${threshold.join(',')}`
}

function observerFor(rootMargin: string, threshold: number[]): IntersectionObserver {
  const key = keyFor(rootMargin, threshold)
  const existing = observers.get(key)
  if (existing) return existing
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) callbacks.get(entry.target)?.callback(entry, entry.isIntersecting)
    },
    { rootMargin, threshold },
  )
  observers.set(key, observer)
  return observer
}

/**
 * One shared IntersectionObserver per root margin and threshold set, for
 * components that need on/off-screen state. The third argument may be a root
 * margin string or an options object.
 */
export function observeInview(
  element: Element,
  callback: InviewCallback,
  options: string | InviewOptions = {},
): () => void {
  if (callbacks.has(element)) return () => unobserveInview(element)
  const { rootMargin = '0px', threshold = [0] } = typeof options === 'string' ? { rootMargin: options } : options
  const key = keyFor(rootMargin, threshold)
  callbacks.set(element, { key, callback })
  observerFor(rootMargin, threshold).observe(element)
  return () => unobserveInview(element)
}

export function unobserveInview(element: Element): void {
  const entry = callbacks.get(element)
  if (!entry) return
  observers.get(entry.key)?.unobserve(element)
  callbacks.delete(element)
}
