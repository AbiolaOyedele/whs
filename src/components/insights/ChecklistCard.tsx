/**
 * Section-aware checklist card.
 *
 * Sticks beside the article on desktop and swaps its contents as the
 * reader scrolls — the visible section's items are the ones on the
 * card, so a reader never has to hunt down a fifteenth line-item in a
 * long sidebar to know if their own site does it.
 *
 * Wiring:
 *   - Each `section.id` matches the slug of a `##` heading in the
 *     article body (Astro adds ids to headings via remark-slug at
 *     build time).
 *   - An IntersectionObserver watches those headings. The heading that
 *     most recently crossed into view sets the active section.
 *   - Ticked state is per-article, not per-section, so cycling
 *     through sections never loses what the reader has already
 *     checked.
 *   - Ticks are persisted to localStorage per article — private to the
 *     browser, no server round trip.
 */
import { useEffect, useMemo, useRef, useState } from 'react'

export interface ChecklistItem {
  id: string
  title: string
  description?: string | undefined
}

export interface ChecklistSection {
  id: string
  label: string
  items: ChecklistItem[]
}

interface Props {
  slug: string
  sections: ChecklistSection[]
}

const STORAGE_KEY_PREFIX = 'wh-checklist:'

function readStored(slug: string, validIds: Set<string>): Set<string> {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${slug}`)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    /* Filter against current items so a stale entry for a removed
       item does not skew the counter. */
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id)))
  } catch {
    return new Set()
  }
}

function writeStored(slug: string, ids: Set<string>): void {
  try {
    window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${slug}`, JSON.stringify([...ids]))
  } catch {
    /* Storage full or blocked; the in-memory state still works. */
  }
}

export default function ChecklistCard({ slug, sections }: Props) {
  /* Total items across every section — the header "of N done" counter
     tracks the whole article, not just the visible section. */
  const allItemIds = useMemo(() => {
    const set = new Set<string>()
    for (const section of sections) for (const item of section.items) set.add(item.id)
    return set
  }, [sections])

  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')
  const cardRef = useRef<HTMLElement | null>(null)

  /* SSR renders unchecked; the first client render matches, and this
     effect then hydrates from storage. Prevents a hydration warning. */
  useEffect(() => {
    setChecked(readStored(slug, allItemIds))
    setHydrated(true)
  }, [slug, allItemIds])

  /* Which section is currently in view. Observes each heading; the
     entry whose top just crossed the trigger line becomes active.
     `rootMargin` keeps the active heading a little below the top of
     the viewport so the swap happens as the reader arrives at the
     next section, not as they leave the previous one. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        /* Multiple entries can fire in one callback (fast scroll, or
           several sections short enough to be simultaneously in view).
           Take the topmost one that is intersecting. */
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const first = visible[0]
        if (first?.target instanceof HTMLElement) setActiveId(first.target.id)
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    )

    for (const target of targets) observer.observe(target)
    return () => observer.disconnect()
  }, [sections])

  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0]

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

  const total = allItemIds.size
  const done = checked.size
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  if (!activeSection) return null

  return (
    <aside
      ref={cardRef}
      className="rounded-3xl border border-border bg-card p-6 md:p-8"
    >
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

      <p className="mt-3 text-base">
        <span className="font-mono tabular-nums">{done}</span>{' '}
        <span className="text-muted-foreground">of {total} done</span>
      </p>

      {/* Whole-article progress bar. The section below changes as the
          reader scrolls but this bar always reflects the full picture. */}
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

      {/* Dots per section so the reader can see where they are and jump
          around. Clicking scrolls the heading into view. */}
      <ol className="mt-6 flex flex-wrap gap-1.5">
        {sections.map((section) => {
          const sectionDone = section.items.every((item) => checked.has(item.id))
          const isActive = section.id === activeSection.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs transition-colors ${
                  isActive
                    ? 'border-foreground bg-foreground text-background'
                    : sectionDone
                      ? 'border-accent bg-accent/10 text-foreground'
                      : 'border-border bg-transparent text-muted-foreground hover:border-foreground'
                }`}
              >
                {section.label}
                {sectionDone && (
                  <span aria-hidden="true" className="ml-1.5">
                    ✓
                  </span>
                )}
              </a>
            </li>
          )
        })}
      </ol>

      {/* The active section's items. Keyed on the section id so React
          swaps the whole list when the section changes and the
          animation reads cleanly. */}
      <div
        key={activeSection.id}
        className="mt-6 animate-[fade-in_200ms_ease-out]"
      >
        <h3 className="font-display text-lg">{activeSection.label}</h3>
        <ul className="mt-4 flex flex-col gap-3">
          {activeSection.items.map((item) => {
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
                  <span className="min-w-0 flex-1 text-base">
                    <span
                      className={`block leading-snug ${
                        isChecked ? 'text-muted-foreground line-through' : 'text-foreground'
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.description && (
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Ticks are saved to this browser only.
      </p>
    </aside>
  )
}
