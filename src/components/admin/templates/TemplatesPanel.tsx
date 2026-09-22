/**
 * The Templates page: everything the studio has saved to reuse.
 *
 * Three tabs, one per shape: items, packages and whole-quote templates. Items
 * and packages are built here directly. Quote templates are built the only way
 * a quote can be, in the quote editor, so here they can be renamed and deleted
 * but not rewritten; the page says so rather than offering a lesser editor.
 *
 * Writes go to /api/v1/admin/templates/* and patch local state from the
 * response, so adding ten items in a row does not reload the page ten times.
 *
 * Ported from Rayo's TemplatesPanel. The one departure: outcomes are reported
 * in a status line rather than a toast, because the admin has no toasts.
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Select, StatusLine, TextArea, TextInput } from '../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import { Modal } from '../Modal'
import { MoneyInput } from '../quotes/MoneyInput'
import { Icon } from '@/components/ui/icons'
import { formatMoney, lineAmount } from '@/lib/admin/money'
import { describeTemplate } from '@/lib/admin/template-apply'
import { cn } from '@/lib/utils'
import { CURRENCIES, type CurrencyCode, type QuoteOptionPricing } from '@/types/quote'
import type {
  QuoteTemplate,
  SavedItem,
  SavedLine,
  SavedPackage,
  TemplateLibrary,
} from '@/types/templates'
import { EmptyState } from './EmptyState'
import { FormFooter } from './FormFooter'
import { messageFrom } from './fx-client'
import { QuantityInput } from './QuantityInput'
import { packagePriceMinor } from './TemplatePicker'

type Tab = 'items' | 'packages' | 'quotes'

const TAB_KEY = 'wh.templates.tab'

const currencyOptions = CURRENCIES.map((entry) => ({
  value: entry.code,
  label: `${entry.code} (${entry.label})`,
}))

const pricingOptions = [
  { value: 'itemised', label: 'Price each line' },
  { value: 'fixed', label: 'One price for the whole package' },
] as const

interface ItemDraft {
  id: string | null
  title: string
  description: string
  quantity: number
  unitPriceMinor: number
  currency: CurrencyCode
}

interface PackageDraft {
  id: string | null
  name: string
  description: string
  currency: CurrencyCode
  pricing: QuoteOptionPricing
  fixedPriceMinor: number
  /** Local keys so React can track rows while they are added and removed. */
  lines: Array<SavedLine & { key: number }>
}

interface TemplateDraft {
  id: string
  name: string
  description: string
}

type Deleting =
  | { kind: 'item'; id: string; label: string }
  | { kind: 'package'; id: string; label: string }
  | { kind: 'quote'; id: string; label: string }

const ENDPOINT: Record<Deleting['kind'], string> = {
  item: '/api/v1/admin/templates/items',
  package: '/api/v1/admin/templates/packages',
  quote: '/api/v1/admin/templates/quotes',
}

let lineKey = 0
const blankLine = (): SavedLine & { key: number } => ({
  key: (lineKey += 1),
  title: '',
  description: '',
  quantity: 1,
  unitPriceMinor: 0,
})

/** Replaces an entry by id, or appends it; the list stays sorted by name. */
function upsert<T extends { id: string }>(list: T[], next: T, nameOf: (entry: T) => string): T[] {
  const rest = list.filter((entry) => entry.id !== next.id)
  return [...rest, next].sort((a, b) => nameOf(a).localeCompare(nameOf(b)))
}

interface Props {
  library: TemplateLibrary
  defaultCurrency: CurrencyCode
}

export function TemplatesPanel({ library, defaultCurrency }: Props) {
  const [items, setItems] = useState(library.items)
  const [packages, setPackages] = useState(library.packages)
  const [templates, setTemplates] = useState(library.quoteTemplates)
  const [tab, setTab] = useState<Tab>('items')
  const [search, setSearch] = useState('')

  const [itemDraft, setItemDraft] = useState<ItemDraft | null>(null)
  const [packageDraft, setPackageDraft] = useState<PackageDraft | null>(null)
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft | null>(null)
  const [deleting, setDeleting] = useState<Deleting | null>(null)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  /* The admin has no toasts: the outcome of a save or delete is a status line
     under the heading, announced by `role="status"`. */
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  /* Read after mount so the server and first client render agree. */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TAB_KEY)
      if (stored === 'items' || stored === 'packages' || stored === 'quotes') setTab(stored)
    } catch {
      /* Blocked storage. The first tab stands. */
    }
  }, [])

  const chooseTab = useCallback((next: Tab) => {
    setTab(next)
    setSearch('')
    try {
      window.localStorage.setItem(TAB_KEY, next)
    } catch {
      /* The tab still changed for this visit. */
    }
  }, [])

  const term = search.trim().toLowerCase()
  const matches = (...fields: string[]): boolean =>
    !term || fields.some((field) => field.toLowerCase().includes(term))

  /* Filtered on every render: a library is dozens of entries, not thousands. */
  const visibleItems = items.filter((item) => matches(item.title, item.description))
  const visiblePackages = packages.filter((pkg) => matches(pkg.name, pkg.description))
  const visibleTemplates = templates.filter((template) =>
    matches(template.name, template.description)
  )

  /* --- Writes ------------------------------------------------------------- */

  const send = async <T,>(url: string, method: string, body: unknown): Promise<T | null> => {
    setBusy(true)
    setFormError(null)
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        setFormError(await messageFrom(response, 'That did not save. Please try again.'))
        return null
      }
      return (await response.json()) as T
    } catch {
      setFormError('We could not reach the server. Please try again.')
      return null
    } finally {
      setBusy(false)
    }
  }

  const saveItem = async (): Promise<void> => {
    if (!itemDraft) return
    const { id, ...body } = itemDraft
    const url = id ? `${ENDPOINT.item}?id=${encodeURIComponent(id)}` : ENDPOINT.item
    const result = await send<{ item: SavedItem }>(url, id ? 'PUT' : 'POST', body)
    if (!result) return
    setItems((list) => upsert(list, result.item, (entry) => entry.title))
    setNotice({
      tone: 'success',
      text: id ? `${result.item.title} saved.` : `${result.item.title} added.`,
    })
    setItemDraft(null)
  }

  const savePackage = async (): Promise<void> => {
    if (!packageDraft) return
    const { id, lines, ...rest } = packageDraft
    const body = {
      ...rest,
      /* A row left blank is an unfinished thought, not a line to refuse over. */
      lines: lines.filter((line) => line.title.trim()).map(({ key: _key, ...line }) => line),
    }
    const url = id ? `${ENDPOINT.package}?id=${encodeURIComponent(id)}` : ENDPOINT.package
    const result = await send<{ package: SavedPackage }>(url, id ? 'PUT' : 'POST', body)
    if (!result) return
    setPackages((list) => upsert(list, result.package, (entry) => entry.name))
    setNotice({
      tone: 'success',
      text: id ? `${result.package.name} saved.` : `${result.package.name} added.`,
    })
    setPackageDraft(null)
  }

  const renameTemplate = async (): Promise<void> => {
    if (!templateDraft) return
    const { id, ...body } = templateDraft
    const result = await send<{ template: QuoteTemplate }>(
      `${ENDPOINT.quote}?id=${encodeURIComponent(id)}`,
      'PATCH',
      body
    )
    if (!result) return
    setTemplates((list) => upsert(list, result.template, (entry) => entry.name))
    setNotice({ tone: 'success', text: `${result.template.name} saved.` })
    setTemplateDraft(null)
  }

  const remove = async (target: Deleting): Promise<void> => {
    try {
      const response = await fetch(`${ENDPOINT[target.kind]}?id=${encodeURIComponent(target.id)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        setNotice({
          tone: 'error',
          text: await messageFrom(response, 'That could not be deleted.'),
        })
        return
      }
      if (target.kind === 'item') setItems((list) => list.filter((e) => e.id !== target.id))
      if (target.kind === 'package') setPackages((list) => list.filter((e) => e.id !== target.id))
      if (target.kind === 'quote') setTemplates((list) => list.filter((e) => e.id !== target.id))
      setNotice({ tone: 'success', text: `${target.label} deleted.` })
    } catch {
      setNotice({ tone: 'error', text: 'We could not reach the server. Please try again.' })
    }
  }

  /* --- Openers ------------------------------------------------------------ */

  const newItem = (): void => {
    setFormError(null)
    setItemDraft({
      id: null,
      title: '',
      description: '',
      quantity: 1,
      unitPriceMinor: 0,
      currency: defaultCurrency,
    })
  }

  const editItem = (item: SavedItem): void => {
    setFormError(null)
    setItemDraft({
      id: item.id,
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      currency: item.currency,
    })
  }

  const newPackage = (): void => {
    setFormError(null)
    setPackageDraft({
      id: null,
      name: '',
      description: '',
      currency: defaultCurrency,
      pricing: 'itemised',
      fixedPriceMinor: 0,
      lines: [blankLine()],
    })
  }

  const editPackage = (pkg: SavedPackage): void => {
    setFormError(null)
    setPackageDraft({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      currency: pkg.currency,
      pricing: pkg.pricing,
      fixedPriceMinor: pkg.fixedPriceMinor,
      lines: pkg.lines.map((line) => ({ ...line, key: (lineKey += 1) })),
    })
  }

  const updateLine = (key: number, patch: Partial<SavedLine>): void =>
    setPackageDraft((draft) =>
      draft
        ? {
            ...draft,
            lines: draft.lines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
          }
        : draft
    )

  /* --- Render ------------------------------------------------------------- */

  const TABS: ReadonlyArray<{ id: Tab; label: string; count: number }> = [
    { id: 'items', label: 'Items', count: items.length },
    { id: 'packages', label: 'Packages', count: packages.length },
    { id: 'quotes', label: 'Quote templates', count: templates.length },
  ]

  const addLabel = tab === 'items' ? 'New item' : tab === 'packages' ? 'New package' : null

  const card = 'flex flex-col rounded-2xl border border-border bg-card p-5'

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="wh-h1-compact">Templates</h1>
          <p className="mt-1 max-w-xl text-base text-muted-foreground">
            The work you sell often, saved once. Add it to any quote or invoice in a couple of taps,
            then change it there without touching the saved copy.
          </p>
        </div>
        {addLabel && (
          <Button tone="primary" onClick={tab === 'items' ? newItem : newPackage}>
            <Icon name="plus" className="size-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {notice && (
        <div className="mb-5">
          <StatusLine tone={notice.tone}>{notice.text}</StatusLine>
        </div>
      )}

      {/* Tabs scroll sideways on a phone rather than wrapping into two rows. */}
      <div
        role="tablist"
        aria-label="Template types"
        className="-mx-5 mb-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((entry) => (
          <button
            key={entry.id}
            role="tab"
            type="button"
            aria-selected={tab === entry.id}
            onClick={() => chooseTab(entry.id)}
            className={cn(
              'min-h-11 shrink-0 rounded-full px-4 text-base transition-colors',
              tab === entry.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {entry.label}
            <span className="ml-2 font-mono text-sm opacity-70">{entry.count}</span>
          </button>
        ))}
      </div>

      <div className="mb-5">
        <label className="sr-only" htmlFor="template-search">
          Search templates
        </label>
        <input
          id="template-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            tab === 'items'
              ? 'Search items'
              : tab === 'packages'
                ? 'Search packages'
                : 'Search templates'
          }
          className="min-h-12 w-full rounded-xl border border-border bg-card px-4 text-base outline-none focus-visible:border-foreground"
        />
      </div>

      {/* --- Items ---------------------------------------------------------- */}
      {tab === 'items' &&
        (visibleItems.length === 0 ? (
          <EmptyState
            searching={!!term}
            title="No saved items yet"
            body="Save the things you charge for regularly, like a logo, a day rate or a monthly retainer. You can also save any line straight from a quote."
            action={<Button onClick={newItem}>Add your first item</Button>}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <li key={item.id} className={card}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="min-w-0 text-lg leading-tight break-words">{item.title}</p>
                  <p className="shrink-0 font-mono text-base tabular-nums">
                    {formatMoney(lineAmount(item), item.currency)}
                  </p>
                </div>
                {item.description && (
                  <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                <p className="mb-4 text-sm text-muted-foreground">
                  {item.quantity} × {formatMoney(item.unitPriceMinor, item.currency)}
                </p>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button onClick={() => editItem(item)}>Edit</Button>
                  <Button
                    tone="danger"
                    onClick={() => setDeleting({ kind: 'item', id: item.id, label: item.title })}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ))}

      {/* --- Packages ------------------------------------------------------- */}
      {tab === 'packages' &&
        (visiblePackages.length === 0 ? (
          <EmptyState
            searching={!!term}
            title="No saved packages yet"
            body="A package is a set of items you sell together, like a starter brand kit. Add it to a quote as lines, or as a package the client picks."
            action={<Button onClick={newPackage}>Add your first package</Button>}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visiblePackages.map((pkg) => (
              <li key={pkg.id} className={card}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="min-w-0 text-lg leading-tight break-words">{pkg.name}</p>
                  <p className="shrink-0 font-mono text-base tabular-nums">
                    {formatMoney(packagePriceMinor(pkg), pkg.currency)}
                  </p>
                </div>
                {pkg.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                )}
                <ul className="mb-4 flex flex-col gap-1 text-sm">
                  {pkg.lines.slice(0, 4).map((line, index) => (
                    <li key={index} className="flex gap-2">
                      <Icon name="check" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 break-words">{line.title}</span>
                    </li>
                  ))}
                  {pkg.lines.length > 4 && (
                    <li className="text-muted-foreground">and {pkg.lines.length - 4} more</li>
                  )}
                </ul>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button onClick={() => editPackage(pkg)}>Edit</Button>
                  <Button
                    tone="danger"
                    onClick={() => setDeleting({ kind: 'package', id: pkg.id, label: pkg.name })}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ))}

      {/* --- Quote templates ------------------------------------------------ */}
      {tab === 'quotes' && (
        <>
          <p className="mb-4 max-w-2xl text-base text-muted-foreground">
            A quote template is a whole quote without the client. Make one from any quote with Save
            as template, then pick it when you create a new quote. To change one, use it on a quote,
            edit, and save over it.
          </p>
          {visibleTemplates.length === 0 ? (
            <EmptyState
              searching={!!term}
              title="No quote templates yet"
              body="Open a quote you send often and choose Save as template."
              action={
                <a
                  href="/admin/quotes"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-base transition-colors hover:border-foreground"
                >
                  Go to quotes
                  <Icon name="arrowRight" className="size-4" />
                </a>
              }
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleTemplates.map((template) => (
                <li key={template.id} className={card}>
                  <p className="mb-1 text-lg leading-tight break-words">{template.name}</p>
                  {template.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                  <p className="mb-4 text-sm text-muted-foreground">
                    {describeTemplate(template.body)} · {template.currency}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <a
                      href={`/admin/quotes/new?template=${encodeURIComponent(template.id)}`}
                      className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-base text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Use
                    </a>
                    <Button
                      onClick={() => {
                        setFormError(null)
                        setTemplateDraft({
                          id: template.id,
                          name: template.name,
                          description: template.description,
                        })
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      tone="danger"
                      onClick={() =>
                        setDeleting({ kind: 'quote', id: template.id, label: template.name })
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* --- Item form ------------------------------------------------------ */}
      <Modal
        open={itemDraft !== null}
        title={itemDraft?.id ? 'Edit item' : 'New item'}
        description="The price and quantity are a starting point. You can change them on each quote or invoice."
        onClose={() => setItemDraft(null)}
        footer={
          <FormFooter
            error={formError}
            busy={busy}
            disabled={!itemDraft?.title.trim()}
            label={itemDraft?.id ? 'Save item' : 'Add item'}
            onCancel={() => setItemDraft(null)}
            onSave={() => void saveItem()}
          />
        }
      >
        {itemDraft && (
          <div className="flex flex-col gap-5">
            <TextInput
              label="Name"
              required
              maxLength={200}
              placeholder="e.g. Logo design"
              value={itemDraft.title}
              onChange={(title) => setItemDraft({ ...itemDraft, title })}
            />
            <TextArea
              label="What it includes"
              rows={3}
              maxLength={2000}
              value={itemDraft.description}
              onChange={(description) => setItemDraft({ ...itemDraft, description })}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Currency"
                value={itemDraft.currency}
                options={currencyOptions}
                onChange={(currency) =>
                  setItemDraft({ ...itemDraft, currency: currency as CurrencyCode })
                }
              />
              <QuantityInput
                value={itemDraft.quantity}
                onChange={(quantity) => setItemDraft({ ...itemDraft, quantity })}
              />
            </div>
            <MoneyInput
              label="Unit price"
              currency={itemDraft.currency}
              valueMinor={itemDraft.unitPriceMinor}
              onChange={(unitPriceMinor) => setItemDraft({ ...itemDraft, unitPriceMinor })}
            />
          </div>
        )}
      </Modal>

      {/* --- Package form --------------------------------------------------- */}
      <Modal
        open={packageDraft !== null}
        title={packageDraft?.id ? 'Edit package' : 'New package'}
        description="A set of lines you sell together. Priced line by line, or at one price with the lines listed as what is included."
        onClose={() => setPackageDraft(null)}
        footer={
          <FormFooter
            error={formError}
            busy={busy}
            disabled={
              !packageDraft?.name.trim() || !packageDraft.lines.some((line) => line.title.trim())
            }
            label={packageDraft?.id ? 'Save package' : 'Add package'}
            onCancel={() => setPackageDraft(null)}
            onSave={() => void savePackage()}
          />
        }
      >
        {packageDraft && (
          <div className="flex flex-col gap-5">
            <TextInput
              label="Name"
              required
              maxLength={120}
              placeholder="e.g. Starter brand kit"
              value={packageDraft.name}
              onChange={(name) => setPackageDraft({ ...packageDraft, name })}
            />
            <TextArea
              label="Short description"
              rows={2}
              maxLength={600}
              value={packageDraft.description}
              onChange={(description) => setPackageDraft({ ...packageDraft, description })}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Currency"
                value={packageDraft.currency}
                options={currencyOptions}
                onChange={(currency) =>
                  setPackageDraft({ ...packageDraft, currency: currency as CurrencyCode })
                }
              />
              <Select
                label="Pricing"
                value={packageDraft.pricing}
                options={pricingOptions}
                onChange={(pricing) =>
                  setPackageDraft({ ...packageDraft, pricing: pricing as QuoteOptionPricing })
                }
              />
            </div>
            {packageDraft.pricing === 'fixed' && (
              <MoneyInput
                label="Package price"
                currency={packageDraft.currency}
                valueMinor={packageDraft.fixedPriceMinor}
                onChange={(fixedPriceMinor) =>
                  setPackageDraft({ ...packageDraft, fixedPriceMinor })
                }
              />
            )}

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 text-sm text-muted-foreground">
                {packageDraft.pricing === 'fixed' ? 'What is included' : 'Lines'}
              </legend>
              <ol className="flex flex-col gap-3">
                {packageDraft.lines.map((line, index) => (
                  <li key={line.key} className="rounded-2xl border border-border p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Button
                        tone="ghost"
                        disabled={packageDraft.lines.length === 1}
                        onClick={() =>
                          setPackageDraft({
                            ...packageDraft,
                            lines: packageDraft.lines.filter((entry) => entry.key !== line.key),
                          })
                        }
                      >
                        <Icon name="x" label={`Remove line ${index + 1}`} />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-4">
                      <TextInput
                        label="What it is"
                        required
                        maxLength={200}
                        value={line.title}
                        onChange={(title) => updateLine(line.key, { title })}
                      />
                      <TextInput
                        label="Detail"
                        maxLength={2000}
                        value={line.description}
                        onChange={(description) => updateLine(line.key, { description })}
                      />
                      {packageDraft.pricing === 'itemised' && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <QuantityInput
                            value={line.quantity}
                            onChange={(quantity) => updateLine(line.key, { quantity })}
                          />
                          <MoneyInput
                            label="Unit price"
                            currency={packageDraft.currency}
                            valueMinor={line.unitPriceMinor}
                            onChange={(unitPriceMinor) => updateLine(line.key, { unitPriceMinor })}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <Button
                className="self-start"
                disabled={packageDraft.lines.length >= 30}
                onClick={() =>
                  setPackageDraft({ ...packageDraft, lines: [...packageDraft.lines, blankLine()] })
                }
              >
                <Icon name="plus" className="size-4" />
                Add line
              </Button>
            </fieldset>

            {packageDraft.pricing === 'itemised' && (
              <p className="flex items-baseline justify-between gap-3 border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Package total</span>
                <span className="font-mono text-lg tabular-nums">
                  {formatMoney(
                    packageDraft.lines.reduce((sum, line) => sum + lineAmount(line), 0),
                    packageDraft.currency
                  )}
                </span>
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* --- Template rename ------------------------------------------------ */}
      <Modal
        open={templateDraft !== null}
        title="Rename template"
        onClose={() => setTemplateDraft(null)}
        footer={
          <FormFooter
            error={formError}
            busy={busy}
            disabled={!templateDraft?.name.trim()}
            label="Save"
            onCancel={() => setTemplateDraft(null)}
            onSave={() => void renameTemplate()}
          />
        }
      >
        {templateDraft && (
          <div className="flex flex-col gap-5">
            <TextInput
              label="Template name"
              required
              maxLength={120}
              value={templateDraft.name}
              onChange={(name) => setTemplateDraft({ ...templateDraft, name })}
            />
            <TextArea
              label="What it is for"
              rows={2}
              maxLength={600}
              value={templateDraft.description}
              onChange={(description) => setTemplateDraft({ ...templateDraft, description })}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        tone="danger"
        title={`Delete ${deleting?.label ?? 'this'}?`}
        body="Quotes and invoices it was already used on keep their own copy. Only the saved version goes."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          const target = deleting
          setDeleting(null)
          if (target) void remove(target)
        }}
      />
    </div>
  )
}
