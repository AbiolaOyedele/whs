'use client'

import { useState, type FormEvent } from 'react'
import { CodeBlock } from '@v2/components/features/blog/CodeBlock'
import { FormSubmit } from '@v2/components/features/forms/FormSubmit'
import { TextField } from '@v2/components/features/forms/TextField'
import { Icon } from '@v2/components/ui/Icon'
import { LLMS_TOOL } from '@v2/content/tools'

/** What POST /api/v1/tools/llms-txt-generator returns on success. */
interface GeneratorResult {
  markdown: string
  discovered: number
  included: number
}

interface GeneratorError {
  error?: { message?: string }
}

type Status = 'idle' | 'loading' | 'done' | 'error'

const FIELD_ID = 'llms-tool-url'

/**
 * The llms.txt generator: one address in, the Markdown file out, with a copy
 * button. Nothing is stored; the server reads the site's sitemap and returns
 * the file (src/pages/api/v1/tools/llms-txt-generator.ts).
 */
export function LlmsTxtGenerator() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [fieldError, setFieldError] = useState<string | undefined>(undefined)
  const [result, setResult] = useState<GeneratorResult | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const address = url.trim()
    if (address === '') {
      setFieldError(LLMS_TOOL.emptyError)
      document.getElementById(FIELD_ID)?.focus()
      return
    }

    setFieldError(undefined)
    setStatus('loading')
    setResult(null)
    setMessage('')

    try {
      const response = await fetch('/api/v1/tools/llms-txt-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: address }),
      })
      const payload = (await response.json().catch(() => ({}))) as Partial<GeneratorResult> & GeneratorError

      if (!response.ok || typeof payload.markdown !== 'string') {
        setStatus('error')
        setMessage(payload.error?.message ?? LLMS_TOOL.failed)
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
      setMessage(LLMS_TOOL.offline)
    }
  }

  const busy = status === 'loading'

  return (
    <div className="flex flex-col gap-fluid-lg">
      <form noValidate onSubmit={onSubmit} aria-busy={busy} className="flex max-w-160 flex-col gap-5">
        <TextField
          id={FIELD_ID}
          name="url"
          type="url"
          label={LLMS_TOOL.label}
          hint={LLMS_TOOL.hint}
          placeholder="https://example.com"
          autoComplete="url"
          required
          value={url}
          onChange={setUrl}
          error={fieldError}
        />
        {status === 'error' ? (
          <div role="alert" className="anim-fade-slide-in flex items-start gap-3 rounded-sm bg-white p-4 text-navy-900 outline outline-red">
            <Icon name="circleAlert" strokeWidth={1.6} className="mt-0.5 size-5 shrink-0 text-red" />
            <p className="text-body-md">{message}</p>
          </div>
        ) : null}
        <FormSubmit label={LLMS_TOOL.submit} busy={busy} privacyNote={false} />
      </form>

      {status === 'done' && result ? (
        <div className="anim-fade-slide-in">
          <p role="status" className="text-body-md mb-4 text-navy-500">
            {LLMS_TOOL.found(result.discovered, result.included)}
          </p>
          <div data-wysiwyg-root="" className="max-h-120 overflow-auto rounded-sm">
            <CodeBlock code={result.markdown} language="markdown" />
          </div>
        </div>
      ) : null}
    </div>
  )
}
