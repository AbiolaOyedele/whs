/**
 * Templates: saved work going into quotes and invoices, and quotes becoming
 * templates. The same cases as Rayo's copy of this file, against WildHands'
 * own modules.
 *
 * The failures worth guarding are the quiet money ones: a line detached from
 * its package and charged in base scope, a fixed-price package spread across
 * lines at invented prices, a conversion applied twice or not at all, and a
 * template saved from a quote that the quote itself would then refuse.
 */
import { describe, expect, it } from 'vitest'
import { computeTotals } from '@/lib/admin/money'
import {
  quoteTemplateBodySchema,
  quoteTemplateSchema,
  savedItemSchema,
  savedPackageSchema,
} from '@/lib/schemas/templates'
import { saveQuoteSchema } from '@/lib/schemas/quotes'
import {
  applyTemplateToQuote,
  itemToLine,
  linesToInvoiceLines,
  minorToDecimal,
  packageToLines,
  packageToOption,
  quoteToTemplateBody,
} from '@/lib/admin/template-apply'
import type { Quote } from '@/types/quote'
import type { QuoteTemplate, SavedPackage, TemplateLibrary } from '@/types/templates'

const devTemplateLibrary: TemplateLibrary = {
  items: [
    {
      id: '00000000-0000-4000-8000-0000000e0001',
      title: 'Logo design',
      description: 'Three initial routes, two rounds of refinement, final files in every format.',
      quantity: 1,
      unitPriceMinor: 185_000_00,
      currency: 'NGN',
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
    {
      id: '00000000-0000-4000-8000-0000000e0002',
      title: 'Social media kit',
      description: 'Profile and cover artwork sized for Instagram, X and LinkedIn.',
      quantity: 1,
      unitPriceMinor: 72_500_00,
      currency: 'NGN',
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
    {
      id: '00000000-0000-4000-8000-0000000e0003',
      title: 'Design day rate',
      description: '',
      quantity: 2,
      unitPriceMinor: 95_000_00,
      currency: 'NGN',
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
  ],
  packages: [
    {
      id: '00000000-0000-4000-8000-0000000e0101',
      name: 'Starter brand kit',
      description: 'Everything a new business needs to look like itself.',
      currency: 'GBP',
      pricing: 'fixed',
      fixedPriceMinor: 1_450_00,
      lines: [
        { title: 'Logo and wordmark', description: '', quantity: 1, unitPriceMinor: 0 },
        { title: 'Colour palette', description: '', quantity: 1, unitPriceMinor: 0 },
        { title: 'Type pairing', description: '', quantity: 1, unitPriceMinor: 0 },
      ],
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
    {
      id: '00000000-0000-4000-8000-0000000e0102',
      name: 'Website care',
      description: 'Monthly upkeep for a small site.',
      currency: 'NGN',
      pricing: 'itemised',
      fixedPriceMinor: 0,
      lines: [
        { title: 'Hosting and backups', description: '', quantity: 1, unitPriceMinor: 25_000_00 },
        {
          title: 'Content updates',
          description: 'Up to four hours.',
          quantity: 4,
          unitPriceMinor: 12_500_00,
        },
      ],
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
  ],
  quoteTemplates: [
    {
      id: '00000000-0000-4000-8000-0000000e0201',
      name: 'Brand identity project',
      description: 'Three tiers, a four-phase timeline and the standard terms.',
      currency: 'NGN',
      body: {
        projectSummary: 'A complete identity: the mark, how it is used, and the files to use it.',
        introNote: '',
        paymentTerms: 'Half up front, half on delivery.',
        terms: '',
        discountMinor: 0,
        taxRateBp: 750,
        depositPercent: 50,
        options: [
          {
            id: 'tpl-essential',
            kind: 'package',
            title: 'Essential',
            description: 'The mark and a one-page guide.',
            isDefault: false,
            pricing: 'fixed',
            fixedPriceMinor: 450_000_00,
          },
          {
            id: 'tpl-complete',
            kind: 'package',
            title: 'Complete',
            description: 'The full system.',
            isDefault: true,
            pricing: 'itemised',
            fixedPriceMinor: 0,
          },
        ],
        lineItems: [
          {
            title: 'Discovery workshop',
            description: '',
            quantity: 1,
            unitPriceMinor: 120_000_00,
            isOptional: false,
            optionId: null,
          },
          {
            title: 'Logo and wordmark',
            description: '',
            quantity: 1,
            unitPriceMinor: 0,
            isOptional: false,
            optionId: 'tpl-essential',
          },
          {
            title: 'Identity system',
            description: 'Logo, colour, type, patterns.',
            quantity: 1,
            unitPriceMinor: 650_000_00,
            isOptional: false,
            optionId: 'tpl-complete',
          },
        ],
        phases: [
          {
            title: 'Discovery',
            description: '',
            durationLabel: '1 week',
            deliverables: ['Workshop', 'Brief'],
          },
        ],
        references: [],
      },
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
  ],
}

/* A quote with one base line, an itemised package with a line in it, and a
   phase. Enough shape to round-trip; the figures are arbitrary. */
const devQuoteDetail: Quote = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'ada-nwosu',
  status: 'draft',
  clientName: 'Ada Nwosu',
  clientCompany: 'Nwosu Freight',
  projectTitle: 'Consignment tracker',
  currency: 'NGN',
  totalMinor: 0,
  validUntil: null,
  createdAt: '2026-09-01T09:00:00.000Z',
  updatedAt: '2026-09-01T09:00:00.000Z',
  sentAt: null,
  firstViewedAt: null,
  lastViewedAt: null,
  viewCount: 0,
  clientEmail: null,
  clientRole: null,
  projectSummary: 'Track every consignment and tell customers where it is.',
  introNote: '',
  discountMinor: 0,
  taxRateBp: 750,
  depositPercent: 40,
  paymentTerms: 'Half up front.',
  terms: '',
  decisionNote: null,
  decidedAt: null,
  lineItems: [
    {
      id: 'l1',
      position: 0,
      title: 'Discovery',
      description: '',
      quantity: 1,
      unitPriceMinor: 45_000_00,
      isOptional: false,
      optionId: null,
    },
    {
      id: 'l2',
      position: 1,
      title: 'Tracking dashboard',
      description: '',
      quantity: 2,
      unitPriceMinor: 35_000_00,
      isOptional: false,
      optionId: 'o1',
    },
  ],
  options: [
    {
      id: 'o1',
      kind: 'package',
      position: 0,
      title: 'Standard',
      description: '',
      isSelected: true,
      isDefault: true,
      pricing: 'itemised',
      fixedPriceMinor: 0,
    },
  ],
  phases: [
    {
      id: 'p1',
      position: 0,
      title: 'Build',
      description: '',
      durationLabel: '3 weeks',
      deliverables: ['Dashboard'],
    },
  ],
  references: [],
  images: [],
}

const [logo] = devTemplateLibrary.items
const fixedKit = devTemplateLibrary.packages.find((p) => p.pricing === 'fixed') as SavedPackage
const itemisedCare = devTemplateLibrary.packages.find(
  (p) => p.pricing === 'itemised'
) as SavedPackage
const brandTemplate = devTemplateLibrary.quoteTemplates[0] as QuoteTemplate

describe('itemToLine', () => {
  it('copies the item into base scope at its own price when the currency matches', () => {
    const line = itemToLine(logo!, 1)
    expect(line).toMatchObject({
      title: 'Logo design',
      quantity: 1,
      unitPriceMinor: 185_000_00,
      optionId: null,
      isOptional: false,
    })
  })

  it('converts the price once, at the rate given', () => {
    expect(itemToLine(logo!, 0.0005).unitPriceMinor).toBe(9250)
  })
})

describe('packageToLines', () => {
  it('keeps an itemised package as its own priced lines', () => {
    const lines = packageToLines(itemisedCare, 1)
    expect(lines.map((line) => line.unitPriceMinor)).toEqual([25_000_00, 12_500_00])
    expect(lines.every((line) => line.optionId === null)).toBe(true)
  })

  it('turns a fixed-price package into ONE line at that price, listing what it covers', () => {
    const lines = packageToLines(fixedKit, 2)
    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatchObject({
      title: 'Starter brand kit',
      quantity: 1,
      unitPriceMinor: 2_900_00,
    })
    expect(lines[0]?.description).toContain(
      'Includes: Logo and wordmark, Colour palette, Type pairing.'
    )
  })
})

describe('packageToOption', () => {
  it('offers the package without pre-selecting it', () => {
    const { option } = packageToOption(itemisedCare, 1)
    expect(option).toMatchObject({ kind: 'package', isSelected: false, isDefault: false })
  })

  it('under a fixed price, carries the price on the option and none on the lines', () => {
    const { option, lines } = packageToOption(fixedKit, 1)
    expect(option).toMatchObject({ pricing: 'fixed', fixedPriceMinor: 1_450_00 })
    expect(lines.every((line) => line.unitPriceMinor === 0)).toBe(true)
  })
})

describe('invoice lines', () => {
  it('writes rates as plain decimals the invoice form parses', () => {
    expect(minorToDecimal(185_000_00)).toBe('185000.00')
    expect(minorToDecimal(5)).toBe('0.05')
    expect(minorToDecimal(1234, 0)).toBe('1234')
  })

  it('clips long descriptions to the invoice limit instead of failing on submit', () => {
    const [line] = linesToInvoiceLines([
      { ...itemToLine(logo!, 1), description: 'word '.repeat(200) },
    ])
    expect(line!.description.length).toBeLessThanOrEqual(500)
    expect(line!.description.endsWith('…')).toBe(true)
    expect(line!.rate).toBe('185000.00')
    expect(line!.quantity).toBe('1')
  })
})

describe('applyTemplateToQuote', () => {
  const quote: Quote = { ...devQuoteDetail, currency: 'NGN' }

  it('keeps who the quote is for and replaces the body', () => {
    const next = applyTemplateToQuote(quote, brandTemplate, 1)
    expect(next.clientName).toBe(quote.clientName)
    expect(next.projectTitle).toBe(quote.projectTitle)
    expect(next.slug).toBe(quote.slug)
    expect(next.images).toBe(quote.images)
    expect(next.options.map((option) => option.title)).toEqual(['Essential', 'Complete'])
    expect(next.phases).toHaveLength(1)
  })

  it('points every line at its option by the new id, so nothing drops into base scope', () => {
    const next = applyTemplateToQuote(quote, brandTemplate, 1)
    const ids = new Set(next.options.map((option) => option.id))
    const scoped = next.lineItems.filter((item) => item.optionId !== null)
    expect(scoped).toHaveLength(2)
    expect(scoped.every((item) => ids.has(item.optionId!))).toBe(true)
    /* The one base-scope line stays in base scope. */
    expect(next.lineItems.filter((item) => item.optionId === null).map((i) => i.title)).toEqual([
      'Discovery workshop',
    ])
  })

  it('pre-selects the recommended package, as a freshly sent quote would', () => {
    const next = applyTemplateToQuote(quote, brandTemplate, 1)
    expect(next.options.find((option) => option.title === 'Complete')?.isSelected).toBe(true)
    expect(next.options.find((option) => option.title === 'Essential')?.isSelected).toBe(false)
  })

  it('converts every amount by the same rate', () => {
    const next = applyTemplateToQuote(quote, brandTemplate, 0.5)
    expect(next.lineItems[0]?.unitPriceMinor).toBe(60_000_00)
    expect(next.options[0]?.fixedPriceMinor).toBe(225_000_00)
  })

  it('never blanks text the quote already has with an empty template field', () => {
    const next = applyTemplateToQuote({ ...quote, terms: 'Our terms.' }, brandTemplate, 1)
    expect(next.terms).toBe('Our terms.')
  })

  it('totals the same as the template priced by hand', () => {
    const next = applyTemplateToQuote(quote, brandTemplate, 1)
    const totals = computeTotals({
      lineItems: next.lineItems,
      options: next.options,
      discountMinor: next.discountMinor,
      taxRateBp: next.taxRateBp,
      depositPercent: next.depositPercent,
    })
    /* Discovery 120k in base scope + Complete (itemised, 650k) selected. */
    expect(totals.subtotalMinor).toBe(770_000_00)
  })
})

describe('quoteToTemplateBody', () => {
  it('round-trips: a template made from a quote applies back to the same body', () => {
    const body = quoteToTemplateBody(devQuoteDetail)
    const template: QuoteTemplate = { ...brandTemplate, currency: devQuoteDetail.currency, body }
    const back = applyTemplateToQuote(devQuoteDetail, template, 1)
    expect(back.lineItems.map((i) => [i.title, i.unitPriceMinor])).toEqual(
      devQuoteDetail.lineItems.filter((i) => i.title.trim()).map((i) => [i.title, i.unitPriceMinor])
    )
  })

  it('skips untitled rows and drops lines whose option was skipped with them', () => {
    const quote: Quote = {
      ...devQuoteDetail,
      options: [
        { ...brandTemplate.body.options[0]!, id: 'kept', position: 0, isSelected: false },
        {
          ...brandTemplate.body.options[1]!,
          id: 'blank',
          title: '  ',
          position: 1,
          isSelected: false,
        },
      ],
      lineItems: [
        {
          id: 'a',
          position: 0,
          title: 'In kept',
          description: '',
          quantity: 1,
          unitPriceMinor: 1,
          isOptional: false,
          optionId: 'kept',
        },
        {
          id: 'b',
          position: 1,
          title: 'In blank',
          description: '',
          quantity: 1,
          unitPriceMinor: 1,
          isOptional: false,
          optionId: 'blank',
        },
        {
          id: 'c',
          position: 2,
          title: '',
          description: '',
          quantity: 1,
          unitPriceMinor: 1,
          isOptional: false,
          optionId: null,
        },
      ],
    }
    const body = quoteToTemplateBody(quote)
    expect(body.options.map((option) => option.id)).toEqual(['kept'])
    expect(body.lineItems.map((item) => item.title)).toEqual(['In kept'])
  })

  it('produces a body the template schema accepts, and a quote the quote schema accepts', () => {
    const body = quoteToTemplateBody(devQuoteDetail)
    expect(quoteTemplateBodySchema.safeParse(body).success).toBe(true)

    const applied = applyTemplateToQuote(devQuoteDetail, { ...brandTemplate, body }, 1)
    const payload = {
      ...applied,
      validUntil: applied.validUntil ?? '',
      options: applied.options.map(({ position: _p, ...option }) => option),
    }
    const parsed = saveQuoteSchema.safeParse(payload)
    expect(parsed.success, JSON.stringify(parsed.error?.issues[0])).toBe(true)
  })
})

describe('schemas', () => {
  it('refuses a template line pointing at an option the template does not have', () => {
    const body = {
      ...brandTemplate.body,
      lineItems: [{ ...brandTemplate.body.lineItems[1]!, optionId: 'missing' }],
    }
    const parsed = quoteTemplateSchema.safeParse({ name: 'X', currency: 'NGN', body })
    expect(parsed.success).toBe(false)
    expect(parsed.error?.issues[0]?.message).toMatch(/not in the template/)
  })

  it('refuses a package with no lines and an item with no name, in plain English', () => {
    const pkg = savedPackageSchema.safeParse({ name: 'Kit', currency: 'GBP', lines: [] })
    expect(pkg.error?.issues[0]?.message).toBe('A package needs at least one line.')

    const item = savedItemSchema.safeParse({ title: ' ', unitPriceMinor: 0, currency: 'GBP' })
    expect(item.error?.issues[0]?.message).toBe('Give the item a name.')
  })

  it('refuses a currency we do not support and a negative price', () => {
    expect(
      savedItemSchema.safeParse({ title: 'A', unitPriceMinor: 1, currency: 'XYZ' }).success
    ).toBe(false)
    expect(
      savedItemSchema.safeParse({ title: 'A', unitPriceMinor: -1, currency: 'GBP' }).success
    ).toBe(false)
  })
})
