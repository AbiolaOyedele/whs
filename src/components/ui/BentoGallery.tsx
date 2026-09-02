/**
 * Bento gallery for quote media.
 *
 * Adapted rather than dropped in, because the reference implementation had
 * three things that do not survive contact with this project:
 *
 *  1. It was a horizontal drag carousel (`grid-flow-col`), not a bento grid.
 *     The span classes only tile when the grid flows in rows, so they did
 *     nothing. This flows in rows and the spans are derived from each image's
 *     real aspect ratio, so a wide dashboard takes two columns and a phone
 *     mockup takes two rows.
 *  2. Captions appeared on hover only. This is a document clients read on
 *     phones, where there is no hover, so the caption would simply never
 *     exist. Captions are always visible.
 *  3. Its lightbox had no Escape key, no focus trap and no focus return.
 *
 * `lucide-react` is not installed and is not worth adding for one glyph, so
 * the close icon is inline SVG. `framer-motion` was already a dependency.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface GalleryItem {
  id: string
  url: string
  caption: string
  width: number | null
  height: number | null
}

interface Props {
  items: GalleryItem[]
  /** Heading rendered above the grid. */
  title?: string
}

const VIDEO = /\.(mp4|webm|mov)($|\?)/i

/**
 * Bento span from the image's own proportions.
 *
 * Derived, not hand-assigned: quote images are uploaded by an operator in any
 * order, so a fixed pattern would put a panoramic screenshot in a tall cell as
 * often as not.
 */
function spanFor(item: GalleryItem, index: number): string {
  const ratio = item.width && item.height ? item.width / item.height : 4 / 3

  if (ratio >= 2) return 'sm:col-span-2' // panoramic
  if (ratio <= 0.75) return 'sm:row-span-2' // portrait, phone mockups
  // Give the first item presence when it is roughly landscape.
  if (index === 0 && ratio > 1.2) return 'sm:col-span-2'
  return ''
}

function Media({ item, className }: { item: GalleryItem; className: string }) {
  if (VIDEO.test(item.url)) {
    return (
      <video
        src={item.url}
        className={className}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={item.caption || 'Project video'}
      />
    )
  }
  return (
    <img
      src={item.url}
      alt={item.caption || 'Project reference'}
      width={item.width ?? undefined}
      height={item.height ?? undefined}
      loading="lazy"
      className={className}
    />
  )
}

export default function BentoGallery({ items, title }: Props) {
  const [open, setOpen] = useState<GalleryItem | null>(null)
  const reduced = useReducedMotion()
  const openerRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(null), [])

  useEffect(() => {
    if (!open) {
      openerRef.current?.focus?.()
      return
    }

    openerRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        return
      }
      if (event.key !== 'Tab') return

      // Trap: without it, tab walks into the document behind the overlay.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button, [href]')
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, close])

  if (items.length === 0) return null

  return (
    <section>
      {title && <h2 className="mb-5 font-display text-2xl">{title}</h2>}

      <ul className="grid auto-rows-[11rem] grid-cols-1 gap-3 sm:auto-rows-[13rem] sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            className={cn('group relative', spanFor(item, index))}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            {...(reduced ? {} : { whileInView: { opacity: 1, y: 0 } })}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
          >
            <button
              type="button"
              onClick={() => setOpen(item)}
              aria-label={item.caption ? `View: ${item.caption}` : 'View image'}
              className="relative flex size-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted p-2 text-left transition-colors hover:border-foreground focus-visible:border-foreground"
            >
              <Media
                item={item}
                className="max-h-full max-w-full rounded-xl object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              />

              {item.caption && (
                /* Always visible, never hover-only: most clients open this on a
                   phone, where a hover caption does not exist at all. */
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-dark/85 to-transparent px-3 pt-8 pb-2.5 text-sm leading-snug text-white">
                  {item.caption}
                </span>
              )}
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute inset-0 cursor-default bg-surface-dark/85 backdrop-blur-sm"
            />

            <motion.div
              ref={panelRef}
              initial={reduced ? false : { scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              {...(reduced ? {} : { exit: { scale: 0.96, y: 12 } })}
              role="dialog"
              aria-modal="true"
              aria-label={open.caption || 'Project image'}
              className="relative flex max-h-full w-full max-w-5xl flex-col gap-3"
            >
              <Media
                item={open}
                className="max-h-[78svh] w-full rounded-2xl bg-muted object-contain"
              />
              {open.caption && <p className="text-base text-white/80">{open.caption}</p>}

              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close image"
                className="absolute -top-1 right-0 flex size-11 -translate-y-full items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
