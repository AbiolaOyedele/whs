'use client'

import { Button } from '@v2/components/ui/Button'
import {
  AVAILABILITY_CHOICES,
  CONSENT_COPY,
  COUNTRY_OPTIONS,
  ENDPOINTS,
  ERRORS,
  FIELD_COPY,
  HOURS_CHOICES,
  LIMITS,
  LONG_TERM_OPTIONS,
  POSITION_OPTIONS,
} from '@v2/content/forms'
import { FREELANCE_PAGE } from '@v2/content/freelance'
import { CheckboxField } from './CheckboxField'
import { ChoiceListbox } from './ChoiceListbox'
import { FileField, type CvState } from './FileField'
import { FormNotice } from './FormNotice'
import { FormSubmit } from './FormSubmit'
import { FormSuccess } from './FormSuccess'
import { HONEYPOT_FIELD, Honeypot, honeypotValue } from './Honeypot'
import { postForm } from './submit'
import { TextField } from './TextField'
import { useCheckedForm } from './useCheckedForm'
import { checkChoice, checkEmail, checkName, checkTicked, checkUrl, onlyProblems, type FormValues } from './validation'

type FreelanceField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'linkedinUrl'
  | 'portfolioUrl'
  | 'cv'
  | 'countryOfResidence'
  | 'taxResidence'
  | 'position'
  | 'availability'
  | 'hoursPerMonth'
  | 'longTermInterest'
  | 'confirmsB2B'
  | 'consentsToProcessing'
  | 'consentsToFutureContact'

const ID = 'freelance'
const FIELD_IDS: Record<FreelanceField, string> = {
  firstName: `${ID}-firstName`,
  lastName: `${ID}-lastName`,
  email: `${ID}-email`,
  linkedinUrl: `${ID}-linkedinUrl`,
  portfolioUrl: `${ID}-portfolioUrl`,
  cv: `${ID}-cv`,
  countryOfResidence: `${ID}-countryOfResidence`,
  taxResidence: `${ID}-taxResidence`,
  position: `${ID}-position`,
  availability: `${ID}-availability`,
  hoursPerMonth: `${ID}-hoursPerMonth`,
  longTermInterest: `${ID}-longTermInterest`,
  confirmsB2B: `${ID}-confirmsB2B`,
  consentsToProcessing: `${ID}-consentsToProcessing`,
  consentsToFutureContact: `${ID}-consentsToFutureContact`,
}

const EMPTY: FormValues<FreelanceField> = {
  firstName: '',
  lastName: '',
  email: '',
  linkedinUrl: '',
  portfolioUrl: '',
  cv: '',
  countryOfResidence: '',
  taxResidence: '',
  position: '',
  availability: '',
  hoursPerMonth: '',
  longTermInterest: '',
  confirmsB2B: '',
  consentsToProcessing: '',
  consentsToFutureContact: '',
}

const values = (options: readonly { value: string }[]) => options.map((option) => option.value)
const COUNTRIES = values(COUNTRY_OPTIONS)

/** The CV is required here, and must pass the server's type and size checks. */
function checkCv(state: string): string | undefined {
  const cv = state as CvState
  if (cv === '') return ERRORS.cvMissing
  if (cv === 'too-large') return ERRORS.cvTooLarge
  if (cv === 'bad-type') return ERRORS.cvType
  return undefined
}

function validate(form: FormValues<FreelanceField>) {
  return onlyProblems<FreelanceField>({
    firstName: checkName(form.firstName, ERRORS.firstName),
    lastName: checkName(form.lastName, ERRORS.lastName),
    email: checkEmail(form.email),
    linkedinUrl: checkUrl(form.linkedinUrl, ERRORS.linkedin, true),
    portfolioUrl: checkUrl(form.portfolioUrl, ERRORS.portfolio, true),
    cv: checkCv(form.cv),
    countryOfResidence: checkChoice(form.countryOfResidence, COUNTRIES, ERRORS.country),
    taxResidence: checkChoice(form.taxResidence, COUNTRIES, ERRORS.taxResidence),
    position: checkChoice(form.position, values(POSITION_OPTIONS), ERRORS.position),
    availability: checkChoice(form.availability, values(AVAILABILITY_CHOICES), ERRORS.availability),
    hoursPerMonth: checkChoice(form.hoursPerMonth, values(HOURS_CHOICES), ERRORS.hours),
    longTermInterest: checkChoice(form.longTermInterest, values(LONG_TERM_OPTIONS), ERRORS.longTerm),
    confirmsB2B: checkTicked(form.confirmsB2B, ERRORS.consentB2B),
    consentsToProcessing: checkTicked(form.consentsToProcessing, ERRORS.consentProcessing),
    consentsToFutureContact: undefined,
  })
}

/**
 * Sends multipart to POST /api/v1/freelance-application
 * (src/pages/api/v1/freelance-application.ts): the fields of
 * freelanceApplicationSchema, the tick boxes as 'true'/'false', and the CV.
 */
function send(form: FormValues<FreelanceField>, element: HTMLFormElement) {
  const body = new FormData()
  const text: FreelanceField[] = [
    'firstName',
    'lastName',
    'email',
    'linkedinUrl',
    'portfolioUrl',
    'countryOfResidence',
    'taxResidence',
    'position',
    'availability',
    'hoursPerMonth',
    'longTermInterest',
  ]
  for (const key of text) body.set(key, form[key].trim())
  for (const key of ['confirmsB2B', 'consentsToProcessing', 'consentsToFutureContact'] as const) {
    body.set(key, form[key] === 'true' ? 'true' : 'false')
  }
  body.set(HONEYPOT_FIELD, honeypotValue(element))
  const cv = element.elements.namedItem('cv')
  const file = cv instanceof HTMLInputElement ? cv.files?.[0] : undefined
  if (file) body.set('cv', file)
  return postForm(ENDPOINTS.freelance, body)
}

/** The Freelance Hub application: who you are, your work, your CV and how you would like to work. */
export function FreelanceApplicationForm() {
  const form = useCheckedForm<FreelanceField>(EMPTY, validate, FIELD_IDS, send)
  const busy = form.status === 'submitting'
  const v = form.values
  const e = form.errors

  if (form.status === 'success') {
    return (
      <FormSuccess title={FREELANCE_PAGE.form.successTitle} message={form.message}>
        <Button label={FREELANCE_PAGE.form.successAction.label} href={FREELANCE_PAGE.form.successAction.href} variant="pink" />
      </FormSuccess>
    )
  }

  return (
    <form noValidate onSubmit={form.onSubmit} aria-busy={busy} className="flex flex-col gap-5">
      <Honeypot idPrefix={ID} />
      <div className="grid gap-8">
        <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
          <TextField
            id={FIELD_IDS.firstName}
            name="firstName"
            label={FIELD_COPY.firstName.label}
            placeholder={FIELD_COPY.firstName.placeholder}
            autoComplete="given-name"
            required
            maxLength={LIMITS.name}
            value={v.firstName}
            onChange={form.setValue('firstName')}
            error={e.firstName}
          />
          <TextField
            id={FIELD_IDS.lastName}
            name="lastName"
            label={FIELD_COPY.lastName.label}
            placeholder={FIELD_COPY.lastName.placeholder}
            autoComplete="family-name"
            required
            maxLength={LIMITS.name}
            value={v.lastName}
            onChange={form.setValue('lastName')}
            error={e.lastName}
          />
        </div>
        <TextField
          id={FIELD_IDS.email}
          name="email"
          type="email"
          label={FIELD_COPY.plainEmail.label}
          placeholder={FIELD_COPY.plainEmail.placeholder}
          autoComplete="email"
          required
          maxLength={LIMITS.email}
          value={v.email}
          onChange={form.setValue('email')}
          error={e.email}
        />
        <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
          <TextField
            id={FIELD_IDS.linkedinUrl}
            name="linkedinUrl"
            type="url"
            label={FIELD_COPY.linkedin.label}
            placeholder={FIELD_COPY.linkedin.placeholder}
            required
            maxLength={LIMITS.url}
            value={v.linkedinUrl}
            onChange={form.setValue('linkedinUrl')}
            error={e.linkedinUrl}
          />
          <TextField
            id={FIELD_IDS.portfolioUrl}
            name="portfolioUrl"
            type="url"
            label={FIELD_COPY.portfolio.label}
            placeholder={FIELD_COPY.portfolio.placeholder}
            autoComplete="url"
            required
            maxLength={LIMITS.url}
            value={v.portfolioUrl}
            onChange={form.setValue('portfolioUrl')}
            error={e.portfolioUrl}
          />
        </div>
        <FileField
          id={FIELD_IDS.cv}
          name="cv"
          label={FIELD_COPY.cv.label}
          hint={FIELD_COPY.cv.hint}
          required
          onChange={form.setValue('cv')}
          error={e.cv}
        />
        <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
          <ChoiceListbox
            id={FIELD_IDS.countryOfResidence}
            name="countryOfResidence"
            label={FIELD_COPY.country.label}
            placeholder={FIELD_COPY.country.placeholder}
            options={COUNTRY_OPTIONS}
            required
            value={v.countryOfResidence}
            onChange={form.setValue('countryOfResidence')}
            error={e.countryOfResidence}
          />
          <ChoiceListbox
            id={FIELD_IDS.taxResidence}
            name="taxResidence"
            label={FIELD_COPY.taxResidence.label}
            placeholder={FIELD_COPY.taxResidence.placeholder}
            options={COUNTRY_OPTIONS}
            required
            value={v.taxResidence}
            onChange={form.setValue('taxResidence')}
            error={e.taxResidence}
          />
        </div>
        <ChoiceListbox
          id={FIELD_IDS.position}
          name="position"
          label={FIELD_COPY.position.label}
          placeholder={FIELD_COPY.position.placeholder}
          options={POSITION_OPTIONS}
          required
          value={v.position}
          onChange={form.setValue('position')}
          error={e.position}
        />
        <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
          <ChoiceListbox
            id={FIELD_IDS.availability}
            name="availability"
            label={FIELD_COPY.availability.label}
            placeholder={FIELD_COPY.availability.placeholder}
            options={AVAILABILITY_CHOICES}
            required
            value={v.availability}
            onChange={form.setValue('availability')}
            error={e.availability}
          />
          <ChoiceListbox
            id={FIELD_IDS.hoursPerMonth}
            name="hoursPerMonth"
            label={FIELD_COPY.hours.label}
            placeholder={FIELD_COPY.hours.placeholder}
            options={HOURS_CHOICES}
            required
            value={v.hoursPerMonth}
            onChange={form.setValue('hoursPerMonth')}
            error={e.hoursPerMonth}
          />
        </div>
        <ChoiceListbox
          id={FIELD_IDS.longTermInterest}
          name="longTermInterest"
          label={FIELD_COPY.longTerm.label}
          placeholder={FIELD_COPY.longTerm.placeholder}
          options={LONG_TERM_OPTIONS}
          required
          value={v.longTermInterest}
          onChange={form.setValue('longTermInterest')}
          error={e.longTermInterest}
        />
        <fieldset className="flex flex-col gap-1">
          <legend className="input-label">{FREELANCE_PAGE.form.confirmations}</legend>
          <CheckboxField
            id={FIELD_IDS.confirmsB2B}
            name="confirmsB2B"
            required
            value={v.confirmsB2B}
            onChange={form.setValue('confirmsB2B')}
            error={e.confirmsB2B}
          >
            {CONSENT_COPY.b2b}
          </CheckboxField>
          <CheckboxField
            id={FIELD_IDS.consentsToProcessing}
            name="consentsToProcessing"
            required
            value={v.consentsToProcessing}
            onChange={form.setValue('consentsToProcessing')}
            error={e.consentsToProcessing}
          >
            {CONSENT_COPY.processing}
          </CheckboxField>
          <CheckboxField
            id={FIELD_IDS.consentsToFutureContact}
            name="consentsToFutureContact"
            value={v.consentsToFutureContact}
            onChange={form.setValue('consentsToFutureContact')}
          >
            {`${CONSENT_COPY.futureContact} (optional)`}
          </CheckboxField>
        </fieldset>
      </div>
      {form.status === 'error' ? <FormNotice message={form.message} /> : null}
      <FormSubmit label={FREELANCE_PAGE.form.submit} busy={busy} />
    </form>
  )
}
