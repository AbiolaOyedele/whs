import { Fragment } from 'react'
import type { TitlePart } from '@v2/content/use-cases'

interface TitleTextProps {
  parts: TitlePart[]
}

/** Heading runs joined by spaces. */
export function TitleText({ parts }: TitleTextProps) {
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 ? ' ' : null}
          {part.text}
        </Fragment>
      ))}
    </>
  )
}
