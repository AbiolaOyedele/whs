'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { ChoiceOption } from '@v2/content/forms'
import { FieldError } from './FieldError'
import { Icon } from '@v2/components/ui/Icon'

interface ChoiceListboxProps {
  id: string
  /** Sent with the form through a hidden input. */
  name: string
  label: string
  placeholder: string
  options: ChoiceOption[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string | undefined
  className?: string
}

/**
 * A pick-one field that looks like the reference's select box but opens our
 * own list, so it styles the same everywhere. Keyboard: arrows or Enter open
 * it, arrows/Home/End move, Enter or Space picks, Escape closes, letters jump.
 */
export function ChoiceListbox({
  id,
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  required = false,
  error,
  className = '',
}: ChoiceListboxProps) {
  const listId = useId()
  const errorId = `${id}-error`
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = options[selectedIndex]

  useEffect(() => {
    if (!open) return
    list.current?.focus()
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const openList = (startAt = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActive(startAt)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    button.current?.focus()
  }

  const pick = (index: number) => {
    const option = options[index]
    if (option) onChange(option.value)
    close()
  }

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openList()
    }
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const last = options.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive((index) => Math.min(last, index + 1))
        return
      case 'ArrowUp':
        event.preventDefault()
        setActive((index) => Math.max(0, index - 1))
        return
      case 'Home':
        event.preventDefault()
        setActive(0)
        return
      case 'End':
        event.preventDefault()
        setActive(last)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        pick(active)
        return
      case 'Escape':
        event.preventDefault()
        close()
        return
      case 'Tab':
        setOpen(false)
        return
      default:
        if (event.key.length === 1) {
          const letter = event.key.toLowerCase()
          const from = active + 1
          const order = [...options.slice(from), ...options.slice(0, from)]
          const match = order.find((option) => option.label.toLowerCase().startsWith(letter))
          if (match) setActive(options.indexOf(match))
        }
    }
  }

  const onListClick = (event: MouseEvent<HTMLUListElement>) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>('[data-index]')
    if (item) pick(Number(item.dataset.index))
  }

  return (
    <div className={className}>
      <label id={`${id}-label`} htmlFor={id} className="input-label">
        {label}
        {required ? (
          <>
            {' '}
            <sup className="text-red" aria-hidden="true">
              *
            </sup>
            <span className="sr-only">(required)</span>
          </>
        ) : null}
      </label>
      <div ref={root} className="c-listbox input-select" data-invalid={error ? '' : undefined}>
        <button
          ref={button}
          id={id}
          type="button"
          className="c-listbox_button"
          aria-haspopup="listbox"
          aria-labelledby={`${id}-label ${id}-value`}
          aria-expanded={open}
          aria-controls={listId}
          aria-describedby={error ? errorId : undefined}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onButtonKeyDown}
        >
          <span id={`${id}-value`} className={selected ? '' : 'opacity-60'}>{selected?.label ?? placeholder}</span>
        </button>
        <Icon name="chevronDown" strokeWidth={2} className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
        {open ? (
          <ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
            aria-activedescendant={`${listId}-${active}`}
            className="c-listbox_list"
            onKeyDown={onListKeyDown}
            onClick={onListClick}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === value}
                data-index={index}
                data-active={index === active ? '' : undefined}
                className="c-listbox_option"
                onPointerMove={() => setActive(index)}
              >
                <span>{option.label}</span>
                {option.value === value ? (
                  <Icon name="check" strokeWidth={2.2} className="size-3.5 shrink-0" />
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        <input type="hidden" name={name} value={value} />
      </div>
      {error ? <FieldError id={errorId} message={error} /> : null}
    </div>
  )
}
