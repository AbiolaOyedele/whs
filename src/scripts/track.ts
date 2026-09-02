/**
 * The analytics beacon.
 *
 * Consent-gated, matching the promise the cookie banner makes. It stores
 * nothing on the device — no cookie, no localStorage entry — so strictly it
 * would not need consent, but the banner says analytics stay off until
 * accepted, and the banner is the promise.
 *
 * `keepalive` so a view still records when the click that triggered it is
 * already navigating away.
 */
function send(): void {
  const body = JSON.stringify({
    path: window.location.pathname + window.location.search,
    referrer: document.referrer,
  })

  void fetch('/api/v1/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // A failed beacon is not the visitor's problem.
  })
}

let sent = false

function start(): void {
  if (sent) return
  sent = true
  send()
}

try {
  if (localStorage.getItem('wh-consent') === 'granted') start()
} catch {
  // Storage blocked: stay off, which is the privacy-preserving default.
}

window.addEventListener('wh:consent-granted', start)
