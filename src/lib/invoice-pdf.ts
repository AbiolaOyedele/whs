/**
 * Renders an invoice as a PDF.
 *
 * Built with pdf-lib and the studio's own typefaces rather than a headless
 * browser. A browser would give pixel-identical HTML, but it means shipping
 * Chromium into a serverless function for one document a client downloads
 * occasionally: slow cold starts, a large bundle, and a new class of failure.
 *
 * ON BRAND, properly. `wawoff2` decompresses the site's woff2 files to TTF at
 * request time so pdf-lib can embed them — PDFs cannot use woff2, and the
 * alternative was Helvetica, which is not the brand. The same Diagramm and IBM
 * Plex Sans the site uses therefore appear in the invoice.
 *
 * The payment link is a real PDF link annotation, not blue text: a client
 * opening this on a phone should be able to tap it.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, PDFName, PDFString, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { decompress } from 'wawoff2'
import { MARK_PATHS, MARK_VIEW_BOX } from '@/components/ui/logo-paths'
import { formatMoney } from '@/lib/admin/money'

/* Brand colours, converted from the oklch tokens in global.css. Kept here as
   plain sRGB because PDF has no oklch and no CSS variables. */
const INK = rgb(0.075, 0.075, 0.078) // --foreground  #131314
const MUTED = rgb(0.4, 0.392, 0.427) // --muted-foreground #66646d
const LINE = rgb(0.875, 0.888, 0.902) // --border #dfe3e6
const ACCENT = rgb(0.745, 0.988, 0.396) // --accent #befc65

const A4 = { width: 595.28, height: 841.89 }
const MARGIN = 48

export interface InvoiceLine {
  title: string
  description: string
  quantity: number
  unitPriceMinor: number
  amountMinor: number
}

export interface InvoiceData {
  number: string
  issuedAt: Date
  dueAt: Date | null
  clientName: string
  clientCompany: string | null
  clientEmail: string | null
  projectTitle: string
  currency: string
  lines: InvoiceLine[]
  subtotalMinor: number
  discountMinor: number
  taxRateBp: number
  taxMinor: number
  totalMinor: number
  /** What this invoice is actually asking for now. */
  amountDueMinor: number
  kind: 'deposit' | 'balance' | 'full'
  paymentTerms: string
  /** The quote's own URL. Always present: the client always gets a way back. */
  quoteUrl: string
  /** Whether card payment can actually complete for this currency. */
  payable: boolean
  studio: { name: string; email: string; site: string }
}

/** Loads a brand font and decompresses it to something PDF can embed. */
async function brandFont(doc: PDFDocument, file: string): Promise<PDFFont> {
  const woff2 = await readFile(path.join(process.cwd(), 'public', 'fonts', file))
  const ttf = await decompress(woff2)
  return doc.embedFont(ttf, { subset: true })
}

interface Ctx {
  page: PDFPage
  display: PDFFont
  body: PDFFont
  bodyMedium: PDFFont
  y: number
}

/** Wraps text to a width, returning the lines. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
        out.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    out.push(line)
  }
  return out
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export async function renderInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)

  const [display, body, bodyMedium] = await Promise.all([
    brandFont(doc, 'Diagramm-Medium.woff2'),
    brandFont(doc, 'IBMPlexSans-400.woff2'),
    brandFont(doc, 'IBMPlexSans-500.woff2'),
  ])

  doc.setTitle(`Invoice ${data.number} — ${data.studio.name}`)
  doc.setAuthor(data.studio.name)
  doc.setSubject(data.projectTitle)
  doc.setCreator(data.studio.name)

  let page = doc.addPage([A4.width, A4.height])
  const inner = A4.width - MARGIN * 2
  const money = (minor: number) => formatMoney(minor, data.currency)

  const ctx: Ctx = { page, display, body, bodyMedium, y: A4.height - MARGIN }

  /** Starts a new page when the next block would not fit. */
  const ensure = (needed: number) => {
    if (ctx.y - needed > MARGIN + 40) return
    page = doc.addPage([A4.width, A4.height])
    ctx.page = page
    ctx.y = A4.height - MARGIN
  }

  const text = (
    value: string,
    options: {
      size?: number
      font?: PDFFont
      colour?: typeof INK
      x?: number
      align?: 'right'
    } = {}
  ) => {
    const size = options.size ?? 10
    const font = options.font ?? ctx.body
    const width = font.widthOfTextAtSize(value, size)
    const x = options.align === 'right' ? A4.width - MARGIN - width : (options.x ?? MARGIN)
    ctx.page.drawText(value, { x, y: ctx.y, size, font, color: options.colour ?? INK })
  }

  const rule = () => {
    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y },
      end: { x: A4.width - MARGIN, y: ctx.y },
      thickness: 0.75,
      color: LINE,
    })
  }

  /* --- Header ------------------------------------------------------------
   *
   * The real "whs." mark, drawn from the same path data the site's Logo
   * component uses, rather than the studio name set in a typeface. Setting the
   * name as text was close but it was not the logo, and this is a document
   * that goes out under the brand.
   *
   * SVG's y-axis points down and PDF's points up, so the artwork is flipped and
   * translated into place. Scale comes from the mark's own viewBox, so a change
   * to the artwork does not need a matching change to a magic number here.
   */
  const viewBox = MARK_VIEW_BOX.split(' ').map(Number)
  const vbX = viewBox[0] ?? 0
  const vbY = viewBox[1] ?? 0
  const vbH = viewBox[3] ?? 1
  const logoHeight = 15
  const logoScale = logoHeight / vbH

  ctx.y -= 6
  for (const shape of MARK_PATHS) {
    ctx.page.drawSvgPath(shape.d, {
      x: MARGIN - vbX * logoScale,
      y: ctx.y + logoHeight + vbY * logoScale,
      scale: logoScale,
      color: shape.accent ? ACCENT : INK,
    })
  }

  text('INVOICE', { size: 10, font: bodyMedium, colour: MUTED, align: 'right' })

  ctx.y -= 18
  text(data.studio.site, { size: 9, colour: MUTED })
  text(data.number, { size: 16, font: display, align: 'right' })

  ctx.y -= 12
  text(data.studio.email, { size: 9, colour: MUTED })

  ctx.y -= 26
  rule()

  /* --- Parties and dates ------------------------------------------------ */
  ctx.y -= 22
  text('Billed to', { size: 8, font: bodyMedium, colour: MUTED })
  text('Issued', { size: 8, font: bodyMedium, colour: MUTED, x: MARGIN + inner * 0.55 })
  if (data.dueAt) {
    text('Due', { size: 8, font: bodyMedium, colour: MUTED, x: MARGIN + inner * 0.78 })
  }

  ctx.y -= 14
  text(data.clientCompany || data.clientName, { size: 11, font: bodyMedium })
  text(dateFormat.format(data.issuedAt), { size: 10, x: MARGIN + inner * 0.55 })
  if (data.dueAt) {
    text(dateFormat.format(data.dueAt), { size: 10, x: MARGIN + inner * 0.78 })
  }

  if (data.clientCompany) {
    ctx.y -= 13
    text(data.clientName, { size: 10, colour: MUTED })
  }
  if (data.clientEmail) {
    ctx.y -= 13
    text(data.clientEmail, { size: 10, colour: MUTED })
  }

  /* --- Project ---------------------------------------------------------- */
  ctx.y -= 30
  text('Project', { size: 8, font: bodyMedium, colour: MUTED })
  ctx.y -= 15
  for (const line of wrap(data.projectTitle, display, 13, inner)) {
    text(line, { size: 13, font: display })
    ctx.y -= 17
  }

  /* --- Line items ------------------------------------------------------- */
  ctx.y -= 14
  rule()
  ctx.y -= 15
  text('Description', { size: 8, font: bodyMedium, colour: MUTED })
  text('Amount', { size: 8, font: bodyMedium, colour: MUTED, align: 'right' })
  ctx.y -= 10
  rule()

  for (const line of data.lines) {
    ensure(60)
    ctx.y -= 18
    text(line.title, { size: 10.5, font: bodyMedium })
    text(money(line.amountMinor), { size: 10.5, align: 'right' })

    if (line.description) {
      for (const wrapped of wrap(line.description, body, 9, inner * 0.66)) {
        ctx.y -= 12
        text(wrapped, { size: 9, colour: MUTED })
      }
    }
    if (line.quantity !== 1) {
      ctx.y -= 12
      text(`${line.quantity} × ${money(line.unitPriceMinor)}`, { size: 9, colour: MUTED })
    }

    ctx.y -= 12
    rule()
  }

  /* --- Totals ----------------------------------------------------------- */
  const totalRow = (label: string, value: string, emphasis = false) => {
    ctx.y -= emphasis ? 20 : 16
    const font = emphasis ? display : body
    const size = emphasis ? 13 : 10
    text(label, { size, font: emphasis ? display : bodyMedium, x: MARGIN + inner * 0.55 })
    text(value, { size, font, align: 'right' })
  }

  ensure(120)
  totalRow('Subtotal', money(data.subtotalMinor))
  if (data.discountMinor > 0) totalRow('Discount', `- ${money(data.discountMinor)}`)
  if (data.taxRateBp > 0) totalRow(`Tax (${data.taxRateBp / 100}%)`, money(data.taxMinor))
  totalRow('Quote total', money(data.totalMinor))

  ctx.y -= 8
  ctx.page.drawLine({
    start: { x: MARGIN + inner * 0.55, y: ctx.y },
    end: { x: A4.width - MARGIN, y: ctx.y },
    thickness: 0.75,
    color: LINE,
  })

  const dueLabel =
    data.kind === 'deposit'
      ? 'Due now (deposit)'
      : data.kind === 'balance'
        ? 'Balance due'
        : 'Due now'
  totalRow(dueLabel, money(data.amountDueMinor), true)

  /* --- Payment ---------------------------------------------------------- */
  {
    ensure(110)
    ctx.y -= 34

    /*
     * There is always a link, and the label tells the truth about it.
     *
     * It used to be omitted entirely when the currency was one Paystack cannot
     * charge, which meant a GBP invoice arrived with no way back to the quote
     * at all. The dead-end this was avoiding is a button that says "pay" and
     * cannot; the fix is honest labelling, not removing the link.
     */
    const buttonHeight = 30
    const label = data.payable ? 'Pay this invoice' : 'View your quote online'
    const labelWidth = bodyMedium.widthOfTextAtSize(label, 11)
    const buttonWidth = labelWidth + 34

    ctx.page.drawRectangle({
      x: MARGIN,
      y: ctx.y - 9,
      width: buttonWidth,
      height: buttonHeight,
      color: data.payable ? ACCENT : rgb(1, 1, 1),
      borderColor: data.payable ? ACCENT : LINE,
      borderWidth: 1,
    })
    ctx.page.drawText(label, {
      x: MARGIN + 17,
      y: ctx.y,
      size: 11,
      font: bodyMedium,
      color: INK,
    })

    /*
     * A real link annotation, so it is tappable in any reader. Text styled to
     * look like a link but doing nothing is the usual failure here.
     *
     * Two details pdf-lib will silently let you get wrong:
     *
     *  - `context.obj()` turns a bare JS string into a PDFName, so the URL has
     *    to be an explicit PDFString. As a name it is written as `/https://…`
     *    and no reader follows it.
     *  - the annotation must be REGISTERED as an indirect object and the page
     *    given its ref. Setting the dictionary inline produces a file that
     *    opens fine and has no working link, which is the worst kind of bug:
     *    it looks finished.
     */
    const annotationRef = doc.context.register(
      doc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [MARGIN, ctx.y - 9, MARGIN + buttonWidth, ctx.y - 9 + buttonHeight],
        Border: [0, 0, 0],
        A: doc.context.obj({
          Type: 'Action',
          S: 'URI',
          URI: PDFString.of(data.quoteUrl),
        }),
      })
    )
    ctx.page.node.set(PDFName.of('Annots'), doc.context.obj([annotationRef]))

    ctx.y -= 22
    for (const line of wrap(data.quoteUrl, body, 8, inner)) {
      text(line, { size: 8, colour: MUTED })
      ctx.y -= 10
    }

    if (!data.payable) {
      ctx.y -= 6
      for (const line of wrap(
        `We cannot take card payments in ${data.currency}. Reply to our email and we will send bank transfer details.`,
        body,
        9,
        inner
      )) {
        text(line, { size: 9, colour: MUTED })
        ctx.y -= 11
      }
    }
  }

  if (data.paymentTerms) {
    ensure(70)
    ctx.y -= 26
    text('Payment terms', { size: 8, font: bodyMedium, colour: MUTED })
    ctx.y -= 14
    for (const line of wrap(data.paymentTerms, body, 9, inner)) {
      ensure(20)
      text(line, { size: 9, colour: MUTED })
      ctx.y -= 12
    }
  }

  /* --- Footer on every page -------------------------------------------- */
  const pages = doc.getPages()
  pages.forEach((sheet, index) => {
    sheet.drawText(
      `${data.number}  ·  ${data.studio.name}  ·  Page ${index + 1} of ${pages.length}`,
      { x: MARGIN, y: MARGIN - 16, size: 8, font: body, color: MUTED }
    )
  })

  return doc.save()
}
