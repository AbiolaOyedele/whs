'use client'

import { CONTACT_PAGE, ERRORS, FIELD_COPY, LIMITS } from '@v2/content/forms'
import { FormSubmit } from './FormSubmit'
import { NotConnectedNotice } from './NotConnectedNotice'
import { TextField } from './TextField'
import { useCheckedForm } from './useCheckedForm'
import { checkEmail, checkMessage, checkName, checkPhone, onlyProblems, type FormValues } from './validation'

type ContactField = 'firstName' | 'lastName' | 'email' | 'phone' | 'message'

const ID = 'contact-page'
const FIELD_IDS: Record<ContactField, string> = {
  firstName: `${ID}-firstName`,
  lastName: `${ID}-lastName`,
  email: `${ID}-email`,
  phone: `${ID}-phone`,
  message: `${ID}-message`,
}

function validate(values: FormValues<ContactField>) {
  return onlyProblems<ContactField>({
    firstName: checkName(values.firstName, ERRORS.firstName),
    lastName: checkName(values.lastName, ERRORS.lastName),
    email: checkEmail(values.email),
    phone: checkPhone(values.phone),
    message: checkMessage(values.message, true),
  })
}

/** Name, email, optional phone and a message, laid out like the reference contact form. */
export function ContactForm() {
  const form = useCheckedForm<ContactField>(
    { firstName: '', lastName: '', email: '', phone: '', message: '' },
    validate,
    FIELD_IDS,
  )

  return (
    <form noValidate onSubmit={form.onSubmit} className="anim-fade-slide-in flex flex-col gap-5">
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
          value={form.values.message}
          onChange={form.setValue('message')}
          error={form.errors.message}
        />
      </div>
      {form.status === 'not-connected' ? <NotConnectedNotice /> : null}
      <FormSubmit label={CONTACT_PAGE.submit} />
    </form>
  )
}
