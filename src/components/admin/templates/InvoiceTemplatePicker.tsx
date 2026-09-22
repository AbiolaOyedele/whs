/**
 * "From templates" on the new-invoice form.
 *
 * The invoice form is server-rendered Astro with a plain script, not React, so
 * this island does not own the lines. It picks, converts and hands the result
 * over as a `wh:insert-invoice-lines` event on `window`; the form's own
 * script appends the rows, exactly as it rebuilds them when restoring a draft.
 * One owner for the rows, and the island stays a picker.
 *
 * The currency is read from the form when the dialog opens rather than passed
 * in, because the operator can change it after the page has loaded.
 *
 * The dialog is portalled to <body>. This island sits inside the invoice
 * <form>, and a dialog rendered in place would put its search box in that form
 * too: pressing Enter there would submit the invoice and spend a number.
 */
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui'
import { Icon } from '@/components/ui/icons'
import { currencyMeta } from '@/lib/admin/money'
import { linesToInvoiceLines, type InvoiceLine } from '@/lib/admin/template-apply'
import type { SavedItem, SavedPackage } from '@/types/templates'
import { TemplatePicker } from './TemplatePicker'

export const INSERT_INVOICE_LINES = 'wh:insert-invoice-lines'

export interface InsertInvoiceLinesDetail {
  lines: InvoiceLine[]
  /** What was converted and at what rate, for the form to show. */
  message: string
}

interface Props {
  items: SavedItem[]
  packages: SavedPackage[]
  /** The form's currency input, read at open time. */
  currencyInputSelector: string
  fallbackCurrency: string
}

export function InvoiceTemplatePicker({
  items,
  packages,
  currencyInputSelector,
  fallbackCurrency,
}: Props) {
  const [open, setOpen] = useState(false)
  /* Stays mounted once opened, so the dialog can hand focus back to this
     button on close. Not before: <body> does not exist during the server
     render, and there is nothing to show until the first click anyway. */
  const [mounted, setMounted] = useState(false)
  const [currency, setCurrency] = useState(fallbackCurrency)

  const openPicker = (): void => {
    const input = document.querySelector<HTMLInputElement>(currencyInputSelector)
    setCurrency((input?.value || fallbackCurrency).toUpperCase())
    setMounted(true)
    setOpen(true)
  }

  return (
    <>
      <Button onClick={openPicker}>
        <Icon name="layers" className="size-4" />
        From templates
      </Button>
      {mounted &&
        createPortal(
          <TemplatePicker
            mode="lines"
            open={open}
            onClose={() => setOpen(false)}
            items={items}
            packages={packages}
            currency={currency}
            onInsert={(lines, notes) => {
              const detail: InsertInvoiceLinesDetail = {
                lines: linesToInvoiceLines(lines, currencyMeta(currency).exponent),
                message: `Added ${lines.length} ${lines.length === 1 ? 'line' : 'lines'}.${
                  notes.length > 0 ? ` Converted at ${notes.join(', ')}. Check the rates.` : ''
                }`,
              }
              window.dispatchEvent(new CustomEvent(INSERT_INVOICE_LINES, { detail }))
            }}
          />,
          document.body
        )}
    </>
  )
}
