/**
 * Freelance application, including the CV upload.
 *
 * The client-side size check exists to save the applicant a failed upload; the
 * server re-validates MIME type and size regardless.
 */
import { useState } from 'react'
import {
  AVAILABILITY_OPTIONS,
  CV_ACCEPT_ATTRIBUTE,
  CV_MAX_BYTES,
  FREELANCE_POSITIONS,
  HOURS_PER_MONTH_OPTIONS,
} from '@/lib/schemas/form-constants'
import {
  Field,
  FormStatus,
  Honeypot,
  IDLE,
  SubmitButton,
  inputClass,
  postForm,
  type SubmitState,
} from './form-primitives'

/** TODO: replace with a full country list, or a country-select dependency. */
const COUNTRIES = [
  'United Kingdom',
  'Ireland',
  'Poland',
  'Germany',
  'Spain',
  'Portugal',
  'Netherlands',
  'France',
  'Italy',
  'United States',
  'Canada',
  'Nigeria',
  'South Africa',
  'India',
  'Australia',
  'Other',
]

const selectClass = inputClass

export default function FreelanceApplicationForm() {
  const [state, setState] = useState<SubmitState>(IDLE)
  const [cvError, setCvError] = useState<string>('')

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    const cv = data.get('cv')
    if (!(cv instanceof File) || cv.size === 0) {
      setCvError('Please attach your CV.')
      return
    }
    if (cv.size > CV_MAX_BYTES) {
      setCvError('That file is larger than 3.5MB. Please attach a smaller one.')
      return
    }
    setCvError('')

    setState({ ...IDLE, status: 'submitting' })
    const result = await postForm('/api/v1/freelance-application', data)
    setState(result)
    if (result.status === 'success') form.reset()
  }

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-medium">Application received</h2>
        <p className="mt-2 text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Honeypot />

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

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="LinkedIn URL" name="linkedinUrl" required>
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            required
            placeholder="https://"
            className={inputClass}
          />
        </Field>
        <Field label="Portfolio or GitHub URL" name="portfolioUrl" required>
          <input
            id="portfolioUrl"
            name="portfolioUrl"
            type="url"
            required
            placeholder="https://"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="CV" name="cv" required error={cvError} hint="PDF, DOC or DOCX. Maximum 3.5MB.">
        <input
          id="cv"
          name="cv"
          type="file"
          required
          accept={CV_ACCEPT_ATTRIBUTE}
          className="wh-tap flex w-full items-center text-sm file:mr-4 file:min-h-11 file:rounded-full file:border-0 file:bg-muted file:px-5 file:text-sm file:font-medium"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Country of residence" name="countryOfResidence" required>
          <select
            id="countryOfResidence"
            name="countryOfResidence"
            required
            className={selectClass}
            defaultValue=""
          >
            <option value="" disabled>
              Select a country
            </option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Country of tax residence" name="taxResidence" required>
          <select
            id="taxResidence"
            name="taxResidence"
            required
            className={selectClass}
            defaultValue=""
          >
            <option value="" disabled>
              Select a country
            </option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Position" name="position" required>
        <select id="position" name="position" required className={selectClass} defaultValue="">
          <option value="" disabled>
            Select a position
          </option>
          {FREELANCE_POSITIONS.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Availability" name="availability" required>
          <select
            id="availability"
            name="availability"
            required
            className={selectClass}
            defaultValue=""
          >
            <option value="" disabled>
              Select availability
            </option>
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Hours per month" name="hoursPerMonth" required>
          <select
            id="hoursPerMonth"
            name="hoursPerMonth"
            required
            className={selectClass}
            defaultValue=""
          >
            <option value="" disabled>
              Select hours
            </option>
            {HOURS_PER_MONTH_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Interested in long-term work?" name="longTermInterest" required>
        <select
          id="longTermInterest"
          name="longTermInterest"
          required
          className={selectClass}
          defaultValue=""
        >
          <option value="" disabled>
            Select an answer
          </option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </Field>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Confirmations</legend>
        <label className="wh-tap flex items-start gap-3 py-2 text-sm">
          <input type="checkbox" name="confirmsB2B" required className="mt-0.5 size-5 shrink-0" />
          <span>
            I can invoice as a registered business (B2B).{' '}
            <span className="text-muted-foreground">*</span>
          </span>
        </label>
        <label className="wh-tap flex items-start gap-3 py-2 text-sm">
          <input
            type="checkbox"
            name="consentsToProcessing"
            required
            className="mt-0.5 size-5 shrink-0"
          />
          <span>
            I agree to WildHands Studio processing my data for this application.{' '}
            <span className="text-muted-foreground">*</span>
          </span>
        </label>
        <label className="wh-tap flex items-start gap-3 py-2 text-sm">
          <input
            type="checkbox"
            name="consentsToFutureContact"
            className="mt-0.5 size-5 shrink-0"
          />
          <span>
            Keep my details for future opportunities.{' '}
            <span className="text-muted-foreground">(optional)</span>
          </span>
        </label>
      </fieldset>

      <FormStatus state={state} />

      <SubmitButton busy={state.status === 'submitting'}>Submit application</SubmitButton>
    </form>
  )
}
