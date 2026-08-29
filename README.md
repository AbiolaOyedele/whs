# WildHands — marketing website

Marketing and lead-generation site for WildHands. Static-first Astro
build, optimised for Core Web Vitals and for AI answer engines (ChatGPT,
Perplexity, Claude, Google AI Overviews) as well as human visitors.

> **Status: structurally complete, content pending.** All 20 build steps are
> done — 56 pages, every template, all four forms, the llms.txt tool, and the
> full SEO layer. **Every word of copy is placeholder** and every client name is
> fictional. See [`docs/PROGRESS.md`](docs/PROGRESS.md) for what still needs a
> real answer before launch.

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

Rendering is hybrid: every page is prerendered to static HTML, and API routes
under `src/pages/api/v1/` opt into SSR with `export const prerender = false`.

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

`env.ts` exports two things: `publicEnv` (PUBLIC_* only, safe in client islands)
and `serverEnv()` (includes secrets, throws if called in a browser bundle).

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

68 Vitest tests covering the security-critical logic — the SSRF address guard,
same-origin enforcement, the honeypot, CV upload validation, the rate limiter,
and error-response leakage. `tests/integration` and `tests/e2e` are scaffolded
but empty; they are worth filling once real content and a staging URL exist.

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
  components/   layout · ui · sections · forms
  config/       env.ts — the only module that reads env vars
  content/      services · work · stack · insights · industries
  layouts/
  lib/          errors.ts · resend.ts · schemas/ — all provider logic lives here
  pages/        routes; api/v1/ for server endpoints
  styles/       global.css — Tailwind v4 @theme tokens
  types/  utils/
docs/           PROGRESS.md · site-copy.md
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
