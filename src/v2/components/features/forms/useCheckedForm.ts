'use client'

import { useState, type FormEvent } from 'react'
import type { FormErrors, FormValues } from './validation'

export type FormStatus = 'idle' | 'not-connected'

interface CheckedForm<K extends string> {
  values: FormValues<K>
  errors: FormErrors<K>
  status: FormStatus
  setValue: (key: K) => (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

/**
 * Form state with checks in plain English. Nothing is checked while the
 * visitor first types; after a submit attempt each field re-checks as it
 * changes. A form that passes shows the "not connected yet" notice: there is
 * no backend for this site, so it never pretends to send.
 *
 * @param fieldOrder ids of the fields, in page order, keyed by name: the first one with a problem gets focus.
 */
export function useCheckedForm<K extends string>(
  initial: FormValues<K>,
  validate: (values: FormValues<K>) => FormErrors<K>,
  fieldOrder: Record<K, string>,
): CheckedForm<K> {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<FormErrors<K>>({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState<FormStatus>('idle')

  const setValue = (key: K) => (value: string) => {
    const next = { ...values, [key]: value }
    setValues(next)
    setStatus('idle')
    if (attempted) setErrors(validate(next))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAttempted(true)
    const problems = validate(values)
    setErrors(problems)
    const first = (Object.keys(fieldOrder) as K[]).find((key) => problems[key])
    if (first) {
      setStatus('idle')
      document.getElementById(fieldOrder[first])?.focus()
      return
    }
    setStatus('not-connected')
  }

  return { values, errors, status, setValue, onSubmit }
}
