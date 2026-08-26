# PROGRESS — WildHands Studios marketing site

Running log of completed build steps, flagged decisions, unverified details, and
placeholder seed content. This is the manager's checklist of what still needs a
real answer before launch.

Last updated: 2026-08-26

---

## Build step status

| Step  | Description                                                                            | Status                      |
| ----- | -------------------------------------------------------------------------------------- | --------------------------- |
| 1     | Project scaffold, `.gitignore`, `package.json`, `astro.config.mjs`, `docs/PROGRESS.md` | ✅ Done                     |
| 2     | `src/config/env.ts` with Zod validation                                                | ✅ Done                     |
| 3     | TypeScript strict config, ESLint, Prettier                                             | ✅ Done                     |
| 4     | Full folder structure, placeholder files                                               | ✅ Done                     |
| 5     | `src/styles/global.css` — Tailwind v4 `@theme` tokens                                  | ⛔ Blocked — see B-1, B-2   |
| 6     | `src/content.config.ts` — Zod schemas for 5 collections                                | ⬜ Not started              |
| 7     | `src/lib/errors.ts` — AppError                                                         | ⬜ Not started (stub only)  |
| 8     | Layout components — SiteHeader, MegaMenu, MobileMenu, Footer                           | ⬜ Not started              |
| 9     | UI primitives                                                                          | ⬜ Not started              |
| 10    | Home page                                                                              | ⬜ Not started              |
| 11–16 | Services / Work / Stack / Insights / Industries / static pages                         | ⬜ Not started              |
| 17    | Forms + Resend delivery                                                                | ⬜ Not started (stubs only) |
| 18    | llms-txt-generator tool                                                                | ⬜ Not started              |
| 19    | SEO layer                                                                              | ⬜ Not started              |
| 20    | Accessibility + Lighthouse + final QA                                                  | ⬜ Not started              |

### Step 1–4 verification

`npm run build` (which runs `astro check` then `astro build`), `npm run lint`, and
`npm run format:check` all pass clean on the scaffold:

- `astro check` — 38 files, 0 errors, 0 warnings, 0 hints
- `eslint . --max-warnings=0` — 0 problems
- `prettier --check .` — all files match

The three custom lint guardrails were probe-tested and confirmed firing:
`process.env` access outside `src/config/env.ts`, `import.meta.env` access
outside `src/config/env.ts`, and `any`.

---

## ⛔ BLOCKED — needs manager confirmation before proceeding

### B-1. Accent colour (blocks Step 5)

Bejamas' `--accent` is `oklch(91.98% .1905 128.5)` / `#befc65`, a lime-chartreuse.
Confirmed live. **This is their brand mark and will not be reused.**
`src/styles/global.css` currently ships neutral placeholder tokens with no accent
defined at all. **Need: WildHands Studios' actual brand accent colour.**

### B-2. Typeface (blocks Step 5)

Bejamas self-hosts **Neue Montreal** (Pangram Pangram) as `--default-font-family`.
Confirmed live. A licensed commercial typeface and part of their visual identity —
**will not be reused.** **Need: WildHands' actual typeface**, plus confirmation of
whether a licence is held or whether we should pick an open alternative.

### B-3. Service model assumption (blocks Steps 11, 13)

The whole page inventory (Services / Work / Stack / Insights / Industries) assumes
WildHands sells web design, development, and migration services, because that is
what the reference site's structure is built around. **If WildHands' actual service
model differs, the nav and page inventory must change before Services/Stack are built.**
Not yet confirmed.

### B-4. Salary calculator + AI ASCII art generator — NOT BUILT

Per the brief, both are held pending brand-fit confirmation. Neither
`src/pages/salary-calculator.astro` nor `src/pages/tools/ai-ascii-art-generator.astro`
has been created. The sitemap filter that excludes the ASCII generator is already
wired in `astro.config.mjs` and is inert until the page exists.

---

## 🚩 Flagged decisions and deviations

### F-1. Content collections config path — DEVIATION FROM BRIEF

The brief specifies `src/content/config.ts`. **Astro 7 treats that path as the
legacy collections location and errors on it**; `src/content.config.ts` is the
required modern location. Scaffolded at `src/content.config.ts`. Content entries
still live under `src/content/<collection>/` exactly as specified. No other part
of the folder structure deviates.

### F-2. Copy rules override Part 2 of the reference document

`docs/reference-analysis.md` Part 2 instructs building a verbatim clone —
"reuse copy verbatim", "do not paraphrase", and it lists Bejamas' real client
roster for logo walls and case-study seeds. **That section is superseded by the
CONTENT & COPYRIGHT RULES in the build brief and is not being followed.** All
copy will be original placeholder text; all client names will be obviously
fictional. Part 1 of the document is still the structural source of truth.

### F-3. `astro.config.mjs` reads env via Vite's `loadEnv`

Astro does not load `.env` into the config context automatically, so
`astro.config.mjs` calls `loadEnv` to hydrate `process.env` and then imports the
validated `publicEnv` from `src/config/env.ts`. This is build tooling, not
application code — every file under `src/` imports from `src/config/env.ts`.
ESLint enforces this with `no-restricted-properties` / `no-restricted-syntax`,
with an explicit allowlist for the config files.

### F-4. `env.ts` splits public and server env

Rather than one `env` export, the module exports `publicEnv` (PUBLIC_* only, safe
in client islands) and `serverEnv()` (includes `RESEND_API_KEY`, throws if called
in a browser bundle). This prevents a secret leaking into a client island bundle.
**Alternative worth considering:** Astro's built-in `astro:env` does this natively
with `astro:env/client` and `astro:env/server` imports. The brief specified
`src/config/env.ts`, so that is what was built — raise if we should switch.

### F-5. ESLint pinned to v9, not v10

`eslint-plugin-jsx-a11y@6.10.2` does not yet declare ESLint 10 support, so ESLint
is pinned to `^9.39.5`. Revisit when the plugin ships v10 peer support.

### F-6. `path-to-regexp` high-severity advisory — accepted, not fixed

`npm audit` reports 3 high findings, all one chain:
`@astrojs/vercel@11.0.8 → @vercel/routing-utils@5.3.3 → path-to-regexp@6.1.0`
(ReDoS via backtracking regexes). `npm audit fix --force` would downgrade
`@astrojs/vercel` to 8.0.4, which is incompatible with Astro 7. The package is a
**build-time** route-config dependency, not a runtime request path on a static
marketing site, so exposure is negligible. **Accepted for now**; recheck when
`@astrojs/vercel` bumps its `@vercel/routing-utils` range.

### F-7. Node version

Local Node is 25; Vercel Functions do not support 25 and will run Node 24.
`.nvmrc` pins `24` and `engines.node` is `>=20.0.0 <25.0.0`.

### F-8. Headless CMS decision — deferred, as instructed

Content is file-based Markdown/MDX via Astro content collections, no CMS. Per the
brief this gets revisited once the structural build is done. **Not yet raised for
a decision** — it should be raised before real content lands, since migrating
seeded collections later is more expensive than starting on a CMS.

---

## 🔍 Live verification log — bejamas.com

Fetched and inspected live on **2026-08-26** (computed styles + DOM + stylesheet
rules read directly in-browser), checked against `docs/reference-analysis.md`
§4.1–4.2 as the brief requires.

**Generator confirmed:** `Astro v7.2.2` live. We are on `astro@7.2.7` — same minor,
newer patch. Not a drift.

### ✅ Confirmed — document matches live

- **Design tokens (§3.1)** — every semantic token matches the document exactly:
  `--background`, `--foreground`, `--primary`, `--primary-foreground`,
  `--secondary`, `--accent`, `--accent-foreground`, `--muted`, `--muted-foreground`,
  `--card`, `--border`, `--input`, `--ring`, `--radius`, `--destructive`.
- **`--spacing: .25rem`**, **`--breakpoint-md: 48rem`**, **`--default-transition-duration: .15s`** — all confirmed.
- **Progressive header blur (§4.1)** — confirmed. `.progressive-header-blur__layer`
  applies `backdrop-filter: blur(var(--progressive-header-blur))` masked with
  `mask-image: var(--progressive-header-mask)`. Both custom properties are updated
  on scroll. Observed mask at scroll-top:
  `linear-gradient(0deg, transparent 0%, #fff 16.6667%, #fff 33.3333%, transparent 50%)`.
- **Mega menu panel (§4.1)** — confirmed, but the styling is **conditionally scoped**
  to `[data-slot="navigation-menu-viewport"]:has(.site-header__mega-menu)`:
  `border-radius: 1.25rem`, `background-color: color-mix(in oklab, var(--primary) 48%, transparent)`,
  `backdrop-filter: blur(24px)`. The _unscoped_ popup default is a light panel
  (`bg-popover` white, `rounded-lg` 8px, `ring-1`, `shadow`) — reading the base
  popup alone is misleading, the dark frosted treatment only applies when the open
  panel contains mega-menu content. Build it the same conditional way.
- **Mega menu entry animation (§4.1)** — confirmed:
  `[data-slot="navigation-menu-popup"]:has(.site-header__mega-menu)[data-starting-style]`
  sets `opacity: 1; scale: 0.96`, and `.site-header__mega-menu[data-starting-style]:not([data-activation-direction])`
  suppresses the transition entirely to avoid a first-paint flash. Panel transition
  is `all 0.35s cubic-bezier(0.22, 1, 0.36, 1)` — **note: 0.35s, not the "~150–200ms"
  the document estimates in §5.** Viewport enter/exit are 0.15s / 0.1s.
- **Mobile menu + hamburger (§4.1, §5)** — confirmed verbatim from the stylesheet:
  panel `visibility: hidden; opacity: 0; transform: translateY(-2px)` →
  `transition: opacity .3s, transform .3s, visibility linear .3s`, open state
  `translateY(0)`. Hamburger lines `transition: opacity .3s, transform .3s`;
  open state line 1 `translateY(4px) rotate(45deg)`, line 2 `opacity: 0`,
  line 3 `translateY(-4px) rotate(-45deg)`.
- **Footer link underline sweep (§4.1)** — confirmed, with a correction: the sweep
  is on a **child** `.footer-link__label`, not the `<a>` itself.
  `:is(:hover, :focus-visible) .footer-link__label { background-position: 0 100%; background-size: 100% 1px; }`
- **Footer structure (§1.3)** — confirmed: Pages / Connect / Open Source / ISO 27001
  columns, with a Privacy Policy link and copyright in the bottom bar.
- **Radix/Base-UI nav primitives (§2)** — confirmed: `data-slot="navigation-menu"`,
  `-list`, `-item`, `-trigger`, `-content`, `-link`, `-popup`, `-viewport`.
- **Astro CID scoping (§2)** — confirmed, e.g. `data-astro-cid-owm7sp2x` on the
  header, `data-astro-cid-r4f3bwe4` on footer links.
- **Hero "trusted by" logo row (§4.2)** — confirmed present: 6 client wordmarks as
  `<img>` with alt text.
- **Footer link tap targets** — footer links carry `min-h-11` (44px). Matches our
  own 44×44px minimum; worth mirroring.

### ⚠️ DRIFT — live disagrees with the document. Live wins.

- **D-1. Which nav items open mega menus.** §1.3 says Services, Stack and Insights
  open mega menus while **Work and About are direct links**. Live is different:
  **Work, Services and Stack are `navigation-menu-trigger`s (mega menus, no `href`);
  About (`/about`) and Insights (`/insights`) are plain links.** The Work mega menu
  contains a featured case study plus project links and an "all work" link.
  **Build Work / Services / Stack as mega menus.**
- **D-2. Header positioning.** §4.1 says "Fixed to viewport top; sticky". Live
  computes `position: absolute` with `inset-x-0 top-0` and `z-index: auto`, at both
  375px and desktop widths. The header carries `data-header-root`, `data-site-header`,
  `data-ready="true"`. The scroll-driven blur suggests something fixed is involved,
  but the header element itself is **not** fixed or sticky. Re-verify the exact
  scroll mechanism when building Step 8.
- **D-3. `mix-blend-mode: exclusion` is on the wrong element in the doc.** §4.1
  attributes `mix-blend-mode: exclusion` to the header. Live: the header computes
  `mix-blend-mode: normal` with a solid dark `--foreground` colour. The **H1** is
  the element that blends, and it uses **`mix-blend-difference`**, not `exclusion`.
- **D-4. Hero background art.** §4.2 describes "an animated diagonal light-beam /
  streak graphic". Live: the hero's first child is a **`<video>`** filling the
  section (`absolute inset-0 size-full`, autoplay, loop, muted, playsinline, `.webm`),
  under two overlay divs. The hero section is `bg-[#131314]` with
  **`rounded-b-[2rem]`** — a bottom corner radius the document does not mention.
- **D-5. Hero has two CTAs.** §4.2 item 1 lists no hero CTAs. Live has a primary
  and a secondary button in the hero.
- **D-6. Logo row is not a CSS marquee.** §5 specifies "horizontal auto-scrolling
  marquee, ~20–40s linear loop". Live: every logo is `absolute flex h-full w-1/5`
  inside a `relative z-10 h-24` track, with `animation: none` on every ancestor at
  both 375px and desktop. This is **JS-driven positioning** (the `HeroLogoCarousel.astro`
  island), not a CSS keyframe marquee. `<!-- TODO: unverified -->` — the exact
  motion (continuous scroll vs. stepped rotation through 5 slots) was not captured;
  determine it before building the component.
- **D-7. `--font-mono` is not defined.** §3.2 lists `--font-mono: "SFMono-Regular", monospace`.
  Live `:root` returns an empty string for it. Only `--default-font-family` is set.
- **D-8. Hero H1 type does not match the documented scale.** §3.2 estimates
  "text-6xl–text-7xl, tight tracking" and says headings use weight 500–700. Live H1:
  `text-[clamp(3rem,12vw,4.5rem)]`, `leading-[1.05]`, **`tracking-[-0.035em]`**,
  **`font-weight: 400`**. The tracking is an arbitrary value, not the documented
  `tracking-tight` (-0.025em) or `tracking-tighter` (-0.05em) token.
- **D-9. Home page section boundaries differ.** §4.2 lists 8 top-level sections.
  Live splits them differently — the logo row is its own band rather than part of
  the hero, and there is a short intro band before the three pain points. Same
  content, different section boundaries. Follow live section order when building Step 10.

### `<!-- TODO: unverified -->` — could not confirm, do not invent

- **U-1.** Exact logo-carousel motion and timing (see D-6).
- **U-2.** Header scroll behaviour — what element actually pins, and the scroll
  offset at which `--progressive-header-blur` reaches maximum. Only the top-of-page
  value (`blur(1px)`) was captured.
- **U-3.** FAQ accordion timing. §5 claims `.5s` down / `.6s` up with
  `cubic-bezier(.77,0,.18,1)`. **Not verified** — no accordion is present on the
  home page. Verify on a service detail page before building Step 9.
- **U-4.** Card hover treatment. §5 explicitly marks this as inferred
  ("implement as translateY(-2px)"), not observed. Still unverified.
- **U-5.** Icon set (§2) — the document itself says this was never confirmed.
- **U-6.** Cookie-consent behaviour (§6) — not confirmed from static analysis.
  Note: PostHog must not load before consent per our own standards.

---

## 🧪 Placeholder seed content register

Every content-collection seed file carries `placeholder: true` in its frontmatter
so it is trivially greppable. **None have been created yet** — this table gets
filled from Step 11 onward.

```bash
# find every placeholder seed file
grep -rl "placeholder: true" src/content/
```

| File         | Collection | Status |
| ------------ | ---------- | ------ |
| _(none yet)_ | —          | —      |

### Provisional copy already in the tree

These are placeholder strings written during scaffolding, not launch copy:

- `src/layouts/BaseLayout.astro` — placeholder title/description props.
- All 24 files under `src/pages/**` — placeholder headings and body text.
- `public/llms.txt`, `public/robots.txt` — placeholder, regenerated in Step 19.
- `src/styles/global.css` — placeholder token subset, replaced in Step 5.

---

## Next action

Steps 1–4 are complete and verified. **Step 5 is blocked on B-1 and B-2**
(accent colour and typeface). Awaiting manager confirmation on those, plus B-3
(service model) before Services/Stack are built.

Unblocked work that can proceed in the meantime: Step 6 (content collection
schemas) and Step 7 (`AppError`), neither of which depends on the brand tokens.
