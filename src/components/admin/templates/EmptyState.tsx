/**
 * What a Templates tab shows when it has nothing to list: either nothing has
 * been saved yet, which gets an explanation and a way to start, or a search
 * matched nothing, which gets neither.
 */
import type { ReactNode } from 'react'

interface Props {
  searching: boolean
  title: string
  body: string
  action: ReactNode
}

export function EmptyState({ searching, title, body, action }: Props) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-border bg-card p-8 text-center">
      <h2 className="mb-2 font-display text-xl">{searching ? 'Nothing matches that' : title}</h2>
      <p className="mb-5 max-w-md text-base text-muted-foreground">
        {searching ? 'Try a different search.' : body}
      </p>
      {!searching && action}
    </div>
  )
}
