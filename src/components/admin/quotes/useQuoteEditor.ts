/**
 * Editor state for one quote.
 *
 * A single reducer over the whole document rather than a field-per-useState:
 * the save payload is the entire quote, totals recompute from several fields at
 * once, and the dirty flag has to mean "anything at all changed". Scattering
 * that across twenty pieces of state makes all three harder and none easier.
 *
 * The four child collections (line items, phases, references, images) all need
 * the same five operations, so they share one generic set rather than carrying
 * four near-identical copies that drift.
 */
import { useCallback, useMemo, useReducer } from 'react'
import { computeTotals } from '@/lib/admin/money'
import type {
  Quote,
  QuoteImage,
  QuoteLineItem,
  QuoteOption,
  QuotePhase,
  QuoteReference,
} from '@/types/quote'

/** Collections the generic row actions can address. */
type CollectionKey = 'lineItems' | 'options' | 'phases' | 'references' | 'images'

type RowOf<K extends CollectionKey> = Quote[K][number]

export interface EditorState {
  quote: Quote
  dirty: boolean
}

/** Local ids for rows not yet in the database. Replaced on save by real ones. */
let temporaryId = 0
const nextId = (): string => `new-${(temporaryId += 1)}`

export const BLANK_LINE_ITEM: Omit<QuoteLineItem, 'id' | 'position'> = {
  title: '',
  description: '',
  quantity: 1,
  unitPriceMinor: 0,
  isOptional: false,
  // Base scope. A new line is charged unless it is deliberately moved under an
  // option, which is the safe default: the alternative is a line the operator
  // typed a price into that quietly charges nobody.
  optionId: null,
}

export const BLANK_OPTION: Omit<QuoteOption, 'id' | 'position'> = {
  kind: 'package',
  title: '',
  description: '',
  isSelected: false,
  isDefault: false,
  // Itemised by default: it is the behaviour every existing quote already has,
  // and the one that shows a client what they are paying for line by line.
  pricing: 'itemised',
  fixedPriceMinor: 0,
}

export const BLANK_PHASE: Omit<QuotePhase, 'id' | 'position'> = {
  title: '',
  description: '',
  durationLabel: '',
  deliverables: [],
}

export const BLANK_REFERENCE: Omit<QuoteReference, 'id' | 'position'> = {
  label: '',
  url: '',
  description: '',
}

export type EditorAction =
  | { type: 'field'; patch: Partial<Quote> }
  | { type: 'addRow'; key: CollectionKey; row: Record<string, unknown> }
  | { type: 'updateRow'; key: CollectionKey; id: string; patch: Record<string, unknown> }
  | { type: 'removeRow'; key: CollectionKey; id: string }
  | { type: 'moveRow'; key: CollectionKey; id: string; direction: -1 | 1 }
  | { type: 'replaceAll'; quote: Quote; dirty: boolean }

/** Reorders by swapping with a neighbour, clamped at both ends. */
function moveWithin<T extends { id: string }>(rows: T[], id: string, direction: -1 | 1): T[] {
  const index = rows.findIndex((row) => row.id === id)
  const target = index + direction
  if (index === -1 || target < 0 || target >= rows.length) return rows

  const next = [...rows]
  const [moved] = next.splice(index, 1)
  if (moved) next.splice(target, 0, moved)
  return next
}

/** Rewrites `position` from array order, which is the only ordering that ships. */
function renumber<T extends { position: number }>(rows: T[]): T[] {
  return rows.map((row, index) => ({ ...row, position: index }))
}

function reducer(state: EditorState, action: EditorAction): EditorState {
  const { quote } = state

  const withCollection = (key: CollectionKey, rows: Array<{ id: string; position: number }>) => ({
    quote: { ...quote, [key]: renumber(rows) } as Quote,
    dirty: true,
  })

  switch (action.type) {
    case 'field':
      return { quote: { ...quote, ...action.patch }, dirty: true }

    case 'addRow':
      return withCollection(action.key, [
        ...quote[action.key],
        { ...action.row, id: nextId(), position: quote[action.key].length },
      ] as Array<{ id: string; position: number }>)

    case 'updateRow':
      return withCollection(
        action.key,
        (quote[action.key] as Array<{ id: string; position: number }>).map((row) =>
          row.id === action.id ? { ...row, ...action.patch } : row
        )
      )

    case 'removeRow':
      return withCollection(
        action.key,
        (quote[action.key] as Array<{ id: string; position: number }>).filter(
          (row) => row.id !== action.id
        )
      )

    case 'moveRow':
      return withCollection(
        action.key,
        moveWithin(
          quote[action.key] as Array<{ id: string; position: number }>,
          action.id,
          action.direction
        )
      )

    case 'replaceAll':
      return { quote: action.quote, dirty: action.dirty }

    default:
      return state
  }
}

export function useQuoteEditor(initial: Quote) {
  const [state, dispatch] = useReducer(reducer, { quote: initial, dirty: false })

  const totals = useMemo(
    () =>
      computeTotals({
        lineItems: state.quote.lineItems,
        options: state.quote.options,
        discountMinor: state.quote.discountMinor,
        taxRateBp: state.quote.taxRateBp,
        depositPercent: state.quote.depositPercent,
      }),
    [
      state.quote.lineItems,
      state.quote.options,
      state.quote.discountMinor,
      state.quote.taxRateBp,
      state.quote.depositPercent,
    ]
  )

  const setField = useCallback((patch: Partial<Quote>) => dispatch({ type: 'field', patch }), [])

  /** Typed helpers, so call sites never pass a patch the collection cannot take. */
  const rows = useMemo(
    () => ({
      add: <K extends CollectionKey>(key: K, row: Omit<RowOf<K>, 'id' | 'position'>) =>
        dispatch({ type: 'addRow', key, row: row as Record<string, unknown> }),
      update: <K extends CollectionKey>(key: K, id: string, patch: Partial<RowOf<K>>) =>
        dispatch({ type: 'updateRow', key, id, patch: patch as Record<string, unknown> }),
      remove: (key: CollectionKey, id: string) => dispatch({ type: 'removeRow', key, id }),
      move: (key: CollectionKey, id: string, direction: -1 | 1) =>
        dispatch({ type: 'moveRow', key, id, direction }),
    }),
    []
  )

  const reset = useCallback(
    (quote: Quote) => dispatch({ type: 'replaceAll', quote, dirty: false }),
    []
  )

  return { state, totals, setField, rows, reset, dispatch }
}

export type { CollectionKey, QuoteImage }
