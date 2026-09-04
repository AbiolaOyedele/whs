/** llms.txt generator island. Stateless — nothing is stored server-side. */
import { useState } from 'react'
import { inputClass } from './form-primitives'

interface Result {
  markdown: string
  discovered: number
  included: number
}

export default function LlmsTxtGenerator() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const url = new FormData(event.currentTarget).get('url')
    if (typeof url !== 'string' || url.trim() === '') return

    setStatus('loading')
    setResult(null)
    setMessage('')

    try {
      const response = await fetch('/api/v1/tools/llms-txt-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const payload = (await response.json().catch(() => ({}))) as Partial<Result> & {
        error?: { message?: string }
      }

      if (!response.ok || typeof payload.markdown !== 'string') {
        setStatus('error')
        setMessage(payload.error?.message ?? 'We could not generate a file for that address.')
        return
      }

      setResult({
        markdown: payload.markdown,
        discovered: payload.discovered ?? 0,
        included: payload.included ?? 0,
      })
      setStatus('done')
    } catch {
      setStatus('error')
      setMessage('We could not reach the server. Please try again.')
    }
  }

  async function copy() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.markdown)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setMessage('Copying was blocked. Select the text and copy it manually.')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="site-url" className="block text-sm font-medium">
            Website or sitemap URL
          </label>
          <input
            id="site-url"
            name="url"
            type="url"
            required
            placeholder="https://example.com"
            className={`${inputClass} mt-2`}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Nothing is stored. Larger sites can take a few seconds.
          </p>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="wh-tap inline-flex items-center justify-center rounded-full bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {status === 'loading' ? 'Generating…' : 'Generate llms.txt'}
        </button>
      </form>

      {status === 'error' && (
        <p
          role="alert"
          className="rounded-lg border border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/5 px-4 py-3 text-sm"
        >
          {message}
        </p>
      )}

      {status === 'done' && result && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-muted-foreground">
              Found {result.discovered} URLs, included {result.included}.
            </p>
            <button
              type="button"
              onClick={copy}
              className="wh-tap inline-flex items-center rounded-full border border-border px-4 text-sm transition-colors hover:bg-muted"
            >
              {copied ? 'Copied' : 'Copy Markdown'}
            </button>
          </div>
          <div className="mt-3 max-h-96 overflow-auto rounded-xl bg-surface-dark p-4">
            <pre className="font-mono text-xs whitespace-pre-wrap text-white/85">
              <code>{result.markdown}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
