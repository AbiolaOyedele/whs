import { ERRORS, LIMITS } from '@v2/content/forms'

/** Field values by name, and the plain-English problem with each, if any. */
export type FormValues<K extends string> = Record<K, string>
export type FormErrors<K extends string> = Partial<Record<K, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function checkName(value: string, message: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return message
  if (trimmed.length > LIMITS.name) return ERRORS.tooLong(LIMITS.name)
  return undefined
}

export function checkEmail(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return ERRORS.emailEmpty
  if (trimmed.length > LIMITS.email || !EMAIL.test(trimmed)) return ERRORS.emailInvalid
  return undefined
}

/** Optional. When given: digits with spaces, dashes, brackets or a leading +, 10 to 15 digits. */
export function checkPhone(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (!/^\+?[\d\s()-]+$/.test(trimmed)) return ERRORS.phone
  const digits = trimmed.replace(/\D/g, '').length
  return digits >= 10 && digits <= 15 ? undefined : ERRORS.phone
}

export function checkMessage(value: string, required: boolean): string | undefined {
  const trimmed = value.trim()
  if (required && !trimmed) return ERRORS.message
  if (trimmed.length > LIMITS.message) return ERRORS.tooLong(LIMITS.message)
  return undefined
}

export function checkChoice(value: string, allowed: readonly string[], message: string): string | undefined {
  return allowed.includes(value) ? undefined : message
}

/** Drops the fields that passed, so an empty object means the form is good. */
export function onlyProblems<K extends string>(errors: Record<K, string | undefined>): FormErrors<K> {
  const problems: FormErrors<K> = {}
  for (const key of Object.keys(errors) as K[]) {
    const message = errors[key]
    if (message) problems[key] = message
  }
  return problems
}
