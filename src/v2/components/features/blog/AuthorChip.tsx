import type { Author } from '@v2/content/blog'
import { ArtPanel } from '@v2/components/ui/ArtPanel'

interface AuthorChipProps {
  author: Author
  /** Seed for the round stand-in portrait. */
  seed: number
}

/** Who wrote it: a round portrait, the name and the role, on a white card. */
export function AuthorChip({ author, seed }: AuthorChipProps) {
  return (
    <div className="flex max-w-95 min-w-60 items-center gap-3.5 rounded-sm bg-white px-3.5 py-3 text-left">
      <div className="relative h-12.5 w-12.5 shrink-0 overflow-hidden rounded-full">
        <ArtPanel seed={seed} />
      </div>
      <p className="text-body-md">
        {author.name}
        <br />
        <span className="text-navy-500">{author.role}</span>
      </p>
    </div>
  )
}
