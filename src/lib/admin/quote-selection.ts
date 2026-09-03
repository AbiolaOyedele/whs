/**
 * When a client may still change what they are buying.
 *
 * The rule in one sentence: a selection is editable until something has been
 * committed against it. After that it is a record, not a control.
 *
 * Two things commit a quote:
 *
 *  - A DECISION. Accepting is agreement to a specific scope at a specific
 *    price. If the selection stayed live afterwards, a client could accept
 *    Premium and then quietly move to Essential, and the accepted figure in our
 *    records would describe something nobody agreed to.
 *  - A PAYMENT. Money paid against a total is the harder version of the same
 *    problem: switch from Premium to Essential after paying 40% and the deposit
 *    can exceed the new total, which is a refund conversation created by a
 *    checkbox.
 */
import type { Quote } from '@/types/quote'
import type { QuotePayment } from './repositories/payments'

export type LockReason = 'decided' | 'paid'

export interface SelectionState {
  locked: boolean
  reason: LockReason | null
  /** Plain English, shown to the client next to the frozen options. */
  message: string | null
}

export function selectionState(
  quote: Pick<Quote, 'status' | 'decidedAt'>,
  payments: readonly QuotePayment[]
): SelectionState {
  if (payments.some((payment) => payment.status === 'paid')) {
    return {
      locked: true,
      reason: 'paid',
      message: 'Your choice is fixed now that a payment has been made.',
    }
  }

  if (quote.status === 'accepted' || quote.status === 'declined' || quote.decidedAt !== null) {
    return {
      locked: true,
      reason: 'decided',
      message: 'Your choice is fixed now that this quote has been answered.',
    }
  }

  return { locked: false, reason: null, message: null }
}
