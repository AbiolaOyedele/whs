/** Single-field newsletter signup. */
import { useState } from 'react'
import {
  FormStatus,
  Honeypot,
  IDLE,
  inputClass,
  postForm,
  type SubmitState,
} from './form-primitives'

export default function NewsletterForm() {
  const [state, setState] = useState<SubmitState>(IDLE)

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setState({ ...IDLE, status: 'submitting' })
    const result = await postForm('/api/v1/newsletter', new FormData(form))
    setState(result)
    if (result.status === 'success') form.reset()
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <Honeypot />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={state.status === 'submitting'}
          className="wh-tap inline-flex items-center justify-center rounded-full bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {state.status === 'submitting' ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
      <FormStatus state={state} />
    </form>
  )
}
