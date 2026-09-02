# WildHands — marketing website

Marketing and lead-generation site for WildHands. Static-first Astro
build, optimised for Core Web Vitals and for AI answer engines (ChatGPT,
Perplexity, Claude, Google AI Overviews) as well as human visitors.

> **Status: structurally complete, content partly real.** All 20 build steps are
> done — 52 public pages, every template, all four forms, the llms.txt tool, the
> full SEO layer, and an admin panel at `/admin`. Home, services and the four
> case studies carry real copy; stack, insights, industries, enterprise, careers
> and the freelance hub are still placeholder. See
> [`docs/PROGRESS.md`](docs/PROGRESS.md) for what still needs a real answer
> before launch.

## Stack

| Concern       | Choice                                                               |
| ------------- | -------------------------------------------------------------------- |
| Framework     | Astro 7 — static output, islands architecture                        |
| Interactivity | React islands, `client:visible` by default                           |
| Styling       | Tailwind CSS v4, CSS-first `@theme` config (no `tailwind.config.js`) |
| Content       | Astro content collections (file-based Markdown/MDX)                  |
| Validation    | Zod 4, server-side on every form                                     |
| Email         | Resend                                                               |
| Analytics     | PostHog                                                              |
| Hosting       | Vercel (`@astrojs/vercel`)                                           |
| Database      | None — this is a stateless marketing site                            |

Rendering is hybrid: every public page is prerendered to static HTML, and API
routes under `src/pages/api/v1/`, everything under `/admin`, and the client
quote pages opt into SSR with `export const prerender = false`.

**The public site is still fully static.** The admin writes to Supabase, and a
Publish button triggers a Vercel rebuild that bakes those edits into the static
output. Visitors never wait on a database, and a database outage cannot take the
marketing site down — pages fall back to the copy committed in this repository.

## Local setup

Requires Node 20–24 (see `.nvmrc`; Vercel Functions do not support Node 25).

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

The dev server runs at http://localhost:4321.

## Environment variables

Validated with Zod at startup in `src/config/env.ts` — the **only** module
permitted to read `process.env` / `import.meta.env`. ESLint enforces this.
A missing or malformed variable fails the build with a readable error.

| Variable                     | Required | Scope  | Purpose                                                         |
| ---------------------------- | -------- | ------ | --------------------------------------------------------------- |
| `RESEND_API_KEY`             | yes      | server | Transactional email for all four forms. Never prefix `PUBLIC_`. |
| `CONTACT_NOTIFICATION_EMAIL` | yes      | server | Where form notifications are delivered.                         |
| `PUBLIC_SITE_URL`            | yes      | public | Canonical origin — sitemap, canonical tags, OG tags.            |
| `PUBLIC_POSTHOG_KEY`         | no       | public | PostHog project key. Omit to disable analytics.                 |
| `PUBLIC_POSTHOG_HOST`        | no       | public | PostHog host (self-hosted proxy).                               |
| `CLOUDINARY_*`               | no       | server | CV and quote-image storage. Three keys. See `.env.example`.     |

### Admin panel

Validated as a separate group, and lazily. With none of it set the marketing
site still builds and all four forms still send — `/admin` simply shows a setup
screen naming what is missing.

| Variable                    | Required | Purpose                                                                  |
| --------------------------- | -------- | ------------------------------------------------------------------------ |
| `SUPABASE_URL`              | yes      | Project URL.                                                             |
| `SUPABASE_ANON_KEY`         | yes      | Used only to exchange a password for a session.                          |
| `SUPABASE_SERVICE_ROLE_KEY` | yes      | Bypasses RLS. Server-only. Treat as a root password.                     |
| `ADMIN_ALLOWED_EMAILS`      | yes      | Who may sign in. A correct password alone is **not** enough.             |
| `QUOTE_PIN_PEPPER`          | yes      | Mixed into every quote PIN hash. 16+ chars. Rotating it voids every PIN. |
| `ANTHROPIC_API_KEY`         | no       | Claude, for quote drafting. Default provider.                            |
| `GEMINI_API_KEY`            | no       | Gemini, selectable per request.                                          |
| `GEMINI_MODEL`              | no       | Overrides the Gemini model id. Defaults to `gemini-2.5-pro`.             |
| `WH_VERCEL_DEPLOY_HOOK_URL` | no       | The Publish button. Without it the admin saves but cannot push live.     |
| `WH_VERCEL_API_TOKEN`       | no       | Read-only token for the analytics section.                               |
| `WH_VERCEL_PROJECT_ID`      | no       | Which project analytics reads.                                           |
| `WH_VERCEL_TEAM_ID`         | no       | Only when the project sits under a team.                                 |

`env.ts` exports three things: `publicEnv` (PUBLIC_* only, safe in client
islands), `serverEnv()` (includes secrets, throws if called in a browser
bundle), and `adminEnv()` (the admin group, same contract).

**Supabase is server-only by design.** The admin UI never talks to Supabase from
the browser — it calls our own `/api/v1/admin/*` routes and the session lives in
an httpOnly cookie, so no Supabase key of any kind ships in a client bundle.

## Scripts

```bash
npm run dev           # dev server
npm run build         # astro check && astro build
npm run preview       # preview the production build
npm run typecheck     # astro check
npm run lint          # eslint, zero warnings tolerated
npm run lint:fix
npm run format        # prettier --write
npm run format:check
```

## Tests

```bash
npm test
```

160 Vitest tests covering the security-critical logic:

- **Forms** — the SSRF address guard, same-origin enforcement, the honeypot, CV
  upload validation, the rate limiter, and error-response leakage.
- **Quote access** — PIN generation (six digits, no modulo bias), the salted
  digest, slug-binding so one quote's PIN cannot open another, and the signed
  session cookie against slug tampering, expiry tampering and forged signatures.
- **Quote money** — discount applied before tax, optional items excluded from
  the total, rounding half away from zero, and a discount that can never drive a
  total negative.
- **Quote validation** — the reference-link scheme allowlist, which is what
  stops a stored `javascript:` URL becoming script execution on a page we send
  to a client.
- **Site content** — the fallback chain (edit → committed copy → empty), and the
  design-token sanitiser that drops an unsafe value rather than emitting mangled
  CSS.

`tests/integration` and `tests/e2e` are scaffolded but empty; they are worth
filling once real content and a staging URL exist.

## Design

The design system lives in `src/styles/global.css` as Tailwind v4 `@theme`
tokens: one colour ramp, four surface radii plus the pill, a display scale
(`.wh-h1` → `.wh-h3`, with `.wh-h2-display` for statement headings), and a
breakpoint-stepped `.wh-container` that every section sits on. Nothing should
need an arbitrary value; if it does, that is a gap in the tokens.

Two self-hosted typefaces, no third-party font request: **Diagramm** for display
and **IBM Plex Sans** for body copy and UI. Weights are set once via
`--font-weight-display`.

**Copy is original.** All body text, headlines, testimonials and client names are
placeholder content with fictional companies until real content lands.

## Admin panel

At `/admin`, behind a Supabase password plus an email allowlist. Three sections:

- **Website** — edit page copy and brand tokens with a live preview of the real
  page, then Publish to trigger a rebuild. Every field falls back to the copy
  committed in this repository, so clearing one restores the original and an
  unreachable database changes nothing.
- **Analytics** — visitors, top pages, referrers, countries and devices from
  Vercel Web Analytics.
- **Quotes** — build a client quote (cost breakdown, timeline, reference links,
  images, terms), optionally drafted by Claude or Gemini, then send the client a
  link plus a six-digit code.

### This is a shared Supabase project

The project hosts more than WildHands, so **every table here lives in a
dedicated `wildhands` schema, never in `public`.** That is not tidiness. The
shared `public` schema already carries ~53 tables from other applications,
including `clients`, `tasks`, `invoices`, `notifications` and
`agency_design_tokens` — an unqualified `create table quotes` or
`create type quote_status` in `public` would have been a live collision.

The client is pinned to the schema once in [`src/lib/supabase.ts`](src/lib/supabase.ts),
so no query can reach another application's data.

Two things follow from sharing:

- **`auth.users` is project-wide.** Every other application writes users into
  the same table, which is why `ADMIN_ALLOWED_EMAILS` is load-bearing rather
  than belt-and-braces: without it, anyone who signs up to any application in
  this project could administer this site.
- **Use an address that does not already exist in the project.** Supabase allows
  one user per email per project, so an address another application already uses
  cannot get a second, separate account — reusing it would mean one password for
  both applications, and a password reset on the other one would open this
  admin. Plus-addressing solves it: `you+whs@gmail.com` is a distinct auth row
  with its own password, delivering to the same inbox. The allowlist matches
  exactly and never normalises the alias away; there is a test pinning that
  ([`tests/unit/admin-auth.test.ts`](tests/unit/admin-auth.test.ts)).
- **The service role key bypasses RLS across the whole project**, not just our
  schema. Treat it as a credential for every application here, not just ours.

### Setting it up

1. Run [`supabase/migrations/0001_admin_panel.sql`](supabase/migrations/0001_admin_panel.sql)
   in the Supabase SQL editor. Every statement in it is schema-qualified, so it
   cannot alter, lock or break anything in `public`.
2. **Settings → API → Exposed schemas → add `wildhands` → Save.** PostgREST only
   serves schemas it has been told about; without this, every admin query fails
   with `PGRST106`, which reads like a permissions bug and is not one.
3. Set the admin variables above. `/admin/setup` names anything missing.
4. Create your user in Supabase (Authentication → Users → Add user), using the
   address in `ADMIN_ALLOWED_EMAILS` — and check first that it is not already in
   the project's user list, per the note above.

### How client quotes are protected

A quote lives at `/quote/<slug>` and opens only after a six-digit code. The link
is readable so the client recognises their own name in it; the code, not the
URL, is the secret.

- PINs are stored as SHA-256 over (pepper, slug, PIN) and compared in constant
  time. The PIN itself is never stored, is shown exactly once when issued, and
  can only be replaced, never recovered.
- The slug is inside the digest, so an identical PIN on two quotes produces two
  different hashes and one client's code can never open another's quote.
- Verification is rate limited **per address and per quote**. Six digits is only
  a million combinations; those two limits are what make that adequate, and they
  are a pair. Removing either turns this into a weekend of scripted guessing.
- Nothing priced is read from the database until the PIN is known to be correct.
- `/admin` and `/quote/` send `noindex`, are excluded from `sitemap.xml`, and are
  disallowed in `robots.txt`.

Rotating `QUOTE_PIN_PEPPER` invalidates every existing PIN and every live client
session at once. That is the intended emergency lever.

## Deployment

Vercel, via `@astrojs/vercel`. Push to the default branch to deploy.

The build succeeds with no environment variables configured — pages are static
and only the API routes need secrets, which are validated on first use. Two
things to set in the Vercel project before launch:

- **`PUBLIC_SITE_URL`** — your real domain. Without it, canonical URLs, the
  sitemap, robots.txt and OG tags all point at the `.vercel.app` deployment
  host. The build prints a warning when this happens.
- **`RESEND_API_KEY`** and **`CONTACT_NOTIFICATION_EMAIL`** — until these are
  set, the four forms return a plain-English error rather than sending.

## Project structure

```
src/
  components/   layout · ui · sections · forms · admin
  config/       env.ts — the only module that reads env vars
                content-registry.ts · token-registry.ts — what the admin can edit
  content/      services · work · stack · insights · industries
  layouts/      BaseLayout (public) · AdminLayout (behind the password)
  lib/          errors.ts · resend.ts · schemas/ — all provider logic lives here
                admin/    quotes, auth, money, content · repositories/ — all DB queries
                ai/       claude.ts · gemini.ts behind one interface
  middleware.ts guards /admin
  pages/        routes; api/v1/ for server endpoints; admin/ and quote/ are SSR
  styles/       global.css — Tailwind v4 @theme tokens
  types/  utils/
docs/           PROGRESS.md · site-copy.md
supabase/       migrations/ — schema and RLS policies
tests/          unit · integration · e2e
```

### Layering rules

Enforced; a violation is a blocker.

- `.astro` pages compose components and read content collections. No business logic.
- API routes call `lib/` only. No provider SDK calls in a route handler.
- `lib/` holds all external-provider logic and the `AppError` class.
- Components call our own `/api/v1/` routes, never a provider directly.
- `src/config/env.ts` is the only module that reads environment variables.

## Content rules

All seed content is original placeholder text with obviously fictional client
names, marked `placeholder: true` in frontmatter. **Nothing ships with an
invented statistic, testimonial or client name presented as real.** Swap the
frontmatter flag when the content behind it becomes true.
