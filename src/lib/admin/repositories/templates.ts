/**
 * Saved items, saved packages and quote templates.
 *
 * The studio's own library: one admin, so no per-user scoping, and the service
 * role behind the admin session check is the only way in (see 0001's posture).
 * A write by an id that matches nothing is reported as "not found" rather than
 * as a success.
 */
import type { PostgrestError } from '@supabase/supabase-js'
import { AppError } from '@/lib/errors'
import { serviceClient } from '@/lib/supabase'
import type { CurrencyCode } from '@/types/quote'
import type {
  QuoteTemplate,
  QuoteTemplateBody,
  SavedItem,
  SavedLine,
  SavedPackage,
  TemplateLibrary,
} from '@/types/templates'
import type {
  QuoteTemplateInput,
  QuoteTemplateMetaInput,
  SavedItemInput,
  SavedPackageInput,
} from '@/lib/schemas/templates'

interface ItemRow {
  id: string
  title: string
  description: string
  quantity: number | string
  unit_price_minor: number | string
  currency: string
  created_at: string
  updated_at: string
}

interface PackageRow {
  id: string
  name: string
  description: string
  currency: string
  pricing: string
  fixed_price_minor: number | string
  lines: SavedLine[] | null
  created_at: string
  updated_at: string
}

interface TemplateRow {
  id: string
  name: string
  description: string
  currency: string
  /* Named `payload` since 0001, when the table was made and nothing used it. */
  payload: QuoteTemplateBody
  created_at: string
  updated_at: string
}

const ITEM_SELECT =
  'id, title, description, quantity, unit_price_minor, currency, created_at, updated_at'
const PACKAGE_SELECT =
  'id, name, description, currency, pricing, fixed_price_minor, lines, created_at, updated_at'
const TEMPLATE_SELECT = 'id, name, description, currency, payload, created_at, updated_at'

function fail(operation: string, error: PostgrestError): never {
  console.error(`[templates] ${operation}`, error)
  throw new AppError(
    500,
    'We could not reach the templates just then. Please try again.',
    'TEMPLATES_QUERY_FAILED'
  )
}

function notFound(what: string): never {
  throw new AppError(404, `That ${what} no longer exists.`, 'TEMPLATES_ENTRY_NOT_FOUND')
}

/* Postgres numeric and bigint can arrive as strings; the app only ever holds numbers. */
const toItem = (row: ItemRow): SavedItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  quantity: Number(row.quantity),
  unitPriceMinor: Number(row.unit_price_minor),
  currency: row.currency as CurrencyCode,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toPackage = (row: PackageRow): SavedPackage => ({
  id: row.id,
  name: row.name,
  description: row.description,
  currency: row.currency as CurrencyCode,
  pricing: row.pricing === 'fixed' ? 'fixed' : 'itemised',
  fixedPriceMinor: Number(row.fixed_price_minor),
  lines: (row.lines ?? []).map((line) => ({
    title: line.title,
    description: line.description ?? '',
    quantity: Number(line.quantity),
    unitPriceMinor: Number(line.unitPriceMinor),
  })),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toTemplate = (row: TemplateRow): QuoteTemplate => ({
  id: row.id,
  name: row.name,
  description: row.description,
  currency: row.currency as CurrencyCode,
  body: row.payload,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

/* --- Reads ---------------------------------------------------------------- */

/** Everything saved, for the pickers and the templates page. */
export async function listTemplateLibrary(): Promise<TemplateLibrary> {
  const db = serviceClient()
  const [items, packages, templates] = await Promise.all([
    db.from('saved_items').select(ITEM_SELECT).order('title'),
    db.from('saved_packages').select(PACKAGE_SELECT).order('name'),
    db.from('quote_templates').select(TEMPLATE_SELECT).order('name'),
  ])

  if (items.error) fail('LIST_ITEMS', items.error)
  if (packages.error) fail('LIST_PACKAGES', packages.error)
  if (templates.error) fail('LIST_TEMPLATES', templates.error)

  return {
    items: (items.data as ItemRow[]).map(toItem),
    packages: (packages.data as PackageRow[]).map(toPackage),
    quoteTemplates: (templates.data as TemplateRow[]).map(toTemplate),
  }
}

export async function getQuoteTemplate(id: string): Promise<QuoteTemplate | null> {
  const { data, error } = await serviceClient()
    .from('quote_templates')
    .select(TEMPLATE_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) fail('GET_TEMPLATE', error)
  return data ? toTemplate(data as TemplateRow) : null
}

/* --- Writes --------------------------------------------------------------- */

/** Creates when `id` is null, otherwise updates that item. */
export async function saveItem(id: string | null, input: SavedItemInput): Promise<SavedItem> {
  const columns = {
    title: input.title,
    description: input.description,
    quantity: input.quantity,
    unit_price_minor: input.unitPriceMinor,
    currency: input.currency,
  }

  const db = serviceClient().from('saved_items')
  const { data, error } =
    id === null
      ? await db.insert(columns).select(ITEM_SELECT).single()
      : await db.update(columns).eq('id', id).select(ITEM_SELECT).maybeSingle()

  if (error) fail(id === null ? 'CREATE_ITEM' : 'UPDATE_ITEM', error)
  if (!data) notFound('item')
  return toItem(data as ItemRow)
}

export async function savePackage(
  id: string | null,
  input: SavedPackageInput
): Promise<SavedPackage> {
  const columns = {
    name: input.name,
    description: input.description,
    currency: input.currency,
    pricing: input.pricing,
    /* Zero unless fixed, as on a quote option: no stale second figure. */
    fixed_price_minor: input.pricing === 'fixed' ? input.fixedPriceMinor : 0,
    lines: input.lines,
  }

  const db = serviceClient().from('saved_packages')
  const { data, error } =
    id === null
      ? await db.insert(columns).select(PACKAGE_SELECT).single()
      : await db.update(columns).eq('id', id).select(PACKAGE_SELECT).maybeSingle()

  if (error) fail(id === null ? 'CREATE_PACKAGE' : 'UPDATE_PACKAGE', error)
  if (!data) notFound('package')
  return toPackage(data as PackageRow)
}

/**
 * Creates a template, or replaces one's whole body when `id` is given.
 *
 * Replacing is how "save this quote over the template" works.
 */
export async function saveQuoteTemplate(
  id: string | null,
  input: QuoteTemplateInput
): Promise<QuoteTemplate> {
  const columns = {
    name: input.name,
    description: input.description,
    currency: input.currency,
    payload: input.body,
  }

  const db = serviceClient().from('quote_templates')
  const { data, error } =
    id === null
      ? await db.insert(columns).select(TEMPLATE_SELECT).single()
      : await db.update(columns).eq('id', id).select(TEMPLATE_SELECT).maybeSingle()

  if (error) fail(id === null ? 'CREATE_TEMPLATE' : 'REPLACE_TEMPLATE', error)
  if (!data) notFound('template')
  return toTemplate(data as TemplateRow)
}

/** Renames a template without touching what is in it. */
export async function renameQuoteTemplate(
  id: string,
  input: QuoteTemplateMetaInput
): Promise<QuoteTemplate> {
  const { data, error } = await serviceClient()
    .from('quote_templates')
    .update({ name: input.name, description: input.description })
    .eq('id', id)
    .select(TEMPLATE_SELECT)
    .maybeSingle()

  if (error) fail('RENAME_TEMPLATE', error)
  if (!data) notFound('template')
  return toTemplate(data as TemplateRow)
}

export type TemplateKind = 'item' | 'package' | 'quote'

const TABLES: Record<TemplateKind, 'saved_items' | 'saved_packages' | 'quote_templates'> = {
  item: 'saved_items',
  package: 'saved_packages',
  quote: 'quote_templates',
}

/**
 * Deletes one entry. Quotes and invoices it was used on are unaffected: they
 * hold their own copy, not a reference.
 */
export async function deleteTemplateEntry(kind: TemplateKind, id: string): Promise<void> {
  const { error } = await serviceClient().from(TABLES[kind]).delete().eq('id', id)
  if (error) fail('DELETE', error)
}
