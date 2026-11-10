'use client'

import { useEffect, useRef } from 'react'
import { motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'

interface CrosswordGridProps {
  words: string[]
  mobileWords: string[]
  /** Word groups highlighted together, in turn. */
  sequence: string[][]
  mobileSequence: string[][]
  className?: string
}

type Direction = 'h' | 'v' | 'd1' | 'd2'
type HighlightMode = 'h' | 'v' | 'diag' | 'mixed'

interface Cell {
  char: string
  words: string[]
}

const MOBILE_BELOW = 768
const DESKTOP_GRID = { cols: 24, rows: 5 }
const MOBILE_GRID = { cols: 6, rows: 4 }
const PLACE_TRIES = 400
/** A new group of words lights up every 4.2–7.2s. */
const HIGHLIGHT_MIN = 4200
const HIGHLIGHT_MAX = 7200
/** A few loose letters change every 0.2–1s. */
const FILLER_MIN = 200
const FILLER_MAX = 1000
const FILLER_COUNT_MIN = 2
const FILLER_COUNT_MAX = 9
const EXIT_TIMEOUT = 600
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const STEP: Record<Direction, { dr: number; dc: number }> = {
  h: { dr: 0, dc: 1 },
  v: { dr: 1, dc: 0 },
  d1: { dr: 1, dc: 1 },
  d2: { dr: 1, dc: -1 },
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = copy[i] as T
    copy[i] = copy[j] as T
    copy[j] = a
  }
  return copy
}

function randomLetter(): string {
  return ALPHABET[randomInt(0, ALPHABET.length - 1)] ?? 'A'
}

function differentLetter(current: string): string {
  let next = randomLetter()
  for (let tries = 0; next === current && tries < 16; tries++) next = randomLetter()
  return next
}

function fits(grid: Cell[][], word: string, dir: Direction, row: number, col: number): boolean {
  const { dr, dc } = STEP[dir]
  for (let i = 0; i < word.length; i++) {
    const cell = grid[row + dr * i]?.[col + dc * i]
    if (!cell) return false
    if (cell.char !== '' && cell.char !== word[i]) return false
  }
  return true
}

/**
 * Hides each word in a grid of random letters, longest first. On wide screens
 * a word may run down or (at most once) diagonally; on phones only across.
 */
function buildGrid(rows: number, cols: number, words: string[], acrossOnly: boolean) {
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ char: '', words: [] as string[] })),
  )
  const placed: string[] = []
  let usedDiagonal = false
  for (const word of [...words].sort((a, b) => b.length - a.length)) {
    const directions: Direction[] = acrossOnly ? ['h'] : shuffled(usedDiagonal ? ['h', 'v'] : ['h', 'v', 'd1', 'd2'])
    let done = false
    for (const dir of directions) {
      for (let tries = 0; tries < PLACE_TRIES && !done; tries++) {
        const row = randomInt(0, rows - 1)
        const col = randomInt(0, cols - 1)
        if (!fits(grid, word, dir, row, col)) continue
        const { dr, dc } = STEP[dir]
        for (let i = 0; i < word.length; i++) {
          const cell = grid[row + dr * i]?.[col + dc * i]
          if (!cell) continue
          cell.char = word[i] ?? ''
          if (!cell.words.includes(word)) cell.words.push(word)
        }
        placed.push(word)
        if (dir === 'd1' || dir === 'd2') usedDiagonal = true
        done = true
      }
      if (done) break
    }
  }
  for (const row of grid) for (const cell of row) if (cell.char === '') cell.char = randomLetter()
  return { grid, placed }
}

/**
 * A wide grid of letters under the hero with words hidden in it. Every
 * few seconds a pink bar wipes across the next group of words while stray
 * letters keep changing. Decoration only, so screen readers skip it.
 */
export function CrosswordGrid({ words, mobileWords, sequence, mobileSequence, className = '' }: CrosswordGridProps) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = host.current
    if (!root) return
    const animate = motionAllowed()

    let isMobile = window.innerWidth < MOBILE_BELOW
    let inView = false
    let cols = 0
    let cells: HTMLSpanElement[] = []
    let fillers: number[] = []
    let placed: string[] = []
    const wordCells = new Map<string, number[]>()
    let layer: HTMLDivElement | null = null
    let active: string[] = []
    const lit = new Set<number>()
    let step = 0
    let seeded = false
    let tickTimer: number | null = null
    let fillerTimer: number | null = null
    let layoutFrame: number | null = null
    let resize: ResizeObserver | null = null

    const clearTimers = () => {
      if (tickTimer !== null) window.clearTimeout(tickTimer)
      if (fillerTimer !== null) window.clearTimeout(fillerTimer)
      tickTimer = null
      fillerTimer = null
    }

    const clearHighlights = () => {
      active = []
      lit.forEach((index) => cells[index]?.classList.remove('is-word-active'))
      lit.clear()
      if (layer) layer.innerHTML = ''
    }

    const nextGroup = (): string[] | null => {
      const groups = isMobile ? mobileSequence : sequence
      for (let i = 0; i < groups.length; i++) {
        const at = (step + i) % groups.length
        const group = (groups[at] ?? []).filter((word) => placed.includes(word))
        if (group.length) {
          step = (at + 1) % groups.length
          return group
        }
      }
      return null
    }

    const modeFor = (indices: number[]): HighlightMode => {
      if (indices.length <= 1) return 'h'
      const pos = indices.map((index) => ({ r: Math.floor(index / cols), c: index % cols }))
      const first = pos[0]
      const second = pos[1]
      if (!first || !second) return 'mixed'
      const dr = second.r - first.r
      const dc = second.c - first.c
      for (let i = 2; i < pos.length; i++) {
        const a = pos[i - 1]
        const b = pos[i]
        if (!a || !b || b.r - a.r !== dr || b.c - a.c !== dc) return 'mixed'
      }
      if (dr === 0 && dc !== 0) return 'h'
      if (dr !== 0 && dc === 0) return 'v'
      if (dr === 1 && Math.abs(dc) === 1) return 'diag'
      return 'mixed'
    }

    const layout = () => {
      if (!layer || active.length === 0) return
      const box = layer.getBoundingClientRect()
      layer.innerHTML = ''
      for (const word of active) {
        const indices = [...(wordCells.get(word) ?? [])].sort((a, b) => a - b)
        const spans = indices.map((index) => cells[index]).filter((cell): cell is HTMLSpanElement => !!cell)
        const firstSpan = spans[0]
        const lastSpan = spans[spans.length - 1]
        if (!firstSpan || !lastSpan) continue
        const mode = modeFor(indices)

        if (mode === 'diag') {
          const a = firstSpan.getBoundingClientRect()
          const b = lastSpan.getBoundingClientRect()
          const ax = (a.left + a.right) / 2
          const ay = (a.top + a.bottom) / 2
          const dx = (b.left + b.right) / 2 - ax
          const dy = (b.top + b.bottom) / 2 - ay
          const length = Math.hypot(dx, dy)
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI
          const thickness =
            (spans.reduce((sum, span) => {
              const r = span.getBoundingClientRect()
              return sum + Math.max(r.width, r.height)
            }, 0) /
              spans.length) *
            1.12
          const ux = length > 1e-6 ? dx / length : 1
          const uy = length > 1e-6 ? dy / length : 0
          const pad = Math.max(10, ((a.width + a.height + b.width + b.height) / 4) * 0.42)
          const wrap = document.createElement('div')
          wrap.className = 'c-crossword-grid-word-highlight-diag-wrap'
          wrap.style.left = `${ax - ux * pad - box.left}px`
          wrap.style.top = `${ay - uy * pad - box.top - thickness / 2}px`
          wrap.style.width = `${length + pad * 2}px`
          wrap.style.height = `${thickness}px`
          wrap.style.transform = `rotate(${angle}deg)`
          wrap.style.transformOrigin = 'left center'
          const wipe = document.createElement('div')
          wipe.className = 'c-crossword-grid-word-highlight c-crossword-grid-word-highlight-diag-wipe'
          wrap.appendChild(wipe)
          layer.appendChild(wrap)
          continue
        }

        let left = Infinity
        let top = Infinity
        let right = -Infinity
        let bottom = -Infinity
        for (const span of spans) {
          const r = span.getBoundingClientRect()
          left = Math.min(left, r.left)
          top = Math.min(top, r.top)
          right = Math.max(right, r.right)
          bottom = Math.max(bottom, r.bottom)
        }
        const padX = 3
        const padY = 2
        const bar = document.createElement('div')
        bar.className = `c-crossword-grid-word-highlight c-crossword-grid-word-highlight-${mode}`
        bar.style.left = `${left - box.left - padX}px`
        bar.style.top = `${top - box.top - padY}px`
        bar.style.width = `${right - left + padX * 2}px`
        bar.style.height = `${bottom - top + padY * 2}px`
        layer.appendChild(bar)
      }
    }

    const layoutSoon = () => {
      requestAnimationFrame(() => requestAnimationFrame(layout))
    }

    const light = (group: string[]) => {
      clearHighlights()
      active = group
      for (const word of group) {
        for (const index of wordCells.get(word) ?? []) {
          cells[index]?.classList.add('is-word-active')
          lit.add(index)
        }
      }
      layoutSoon()
    }

    const exit = (): Promise<void> => {
      if (!layer || layer.children.length === 0) return Promise.resolve()
      const bars: HTMLElement[] = []
      for (const child of Array.from(layer.children)) {
        const target = child.classList.contains('c-crossword-grid-word-highlight-diag-wrap')
          ? child.querySelector<HTMLElement>('.c-crossword-grid-word-highlight-diag-wipe')
          : (child as HTMLElement)
        if (target) bars.push(target)
      }
      return Promise.all(
        bars.map(
          (bar) =>
            new Promise<void>((resolve) => {
              const done = () => {
                bar.removeEventListener('animationend', onEnd)
                resolve()
              }
              const onEnd = (event: AnimationEvent) => {
                if (event.animationName.startsWith('crossword-highlight-exit')) done()
              }
              bar.addEventListener('animationend', onEnd)
              bar.classList.add('is-exiting')
              window.setTimeout(done, EXIT_TIMEOUT)
            }),
        ),
      ).then(() => undefined)
    }

    const seed = () => {
      if (seeded || placed.length === 0 || !layer || layer.childElementCount > 0) return
      const group = nextGroup()
      if (!group) return
      seeded = true
      light(group)
    }

    const tick = () => {
      const group = nextGroup()
      if (!group) return
      void exit().then(() => {
        if (root.isConnected) light(group)
      })
    }

    const scheduleTick = () => {
      if (!animate) return
      tickTimer = window.setTimeout(() => {
        tick()
        if (inView) scheduleTick()
      }, randomInt(HIGHLIGHT_MIN, HIGHLIGHT_MAX))
    }

    const scheduleFiller = () => {
      if (!animate) return
      fillerTimer = window.setTimeout(() => {
        const count = Math.min(randomInt(FILLER_COUNT_MIN, FILLER_COUNT_MAX), fillers.length)
        for (const index of shuffled(fillers).slice(0, count)) {
          const cell = cells[index]
          if (cell) cell.textContent = differentLetter(cell.textContent ?? '')
        }
        if (inView) scheduleFiller()
      }, randomInt(FILLER_MIN, FILLER_MAX))
    }

    const start = () => {
      requestAnimationFrame(() => requestAnimationFrame(seed))
      clearTimers()
      scheduleTick()
      scheduleFiller()
    }

    const rebuild = () => {
      clearTimers()
      clearHighlights()
      resize?.disconnect()
      root.innerHTML = ''
      const size = isMobile ? MOBILE_GRID : DESKTOP_GRID
      const built = buildGrid(size.rows, size.cols, isMobile ? mobileWords : words, isMobile)
      placed = built.placed
      cols = size.cols
      step = 0
      seeded = false
      fillers = []
      wordCells.clear()
      root.style.setProperty('--crossword-cols', String(size.cols))
      root.style.setProperty('--crossword-rows', String(size.rows))

      const wrap = document.createElement('div')
      wrap.className = 'c-crossword-grid-cells-wrap'
      layer = document.createElement('div')
      layer.className = 'c-crossword-grid-highlight-layer'
      const grid = document.createElement('div')
      grid.className = 'c-crossword-grid-cells'
      cells = []
      let index = 0
      for (const row of built.grid) {
        for (const cell of row) {
          const span = document.createElement('span')
          span.className = 'c-crossword-grid-cell'
          span.textContent = cell.char
          if (cell.words.length === 0) fillers.push(index)
          for (const word of cell.words) wordCells.set(word, [...(wordCells.get(word) ?? []), index])
          cells.push(span)
          grid.appendChild(span)
          index++
        }
      }
      wrap.append(layer, grid)
      root.appendChild(wrap)
      resize = new ResizeObserver(() => {
        if (active.length === 0 || layoutFrame !== null) return
        layoutFrame = requestAnimationFrame(() => {
          layoutFrame = null
          layout()
        })
      })
      resize.observe(grid)
      if (inView) start()
    }

    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BELOW
      if (mobile === isMobile) return
      isMobile = mobile
      rebuild()
    }

    rebuild()
    window.addEventListener('resize', onResize)
    const unobserve = observeInview(root, (_entry, visible) => {
      inView = visible
      if (visible) {
        start()
      } else {
        clearTimers()
        seeded = false
        clearHighlights()
      }
    })

    return () => {
      unobserve()
      window.removeEventListener('resize', onResize)
      clearTimers()
      if (layoutFrame !== null) cancelAnimationFrame(layoutFrame)
      resize?.disconnect()
      root.innerHTML = ''
    }
  }, [words, mobileWords, sequence, mobileSequence])

  return <div ref={host} className={`c-crossword-grid ${className}`} aria-hidden="true" />
}
