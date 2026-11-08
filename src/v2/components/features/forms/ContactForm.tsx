'use client'

import { Button } from '@v2/components/ui/Button'
import { CONTACT_PAGE, ENDPOINTS, ERRORS, FIELD_COPY, LIMITS, REFERRAL_OPTIONS } from '@v2/content/forms'
import { ChoiceListbox } from './ChoiceListbox'
import { FormNotice } from './FormNotice'
import { FormSubmit } from './FormSubmit'
import { FormSuccess } from './FormSuccess'
import { HONEYPOT_FIELD, Honeypot, honeypotValue } from './Honeypot'
import { postForm } from './submit'
import { TextField } from './TextField'
import { useCheckedForm } from './useCheckedForm'
import { checkEmail, checkMessage, checkName, checkPhone, onlyProblems, type FormValues } from './validation'

type ContactField = 'firstName' | 'lastName' | 'email' | 'phone' | 'message' | 'referralSource'

const ID = 'contact-page'
const FIELD_IDS: Record<ContactField, string> = {
  firstName: `${ID}-firstName`,
  lastName: `${ID}-lastName`,
  email: `${ID}-email`,
  phone: `${ID}-phone`,
  message: `${ID}-message`,
  referralSource: `${ID}-referralSource`,
}

const EMPTY: FormValues<ContactField> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
  referralSource: '',
}

function validate(values: FormValues<ContactField>) {
  return onlyProblems<ContactField>({
    firstName: checkName(values.firstName, ERRORS.firstName),
    lastName: checkName(values.lastName, ERRORS.lastName),
    email: checkEmail(values.email),
    phone: checkPhone(values.phone),
    message: checkMessage(values.message, true),
    referralSource: undefined,
  })
}

/**
 * Sends to POST /api/v1/contact (src/pages/api/v1/contact.ts), which takes
 * `name`, `email`, `phone`, `projectDetails` and `referralSource` and emails
 * the studio. First and last name are joined into the one `name` it expects.
 */
function send(values: FormValues<ContactField>, form: HTMLFormElement) {
  return postForm(ENDPOINTS.contact, {
    name: `${values.firstName.trim()} ${values.lastName.trim()}`,
    email: values.email.trim(),
    phone: values.phone.trim(),
    projectDetails: values.message.trim(),
    referralSource: values.referralSource,
    [HONEYPOT_FIELD]: honeypotValue(form),
  })
}

/** Name, email, optional phone, a message and where they heard of us. */
export function ContactForm() {
  const form = useCheckedForm<ContactField>(EMPTY, validate, FIELD_IDS, send)
  const busy = form.status === 'submitting'

  if (form.status === 'success') {
    return (
      <FormSuccess title={CONTACT_PAGE.successTitle} message={form.message}>
        <Button label="Send another message" variant="pink" onClick={form.reset} />
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
            value={form.values.firstName}
            onChange={form.setValue('firstName')}
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
            value={form.values.lastName}
            onChange={form.setValue('lastName')}
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
            value={form.values.email}
            onChange={form.setValue('email')}
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
            value={form.values.phone}
            onChange={form.setValue('phone')}
            error={form.errors.phone}
          />
        </div>
        <TextField
          id={FIELD_IDS.message}
          name="message"
          label={FIELD_COPY.message.label}
          placeholder={FIELD_COPY.message.placeholder}
          required
          multiline
          maxLength={LIMITS.message}
          value={form.values.message}
          onChange={form.setValue('message')}
          error={form.errors.message}
        />
        <ChoiceListbox
          id={FIELD_IDS.referralSource}
          name="referralSource"
          label={FIELD_COPY.referral.label}
          placeholder={FIELD_COPY.referral.placeholder}
          options={REFERRAL_OPTIONS}
          value={form.values.referralSource}
          onChange={form.setValue('referralSource')}
          error={form.errors.referralSource}
        />
      </div>
      {form.status === 'error' ? <FormNotice message={form.message} /> : null}
      <FormSubmit label={CONTACT_PAGE.submit} busy={busy} />
    </form>
  )
}
