'use client'

import { ENDPOINTS, LIMITS } from '@v2/content/forms'
import { WEBSITE_OFFER } from '@v2/content/website-offer'
import { FormNotice } from '@v2/components/features/forms/FormNotice'
import { FormSubmit } from '@v2/components/features/forms/FormSubmit'
import { FormSuccess } from '@v2/components/features/forms/FormSuccess'
import { HONEYPOT_FIELD, Honeypot, honeypotValue } from '@v2/components/features/forms/Honeypot'
import { postForm } from '@v2/components/features/forms/submit'
import { TextField } from '@v2/components/features/forms/TextField'
import { useCheckedForm } from '@v2/components/features/forms/useCheckedForm'
import { checkName, onlyProblems, type FormValues } from '@v2/components/features/forms/validation'

type LeadField = 'name' | 'businessName' | 'instagram'

const ID = 'website-offer-lead'
const FIELD_IDS: Record<LeadField, string> = {
  name: `${ID}-name`,
  businessName: `${ID}-businessName`,
  instagram: `${ID}-instagram`,
}

const EMPTY: FormValues<LeadField> = { name: '', businessName: '', instagram: '' }
const COPY = WEBSITE_OFFER.lead

function validate(values: FormValues<LeadField>) {
  return onlyProblems<LeadField>({
    name: checkName(values.name, COPY.errors.name),
    businessName: checkName(values.businessName, COPY.errors.businessName),
    instagram: checkName(values.instagram, COPY.errors.instagram),
  })
}

/** Sends to POST /api/v1/website-lead, which emails the studio. */
function send(values: FormValues<LeadField>, form: HTMLFormElement) {
  return postForm(ENDPOINTS.websiteLead, {
    name: values.name.trim(),
    businessName: values.businessName.trim(),
    instagramHandle: values.instagram.trim(),
    [HONEYPOT_FIELD]: honeypotValue(form),
  })
}

/** Name, business and Instagram handle, so the studio can say which plan fits. */
export function WebsiteLeadForm() {
  const form = useCheckedForm<LeadField>(EMPTY, validate, FIELD_IDS, send)
  const busy = form.status === 'submitting'

  if (form.status === 'success') {
    return <FormSuccess title={COPY.successTitle} message={form.message} />
  }

  return (
    <form noValidate onSubmit={form.onSubmit} aria-busy={busy} className="flex flex-col gap-5">
      <Honeypot idPrefix={ID} />
      <TextField
        id={FIELD_IDS.name}
        name="name"
        label={COPY.fields.name.label}
        placeholder={COPY.fields.name.placeholder}
        autoComplete="name"
        required
        maxLength={LIMITS.name}
        value={form.values.name}
        onChange={form.setValue('name')}
        error={form.errors.name}
      />
      <TextField
        id={FIELD_IDS.businessName}
        name="businessName"
        label={COPY.fields.businessName.label}
        placeholder={COPY.fields.businessName.placeholder}
        autoComplete="organization"
        required
        maxLength={LIMITS.name}
        value={form.values.businessName}
        onChange={form.setValue('businessName')}
        error={form.errors.businessName}
      />
      <TextField
        id={FIELD_IDS.instagram}
        name="instagramHandle"
        label={COPY.fields.instagram.label}
        placeholder={COPY.fields.instagram.placeholder}
        autoComplete="off"
        required
        maxLength={60}
        value={form.values.instagram}
        onChange={form.setValue('instagram')}
        error={form.errors.instagram}
      />
      {form.status === 'error' ? <FormNotice message={form.message} /> : null}
      <FormSubmit label={COPY.submit} busy={busy} />
    </form>
  )
}
