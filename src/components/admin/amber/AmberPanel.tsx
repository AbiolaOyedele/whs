/**
 * Amber's team accounts and heading bank.
 *
 * Saves go to /api/v1/admin/amber/*, then the page reloads so the counts the
 * server computed stay true, the same as the clients list. The one exception
 * is a new account or a new PIN: that screen stays up so the PIN can be read
 * out or copied, because it is never shown again.
 */
import { useCallback, useState } from 'react'
import { Button, Panel, StatusLine, TextInput } from '../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import type { AmberHeadline, AmberUser } from '@/types/amber'

interface Props {
  users: AmberUser[]
  headlines: AmberHeadline[]
  /** False until AMBER_PIN_SECRET is set: accounts can be viewed but not changed. */
  canManage: boolean
}

type Message = { tone: 'error' | 'success'; text: string } | null

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/** Four random digits from the browser's secure generator. */
function randomPin(): string {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return String(values[0]! % 10_000).padStart(4, '0')
}

async function send(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) {
  const response = await fetch(
    url,
    body === undefined
      ? { method }
      : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  const json = (await response.json().catch(() => null)) as {
    message?: string
    error?: { message?: string }
  } | null
  if (!response.ok) throw new Error(json?.error?.message ?? 'That did not save. Try again.')
  return json?.message ?? 'Saved.'
}

function PinField({ value, onChange }: { value: string; onChange: (pin: string) => void }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <TextInput
          label="PIN"
          value={value}
          onChange={(v) => onChange(v.replace(/\D/g, '').slice(0, 4))}
          hint="4 digits"
          required
          maxLength={4}
        />
      </div>
      <Button onClick={() => onChange(randomPin())}>Make one up</Button>
    </div>
  )
}

function status(user: AmberUser): string {
  if (!user.isActive) return 'Switched off'
  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    return `Locked until ${dateFormat.format(new Date(user.lockedUntil))}`
  }
  return 'Active'
}

export default function AmberPanel({ users, headlines, canManage }: Props) {
  const [message, setMessage] = useState<Message>(null)
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ username: '', displayName: '', pin: '' })
  const [pinFor, setPinFor] = useState<AmberUser | null>(null)
  const [newPin, setNewPin] = useState('')
  /** Shown once after creating an account or resetting a PIN. */
  const [handover, setHandover] = useState<{ username: string; pin: string } | null>(null)
  const [removing, setRemoving] = useState<AmberUser | null>(null)
  const [newLine, setNewLine] = useState('')
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null)

  const run = useCallback(async (action: () => Promise<string>, reload = true) => {
    setBusy(true)
    setMessage(null)
    try {
      const text = await action()
      if (reload) window.location.reload()
      else setMessage({ tone: 'success', text })
      return true
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'We could not reach the server. Try again.',
      })
      return false
    } finally {
      setBusy(false)
    }
  }, [])

  const addPerson = async () => {
    const ok = await run(() => send('/api/v1/admin/amber/users', 'POST', draft), false)
    if (ok) {
      setHandover({ username: draft.username.trim().toLowerCase(), pin: draft.pin })
      setAdding(false)
      setDraft({ username: '', displayName: '', pin: '' })
    }
  }

  const resetPin = async () => {
    if (!pinFor) return
    const ok = await run(
      () => send(`/api/v1/admin/amber/users?id=${pinFor.id}`, 'PUT', { pin: newPin }),
      false
    )
    if (ok) {
      setHandover({ username: pinFor.username, pin: newPin })
      setPinFor(null)
      setNewPin('')
    }
  }

  const user = (u: AmberUser, body: unknown) =>
    run(() => send(`/api/v1/admin/amber/users?id=${u.id}`, 'PUT', body))
  const line = (h: AmberHeadline, body: unknown) =>
    run(() => send(`/api/v1/admin/amber/headlines?id=${h.id}`, 'PUT', body))

  return (
    <div className="flex flex-col gap-6">
      {message && <StatusLine tone={message.tone}>{message.text}</StatusLine>}

      {handover && (
        <div
          role="status"
          className="rounded-3xl border border-accent bg-card p-5 md:p-6"
          aria-live="polite"
        >
          <p className="font-display text-lg">Share these with them directly</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The PIN isn’t shown again. They sign in at amber.whstd.com.
          </p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <dt className="text-muted-foreground">Username</dt>
            <dd className="font-mono">{handover.username}</dd>
            <dt className="text-muted-foreground">PIN</dt>
            <dd className="font-mono text-2xl tracking-[0.3em]">{handover.pin}</dd>
          </dl>
          <div className="mt-5">
            <Button tone="primary" onClick={() => window.location.reload()}>
              Done
            </Button>
          </div>
        </div>
      )}

      <Panel
        title="Team"
        description="People who can sign in to Amber with a username and 4-digit PIN. Five wrong PINs lock an account for 15 minutes."
        action={
          canManage && !adding ? (
            <Button
              tone="primary"
              onClick={() => {
                setAdding(true)
                setDraft({ username: '', displayName: '', pin: randomPin() })
              }}
            >
              Add a person
            </Button>
          ) : undefined
        }
      >
        {!canManage && (
          <p className="mb-4 rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            Set AMBER_PIN_SECRET for this site (the same value as in the Amber project) to add
            people or reset PINs.
          </p>
        )}

        {adding && (
          <div className="mb-6 grid gap-4 rounded-2xl border border-border p-4 md:grid-cols-3">
            <TextInput
              label="Username"
              value={draft.username}
              onChange={(username) => setDraft({ ...draft, username })}
              hint="Letters, numbers, dot, dash or underscore"
              required
              maxLength={32}
            />
            <TextInput
              label="Name"
              value={draft.displayName}
              onChange={(displayName) => setDraft({ ...draft, displayName })}
              hint="Shown in Amber’s header"
              maxLength={60}
            />
            <PinField value={draft.pin} onChange={(pin) => setDraft({ ...draft, pin })} />
            <div className="flex gap-2 md:col-span-3">
              <Button tone="primary" disabled={busy} onClick={addPerson}>
                {busy ? 'Adding…' : 'Add'}
              </Button>
              <Button tone="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {users.length === 0 ? (
          <p className="text-muted-foreground">
            No one yet. Add a person to give them access to Amber.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {users.map((u) => (
              <li key={u.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    {u.displayName ?? u.username}
                    <span className="ml-2 font-mono text-sm text-muted-foreground">
                      {u.username}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {status(u)} ·{' '}
                    {u.lastLoginAt
                      ? `Last in ${dateFormat.format(new Date(u.lastLoginAt))}`
                      : 'Never signed in'}{' '}
                    · {u.bannersMade} {u.bannersMade === 1 ? 'banner' : 'banners'}
                  </p>
                  {pinFor?.id === u.id && (
                    <div className="mt-3 flex flex-col gap-3 md:max-w-sm">
                      <PinField value={newPin} onChange={setNewPin} />
                      <div className="flex gap-2">
                        <Button
                          tone="primary"
                          disabled={busy || newPin.length !== 4}
                          onClick={resetPin}
                        >
                          Save new PIN
                        </Button>
                        <Button tone="ghost" onClick={() => setPinFor(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {canManage && pinFor?.id !== u.id && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setPinFor(u)
                        setNewPin(randomPin())
                      }}
                    >
                      New PIN
                    </Button>
                    {u.lockedUntil && new Date(u.lockedUntil).getTime() > Date.now() && (
                      <Button disabled={busy} onClick={() => user(u, { unlock: true })}>
                        Unlock
                      </Button>
                    )}
                    <Button disabled={busy} onClick={() => user(u, { isActive: !u.isActive })}>
                      {u.isActive ? 'Switch off' : 'Switch on'}
                    </Button>
                    <Button tone="danger" onClick={() => setRemoving(u)}>
                      Remove
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Headings"
        description="The lines Amber’s “Next line” button rotates through, in this order. Write {brand} where the brand name should go."
      >
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end">
          <div className="flex-1">
            <TextInput
              label="New heading"
              value={newLine}
              onChange={setNewLine}
              placeholder="e.g. Fresh From {brand}"
              maxLength={60}
              required
            />
          </div>
          <Button
            tone="primary"
            disabled={busy || newLine.trim().length < 3}
            onClick={() =>
              run(() => send('/api/v1/admin/amber/headlines', 'POST', { text: newLine }))
            }
          >
            Add heading
          </Button>
        </div>

        {headlines.length === 0 ? (
          <p className="text-muted-foreground">
            No headings yet. Amber uses its built-in lines until you add some.
          </p>
        ) : (
          <ol className="flex flex-col divide-y divide-border">
            {headlines.map((h, i) => (
              <li key={h.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  {editing?.id === h.id ? (
                    <div className="flex flex-col gap-2 md:flex-row md:items-end">
                      <div className="flex-1">
                        <TextInput
                          label="Heading"
                          value={editing.text}
                          onChange={(text) => setEditing({ id: h.id, text })}
                          maxLength={60}
                          required
                        />
                      </div>
                      <Button
                        tone="primary"
                        disabled={busy}
                        onClick={() => line(h, { text: editing.text })}
                      >
                        Save
                      </Button>
                      <Button tone="ghost" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <p className={h.isActive ? '' : 'text-muted-foreground line-through'}>
                      {h.text}
                    </p>
                  )}
                </div>
                {editing?.id !== h.id && (
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={busy || i === 0} onClick={() => line(h, { move: 'up' })}>
                      <span aria-hidden>↑</span>
                      <span className="sr-only">Move up</span>
                    </Button>
                    <Button
                      disabled={busy || i === headlines.length - 1}
                      onClick={() => line(h, { move: 'down' })}
                    >
                      <span aria-hidden>↓</span>
                      <span className="sr-only">Move down</span>
                    </Button>
                    <Button onClick={() => setEditing({ id: h.id, text: h.text })}>Edit</Button>
                    <Button disabled={busy} onClick={() => line(h, { isActive: !h.isActive })}>
                      {h.isActive ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      tone="danger"
                      disabled={busy}
                      onClick={() =>
                        run(() => send(`/api/v1/admin/amber/headlines?id=${h.id}`, 'DELETE'))
                      }
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </Panel>

      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.displayName ?? removing?.username ?? ''}?`}
        body="They are signed out straight away and can’t sign in again. The banners they made stay in the usage numbers. To pause someone instead, switch them off."
        confirmLabel="Remove"
        tone="danger"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const target = removing
          setRemoving(null)
          if (target) run(() => send(`/api/v1/admin/amber/users?id=${target.id}`, 'DELETE'))
        }}
      />
    </div>
  )
}
