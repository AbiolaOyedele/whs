'use client'

import { ENDPOINTS, FIELD_COPY, LIMITS, NEWSLETTER_COPY } from '@v2/content/forms'
import { FieldError } from './FieldError'
import { FormNotice } from './FormNotice'
import { FormSubmit } from './FormSubmit'
import { HONEYPOT_FIELD, Honeypot, honeypotValue } from './Honeypot'
import { postForm } from './submit'
import { useCheckedForm } from './useCheckedForm'
import { checkEmail, onlyProblems, type FormValues } from './validation'
import { Icon } from '@v2/components/ui/Icon'

type NewsletterField = 'email'

interface NewsletterFormProps {
  /** Prefix for ids, so the form can appear more than once. */
  idPrefix: string
}

function validate(values: FormValues<NewsletterField>) {
  return onlyProblems<NewsletterField>({ email: checkEmail(values.email) })
}

/** Sends to POST /api/v1/newsletter (src/pages/api/v1/newsletter.ts): one email address. */
function send(values: FormValues<NewsletterField>, form: HTMLFormElement) {
  return postForm(ENDPOINTS.newsletter, { email: values.email.trim(), [HONEYPOT_FIELD]: honeypotValue(form) })
}

/** One email field and a button: the "tell me when new briefs open" sign-up. */
export function NewsletterForm({ idPrefix }: NewsletterFormProps) {
  const fieldId = `${idPrefix}-newsletter-email`
  const errorId = `${fieldId}-error`
  const form = useCheckedForm<NewsletterField>({ email: '' }, validate, { email: fieldId }, send)
  const busy = form.status === 'submitting'
  const error = form.errors.email

  if (form.status === 'success') {
    return (
      <p role="status" className="text-body-md anim-fade-slide-in flex items-start gap-3 text-navy-900">
        <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-pink-500">
          <Icon name="check" strokeWidth={2.4} className="size-3" />
        </span>
        <span>
          <strong className="font-medium">{NEWSLETTER_COPY.successTitle}.</strong> {form.message}
        </span>
      </p>
    )
  }

  return (
    <form noValidate onSubmit={form.onSubmit} aria-busy={busy} className="flex flex-col gap-4">
      <Honeypot idPrefix={idPrefix} />
      <div>
        <label htmlFor={fieldId} className="input-label">
          {FIELD_COPY.newsletterEmail.label}
        </label>
        <input
          id={fieldId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={FIELD_COPY.newsletterEmail.placeholder}
          maxLength={LIMITS.email}
          value={form.values.email}
          onChange={(event) => form.setValue('email')(event.target.value)}
          aria-required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="input-base"
        />
        {error ? <FieldError id={errorId} message={error} /> : null}
      </div>
      {form.status === 'error' ? <FormNotice message={form.message} /> : null}
      <FormSubmit label={NEWSLETTER_COPY.submit} busy={busy} privacyNote={false} />
    </form>
  )
}
