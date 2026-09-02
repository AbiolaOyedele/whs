# PROGRESS — WildHands Studios marketing site

Running log of completed build steps, flagged decisions, unverified details, and
placeholder seed content. This is the manager's checklist of what still needs a
real answer before launch.

Last updated: 2026-09-02

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

`the removed reference analysis` Part 2 instructs building a verbatim clone —
"reuse copy verbatim", "do not paraphrase", and it lists the prior reference' real client
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
the supplied site archive, containing the compiled CSS, the real
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

### F-20. Brand is now WildHands; project and contact pages rebuilt

"Studio"/"Studios" is gone from the brand. Prose across 23 files, the manifest,
the package name and the README now read **WildHands**. Sanity's own product is
also called Studio, so `src/content/stack/cms/sanity.md` keeps the word.

The full lockup carried a third line reading "studios" in the brand lime. Those
seven glyph paths are dropped from `FULL_PATHS` and `FULL_VIEW_BOX` is
re-measured to the two remaining lines (`85.3 78.5 899.2 508.3`, 1.77:1), so the
footer mark reads "wild / hands" with no dead space under the descender. The
paths are recoverable from `Whs logo full.svg` if the name ever changes back.

**The inner-page hero was rendering 0px tall.** Every block inside the section is
absolutely positioned, and only the `home` variant carried a height class. On all
sixteen inner pages the band collapsed, `overflow-hidden` clipped the H1 out of
sight, and content sat flush under the floating header — the "clumped up" look.
This had been true since the archive rebuild (`ed9c92b`), not a recent
regression. The `page` variant now lays out in normal flow with the reference's
header clearance (`pt-40 lg:pt-48`), empty logo/CTA slot wrappers are
`empty:hidden` so they stop contributing stray margin, and inner-page H1s get
their own scale (`.wh-h1-page`, `text-4xl` / `lg:text-7xl`) — the home clamp's
3rem floor ran a case-study title to eight lines on a phone.

Case-study pages follow the reference's project layout: running number and date
on one row, a Services/Stack meta pair, a full-bleed media panel, then the
narrative in a `max-w-2xl` measure with small muted section labels rather than
large headings, and a **next project** card that wraps back to the first. Two
deliberate departures, both because we keep the dark banner the reference does
not have: the column aligns to the banner's 10.35% gutter instead of centring,
and the date sits at reading size instead of display size — ours are descriptive
("Started June 2026, in active development") rather than bare year ranges.

The contact page follows the reference's split — pitch and trust row left, agent
card stacked above the form right — with the banner kept, as asked. Both grid
columns needed `min-w-0`: grid items default to `min-width: auto`, so the agent
prompt's intrinsic width dragged the single-column layout to 1029px at 375px.

Still no case-study imagery. The media panel uses the same gradient placeholder
as the cards, so the page keeps the reference's rhythm without inventing a
screenshot. Re-verified at 375 / 768 / 1280: no horizontal overflow, no clipped
text, no heading skips, and no invisible H1s.

### F-21. Contact page rebuilt to the supplied spec, plus the agent protocol

Built from the supplied spec. The form is the spec's treatment: no
boxed inputs, a single hairline under each label/input pair that darkens on
`focus-within`, 20px input text, "(optional)" in muted grey and **no asterisks**
on required fields — required is carried by the control's own attribute, which
assistive tech announces. Cards are flat white at `1.5rem` radius with no
shadow; separation comes from the grey page behind them. The submit is the lime
pill at `h-14 md:h-20`, full width below `sm`.

The underline treatment is a `variant` on the shared `Field`, so the two
application forms keep the bordered controls they already had. A colour change
on a parent is a weak focus indicator on its own, so the control also takes a
real focus ring — both fire together.

**The agent protocol.** `/agent/prompt.md` serves instructions for an AI agent
sending an enquiry on someone's behalf; the card copies one line pointing at
that URL rather than a wall of prompt text, so the clipboard payload stays short
and the instructions can be revised without anyone re-copying anything. The
agent drafts a brief, the visitor approves it, pastes the resulting block
anywhere on the contact page, and the form fills itself in.

**Deliberate departure from the spec:** the reference gives agents a public POST
endpoint. Ours does not, and will not — `/api/v1/contact` enforces same-origin,
which the original brief requires ("CORS: same-origin only, no wildcard").
Opening a public write endpoint to save the visitor a paste would trade a stated
security requirement for convenience. The published instructions say so plainly,
so agents do not go looking for an API or a key. The paste flow is the whole
protocol.

`src/lib/agent-inquiry.ts` owns both halves of the contract — the marker and the
parser — so the document we publish and the code that reads it cannot drift.
Parsed values are only ever assigned as field values, never inserted as markup,
lengths are clamped to `contactSchema`'s limits, and the server revalidates
everything on submit: the parser is a convenience, not a trust boundary. Fields
the form has no home for (company, website) are appended to the brief rather
than dropped. Seven unit tests cover it, including that an ordinary paste falls
through untouched.

Not implemented from the spec: Cloudflare Turnstile (outside the confirmed
stack — flag it before adding), and the PostHog attribution/`clientReference`
hidden fields, which need the analytics decision settled first. The honeypot and
server-side rate limiting were already in place.

### F-22. Nav triggers navigate; every native select replaced

**Work, Services and Stack did nothing when clicked.** They were
`<button aria-expanded>` mega-menu triggers — chosen originally because the
reference renders its triggers as `<a>` with no `href`, which is worse — but a
disclosure that is also the section's index needs to go somewhere. They are now
real links carrying `aria-expanded` (valid on `role=link`): clicking navigates,
hovering or focusing still opens the panel. Verified by clicking "Work" in the
live page and landing on `/work`.

**Native selects are gone.** A `<select>` renders its options through the OS, so
the popup ignores every token on this site and arrives as a grey system menu.
Two replacements, because the two contexts need different things:

- `FilterSelect.astro` — the work-page facets. Zero-JS-until-interaction, value
  in `data-value`, `filterchange` event.
- `SelectField.tsx` — the six selects in the freelance form. The value rides a
  hidden input so `new FormData(form)` picks it up exactly as before.

Both own the keyboard behaviour the native control gives away free: arrows,
Home/End, Enter/Space, Escape, Tab, click-outside, and focus returning to the
trigger on close. `SelectField` also has typeahead, which is not optional when
one of the lists is every country — verified live: "n" jumps to Netherlands,
"ni" to Nigeria. Selection is marked by `aria-selected`, a weight change **and**
a lime dot, so it never rests on colour alone.

Two ESLint a11y findings were fixed rather than silenced: `aria-required` moved
off the trigger (unsupported on `role=button`) onto the listbox, which does
support it. The one suppression left is `click-events-have-key-events` on the
options, with a comment: keyboard handling belongs on the listbox in this
pattern, and options are deliberately not individually focusable.

Grammar fixes surfaced along the way: `All ${label.toLowerCase()}` was rendering
"All technologys", "All cms" and "All framework". Those labels are written out
now, in `STACK_CATEGORY_ALL_LABELS` and on each work facet.

### F-23. Copy pass from `wildhands-site-full-optimized.md`

**The "How it works" section was rendering `[object Object]`.** `PROCESS_STEPS`
changed from `string[]` to `{ title, body }[]` during the service-model pivot,
but both renderers still interpolated `{step}`, so every service page and every
industry page printed the literal string three times. Now renders `step.title`
as the heading and `step.body` beneath it, and the grid is three columns rather
than four for three steps. This shipped broken for several commits; the audit
harness never caught it because `[object Object]` is valid, visible text.

**Em dashes are gone from the site.** Verified by counting across the built
output: **0 across all 53 pages.** Each one was rewritten by hand rather than
swapped for a single replacement character, so the punctuation fits the
sentence: colons where a list or definition follows, parentheses for asides,
commas for light joins, and a full stop where the clause was really two
sentences. The only em dashes left in the repo are in source comments that never
reach the browser; the three that did ship inside inlined HTML/JS comments were
cleaned too.

**Page titles** now use `Page | WildHands` rather than an em dash separator.

**About** drops the founder credit, per the instruction that the page stay
brand-only. The name is out of the codebase entirely.

Deliberately unchanged, all per the doc: every TODO stays a TODO (Enterprise SLA
response targets, the Careers and Freelance Hub scorecards, Privacy Policy
specifics), Insights bylines stay marked placeholder rather than invented, and
the `/get-in-touch` agent instruction is untouched.

One judgement call the doc left open: the two email labels on the contact page
("sales@… — new projects") now use a middot rather than a colon, matching the
separator already used for service lists elsewhere on the site.

Re-audited at 375 / 768 / 1280 across 22 route loads: no overflow, no clipped
text, no heading skips, no invisible H1s, and no `[object Object]`.

### F-24. Email sending: what works, and the one thing that does not

**Namecheap cannot do both.** Selecting Custom MX disables its email forwarding
service outright — the Redirect Email panel switches to "Your domain is using
other email service" — even with all five `eforward` MX records present and
correct. Forwarding is tied to the Mail Settings mode, not to the records. This
was tested live and rolled back; the forwarders were hidden rather than deleted
and came back intact. So `whstd.com` cannot be verified in Resend while
Namecheap handles the forwarding, because Resend requires an MX at `send`.

**Current arrangement.** Notifications send from `notifications@theruff.agency`,
which is already verified on the same Resend account, to
CONTACT_NOTIFICATION_EMAIL. `onboarding@resend.dev` was the previous sender but
it only delivers to the Resend account owner, which forced notifications into an
inbox that is not the one actually read.

**This is safe only because nothing the site sends is client-facing.**
`sendNotification` hardcodes `to: [CONTACT_NOTIFICATION_EMAIL]`, so it can only
ever email us; an enquirer's address is used as `replyTo` and nowhere else. All
four forms go through that one function.

**The moment that stops being true** — a confirmation email, an auto-reply,
anything addressed to an enquirer — the From must change first. A client must
not receive mail from another brand's domain. That requires `whstd.com` verified
in Resend, which requires the `send` MX, which requires DNS somewhere that can
host a subdomain MX alongside forwarding. Cloudflare is the route: free, and its
Email Routing replaces the Namecheap forwarding.

Left in place for that day: `whstd.com` is already added to Resend and its DKIM
record verifies. Only the `send` MX is missing.

### F-25. Admin panel built — website editor, analytics, client quotes

Added 2026-09-02. Three sections at `/admin`, behind Supabase Auth plus an email
allowlist. Roughly 4,000 lines across schema, services, routes and UI. All gates
green: `astro check` 0 errors across 162 files, `eslint --max-warnings=0` clean,
**160 tests** (was 68), `astro build` succeeds.

**The public site is still fully static.** This was the load-bearing decision.
The admin writes to Supabase; a Publish button fires a Vercel deploy hook; the
rebuild bakes the edits into static HTML. Visitors never wait on a database, and
the Core Web Vitals and AI-answer-engine work already paid for is untouched. The
alternative — pages reading the database per request — would have made every
page server-rendered and thrown that away.

**Content fallback chain, which is what makes editing safe:**
`database override → registry default (the copy committed here) → ''`. A missing
row, an unreachable Supabase, or an admin that was never configured all render
the site exactly as committed. Clearing a field in the editor **deletes** the row
rather than storing `""`, so it restores the original copy instead of emptying
the page. Verified: the build with no database renders the home hero unchanged.

#### Flagged — packages added outside the confirmed stack

| Package                 | Why                                                          |
| ----------------------- | ------------------------------------------------------------ |
| `@supabase/supabase-js` | In the confirmed stack. Auth + Postgres.                     |
| `@anthropic-ai/sdk`     | **Outside the stack.** Required for AI quote drafting.       |
| `@google/genai`         | **Outside the stack.** Added on your instruction for Gemini. |
| `@vercel/analytics`     | **Outside the stack.** The analytics source you chose.       |

No charting library: the analytics charts are hand-built inline SVG, which is
also the only way to hold the brand's line weights and radii exactly.

#### Decisions worth keeping

- **Two gates on sign-in.** Supabase verifies the password _and_ the address must
  appear in `ADMIN_ALLOWED_EMAILS`. Without the second, anyone who ever gets a
  row in the project's auth table becomes an administrator of this site.
- **Supabase is server-only.** The admin UI calls our own `/api/v1/admin/*`
  routes and the session sits in an httpOnly cookie, so no Supabase key of any
  kind reaches a client bundle and an XSS bug cannot walk off with a session.
- **RLS on every table with no policies.** Deliberate, not an oversight: nothing
  connects except the service role, which bypasses RLS. A leaked anon key grants
  exactly nothing. Adding a permissive `authenticated` policy would quietly undo
  that — do not, without changing the access model first.
- **Money is integer minor units everywhere.** Database, API, UI state. One
  rounding site (`lineAmount`), half away from zero. Discount before tax; a
  discount can never drive a total negative; optional items are priced and shown
  but never in the total.
- **AI drafts are never saved.** A draft lands in the editor as unsaved changes,
  so a person is always between a model's guess at a price and a document a
  client reads. The prompt is instructed to write `0` and say so rather than
  invent a rate the brief does not support.
- **Quote pages and the PIN gate are server-rendered with no island.** A client
  opening a quote on mobile data gets a readable document immediately, and both
  forms work with JavaScript disabled entirely.

#### Client quote security

Six digits is a million combinations, which is only adequate because guessing is
expensive. The controls are a set; removing one breaks the others.

- SHA-256 over (pepper, slug, PIN), compared in constant time. The PIN is shown
  once and can only be replaced, never recovered.
- The slug is inside the digest, so one client's code cannot open another's
  quote, and equal hashes never reveal equal PINs.
- Rate limited **per address and per quote**. The per-quote limit can lock a
  legitimate client out while someone attacks their quote; that is the right
  trade for a document carrying commercial terms.
- Nothing priced is read from the database until the PIN verifies. `/admin` and
  `/quote/` send `noindex`, are excluded from `sitemap.xml`, and are disallowed
  in `robots.txt`.
- Renaming a quote re-hashes the PIN, because the slug is in the digest.
  Otherwise renaming would silently void a code the client already holds.

**Found and fixed while building:** `@astrojs/sitemap` reads the route manifest,
not just static output, so every `/admin` route was being listed in
`sitemap-0.xml` — advertising the admin surface to every crawler. `noindex` stops
indexing; it does not stop a sitemap naming the pages out loud. Filtered in
`astro.config.mjs`, and `/admin` and `/quote/` added to `robots.txt`.

#### ⚠️ Open items on this work

1. **Vercel's analytics READ API is not a documented, versioned endpoint.** It is
   the one their own dashboard calls, and it is gated on the plan that includes
   Web Analytics. Every failure is handled as a first-class outcome — the page
   explains what is wrong and links to the Vercel dashboard — but if it ever
   stops working, collection is unaffected and their dashboard is authoritative.
2. **The website editor covers the home page and site-wide strings so far.** The
   mechanism is complete and proven end to end; extending it to another page is
   two mechanical steps (add entries to `src/config/content-registry.ts`, read
   them with `text()` in the template). The other pages are not yet wired, so
   they are not yet editable.
3. **Quote images are stored as public Cloudinary assets**, with a 16-hex-character
   random `public_id` so URLs cannot be guessed or walked between clients. That is
   weaker than the `authenticated` treatment CVs get, because the client's browser
   has to load them. Do not put anything genuinely confidential in a quote image
   and assume the PIN protects it — the PIN protects the page, not the asset.
4. **Rate limiting is still per-instance memory** (§ F-9). The admin sign-in and
   quote PIN endpoints inherit that limitation. It matters more here than on the
   public forms: move to Vercel Firewall or a durable store before this sees real
   traffic.
5. **Gemini's model id defaults to `gemini-2.5-pro`** and is overridable with
   `GEMINI_MODEL`, because model names move faster than this repository. Set the
   variable rather than editing code when it moves on.
6. **Nothing has been run against a real Supabase project yet.** The build, types,
   lint and 160 tests all pass, and the unconfigured paths were verified in a
   browser at 375 / 768 / 1280 with no overflow. The signed-in admin screens have
   not been exercised against live data because that needs your project.

---

### F-26. Admin panel: payments, invoices, live preview, first-party analytics

Added 2026-09-02, same day as F-25. Five migrations now (`0001`–`0005`).

**Analytics moved off Vercel's read API onto first-party data.** F-25 flagged
that endpoint as undocumented and plan-gated; it returned nothing usable, which
is exactly the risk that was written down. Views are now recorded by our own
beacon into `page_views` and aggregated in Postgres. Vercel's tracker still runs
and their dashboard still works — the admin panel simply no longer depends on
an endpoint nobody promised us. Cookie-free: `visitor_hash` is a digest of
(date, address, user agent, secret), so a person is countable once per day and
cannot be linked across days.

**Paystack** (flagged deviation: the stack names Stripe). Deposit or full
payment from the quote page, amounts recomputed server-side, webhooks
HMAC-SHA512 verified against the raw body, settlement guarded on
`status = 'pending'` so retries cannot double-record. ⚠️ Paystack cannot charge
GBP — the pay button is hidden on a quote it could not settle, deliberately.

**PDF invoices.** `pdf-lib` plus `wawoff2` to decompress the site's woff2 files
to TTF at request time, so the invoice uses Diagramm and IBM Plex rather than
Helvetica. Invoice numbers come from a Postgres sequence, not `count(*) + 1`,
and amounts are snapshotted at issue so editing a quote cannot rewrite a
document already sent.

**Quote document redesigned.** Two columns with the commercial summary pinned
in a rail, terms and payment collapsed into `<details>`, phases two-up, and a
bento gallery for images. Verified at 375 / 768 / 1280: no overflow at any
width, rail stacks below `lg`.

#### Bugs found and fixed this round

| Bug                                                    | Why it mattered                                                                                                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request.formData()` read twice on one POST            | Unlocking with a correct PIN threw "Body has already been read".                                                                                                             |
| The unlock POST fell through into the decision handler | Could have recorded an accept/decline the client never made.                                                                                                                 |
| Renaming a quote silently broke the client's PIN       | The code _claimed_ to re-hash (the slug is in the digest) and never did.                                                                                                     |
| Quote access cookie scoped to `/quote`                 | The invoice and payment endpoints live under `/api/v1/quote/…`, which is not beneath it, so both answered `QUOTE_ACCESS_EXPIRED` to a client who had just unlocked the page. |
| Live preview never updated                             | The bridge script sat inside `{cond && <script>}`; Astro hoists script tags at build time and never collects one inside a JSX expression, so it shipped on no page at all.   |
| Every `/admin` route listed in `sitemap.xml`           | `@astrojs/sitemap` reads the route manifest, not just static output. `noindex` stops indexing; it does not stop a sitemap naming the admin surface out loud.                 |
| Env vars prefixed `VERCEL_`                            | Reserved by Vercel, and the CLI reads `VERCEL_PROJECT_ID` to choose a project. Renamed `WH_VERCEL_*`.                                                                        |
| PDF pay link was dead                                  | pdf-lib turns a bare string into a `PDFName`, and the annotation was never registered. The file opened fine and linked nowhere.                                              |
| Paystack rejects `.example` emails                     | The seeded demo quotes could never have been paid.                                                                                                                           |

#### Cleanup

Removed `/api/v1/quote/[slug]/access.ts` and `/decision.ts`: the page handles
both inline now, so those were a second, unauthenticated implementation of PIN
checking to keep in sync. Also removed `getInvoiceByNumber` and
`clearQuoteAccess`, neither of which had a caller.

Every native control is gone from the admin, on a standing instruction: custom
listbox (React and Astro versions, full keyboard contract) and a designed
confirm dialog with a focus trap, in place of `<select>` and `window.confirm`.

#### ⚠️ Still open

1. **Migration `0005` must be run** or the analytics panel says so and explains
   how. `0001`–`0004` are already applied.
2. **Paystack is in test mode** and cannot charge GBP. Price a quote in NGN or
   USD to exercise the flow.
3. **The signed-in admin screens have not been eyeballed at 375px.** The static
   audit is clean (no fixed widths, every multi-column grid breakpoint-prefixed,
   tables carry a mobile fallback) and the reachable pages pass, but signing in
   needs a password nobody should be handing to a tool.
4. **The website editor still only covers the home page and site-wide strings.**
   Unchanged from F-25: the mechanism works end to end, extending it to another
   page is two mechanical steps.

---

## 🔍 Live verification log — the reference site (removed)

Fetched and inspected live on **2026-08-26** (computed styles + DOM + stylesheet
rules read directly in-browser), checked against `the removed reference analysis`
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

1. **Domain — `whstd.com`. Three things only you can do.**
   - **Set `PUBLIC_SITE_URL=https://whstd.com`** in Vercel (Production). This one
     variable drives canonical tags, `sitemap.xml`, `robots.txt` and Open Graph.
     Without it the build falls back to the `*.vercel.app` host and every one of
     those points at the wrong origin. Verified locally: with it set, canonicals
     and the sitemap render `https://whstd.com/...`.
   - **`https`, not `http`.** The domain was given as `http://whstd.com/`. Vercel
     redirects http to https, so an http canonical sends every crawler through a
     redirect. Everything here uses https.
   - **Add the domain to the Vercel project and point DNS at it**, then turn off
     Deployment Protection — the site currently returns Vercel's login page.
2. ~~Mailboxes on whstd.com do not exist yet.~~ **Resolved.** Inbound is handled
   by registrar-level forwarding (MX → `eforward*.registrar-servers.com`).
   Verified 2026-08-28 by sending to each through Resend: `hello@`, `sales@` and
   `hr@` all returned `delivered`.
3. **B-2 — ⚠️ BUY A FONT LICENCE, or revert to Inter Tight.** PP Neue Montreal
   and SFMono are both shipping from the archive and neither is licensed for
   web distribution. This is the highest-risk item on the list.
4. **B-3 — confirm the service model.** The whole page inventory assumes web
   design/dev/migration.
5. **Copy: home, services and all four case studies are now real.** Still
   placeholder: stack, insights, industries, enterprise, careers, freelance hub.
   `grep -rl "placeholder: true" src/content/`
6. **"Studio" or "Studios"?** All prose now reads _WildHands Studio_, matching
   `SITE.name` and the copy doc you supplied. The logo artwork still spells
   _studios_. One of the two has to move — the copy is a one-line change, the
   wordmark is not. Tell me which.
7. **Those reference-inherited sections are still there.** Stack (14 pages),
   Insights (11), Careers (9), Industries (3), Enterprise (1), Freelance Hub (1)
   — 39 of 55 pages, all still carrying migration-era copy and the word
   "estate". This is the question from earlier that never got an answer.
8. **Privacy policy is an unreviewed draft** with TODOs in the legal substance.
9. **F-10 — decide where application videos go**, or drop the step.
10. **Resend sending domain** is still `onboarding@resend.dev`. Verify
    whstd.com in Resend (SPF + DKIM), then switch the `from:` in
    `src/lib/resend.ts` to `hello@whstd.com` — one line, but not before the DNS
    records land, or every form on the site stops sending.
11. **F-8 — decide on a headless CMS** before real content lands.
