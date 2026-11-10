'use client'

import { Button } from '@v2/components/ui/Button'
import { APPLY_PAGE } from '@v2/content/careers'
import { CONSENT_COPY, ENDPOINTS, ERRORS, FIELD_COPY, LIMITS } from '@v2/content/forms'
import { CheckboxField } from './CheckboxField'
import { FileField, type CvState } from './FileField'
import { FormNotice } from './FormNotice'
import { FormSubmit } from './FormSubmit'
import { FormSuccess } from './FormSuccess'
import { HONEYPOT_FIELD, Honeypot, honeypotValue } from './Honeypot'
import { postForm } from './submit'
import { TextField } from './TextField'
import { useCheckedForm } from './useCheckedForm'
import { checkEmail, checkName, checkOptional, checkTicked, checkUrl, onlyProblems, type FormValues } from './validation'

type JobField = 'firstName' | 'lastName' | 'email' | 'linkedinUrl' | 'cv' | 'coverNote' | 'consentsToProcessing'

interface JobApplicationFormProps {
  /** The role's title, sent with the application so the studio knows which one. */
  role: string
  roleSlug: string
}

const EMPTY: FormValues<JobField> = {
  firstName: '',
  lastName: '',
  email: '',
  linkedinUrl: '',
  cv: '',
  coverNote: '',
  consentsToProcessing: '',
}

/** The CV is optional here, but one that is attached must pass the server's checks. */
function checkOptionalCv(state: string): string | undefined {
  const cv = state as CvState
  if (cv === 'too-large') return ERRORS.cvTooLarge
  if (cv === 'bad-type') return ERRORS.cvType
  return undefined
}

function validate(values: FormValues<JobField>) {
  return onlyProblems<JobField>({
    firstName: checkName(values.firstName, ERRORS.firstName),
    lastName: checkName(values.lastName, ERRORS.lastName),
    email: checkEmail(values.email),
    linkedinUrl: checkUrl(values.linkedinUrl, ERRORS.linkedinOptional, false),
    cv: checkOptionalCv(values.cv),
    coverNote: checkOptional(values.coverNote, LIMITS.coverNote),
    consentsToProcessing: checkTicked(values.consentsToProcessing, ERRORS.consentProcessing),
  })
}

/**
 * A job application. Sends multipart to POST /api/v1/job-application
 * (src/pages/api/v1/job-application.ts), which checks it against
 * jobApplicationSchema, re-validates the CV and emails the studio.
 */
export function JobApplicationForm({ role, roleSlug }: JobApplicationFormProps) {
  const id = `apply-${roleSlug}`
  const ids: Record<JobField, string> = {
    firstName: `${id}-firstName`,
    lastName: `${id}-lastName`,
    email: `${id}-email`,
    linkedinUrl: `${id}-linkedinUrl`,
    cv: `${id}-cv`,
    coverNote: `${id}-coverNote`,
    consentsToProcessing: `${id}-consent`,
  }

  const send = (values: FormValues<JobField>, form: HTMLFormElement) => {
    const body = new FormData()
    body.set('role', role)
    body.set('firstName', values.firstName.trim())
    body.set('lastName', values.lastName.trim())
    body.set('email', values.email.trim())
    body.set('linkedinUrl', values.linkedinUrl.trim())
    body.set('coverNote', values.coverNote.trim())
    body.set('consentsToProcessing', values.consentsToProcessing === 'true' ? 'true' : 'false')
    body.set(HONEYPOT_FIELD, honeypotValue(form))
    const cv = form.elements.namedItem('cv')
    const file = cv instanceof HTMLInputElement ? cv.files?.[0] : undefined
    if (file && values.cv === 'ok') body.set('cv', file)
    return postForm(ENDPOINTS.job, body)
  }

  const form = useCheckedForm<JobField>(EMPTY, validate, ids, send)
  const busy = form.status === 'submitting'

  if (form.status === 'success') {
    return (
      <FormSuccess title={APPLY_PAGE.successTitle} message={APPLY_PAGE.successBody}>
        <Button label={APPLY_PAGE.otherRoles.label} href={APPLY_PAGE.otherRoles.href} variant="pink" />
        <Button label={APPLY_PAGE.writing.label} href={APPLY_PAGE.writing.href} variant="outline" />
      </FormSuccess>
    )
  }

  return (
    <form noValidate onSubmit={form.onSubmit} aria-busy={busy} className="anim-fade-slide-in flex flex-col gap-5">
      <Honeypot idPrefix={id} />
      <div className="grid gap-8">
        <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
          <TextField
            id={ids.firstName}
            name="firstName"
            label={FIELD_COPY.firstName.label}
            placeholder={FIELD_COPY.firstName.placeholder}
            autoComplete="given-name"
            required
            maxLength={LIMITS.name}
            value={form.values.firstName}
            onChange={form.setValue('firstName')}
            error={form.errors.firstName}
          />
          <TextField
            id={ids.lastName}
            name="lastName"
            label={FIELD_COPY.lastName.label}
            placeholder={FIELD_COPY.lastName.placeholder}
            autoComplete="family-name"
            required
            maxLength={LIMITS.name}
            value={form.values.lastName}
            onChange={form.setValue('lastName')}
            error={form.errors.lastName}
          />
        </div>
        <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
          <TextField
            id={ids.email}
            name="email"
            type="email"
            label={FIELD_COPY.plainEmail.label}
            placeholder={FIELD_COPY.plainEmail.placeholder}
            autoComplete="email"
            required
            maxLength={LIMITS.email}
            value={form.values.email}
            onChange={form.setValue('email')}
            error={form.errors.email}
          />
          <TextField
            id={ids.linkedinUrl}
            name="linkedinUrl"
            type="url"
            label={FIELD_COPY.linkedinOptional.label}
            placeholder={FIELD_COPY.linkedinOptional.placeholder}
            autoComplete="url"
            maxLength={LIMITS.url}
            value={form.values.linkedinUrl}
            onChange={form.setValue('linkedinUrl')}
            error={form.errors.linkedinUrl}
          />
        </div>
        <FileField
          id={ids.cv}
          name="cv"
          label={FIELD_COPY.cvOptional.label}
          hint={FIELD_COPY.cvOptional.hint}
          onChange={form.setValue('cv')}
          error={form.errors.cv}
        />
        <TextField
          id={ids.coverNote}
          name="coverNote"
          label={FIELD_COPY.coverNote.label}
          placeholder={FIELD_COPY.coverNote.placeholder}
          multiline
          maxLength={LIMITS.coverNote}
          value={form.values.coverNote}
          onChange={form.setValue('coverNote')}
          error={form.errors.coverNote}
        />
        <CheckboxField
          id={ids.consentsToProcessing}
          name="consentsToProcessing"
          required
          value={form.values.consentsToProcessing}
          onChange={form.setValue('consentsToProcessing')}
          error={form.errors.consentsToProcessing}
        >
          {CONSENT_COPY.processing}
        </CheckboxField>
      </div>
      {form.status === 'error' ? <FormNotice message={form.message} /> : null}
      <FormSubmit label={APPLY_PAGE.submit} busy={busy} />
    </form>
  )
}
