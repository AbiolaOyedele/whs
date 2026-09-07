/**
 * The multi-step Request A Quote wizard.
 *
 * Four steps: Contact → Project → Scope → Review. Each step validates
 * locally before Next unlocks, so a client cannot skip ahead into a
 * blank submission. Client-side validation is UX only — the server
 * revalidates the same schema and is the source of truth.
 *
 * State survives a reload via sessionStorage keyed to this browser tab.
 * Deliberately not localStorage: an operator laptop shared with someone
 * else should not fetch a stranger's half-finished enquiry, and a
 * closed tab is the honest signal that the visitor has walked away.
 *
 * Submission posts to /api/v1/quote-requests, which does the queue
 * write, the draft-quote creation, and the two emails.
 */
import { useEffect, useMemo, useState } from 'react'
import { FlowButton } from '@/components/ui/flow-button'
import { HONEYPOT_FIELD } from '@/lib/schemas/form-constants'
import { PROJECT_TYPES } from '@/types/public-request'

interface State {
  contactName: string
  contactEmail: string
  contactPhone: string
  company: string
  projectType: string
  projectSummary: string
  budgetRange: string
  timeline: string
  referralSource: string
}

const empty: State = {
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  company: '',
  projectType: '',
  projectSummary: '',
  budgetRange: '',
  timeline: '',
  referralSource: '',
}

type Step = 0 | 1 | 2 | 3
type Status =
  | { kind: 'editing'; step: Step }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string; step: Step }

const STORAGE_KEY = 'wh-request-quote'
const STEPS = ['Contact', 'Project', 'Scope', 'Review'] as const

function readStored(): State {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return empty
    const p = parsed as Partial<State>
    return {
      contactName: typeof p.contactName === 'string' ? p.contactName : '',
      contactEmail: typeof p.contactEmail === 'string' ? p.contactEmail : '',
      contactPhone: typeof p.contactPhone === 'string' ? p.contactPhone : '',
      company: typeof p.company === 'string' ? p.company : '',
      projectType: typeof p.projectType === 'string' ? p.projectType : '',
      projectSummary: typeof p.projectSummary === 'string' ? p.projectSummary : '',
      budgetRange: typeof p.budgetRange === 'string' ? p.budgetRange : '',
      timeline: typeof p.timeline === 'string' ? p.timeline : '',
      referralSource: typeof p.referralSource === 'string' ? p.referralSource : '',
    }
  } catch {
    return empty
  }
}

function writeStored(state: State): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* Storage full or blocked; the in-memory state still works. */
  }
}

function clearStored(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* No harm done. */
  }
}

/** Lightweight email check — mirrors the vibe of the server's, not the strictness. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** Per-step rules for the Next button. Full validation happens server-side. */
function stepIsValid(state: State, step: Step): boolean {
  switch (step) {
    case 0:
      return state.contactName.trim().length >= 2 && looksLikeEmail(state.contactEmail)
    case 1:
      return state.projectType.trim().length > 0 && state.projectSummary.trim().length >= 20
    case 2:
      /* Optional block. Anything the client wants to add is welcome, and
         nothing here is required for the studio to reply. */
      return true
    case 3:
      /* The review step is always valid — this is where they submit. */
      return true
  }
}

export default function RequestQuoteWizard() {
  const [state, setState] = useState<State>(empty)
  const [status, setStatus] = useState<Status>({ kind: 'editing', step: 0 })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(readStored())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeStored(state)
  }, [state, hydrated])

  const patch = (changes: Partial<State>) => setState((prev) => ({ ...prev, ...changes }))

  const step: Step = status.kind === 'editing' || status.kind === 'error' ? status.step : 3
  const canAdvance = stepIsValid(state, step)
  const progressPercent = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step])

  const next = () => {
    if (!canAdvance) return
    if (step < 3) setStatus({ kind: 'editing', step: (step + 1) as Step })
  }

  const back = () => {
    if (step === 0) return
    setStatus({ kind: 'editing', step: (step - 1) as Step })
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status.kind === 'sending') return
    setStatus({ kind: 'sending' })

    const form = event.currentTarget
    const trap = (form.elements.namedItem(HONEYPOT_FIELD) as HTMLInputElement | null)?.value ?? ''

    try {
      const response = await fetch('/api/v1/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          [HONEYPOT_FIELD]: trap,
        }),
      })
      const body = (await response.json()) as {
        ok?: boolean
        message?: string
        error?: { message?: string }
      }
      if (!response.ok || !body.ok) {
        setStatus({
          kind: 'error',
          message: body.error?.message ?? 'That did not send. Please try again.',
          step: 3,
        })
        return
      }
      clearStored()
      setStatus({ kind: 'sent' })
    } catch {
      setStatus({
        kind: 'error',
        message: 'We could not reach the server. Please check your connection and try again.',
        step: 3,
      })
    }
  }

  if (status.kind === 'sent') {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center md:p-12">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Sent
        </p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl">Got it.</h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground md:text-lg">
          Thanks — we have your request and will reply within a working day. We've also sent you a
          copy for your records.
        </p>
        <div className="mt-8">
          <FlowButton text="Back to WildHands" href="/" variant="accent" />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl">
      {/* Progress bar + step chips */}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Step {step + 1} of {STEPS.length}
          </p>
          <p className="text-sm text-muted-foreground">{STEPS[step]}</p>
        </div>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Request progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
        >
          <div
            className="h-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step body */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-10">
        {step === 0 && (
          <div className="flex flex-col gap-5" key="step-contact">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">Who are we replying to?</h2>
              <p className="mt-2 text-base text-muted-foreground">
                We reply from a real person, not an autoresponder.
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Your name</span>
              <input
                required
                value={state.contactName}
                onChange={(e) => patch({ contactName: e.target.value })}
                maxLength={120}
                className="min-h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:border-foreground"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Email</span>
              <input
                required
                type="email"
                value={state.contactEmail}
                onChange={(e) => patch({ contactEmail: e.target.value })}
                maxLength={254}
                className="min-h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:border-foreground"
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-muted-foreground">Phone (optional)</span>
                <input
                  type="tel"
                  value={state.contactPhone}
                  onChange={(e) => patch({ contactPhone: e.target.value })}
                  maxLength={40}
                  className="min-h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:border-foreground"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-muted-foreground">Company (optional)</span>
                <input
                  type="text"
                  value={state.company}
                  onChange={(e) => patch({ company: e.target.value })}
                  maxLength={200}
                  className="min-h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:border-foreground"
                />
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6" key="step-project">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">What are you building?</h2>
              <p className="mt-2 text-base text-muted-foreground">
                A sentence or two is enough — the more you can say now, the tighter the quote.
              </p>
            </div>

            {/* Project type as radio cards for a bigger tap target than a select. */}
            <fieldset>
              <legend className="text-sm text-muted-foreground">Pick what fits closest</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PROJECT_TYPES.map((option) => {
                  const isSelected = state.projectType === option.value
                  return (
                    <label
                      key={option.value}
                      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-base transition-colors ${
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-background hover:border-foreground'
                      }`}
                    >
                      <input
                        type="radio"
                        name="projectType"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => patch({ projectType: option.value })}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isSelected ? 'border-accent bg-accent' : 'border-border'
                        }`}
                      >
                        {isSelected && (
                          <span className="size-2 rounded-full bg-accent-foreground" />
                        )}
                      </span>
                      {option.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Tell us about it</span>
              <textarea
                required
                rows={6}
                value={state.projectSummary}
                onChange={(e) => patch({ projectSummary: e.target.value })}
                minLength={20}
                maxLength={4000}
                placeholder="What you're trying to build, who it's for, and anything about it that already exists."
                className="rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus-visible:border-foreground"
              />
              <span className="text-xs text-muted-foreground">
                {state.projectSummary.trim().length < 20
                  ? `At least a couple of sentences (${state.projectSummary.trim().length}/20 so far).`
                  : `${state.projectSummary.trim().length} characters.`}
              </span>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5" key="step-scope">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">Any budget or timeline in mind?</h2>
              <p className="mt-2 text-base text-muted-foreground">
                Both are optional. Even a rough sense — a range, or "no idea yet" — helps us
                reply usefully.
              </p>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Budget (optional)</span>
              <input
                type="text"
                value={state.budgetRange}
                onChange={(e) => patch({ budgetRange: e.target.value })}
                maxLength={120}
                placeholder="e.g. ₦1–2M, under ₦500k, not sure yet"
                className="min-h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:border-foreground"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Timeline (optional)</span>
              <input
                type="text"
                value={state.timeline}
                onChange={(e) => patch({ timeline: e.target.value })}
                maxLength={120}
                placeholder="e.g. ready to start now, launch by December, flexible"
                className="min-h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:border-foreground"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">How did you hear about us? (optional)</span>
              <input
                type="text"
                value={state.referralSource}
                onChange={(e) => patch({ referralSource: e.target.value })}
                maxLength={200}
                placeholder="e.g. a search, a specific person, an article"
                className="min-h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:border-foreground"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5" key="step-review">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">Send this off?</h2>
              <p className="mt-2 text-base text-muted-foreground">
                One quick read before submitting. Nothing here is binding — a quote comes after
                we've talked properly.
              </p>
            </div>

            <dl className="grid gap-3 rounded-2xl border border-border bg-background p-5 text-base">
              <ReviewRow label="Name" value={state.contactName} />
              <ReviewRow label="Email" value={state.contactEmail} />
              {state.contactPhone && <ReviewRow label="Phone" value={state.contactPhone} />}
              {state.company && <ReviewRow label="Company" value={state.company} />}
              <ReviewRow
                label="Project"
                value={
                  PROJECT_TYPES.find((p) => p.value === state.projectType)?.label ??
                  state.projectType
                }
              />
              {state.budgetRange && <ReviewRow label="Budget" value={state.budgetRange} />}
              {state.timeline && <ReviewRow label="Timeline" value={state.timeline} />}
              {state.referralSource && (
                <ReviewRow label="Heard via" value={state.referralSource} />
              )}
              <div>
                <dt className="text-sm text-muted-foreground">Summary</dt>
                <dd className="mt-1 whitespace-pre-wrap">{state.projectSummary}</dd>
              </div>
            </dl>

            {status.kind === 'error' && (
              <p role="alert" className="text-sm text-destructive">
                {status.message}
              </p>
            )}
          </div>
        )}

        {/* Honeypot — visually hidden, ignored by real users. */}
        <label
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] size-0 opacity-0"
          tabIndex={-1}
        >
          Company fax
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* Step controls */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={back}
          disabled={step === 0 || status.kind === 'sending'}
          className="inline-flex min-h-12 items-center rounded-full border border-border bg-card px-5 text-base transition-colors hover:border-foreground disabled:opacity-40"
        >
          Back
        </button>

        {step < 3 ? (
          <FlowButton
            text="Next"
            variant="accent"
            onClick={next}
            disabled={!canAdvance}
          />
        ) : (
          <FlowButton
            text={status.kind === 'sending' ? 'Sending…' : 'Send it'}
            variant="accent"
            type="submit"
            disabled={status.kind === 'sending'}
          />
        )}
      </div>
    </form>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-2 last:border-b-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="max-w-xs break-words text-right">{value}</dd>
    </div>
  )
}
