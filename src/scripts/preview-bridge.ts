/**
 * Live preview bridge, loaded only when the page is inside the website editor.
 *
 * The editor previously refreshed the iframe on save, which meant "live" was a
 * lie: you typed, and nothing moved until you pressed a button. This listens
 * for the editor's messages and patches the page in place, so a colour or a
 * headline updates as you type with no reload and no database write.
 *
 * Two kinds of patch, because they need different mechanisms:
 *
 *   tokens — set as CSS custom properties on the root element, which is exactly
 *            how `tokenOverrideCss` applies them at build time. One assignment
 *            repaints the whole page.
 *   text   — written into `[data-wh-content="<key>"]` nodes. Those attributes
 *            are rendered by the templates and cost nothing when unused.
 *
 * SECURITY. This script runs on the real site, so it verifies that every
 * message came from our own origin before touching anything, and it only ever
 * assigns `textContent` — never `innerHTML`. A message cannot inject markup
 * even if one were somehow forged.
 */
interface PreviewMessage {
  type: 'wh:preview'
  tokens?: Record<string, string>
  content?: Record<string, string>
}

/** Mirrors the server-side validator: no characters that could escape a value. */
const SAFE_TOKEN_VALUE = /^[a-zA-Z0-9\s.,%#()/-]{1,120}$/

function isPreviewMessage(value: unknown): value is PreviewMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { type?: unknown }).type === 'wh:preview'
  )
}

function applyTokens(tokens: Record<string, string>): void {
  for (const [key, raw] of Object.entries(tokens)) {
    if (!/^[a-z0-9-]{1,60}$/.test(key)) continue

    const value = raw.trim()
    if (value.length === 0) {
      // Cleared in the editor: drop the inline override so the stylesheet's
      // own value shows through again, exactly as a save would.
      document.documentElement.style.removeProperty(`--${key}`)
      continue
    }

    if (!SAFE_TOKEN_VALUE.test(value)) continue
    document.documentElement.style.setProperty(`--${key}`, value)
  }
}

function applyContent(content: Record<string, string>): void {
  for (const [key, value] of Object.entries(content)) {
    const nodes = document.querySelectorAll<HTMLElement>(`[data-wh-content="${CSS.escape(key)}"]`)
    // textContent, never innerHTML: this is the boundary where editor input
    // reaches the page, and it must not be able to carry markup.
    nodes.forEach((node) => {
      node.textContent = value
    })
  }
}

/*
 * Self-gating. This ships on every page, so it must do nothing whatsoever
 * unless the page is genuinely inside the website editor's preview frame: no
 * message listener on the public site, and none when the page is not framed.
 */
const inPreviewFrame =
  new URLSearchParams(window.location.search).get('whpreview') === '1' && window.parent !== window

if (inPreviewFrame) {
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return
    if (!isPreviewMessage(event.data)) return

    if (event.data.tokens) applyTokens(event.data.tokens)
    if (event.data.content) applyContent(event.data.content)
  })

  // Tell the editor the page is ready, so it can push the current draft without
  // waiting a guessed number of milliseconds for load.
  window.parent.postMessage({ type: 'wh:preview-ready' }, window.location.origin)
}
