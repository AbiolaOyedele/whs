/**
 * The invoice ledger.
 *
 * Answers one question at a glance: what has been invoiced, and what has
 * actually been paid. Paid state comes from the payment records, so a card
 * payment and a bank transfer marked off by hand both land in the same column.
 */
import { useMemo, useState } from 'react'
import { Button, Panel, StatusLine, TextArea } from '../ui'
import { formatMoney } from '@/lib/admin/money'
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
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  const visible = useMemo(() => {
    if (filter === 'paid') return invoices.filter((invoice) => invoice.paid)
    if (filter === 'unpaid') return invoices.filter((invoice) => !invoice.paid)
    return invoices
  }, [invoices, filter])

  /* Totals per currency, never summed across them. Adding £ to ₦ produces a
     number that is wrong in both. */
  const totals = useMemo(() => {
    const outstanding: Record<string, number> = {}
    const collected: Record<string, number> = {}
    for (const invoice of invoices) {
      const bucket = invoice.paid ? collected : outstanding
      bucket[invoice.currency] = (bucket[invoice.currency] ?? 0) + invoice.amountMinor
    }
    return { outstanding, collected }
  }, [invoices])

  const markPaid = async (invoice: InvoiceListRow, reference: string) => {
    try {
      const response = await fetch(`/api/v1/admin/invoices?id=${invoice.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: reference }),
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
          <p className="text-sm text-muted-foreground">Outstanding</p>
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
                        invoice.paid
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {invoice.paid ? 'Paid' : 'Awaiting payment'}
                    </span>
                    {invoice.kind !== 'full' && (
                      <span className="text-sm text-muted-foreground capitalize">
                        {invoice.kind}
                      </span>
                    )}
                  </div>
                  <p className="font-display text-lg leading-tight">
                    {invoice.clientCompany || invoice.clientName}
                  </p>
                  <p className="text-base text-muted-foreground">{invoice.projectTitle}</p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-xl">
                    {formatMoney(invoice.amountMinor, invoice.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Issued {dateFormat.format(new Date(invoice.issuedAt))}
                  </p>
                  {invoice.paid && invoice.paidAt && (
                    <p className="text-sm text-muted-foreground">
                      Paid {dateFormat.format(new Date(invoice.paidAt))}
                      {invoice.paidVia === 'manual' ? ' by transfer' : ''}
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
                {!invoice.paid && (
                  <Button
                    onClick={() => {
                      setNote('')
                      setMarking(invoice)
                    }}
                  >
                    Mark as paid
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
            title={`Mark ${marking.number} as paid`}
            description="For payments that came in outside Paystack, like a bank transfer."
            action={
              <Button tone="ghost" onClick={() => setMarking(null)}>
                Cancel
              </Button>
            }
          >
            <TextArea
              label="Reference"
              rows={2}
              hint="Whatever helps you reconcile it later: a transfer reference, a date, a note."
              value={note}
              onChange={setNote}
            />
            <div className="mt-4">
              <Button
                tone="primary"
                onClick={() => {
                  const target = marking
                  setMarking(null)
                  if (target) void markPaid(target, note)
                }}
              >
                Record payment of {formatMoney(marking.amountMinor, marking.currency)}
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
