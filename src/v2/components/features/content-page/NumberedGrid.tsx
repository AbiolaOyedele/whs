interface NumberedGridProps {
  items: readonly { title: string; body: string }[]
  /** Columns from the tablet width up; always one on a phone. */
  columns?: 2 | 3 | 4
  /** Number each item 01, 02 and so on. */
  numbered?: boolean
}

const COLUMNS: Record<NonNullable<NumberedGridProps['columns']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/** Short points under a rule each, numbered when the order matters. */
export function NumberedGrid({ items, columns = 3, numbered = true }: NumberedGridProps) {
  const List = numbered ? 'ol' : 'ul'
  return (
    <List className={`grid gap-x-gutter gap-y-fluid-md ${COLUMNS[columns]}`}>
      {items.map((item, index) => (
        <li key={item.title} className="anim-scale border-t border-charcoal pt-5" data-scroll="">
          {numbered ? (
            <span className="text-label text-navy-900 tabular-nums" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          ) : null}
          <h3 className={`text-heading-2xs text-balance ${numbered ? 'mt-3' : ''}`}>{item.title}</h3>
          <p className="text-body-md mt-2 text-navy-900">{item.body}</p>
        </li>
      ))}
    </List>
  )
}
