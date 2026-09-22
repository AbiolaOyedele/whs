/**
 * Pick saved items and packages to drop into a quote or an invoice.
 *
 * One dialog for every place that inserts saved work, so choosing, converting
 * and copying behave the same in each. The caller says what it can accept:
 *
 *  - `lines`: items and packages both, flattened to plain lines. The quote's
 *    cost breakdown and the invoice form.
 *  - `options`: packages only, each becoming a pick-one option with its lines
 *    inside. The quote's Packages tab.
 *
 * Several can be ticked at once and are inserted in the order they were ticked,
 * which is the order the operator was thinking in.
 *
 * Prices in another currency are converted at today's rate on insert, and the
 * rate is reported back so the operator can check it.
 */
import { useEffect, useMemo, useState } from 'react'
import { Button, StatusLine } from '../ui'
import { Modal } from '../Modal'
import { Icon } from '@/components/ui/icons'
import { formatMoney } from '@/lib/admin/money'
import {
  itemToLine,
  packageToLines,
  packageToOption,
  type NewLine,
  type PackageAsOption,
} from '@/lib/admin/template-apply'
import { cn } from '@/lib/utils'
import type { SavedItem, SavedPackage } from '@/types/templates'
import { fetchRates, RateError } from './fx-client'

type Entry = { kind: 'item'; item: SavedItem } | { kind: 'package'; pkg: SavedPackage }

const keyOf = (entry: Entry): string =>
  entry.kind === 'item' ? `item:${entry.item.id}` : `package:${entry.pkg.id}`

/** A package's headline figure: its fixed price, or the sum of its lines. */
export function packagePriceMinor(pkg: SavedPackage): number {
  return pkg.pricing === 'fixed'
    ? pkg.fixedPriceMinor
    : pkg.lines.reduce((sum, line) => sum + Math.round(line.quantity * line.unitPriceMinor), 0)
}

interface BaseProps {
  open: boolean
  onClose: () => void
  items: SavedItem[]
  packages: SavedPackage[]
  /** The document's currency. Anything saved in another one is converted. */
  currency: string
}

interface LinesProps extends BaseProps {
  mode: 'lines'
  onInsert: (lines: NewLine[], rateNotes: string[]) => void
}

interface OptionsProps extends BaseProps {
  mode: 'options'
  onInsert: (options: PackageAsOption[], rateNotes: string[]) => void
}

type Props = LinesProps | OptionsProps

export function TemplatePicker(props: Props) {
  const { open, onClose, items, packages, currency, mode } = props
  const [tab, setTab] = useState<'item' | 'package'>(mode === 'options' ? 'package' : 'item')
  const [search, setSearch] = useState('')
  const [chosen, setChosen] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* A fresh start each time it opens: last time's ticks are last time's intent. */
  useEffect(() => {
    if (!open) return
    setChosen([])
    setSearch('')
    setError(null)
    setTab(mode === 'options' || items.length === 0 ? 'package' : 'item')
  }, [open, mode, items.length])

  const entries = useMemo<Entry[]>(
    () => [
      ...items.map((item) => ({ kind: 'item' as const, item })),
      ...packages.map((pkg) => ({ kind: 'package' as const, pkg })),
    ],
    [items, packages]
  )

  const byKey = useMemo(() => new Map(entries.map((entry) => [keyOf(entry), entry])), [entries])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return entries
      .filter((entry) => entry.kind === tab)
      .filter((entry) => {
        if (!term) return true
        const text =
          entry.kind === 'item'
            ? `${entry.item.title} ${entry.item.description}`
            : `${entry.pkg.name} ${entry.pkg.description}`
        return text.toLowerCase().includes(term)
      })
  }, [entries, search, tab])

  const toggle = (key: string): void =>
    setChosen((current) =>
      current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]
    )

  const insert = async (): Promise<void> => {
    const picked = chosen.map((key) => byKey.get(key)).filter((entry): entry is Entry => !!entry)
    if (picked.length === 0) return

    setBusy(true)
    setError(null)
    try {
      const { rates, notes } = await fetchRates(
        picked.map((entry) => (entry.kind === 'item' ? entry.item.currency : entry.pkg.currency)),
        currency
      )
      const rateFor = (from: string): number => rates.get(from) ?? 1

      if (props.mode === 'options') {
        props.onInsert(
          picked.flatMap((entry) =>
            entry.kind === 'package'
              ? [packageToOption(entry.pkg, rateFor(entry.pkg.currency))]
              : []
          ),
          notes
        )
      } else {
        props.onInsert(
          picked.flatMap((entry) =>
            entry.kind === 'item'
              ? [itemToLine(entry.item, rateFor(entry.item.currency))]
              : packageToLines(entry.pkg, rateFor(entry.pkg.currency))
          ),
          notes
        )
      }
      onClose()
    } catch (cause) {
      setError(
        cause instanceof RateError ? cause.message : 'That did not go through. Please try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  const count = chosen.length
  const nothingSaved = mode === 'options' ? packages.length === 0 : entries.length === 0

  return (
    <Modal
      open={open}
      title={mode === 'options' ? 'Add a saved package' : 'Add from templates'}
      description={
        mode === 'options'
          ? 'Each package becomes an option the client can pick, with its lines inside it.'
          : 'Everything is copied in, so you can change it on this document without touching the saved version.'
      }
      onClose={onClose}
      footer={
        nothingSaved ? (
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {error && <StatusLine tone="error">{error}</StatusLine>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button onClick={onClose} disabled={busy}>
                Cancel
              </Button>
              <Button tone="primary" onClick={() => void insert()} disabled={busy || count === 0}>
                {busy ? 'Adding…' : count === 0 ? 'Add' : `Add ${count}`}
              </Button>
            </div>
          </div>
        )
      }
    >
      {nothingSaved ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-base text-muted-foreground">
            {mode === 'options'
              ? 'You have no saved packages yet. Save one from the Templates page, or from any package on a quote.'
              : 'Nothing saved yet. Save items and packages on the Templates page, or from any line on a quote.'}
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
        <div className="flex flex-col gap-4">
          {mode === 'lines' && (
            <div
              role="group"
              aria-label="Show"
              className="flex gap-1 self-start rounded-full border border-border bg-card p-1"
            >
              {(
                [
                  ['item', `Items (${items.length})`],
                  ['package', `Packages (${packages.length})`],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={tab === value}
                  onClick={() => setTab(value)}
                  className="min-h-11 rounded-full px-4 text-sm transition-colors aria-pressed:bg-foreground aria-pressed:text-background"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <label className="sr-only" htmlFor="template-picker-search">
            Search saved {tab === 'item' ? 'items' : 'packages'}
          </label>
          <input
            id="template-picker-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tab === 'item' ? 'Search items' : 'Search packages'}
            className="min-h-11 w-full rounded-xl border border-border bg-card px-3 text-base outline-none focus-visible:border-foreground"
          />

          {visible.length === 0 ? (
            <p className="py-4 text-base text-muted-foreground">
              {search
                ? 'Nothing matches that.'
                : tab === 'item'
                  ? 'No saved items yet.'
                  : 'No saved packages yet.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {visible.map((entry) => {
                const key = keyOf(entry)
                const on = chosen.includes(key)
                const title = entry.kind === 'item' ? entry.item.title : entry.pkg.name
                const detail =
                  entry.kind === 'item'
                    ? entry.item.description ||
                      (entry.item.quantity === 1 ? '' : `Quantity ${entry.item.quantity}`)
                    : `${entry.pkg.lines.length} ${entry.pkg.lines.length === 1 ? 'line' : 'lines'}${
                        entry.pkg.pricing === 'fixed' ? ', one price' : ''
                      }`
                const entryCurrency =
                  entry.kind === 'item' ? entry.item.currency : entry.pkg.currency
                const price =
                  entry.kind === 'item'
                    ? Math.round(entry.item.quantity * entry.item.unitPriceMinor)
                    : packagePriceMinor(entry.pkg)

                return (
                  <li key={key}>
                    <label
                      className={cn(
                        'flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors',
                        on
                          ? 'border-foreground bg-muted'
                          : 'border-border hover:border-foreground/40'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        aria-label={title}
                        onChange={() => toggle(key)}
                        className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-base leading-snug break-words">{title}</span>
                        {detail && (
                          <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">
                            {detail}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-mono text-sm tabular-nums">
                          {formatMoney(price, entryCurrency)}
                        </span>
                        {entryCurrency !== currency && (
                          <span className="block text-xs text-muted-foreground">
                            Converted to {currency}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </Modal>
  )
}
