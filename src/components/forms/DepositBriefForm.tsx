/**
 * The "tell us what you want" option on the /72-hour-website payment confirmation
 * page. One field, tied to the payment reference — the email and tier are
 * already on the deposit record, so nothing else needs asking again.
 */
import { useState } from 'react'
import {
  Field,
  FormStatus,
  Honeypot,
  IDLE,
  SubmitButton,
  underlineTextareaClass,
  postForm,
  type SubmitState,
} from './form-primitives'

export default function DepositBriefForm({ reference }: { reference: string }) {
  const [state, setState] = useState<SubmitState>(IDLE)
  const [brief, setBrief] = useState('')

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setState({ ...IDLE, status: 'submitting' })
    const result = await postForm('/api/v1/website-deposit/brief', new FormData(form))
    setState(result)
    if (result.status === 'success') {
      form.reset()
      setBrief('')
    }
  }

  if (state.status === 'success') {
    return (
      <div>
        <h3 className="text-xl font-medium">Got it</h3>
        <p className="mt-2 text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Honeypot />
      <input type="hidden" name="reference" value={reference} />

      <Field
        label="What do you want on the site?"
        name="brief"
        required
        variant="underline"
        error={state.fieldErrors['brief']}
      >
        <textarea
          id="brief"
          name="brief"
          required
          placeholder="Pages, what you sell, anything you already have ready"
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          className={underlineTextareaClass}
        />
      </Field>

      <FormStatus state={state} />

      <div>
        <SubmitButton busy={state.status === 'submitting'} tone="accent" size="lg">
          Send it over
        </SubmitButton>
      </div>
    </form>
  )
}
