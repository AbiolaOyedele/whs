/**
 * Shared form building blocks for the React islands.
 *
 * Client-side validation here is UX only — every rule is enforced again on the
 * server. Nothing in this file is a security control.
 */
import { Children, cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { FlowButton } from '@/components/ui/flow-button'
import { HONEYPOT_FIELD } from '@/lib/schemas/form-constants'

export type FieldErrors = Record<string, string>

export interface SubmitState {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
  fieldErrors: FieldErrors
}

export const IDLE: SubmitState = { status: 'idle', message: '', fieldErrors: {} }

interface ApiError {
  error?: { code?: string; message?: string }
  ok?: boolean
  message?: string
}

/**
 * Posts a form to an API route and normalises the response into SubmitState.
 * Field-level messages are authored by us server-side, so rendering them is safe.
 */
export async function postForm(
  endpoint: string,
  body: FormData | Record<string, unknown>
): Promise<SubmitState> {
  try {
    const isFormData = body instanceof FormData
    const response = await fetch(endpoint, {
      method: 'POST',
      ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
      body: isFormData ? body : JSON.stringify(body),
    })

    const payload = (await response.json().catch(() => ({}))) as ApiError & {
      details?: FieldErrors
    }

    if (response.ok) {
      return {
        status: 'success',
        message: payload.message ?? 'Thanks, that came through.',
        fieldErrors: {},
      }
    }

    return {
      status: 'error',
      message: payload.error?.message ?? 'Something stopped that from going through.',
      fieldErrors: {},
    }
  } catch {
    return {
      status: 'error',
      message: 'We could not reach the server. Please check your connection and try again.',
      fieldErrors: {},
    }
  }
}

/** Visually hidden anti-spam field. Bots fill it; humans never see it. */
export function Honeypot() {
  return (
    <div className="wh-sr-only" aria-hidden="true">
      <label htmlFor={HONEYPOT_FIELD}>Company fax</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  )
}

interface FieldProps {
  label: string
  name: string
  children: ReactNode
  error?: string | undefined
  hint?: string | undefined
  required?: boolean
  /**
   * `boxed` (default) is the bordered control used by the application forms.
   * `underline` is the contact page's treatment: no box, a single hairline
   * under the label/input pair that darkens on focus.
   */
  variant?: 'boxed' | 'underline'
}

export function Field({
  label,
  name,
  children,
  error,
  hint,
  required = false,
  variant = 'boxed',
}: FieldProps) {
  const underline = variant === 'underline'

  /*
   * The hint and error markup already carried ids, but nothing pointed at them,
   * so neither was announced — they existed only to be referenced. Cloning the
   * control here keeps every call site free of the wiring.
   */
  const describedBy = [hint ? `${name}-hint` : null, error ? `${name}-error` : null]
    .filter(Boolean)
    .join(' ')

  const only = Children.only(children)
  const control =
    describedBy && isValidElement(only)
      ? cloneElement(only as ReactElement<{ 'aria-describedby'?: string }>, {
          'aria-describedby': describedBy,
        })
      : children

  return (
    <div
      className={
        underline
          ? 'border-b border-border pb-1 transition-colors focus-within:border-foreground'
          : undefined
      }
    >
      <label
        htmlFor={name}
        className={underline ? 'block pt-4 text-xl font-medium' : 'block text-sm font-medium'}
      >
        {label}
        {/* The underline treatment marks only optional fields — on a form
            where nearly everything is required, marking the exceptions is
            quieter than an asterisk on every label. Required is still carried
            by the control's own `required` attribute, which assistive tech
            announces. */}
        {required && !underline && <span className="text-muted-foreground"> *</span>}
        {!required && <span className="text-muted-foreground"> (optional)</span>}
      </label>
      {hint && (
        <p
          id={`${name}-hint`}
          className={
            underline ? 'mt-2 text-sm text-muted-foreground' : 'mt-1 text-xs text-muted-foreground'
          }
        >
          {hint}
        </p>
      )}
      <div className={underline ? 'mt-3' : 'mt-2'}>{control}</div>
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-1.5 pb-2 text-sm text-[color:var(--destructive)]"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export const inputClass =
  'wh-tap w-full rounded-lg border border-[color:var(--input)] bg-card px-3 py-2.5 text-base ' +
  'transition-colors focus-visible:border-[color:var(--ring)] focus-visible:outline-2 ' +
  'focus-visible:outline-offset-1 focus-visible:outline-[color:var(--ring)]'

export const textareaClass = inputClass + ' min-h-32 py-3'

/*
 * Underline controls. The wrapper draws the hairline and reacts to
 * `focus-within`, so the control itself is borderless — but a colour change on
 * a parent is a weak focus indicator on its own, so the control also takes a
 * real focus ring. Both fire together.
 */
export const underlineInputClass =
  'wh-tap w-full border-0 bg-transparent px-0 pb-4 text-xl placeholder:text-muted-foreground ' +
  'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 ' +
  'focus-visible:outline-[color:var(--ring)]'

export const underlineTextareaClass = underlineInputClass + ' min-h-40 resize-y'

/**
 * Submit button with a busy state.
 *
 * Delegates to FlowButton so the most important button on the site behaves like
 * every other call to action on it. This used to be a separate implementation —
 * permanent pill, `hover:opacity-90`, its own `h-14 md:h-20` sizing — so a
 * visitor who had learned the site's button behaviour on four other pages met a
 * different one at the point of conversion.
 */
export function SubmitButton({
  busy,
  children,
  tone = 'primary',
  size = 'md',
}: {
  busy: boolean
  children: string
  /** `accent` is the lime pill used on the contact page. */
  tone?: 'primary' | 'accent'
  size?: 'md' | 'lg'
}) {
  return (
    <FlowButton
      type="submit"
      variant={tone}
      size={size}
      disabled={busy}
      /* Arrows off: the label changes to "Sending…" mid-flight, and a label
         sliding sideways while its text swaps reads as a glitch. */
      arrows={false}
      className={size === 'lg' ? 'w-full sm:w-auto sm:min-w-64' : ''}
      text={busy ? 'Sending…' : children}
    />
  )
}

/** Status region announced to assistive tech after a submit attempt. */
export function FormStatus({ state }: { state: SubmitState }) {
  if (state.status !== 'error' && state.status !== 'success') return null
  const tone =
    state.status === 'error'
      ? 'border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/5'
      : 'border-border bg-muted/50'
  return (
    <p role="status" aria-live="polite" className={`rounded-lg border px-4 py-3 text-sm ${tone}`}>
      {state.message}
    </p>
  )
}
