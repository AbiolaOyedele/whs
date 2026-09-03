/**
 * AI drafting.
 *
 * Conversational in, structured out: you describe the job the way you would to
 * a colleague, and get back a breakdown, a timeline and draft terms.
 *
 * Two deliberate constraints:
 *
 *  - Nothing is saved. The draft lands in the editor as unsaved changes, so
 *    there is always a person between a model's guess at a price and a document
 *    a client reads.
 *  - Applying a draft REPLACES the cost breakdown and the timeline. It is a
 *    rewrite, not a merge, because merging two pricing structures silently
 *    produces a third that neither the model nor the operator intended. The
 *    warning below says so before the click, not after.
 */
import { useState } from 'react'
import { Button, Panel, Select, StatusLine, TextArea } from '../ui'
import { AI_PROVIDER_LABELS, type AiProvider, type QuoteDraft } from '@/lib/ai/types'

interface Props {
  quoteId: string
  providers: AiProvider[]
  onApply: (draft: QuoteDraft) => void
}

export function AiDraftPanel({ quoteId, providers, onApply }: Props) {
  const [brief, setBrief] = useState('')
  const [provider, setProvider] = useState<AiProvider>(providers[0] ?? 'claude')
  const [includeExisting, setIncludeExisting] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ draft: QuoteDraft; model: string } | null>(null)
  const [answers, setAnswers] = useState('')

  if (providers.length === 0) {
    return (
      <Panel title="Draft with AI">
        <p className="text-base text-muted-foreground">
          No AI provider is connected. Add an Anthropic or Gemini API key to enable drafting. The
          rest of the quote editor works exactly as normal without it.
        </p>
      </Panel>
    )
  }

  const generate = async (extraContext = '') => {
    setBusy(true)
    setError(null)

    /*
     * Answers are appended to the brief rather than sent as a second turn.
     * The endpoint is stateless by design — one brief in, one draft out — and
     * threading a conversation through it would mean storing partial drafts
     * server-side for something the operator can already see and edit.
     */
    const fullBrief = extraContext.trim()
      ? `${brief}\n\nAnswers to your questions:\n${extraContext.trim()}`
      : brief

    try {
      const response = await fetch(`/api/v1/admin/quotes/${quoteId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: fullBrief, provider, includeExisting }),
      })

      const body: unknown = await response.json()

      if (!response.ok) {
        setError(
          (body as { error?: { message?: string } }).error?.message ??
            'The drafter could not be reached. Try again.'
        )
        return
      }

      const payload = body as { draft: QuoteDraft; model: string }
      setResult({ draft: payload.draft, model: payload.model })
      setAnswers('')
    } catch {
      setError('We could not reach the server. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const redraftWithAnswers = () => void generate(answers)

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Draft with AI"
        description="Describe the job. You get a breakdown, a timeline and draft terms to edit."
      >
        <div className="flex flex-col gap-5">
          <TextArea
            label="Tell it about the project"
            required
            rows={9}
            placeholder="Ops team of six spends about two days a week copying order data between a supplier portal and a spreadsheet, then emailing status updates. They want one screen that pulls both together and sends the updates itself. Roughly eight weeks. Our day rate is 650."
            hint="Include anything that affects the price: rates, budget, deadline, how many screens, what already exists."
            value={brief}
            onChange={setBrief}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Model"
              value={provider}
              options={providers.map((entry) => ({
                value: entry,
                label: AI_PROVIDER_LABELS[entry],
              }))}
              onChange={(value) => setProvider(value as AiProvider)}
            />

            <label className="flex min-h-11 cursor-pointer items-end gap-3 pb-2 text-base">
              <input
                type="checkbox"
                checked={includeExisting}
                onChange={(event) => setIncludeExisting(event.target.checked)}
                className="mb-1 size-5 shrink-0 accent-[var(--accent)]"
              />
              Build on what is already in this quote
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              tone="primary"
              onClick={() => void generate()}
              disabled={busy || brief.trim().length < 20}
            >
              {busy ? 'Drafting…' : 'Draft it'}
            </Button>
            {error && <StatusLine tone="error">{error}</StatusLine>}
          </div>
        </div>
      </Panel>

      {result && (
        <Panel
          title="Proposed draft"
          description={`From ${result.model}. Nothing is saved until you apply it and save the quote.`}
        >
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="mb-1 font-display text-lg">{result.draft.projectTitle}</h3>
              <p className="text-base whitespace-pre-line text-muted-foreground">
                {result.draft.projectSummary}
              </p>
            </div>

            {result.draft.options.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm text-muted-foreground">
                  Packages and add-ons ({result.draft.options.length})
                </h4>
                <ul className="flex flex-col gap-2">
                  {result.draft.options.map((option) => (
                    <li
                      key={option.key}
                      className="flex items-baseline justify-between gap-4 border-b border-border pb-2 text-base"
                    >
                      <span>
                        {option.title}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {option.kind === 'package' ? 'package' : 'add-on'}
                          {option.isDefault && ' · pre-selected'}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-sm">
                        {
                          result.draft.lineItems.filter((item) => item.optionKey === option.key)
                            .length
                        }{' '}
                        items
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm text-muted-foreground">
                {result.draft.options.length > 0
                  ? `Base scope (${
                      result.draft.lineItems.filter((item) => item.optionKey === null).length
                    } of ${result.draft.lineItems.length})`
                  : `Cost breakdown (${result.draft.lineItems.length})`}
              </h4>
              <ul className="flex flex-col gap-2">
                {result.draft.lineItems.map((item, index) => (
                  <li
                    key={`${item.title}-${index}`}
                    className="flex items-baseline justify-between gap-4 border-b border-border pb-2 text-base"
                  >
                    <span>
                      {item.title}
                      {item.isOptional && (
                        <span className="ml-2 text-sm text-muted-foreground">optional</span>
                      )}
                      {item.optionKey && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          in{' '}
                          {result.draft.options.find((o) => o.key === item.optionKey)?.title ??
                            item.optionKey}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono">
                      {item.quantity} × {item.unitPrice.toLocaleString('en-GB')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {result.draft.phases.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm text-muted-foreground">
                  Timeline ({result.draft.phases.length} phases)
                </h4>
                <ol className="flex flex-col gap-1 text-base">
                  {result.draft.phases.map((phase, index) => (
                    <li key={`${phase.title}-${index}`}>
                      {phase.title}
                      {phase.durationLabel && (
                        <span className="text-muted-foreground"> — {phase.durationLabel}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {result.draft.questions.length > 0 && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
                <h4 className="mb-2 font-display text-base">
                  It could not price these without an answer
                </h4>
                <ul className="mb-4 flex list-disc flex-col gap-1 pl-5 text-base">
                  {result.draft.questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-muted-foreground">
                    Answer them here and draft again. Your answers are added to the brief.
                  </span>
                  <textarea
                    rows={4}
                    value={answers}
                    onChange={(event) => setAnswers(event.target.value)}
                    placeholder="Day rate is 650. Budget ceiling around 30k. They have a staging environment already."
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus-visible:border-foreground"
                  />
                </label>

                <div className="mt-3">
                  <Button
                    tone="primary"
                    onClick={redraftWithAnswers}
                    disabled={busy || answers.trim().length === 0}
                  >
                    {busy ? 'Drafting…' : 'Answer and draft again'}
                  </Button>
                </div>
              </div>
            )}

            {result.draft.assumptions.length > 0 && (
              <div className="rounded-2xl border border-accent bg-accent/10 p-4">
                <h4 className="mb-2 font-display text-base">
                  Check these before you send anything
                </h4>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-base">
                  {result.draft.assumptions.map((assumption, index) => (
                    <li key={index}>{assumption}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">
                  The client never sees this list.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-muted p-4">
              <p className="mb-3 text-base">
                Applying this replaces the cost breakdown and the timeline in the editor. Your
                client details, link and access code are untouched, and nothing saves until you
                press save.
              </p>
              <Button tone="primary" onClick={() => onApply(result.draft)}>
                Apply to the quote
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}
