import { Icon } from '@v2/components/ui/Icon'

interface CompareMarkProps {
  included: boolean
  className?: string
}

/** A tick for "included" or a dash for "not included", with the words for screen readers. */
export function CompareMark({ included, className = 'mt-1 size-5' }: CompareMarkProps) {
  return (
    <>
      <Icon name={included ? 'check' : 'minus'} strokeWidth={2} className={className} />
      <span className="sr-only">{included ? 'Included' : 'Not included'}</span>
    </>
  )
}
