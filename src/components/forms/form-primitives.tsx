/**
 * Shared form building blocks for the React islands.
 *
 * Client-side validation here is UX only — every rule is enforced again on the
 * server. Nothing in this file is a security control.
 */
import type { ReactNode } from 'react'
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
        message: payload.message ?? 'Thanks — that came through.',
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
}

export function Field({ label, name, children, error, hint, required = false }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && <span className="text-muted-foreground"> *</span>}
        {!required && <span className="text-muted-foreground"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${name}-hint`} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-1.5 text-sm text-[color:var(--destructive)]"
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

/** Submit button with a busy state. */
export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="wh-tap inline-flex items-center justify-center rounded-full bg-primary px-6 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
    >
      {busy ? 'Sending…' : children}
    </button>
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
