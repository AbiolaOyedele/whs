/**
 * Controlled select. Button plus listbox, never a native `<select>`.
 *
 * A native select renders its options through the operating system, so the
 * popup ignores every design token on the page and arrives as a grey system
 * menu. That is true in the admin as much as anywhere else, so this replaces it
 * here the same way `components/forms/SelectField` replaced it on the public
 * site.
 *
 * Replacing a native control means owning the keyboard behaviour it gives away
 * free, so all of it is here: arrows, Home/End, Enter/Space, Escape, Tab,
 * click-outside, focus returning to the trigger on close, and typeahead.
 *
 * Selection is marked three ways — `aria-selected`, a weight change and a lime
 * dot — so it never rests on colour alone.
 *
 * Differs from SelectField in contract, not behaviour: that one is uncontrolled
 * and carries its value in a hidden input for `FormData`; this one is
 * controlled by React state, which is what the admin editors need.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  label: string
  value: string
  options: readonly SelectOption[]
  onChange: (value: string) => void
  hint?: string | undefined
  error?: string | undefined
  dataField?: string | undefined
}

export function Select({ label, value, options, onChange, hint, error, dataField }: Props) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const selected = options[selectedIndex]

  const close = useCallback((returnFocus = true) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  const commit = useCallback(
    (index: number) => {
      const option = options[index]
      if (option) onChange(option.value)
      close()
    },
    [options, onChange, close]
  )

  // Click outside closes without stealing focus back, which would fight
  // whatever the user actually clicked on.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the active option in view when arrowing through a long list.
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  /** Typeahead. Resets after a pause, like the native control. */
  const typed = useRef({ buffer: '', at: 0 })
  const onTypeahead = useCallback(
    (key: string) => {
      const now = Date.now()
      typed.current.buffer = now - typed.current.at > 600 ? key : typed.current.buffer + key
      typed.current.at = now

      const match = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(typed.current.buffer.toLowerCase())
      )
      if (match >= 0) setActive(match)
    },
    [options]
  )

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
        setActive(selectedIndex)
        setOpen(true)
      }
      return
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        // Let focus move on, but do not leave an orphaned popup behind.
        setOpen(false)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(active)
        break
      case 'ArrowDown':
        event.preventDefault()
        setActive((index) => Math.min(options.length - 1, index + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((index) => Math.max(0, index - 1))
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(options.length - 1)
        break
      default:
        if (event.key.length === 1) onTypeahead(event.key)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>

      <div ref={rootRef} className="relative">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-haspopup="listbox"
          aria-invalid={error ? true : undefined}
          data-field={dataField}
          onClick={() => {
            setActive(selectedIndex)
            setOpen((isOpen) => !isOpen)
          }}
          onKeyDown={onKeyDown}
          className={cn(
            'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 text-left text-base transition-colors outline-none focus-visible:border-foreground',
            error && 'border-destructive bg-destructive/5'
          )}
        >
          <span className="truncate">{selected?.label ?? 'Choose…'}</span>
          <svg
            viewBox="0 0 12 8"
            aria-hidden="true"
            className={cn('size-3 shrink-0 transition-transform', open && 'rotate-180')}
          >
            <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        {open && (
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg"
          >
            {options.map((option, index) => (
              /* Keyboard handling belongs on the combobox trigger in this
                 pattern — arrows, Enter and typeahead all live there — and
                 options are deliberately not individually focusable, which is
                 how the native control behaves too. */
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={option.value}
                role="option"
                data-index={index}
                aria-selected={option.value === value}
                onClick={() => commit(index)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-base',
                  index === active && 'bg-muted',
                  option.value === value && 'font-medium'
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && (
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
