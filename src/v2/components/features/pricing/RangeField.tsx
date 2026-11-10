'use client'

import type { CSSProperties, ReactNode } from 'react'

interface RangeFieldProps {
  id: string
  label: string
  hint: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  /** Spoken value, e.g. "₦15,000". */
  valueText: string
  /** The value shown on the right: a read-out, or a box to type into. */
  aside: ReactNode
}

/**
 * A labelled slider in the reference's style: navy fill up to the thumb on a
 * pale track. The input is taller than the track so a finger can grab it.
 */
export function RangeField({ id, label, hint, min, max, step, value, onChange, valueText, aside }: RangeFieldProps) {
  const clamped = Math.min(max, Math.max(min, value))
  const percent = max === min ? 0 : ((clamped - min) / (max - min)) * 100
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <label id={`${id}-label`} htmlFor={id} className="input-label">
            {label}
          </label>
          <p className="text-body-sm text-navy-900">{hint}</p>
        </div>
        {aside}
      </div>
      <div className="flex items-center">
        <input
          id={id}
          type="range"
          className="c-range w-full"
          min={min}
          max={max}
          step={step}
          value={clamped}
          aria-valuetext={valueText}
          style={{ '--value': `${percent}%` } as CSSProperties}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
    </div>
  )
}
