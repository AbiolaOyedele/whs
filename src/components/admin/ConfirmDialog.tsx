/**
 * Designed confirmation dialog. Replaces `window.confirm`.
 *
 * A native confirm is drawn by the browser chrome: it ignores every token on
 * the page, cannot say more than one line, and on some platforms offers a
 * "prevent this page from creating more dialogs" checkbox that silently
 * disables the guard afterwards. None of that is acceptable on a surface that
 * asks "are you sure?" before locking a client out of their quote.
 *
 * Behaviour a native dialog gives free, reimplemented here because it must be:
 * Escape closes, focus moves into the dialog on open and returns to whatever
 * opened it on close, focus is trapped while open, and the backdrop is inert to
 * scroll.
 */
import { useCallback, useEffect, useRef } from 'react'
import { Button } from './ui'

interface Props {
  open: boolean
  title: string
  body: string
  /** Label for the destructive action. */
  confirmLabel: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  // Remember what had focus, so it can be handed back on close.
  useEffect(() => {
    if (open) openerRef.current = document.activeElement as HTMLElement | null
  }, [open])

  useEffect(() => {
    if (!open) {
      openerRef.current?.focus?.()
      return
    }

    confirmRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }

      if (event.key !== 'Tab') return

      // Trap focus: without this, tabbing walks into the page behind the
      // backdrop, where every control is still clickable.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
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

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onCancel])

  const onBackdrop = useCallback(() => onCancel(), [onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-4 sm:items-center">
      {/*
        The backdrop is its own element and is aria-hidden: clicking it to
        dismiss is a mouse convenience, and the keyboard route is Escape, which
        the effect above handles. Assistive tech is told to ignore it rather
        than being offered a second, redundant way to close.
      */}
      <div
        aria-hidden="true"
        onClick={onBackdrop}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6"
      >
        <h2 id="confirm-title" className="mb-2 font-display text-xl">
          {title}
        </h2>
        <p id="confirm-body" className="mb-6 text-base text-muted-foreground">
          {body}
        </p>

        {/*
          Cancel first in the DOM on mobile so the thumb lands on it, not on the
          destructive action. Order is reversed visually from sm up.

          `whitespace-nowrap` on the row from sm: side by side in a 28rem
          dialog, a three or four word label wrapped to two lines and the
          buttons looked broken. Stacked full width below sm, so nothing is
          squeezed there.
        */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:[&>*]:whitespace-nowrap">
          <Button tone="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            tone={tone === 'danger' ? 'dangerSolid' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
