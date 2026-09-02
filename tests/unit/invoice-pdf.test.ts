/**
 * Invoice PDF rendering.
 *
 * Worth pinning because this is the failure mode that looks like success: a
 * PDF that opens, renders, and has a dead payment link, or falls back to
 * Helvetica because a font failed to decompress. Neither throws.
 */
import { describe, expect, it } from 'vitest'
import { PDFArray, PDFDocument, PDFName } from 'pdf-lib'
import { renderInvoicePdf, type InvoiceData } from '@/lib/invoice-pdf'

/** How many link annotations page one carries. pdf-lib pre-creates an empty
 *  `Annots` array on every page, so presence alone proves nothing. */
async function linkCount(bytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(bytes)
  const annots = doc.getPage(0).node.get(PDFName.of('Annots'))
  return annots instanceof PDFArray ? annots.size() : 0
}

const base: InvoiceData = {
  number: 'WHS-2026-0001',
  issuedAt: new Date('2026-09-02'),
  dueAt: new Date('2026-10-15'),
  clientName: 'Priya Raman',
  clientCompany: 'Northwind Logistics',
  clientEmail: 'priya@northwind-logistics.example',
  projectTitle: 'Freight status portal and carrier sync',
  currency: 'NGN',
  lines: [
    {
      title: 'Discovery and carrier audit',
      description: 'Two days on site mapping the current process.',
      quantity: 2,
      unitPriceMinor: 65_000,
      amountMinor: 130_000,
    },
    {
      title: 'Freight status dashboard',
      description: '',
      quantity: 1,
      unitPriceMinor: 780_000,
      amountMinor: 780_000,
    },
  ],
  subtotalMinor: 910_000,
  discountMinor: 0,
  taxRateBp: 2000,
  taxMinor: 182_000,
  totalMinor: 1_092_000,
  amountDueMinor: 436_800,
  kind: 'deposit',
  paymentTerms: '40% to start, 30% at build end, 30% on handover.',
  quoteUrl: 'https://whstd.com/quote/northwind-logistics',
  payable: true,
  studio: { name: 'WildHands', email: 'hello@whstd.com', site: 'whstd.com' },
}

describe('renderInvoicePdf', () => {
  it('produces a valid, titled PDF', async () => {
    const doc = await PDFDocument.load(await renderInvoicePdf(base))
    expect(doc.getPageCount()).toBe(1)
    expect(doc.getTitle()).toContain('WHS-2026-0001')
  }, 30_000)

  it('attaches a real, followable link annotation', async () => {
    // pdf-lib will happily write a dictionary that opens fine and links
    // nowhere: `context.obj('https://…')` becomes a PDFName, and an
    // unregistered annotation is dropped. Both were live bugs.
    expect(await linkCount(await renderInvoicePdf(base))).toBe(1)
  }, 30_000)

  it('still links back to the quote when card payment is not possible', async () => {
    // The link is never omitted. A client who cannot pay by card still needs a
    // way back to their quote; the label is what changes, not the presence.
    expect(await linkCount(await renderInvoicePdf({ ...base, payable: false }))).toBe(1)
  }, 30_000)

  it('embeds the brand typefaces rather than falling back to a standard font', async () => {
    // The woff2 files cannot go into a PDF directly; if the decompression step
    // regressed, this would quietly render in Helvetica.
    const bytes = await renderInvoicePdf(base)
    expect(bytes.length).toBeGreaterThan(20_000)
  }, 30_000)

  it('flows onto more pages rather than overrunning one', async () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      title: `Line item number ${i + 1}`,
      description: 'A description long enough to wrap across more than a single rendered line.',
      quantity: 1,
      unitPriceMinor: 50_000,
      amountMinor: 50_000,
    }))
    const doc = await PDFDocument.load(await renderInvoicePdf({ ...base, lines: many }))
    expect(doc.getPageCount()).toBeGreaterThan(1)
  }, 30_000)
})
