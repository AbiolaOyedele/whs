/**
 * The running total, shown while editing and mirrored on the client page.
 *
 * Recomputed from the same `computeTotals` the server uses, so the figure the
 * operator approves is arithmetically the figure the client sees. Two
 * implementations of this would eventually disagree, and disagreeing about a
 * price is the one bug this feature cannot afford.
 */
import { formatMoney } from '@/lib/admin/money'
import type { QuoteTotals as Totals } from '@/types/quote'

interface Props {
  totals: Totals
  currency: string
  taxRateBp: number
  depositPercent: number
}

export function QuoteTotals({ totals, currency, taxRateBp, depositPercent }: Props) {
  const money = (minor: number) => formatMoney(minor, currency)

  const rows: Array<{ label: string; value: string; muted?: boolean }> = [
    { label: 'Subtotal', value: money(totals.subtotalMinor) },
  ]

  if (totals.discountMinor > 0) {
    rows.push({ label: 'Discount', value: `− ${money(totals.discountMinor)}` })
  }
  if (taxRateBp > 0) {
    rows.push({ label: `Tax (${taxRateBp / 100}%)`, value: money(totals.taxMinor) })
  }
  if (totals.optionalMinor > 0) {
    rows.push({
      label: 'Optional extras',
      value: money(totals.optionalMinor),
      muted: true,
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-muted p-5">
      <dl className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className={row.muted ? 'text-sm text-muted-foreground' : 'text-base'}>
              {row.label}
            </dt>
            <dd
              className={
                row.muted ? 'font-mono text-sm text-muted-foreground' : 'font-mono text-base'
              }
            >
              {row.value}
            </dd>
          </div>
        ))}

        <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-border pt-3">
          <dt className="font-display text-lg">Total</dt>
          <dd className="font-mono text-lg">{money(totals.totalMinor)}</dd>
        </div>

        {depositPercent > 0 && depositPercent < 100 && (
          <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-baseline justify-between gap-4">
              <span>Deposit ({depositPercent}%)</span>
              <span className="font-mono">{money(totals.depositMinor)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span>Balance</span>
              <span className="font-mono">{money(totals.balanceMinor)}</span>
            </div>
          </div>
        )}
      </dl>

      {totals.optionalMinor > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Optional items are shown to the client and priced, but are not in the total.
        </p>
      )}
    </div>
  )
}
