interface TagProps {
  children: string
}

/** A small mono tag, such as a role's level or location. */
export function Tag({ children }: TagProps) {
  return (
    <span className="text-label inline-flex min-h-7 items-center rounded-sm bg-slate-100 px-2.5 leading-none text-navy-900">
      {children}
    </span>
  )
}
