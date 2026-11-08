import type { ElementType } from 'react'

interface LabelProps {
  children: string
  as?: ElementType
  className?: string
}

/**
 * A small mono label with a square dot. When it scrolls 20% into view the dot
 * wipes in, then the text slides in after it.
 */
export function Label({ children, as: Tag = 'h2', className = '' }: LabelProps) {
  return (
    <Tag className={`c-label ${className}`} data-scroll="" data-scroll-offset="20%">
      <span className="c-label_circle" />
      <span className="c-label_text">{children}</span>
    </Tag>
  )
}
