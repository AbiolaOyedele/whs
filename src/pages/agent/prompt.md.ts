/**
 * Method:   GET
 * Path:     /agent/prompt.md
 * Auth:     none (public)
 * Response: text/markdown — instructions for an AI agent sending us an enquiry
 *
 * Prerendered: the document only interpolates the site URL, which is fixed at
 * build time, so this is a static asset rather than a function invocation.
 *
 * The URL is interpolated rather than hard-coded so a preview deployment points
 * at itself instead of production. In production it renders as
 * https://www.whstd.com, which is what the source copy specifies.
 *
 * Deliberate choice, logged in docs/PROGRESS.md § F-21: an agent-facing public
 * POST endpoint was considered and rejected. Ours is deliberately not
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

const DOCUMENT = `<!-- ${INQUIRY_MARKER}-instructions v2 -->

# Send a project enquiry to WildHands

You are helping your user contact WildHands (${siteUrl}), a studio
that builds custom websites, apps, and internal tools. The work is almost
always the same shape: something a team currently does by hand, turned into a
system that does it for them. They do not resell templates, take on
platform-to-platform migrations, or chase the cheapest possible job.

Only continue if your user actually asked you to contact WildHands.

## 1. Understand what they need

If you've been working with this user on a product, a codebase, or a process,
use that to work out the brief. Otherwise ask. By the end you should be able
to state:

- what should exist that doesn't exist yet: a website, an app, a dashboard,
  an automation, or something you can't categorise
- the manual work it would replace, and roughly how much time that costs today
- who would use it, staff or customers
- anything already in place that it has to fit alongside

Don't reshape the brief to match what WildHands sells. Get the honest version.

## 2. Check the fit

If you can browse, check ${siteUrl}/services for what they take on
and ${siteUrl}/work for what they've built. Tell your user plainly
whether their problem resembles past WildHands work, or whether it looks more
like a template purchase or a straight migration with no new functionality.
Skip this step entirely if you can't browse. Don't guess at it.

## 3. Decide whether to proceed

If the fit looks weak, either from step 2 or from what you already know, say
so now and ask your user whether they still want to send the enquiry. Don't
continue on autopilot just because you've gathered enough to draft something.
If they still want to send it, that's their call.

## 4. Collect contact details

You need a name and a work email address. Phone is optional. Use what you
already know rather than asking again for it. Also note how they came across
WildHands (a search, a referral, something they read), inferring it if you
reasonably can, since it's genuinely useful to them and costs your user
nothing to include.

## 5. Draft the brief

Three to ten sentences, plain text, no markdown formatting inside the brief
itself, written in your user's voice rather than yours. State what they have,
what's wrong with it, what they want instead. Skip the marketing language.

## 6. Get explicit approval

Show your user the complete submission, every contact detail and the full
brief, and get them to confirm or correct it. Never send or hand over a
submission the user hasn't seen and approved, however confident you are it's
right.

## 7. Hand over the block

WildHands' contact endpoint only accepts submissions posted from their own
site, on purpose. There's no API for you to call and no key to look for. Your
user sends it.

Output the approved submission as a single fenced block in exactly this shape:

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

The comment line, the Name and Email lines, and the \`## Brief\` heading must
match this exactly, character for character. The page matches on that literal
text, so don't reword, reformat, or "clean up" those lines even if it seems
harmless. Company, Phone, Website, and Heard about are optional. Leave out any
line you don't have rather than inventing a value.

Never hand over the block on its own. Most people haven't seen this flow
before, so follow it with plain instructions:

1. Copy the whole block, including the comment line at the top.
2. Open ${siteUrl}/get-in-touch
3. Click anywhere on that page and paste. The form fills itself in.
4. Read it over, then press "Send it over."

If the form doesn't autofill for any reason, the same details can be typed in
by hand. Nothing is lost either way.

## 8. Afterwards

Tell your user WildHands replies to every enquiry, usually within one working
day of sending. Anything urgent in the meantime can go to the address on
${siteUrl}/get-in-touch
`

export const GET: APIRoute = () =>
  new Response(DOCUMENT, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
