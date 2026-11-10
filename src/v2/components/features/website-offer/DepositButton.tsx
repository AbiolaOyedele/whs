'use client'

import { useId, useState, type FormEvent } from 'react'
import { Button } from '@v2/components/ui/Button'
import { FormNotice } from '@v2/components/features/forms/FormNotice'
import { FormSubmit } from '@v2/components/features/forms/FormSubmit'
import { TextField } from '@v2/components/features/forms/TextField'
import { checkEmail } from '@v2/components/features/forms/validation'
import { formatNaira } from '@v2/components/features/pricing/money'
import { ENDPOINTS, FORM_COPY } from '@v2/content/forms'
import { WEBSITE_OFFER, depositKobo, offerPlan, type WebsiteOfferTier } from '@v2/content/website-offer'

interface DepositButtonProps {
  tier: WebsiteOfferTier
  /** The recommended plan: pink, like its card's tab. */
  featured: boolean
}

const COPY = WEBSITE_OFFER.deposit

/** Asks the server for a Paystack checkout link. The amount is set there, from the tier. */
async function startDeposit(tier: WebsiteOfferTier, email: string): Promise<{ url: string } | { error: string }> {
  let response: Response
  try {
    response = await fetch(ENDPOINTS.websiteDeposit, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, email }),
    })
  } catch {
    return { error: FORM_COPY.offline }
  }
  const payload = (await response.json().catch(() => null)) as { url?: unknown; error?: { message?: unknown } } | null
  if (response.ok && typeof payload?.url === 'string') return { url: payload.url }
  const message = payload?.error?.message
  return { error: typeof message === 'string' ? message : FORM_COPY.failed }
}

/**
 * The pay button on a price card. Paystack needs an email to start a
 * payment, so the first tap opens one email field in place; sending it opens
 * Paystack's checkout, which returns to /72-hour-website/paid.
 */
export function DepositButton({ tier, featured }: DepositButtonProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)
  const amount = formatNaira(depositKobo(offerPlan(tier)))

  if (!open) {
    return (
      <Button
        label={COPY.pay(amount)}
        variant={featured ? 'pink' : 'navy'}
        className="w-full"
        ariaExpanded={false}
        onClick={() => setOpen(true)}
      />
    )
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const problem = checkEmail(email)
    setFieldError(problem)
    if (problem) {
      document.getElementById(`${id}-email`)?.focus()
      return
    }
    setBusy(true)
    setFailure('')
    const result = await startDeposit(tier, email.trim())
    if ('url' in result) {
      // Stays busy: the page is about to change.
      window.location.assign(result.url)
      return
    }
    setFailure(result.error)
    setBusy(false)
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-busy={busy} className="anim-fade-slide-in flex w-full flex-col gap-5">
      <TextField
        id={`${id}-email`}
        name="email"
        type="email"
        label={COPY.emailLabel}
        placeholder={COPY.emailPlaceholder}
        hint={COPY.emailHint}
        autoComplete="email"
        required
        value={email}
        onChange={(value) => {
          setEmail(value)
          if (fieldError) setFieldError(checkEmail(value))
        }}
        error={fieldError}
      />
      {failure ? <FormNotice message={failure} /> : null}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <FormSubmit label={`${COPY.continue}: ${amount}`} busy={busy} privacyNote={false} />
        <button
          type="button"
          className="text-body-md min-h-11 text-navy-900 underline underline-offset-4"
          onClick={() => {
            setOpen(false)
            setFailure('')
            setFieldError(undefined)
          }}
        >
          {COPY.cancel}
        </button>
      </div>
    </form>
  )
}
