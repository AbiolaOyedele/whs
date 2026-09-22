/**
 * Whole-quote templates, from inside the quote editor.
 *
 * Two jobs in one dialog, because they are two directions of the same thing:
 *
 *  - `use`: pour a saved template into this quote. It replaces the scope,
 *    packages, timeline, links and terms, and leaves the client, the project
 *    title, the link and the images alone. Nothing is written until the
 *    operator presses Save, exactly like an AI draft, so a wrong pick costs
 *    one click of Cancel.
 *  - `save`: keep this quote's body as a template, new or over an old one.
 */
import { useEffect, useState } from 'react'
import { Button, Select, StatusLine, TextArea, TextInput } from '../ui'
import { Modal } from '../Modal'
import { Icon } from '@/components/ui/icons'
import { describeTemplate, quoteToTemplateBody } from '@/lib/admin/template-apply'
import { cn } from '@/lib/utils'
import type { Quote } from '@/types/quote'
import type { QuoteTemplate } from '@/types/templates'
import { fetchRates, messageFrom, RateError } from './fx-client'

const NEW_TEMPLATE = '__new__'

interface Props {
  mode: 'use' | 'save' | null
  quote: Quote
  templates: QuoteTemplate[]
  onClose: () => void
  /** The operator confirmed; `rate` converts the template into the quote's currency. */
  onUse: (template: QuoteTemplate, rate: number, rateNotes: string[]) => void
  onSaved: (template: QuoteTemplate, replaced: boolean) => void
}

export function QuoteTemplateDialog({ mode, quote, templates, onClose, onUse, onSaved }: Props) {
  const [picked, setPicked] = useState<string | null>(null)
  const [target, setTarget] = useState(NEW_TEMPLATE)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mode) return
    setPicked(null)
    setTarget(NEW_TEMPLATE)
    setName(quote.projectTitle)
    setDescription('')
    setError(null)
    /* Seeded from the quote as it is when the dialog opens. Depending on the
       quote as well would reset the name on every keystroke behind the dialog. */
  }, [mode])

  /* Choosing an existing template to replace brings its name and blurb with it,
     so replacing does not quietly rename it to the project title. */
  const chooseTarget = (value: string): void => {
    setTarget(value)
    const existing = templates.find((entry) => entry.id === value)
    setName(existing ? existing.name : quote.projectTitle)
    setDescription(existing ? existing.description : '')
  }

  const use = async (): Promise<void> => {
    const template = templates.find((entry) => entry.id === picked)
    if (!template) return
    setBusy(true)
    setError(null)
    try {
      const { rates, notes } = await fetchRates([template.currency], quote.currency)
      onUse(template, rates.get(template.currency) ?? 1, notes)
      onClose()
    } catch (cause) {
      setError(cause instanceof RateError ? cause.message : 'That did not work. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const save = async (): Promise<void> => {
    setBusy(true)
    setError(null)
    const replacing = target !== NEW_TEMPLATE
    try {
      const response = await fetch(
        replacing
          ? `/api/v1/admin/templates/quotes?id=${encodeURIComponent(target)}`
          : '/api/v1/admin/templates/quotes',
        {
          method: replacing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            currency: quote.currency,
            body: quoteToTemplateBody(quote),
          }),
        }
      )
      if (!response.ok) {
        setError(await messageFrom(response, 'That template did not save.'))
        return
      }
      const { template } = (await response.json()) as { template: QuoteTemplate }
      onSaved(template, replacing)
      onClose()
    } catch {
      setError('We could not reach the server. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const footer = (
    <div className="flex flex-col gap-3">
      {error && <StatusLine tone="error">{error}</StatusLine>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        {mode === 'use' && templates.length > 0 && (
          <Button tone="primary" onClick={() => void use()} disabled={busy || picked === null}>
            {busy ? 'Applying…' : 'Use template'}
          </Button>
        )}
        {mode === 'save' && (
          <Button tone="primary" onClick={() => void save()} disabled={busy || !name.trim()}>
            {busy ? 'Saving…' : target === NEW_TEMPLATE ? 'Save template' : 'Replace template'}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Modal
      open={mode !== null}
      title={mode === 'save' ? 'Save as a template' : 'Start from a template'}
      description={
        mode === 'save'
          ? 'Keeps the scope, packages, timeline, links and terms. The client and project title stay with this quote.'
          : 'Replaces the scope, packages, timeline, links and terms on this quote. The client, project title and images stay. Nothing is saved until you press Save.'
      }
      onClose={onClose}
      footer={footer}
    >
      {mode === 'use' &&
        (templates.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-base text-muted-foreground">
              No quote templates yet. Build a quote you send often, then choose Save as template.
            </p>
            <a
              href="/admin/templates"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-base transition-colors hover:border-foreground"
            >
              Open templates
              <Icon name="arrowRight" className="size-4" />
            </a>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Templates">
            {templates.map((template) => {
              const on = picked === template.id
              return (
                <li key={template.id}>
                  <label
                    className={cn(
                      'flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors',
                      on ? 'border-foreground bg-muted' : 'border-border hover:border-foreground/40'
                    )}
                  >
                    <input
                      type="radio"
                      name="quote-template"
                      checked={on}
                      aria-label={template.name}
                      onChange={() => setPicked(template.id)}
                      className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-base leading-snug break-words">
                        {template.name}
                      </span>
                      {template.description && (
                        <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">
                          {template.description}
                        </span>
                      )}
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {describeTemplate(template.body)}
                        {template.currency !== quote.currency &&
                          `. Saved in ${template.currency}, converted to ${quote.currency}`}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        ))}

      {mode === 'save' && (
        <div className="flex flex-col gap-5">
          {templates.length > 0 && (
            <Select
              label="Save to"
              value={target}
              options={[
                { value: NEW_TEMPLATE, label: 'A new template' },
                ...templates.map((template) => ({
                  value: template.id,
                  label: `Replace "${template.name}"`,
                })),
              ]}
              onChange={chooseTarget}
            />
          )}
          <TextInput
            label="Template name"
            required
            maxLength={120}
            value={name}
            onChange={setName}
          />
          <TextArea
            label="What it is for"
            rows={2}
            maxLength={600}
            hint="Only you see this. It helps you pick the right one later."
            value={description}
            onChange={setDescription}
          />
        </div>
      )}
    </Modal>
  )
}
