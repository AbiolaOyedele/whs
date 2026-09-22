/**
 * A designed modal for forms. The sibling of ConfirmDialog.
 *
 * ConfirmDialog answers a yes/no question and owns its own buttons. This holds
 * arbitrary content — a form, usually — and leaves the actions to the caller.
 * They are not merged because their contracts differ in the one way that
 * matters to assistive tech: a confirmation is `alertdialog`, which interrupts,
 * and a form is `dialog`, which does not. A single component taking a role prop
 * would be one component pretending to be two.
 *
 * Everything a native `<dialog>` would give free is reimplemented, because
 * `showModal()` cannot be styled to the house tokens on every browser we care
 * about: Escape closes, focus enters on open and returns to the opener on
 * close, focus is trapped while open, the page behind cannot scroll, and the
 * backdrop dismisses on click.
 *
 * Mobile-first: full width and bottom-anchored on a phone, where a centred
 * dialog puts its controls under the thumb's reach, and centred from `sm`.
 */
import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  /** Optional sentence under the title. */
  description?: string | undefined
  children: ReactNode
  /** Rendered in the footer. The caller owns its own submit and cancel. */
  footer?: ReactNode | undefined
  onClose: () => void
}

export function Modal({ open, title, description, children, footer, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const id = useId()

  useEffect(() => {
    if (open) openerRef.current = document.activeElement as HTMLElement | null
  }, [open])

  useEffect(() => {
    if (!open) {
      openerRef.current?.focus?.()
      return
    }

    /*
     * The first *field*, not merely the first focusable thing.
     *
     * The close button sits in the header and therefore comes first in the DOM,
     * so a naive "focus element zero" lands on ×. A form dialog exists to be
     * typed into: opening it with the dismiss control focused invites closing
     * the thing you just opened, and makes every keyboard user Tab past it.
     *
     * Falls back to the first focusable and then to the panel, so a dialog with
     * no inputs still takes focus rather than leaving it on the page beneath
     * the backdrop.
     */
    const field = panelRef.current?.querySelector<HTMLElement>('input, textarea, select')
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'
    )
    ;(field ?? focusable ?? panelRef.current)?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      // Without the trap, Tab walks into the page behind the backdrop, where
      // every control is still reachable and clickable.
      const items = panelRef.current?.querySelectorAll<HTMLElement>(
        'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'
      )
      if (!items || items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  const onBackdrop = useCallback(() => onClose(), [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        onClick={onBackdrop}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
      />

      {/*
        `max-h` with an inner scroll rather than letting the dialog grow: a
        seven-field form on a 375×667 phone is taller than the viewport, and a
        dialog that overflows the screen puts its Save button somewhere the user
        cannot reach.
      */}
      {/*
        `text-foreground` on the panel itself is defensive: this modal opens
        from anywhere in the app, including the sidebar rail which sets a
        light text colour on its subtree. CSS colour inherits through the DOM
        (position:fixed doesn't reset it), so without this override an
        untyped input in the modal renders white text on the white `bg-card`
        — invisible. Every input inside the panel now has a legible default,
        no per-field colour needed.
      */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        className="relative flex max-h-[92svh] w-full max-w-2xl flex-col rounded-t-3xl border border-border bg-card text-foreground sm:max-h-[85svh] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5 md:p-6">
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="font-display text-xl leading-tight">
              {title}
            </h2>
            {description && (
              <p id={`${id}-description`} className="mt-1 text-base text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="wh-tap -m-2 flex shrink-0 items-center justify-center rounded-full px-3 text-2xl leading-none text-muted-foreground transition-colors hover:text-foreground"
          >
            &times;
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-6">{children}</div>

        {footer && <div className="border-t border-border p-5 md:p-6">{footer}</div>}
      </div>
    </div>
  )
}
