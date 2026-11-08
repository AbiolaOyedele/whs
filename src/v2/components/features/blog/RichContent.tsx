import type { ReactNode } from 'react'
import type { RichBlock, RichText } from '@v2/content/blog'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { CodeBlock } from '@v2/components/features/blog/CodeBlock'

interface RichContentProps {
  blocks: RichBlock[]
  /** Classes on the outer wysiwyg box, e.g. spacing against what sits beside it. */
  className?: string
}

function renderText(text: RichText): ReactNode {
  if (typeof text === 'string') return text
  return text.map((part, index) => {
    if (typeof part === 'string') return part
    let node: ReactNode = part.text
    if (part.code) node = <code>{node}</code>
    if (part.strong) node = <strong>{node}</strong>
    if (part.href) node = <SmartLink href={part.href}>{node}</SmartLink>
    return <span key={index}>{node}</span>
  })
}

function renderBlock(block: RichBlock, index: number): ReactNode {
  switch (block.type) {
    case 'h2':
      return <h2 key={index}>{block.text}</h2>
    case 'h3':
      return <h3 key={index}>{block.text}</h3>
    case 'p':
      return <p key={index}>{renderText(block.text)}</p>
    case 'ul':
    case 'ol': {
      const List = block.type
      return (
        <List key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderText(item)}</li>
          ))}
        </List>
      )
    }
    case 'quote':
      return (
        <blockquote key={index}>
          <p>{block.text}</p>
        </blockquote>
      )
    case 'code':
      return <CodeBlock key={index} code={block.code} language={block.language} />
    case 'table':
      return (
        <div key={index} className="c-rich-table" role="region" aria-label={block.caption}>
          <table>
            <caption>{block.caption}</caption>
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th key={cellIndex} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={cellIndex}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

/**
 * Long-form text from the content files, in the reference's navy prose
 * style. The inner box carries `data-wysiwyg-root`, which the code and table
 * styles key off, as on the reference.
 */
export function RichContent({ blocks, className = '' }: RichContentProps) {
  return (
    <div className={`wysiwyg-navy wysiwyg ${className}`}>
      <div className="wysiwyg-navy wysiwyg" data-wysiwyg-root="">
        {blocks.map(renderBlock)}
      </div>
    </div>
  )
}
