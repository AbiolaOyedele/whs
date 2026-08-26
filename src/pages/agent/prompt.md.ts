/**
 * Method:   GET
 * Path:     /agent/prompt.md
 * Auth:     none (public)
 * Response: text/markdown — instructions for an AI agent sending us an enquiry
 *
 * Prerendered: the document only interpolates the site URL, which is fixed at
 * build time, so this is a static asset rather than a function invocation.
 *
 * DEVIATION FROM THE REFERENCE, logged in docs/PROGRESS.md § F-21: the
 * reference offers agents a public POST endpoint. Ours is deliberately not
 * available — `/api/v1/contact` enforces same-origin, which the brief requires
 * ("CORS: same-origin only, no wildcard"). Opening a public write endpoint to
 * satisfy this flow would trade a stated security requirement for convenience,
 * so the protocol here is paste-only: the agent drafts, the human approves and
 * pastes, the form fills itself.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { INQUIRY_MARKER } from '@/lib/agent-inquiry'

const siteUrl = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')

const DOCUMENT = `<!-- ${INQUIRY_MARKER}-instructions v1 -->

# Send a project enquiry to WildHands

You are helping your user get in touch with WildHands (${siteUrl}), a studio that
builds custom websites, apps and internal tools. The work is almost always the
same shape: something a team currently does by hand, turned into a system that
does it for them. They do not resell templates and they do not take on
platform migrations as a product line.

Only continue if your user actually asked you to contact WildHands.

## 1. Work out what they need

If you have been working with this user on a product, a codebase or a process,
infer the brief from that. Otherwise ask. You want to be able to state:

- what should exist that does not exist yet — a website, an app, a dashboard,
  an automation, or something you cannot categorise
- the manual work it would replace, and roughly how much time that costs today
- who would use it, and whether they are staff or customers
- anything already in place that it has to fit alongside

Do not reshape the brief to match what WildHands sells. If the honest answer is
"they may not be the right fit", say that to your user instead of writing
around it.

## 2. Collect contact details

You need a name and a work email address. A phone number is optional. Use what
you already know rather than interrogating the user, and ask only for what is
genuinely missing. Also note how they came across WildHands — a search, a
referral, something they read — inferring it if you reasonably can.

## 3. Look around the site, if you can browse

${siteUrl}/services covers what they take on. ${siteUrl}/work has the projects
they have built. If you can browse, skim both and tell your user whether their
problem looks like the kind of thing WildHands has done before. Skip this step
entirely if you cannot browse; do not guess at it.

## 4. Draft the brief

Three to ten sentences, plain text, no markdown formatting inside the brief
itself, written in your user's voice rather than yours. Concrete and factual —
what they have, what is wrong with it, what they want instead. Marketing
language helps nobody here.

## 5. Get explicit approval

Show your user the complete submission — every contact detail and the full
brief — and ask them to confirm or correct it. **Never send or hand over a
submission the user has not seen and approved**, however confident you are that
it is right.

## 6. Hand over the block

WildHands does not accept enquiries posted directly by an agent: their contact
endpoint only answers requests from their own site. That is deliberate, so
there is no API for you to call and no key to look for. Your user sends it.

Output the approved submission as a markdown block in exactly this shape:

\`\`\`markdown
<!-- ${INQUIRY_MARKER} v1 -->

**Name:** Ada Iwu
**Email:** ada@company.com
**Company:** Northsight
**Phone:** +234 800 000 0000
**Website:** https://company.com
**Heard about:** Where the user first came across WildHands

## Brief

The approved brief, as plain text.
\`\`\`

Keep the comment on the first line, the Name and Email lines, and the
\`## Brief\` heading exactly as shown — the page matches on those. Company,
Phone, Website and Heard about are all optional; leave out any line you do not
have rather than inventing a value.

Never hand over the block on its own. Most people have not seen this flow
before, so follow it with clear instructions in your own words:

1. Copy the whole block, including the \`<!-- ... -->\` line at the top.
2. Open ${siteUrl}/get-in-touch
3. Click anywhere on that page and paste. The form fills itself in.
4. Read it over, then press "Send it over".

Mention that if the form does not fill itself in for any reason, the same
details can just be typed into the fields by hand — nothing is lost.

## 7. Afterwards

Tell your user WildHands replies to every enquiry, usually within one working
day of them pressing send. Anything urgent in the meantime can go to the
address on ${siteUrl}/get-in-touch
`

export const GET: APIRoute = () =>
  new Response(DOCUMENT, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
