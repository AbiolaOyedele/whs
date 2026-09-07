/**
 * Interactive checklist card.
 *
 * Sticks beside the article on desktop so the reader can tick items off
 * as they read. State lives in localStorage keyed by the article slug,
 * so a reader who comes back to the same article picks up exactly where
 * they left off. State is per-viewer, per-browser: it never travels to
 * the server, so there is no privacy trade-off.
 *
 * Wrapped in a try/catch on every access — storage throws outright in
 * some privacy modes, and the page must render sensibly with a fresh
 * (all-unchecked) state in that case.
 */
import { useEffect, useState } from 'react'

export interface ChecklistItem {
  id: string
  title: string
  description?: string | undefined
}

interface Props {
  slug: string
  items: ChecklistItem[]
}

const STORAGE_KEY_PREFIX = 'wh-checklist:'

function readStored(slug: string, itemIds: string[]): Set<string> {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${slug}`)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    /* Filter against the current item ids so a stale entry for an item
       that has since been removed does not skew the counter. */
    const valid = new Set(itemIds)
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && valid.has(id)))
  } catch {
    return new Set()
  }
}

function writeStored(slug: string, ids: Set<string>): void {
  try {
    window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${slug}`, JSON.stringify([...ids]))
  } catch {
    /* Storage full or blocked. The in-memory state still works for this
       session; the reader just loses persistence. */
  }
}

export default function ChecklistCard({ slug, items }: Props) {
  /* First render matches SSR (all unchecked) so hydration stays quiet.
     The effect below reads localStorage and updates once mounted. */
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setChecked(readStored(slug, items.map((item) => item.id)))
    setHydrated(true)
  }, [slug, items])

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeStored(slug, next)
      return next
    })
  }

  const clear = () => {
    setChecked(new Set())
    writeStored(slug, new Set())
  }

  const total = items.length
  const done = checked.size
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <aside className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Your checklist
        </p>
        {hydrated && done > 0 && (
          <button
            type="button"
            onClick={clear}
            className="min-h-8 rounded-full text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>

      <p className="mt-2 text-base">
        <span className="font-mono tabular-nums">{done}</span>{' '}
        <span className="text-muted-foreground">of {total} done</span>
      </p>

      {/* Progress bar — a visible read on how far the reader has come.
          `role="progressbar"` and aria attrs so assistive tech reads it. */}
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Checklist progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-5 flex flex-col gap-2.5">
        {items.map((item) => {
          const isChecked = checked.has(item.id)
          return (
            <li key={item.id}>
              <label className="group flex cursor-pointer items-start gap-3 rounded-xl px-2 py-1.5 -mx-2 transition-colors hover:bg-muted/60">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    isChecked
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border bg-background group-hover:border-foreground'
                  }`}
                >
                  {isChecked && (
                    <svg
                      viewBox="0 0 12 12"
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 6.5L5 9.5L10 3.5" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span
                    className={`block leading-snug ${
                      isChecked ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 text-xs text-muted-foreground">
        Ticks are saved to this browser only.
      </p>
    </aside>
  )
}
