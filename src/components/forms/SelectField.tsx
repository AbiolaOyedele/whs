/**
 * Styled single-choice select for the React forms.
 *
 * A native `<select>` renders its options through the operating system, so the
 * popup ignores every token on this site. This is a button-plus-listbox, which
 * means owning the keyboard behaviour the native control gives away free — so
 * all of it is here: arrows, Home/End, Enter/Space, Escape, Tab, and typeahead,
 * which matters because one of these lists is every country.
 *
 * The value is carried by a hidden input, so `new FormData(form)` picks it up
 * exactly as it did the `<select>` it replaces.
 */
import { useEffect, useId, useRef, useState } from 'react'

/** A plain string is both value and label; the object form separates them. */
export type SelectOption = string | { value: string; label: string }

const optionValue = (option: SelectOption) => (typeof option === 'string' ? option : option.value)
const optionLabel = (option: SelectOption) => (typeof option === 'string' ? option : option.label)

interface SelectFieldProps {
  id: string
  name: string
  options: readonly SelectOption[]
  /** Shown until something is chosen. Not a selectable value. */
  placeholder: string
  required?: boolean
  className?: string
}

export function SelectField({
  id,
  name,
  options,
  placeholder,
  required = false,
  className = '',
}: SelectFieldProps) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef({ buffer: '', at: 0 })
  const listId = useId()

  /* Keep the active option in view while arrowing through a long list. */
  useEffect(() => {
    if (!open) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const selectedIndex = options.findIndex((option) => optionValue(option) === value)
  const selectedLabel = selectedIndex >= 0 ? optionLabel(options[selectedIndex]!) : ''

  const choose = (index: number) => {
    const next = options[index]
    if (next === undefined) return
    setValue(optionValue(next))
    setOpen(false)
    triggerRef.current?.focus()
  }

  const openAt = () => {
    setActiveIndex(selectedIndex < 0 ? 0 : selectedIndex)
    setOpen(true)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = options.length - 1
    const clamp = (n: number) => Math.max(0, Math.min(last, n))

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        openAt()
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        return setActiveIndex((i) => clamp(i + 1))
      case 'ArrowUp':
        event.preventDefault()
        return setActiveIndex((i) => clamp(i - 1))
      case 'Home':
        event.preventDefault()
        return setActiveIndex(0)
      case 'End':
        event.preventDefault()
        return setActiveIndex(last)
      case 'Enter':
      case ' ':
        event.preventDefault()
        return choose(activeIndex)
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        return triggerRef.current?.focus()
      case 'Tab':
        return setOpen(false)
      default:
        break
    }

    // Typeahead: consecutive letters build a prefix, reset after a pause.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = event.timeStamp
      const buffer =
        now - typeahead.current.at > 800 ? event.key : typeahead.current.buffer + event.key
      typeahead.current = { buffer, at: now }
      const match = options.findIndex((option) =>
        optionLabel(option).toLowerCase().startsWith(buffer.toLowerCase())
      )
      if (match >= 0) setActiveIndex(match)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {/* The form reads this, not the button. */}
      <input type="hidden" name={name} value={value} />

      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openAt())}
        onKeyDown={onKeyDown}
        className={`flex items-center justify-between gap-3 text-left ${className}`}
      >
        <span className={selectedLabel ? 'truncate' : 'truncate text-muted-foreground'}>
          {selectedLabel || placeholder}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={id}
          aria-required={required || undefined}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-lg"
        >
          {options.map((option, index) => {
            const isSelected = optionValue(option) === value
            return (
              /*
               * Keyboard handling for the options lives on the listbox, which is
               * the ARIA pattern: options are not individually focusable, and
               * arrows plus Enter are read there. The rule cannot see that.
               */
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={optionValue(option)}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={`wh-tap flex cursor-pointer items-center gap-2 rounded-xl px-3 text-base ${
                  index === activeIndex ? 'bg-muted' : ''
                } ${isSelected ? 'font-medium' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className={`size-1.5 shrink-0 rounded-full bg-accent ${isSelected ? '' : 'opacity-0'}`}
                />
                {optionLabel(option)}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
