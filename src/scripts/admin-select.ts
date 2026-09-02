/**
 * Behaviour for FormSelect.astro.
 *
 * Loaded once per page and binds every `[data-wh-select]` on it. Replacing a
 * native control means owning the keyboard contract it gave away free, so all
 * of it is here: arrows, Home/End, Enter/Space, Escape, Tab, click-outside and
 * focus returning to the trigger on close.
 */
interface SelectParts {
  root: HTMLElement
  trigger: HTMLButtonElement
  list: HTMLUListElement
  input: HTMLInputElement
  labelNode: HTMLElement
  options: HTMLLIElement[]
}

function parts(root: HTMLElement): SelectParts | null {
  const trigger = root.querySelector<HTMLButtonElement>('[data-wh-select-trigger]')
  const list = root.querySelector<HTMLUListElement>('[data-wh-select-list]')
  const input = root.querySelector<HTMLInputElement>('[data-wh-select-input]')
  const labelNode = root.querySelector<HTMLElement>('[data-wh-select-label]')
  if (!trigger || !list || !input || !labelNode) return null

  return {
    root,
    trigger,
    list,
    input,
    labelNode,
    options: Array.from(list.querySelectorAll<HTMLLIElement>('[role="option"]')),
  }
}

function bind(root: HTMLElement): void {
  const parsed = parts(root)
  if (!parsed) return

  const { trigger, list, input, labelNode, options } = parsed
  let active = Math.max(
    0,
    options.findIndex((option) => option.dataset['value'] === input.value)
  )
  let typedBuffer = ''
  let typedAt = 0

  const paint = (): void => {
    options.forEach((option, index) => {
      option.classList.toggle('bg-muted', index === active)
      option.setAttribute(
        'aria-selected',
        option.dataset['value'] === input.value ? 'true' : 'false'
      )
    })
    options[active]?.scrollIntoView({ block: 'nearest' })
  }

  const open = (): void => {
    list.hidden = false
    trigger.setAttribute('aria-expanded', 'true')
    trigger.querySelector('svg')?.classList.add('rotate-180')
    paint()
  }

  const close = (returnFocus = true): void => {
    list.hidden = true
    trigger.setAttribute('aria-expanded', 'false')
    trigger.querySelector('svg')?.classList.remove('rotate-180')
    if (returnFocus) trigger.focus()
  }

  const commit = (index: number): void => {
    const option = options[index]
    if (!option) return

    input.value = option.dataset['value'] ?? ''
    labelNode.textContent = option.querySelector('span')?.textContent ?? ''
    // So a surrounding form or filter reacts exactly as it did to a <select>.
    input.dispatchEvent(new Event('change', { bubbles: true }))
    close()
  }

  trigger.addEventListener('click', () => {
    if (list.hidden) open()
    else close(false)
  })

  trigger.addEventListener('keydown', (event) => {
    if (list.hidden) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
        open()
      }
      return
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        close(false)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(active)
        break
      case 'ArrowDown':
        event.preventDefault()
        active = Math.min(options.length - 1, active + 1)
        paint()
        break
      case 'ArrowUp':
        event.preventDefault()
        active = Math.max(0, active - 1)
        paint()
        break
      case 'Home':
        event.preventDefault()
        active = 0
        paint()
        break
      case 'End':
        event.preventDefault()
        active = options.length - 1
        paint()
        break
      default: {
        if (event.key.length !== 1) break
        const now = Date.now()
        typedBuffer = now - typedAt > 600 ? event.key : typedBuffer + event.key
        typedAt = now
        const match = options.findIndex((option) =>
          (option.textContent ?? '').trim().toLowerCase().startsWith(typedBuffer.toLowerCase())
        )
        if (match >= 0) {
          active = match
          paint()
        }
      }
    }
  })

  options.forEach((option, index) => {
    option.addEventListener('click', () => commit(index))
    option.addEventListener('mouseenter', () => {
      active = index
      paint()
    })
  })

  document.addEventListener('pointerdown', (event) => {
    if (!list.hidden && !root.contains(event.target as Node)) close(false)
  })
}

document.querySelectorAll<HTMLElement>('[data-wh-select]').forEach(bind)
