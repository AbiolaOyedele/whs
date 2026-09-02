/**
 * A colour token.
 *
 * Two controls for one value, because the tokens are authored in `oklch()` and
 * the native colour picker only speaks hex. The swatch is a convenience that
 * writes hex; the text field is the real control and accepts any CSS colour, so
 * the wider gamut the stylesheet uses is never silently flattened by clicking
 * the swatch.
 *
 * The preview square is painted with the live value, so an unparseable string
 * shows as nothing rather than as a lie.
 */
import { useEffect, useRef, useState } from 'react'

interface Props {
  label: string
  help?: string | undefined
  value: string
  defaultValue: string
  onChange: (value: string) => void
}

export function ColourField({ label, help, value, defaultValue, onChange }: Props) {
  const swatchRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLSpanElement>(null)
  const [hex, setHex] = useState('#000000')

  const effective = value.trim().length > 0 ? value : defaultValue
  const overridden = value.trim().length > 0 && value !== defaultValue

  /* Resolve whatever CSS colour the token holds down to hex, so the native
     picker opens on the current colour rather than on black. getComputedStyle
     is the only reliable way to convert oklch() without a colour library. */
  useEffect(() => {
    const node = previewRef.current
    if (!node) return

    const computed = getComputedStyle(node).backgroundColor
    const match = computed.match(/\d+(\.\d+)?/g)
    if (!match || match.length < 3) return

    const [r, g, b] = match.map((part) => Math.round(Number(part)))
    const toHex = (channel: number) => channel.toString(16).padStart(2, '0')
    setHex(`#${toHex(r ?? 0)}${toHex(g ?? 0)}${toHex(b ?? 0)}`)
  }, [effective])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm text-muted-foreground">{label}</label>
        {overridden && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="min-h-11 text-sm text-muted-foreground underline transition-colors hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => swatchRef.current?.click()}
          aria-label={`Pick a colour for ${label}`}
          className="size-11 shrink-0 rounded-xl border border-border transition-colors hover:border-foreground"
        >
          <span
            ref={previewRef}
            className="block size-full rounded-[0.65rem]"
            style={{ backgroundColor: effective }}
          />
        </button>

        <input
          ref={swatchRef}
          type="color"
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="sr-only"
          tabIndex={-1}
        />

        <input
          type="text"
          value={value}
          placeholder={defaultValue}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full min-w-0 rounded-xl border border-border bg-card px-3 font-mono text-sm transition-colors outline-none focus-visible:border-foreground"
        />
      </div>

      {help && <p className="text-sm text-muted-foreground">{help}</p>}
    </div>
  )
}
