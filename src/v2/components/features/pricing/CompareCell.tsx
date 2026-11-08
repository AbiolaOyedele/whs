import type { CompareValue } from '@v2/content/pricing'
import { CompareMark } from './CompareMark'

interface CompareCellProps {
  value: CompareValue
  markClassName?: string
}

/** One plan's value in a comparison row: text as it is, true/false as a tick or a dash. */
export function CompareCell({ value, markClassName }: CompareCellProps) {
  if (typeof value === 'boolean') {
    return <CompareMark included={value} {...(markClassName ? { className: markClassName } : {})} />
  }
  return <>{value}</>
}
