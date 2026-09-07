/**
 * A small, focused dialog: paste a URL, get a site check.
 *
 * Deliberately a lightweight popup rather than a route change — the
 * reader is mid-article and does not need to lose their place to ask
 * for a check. Submits to /api/v1/site-check, which writes one row to
 * the admin request queue and fires the notification email.
 *
 * Uses the native <dialog> element with `showModal()` — it gets focus
 * trapping, backdrop, and Escape-to-close for free, without a portal or
 * a modal library. Fallback rendering (dialog unsupported, script
 * blocked) never appears: the trigger sits inside a client:load island,
 * so if the island did not hydrate, the trigger is not on the page.
 */
import { useRef, useState } from 'react'
import { HONEYPOT_FIELD } from '@/lib/schemas/form-constants'
import { FlowButton } from '@/components/ui/flow-button'

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'error'; message: string }
  | { kind: 'sent' }

export default function SiteCheckDialog({
  label = 'Send WildHands your URL',
}: {
  label?: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [note, setNote] = useState('')

  const open = () => {
    setState({ kind: 'idle' })
    dialogRef.current?.showModal()
  }

  const close = () => {
    dialogRef.current?.close()
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (state.kind === 'sending') return

    setState({ kind: 'sending' })

    const form = event.currentTarget
    const trap = (form.elements.namedItem(HONEYPOT_FIELD) as HTMLInputElement | null)?.value ?? ''

    try {
      const response = await fetch('/api/v1/site-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: url.trim(),
          contactEmail: email.trim(),
          contactName: name.trim(),
          message: note.trim(),
          [HONEYPOT_FIELD]: trap,
        }),
      })
      const body = (await response.json()) as { error?: { message?: string } }
      if (!response.ok) {
        setState({
          kind: 'error',
          message: body.error?.message ?? 'That did not send. Please try again.',
        })
        return
      }
      setState({ kind: 'sent' })
    } catch {
      setState({
        kind: 'error',
        message: 'We could not reach the server. Please check your connection and try again.',
      })
    }
  }

  return (
    <>
      <FlowButton text={label} variant="accent" onClick={open} />

      {/*
        Centering is explicit: the app's global reset zeroes the browser's
        default `margin: auto` on <dialog>, which is what usually centers a
        modal dialog. `fixed inset-0 m-auto` restores that centering
        cleanly — the dialog stays fixed to the viewport (as showModal()
        does anyway) and margin:auto sizes it to fit-content, centered
        both axes. Explicit width caps keep it from filling the screen.
      */}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-border bg-background p-0 text-foreground backdrop:bg-foreground/40 backdrop:backdrop-blur-sm open:animate-[fade-in_120ms_ease-out]"
        onClose={() => setState({ kind: 'idle' })}
      >
        {state.kind === 'sent' ? (
          <div className="p-6 md:p-8">
            <h2 className="font-display text-2xl">Got it.</h2>
            <p className="mt-3 text-base text-muted-foreground">
              We'll take a look at your site against the checklist and reply to{' '}
              <span className="text-foreground">{email}</span> within a couple of working days.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-base transition-colors hover:border-foreground"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl">Get your site checked</h2>
                <p className="mt-1 text-base text-muted-foreground">
                  We'll look at it against the checklist and reply.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="-mr-2 -mt-2 flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                ×
              </button>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Your website URL</span>
              {/* No autoFocus prop — a native <dialog>'s showModal() focuses
                  the first focusable descendant on its own, which is this
                  input, so autoFocus would only add lint noise. */}
              <input
                type="text"
                required
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                inputMode="url"
                placeholder="whstd.com"
                className="min-h-12 rounded-xl border border-border bg-card px-4 text-base outline-none focus-visible:border-foreground"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Email to reply to</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@business.com"
                className="min-h-12 rounded-xl border border-border bg-card px-4 text-base outline-none focus-visible:border-foreground"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Your name (optional)</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                className="min-h-12 rounded-xl border border-border bg-card px-4 text-base outline-none focus-visible:border-foreground"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">
                Anything specific you'd like us to look at? (optional)
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={2000}
                className="rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus-visible:border-foreground"
              />
            </label>

            {/* Honeypot — visually hidden, hidden from AT, ignored by real users. */}
            <label
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] size-0 opacity-0"
              tabIndex={-1}
            >
              Company fax
              <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
            </label>

            {state.kind === 'error' && (
              <p className="text-sm text-destructive" role="alert">
                {state.message}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-12 items-center rounded-full border border-border px-5 text-base transition-colors hover:border-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={state.kind === 'sending'}
                className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-base text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                {state.kind === 'sending' ? 'Sending…' : 'Send it'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  )
}
