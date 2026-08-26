/**
 * Job application, step 1 of the route-based wizard.
 * On success the browser moves to the video step rather than showing an inline
 * confirmation, so the wizard stays linkable and back-button friendly.
 */
import { useState } from 'react'
import { CV_ACCEPT_ATTRIBUTE, CV_MAX_BYTES } from '@/lib/schemas/form-constants'
import {
  Field,
  FormStatus,
  Honeypot,
  IDLE,
  SubmitButton,
  inputClass,
  postForm,
  textareaClass,
  type SubmitState,
} from './form-primitives'

interface JobApplicationFormProps {
  role: string
  roleSlug: string
}

export default function JobApplicationForm({ role, roleSlug }: JobApplicationFormProps) {
  const [state, setState] = useState<SubmitState>(IDLE)
  const [cvError, setCvError] = useState<string>('')

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    const cv = data.get('cv')
    if (cv instanceof File && cv.size > CV_MAX_BYTES) {
      setCvError('That file is larger than 3.5MB. Please attach a smaller one.')
      return
    }
    setCvError('')

    setState({ ...IDLE, status: 'submitting' })
    const result = await postForm('/api/v1/job-application', data)
    setState(result)

    if (result.status === 'success') {
      window.location.href = `/careers/apply/video?role=${encodeURIComponent(roleSlug)}`
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Honeypot />
      <input type="hidden" name="role" value={role} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="First name" name="firstName" required>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            className={inputClass}
          />
        </Field>
        <Field label="Last name" name="lastName" required>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Email" name="email" required>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </Field>

      <Field label="LinkedIn URL" name="linkedinUrl">
        <input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          placeholder="https://"
          className={inputClass}
        />
      </Field>

      <Field label="CV" name="cv" error={cvError} hint="PDF, DOC or DOCX. Maximum 3.5MB.">
        <input
          id="cv"
          name="cv"
          type="file"
          accept={CV_ACCEPT_ATTRIBUTE}
          className="wh-tap flex w-full items-center text-sm file:mr-4 file:min-h-11 file:rounded-full file:border-0 file:bg-muted file:px-5 file:text-sm file:font-medium"
        />
      </Field>

      <Field label="Anything you want us to know" name="coverNote">
        <textarea id="coverNote" name="coverNote" className={textareaClass} />
      </Field>

      <label className="wh-tap flex items-start gap-3 py-2 text-sm">
        <input
          type="checkbox"
          name="consentsToProcessing"
          required
          className="mt-0.5 size-5 shrink-0"
        />
        <span>
          I agree to WildHands Studios processing my data for this application.{' '}
          <span className="text-muted-foreground">*</span>
        </span>
      </label>

      <FormStatus state={state} />

      <SubmitButton busy={state.status === 'submitting'}>Continue to the video step</SubmitButton>
    </form>
  )
}
