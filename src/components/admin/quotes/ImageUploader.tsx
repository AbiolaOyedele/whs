/**
 * Quote images: mockups, screenshots, references.
 *
 * Uploads go through our own /api/v1/admin/uploads, which validates and signs
 * server-side — the browser never holds a Cloudinary credential and there is no
 * unsigned upload preset for anyone to find and abuse.
 */
import { useRef, useState } from 'react'
import { Button, Panel, TextInput } from '../ui'
import type { QuoteImage } from '@/types/quote'

interface Props {
  images: QuoteImage[]
  enabled: boolean
  onAdd: (image: Omit<QuoteImage, 'id' | 'position'>) => void
  onUpdate: (id: string, patch: Partial<QuoteImage>) => void
  onRemove: (id: string) => void
  onMove: (id: string, direction: -1 | 1) => void
}

export function ImageUploader({ images, enabled, onAdd, onUpdate, onRemove, onMove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setBusy(true)
    setError(null)

    // Sequential rather than parallel: the endpoint is rate limited, and a
    // dropped batch of ten firing at once would trip it and lose most of them.
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)

      try {
        const response = await fetch('/api/v1/admin/uploads', { method: 'POST', body: form })
        const body: unknown = await response.json()

        if (!response.ok) {
          setError(
            (body as { error?: { message?: string } }).error?.message ??
              `${file.name} could not be uploaded.`
          )
          continue
        }

        const stored = body as {
          url: string
          publicId: string
          width: number | null
          height: number | null
        }
        onAdd({
          url: stored.url,
          publicId: stored.publicId,
          caption: '',
          width: stored.width,
          height: stored.height,
        })
      } catch {
        setError('We could not reach the server. Check your connection and try again.')
      }
    }

    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (!enabled) {
    return (
      <Panel title="Images">
        <p className="text-base text-muted-foreground">
          Image storage is not connected. Add the Cloudinary keys to upload mockups and screenshots.
          Everything else in the quote works without it.
        </p>
      </Panel>
    )
  }

  return (
    <Panel
      title="Images"
      description="Mockups, screenshots, anything that helps them picture it."
      action={
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? 'Uploading…' : 'Add images'}
        </Button>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple
        className="sr-only"
        onChange={(event) => void upload(event.target.files)}
      />

      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <p className="text-base text-muted-foreground">
          No images yet. JPG, PNG, WebP, AVIF or GIF, up to 8MB each.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {images.map((image, index) => (
            <li key={image.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4">
              {/* Same treatment as the client page, so what you arrange here
                  is what they see. See QuoteDocument.astro for why contain. */}
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-muted p-2">
                <img
                  src={image.url}
                  alt={image.caption || 'Quote image'}
                  width={image.width ?? undefined}
                  height={image.height ?? undefined}
                  loading="lazy"
                  className="max-h-full w-auto max-w-full rounded-lg object-contain"
                />
              </div>

              <TextInput
                label="Caption"
                value={image.caption}
                onChange={(caption) => onUpdate(image.id, { caption })}
              />

              <div className="flex flex-wrap items-center gap-1">
                <Button tone="ghost" onClick={() => onMove(image.id, -1)} disabled={index === 0}>
                  <span aria-hidden="true">←</span>
                  <span className="sr-only">Move earlier</span>
                </Button>
                <Button
                  tone="ghost"
                  onClick={() => onMove(image.id, 1)}
                  disabled={index === images.length - 1}
                >
                  <span aria-hidden="true">→</span>
                  <span className="sr-only">Move later</span>
                </Button>
                <Button tone="danger" onClick={() => onRemove(image.id)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
