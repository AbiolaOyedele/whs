/**
 * Cancel and save for a template form dialog, with the server's error above
 * them. Stacked on a phone, primary last so it sits under the thumb.
 */
import { Button, StatusLine } from '../ui'

interface Props {
  error: string | null
  busy: boolean
  disabled: boolean
  label: string
  onCancel: () => void
  onSave: () => void
}

export function FormFooter({ error, busy, disabled, label, onCancel, onSave }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {error && <StatusLine tone="error">{error}</StatusLine>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button tone="primary" onClick={onSave} disabled={busy || disabled}>
          {busy ? 'Saving…' : label}
        </Button>
      </div>
    </div>
  )
}
