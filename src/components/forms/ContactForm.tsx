/**
 * Contact form. Succeeds inline — there is no separate thank-you route.
 *
 * Fields are controlled so the agent paste-fill flow (see `applyInquiryBlock`)
 * can populate them: an AI agent drafts a brief following /agent/prompt.md,
 * the visitor pastes the result anywhere on this page, and the form fills
 * itself. Pasted text is inserted as field values only — never as markup — and
 * everything still goes through the same server-side validation as a typed
 * submission.
 */
import { useEffect, useRef, useState } from 'react'
import {
  Field,
  FormStatus,
  Honeypot,
  IDLE,
  SubmitButton,
  underlineInputClass,
  underlineTextareaClass,
  postForm,
  type SubmitState,
} from './form-primitives'
import { INQUIRY_MARKER, parseInquiryBlock } from '@/lib/agent-inquiry'

interface Values {
  name: string
  email: string
  phone: string
  projectDetails: string
  referralSource: string
}

const EMPTY: Values = { name: '', email: '', phone: '', projectDetails: '', referralSource: '' }

export default function ContactForm() {
  const [state, setState] = useState<SubmitState>(IDLE)
  const [values, setValues] = useState<Values>(EMPTY)
  const [pasteNotice, setPasteNotice] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const set =
    (key: keyof Values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((current) => ({ ...current, [key]: event.target.value }))

  /* Page-level paste listener for the agent flow. Ignores every paste that is
     not one of our inquiry blocks, so normal copy-paste into a field is
     untouched. */
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text/plain')
      if (!text || !text.includes(INQUIRY_MARKER)) return
      const parsed = parseInquiryBlock(text)
      if (!parsed) return
      event.preventDefault()
      setValues((current) => ({ ...current, ...parsed }))
      setPasteNotice('We filled the form in from your agent’s draft. Check it over, then send it.')
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [])

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setState({ ...IDLE, status: 'submitting' })
    const result = await postForm('/api/v1/contact', new FormData(form))
    setState(result)
    if (result.status === 'success') {
      form.reset()
      setValues(EMPTY)
      setPasteNotice('')
    }
  }

  if (state.status === 'success') {
    return (
      <div>
        <h2 className="text-xl font-medium">Message sent</h2>
        <p className="mt-2 text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Honeypot />

      {pasteNotice && (
        <p role="status" aria-live="polite" className="rounded-lg bg-muted px-4 py-3 text-sm">
          {pasteNotice}
        </p>
      )}

      <Field
        label="Your name"
        name="name"
        required
        variant="underline"
        error={state.fieldErrors['name']}
      >
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="First and last name"
          value={values.name}
          onChange={set('name')}
          className={underlineInputClass}
        />
      </Field>

      <Field
        label="Work email"
        name="email"
        required
        variant="underline"
        error={state.fieldErrors['email']}
      >
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={values.email}
          onChange={set('email')}
          className={underlineInputClass}
        />
      </Field>

      <Field label="Phone" name="phone" variant="underline" error={state.fieldErrors['phone']}>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="With your country code"
          value={values.phone}
          onChange={set('phone')}
          className={underlineInputClass}
        />
      </Field>

      <Field
        label="Tell us about your project"
        name="projectDetails"
        required
        variant="underline"
        error={state.fieldErrors['projectDetails']}
      >
        <textarea
          id="projectDetails"
          name="projectDetails"
          required
          placeholder="What is taking up your team’s time?"
          value={values.projectDetails}
          onChange={set('projectDetails')}
          className={underlineTextareaClass}
        />
      </Field>

      <Field
        label="How did you hear about us?"
        name="referralSource"
        variant="underline"
        error={state.fieldErrors['referralSource']}
      >
        <input
          id="referralSource"
          name="referralSource"
          type="text"
          placeholder="Search, a referral, an article…"
          value={values.referralSource}
          onChange={set('referralSource')}
          className={underlineInputClass}
        />
      </Field>

      <FormStatus state={state} />

      <div className="pt-2">
        <SubmitButton busy={state.status === 'submitting'} tone="accent" size="lg">
          Send it over
        </SubmitButton>
      </div>

      <p className="text-sm text-muted-foreground">
        We use what you send here to reply to your enquiry, nothing else. See our{' '}
        <a href="/legal/privacy-policy" className="underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}
