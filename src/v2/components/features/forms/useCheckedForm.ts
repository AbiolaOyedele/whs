'use client'

import { useRef, useState, type FormEvent } from 'react'
import type { SubmitResult } from './submit'
import type { FormErrors, FormValues } from './validation'

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

interface CheckedForm<K extends string> {
  values: FormValues<K>
  errors: FormErrors<K>
  status: FormStatus
  /** The server's reply once it has answered: the thank-you line, or why it was refused. */
  message: string
  setValue: (key: K) => (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  /** Fills in several fields at once, for a restored draft. */
  load: (saved: Partial<FormValues<K>>) => void
  /** Clears the form back to its first state, for "send another". */
  reset: () => void
}

/**
 * Form state with checks in plain English, then a real submission.
 *
 * Nothing is checked while the visitor first types; after a submit attempt
 * each field re-checks as it changes. A form that passes is handed to `send`,
 * which posts it; while that runs the status is "submitting" so the button can
 * show it and a second click is ignored. The server checks everything again,
 * so a refusal there comes back as an "error" with its message.
 *
 * @param fieldOrder ids of the fields, in page order, keyed by name: the first one with a problem gets focus.
 * @param send posts the checked values; receives the form element too, for FormData and the honeypot.
 */
export function useCheckedForm<K extends string>(
  initial: FormValues<K>,
  validate: (values: FormValues<K>) => FormErrors<K>,
  fieldOrder: Record<K, string>,
  send: (values: FormValues<K>, form: HTMLFormElement) => Promise<SubmitResult>,
): CheckedForm<K> {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<FormErrors<K>>({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState('')
  const inFlight = useRef(false)

  const setValue = (key: K) => (value: string) => {
    const next = { ...values, [key]: value }
    setValues(next)
    if (status === 'error') setStatus('idle')
    if (attempted) setErrors(validate(next))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (inFlight.current) return
    const form = event.currentTarget
    setAttempted(true)
    const problems = validate(values)
    setErrors(problems)
    const first = (Object.keys(fieldOrder) as K[]).find((key) => problems[key])
    if (first) {
      setStatus('idle')
      document.getElementById(fieldOrder[first])?.focus()
      return
    }

    inFlight.current = true
    setStatus('submitting')
    setMessage('')
    void send(values, form)
      .then((result) => {
        setMessage(result.message)
        setStatus(result.ok ? 'success' : 'error')
      })
      .finally(() => {
        inFlight.current = false
      })
  }

  const load = (saved: Partial<FormValues<K>>) => {
    setValues((current) => ({ ...current, ...saved }))
  }

  const reset = () => {
    setValues(initial)
    setErrors({})
    setAttempted(false)
    setStatus('idle')
    setMessage('')
  }

  return { values, errors, status, message, setValue, onSubmit, load, reset }
}
