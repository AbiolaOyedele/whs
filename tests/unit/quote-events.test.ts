/**
 * Activity log compression.
 *
 * A quote sent to a client's team gets opened by everyone on it. Twenty
 * identical rows buried the one line that mattered, so consecutive runs fold
 * into one entry with a count and a range.
 */
import { describe, expect, it } from 'vitest'
import { collapseEvents } from '@/lib/admin/repositories/quotes'
import type { QuoteEvent } from '@/types/quote'

const event = (type: QuoteEvent['type'], createdAt: string): QuoteEvent => ({
  id: `${type}-${createdAt}`,
  type,
  createdAt,
  userAgent: null,
})

describe('collapseEvents', () => {
  it('folds a run of identical events into one entry', () => {
    const out = collapseEvents([
      event('viewed', '2026-09-02T22:12:00Z'),
      event('viewed', '2026-09-02T22:11:00Z'),
      event('viewed', '2026-09-02T22:09:00Z'),
    ])

    expect(out).toHaveLength(1)
    expect(out[0]?.count).toBe(3)
    expect(out[0]?.lastAt).toBe('2026-09-02T22:12:00Z')
    expect(out[0]?.firstAt).toBe('2026-09-02T22:09:00Z')
  })

  it('keeps runs separated by a different event apart', () => {
    // The order is the information: views before an acceptance are not the
    // same thing as views after it, so they must not merge.
    const out = collapseEvents([
      event('viewed', '2026-09-02T23:00:00Z'),
      event('accepted', '2026-09-02T22:30:00Z'),
      event('viewed', '2026-09-02T22:00:00Z'),
      event('viewed', '2026-09-02T21:00:00Z'),
    ])

    expect(out.map((e) => [e.type, e.count])).toEqual([
      ['viewed', 1],
      ['accepted', 1],
      ['viewed', 2],
    ])
  })

  it('leaves a single event untouched', () => {
    const out = collapseEvents([event('pin_failed', '2026-09-02T20:00:00Z')])
    expect(out).toEqual([
      {
        type: 'pin_failed',
        count: 1,
        firstAt: '2026-09-02T20:00:00Z',
        lastAt: '2026-09-02T20:00:00Z',
      },
    ])
  })

  it('handles an empty log', () => {
    expect(collapseEvents([])).toEqual([])
  })

  it('never loses an event', () => {
    const events = [
      ...Array.from({ length: 20 }, (_, i) => event('viewed', `2026-09-02T2${i % 3}:00:00Z`)),
      event('accepted', '2026-09-01T10:00:00Z'),
      event('pin_failed', '2026-09-01T09:00:00Z'),
    ]
    const total = collapseEvents(events).reduce((sum, entry) => sum + entry.count, 0)
    expect(total).toBe(events.length)
  })
})
