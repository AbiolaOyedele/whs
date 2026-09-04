/**
 * The website editor.
 *
 * Fields on the left, a live preview of the real page on the right. The preview
 * is an iframe pointed at the site itself rather than a reconstruction: a mock
 * of the page would drift from the page, and the moment it did the editor would
 * be lying about what publishing does.
 *
 * The flow is Save, then Publish, which is the model chosen for this build:
 * saving stores the edit and refreshes the preview immediately; publishing
 * triggers a rebuild so visitors see it. Keeping those separate is what lets
 * the public site stay fully static, which is where its speed comes from.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Panel, StatusLine, TextArea, TextInput } from '../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import { ColourField } from './ColourField'
import { cn } from '@/lib/utils'
import type { ContentEntry } from '@/config/content-registry'
import type { TokenEntry } from '@/config/token-registry'

interface Props {
  entries: ContentEntry[]
  tokens: TokenEntry[]
  /** Current overrides. Absent keys fall back to the registry defaults. */
  contentValues: Record<string, string | string[]>
  tokenValues: Record<string, string>
  pages: string[]
  tokenGroups: string[]
  publishEnabled: boolean
  previewPath: string
}

/** Which page each tab previews. Keys match `ContentEntry.page`. */
const PREVIEW_PATHS: Record<string, string> = {
  Home: '/',
  'Site-wide': '/',
}

export default function WebsiteEditor({
  entries,
  tokens,
  contentValues,
  tokenValues,
  pages,
  tokenGroups,
  publishEnabled,
  previewPath,
}: Props) {
  const TABS = useMemo(() => [...pages, 'Colours & type'], [pages])

  const [tab, setTab] = useState<string>(TABS[0] ?? 'Home')
  const [content, setContent] = useState<Record<string, string | string[]>>(contentValues)
  const [tokenState, setTokenState] = useState<Record<string, string>>(tokenValues)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{
    tone: 'idle' | 'error' | 'success'
    text: string
  } | null>(null)

  const frameRef = useRef<HTMLIFrameElement>(null)
  const [frameKey, setFrameKey] = useState(0)

  /**
   * Pushes the current draft into the preview frame.
   *
   * Same-origin, so the target origin is pinned rather than '*': a wildcard
   * would broadcast the draft to whatever happened to be framed.
   */
  const pushToPreview = useCallback(
    (draftContent: Record<string, string | string[]>, draftTokens: Record<string, string>) => {
      const frame = frameRef.current?.contentWindow
      if (!frame) return

      const flatContent: Record<string, string> = {}
      for (const [key, value] of Object.entries(draftContent)) {
        flatContent[key] = Array.isArray(value) ? value.join('\n') : value
      }

      frame.postMessage(
        { type: 'wh:preview', content: flatContent, tokens: draftTokens },
        window.location.origin
      )
    },
    []
  )

  /*
   * The frame announces itself when the bridge has loaded, which is more
   * reliable than the iframe's own load event: that fires before the module
   * script has run, so a draft pushed on load would arrive at nobody.
   */
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if ((event.data as { type?: string })?.type !== 'wh:preview-ready') return
      pushToPreview(content, tokenState)
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [content, tokenState, pushToPreview])

  // Live: every edit is reflected in the frame immediately, with no save and no
  // reload. The DOM patch is cheap enough that debouncing would only add lag.
  useEffect(() => {
    pushToPreview(content, tokenState)
  }, [content, tokenState, pushToPreview])

  const isTokenTab = tab === 'Colours & type'
  const preview = PREVIEW_PATHS[tab] ?? previewPath

  /** Current value of a content key, falling back to what the repo ships. */
  const valueOf = useCallback(
    (entry: ContentEntry): string => {
      const override = content[entry.key]
      if (Array.isArray(override)) return override.join('\n')
      if (typeof override === 'string' && override.length > 0) return override
      return Array.isArray(entry.defaultValue) ? entry.defaultValue.join('\n') : entry.defaultValue
    },
    [content]
  )

  const isOverridden = useCallback(
    (entry: ContentEntry): boolean => {
      const override = content[entry.key]
      if (override === undefined) return false
      const asString = Array.isArray(override) ? override.join('\n') : override
      const asDefault = Array.isArray(entry.defaultValue)
        ? entry.defaultValue.join('\n')
        : entry.defaultValue
      return asString.length > 0 && asString !== asDefault
    },
    [content]
  )

  const setContentValue = (entry: ContentEntry, raw: string) => {
    setDirty(true)
    setContent((current) => ({
      ...current,
      [entry.key]:
        entry.type === 'list'
          ? raw
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
          : raw,
    }))
  }

  const save = async () => {
    setBusy(true)
    setMessage(null)

    try {
      const response = await fetch('/api/v1/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tokens: tokenState }),
      })
      const body: unknown = await response.json()

      if (!response.ok) {
        setMessage({
          tone: 'error',
          text:
            (body as { error?: { message?: string } }).error?.message ??
            'That did not save. Try again.',
        })
        return
      }

      setDirty(false)
      setMessage({ tone: 'success', text: 'Saved. Publish when you want visitors to see it.' })
    } catch {
      setMessage({
        tone: 'error',
        text: 'We could not reach the server. Check your connection and try again.',
      })
    } finally {
      setBusy(false)
    }
  }

  const [confirmingPublish, setConfirmingPublish] = useState(false)

  const publish = async () => {
    setBusy(true)
    setMessage(null)

    try {
      const response = await fetch('/api/v1/admin/publish', { method: 'POST' })
      const body: unknown = await response.json()

      setMessage({
        tone: response.ok ? 'success' : 'error',
        text: response.ok
          ? ((body as { message?: string }).message ?? 'Building now.')
          : ((body as { error?: { message?: string } }).error?.message ??
            'That did not start a build.'),
      })
    } catch {
      setMessage({ tone: 'error', text: 'We could not reach the server. Try again.' })
    } finally {
      setBusy(false)
    }
  }

  const sectionsFor = (page: string): Array<[string, ContentEntry[]]> => {
    const grouped = new Map<string, ContentEntry[]>()
    for (const entry of entries.filter((item) => item.page === page)) {
      const bucket = grouped.get(entry.section) ?? []
      bucket.push(entry)
      grouped.set(entry.section, bucket)
    }
    return [...grouped.entries()]
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="wh-h1-compact">Website</h1>
          <p className="mt-1 text-muted-foreground">
            Edit the copy and the brand. Save stores it; publish puts it live.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={save} disabled={busy || !dirty}>
            {busy ? 'Working…' : dirty ? 'Save' : 'Saved'}
          </Button>
          <Button
            tone="primary"
            onClick={() => (dirty ? setConfirmingPublish(true) : void publish())}
            disabled={busy || !publishEnabled}
          >
            Publish
          </Button>
        </div>
      </div>

      {!publishEnabled && (
        <div className="mb-6 rounded-2xl border border-border bg-muted p-4">
          <p className="mb-3 text-base">
            Publishing is not connected yet, so the Publish button cannot rebuild the site. Saving
            still works: your edits are stored and appear on the next deploy either way.
          </p>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-base text-muted-foreground">
            <li>
              In Vercel: Project Settings → Git → Deploy Hooks. Create one on the{' '}
              <span className="font-mono text-sm">main</span> branch.
            </li>
            <li>
              Set the URL it gives you as{' '}
              <span className="font-mono text-sm">WH_VERCEL_DEPLOY_HOOK_URL</span>, then redeploy.
            </li>
          </ol>
        </div>
      )}

      {message && (
        <div className="mb-6">
          <StatusLine tone={message.tone}>{message.text}</StatusLine>
        </div>
      )}

      {/* Tabs. Horizontal scroller on small screens. */}
      <div
        role="tablist"
        aria-label="Sections of the site"
        className="-mx-5 mb-6 flex gap-1 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0"
      >
        {TABS.map((entry) => (
          <button
            key={entry}
            role="tab"
            type="button"
            aria-selected={tab === entry}
            onClick={() => setTab(entry)}
            className={cn(
              'min-h-11 shrink-0 rounded-full px-4 text-base transition-colors',
              tab === entry
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {entry}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {isTokenTab
            ? tokenGroups.map((group) => (
                <Panel
                  key={group}
                  title={group}
                  description={
                    group === 'Brand'
                      ? 'These carry the brand. Changing them changes every page at once.'
                      : undefined
                  }
                >
                  <div className="flex flex-col gap-5">
                    {tokens
                      .filter((entry) => entry.group === group)
                      .map((entry) =>
                        entry.type === 'colour' ? (
                          <ColourField
                            key={entry.key}
                            label={entry.label}
                            help={entry.help}
                            value={tokenState[entry.key] ?? ''}
                            defaultValue={entry.defaultValue}
                            onChange={(value) => {
                              setDirty(true)
                              setTokenState((current) => ({ ...current, [entry.key]: value }))
                            }}
                          />
                        ) : (
                          <TextInput
                            key={entry.key}
                            label={entry.label}
                            hint={entry.help}
                            value={tokenState[entry.key] ?? entry.defaultValue}
                            onChange={(value) => {
                              setDirty(true)
                              setTokenState((current) => ({ ...current, [entry.key]: value }))
                            }}
                          />
                        )
                      )}
                  </div>
                </Panel>
              ))
            : sectionsFor(tab).map(([section, sectionEntries]) => (
                <Panel key={section} title={section}>
                  <div className="flex flex-col gap-5">
                    {sectionEntries.map((entry) => (
                      <div key={entry.key}>
                        {entry.type === 'text' || entry.type === 'url' ? (
                          <TextInput
                            label={entry.label}
                            hint={entry.help}
                            value={valueOf(entry)}
                            onChange={(value) => setContentValue(entry, value)}
                          />
                        ) : (
                          <TextArea
                            label={entry.label}
                            hint={
                              entry.type === 'list' ? (entry.help ?? 'One per line.') : entry.help
                            }
                            rows={entry.type === 'list' ? 5 : 3}
                            value={valueOf(entry)}
                            onChange={(value) => setContentValue(entry, value)}
                          />
                        )}

                        {isOverridden(entry) && (
                          <button
                            type="button"
                            onClick={() => {
                              setDirty(true)
                              setContent((current) => ({ ...current, [entry.key]: '' }))
                            }}
                            className="mt-1 min-h-11 text-sm text-muted-foreground underline transition-colors hover:text-foreground"
                          >
                            Reset to the original copy
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </Panel>
              ))}
        </div>

        {/* Live preview. Hidden below xl: side by side needs the width, and a
            full-width iframe under a form is not a preview, it is a scroll. */}
        <aside className="hidden xl:sticky xl:top-6 xl:block">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg">Preview</h2>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{preview}</span>
              <Button tone="ghost" onClick={() => setFrameKey((key) => key + 1)}>
                Refresh
              </Button>
            </div>
          </div>
          <iframe
            key={frameKey}
            ref={frameRef}
            src={`${preview}${preview.includes('?') ? '&' : '?'}whpreview=1`}
            title="Preview of the site"
            className="h-[calc(100svh-12rem)] w-full rounded-2xl border border-border bg-card"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            This is the real page, rendered with your saved edits. Visitors see it after you
            publish.
          </p>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmingPublish}
        title="Publish without saving?"
        body="You have unsaved changes. Publishing now rebuilds the site from the last save, so those edits will not appear."
        confirmLabel="Publish anyway"
        cancelLabel="Go back"
        onCancel={() => setConfirmingPublish(false)}
        onConfirm={() => {
          setConfirmingPublish(false)
          void publish()
        }}
      />

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-5 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Unsaved changes</p>
            <Button tone="primary" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
