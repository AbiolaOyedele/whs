'use client'

import { CHANNEL_OPTIONS, DEMO_PAGE, ERRORS, FIELD_COPY, LIMITS, SELLS_OPTIONS } from '@v2/content/forms'
import { ChoiceListbox } from './ChoiceListbox'
import { FormSubmit } from './FormSubmit'
import { NotConnectedNotice } from './NotConnectedNotice'
import { TextField } from './TextField'
import { useCheckedForm } from './useCheckedForm'
import { checkChoice, checkEmail, checkMessage, checkName, onlyProblems, type FormValues } from './validation'

type DemoField = 'firstName' | 'lastName' | 'email' | 'sells' | 'channel' | 'message'

const ID = 'demo-page'
const FIELD_IDS: Record<DemoField, string> = {
  firstName: `${ID}-firstName`,
  lastName: `${ID}-lastName`,
  email: `${ID}-email`,
  sells: `${ID}-sells`,
  channel: `${ID}-channel`,
  message: `${ID}-message`,
}

const SELLS_VALUES = SELLS_OPTIONS.map((option) => option.value)
const CHANNEL_VALUES = CHANNEL_OPTIONS.map((option) => option.value)

function validate(values: FormValues<DemoField>) {
  return onlyProblems<DemoField>({
    firstName: checkName(values.firstName, ERRORS.firstName),
    lastName: checkName(values.lastName, ERRORS.lastName),
    email: checkEmail(values.email),
    sells: checkChoice(values.sells, SELLS_VALUES, ERRORS.sells),
    channel: checkChoice(values.channel, CHANNEL_VALUES, ERRORS.channel),
    message: checkMessage(values.message, false),
  })
}

/** "Request a quote": who you are, what you need and how you heard about us. Same layout as the reference demo form. */
export function DemoForm() {
  const form = useCheckedForm<DemoField>(
    { firstName: '', lastName: '', email: '', sells: '', channel: '', message: '' },
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
        <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
          <ChoiceListbox
            id={FIELD_IDS.sells}
            name="sells"
            label={FIELD_COPY.sells.label}
            placeholder={FIELD_COPY.sells.placeholder}
            options={SELLS_OPTIONS}
            required
            value={form.values.sells}
            onChange={form.setValue('sells')}
            error={form.errors.sells}
          />
          <ChoiceListbox
            id={FIELD_IDS.channel}
            name="channel"
            label={FIELD_COPY.channel.label}
            placeholder={FIELD_COPY.channel.placeholder}
            options={CHANNEL_OPTIONS}
            required
            value={form.values.channel}
            onChange={form.setValue('channel')}
            error={form.errors.channel}
          />
        </div>
        <TextField
          id={FIELD_IDS.message}
          name="message"
          label={FIELD_COPY.demoMessage.label}
          placeholder={FIELD_COPY.demoMessage.placeholder}
          multiline
          value={form.values.message}
          onChange={form.setValue('message')}
          error={form.errors.message}
        />
      </div>
      {form.status === 'not-connected' ? <NotConnectedNotice /> : null}
      <FormSubmit label={DEMO_PAGE.submit} />
    </form>
  )
}
