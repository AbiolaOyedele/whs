/**
 * The quote editor.
 *
 * Organised as tabs rather than one long scroll. A quote has seven distinct
 * concerns — who it is for, what it costs, how long it takes, what it looks
 * like, the terms, how it is shared, and the AI drafter — and stacking them
 * vertically means the operator scrolls past six to reach the seventh every
 * time. Tabs keep each concern whole and reachable in one action.
 *
 * State lives in `useQuoteEditor`. This component owns presentation, the save
 * round trip, and nothing else.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  CollapsibleRow,
  Panel,
  Select,
  StatusLine,
  TextArea,
  TextInput,
} from '../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import { MoneyInput } from './MoneyInput'
import { LineItemList } from './LineItemList'
import { QuoteTotals } from './QuoteTotals'
import { AiDraftPanel } from './AiDraftPanel'
import { ImageUploader } from './ImageUploader'
import {
  BLANK_LINE_ITEM,
  BLANK_OPTION,
  BLANK_PHASE,
  BLANK_REFERENCE,
  useQuoteEditor,
} from './useQuoteEditor'
import {
  labelForPath,
  readFieldErrors,
  revealField,
  tabForPath,
  type FieldErrors,
} from './field-errors'
import { formatMoney, optionTotalMinor } from '@/lib/admin/money'
import { cn } from '@/lib/utils'

/**
 * The host of a reference link, for the collapsed row summary.
 *
 * `new URL` throws on anything that is not yet a URL, and this runs on every
 * keystroke while the operator types one — so an unguarded call blanks the
 * whole editor somewhere around "htt".
 */
function hostnameOf(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

const OPTION_KINDS = [
  { value: 'package', label: 'Package — client picks one' },
  { value: 'addon', label: 'Add-on — client ticks any' },
] as const
import { CURRENCIES, QUOTE_STATUSES, QUOTE_STATUS_LABELS, type Quote } from '@/types/quote'
import type { AiProvider } from '@/lib/ai/types'

const TABS = [
  { id: 'client', label: 'Client' },
  { id: 'cost', label: 'Scope & cost' },
  { id: 'packages', label: 'Packages' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'references', label: 'References' },
  { id: 'images', label: 'Images' },
  { id: 'terms', label: 'Terms' },
  { id: 'sharing', label: 'Sharing' },
  { id: 'ai', label: 'Draft with AI' },
  { id: 'preview', label: 'Preview' },
] as const

/** Widths the preview pane can be pinned to. Mobile first, as everywhere. */
const PREVIEW_WIDTHS = [
  { id: 'mobile', label: 'Phone', width: 375 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'desktop', label: 'Desktop', width: 0 },
] as const

type TabId = (typeof TABS)[number]['id']

interface Props {
  initialQuote: Quote
  siteUrl: string
  aiProviders: AiProvider[]
  imagesEnabled: boolean
}

export default function QuoteEditor({ initialQuote, siteUrl, aiProviders, imagesEnabled }: Props) {
  const { state, totals, setField, rows, reset, dispatch } = useQuoteEditor(initialQuote)
  const { quote, dirty } = state

  /* What each option adds, for the collapsed row summary. Derived from the
     line items rather than stored, so it cannot disagree with the client's
     copy of the same figure. */
  const optionTotals = useMemo(
    () =>
      new Map(
        quote.options.map((option) => [option.id, optionTotalMinor(option.id, quote.lineItems)])
      ),
    [quote.options, quote.lineItems]
  )

  const [tab, setTab] = useState<TabId>('client')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    tone: 'idle' | 'error' | 'success'
    text: string
  } | null>(null)
  const [newPin, setNewPin] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [previewWidth, setPreviewWidth] = useState<number>(0)
  const [previewKey, setPreviewKey] = useState(0)
  const [currentPin, setCurrentPin] = useState<string | null>(null)
  const [pinState, setPinState] = useState<'hidden' | 'loading' | 'shown' | 'unavailable'>('hidden')
  const [confirmingReissue, setConfirmingReissue] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const shareUrl = `${siteUrl.replace(/\/$/, '')}/quote/${quote.slug}`

  /* Warn before losing unsaved work. The editor holds a document someone is
     part-way through pricing; a stray back gesture should not discard it. */
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const save = useCallback(async () => {
    setSaving(true)
    setMessage(null)
    setFieldErrors({})

    try {
      const response = await fetch(`/api/v1/admin/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: quote.slug,
          status: quote.status,
          clientName: quote.clientName,
          clientCompany: quote.clientCompany ?? '',
          clientEmail: quote.clientEmail ?? '',
          clientRole: quote.clientRole ?? '',
          projectTitle: quote.projectTitle,
          projectSummary: quote.projectSummary,
          introNote: quote.introNote,
          currency: quote.currency,
          discountMinor: quote.discountMinor,
          taxRateBp: quote.taxRateBp,
          depositPercent: quote.depositPercent,
          paymentTerms: quote.paymentTerms,
          terms: quote.terms,
          validUntil: quote.validUntil ?? '',
          lineItems: quote.lineItems.map(({ id, position, ...rest }) => {
            void id
            void position
            return rest
          }),
          /* `id` is deliberately KEPT. Line items point at options by id, and
             for an option added in this session that id exists only here — the
             repository writes the options first and remaps. Stripping it, as
             every other collection does, would detach every line from its
             option on the first save. */
          options: quote.options.map(({ position, ...rest }) => {
            void position
            return rest
          }),
          phases: quote.phases.map(({ id, position, ...rest }) => {
            void id
            void position
            return rest
          }),
          references: quote.references.map(({ id, position, ...rest }) => {
            void id
            void position
            return rest
          }),
          images: quote.images.map(({ id, position, ...rest }) => {
            void id
            void position
            return rest
          }),
        }),
      })

      const body: unknown = await response.json()

      if (!response.ok) {
        const error = (body as { error?: { message?: string } }).error
        const fields = readFieldErrors(body)
        setFieldErrors(fields)

        /*
         * Take the operator to the problem rather than describing it.
         *
         * A form with eight tabs and up to forty line items can hide a rejected
         * field entirely: the banner says something is wrong and the tab it is
         * on looks fine. So the first failing path decides the tab, and the
         * control is scrolled to and focused once that tab has rendered.
         */
        const firstPath = Object.keys(fields)[0]
        if (firstPath) {
          setTab(tabForPath(firstPath))
          revealField(firstPath)
        }

        setMessage({
          tone: 'error',
          text: firstPath
            ? `${labelForPath(firstPath)}: ${fields[firstPath]}`
            : (error?.message ?? 'That did not save. Try again.'),
        })
        return
      }

      // Reload from the response rather than trusting local state: the server
      // renumbers positions and mints real ids for new rows.
      reset((body as { quote: Quote }).quote)
      setFieldErrors({})
      setPreviewKey((key) => key + 1)
      setMessage({ tone: 'success', text: 'Saved.' })
    } catch {
      setMessage({
        tone: 'error',
        text: 'We could not reach the server. Check your connection and try again.',
      })
    } finally {
      setSaving(false)
    }
  }, [quote, reset])

  /**
   * Fetches the current code on demand.
   *
   * A separate request rather than a field on the quote, so an access code is
   * not sitting in the editor's memory and in a network response every time
   * someone opens a quote to fix a typo.
   */
  const showPin = useCallback(async () => {
    setPinState('loading')
    try {
      const response = await fetch(`/api/v1/admin/quotes/${quote.id}/pin`)
      const body: unknown = await response.json()

      if (!response.ok) {
        setPinState('unavailable')
        return
      }

      const pin = (body as { pin: string | null }).pin
      if (pin) {
        setCurrentPin(pin)
        setPinState('shown')
      } else {
        // Predates recoverable codes, or the pepper has been rotated since.
        setPinState('unavailable')
      }
    } catch {
      setPinState('unavailable')
    }
  }, [quote.id])

  const regeneratePin = useCallback(async () => {
    const response = await fetch(`/api/v1/admin/quotes/${quote.id}/pin`, { method: 'POST' })
    const body: unknown = await response.json()

    if (!response.ok) {
      setMessage({
        tone: 'error',
        text: (body as { error?: { message?: string } }).error?.message ?? 'That did not work.',
      })
      return
    }

    const issued = (body as { pin: string }).pin
    setNewPin(issued)
    setCurrentPin(issued)
    setPinState('shown')
  }, [quote.id])

  /**
   * Switches currency, converting every amount at today's rate.
   *
   * Changing the currency alone only changed the label: £4,200 became ₦4,200,
   * which is out by a factor of about two thousand and would have gone to a
   * client that way.
   *
   * The rate is applied ONCE and the results are stored as ordinary figures. A
   * quote is never re-priced from a live rate afterwards: a client who was sent
   * a total must see that total tomorrow, whatever the market did overnight.
   */
  const convertCurrency = useCallback(
    async (to: string) => {
      const from = quote.currency
      setConverting(true)
      setMessage(null)

      try {
        const response = await fetch(`/api/v1/admin/fx?from=${from}&to=${to}`)
        const body: unknown = await response.json()

        if (!response.ok) {
          setMessage({
            tone: 'error',
            text:
              (body as { error?: { message?: string } }).error?.message ??
              'We could not get an exchange rate.',
          })
          return
        }

        const { rate, asOf } = body as { rate: number; asOf: string }
        const convert = (minor: number) => Math.round(minor * rate)

        dispatch({
          type: 'replaceAll',
          dirty: true,
          quote: {
            ...quote,
            currency: to as Quote['currency'],
            discountMinor: convert(quote.discountMinor),
            lineItems: quote.lineItems.map((item) => ({
              ...item,
              unitPriceMinor: convert(item.unitPriceMinor),
            })),
          },
        })

        setMessage({
          tone: 'success',
          text: `Converted at 1 ${from} = ${rate.toLocaleString('en-GB', { maximumFractionDigits: 4 })} ${to} (rate from ${asOf}). Check the prices, then save.`,
        })
      } catch {
        setMessage({ tone: 'error', text: 'We could not reach the server. Try again.' })
      } finally {
        setConverting(false)
      }
    },
    [quote, dispatch]
  )

  const deleteQuote = useCallback(async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/v1/admin/quotes/${quote.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const body: unknown = await response.json()
        setMessage({
          tone: 'error',
          text:
            (body as { error?: { message?: string } }).error?.message ??
            'That could not be deleted.',
        })
        setDeleting(false)
        return
      }
      // Nothing left to edit, so leave rather than sit on a dead record.
      window.location.href = '/admin/quotes'
    } catch {
      setMessage({ tone: 'error', text: 'We could not reach the server. Try again.' })
      setDeleting(false)
    }
  }, [quote.id])

  const currencyOptions = useMemo(
    () =>
      CURRENCIES.map((entry) => ({ value: entry.code, label: `${entry.code} — ${entry.label}` })),
    []
  )

  return (
    <div className="pb-28">
      {/* Header: identity, status, and the two actions that matter. */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Quote for</p>
          <h1 className="wh-h3 break-words">{quote.clientName || 'Untitled client'}</h1>
          <p className="mt-1 truncate text-base text-muted-foreground">{quote.projectTitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/admin/quotes/${quote.id}/preview`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-base transition-colors hover:border-foreground"
          >
            Preview
          </a>
          <Button tone="primary" onClick={save} disabled={saving || !dirty}>
            {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </Button>
        </div>
      </div>

      {message && (
        <div className="mb-6">
          <StatusLine tone={message.tone}>{message.text}</StatusLine>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="min-w-0">
          {/* Tabs. Horizontal scroller on small screens; never a hamburger. */}
          <div
            role="tablist"
            aria-label="Quote sections"
            className="-mx-5 mb-6 flex gap-1 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0"
          >
            {TABS.map((entry) => (
              <button
                key={entry.id}
                role="tab"
                type="button"
                aria-selected={tab === entry.id}
                onClick={() => setTab(entry.id)}
                className={cn(
                  'min-h-11 shrink-0 rounded-full px-4 text-base transition-colors',
                  tab === entry.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            {tab === 'client' && (
              <>
                <Panel title="Who this is for">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextInput
                      label="Client name"
                      required
                      dataField="clientName"
                      error={fieldErrors['clientName']}
                      value={quote.clientName}
                      onChange={(clientName) => setField({ clientName })}
                    />
                    <TextInput
                      label="Company"
                      dataField="clientCompany"
                      error={fieldErrors['clientCompany']}
                      value={quote.clientCompany ?? ''}
                      onChange={(value) => setField({ clientCompany: value })}
                    />
                    <TextInput
                      label="Email"
                      type="email"
                      hint="Used as the reply-to when they respond."
                      dataField="clientEmail"
                      error={fieldErrors['clientEmail']}
                      value={quote.clientEmail ?? ''}
                      onChange={(value) => setField({ clientEmail: value })}
                    />
                    <TextInput
                      label="Their role"
                      dataField="clientRole"
                      error={fieldErrors['clientRole']}
                      value={quote.clientRole ?? ''}
                      onChange={(value) => setField({ clientRole: value })}
                    />
                  </div>
                </Panel>

                <Panel title="The project" description="What the client reads first.">
                  <div className="flex flex-col gap-5">
                    <TextInput
                      label="Project title"
                      required
                      dataField="projectTitle"
                      error={fieldErrors['projectTitle']}
                      value={quote.projectTitle}
                      onChange={(projectTitle) => setField({ projectTitle })}
                    />
                    <TextArea
                      label="Opening note"
                      hint="A short personal line. Skip it and the quote opens on the summary."
                      rows={3}
                      dataField="introNote"
                      error={fieldErrors['introNote']}
                      value={quote.introNote}
                      onChange={(introNote) => setField({ introNote })}
                    />
                    <TextArea
                      label="What the project is about"
                      hint="The problem in their words, and what they end up with."
                      rows={7}
                      dataField="projectSummary"
                      error={fieldErrors['projectSummary']}
                      value={quote.projectSummary}
                      onChange={(projectSummary) => setField({ projectSummary })}
                    />
                  </div>
                </Panel>
              </>
            )}

            {tab === 'cost' && (
              <>
                <Panel
                  title="Cost breakdown"
                  description="Work charged on every version of this quote, whatever the client picks."
                  action={
                    <Button onClick={() => rows.add('lineItems', BLANK_LINE_ITEM)}>Add line</Button>
                  }
                >
                  <LineItemList
                    lineItems={quote.lineItems}
                    options={quote.options}
                    currency={quote.currency}
                    optionId={null}
                    fieldErrors={fieldErrors}
                    emptyMessage="No lines yet. Add one, or let the AI drafter propose a breakdown."
                    onUpdate={(id, patch) => rows.update('lineItems', id, patch)}
                    onRemove={(id) => rows.remove('lineItems', id)}
                    onReorder={(lineItems) => setField({ lineItems })}
                  />
                </Panel>

                <Panel title="Adjustments">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select
                      label="Currency"
                      value={quote.currency}
                      options={currencyOptions}
                      onChange={(currency) => {
                        // Never silently: converting rewrites every price, and
                        // not converting leaves them numerically wrong. The
                        // operator picks, with the consequences spelled out.
                        if (currency === quote.currency) return
                        setPendingCurrency(currency)
                      }}
                    />
                    <MoneyInput
                      label="Discount"
                      currency={quote.currency}
                      valueMinor={quote.discountMinor}
                      onChange={(discountMinor) => setField({ discountMinor })}
                      hint="Comes off before tax."
                    />
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm text-muted-foreground">Tax rate (%)</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.5"
                        data-field="taxRateBp"
                        value={quote.taxRateBp / 100}
                        onChange={(event) =>
                          setField({ taxRateBp: Math.round(Number(event.target.value) * 100) || 0 })
                        }
                        className="min-h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-right font-mono text-base outline-none focus-visible:border-foreground"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm text-muted-foreground">Deposit (%)</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="5"
                        data-field="depositPercent"
                        value={quote.depositPercent}
                        onChange={(event) =>
                          setField({ depositPercent: Number(event.target.value) || 0 })
                        }
                        className="min-h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-right font-mono text-base outline-none focus-visible:border-foreground"
                      />
                    </label>
                  </div>
                </Panel>
              </>
            )}

            {tab === 'packages' && (
              <Panel
                title="Options the client chooses from"
                description="Packages are pick-one. Add-ons are tick-any. Leave this empty for a single fixed scope."
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => rows.add('options', { ...BLANK_OPTION, kind: 'package' })}
                    >
                      Add package
                    </Button>
                    <Button onClick={() => rows.add('options', { ...BLANK_OPTION, kind: 'addon' })}>
                      Add add-on
                    </Button>
                  </div>
                }
              >
                {quote.options.length === 0 ? (
                  <p className="text-base text-muted-foreground">
                    No options. Every line below is charged as one fixed scope.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {quote.options.map((option, index) => (
                      <CollapsibleRow
                        key={option.id}
                        label={`${option.kind === 'package' ? 'Package' : 'Add-on'} ${index + 1}`}
                        title={option.title}
                        meta={
                          optionTotals.get(option.id)
                            ? formatMoney(optionTotals.get(option.id) ?? 0, quote.currency)
                            : undefined
                        }
                        defaultOpen={!option.title}
                        actions={
                          <>
                            <Button
                              tone="ghost"
                              onClick={() => rows.move('options', option.id, -1)}
                              disabled={index === 0}
                            >
                              Up
                            </Button>
                            <Button
                              tone="ghost"
                              onClick={() => rows.move('options', option.id, 1)}
                              disabled={index === quote.options.length - 1}
                            >
                              Down
                            </Button>
                            <Button
                              tone="ghost"
                              onClick={() => {
                                /* Lines under a deleted option go with it.
                                     Leaving them behind would silently move
                                     their prices into base scope, charging the
                                     client for a package they did not pick. */
                                quote.lineItems
                                  .filter((item) => item.optionId === option.id)
                                  .forEach((item) => rows.remove('lineItems', item.id))
                                rows.remove('options', option.id)
                              }}
                            >
                              Remove
                            </Button>
                          </>
                        }
                      >
                        <div className="flex flex-col gap-4">
                          <TextInput
                            label="Name"
                            required
                            value={option.title}
                            dataField={`options.${index}.title`}
                            error={fieldErrors[`options.${index}.title`]}
                            onChange={(title) => rows.update('options', option.id, { title })}
                          />
                          <TextArea
                            label="What it covers"
                            rows={2}
                            value={option.description}
                            onChange={(description) =>
                              rows.update('options', option.id, { description })
                            }
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Select
                              label="Type"
                              value={option.kind}
                              options={OPTION_KINDS}
                              onChange={(kind) =>
                                rows.update('options', option.id, {
                                  kind: kind as 'package' | 'addon',
                                  /* Switching a selected package to an add-on
                                       is fine, but two selected packages is not
                                       — clear the flag rather than risk it. */
                                  isSelected: false,
                                })
                              }
                            />
                            <div className="flex items-end">
                              <Checkbox
                                label="Pre-select this one"
                                checked={option.isSelected}
                                onChange={(isSelected) => {
                                  if (isSelected && option.kind === 'package') {
                                    quote.options
                                      .filter(
                                        (other) =>
                                          other.kind === 'package' && other.id !== option.id
                                      )
                                      .forEach((other) =>
                                        rows.update('options', other.id, { isSelected: false })
                                      )
                                  }
                                  rows.update('options', option.id, {
                                    isSelected,
                                    isDefault: isSelected,
                                  })
                                }}
                              />
                            </div>
                          </div>

                          {/*
                              The package owns its lines here, rather than the
                              operator adding them to a flat list and then
                              picking this package from a dropdown. Same rows,
                              same table — but building a package reads as
                              building a package.
                            */}
                          <div className="rounded-2xl border border-border p-4">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-base">What's included</p>
                                <p className="text-sm text-muted-foreground">
                                  Charged only while the client has this{' '}
                                  {option.kind === 'package' ? 'package' : 'add-on'} selected.
                                </p>
                              </div>
                              <Button
                                onClick={() =>
                                  rows.add('lineItems', {
                                    ...BLANK_LINE_ITEM,
                                    optionId: option.id,
                                  })
                                }
                              >
                                Add item
                              </Button>
                            </div>

                            <LineItemList
                              lineItems={quote.lineItems}
                              options={quote.options}
                              currency={quote.currency}
                              optionId={option.id}
                              fieldErrors={fieldErrors}
                              emptyMessage="Nothing in here yet. Add the work this option covers."
                              onUpdate={(id, patch) => rows.update('lineItems', id, patch)}
                              onRemove={(id) => rows.remove('lineItems', id)}
                              onReorder={(lineItems) => setField({ lineItems })}
                            />
                          </div>
                        </div>
                      </CollapsibleRow>
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            {tab === 'timeline' && (
              <Panel
                title="Timeline"
                description="Phases, what they produce, and roughly how long each takes."
                action={<Button onClick={() => rows.add('phases', BLANK_PHASE)}>Add phase</Button>}
              >
                {quote.phases.length === 0 ? (
                  <p className="text-base text-muted-foreground">
                    No phases yet. Clients read this section closely: it is where a price becomes a
                    plan.
                  </p>
                ) : (
                  <ol className="flex flex-col gap-4">
                    {quote.phases.map((phase, index) => (
                      <CollapsibleRow
                        key={phase.id}
                        label={`Phase ${index + 1}`}
                        title={phase.title}
                        meta={phase.durationLabel || undefined}
                        defaultOpen={!phase.title}
                        actions={
                          <>
                            <Button
                              tone="ghost"
                              onClick={() => rows.move('phases', phase.id, -1)}
                              disabled={index === 0}
                            >
                              <span aria-hidden="true">↑</span>
                              <span className="sr-only">Move up</span>
                            </Button>
                            <Button
                              tone="ghost"
                              onClick={() => rows.move('phases', phase.id, 1)}
                              disabled={index === quote.phases.length - 1}
                            >
                              <span aria-hidden="true">↓</span>
                              <span className="sr-only">Move down</span>
                            </Button>
                            <Button tone="danger" onClick={() => rows.remove('phases', phase.id)}>
                              Remove
                            </Button>
                          </>
                        }
                      >
                        <div className="flex flex-col gap-4">
                          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
                            <TextInput
                              label="Phase"
                              required
                              dataField={`phases.${index}.title`}
                              error={fieldErrors[`phases.${index}.title`]}
                              value={phase.title}
                              onChange={(title) => rows.update('phases', phase.id, { title })}
                            />
                            <TextInput
                              label="How long"
                              placeholder="2 weeks"
                              value={phase.durationLabel}
                              onChange={(durationLabel) =>
                                rows.update('phases', phase.id, { durationLabel })
                              }
                            />
                          </div>
                          <TextArea
                            label="What happens"
                            rows={2}
                            value={phase.description}
                            onChange={(description) =>
                              rows.update('phases', phase.id, { description })
                            }
                          />
                          <TextArea
                            label="What you get at the end of it"
                            hint="One per line."
                            rows={3}
                            value={phase.deliverables.join('\n')}
                            onChange={(value) =>
                              rows.update('phases', phase.id, {
                                deliverables: value
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter((line) => line.length > 0),
                              })
                            }
                          />
                        </div>
                      </CollapsibleRow>
                    ))}
                  </ol>
                )}
              </Panel>
            )}

            {tab === 'references' && (
              <Panel
                title="Reference links"
                description="Things to look at so the client can picture the result."
                action={
                  <Button onClick={() => rows.add('references', BLANK_REFERENCE)}>Add link</Button>
                }
              >
                {quote.references.length === 0 ? (
                  <p className="text-base text-muted-foreground">
                    No links yet. Live sites, prototypes or previous work all belong here.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {quote.references.map((reference, index) => (
                      <CollapsibleRow
                        key={reference.id}
                        label={String(index + 1).padStart(2, '0')}
                        title={reference.label}
                        meta={hostnameOf(reference.url)}
                        defaultOpen={!reference.label}
                        actions={
                          <Button
                            tone="danger"
                            onClick={() => rows.remove('references', reference.id)}
                          >
                            Remove
                          </Button>
                        }
                      >
                        <div className="flex flex-col gap-4">
                          <TextInput
                            label="Label"
                            required
                            dataField={`references.${index}.label`}
                            error={fieldErrors[`references.${index}.label`]}
                            value={reference.label}
                            onChange={(label) => rows.update('references', reference.id, { label })}
                          />
                          <TextInput
                            label="URL"
                            required
                            type="url"
                            placeholder="https://"
                            dataField={`references.${index}.url`}
                            error={fieldErrors[`references.${index}.url`]}
                            value={reference.url}
                            onChange={(url) => rows.update('references', reference.id, { url })}
                          />
                          <TextArea
                            label="Why you are showing them this"
                            rows={2}
                            value={reference.description}
                            onChange={(description) =>
                              rows.update('references', reference.id, { description })
                            }
                          />
                        </div>
                      </CollapsibleRow>
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            {tab === 'images' && (
              <ImageUploader
                images={quote.images}
                enabled={imagesEnabled}
                onAdd={(image) => rows.add('images', image)}
                onUpdate={(id, patch) => rows.update('images', id, patch)}
                onRemove={(id) => rows.remove('images', id)}
                onMove={(id, direction) => rows.move('images', id, direction)}
              />
            )}

            {tab === 'terms' && (
              <Panel title="Terms and payment">
                <div className="flex flex-col gap-5">
                  <TextInput
                    label="Valid until"
                    type="date"
                    hint="Shown to the client. Leave empty for no expiry."
                    dataField="validUntil"
                    error={fieldErrors['validUntil']}
                    value={quote.validUntil ?? ''}
                    onChange={(value) => setField({ validUntil: value || null })}
                  />
                  <TextArea
                    label="Payment terms"
                    rows={4}
                    placeholder="50% to start, 50% on delivery. Invoices payable within 14 days."
                    dataField="paymentTerms"
                    error={fieldErrors['paymentTerms']}
                    value={quote.paymentTerms}
                    onChange={(paymentTerms) => setField({ paymentTerms })}
                  />
                  <TextArea
                    label="Terms and conditions"
                    rows={10}
                    hint="What is included, what is not, and what happens if scope changes."
                    dataField="terms"
                    error={fieldErrors['terms']}
                    value={quote.terms}
                    onChange={(terms) => setField({ terms })}
                  />
                </div>
              </Panel>
            )}

            {tab === 'sharing' && (
              <>
                <Panel title="The link" description="What you send the client.">
                  <div className="flex flex-col gap-5">
                    <TextInput
                      label="Link ending"
                      required
                      hint="Lowercase letters, numbers and hyphens."
                      dataField="slug"
                      error={fieldErrors['slug']}
                      value={quote.slug}
                      onChange={(slug) =>
                        setField({ slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
                      }
                    />

                    <div className="rounded-2xl border border-border bg-muted p-4">
                      <p className="mb-2 text-sm text-muted-foreground">Their link</p>
                      <p className="font-mono text-base break-all">{shareUrl}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          onClick={() => {
                            void navigator.clipboard.writeText(shareUrl)
                            setMessage({ tone: 'success', text: 'Link copied.' })
                          }}
                        >
                          Copy link
                        </Button>
                      </div>
                    </div>

                    <Select
                      label="Status"
                      value={quote.status}
                      options={QUOTE_STATUSES.map((status) => ({
                        value: status,
                        label: QUOTE_STATUS_LABELS[status],
                      }))}
                      onChange={(status) => setField({ status: status as Quote['status'] })}
                      hint="A draft cannot be opened by the client, even with the code."
                    />
                  </div>
                </Panel>

                <Panel
                  title="Access code"
                  description="The client types this once, then stays signed in for twelve hours."
                >
                  {pinState === 'shown' && currentPin ? (
                    <div className="rounded-2xl border border-accent bg-accent/10 p-4">
                      {newPin && (
                        <p className="mb-2 text-base">
                          New code. The previous one stopped working the moment this was issued.
                        </p>
                      )}
                      <p className="font-mono text-3xl tracking-[0.3em]">{currentPin}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          onClick={() => {
                            void navigator.clipboard.writeText(currentPin)
                            setMessage({ tone: 'success', text: 'Code copied.' })
                          }}
                        >
                          Copy code
                        </Button>
                        <Button
                          onClick={() => {
                            void navigator.clipboard.writeText(
                              `Your quote: ${shareUrl}\nAccess code: ${currentPin}`
                            )
                            setMessage({ tone: 'success', text: 'Link and code copied.' })
                          }}
                        >
                          Copy link and code
                        </Button>
                        <Button tone="ghost" onClick={() => setPinState('hidden')}>
                          Hide
                        </Button>
                      </div>
                    </div>
                  ) : pinState === 'unavailable' ? (
                    <p className="mb-4 text-base text-muted-foreground">
                      This code cannot be recovered: the quote was created before codes were stored
                      recoverably, or the signing secret has been rotated since. Issue a new one and
                      send that instead.
                    </p>
                  ) : (
                    <>
                      <p className="mb-4 text-base text-muted-foreground">
                        Hidden until you ask for it, so it is not sitting on screen while you share
                        your window.
                      </p>
                      <Button onClick={showPin} disabled={pinState === 'loading'}>
                        {pinState === 'loading' ? 'Fetching\u2026' : 'Show code'}
                      </Button>
                    </>
                  )}

                  <div className="mt-5 border-t border-border pt-5">
                    <Button onClick={() => setConfirmingReissue(true)}>Issue a new code</Button>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Only if the code has leaked. The current one stops working immediately, so
                      anyone already holding it is locked out until you send the new one.
                    </p>
                  </div>
                </Panel>

                <Panel
                  title="Delete this quote"
                  description="Permanent. There is no undo and no archive."
                >
                  <p className="mb-5 text-base text-muted-foreground">
                    Removes the quote and everything attached to it: line items, timeline, reference
                    links, images and the activity log. The link stops working immediately, so if
                    your client still has it open they will lose the page.
                  </p>
                  <Button
                    tone="danger"
                    onClick={() => setConfirmingDelete(true)}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Delete quote'}
                  </Button>
                </Panel>
              </>
            )}

            {tab === 'preview' && (
              <Panel
                title="Preview"
                description="Exactly what your client sees, without needing the code."
                action={
                  <a
                    href={`/admin/quotes/${quote.id}/preview`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-base transition-colors hover:border-foreground"
                  >
                    Open full size
                  </a>
                }
              >
                {dirty && (
                  <p className="mb-4 rounded-xl border border-accent bg-accent/10 px-4 py-3 text-base">
                    You have unsaved changes. The preview shows the last saved version — save to see
                    them here.
                  </p>
                )}

                <div className="mb-4 flex flex-wrap gap-1">
                  {PREVIEW_WIDTHS.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      aria-pressed={previewWidth === entry.width}
                      onClick={() => setPreviewWidth(entry.width)}
                      className={cn(
                        'min-h-11 rounded-full px-4 text-base transition-colors',
                        previewWidth === entry.width
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>

                {/* Centred and width-constrained rather than scaled: a client
                    reading this on a phone gets real 375px layout, not a
                    shrunken desktop one, so that is what the preview shows. */}
                <div className="overflow-x-auto rounded-2xl border border-border bg-muted p-3">
                  <iframe
                    key={previewKey}
                    src={`/admin/quotes/${quote.id}/preview?bare=1`}
                    title="Preview of the client quote"
                    className="mx-auto h-[70svh] w-full rounded-xl border border-border bg-background"
                    style={
                      previewWidth > 0
                        ? { width: `${previewWidth}px`, maxWidth: '100%' }
                        : undefined
                    }
                  />
                </div>
              </Panel>
            )}

            {tab === 'ai' && (
              <AiDraftPanel
                quoteId={quote.id}
                providers={aiProviders}
                onApply={(draft) => {
                  dispatch({
                    type: 'replaceAll',
                    dirty: true,
                    quote: {
                      ...quote,
                      projectTitle: draft.projectTitle || quote.projectTitle,
                      projectSummary: draft.projectSummary,
                      introNote: draft.introNote || quote.introNote,
                      paymentTerms: draft.paymentTerms || quote.paymentTerms,
                      // Terms are standard and fixed. A draft never replaces them.
                      terms: quote.terms,
                      depositPercent: draft.suggestedDepositPercent,
                      validUntil:
                        quote.validUntil ??
                        new Date(Date.now() + draft.suggestedValidityDays * 86_400_000)
                          .toISOString()
                          .slice(0, 10),
                      lineItems: draft.lineItems.map((item, index) => ({
                        id: `draft-line-${index}`,
                        position: index,
                        title: item.title,
                        description: item.description,
                        quantity: item.quantity,
                        // The model reasons in major units; the quote stores minor.
                        unitPriceMinor: Math.round(item.unitPrice * 100),
                        isOptional: item.isOptional,
                        // A drafted line is base scope. The model is not asked
                        // to invent packages; the operator builds those.
                        optionId: null,
                      })),
                      phases: draft.phases.map((phase, index) => ({
                        id: `draft-phase-${index}`,
                        position: index,
                        title: phase.title,
                        description: phase.description,
                        durationLabel: phase.durationLabel,
                        deliverables: phase.deliverables,
                      })),
                    },
                  })
                  setTab('cost')
                  setMessage({
                    tone: 'idle',
                    text: 'Draft applied. Check every price, and the terms, before you save.',
                  })
                }}
              />
            )}
          </div>
        </div>

        {/* Totals stay visible while editing anything. */}
        <aside className="lg:sticky lg:top-6">
          <QuoteTotals
            totals={totals}
            currency={quote.currency}
            taxRateBp={quote.taxRateBp}
            depositPercent={quote.depositPercent}
          />
        </aside>
      </div>

      {/* Save bar. Fixed, because the tab content is long and the button must
          never be a scroll away. */}
      <ConfirmDialog
        open={pendingCurrency !== null}
        title={`Switching to ${pendingCurrency ?? ''}`}
        body={`Convert every price at today's exchange rate, or keep the numbers exactly as they are and just change the symbol. Keep them if the figures are already correct in ${pendingCurrency ?? ''}.`}
        confirmLabel={converting ? 'Converting…' : 'Convert'}
        cancelLabel="Keep the numbers"
        onCancel={() => {
          const target = pendingCurrency
          setPendingCurrency(null)
          if (target) setField({ currency: target as Quote['currency'] })
        }}
        onConfirm={() => {
          const target = pendingCurrency
          setPendingCurrency(null)
          if (target) void convertCurrency(target)
        }}
      />

      <ConfirmDialog
        open={confirmingDelete}
        tone="danger"
        title={`Delete the quote for ${quote.clientName}?`}
        body="This removes the quote and everything attached to it, including the activity log. It cannot be undone, and the client's link stops working immediately."
        confirmLabel="Delete permanently"
        cancelLabel="Keep it"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false)
          void deleteQuote()
        }}
      />

      <ConfirmDialog
        open={confirmingReissue}
        tone="danger"
        title="Issue a new access code?"
        body="The current code stops working immediately. Anyone already holding it — including your client — is locked out until you send them the new one."
        confirmLabel="Issue a new code"
        onCancel={() => setConfirmingReissue(false)}
        onConfirm={() => {
          setConfirmingReissue(false)
          void regeneratePin()
        }}
      />

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-5 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Unsaved changes</p>
            <Button tone="primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
