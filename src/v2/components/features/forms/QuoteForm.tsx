'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@v2/components/ui/Button'
import { ENDPOINTS, ERRORS, FIELD_COPY, LIMITS, PROJECT_TYPE_OPTIONS, QUOTE_PAGE, REFERRAL_OPTIONS } from '@v2/content/forms'
import { ChoiceListbox } from './ChoiceListbox'
import { FormNotice } from './FormNotice'
import { FormSubmit } from './FormSubmit'
import { FormSuccess } from './FormSuccess'
import { HONEYPOT_FIELD, Honeypot, honeypotValue } from './Honeypot'
import { postForm } from './submit'
import { TextField } from './TextField'
import { useCheckedForm } from './useCheckedForm'
import {
  checkChoice,
  checkEmail,
  checkMinText,
  checkName,
  checkOptional,
  checkPhone,
  onlyProblems,
  type FormValues,
} from './validation'

type QuoteField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'company'
  | 'projectType'
  | 'projectSummary'
  | 'budgetRange'
  | 'timeline'
  | 'referralSource'

const ID = 'quote-page'
const FIELD_IDS: Record<QuoteField, string> = {
  firstName: `${ID}-firstName`,
  lastName: `${ID}-lastName`,
  email: `${ID}-email`,
  phone: `${ID}-phone`,
  company: `${ID}-company`,
  projectType: `${ID}-projectType`,
  projectSummary: `${ID}-projectSummary`,
  budgetRange: `${ID}-budgetRange`,
  timeline: `${ID}-timeline`,
  referralSource: `${ID}-referralSource`,
}

const EMPTY: FormValues<QuoteField> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  projectType: '',
  projectSummary: '',
  budgetRange: '',
  timeline: '',
  referralSource: '',
}

const PROJECT_VALUES = PROJECT_TYPE_OPTIONS.map((option) => option.value)

/**
 * A half-finished request survives a reload in this tab only: sessionStorage,
 * not localStorage, so a shared laptop never shows a stranger's enquiry, and a
 * closed tab is the honest sign the visitor has walked away. Same rule as the
 * original wizard.
 */
const DRAFT_KEY = 'wh-request-quote-v2'

function readDraft(): Partial<FormValues<QuoteField>> {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const draft: Partial<FormValues<QuoteField>> = {}
    for (const key of Object.keys(EMPTY) as QuoteField[]) {
      const value = (parsed as Record<string, unknown>)[key]
      if (typeof value === 'string') draft[key] = value
    }
    return draft
  } catch {
    return {}
  }
}

function writeDraft(values: FormValues<QuoteField>): void {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values))
  } catch {
    /* Storage blocked or full: the form still works without it. */
  }
}

function clearDraft(): void {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    /* Nothing to clear. */
  }
}

function validate(values: FormValues<QuoteField>) {
  return onlyProblems<QuoteField>({
    firstName: checkName(values.firstName, ERRORS.firstName),
    lastName: checkName(values.lastName, ERRORS.lastName),
    email: checkEmail(values.email),
    phone: checkPhone(values.phone),
    company: checkOptional(values.company, LIMITS.company),
    projectType: checkChoice(values.projectType, PROJECT_VALUES, ERRORS.projectType),
    projectSummary: checkMinText(
      values.projectSummary,
      LIMITS.summaryMin,
      LIMITS.summary,
      ERRORS.message,
      ERRORS.projectSummaryShort,
    ),
    budgetRange: checkOptional(values.budgetRange, LIMITS.short),
    timeline: checkOptional(values.timeline, LIMITS.short),
    referralSource: undefined,
  })
}

/**
 * Sends to POST /api/v1/quote-requests (src/pages/api/v1/quote-requests.ts),
 * the endpoint behind the original Request a quote wizard. It queues the
 * request for the admin, drafts a quote and emails a receipt, so this posts
 * exactly the fields its schema (quoteRequestSchema) reads.
 */
function send(values: FormValues<QuoteField>, form: HTMLFormElement) {
  return postForm(ENDPOINTS.quote, {
    contactName: `${values.firstName.trim()} ${values.lastName.trim()}`,
    contactEmail: values.email.trim(),
    contactPhone: values.phone.trim(),
    company: values.company.trim(),
    projectType: values.projectType,
    projectSummary: values.projectSummary.trim(),
    budgetRange: values.budgetRange.trim(),
    timeline: values.timeline.trim(),
    referralSource: values.referralSource,
    [HONEYPOT_FIELD]: honeypotValue(form),
  })
}

/** Request a quote: who you are, what you are building, rough budget and timeline. */
export function QuoteForm() {
  const form = useCheckedForm<QuoteField>(EMPTY, validate, FIELD_IDS, send)
  const busy = form.status === 'submitting'
  const restored = useRef(false)
  const { values, setValue, load, status } = form

  // Bring back a draft from earlier in this tab, once, after the first paint.
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    load(readDraft())
  }, [load])

  useEffect(() => {
    if (!restored.current) return
    if (status === 'success') clearDraft()
    else writeDraft(values)
  }, [values, status])

  if (form.status === 'success') {
    return (
      <FormSuccess title={QUOTE_PAGE.successTitle} message={form.message}>
        <Button label={QUOTE_PAGE.successAction.label} href={QUOTE_PAGE.successAction.href} variant="pink" />
      </FormSuccess>
    )
  }

  return (
    <form noValidate onSubmit={form.onSubmit} aria-busy={busy} className="anim-fade-slide-in flex flex-col gap-5">
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
            value={values.firstName}
            onChange={setValue('firstName')}
            error={form.errors.firstName}
          />
          <TextField
            id={FIELD_IDS.lastName}
            name="lastName"
            label={FIELD_COPY.lastName.label}
            placeholder={FIELD_COPY.lastName.placeholder}
            autoComplete="family-name"
            required
            maxLength={LIMITS.name}
            value={values.lastName}
            onChange={setValue('lastName')}
            error={form.errors.lastName}
          />
        </div>
        <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
          <TextField
            id={FIELD_IDS.email}
            name="email"
            type="email"
            label={FIELD_COPY.email.label}
            placeholder={FIELD_COPY.email.placeholder}
            autoComplete="email"
            required
            maxLength={LIMITS.email}
            value={values.email}
            onChange={setValue('email')}
            error={form.errors.email}
          />
          <TextField
            id={FIELD_IDS.phone}
            name="phone"
            type="tel"
            label={FIELD_COPY.phone.label}
            placeholder={FIELD_COPY.phone.placeholder}
            autoComplete="tel"
            maxLength={LIMITS.phone}
            value={values.phone}
            onChange={setValue('phone')}
            error={form.errors.phone}
          />
        </div>
        <TextField
          id={FIELD_IDS.company}
          name="company"
          label={FIELD_COPY.company.label}
          placeholder={FIELD_COPY.company.placeholder}
          autoComplete="organization"
          maxLength={LIMITS.company}
          value={values.company}
          onChange={setValue('company')}
          error={form.errors.company}
        />
        <ChoiceListbox
          id={FIELD_IDS.projectType}
          name="projectType"
          label={FIELD_COPY.projectType.label}
          placeholder={FIELD_COPY.projectType.placeholder}
          options={PROJECT_TYPE_OPTIONS}
          required
          value={values.projectType}
          onChange={setValue('projectType')}
          error={form.errors.projectType}
        />
        <TextField
          id={FIELD_IDS.projectSummary}
          name="projectSummary"
          label={FIELD_COPY.projectSummary.label}
          placeholder={FIELD_COPY.projectSummary.placeholder}
          hint={FIELD_COPY.projectSummary.hint}
          required
          multiline
          maxLength={LIMITS.summary}
          value={values.projectSummary}
          onChange={setValue('projectSummary')}
          error={form.errors.projectSummary}
        />
        <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
          <TextField
            id={FIELD_IDS.budgetRange}
            name="budgetRange"
            label={FIELD_COPY.budget.label}
            placeholder={FIELD_COPY.budget.placeholder}
            maxLength={LIMITS.short}
            value={values.budgetRange}
            onChange={setValue('budgetRange')}
            error={form.errors.budgetRange}
          />
          <TextField
            id={FIELD_IDS.timeline}
            name="timeline"
            label={FIELD_COPY.timeline.label}
            placeholder={FIELD_COPY.timeline.placeholder}
            maxLength={LIMITS.short}
            value={values.timeline}
            onChange={setValue('timeline')}
            error={form.errors.timeline}
          />
        </div>
        <ChoiceListbox
          id={FIELD_IDS.referralSource}
          name="referralSource"
          label={FIELD_COPY.referral.label}
          placeholder={FIELD_COPY.referral.placeholder}
          options={REFERRAL_OPTIONS}
          value={values.referralSource}
          onChange={setValue('referralSource')}
          error={form.errors.referralSource}
        />
      </div>
      {form.status === 'error' ? <FormNotice message={form.message} /> : null}
      <FormSubmit label={QUOTE_PAGE.submit} busy={busy} />
    </form>
  )
}
