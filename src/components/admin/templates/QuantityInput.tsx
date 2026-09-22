/**
 * A quantity field, styled and stepped like the quote editor's own so a saved
 * line looks the same wherever it is edited.
 */

interface Props {
  value: number
  onChange: (value: number) => void
}

export function QuantityInput({ value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted-foreground">Quantity</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="0.25"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="min-h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-right font-mono text-base outline-none focus-visible:border-foreground"
      />
    </label>
  )
}
