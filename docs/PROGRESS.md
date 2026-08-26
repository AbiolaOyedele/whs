# PROGRESS — WildHands Studios marketing site

Running log of completed build steps, flagged decisions, unverified details, and
placeholder seed content. This is the manager's checklist of what still needs a
real answer before launch.

Last updated: 2026-08-26

---

## Build step status

| Step | Description                                                                            | Status  |
| ---- | -------------------------------------------------------------------------------------- | ------- |
| 1    | Project scaffold, `.gitignore`, `package.json`, `astro.config.mjs`, `docs/PROGRESS.md` | ✅ Done |
| 2    | `src/config/env.ts` with Zod validation                                                | ✅ Done |
| 3    | TypeScript strict config, ESLint, Prettier                                             | ✅ Done |
| 4    | Full folder structure                                                                  | ✅ Done |
| 5    | `src/styles/global.css` — Tailwind v4 `@theme` tokens                                  | ✅ Done |
| 6    | `src/content.config.ts` — Zod schemas for 5 collections                                | ✅ Done |
| 7    | `src/lib/errors.ts` — AppError + API error shape                                       | ✅ Done |
| 8    | Layout components — SiteHeader, MegaMenu, MobileMenu, Footer                           | ✅ Done |
| 9    | UI primitives + section components                                                     | ✅ Done |
| 10   | Home page                                                                              | ✅ Done |
| 11   | Services index + detail template + 4 seeds                                             | ✅ Done |
| 12   | Work index (3 filter facets) + case study template + 6 seeds                           | ✅ Done |
| 13   | Stack hub + category + leaf template + 9 seeds                                         | ✅ Done |
| 14   | Insights hub + category + article template + 5 seeds                                   | ✅ Done |
| 15   | Industries template + 3 seeds                                                          | ✅ Done |
| 16   | About, Enterprise, Careers, Freelance Hub, Contact, Privacy                            | ✅ Done |
| 17   | Forms — contact, freelance (CV upload), job wizard, newsletter                         | ✅ Done |
| 18   | llms-txt-generator tool                                                                | ✅ Done |
| 19   | SEO layer — meta, JSON-LD, sitemap, robots.txt, llms.txt                               | ✅ Done |
| 20   | Accessibility pass, responsive QA, final verification                                  | ✅ Done |

**Not built, deliberately:** `/salary-calculator` and `/tools/ai-ascii-art-generator`
are held pending brand-fit confirmation, per the brief. The sitemap filter that
excludes the ASCII generator is already wired and inert until the page exists.

### Verification

Everything below passes clean on the current tree:

| Gate                                 | Result                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `astro check`                        | 89 files, 0 errors, 0 warnings, 0 hints                                                    |
| `eslint . --max-warnings=0`          | 0 problems                                                                                 |
| `prettier --check .`                 | all files match                                                                            |
| `vitest run`                         | 68 tests, 3 files, all passing                                                             |
| `astro build`                        | 56 pages generated                                                                         |
| Responsive sweep, 375 / 768 / 1280px | no horizontal overflow on any page                                                         |
| Static SEO audit of built HTML       | 56/56 pages have title, description, canonical, OG, Twitter, exactly one h1, valid JSON-LD |

The three custom lint guardrails were probe-tested and confirmed firing:
`process.env` outside `src/config/env.ts`, `import.meta.env` outside it, and `any`.

Endpoint behaviour verified against the running server:

| Case                              | Result                                                                   |
| --------------------------------- | ------------------------------------------------------------------------ |
| Valid contact post                | Passes validation, reaches Resend, fails only on the placeholder API key |
| Honeypot filled                   | 400 `FORM_SUBMIT_REJECTED`, message does not name the trap field         |
| Invalid input                     | 422 `FORM_CONTACT_INVALID_INPUT`, plain-English message                  |
| Cross-origin post                 | 403 `REQUEST_ORIGIN_REJECTED`                                            |
| 6th post in a minute              | 429 `FORM_SUBMIT_RATE_LIMITED`                                           |
| SSRF: loopback, `169.254.169.254` | 422 `TOOL_LLMS_URL_BLOCKED`                                              |

---

## ⛔ BLOCKED — needs manager confirmation before proceeding

### B-1. Accent colour (blocks Step 5)

Bejamas' `--accent` is `oklch(91.98% .1905 128.5)` / `#befc65`, a lime-chartreuse.
Confirmed live. **This is their brand mark and will not be reused.**
`src/styles/global.css` currently ships neutral placeholder tokens with no accent
defined at all. **Need: WildHands Studios' actual brand accent colour.**

### B-2. ⚠️ PP Neue Montreal is now shipping — YOU MUST BUY A LICENCE

`public/fonts/PPNeueMontreal-Variable-opt.woff2` was taken from the site archive
you supplied and is now wired up in `src/styles/global.css` via `@font-face`. It
is rendering on every page.

**PP Neue Montreal is a commercial typeface from Pangram Pangram.** Having the
file does not grant the right to serve it. Publishing this site as-is means
distributing a commercial font without a licence, which is the most likely thing
on this project to generate a real complaint.

**Pick one before launch:**

1. **Buy a web licence** at pangrampangram.com — priced by monthly pageviews.
   Nothing in the code changes.
2. **Drop back to Inter Tight.** Delete the `@font-face` block and the woff2, and
   remove `'NeueMontreal',` from `--font-sans`. Inter Tight is already loaded from
   Google Fonts and is the substitute the reference analysis itself names. Two
   lines, no layout change — the metrics are close enough that nothing reflows.

`SFMono-Regular.woff2` came from the same archive and is wired to `--font-mono`.
It is Apple's font and is **not** licensed for web distribution either; the same
choice applies, and the safe fallback is the `ui-monospace` system stack.

### B-3. ✅ RESOLVED — and it changed the service model

`docs/site-copy.md` (supplied 2026-08-26) confirms the assumption flagged at the
start of this build was **wrong**. WildHands Studio does not sell web migration.
It builds **custom websites, apps, and internal tools** for teams doing
repetitive work by hand.

The Audit → Design → Migrate → Run model that the whole site was structured
around has been replaced:

| Was                                       | Now                                             |
| ----------------------------------------- | ----------------------------------------------- |
| Audit / Design / Migrate / Run            | Websites / Apps / Tools & Systems               |
| 4 service entries about migration         | 3 entries matching the real pillars             |
| "Process: Audit → Design → Migrate → Run" | Discovery call → Scoped proposal → Custom quote |

Updated: `SERVICE_PILLARS` and labels, `PROCESS_STEPS`, all service seeds, the
home page, the services index and detail template, the nav mega menus, and the
service tags on the work seeds so the `/work` filters still resolve.

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

### F-9. Rate limiting is per-instance memory, not shared

`src/lib/rate-limit.ts` is an in-memory fixed-window limiter. It does **not**
coordinate across Vercel function instances, so the effective limit is
`limit × instances`. For four unauthenticated form endpoints on a low-traffic
marketing site this raises the cost of casual abuse without adding a Redis
dependency the confirmed stack does not include. If abuse becomes real, move to
Vercel Firewall rate limiting or a durable store — do not scale that file up.

### F-10. The video application step has no upload endpoint

`/careers/apply/video` records in-browser and offers a file fallback, but there
is **nowhere to send the result** — video storage was not in the confirmed stack
and adding one is a decision, not an implementation detail. The step is optional
and skippable, and the written application is delivered independently, so no
applicant is blocked. **Decide before launch:** Vercel Blob, S3, or drop the step.

### F-11. Vitest added — outside the confirmed stack

The brief lists `tests/unit|integration|e2e` but names no test runner. Vitest is
installed as a dev dependency because it shares Vite's config with Astro and
needed no extra setup. 68 tests cover the security-critical logic: the SSRF
address guard, origin enforcement, the honeypot, upload validation, the rate
limiter, and error-response leakage. **Flagging as an added dependency.**

### F-12. React costs ~56KB gzip on the four form pages

Content pages — the SEO-critical majority — ship **zero** framework JavaScript.
The four pages with React islands (contact, freelance hub, job apply, llms.txt
tool) load React DOM at ~56KB gzip.

One optimisation already taken: the form constants were split into
`src/lib/schemas/form-constants.ts` so the islands no longer pull Zod into the
browser. That cut `form-primitives` from 18KB to 1.3KB gzip.

**Optional further step:** rewriting the four forms as vanilla Astro scripts
would remove React entirely and save the remaining ~56KB on those pages. The
brief explicitly sanctions React islands for forms, so this is left as your call
rather than done unilaterally.

### F-17. Typefaces settled: Diagramm + IBM Plex Sans

Diagramm (display) and IBM Plex Sans (body). NatomPro was removed entirely once
Diagramm replaced it — the browser confirmed it was never being fetched, so it
was 64KB of dead weight in the deploy. Fonts now total 94KB, down from 157KB.

Diagramm now ships three real weights — Regular 400, Medium 500, SemiBold 600 —
subset from the full family. Every display heading uses **Medium (500)**, set
once via `--font-weight-display` in `global.css`. Changing that single value
moves the entire display scale, including headings inside rendered Markdown.

Medium rather than SemiBold because Diagramm has wide letterforms: at 64–72px
SemiBold begins closing up the counters, and the reference design this was
matched to used 400–500 for display. Switching is one value if you disagree.

⚠️ **Diagramm states no licence in its metadata** (designer: Akbar Rohmanto).
Confirm commercial use is permitted before launch.

### F-18. Work grid spacing fixed

Three different spacings were fighting: a 4px column gap, a 40px row gap, and an
80px `margin-bottom` still on the card from the reference, where cards had no
caption beneath them. Cards now carry no outer margin — all spacing lives on
`.wh-projects-grid`, so there is one source of truth. Measured result: a uniform
24px column gap and 80px row gap, with no variation between rows.

### F-15. Real copy landed for home and services

`docs/site-copy.md` supplied 2026-08-26. Applied in full for the home page and
the services section. Three things in that document were deliberately **not**
invented and are marked in place:

- **Proof grid** — the doc says it needs real project content. The grid renders
  the placeholder work seeds with a visible note; swap them when content lands.
- **Testimonial** — two client quotes exist but the text and attribution were
  not supplied. There is a comment where the section goes, and no invented quote.
- **Stat strip** — explicitly dropped for launch, so it is removed rather than
  filled with a placeholder number.
- **Footer links** — still the provisional set; the doc lists this as open.

The doc offered three headline options and recommended A. Used A verbatim:
"Custom systems that give you your time back." B and C are in `docs/site-copy.md`
if you want to swap.

Not yet written by the copy doc, so still placeholder: About, Stack, Insights,
Get in Touch.

### F-16. WebGL gradient — what was changed and why

The supplied `animated-gradient` component drove `requestAnimationFrame`
unconditionally: it rendered while scrolled out of view, while the tab was in
the background, and for visitors who have asked for reduced motion. On a footer
that is six screens down, that is a shader running continuously for no one.

Changes, all in `src/components/ui/animated-gradient.tsx`:

| Change                                             | Why                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------ |
| IntersectionObserver gates the loop                | Footer gradient does not animate until it is on screen                   |
| `visibilitychange` gates the loop                  | Nothing renders in a background tab                                      |
| `prefers-reduced-motion` draws one static frame    | Gradient still shows, it just does not move                              |
| Colours parsed once, static uniforms uploaded once | Was re-parsing three hex strings 60×/second                              |
| Device pixel ratio capped at 2                     | A 3× phone was rendering 2.25× the fragments for no visible gain         |
| Shader compile + link status checked               | On failure the canvas unmounts and the CSS gradient behind shows through |
| Config compared by value                           | A parent re-render was tearing down and rebuilding the GL context        |
| `WEBGL_lose_context` on unmount                    | Browsers cap live contexts; islands mount per page                       |

Cost: **3.1KB gzip**. The blue in the preset was swapped for the brand lime.

Hydration note: `client:visible` does not work for this component. Astro observes
the `<astro-island>` wrapper, which is `display:inline` and so has no layout box,
so the observer never fires and the island never hydrates. It uses `client:idle`,
with a CSS rule giving the wrapper a real box.

### F-14. Layout rebuilt from the saved site archive

A site archive was supplied at
`~/Downloads/bejamas.com-1787734766415/`, containing the compiled CSS, the real
markup for 50 pages, and the font files. The homepage layout was rebuilt against
it rather than against measurements taken through the DOM. What changed:

|               | Before                  | After (from the archive)                                                                                                     |
| ------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Container     | flat `max-width: 80rem` | breakpoint-stepped: 40/48/64/80/96/**104rem**, `px-5` → `lg:px-8`                                                            |
| Hero height   | `min-h-svh` (900px)     | `54rem` → `52rem` → `56rem` → `clamp(65rem, 99.1667vw, 89.25rem)`                                                            |
| Hero content  | flex column             | absolutely positioned: headline at `left:10.35% top:28.7% w:38.82%`, logos at `bottom:5.55% left:50%`                        |
| "Why" section | two even columns        | `grid-cols-[42.7%_57.3%]`, sticky left column, `min-h-[24rem]` bordered article rows, `lg:pt-[16.5rem]`                      |
| Services      | 4-up card grid          | heading pinned left, rows in a centred `max-w-2xl` measure, hover dims siblings to 0.4                                       |
| Project grid  | uniform 3-up            | asymmetric 12-col — cards 1/4/5 span 7, cards 2/3/6 span 5                                                                   |
| Project card  | bordered box            | `rounded-3xl` media, tech stack above in parens, client name overlaid with `mix-blend-exclusion`, stats over the bottom edge |
| Header blur   | one masked layer        | five stacked layers in a fixed `h-40` band                                                                                   |
| Typeface      | Inter Tight             | PP Neue Montreal variable (**see B-2**)                                                                                      |

The flat 80rem container was the single biggest cause of the layout reading as
cramped — the reference is half again as wide on a large monitor.

Two defects found and fixed while rebuilding, both caught by measuring rather
than by eye: project cards in the same grid row ended at different heights
(wide cards honoured a 4:3 ratio while narrow ones came up 153px short), and a
two-line card summary pushed its neighbour's media 24px shorter.

### F-13. Visual fidelity was raised to match the reference exactly

After an instruction to match the reference site exactly, a measurement-driven
pass aligned the following to values read from the live site: accent colour,
H1/H2 size, weight, line-height and tracking, hero background and corner radius,
nav pill dimensions and type, nav link type, container width and gutters,
section vertical rhythm, and the 12-column project grid. Each was verified by
comparing computed styles side by side rather than by eye.

**Not copied, and this is deliberate:** all body copy, headlines, testimonials
and client names are original placeholder content with fictional companies.
Reproducing the reference's copy would be copyright infringement, and using its
real client names would be a false statement about who WildHands has worked
with. See § F-2.

---

### F-19. Real case studies landed; mobile pass against the reference

Six fictional case studies were deleted and replaced with four real projects,
written from the briefs supplied on 2026-08-26: **Dumpty**, **Auto Flow**,
**Lazy Meet** and **The Ruff Agency**. Every figure, stack entry and timeline in
them traces back to a brief. Nothing was invented to fill a field — in
particular, **no testimonials were written**, because no quotes were supplied,
so `testimonial` is absent on all four rather than filled with plausible copy.

Knock-on changes:

- `work.liveUrl` added to the schema. Only The Ruff Agency has one; the other
  three are genuinely not public, and the field renders nothing when absent.
- The `industry` facet is now labelled **Type** on `/work` and on the case-study
  meta list, and `client` is labelled **Project**. These are our own products,
  not client engagements, and the old labels asserted otherwise.
- The three logo strips (home hero, get-in-touch, enterprise) listed fictional
  client names. They now list the four products, matching what `docs/site-copy.md`
  actually asked for: _"Logo strip of products/apps you've built (not client
  logos)"_. The get-in-touch strip was also mislabelled "Recent clients".
- The AI-agent prompt block on `/get-in-touch` still described a migration
  engagement. Rewritten for the build model.
- Brand name normalised to **WildHands Studio** site-wide. Seventeen files said
  "WildHands Studios" while `SITE.name`, the hero and every page title said
  "Studio". See the flag below — the wordmark still spells "studios".

Mobile pass, re-derived from the saved archive rather than from memory:

| Fix               | Was                                                                  | Now                                                                 |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Hero standfirst   | `text-lg text-white/75 md:text-xl`                                   | `text-xl sm:text-2xl`, full white — matches reference               |
| Problem section   | body copy above the `gap-32`, leaving a lone link after a 128px hole | body + link below the gap, heading above it — reference structure   |
| Problem items     | `text-2xl md:text-3xl` heading, 16px muted body                      | `text-4xl md:text-5xl lg:text-[3.5rem]`, `text-xl md:text-2xl` body |
| Services rows     | title + tagline on one 24px line, wrapping badly                     | numbered circle, title, tagline stacked — reference pattern         |
| Card caption      | 16px muted, flush to card edge                                       | 18px/24px at the card's inner gutter                                |
| Card stats        | `gap-y-1`, so two stats read as one clump when wrapped               | `gap-y-4`                                                           |
| Card tech list    | `-top-8`, ran under the media when it wrapped to two lines           | anchored `bottom-full`, capped at three entries                     |
| Projects grid     | 4rem row gap                                                         | 7.5rem, matching the reference's 2.5rem gap + 5rem card margin      |
| About watermark   | overlapped the founder quote's first three lines                     | scaled down and cleared below md                                    |
| Services CTA band | `flex-1` crushed the text to ~110px beside the button                | stacks below sm                                                     |

Verified at 375 / 768 / 1280px across 19 routes: **no horizontal overflow, no
clipped text, no sub-12px type, no heading-level skips.** The three remaining
audit flags are known false positives, documented under Final QA.

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

## Final QA results

Swept 22 representative pages at 375px, 768px and 1280px — 66 checks:

- **Horizontal overflow: none**, on any page at any breakpoint.
- **Heading hierarchy:** exactly one `h1` per page, no skipped levels.
- **Form controls:** every one has an associated label.
- **Tap targets:** all interactive targets clear 44×44px. Two audit flags were
  investigated and confirmed as correct-by-design, not defects:
  - the `company_fax` honeypot, which sits inside an `aria-hidden`, clipped
    wrapper and must never be a real target;
  - checkbox inputs at 20×20px, each wrapped in a `<label>` measuring 44–56px
    tall — the label is the hit target for a wrapped checkbox.
- **Inline links inside prose** are exempt from the 44px rule under
  WCAG 2.5.8, which excludes targets constrained by surrounding line-height.

## What needs your attention

1. **B-2 — ⚠️ BUY A FONT LICENCE, or revert to Inter Tight.** PP Neue Montreal
   and SFMono are both shipping from the archive and neither is licensed for
   web distribution. This is the highest-risk item on the list.
2. **B-1 — get a legal opinion on trade dress** if WildHands competes with the
   reference company in the same market.
3. **B-3 — confirm the service model.** The whole page inventory assumes web
   design/dev/migration.
4. **Copy: home, services and all four case studies are now real.** Still
   placeholder: stack, insights, industries, enterprise, careers, freelance hub.
   `grep -rl "placeholder: true" src/content/`
5. **"Studio" or "Studios"?** All prose now reads _WildHands Studio_, matching
   `SITE.name` and the copy doc you supplied. The logo artwork still spells
   _studios_. One of the two has to move — the copy is a one-line change, the
   wordmark is not. Tell me which.
6. **Those reference-inherited sections are still there.** Stack (14 pages),
   Insights (11), Careers (9), Industries (3), Enterprise (1), Freelance Hub (1)
   — 39 of 55 pages, all still carrying migration-era copy and the word
   "estate". This is the question from earlier that never got an answer.
7. **Privacy policy is an unreviewed draft** with TODOs in the legal substance.
8. **F-10 — decide where application videos go**, or drop the step.
9. **Resend sending domain** is still `onboarding@resend.dev`.
10. **F-8 — decide on a headless CMS** before real content lands.
