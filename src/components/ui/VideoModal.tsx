/**
 * Video lightbox built on the native <dialog> element.
 *
 * Using <dialog> with showModal() rather than a hand-rolled overlay gets focus
 * trapping, Escape-to-close, inert background content, and the top-layer stacking
 * from the platform instead of from our own event handlers.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

interface VideoModalProps {
  videoUrl: string
  label: string
  onDark?: boolean
}

export default function VideoModal({ videoUrl, label, onDark = false }: VideoModalProps) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      void videoRef.current?.play().catch(() => undefined)
    }
  }, [open])

  /**
   * Backdrop dismissal, attached natively rather than through JSX.
   * A click whose target is the dialog itself landed on the ::backdrop, since
   * all content sits inside a child element. Escape and the Close button are
   * the keyboard equivalents, so this is a pointer-only convenience.
   */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const onPointerClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close()
    }

    dialog.addEventListener('click', onPointerClick)
    return () => dialog.removeEventListener('click', onPointerClick)
  }, [])

  /** Fires for Escape and for close(), so both paths restore state together. */
  const onClose = () => {
    setOpen(false)
    videoRef.current?.pause()
    triggerRef.current?.focus()
  }

  const triggerTone = onDark
    ? 'border-white/30 text-white hover:bg-white/10'
    : 'border-border hover:bg-muted'

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`wh-tap inline-flex items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-150 ${triggerTone}`}
      >
        <svg aria-hidden="true" viewBox="0 0 12 14" className="size-3 fill-current">
          <path d="M12 7 0 14V0z" />
        </svg>
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-label={label}
        onClose={onClose}
        className="w-full max-w-4xl bg-transparent p-0 backdrop:bg-black/80"
      >
        <div className="relative">
          <button
            type="button"
            onClick={close}
            className="wh-tap mb-3 ml-auto flex items-center rounded-full bg-white/10 px-4 text-sm text-white hover:bg-white/20"
          >
            Close
          </button>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- captions ship with the real asset; none exists yet */}
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            className="aspect-video w-full rounded-lg bg-black"
          />
        </div>
      </dialog>
    </>
  )
}
