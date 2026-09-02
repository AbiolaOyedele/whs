/**
 * The clients list.
 *
 * The list maintains itself: creating or saving a quote reconciles the client
 * behind it, matched by email. Adding one here is for the case where you have
 * met someone before you have quoted them.
 */
import { useCallback, useMemo, useState } from 'react'
import { Button, Panel, StatusLine, TextArea, TextInput } from '../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import { formatMoney } from '@/lib/admin/money'
import { cn } from '@/lib/utils'
import type { ClientWithActivity } from '@/types/client'

interface Draft {
  id: string | null
  name: string
  company: string
  email: string
  phone: string
  role: string
  website: string
  notes: string
}

const EMPTY: Draft = {
  id: null,
  name: '',
  company: '',
  email: '',
  phone: '',
  role: '',
  website: '',
  notes: '',
}

const toDraft = (client: ClientWithActivity): Draft => ({
  id: client.id,
  name: client.name,
  company: client.company ?? '',
  email: client.email ?? '',
  phone: client.phone ?? '',
  role: client.role ?? '',
  website: client.website ?? '',
  notes: client.notes,
})

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export default function ClientsPanel({ clients }: { clients: ClientWithActivity[] }) {
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [deleting, setDeleting] = useState<ClientWithActivity | null>(null)

  /* Filtered here rather than round-tripping to the server: the whole list is
     already on the page, and a studio's client list is not large enough for a
     query per keystroke to be anything but slower. */
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return clients
    return clients.filter((client) =>
      [client.name, client.company, client.email].some((field) =>
        (field ?? '').toLowerCase().includes(term)
      )
    )
  }, [clients, search])

  const save = useCallback(async () => {
    if (!draft) return
    setBusy(true)
    setMessage(null)

    const isNew = draft.id === null
    const url = isNew ? '/api/v1/admin/clients' : `/api/v1/admin/clients?id=${draft.id}`

    try {
      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const body: unknown = await response.json()

      if (!response.ok) {
        setMessage({
          tone: 'error',
          text: (body as { error?: { message?: string } }).error?.message ?? 'That did not save.',
        })
        return
      }

      // Reload: the list carries per-client quote counts the server computed.
      window.location.reload()
    } catch {
      setMessage({ tone: 'error', text: 'We could not reach the server. Try again.' })
    } finally {
      setBusy(false)
    }
  }, [draft])

  const remove = useCallback(async (client: ClientWithActivity) => {
    const response = await fetch(`/api/v1/admin/clients?id=${client.id}`, { method: 'DELETE' })
    if (response.ok) window.location.reload()
    else setMessage({ tone: 'error', text: 'That client could not be deleted.' })
  }, [])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="wh-h3">Clients</h1>
          <p className="mt-1 text-muted-foreground">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'}. Quoting someone new adds
            them here automatically.
          </p>
        </div>
        <Button tone="primary" onClick={() => setDraft(EMPTY)}>
          Add a client
        </Button>
      </div>

      {message && (
        <div className="mb-6">
          <StatusLine tone={message.tone}>{message.text}</StatusLine>
        </div>
      )}

      {draft && (
        <div className="mb-6">
          <Panel
            title={draft.id ? 'Edit client' : 'New client'}
            action={
              <Button tone="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            }
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                label="Name"
                required
                value={draft.name}
                onChange={(name) => setDraft({ ...draft, name })}
              />
              <TextInput
                label="Company"
                value={draft.company}
                onChange={(company) => setDraft({ ...draft, company })}
              />
              <TextInput
                label="Email"
                type="email"
                hint="How a client is recognised across quotes."
                value={draft.email}
                onChange={(email) => setDraft({ ...draft, email })}
              />
              <TextInput
                label="Phone"
                value={draft.phone}
                onChange={(phone) => setDraft({ ...draft, phone })}
              />
              <TextInput
                label="Their role"
                value={draft.role}
                onChange={(role) => setDraft({ ...draft, role })}
              />
              <TextInput
                label="Website"
                type="url"
                placeholder="https://"
                value={draft.website}
                onChange={(website) => setDraft({ ...draft, website })}
              />
            </div>

            <div className="mt-5">
              <TextArea
                label="Notes"
                rows={3}
                hint="Only you see these."
                value={draft.notes}
                onChange={(notes) => setDraft({ ...draft, notes })}
              />
            </div>

            <div className="mt-5">
              <Button tone="primary" onClick={save} disabled={busy || draft.name.trim() === ''}>
                {busy ? 'Saving…' : 'Save client'}
              </Button>
            </div>
          </Panel>
        </div>
      )}

      <div className="mb-5">
        <label className="sr-only" htmlFor="client-search">
          Search clients
        </label>
        <input
          id="client-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, company or email"
          className="min-h-12 w-full rounded-xl border border-border bg-card px-4 text-base outline-none focus-visible:border-foreground"
        />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 font-display text-xl">
            {search ? 'Nothing matches that' : 'No clients yet'}
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            {search
              ? 'Try a different search.'
              : 'Create a quote and the client on it appears here automatically.'}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((client) => (
            <li
              key={client.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5"
            >
              <div className="mb-3">
                <p className="font-display text-lg leading-tight">{client.name}</p>
                {client.company && (
                  <p className="text-base text-muted-foreground">{client.company}</p>
                )}
              </div>

              <dl className="mb-4 flex flex-col gap-1 text-sm">
                {client.email && (
                  <div className="flex gap-2">
                    <dt className="sr-only">Email</dt>
                    <dd className="truncate">
                      <a href={`mailto:${client.email}`} className="underline">
                        {client.email}
                      </a>
                    </dd>
                  </div>
                )}
                {client.phone && (
                  <div className="flex gap-2">
                    <dt className="sr-only">Phone</dt>
                    <dd className="text-muted-foreground">{client.phone}</dd>
                  </div>
                )}
              </dl>

              <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>
                  {client.quoteCount} {client.quoteCount === 1 ? 'quote' : 'quotes'}
                </span>
                {client.acceptedCount > 0 && (
                  <span className={cn('text-foreground')}>{client.acceptedCount} accepted</span>
                )}
                {Object.entries(client.wonByCurrency).map(([currency, total]) => (
                  <span key={currency} className="font-mono text-foreground">
                    {formatMoney(total, currency)}
                  </span>
                ))}
              </div>

              {client.lastQuoteAt && (
                <p className="mb-4 text-sm text-muted-foreground">
                  Last quoted {dateFormat.format(new Date(client.lastQuoteAt))}
                </p>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                <Button onClick={() => setDraft(toDraft(client))}>Edit</Button>
                <a
                  href={`/admin/quotes?q=${encodeURIComponent(client.company || client.name)}`}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-base text-muted-foreground transition-colors hover:text-foreground"
                >
                  Their quotes
                </a>
                <Button tone="danger" onClick={() => setDeleting(client)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        tone="danger"
        title={`Delete ${deleting?.name ?? 'this client'}?`}
        body="Their quotes are not deleted and keep the name they were sent under. Only the client record goes."
        confirmLabel="Delete client"
        cancelLabel="Keep it"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          const target = deleting
          setDeleting(null)
          if (target) void remove(target)
        }}
      />
    </div>
  )
}
