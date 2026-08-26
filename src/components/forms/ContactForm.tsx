/** Contact form. Succeeds inline — there is no separate thank-you route. */
import { useState } from 'react'
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

export default function ContactForm() {
  const [state, setState] = useState<SubmitState>(IDLE)

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setState({ ...IDLE, status: 'submitting' })
    const result = await postForm('/api/v1/contact', new FormData(form))
    setState(result)
    if (result.status === 'success') form.reset()
  }

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-medium">Message sent</h2>
        <p className="mt-2 text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Honeypot />

      <Field label="Your name" name="name" required error={state.fieldErrors['name']}>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </Field>

      <Field label="Work email" name="email" required error={state.fieldErrors['email']}>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </Field>

      <Field label="Phone" name="phone" error={state.fieldErrors['phone']}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
      </Field>

      <Field
        label="Tell us about your project"
        name="projectDetails"
        required
        error={state.fieldErrors['projectDetails']}
        hint="What you are running now, and what is not working about it."
      >
        <textarea id="projectDetails" name="projectDetails" required className={textareaClass} />
      </Field>

      <Field
        label="How did you hear about us?"
        name="referralSource"
        error={state.fieldErrors['referralSource']}
      >
        <input id="referralSource" name="referralSource" type="text" className={inputClass} />
      </Field>

      <FormStatus state={state} />

      <SubmitButton busy={state.status === 'submitting'}>Send it over</SubmitButton>

      <p className="text-xs text-muted-foreground">
        We use what you send here to reply to your enquiry, nothing else. See our{' '}
        <a href="/legal/privacy-policy" className="underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}
