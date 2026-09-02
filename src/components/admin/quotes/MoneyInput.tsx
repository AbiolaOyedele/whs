/**
 * A price field.
 *
 * Holds its own draft string while focused so typing "12.50" does not fight a
 * value that has already been rounded to minor units and formatted back. The
 * committed value is always integer minor units; the string is a view of it
 * that exists only between focus and blur.
 *
 * Without this, every keystroke round-trips through parse → minor units →
 * format, and a user typing "12." sees it vanish.
 */
import { useEffect, useState } from 'react'
import { currencyMeta, parseMoney } from '@/lib/admin/money'

interface Props {
  label: string
  valueMinor: number
  currency: string
  onChange: (minor: number) => void
  hint?: string
}

export function MoneyInput({ label, valueMinor, currency, onChange, hint }: Props) {
  const meta = currencyMeta(currency)
  const asMajor = (minor: number): string => (minor / 10 ** meta.exponent).toFixed(meta.exponent)

  const [draft, setDraft] = useState(() => asMajor(valueMinor))
  const [editing, setEditing] = useState(false)

  /*
   * Re-sync when the value changes underneath us (an AI draft being applied, or
   * a currency switch) but never while the field is being typed into.
   *
   * `asMajor` is deliberately not a dependency: it closes over `meta`, which is
   * derived from `currency`, and `currency` is already listed. Adding it would
   * mean memoising a one-line formatter to stop the effect firing every render.
   */
  useEffect(() => {
    if (editing) return
    setDraft((valueMinor / 10 ** meta.exponent).toFixed(meta.exponent))
  }, [valueMinor, editing, meta.exponent])

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="relative flex items-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 text-muted-foreground"
        >
          {meta.symbol}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onFocus={() => setEditing(true)}
          onChange={(event) => {
            setDraft(event.target.value)
            const parsed = parseMoney(event.target.value, currency)
            if (parsed !== null) onChange(parsed)
          }}
          onBlur={() => {
            setEditing(false)
            const parsed = parseMoney(draft, currency)
            // An unparseable field commits as zero rather than keeping a value
            // the operator can no longer see.
            onChange(parsed ?? 0)
            setDraft(asMajor(parsed ?? 0))
          }}
          className="min-h-11 w-full rounded-xl border border-border bg-card py-2 pr-3 pl-9 text-right font-mono text-base transition-colors outline-none focus-visible:border-foreground"
        />
      </span>
      {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
    </label>
  )
}
