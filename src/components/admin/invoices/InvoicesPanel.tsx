/**
 * The invoice ledger.
 *
 * Answers one question at a glance: what has been invoiced, and what has
 * actually been paid. Paid state comes from the payment records, so a card
 * payment and a bank transfer marked off by hand both land in the same column.
 */
import { useMemo, useState } from 'react'
import { Button, Panel, StatusLine, TextArea, TextInput } from '../ui'
import { formatMoney, parseMoney } from '@/lib/admin/money'
import { cn } from '@/lib/utils'
import type { InvoiceListRow } from '@/lib/admin/repositories/invoices'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

type Filter = 'all' | 'unpaid' | 'paid'

export default function InvoicesPanel({ invoices }: { invoices: InvoiceListRow[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [marking, setMarking] = useState<InvoiceListRow | null>(null)
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  const visible = useMemo(() => {
    if (filter === 'paid') return invoices.filter((invoice) => invoice.settledInFull)
    if (filter === 'unpaid') return invoices.filter((invoice) => !invoice.settledInFull)
    return invoices
  }, [invoices, filter])

  /* Totals per currency, never summed across them. Adding £ to ₦ produces a
     number that is wrong in both. */
  const totals = useMemo(() => {
    const outstanding: Record<string, number> = {}
    const collected: Record<string, number> = {}

    /* Amounts, not counts. A part-paid invoice contributes to both: what came
       in is collected, what is left is still owed. Bucketing whole invoices as
       one or the other made a 40% deposit look like nothing had been paid. */
    for (const invoice of invoices) {
      if (invoice.paidMinor > 0) {
        collected[invoice.currency] = (collected[invoice.currency] ?? 0) + invoice.paidMinor
      }
      if (invoice.outstandingMinor > 0) {
        outstanding[invoice.currency] =
          (outstanding[invoice.currency] ?? 0) + invoice.outstandingMinor
      }
    }
    return { outstanding, collected }
  }, [invoices])

  const markPaid = async (invoice: InvoiceListRow, amountMinor: number, reference: string) => {
    try {
      const response = await fetch(`/api/v1/admin/invoices?id=${invoice.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMinor, note: reference }),
      })
      if (response.ok) window.location.reload()
      else setMessage({ tone: 'error', text: 'That could not be marked as paid.' })
    } catch {
      setMessage({ tone: 'error', text: 'We could not reach the server. Try again.' })
    }
  }

  const money = (byCurrency: Record<string, number>) =>
    Object.entries(byCurrency)
      .map(([currency, total]) => formatMoney(total, currency))
      .join(' · ') || '—'

  return (
    <div>
      <div className="mb-6">
        <h1 className="wh-h3">Invoices</h1>
        <p className="mt-1 text-muted-foreground">
          Issued when a client downloads one from their quote. Numbers never change.
        </p>
      </div>

      {message && (
        <div className="mb-6">
          <StatusLine tone={message.tone}>{message.text}</StatusLine>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Still owed</p>
          <p className="mt-2 font-sans text-2xl leading-none tabular-nums">
            {money(totals.outstanding)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Collected</p>
          <p className="mt-2 font-sans text-2xl leading-none tabular-nums">
            {money(totals.collected)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Issued</p>
          <p className="mt-2 font-sans text-2xl leading-none tabular-nums">{invoices.length}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1">
        {(['all', 'unpaid', 'paid'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
            className={cn(
              'min-h-11 rounded-full px-4 text-base capitalize transition-colors',
              filter === option
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 font-display text-xl">
            {invoices.length === 0 ? 'No invoices yet' : 'Nothing in this filter'}
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            {invoices.length === 0
              ? 'An invoice is created the first time a client downloads one from their quote.'
              : 'Try another filter.'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((invoice) => (
            <li key={invoice.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-base">{invoice.number}</span>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-sm',
                        invoice.settledInFull
                          ? 'bg-accent text-accent-foreground'
                          : invoice.paidMinor > 0
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {invoice.settledInFull
                        ? 'Paid'
                        : invoice.paidMinor > 0
                          ? 'Part paid'
                          : 'Awaiting payment'}
                    </span>
                  </div>
                  <p className="font-display text-lg leading-tight">
                    {invoice.clientCompany || invoice.clientName}
                  </p>
                  <p className="text-base text-muted-foreground">{invoice.projectTitle}</p>
                </div>

                <div className="shrink-0 text-right">
                  {/* The number that matters is what is still owed, so it leads
                      and the invoice total sits under it as context. */}
                  <p className="font-mono text-xl whitespace-nowrap">
                    {invoice.settledInFull
                      ? formatMoney(invoice.amountMinor, invoice.currency)
                      : formatMoney(invoice.outstandingMinor, invoice.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.settledInFull
                      ? 'paid in full'
                      : invoice.paidMinor > 0
                        ? `outstanding of ${formatMoney(invoice.amountMinor, invoice.currency)}`
                        : 'due'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Issued {dateFormat.format(new Date(invoice.issuedAt))}
                  </p>
                  {invoice.lastPaidAt && (
                    <p className="text-sm text-muted-foreground">
                      Last payment {dateFormat.format(new Date(invoice.lastPaidAt))}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`/admin/quotes?q=${encodeURIComponent(invoice.quoteSlug)}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-base transition-colors hover:border-foreground"
                >
                  The quote
                </a>
                {!invoice.settledInFull && (
                  <Button
                    onClick={() => {
                      setNote('')
                      setAmount((invoice.outstandingMinor / 100).toFixed(2))
                      setMarking(invoice)
                    }}
                  >
                    Record a payment
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {marking && (
        <div className="mt-6">
          <Panel
            title={`Record a payment against ${marking.number}`}
            description="For money that came in outside Paystack, like a bank transfer. Part payments are fine."
            action={
              <Button tone="ghost" onClick={() => setMarking(null)}>
                Cancel
              </Button>
            }
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                label="Amount received"
                required
                hint={`Outstanding: ${formatMoney(marking.outstandingMinor, marking.currency)}`}
                value={amount}
                onChange={setAmount}
              />
              <TextArea
                label="Reference"
                rows={2}
                hint="Whatever helps you reconcile it later."
                value={note}
                onChange={setNote}
              />
            </div>
            <div className="mt-4">
              <Button
                tone="primary"
                disabled={(parseMoney(amount, marking.currency) ?? 0) <= 0}
                onClick={() => {
                  const target = marking
                  const minor = parseMoney(amount, marking.currency) ?? 0
                  setMarking(null)
                  if (target && minor > 0) void markPaid(target, minor, note)
                }}
              >
                Record payment
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
