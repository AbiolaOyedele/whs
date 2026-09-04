/**
 * The cost lines belonging to one group — base scope, or one option.
 *
 * The same editor serves both, because they are the same rows: a package's
 * "included items" are line items with that package's `option_id`, not a
 * separate kind of thing. Rendering them through two components would be two
 * places to keep the money fields in step.
 *
 * The list is filtered for display but indexed against the WHOLE collection.
 * Server-side field errors arrive keyed by absolute position
 * (`lineItems.4.title`), and reordering has to move a row past its neighbour in
 * its own group rather than whichever row happens to sit beside it in the flat
 * array.
 */
import { Button, Checkbox, CollapsibleRow, Select, TextArea, TextInput } from '../ui'
import { MoneyInput } from './MoneyInput'
import { formatMoney, lineAmount } from '@/lib/admin/money'
import type { CurrencyCode, QuoteLineItem, QuoteOption } from '@/types/quote'

/** The listbox speaks in strings, and "no option" is a choice, not an absence. */
export const BASE_SCOPE = '__base__'

interface Props {
  /** Every line on the quote, not just this group's. */
  lineItems: QuoteLineItem[]
  options: QuoteOption[]
  currency: CurrencyCode
  /** Which group to show. `null` is base scope. */
  optionId: string | null
  fieldErrors: Record<string, string>
  emptyMessage: string
  onUpdate: (id: string, patch: Partial<QuoteLineItem>) => void
  onRemove: (id: string) => void
  onReorder: (lineItems: QuoteLineItem[]) => void
}

export function LineItemList({
  lineItems,
  options,
  currency,
  optionId,
  fieldErrors,
  emptyMessage,
  onUpdate,
  onRemove,
  onReorder,
}: Props) {
  const group = lineItems
    .map((item, absoluteIndex) => ({ item, absoluteIndex }))
    .filter((entry) => entry.item.optionId === optionId)

  if (group.length === 0) {
    return <p className="text-base text-muted-foreground">{emptyMessage}</p>
  }

  /** Swaps a row with its neighbour WITHIN this group, leaving others alone. */
  const move = (position: number, direction: -1 | 1): void => {
    const target = position + direction
    const from = group[position]
    const to = group[target]
    if (!from || !to) return

    const next = [...lineItems]
    next[from.absoluteIndex] = to.item
    next[to.absoluteIndex] = from.item
    onReorder(next)
  }

  return (
    <ul className="flex flex-col gap-3">
      {group.map(({ item, absoluteIndex }, position) => (
        <CollapsibleRow
          key={item.id}
          label={String(position + 1).padStart(2, '0')}
          title={item.title}
          meta={formatMoney(lineAmount(item), currency)}
          defaultOpen={!item.title}
          actions={
            <>
              <Button tone="ghost" onClick={() => move(position, -1)} disabled={position === 0}>
                <span aria-hidden="true">↑</span>
                <span className="sr-only">Move up</span>
              </Button>
              <Button
                tone="ghost"
                onClick={() => move(position, 1)}
                disabled={position === group.length - 1}
              >
                <span aria-hidden="true">↓</span>
                <span className="sr-only">Move down</span>
              </Button>
              <Button tone="danger" onClick={() => onRemove(item.id)}>
                Remove
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <TextInput
              label="What it is"
              required
              dataField={`lineItems.${absoluteIndex}.title`}
              error={fieldErrors[`lineItems.${absoluteIndex}.title`]}
              value={item.title}
              onChange={(title) => onUpdate(item.id, { title })}
            />
            <TextArea
              label="What it includes"
              rows={2}
              value={item.description}
              onChange={(description) => onUpdate(item.id, { description })}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <input
                  type="number"
                  min={0}
                  step="0.25"
                  value={item.quantity}
                  onChange={(event) =>
                    onUpdate(item.id, { quantity: Number(event.target.value) || 0 })
                  }
                  className="min-h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-right font-mono text-base outline-none focus-visible:border-foreground"
                />
              </label>
              <MoneyInput
                label="Unit price"
                currency={currency}
                valueMinor={item.unitPriceMinor}
                onChange={(unitPriceMinor) => onUpdate(item.id, { unitPriceMinor })}
              />
              {/*
                "Optional" only means anything in base scope, where it marks a
                line as a menu item rather than a charge. Inside an option the
                client's tick already decides that, and two controls answering
                the same question is how a line ends up charged for nobody.
              */}
              {optionId === null && (
                <div className="flex items-end">
                  <Checkbox
                    label="Optional"
                    checked={item.isOptional}
                    onChange={(isOptional) => onUpdate(item.id, { isOptional })}
                  />
                </div>
              )}
            </div>

            {options.length > 0 && (
              <Select
                label="Applies to"
                value={item.optionId ?? BASE_SCOPE}
                options={[
                  { value: BASE_SCOPE, label: 'Base scope (always charged)' },
                  ...options.map((option) => ({
                    value: option.id,
                    label: `${option.title || 'Untitled'} (${
                      option.kind === 'package' ? 'package' : 'add-on'
                    })`,
                  })),
                ]}
                onChange={(value) =>
                  onUpdate(item.id, {
                    optionId: value === BASE_SCOPE ? null : value,
                    // Moving a line into an option retires its own optional
                    // flag: the option's selection is what decides now.
                    ...(value === BASE_SCOPE ? {} : { isOptional: false }),
                  })
                }
              />
            )}
          </div>
        </CollapsibleRow>
      ))}
    </ul>
  )
}
