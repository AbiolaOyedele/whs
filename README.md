# WildHands Studios — marketing website

Marketing and lead-generation site for WildHands Studios. Static-first Astro
build, optimised for Core Web Vitals and for AI answer engines (ChatGPT,
Perplexity, Claude, Google AI Overviews) as well as human visitors.

> **Status: scaffold only.** Steps 1–4 of the build order are complete. Page
> templates, components, content and forms are placeholders. See
> [`docs/PROGRESS.md`](docs/PROGRESS.md) for what is done, what is blocked, and
> what still needs confirmation.

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

`tests/unit`, `tests/integration` and `tests/e2e` are scaffolded but empty — no
runner is wired yet. It gets added alongside the first real feature code (Step 17,
form validation) rather than against placeholder pages.

## Deployment

Vercel, via `@astrojs/vercel`. Push to the default branch to deploy; set the five
environment variables above in the Vercel project settings first, or the build
will fail its env validation (by design).

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
docs/           reference-analysis.md · PROGRESS.md
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

Structure, layout, component architecture and animation behaviour are modelled on
an analysis of a reference site (`docs/reference-analysis.md`). **Copy, client
names and testimonials are not.** All seed content is original placeholder text
with obviously fictional client names, marked `placeholder: true` in frontmatter.
See `docs/PROGRESS.md` § F-2.
