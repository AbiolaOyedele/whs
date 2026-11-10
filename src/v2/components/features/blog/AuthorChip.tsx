import type { Author } from '@v2/content/blog'
import { LogoMark } from '@v2/components/ui/LogoMark'

interface AuthorChipProps {
  author: Author
}

/** Who wrote it: the WildHands mark in a round badge, the name and the role, on a white card. */
export function AuthorChip({ author }: AuthorChipProps) {
  return (
    <div className="flex max-w-95 min-w-60 items-center gap-3.5 rounded-sm bg-white px-3.5 py-3 text-left">
      <div className="flex h-12.5 w-12.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-charcoal">
        <LogoMark className="w-[62%] text-white" />
      </div>
      <p className="text-body-md">
        {author.name}
        <br />
        <span className="text-navy-900">{author.role}</span>
      </p>
    </div>
  )
}
