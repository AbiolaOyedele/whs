/**
 * The multi-step Request A Quote wizard.
 *
 * Four steps: Contact → Project → Scope → Review. Each step validates
 * locally before Next unlocks, so a client cannot skip ahead into a
 * blank submission. Client-side validation is UX only; the server
 * revalidates the same schema and is the source of truth.
 *
 * Deliberately uses the same form primitives (Field, underline
 * variants, SubmitButton, Honeypot, postForm, FormStatus) as the
 * contact form, so the two surfaces look and behave the same to the
 * visitor. The wizard adds a progress bar and the step navigation on
 * top of that shared foundation.
 *
 * State survives a reload via sessionStorage keyed to this browser tab.
 * Deliberately not localStorage: an operator laptop shared with someone
 * else should not fetch a stranger's half-finished enquiry, and a
 * closed tab is the honest signal that the visitor has walked away.
 */
import { useEffect, useMemo, useState } from 'react'
import { FlowButton } from '@/components/ui/flow-button'
import {
  Field,
  FormStatus,
  Honeypot,
  IDLE,
  SubmitButton,
  postForm,
  underlineInputClass,
  underlineTextareaClass,
  type SubmitState,
} from '@/components/forms/form-primitives'
import { PROJECT_TYPES } from '@/types/public-request'

interface Values {
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

const EMPTY: Values = {
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

const STORAGE_KEY = 'wh-request-quote'
const STEPS = ['Contact', 'Project', 'Scope', 'Review'] as const

function readStored(): Values {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return EMPTY
    const p = parsed as Partial<Values>
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
    return EMPTY
  }
}

function writeStored(state: Values): void {
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

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** Per-step gates on the Next button. The server owns real validation. */
function stepIsValid(values: Values, step: Step): boolean {
  switch (step) {
    case 0:
      return values.contactName.trim().length >= 2 && looksLikeEmail(values.contactEmail)
    case 1:
      return values.projectType.trim().length > 0 && values.projectSummary.trim().length >= 20
    case 2:
    case 3:
      return true
  }
}

export default function RequestQuoteWizard() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [step, setStep] = useState<Step>(0)
  const [state, setState] = useState<SubmitState>(IDLE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setValues(readStored())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeStored(values)
  }, [values, hydrated])

  const set = (key: keyof Values, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const canAdvance = stepIsValid(values, step)
  const progressPercent = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step])

  const next = () => {
    if (!canAdvance || step >= 3) return
    setStep((step + 1) as Step)
  }
  const back = () => {
    if (step === 0) return
    setStep((step - 1) as Step)
  }

  const onSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (state.status === 'submitting') return
    setState({ ...IDLE, status: 'submitting' })
    const result = await postForm('/api/v1/quote-requests', new FormData(event.currentTarget))
    setState(result)
    if (result.status === 'success') clearStored()
  }

  if (state.status === 'success') {
    return (
      <div>
        <h2 className="text-xl font-medium">Request sent</h2>
        <p className="mt-2 text-muted-foreground">{state.message}</p>
        <div className="mt-8">
          <FlowButton text="Back to WildHands" href="/" variant="accent" />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Honeypot />

      {/* Progress bar + step label */}
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
      <div className="flex flex-col gap-5">
        {step === 0 && (
          <>
            <Field label="Your name" name="contactName" required variant="underline">
              <input
                id="contactName"
                name="contactName"
                type="text"
                required
                autoComplete="name"
                placeholder="First and last name"
                value={values.contactName}
                onChange={(event) => set('contactName', event.target.value)}
                className={underlineInputClass}
              />
            </Field>

            <Field label="Email" name="contactEmail" required variant="underline">
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={values.contactEmail}
                onChange={(event) => set('contactEmail', event.target.value)}
                className={underlineInputClass}
              />
            </Field>

            <Field label="Phone" name="contactPhone" variant="underline">
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                autoComplete="tel"
                placeholder="With your country code"
                value={values.contactPhone}
                onChange={(event) => set('contactPhone', event.target.value)}
                className={underlineInputClass}
              />
            </Field>

            <Field label="Company" name="company" variant="underline">
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                placeholder="If you're representing one"
                value={values.company}
                onChange={(event) => set('company', event.target.value)}
                className={underlineInputClass}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <fieldset className="border-b border-border pb-1">
              <legend className="block pt-4 text-xl font-medium">
                What are you building?
                <span className="text-muted-foreground"> *</span>
              </legend>
              <p className="mt-2 text-sm text-muted-foreground">Pick what fits closest.</p>
              <div className="mt-4 grid gap-2 pb-4 sm:grid-cols-2">
                {PROJECT_TYPES.map((option) => {
                  const isSelected = values.projectType === option.value
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
                        onChange={() => set('projectType', option.value)}
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
                      <span className="leading-snug">{option.label}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <Field
              label="Tell us about it"
              name="projectSummary"
              required
              variant="underline"
              hint="A sentence or two is enough — the more you can say now, the tighter the quote."
            >
              <textarea
                id="projectSummary"
                name="projectSummary"
                required
                placeholder="What you're trying to build, who it's for, and anything about it that already exists."
                value={values.projectSummary}
                onChange={(event) => set('projectSummary', event.target.value)}
                className={underlineTextareaClass}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field
              label="Budget"
              name="budgetRange"
              variant="underline"
              hint='A range, a ceiling, or "no idea yet" — anything helps us reply usefully.'
            >
              <input
                id="budgetRange"
                name="budgetRange"
                type="text"
                placeholder="e.g. ₦1–2M, under ₦500k, flexible"
                value={values.budgetRange}
                onChange={(event) => set('budgetRange', event.target.value)}
                className={underlineInputClass}
              />
            </Field>

            <Field label="Timeline" name="timeline" variant="underline">
              <input
                id="timeline"
                name="timeline"
                type="text"
                placeholder="e.g. ready to start now, launch by December, flexible"
                value={values.timeline}
                onChange={(event) => set('timeline', event.target.value)}
                className={underlineInputClass}
              />
            </Field>

            <Field label="How did you hear about us?" name="referralSource" variant="underline">
              <input
                id="referralSource"
                name="referralSource"
                type="text"
                placeholder="A search, a specific person, an article…"
                value={values.referralSource}
                onChange={(event) => set('referralSource', event.target.value)}
                className={underlineInputClass}
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <p className="text-lg text-muted-foreground">
              One quick read before submitting. Nothing here is binding — a quote comes after
              we&apos;ve talked properly.
            </p>
            <dl className="grid gap-3 rounded-2xl border border-border bg-muted/30 p-5 text-base">
              <ReviewRow label="Name" value={values.contactName} />
              <ReviewRow label="Email" value={values.contactEmail} />
              {values.contactPhone && <ReviewRow label="Phone" value={values.contactPhone} />}
              {values.company && <ReviewRow label="Company" value={values.company} />}
              <ReviewRow
                label="Project"
                value={
                  PROJECT_TYPES.find((p) => p.value === values.projectType)?.label ??
                  values.projectType
                }
              />
              {values.budgetRange && <ReviewRow label="Budget" value={values.budgetRange} />}
              {values.timeline && <ReviewRow label="Timeline" value={values.timeline} />}
              {values.referralSource && (
                <ReviewRow label="Heard via" value={values.referralSource} />
              )}
              <div>
                <dt className="text-sm text-muted-foreground">Summary</dt>
                <dd className="mt-1 whitespace-pre-wrap">{values.projectSummary}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <FormStatus state={state} />

      {/* Step controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={back}
          disabled={step === 0 || state.status === 'submitting'}
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
          <SubmitButton busy={state.status === 'submitting'} tone="accent">
            Send it
          </SubmitButton>
        )}
      </div>
    </form>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-2 last:border-b-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="max-w-xs text-right break-words">{value}</dd>
    </div>
  )
}
