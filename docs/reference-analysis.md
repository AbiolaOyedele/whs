# Bejamas.com — Full Site Analysis & Rebuild Specification

Source analyzed: https://bejamas.com/ (live crawl, August 2026). This document has two parts: Part 1 is the raw analysis (structure, tech stack, design system, components, animation, functionality, content). Part 2 is a single self-contained BUILD PROMPT you can hand to Claude Code to reconstruct the site.

Scope note on the crawl: the site has ~185 URLs, the bulk of which are programmatic SEO pages that share three templates (insights article, stack technology page, work case study). Every unique page *type* was fetched and documented in full. For the three high-volume templates, one to three representative instances were fetched in full and the rest were catalogued by URL/title only, since they reuse the same component structure. The full URL list is in section 1.1.

---

## PART 1 — ANALYSIS

### 1. Structure & Pages

#### 1.1 Full URL inventory (from sitemap.xml, ~185 URLs)

**Root / marketing**
- `/` — Home
- `/about` — About
- `/enterprise` — Enterprise/trust page
- `/freelance-hub` — Freelancer recruiting hub
- `/get-in-touch` — Contact
- `/salary-calculator` — Interactive tool
- `/legal/privacy-policy` — Privacy policy

**Careers**
- `/careers`
- `/careers/engineering-manager` (job detail)
- `/careers/engineering-manager/apply`
- `/careers/engineering-manager/apply/thank-you`
- `/careers/apply/video` (video-response application step)
- `/careers/apply/video/thank-you`

**Services** (`/services` index + 9 detail pages)
- `/services/audit`-type overview lives at `/services` itself (4 pillars: Audit, Design, Migrate, Run)
- `/services/website-migration`
- `/services/headless-cms-agency`
- `/services/custom-web-development`
- `/services/composable-commerce`
- `/services/sitecore-migration`
- `/services/nextjs-development`
- `/services/astro-development`
- `/services/sanity-development`
- `/services/storyblok-agency`
- `/services/contentful-development`

**Work / case studies** (`/work` index + 34 detail pages)
`/work/alpro`, `/work/alpro-foundation`, `/work/alpro-health-professionals`, `/work/backlinko`, `/work/bennetts`, `/work/camino-financial`, `/work/carbon-removal-alliance`, `/work/charm-industrial`, `/work/clarity-in-complexity-for-starknet`, `/work/commerce-engine`, `/work/deliverect`, `/work/delphix`, `/work/descope`, `/work/descope-mcp-hackathon`, `/work/hanseyachts`, `/work/httptoolkit`, `/work/illuminating-decentralization-for-starkware`, `/work/maryland`, `/work/neobrutalism-illustrations-for-dodonut`, `/work/newfront`, `/work/nnoxx`, `/work/o1js`, `/work/o1labs`, `/work/rearc`, `/work/rebolt`, `/work/rippling`, `/work/rmpbs`, `/work/rudderstack`, `/work/skyflow`, `/work/transcend`, `/work/vanraam`, `/work/veezu`, `/work/vfx-financial`, `/work/waysconf`

**Industries** (`/industries/[slug]`, 7 pages — not in primary nav, cross-linked from services/work)
`consumer-brands`, `energy-climate`, `financial-services`, `hr-tech`, `manufacturing`, `saas-data-platforms`, `web3`

**Stack** (`/stack` index + 4 category indexes + ~45 technology detail pages — programmatic SEO hub)
- `/stack/cms` + 19 pages: `aem`, `astro-cms`, `best-cms-for-next-js`, `contentful`, `contentful-vs-storyblok`, `drupal`, `how-to-choose-a-headless-cms-for-enterprise`, `magnolia`, `multisite-cms`, `optimizely`, `payload`, `react-cms`, `sanity`, `sanity-vs-contentful`, `sitecore`, `storyblok`, `typo3`, `umbraco`, `wordpress`
- `/stack/framework` + 4 pages: `astro`, `astro-vs-next-js`, `nextjs`, `turborepo-vs-nx`
- `/stack/hosting` + 9 pages: `aws-amplify-vs-vercel`, `bring-your-own-cloud-cdn`, `cloudflare`, `cloudflare-vs-vercel`, `heroku-alternatives`, `netlify`, `render`, `self-hosting-vs-vercel-and-netlify`, `vercel`, `vercel-vs-netlify`
- `/stack/integrations` + 1 page: `supabase`

**Insights / blog** (`/insights` index + 5 category indexes + ~70 articles — programmatic content hub)
Categories: `design-systems`, `field-notes`, `migration`, `operations`, `platform-choice` (labeled in-UI as "Design Systems," "Field Notes," "Migration & Replatforming," "Running the Website," "Platform Decisions"). Articles are dated and authored (Thom Krupa – CTO, Denis Kostrzewa – CEO, and others), ranging from Nov 2019 to Aug 2026, so this is a mature, actively-published blog, not a static page.

**Tools** (standalone micro-apps, excluded from search sitemap)
- `/tools/llms-txt-generator`
- `/tools/ai-ascii-art-generator`

#### 1.2 URL structure and routing pattern

Flat, semantic, no locale prefixes, no trailing slashes, no query-string based routing observed. Pattern is a classic Astro **content-collections** structure:

```
/                                   → static page
/about, /enterprise, /get-in-touch  → static pages
/services                           → collection index
/services/[slug]                    → collection entry
/work                               → collection index
/work/[slug]                        → collection entry (flat, no sub-category in URL even though cards are filterable by service/tech/industry)
/industries/[slug]                  → collection entry, no index page (orphan-by-design, SEO landing pages)
/stack                              → hub index
/stack/[category]                   → category index (cms | framework | hosting | integrations)
/stack/[category]/[slug]            → leaf technology/comparison page
/insights                           → blog index
/insights/[category]                → category index
/insights/[category]/[slug]         → article
/tools/[tool-slug]                  → standalone interactive tool, noindex-adjacent ("not included in our search sitemap")
/careers/[role-slug]                → job detail
/careers/[role-slug]/apply          → application form
/careers/[role-slug]/apply/thank-you→ confirmation
/legal/[doc-slug]                   → legal doc
```

This is a 3-tier depth maximum (`/stack/cms/sanity-vs-contentful`), which keeps crawl depth shallow — consistent with an SEO-driven content strategy (confirmed by the site's own `/insights/operations/introducing-our-llms-txt-generator` and its in-house `llms.txt` generator tool).

#### 1.3 Page hierarchy and navigation logic

Primary header nav (5 items + 1 CTA), confirmed from live screenshot:
`Work · Services · Stack · About · Insights` — then a pill-shaped **"Talk to us"** button.

The CSS bundle contains a dedicated `.site-header__mega-menu` component with `backdrop-filter: blur(24px)`, a semi-opaque `background-color: color-mix(in oklab, var(--primary) 48%, transparent)`, and `border-radius: 1.25rem`, confirming **Services**, **Stack**, and **Insights** (the three items with sub-taxonomies) open as mega-menus/dropdowns on hover/click rather than plain links, while **Work** and **About** are direct links. A secondary "Get in touch"/"Contact" link also exists in the nav model, likely inside the mega menu or as a persistent secondary link. Logo (top-left) links home. The logo mark is a wordmark "bejamas" with a small circular/aperture glyph standing in for a letter — this lens/aperture motif repeats in the footer ("Overlapping camera lens artwork").

Footer navigation is a flat 4-column layout: **Pages** (Trust & Security, Services, Work, About us, Careers, Freelance Hub, ASCII Art Generator, llms.txt Generator, Get in touch), **Connect** (Github, LinkedIn, Dribbble, X), **Open Source** (Astro UI Library — a public component library at `ui.bejamas.com`), and an **ISO 27001 Certified** badge column (Cert no. 22185). Bottom bar: large lens-artwork image, Privacy Policy link, © 2026.

---

### 2. Tech Stack (confirmed from `<meta name="generator">`, script/link tags, and served CSS)

| Layer | Technology | Evidence |
|---|---|---|
| Framework | **Astro v7.2.2** | `<meta name="generator" content="Astro v7.2.2">`; per-component chunked JS named `ComponentName.astro_astro_type_script_index_0_lang.[hash].js` (e.g. `NavigationMenu.astro_...`, `AnimatedText.astro_...`, `HeroLogoCarousel.astro_...`, `ServicesSection.astro_...`, `Analytics.astro_...`) — this is Astro's island-architecture output signature |
| Rendering | Static-site generation with islands hydrating client-side | No `__NEXT_DATA__`, no `__nuxt`, no single SPA root div — server-rendered HTML per route |
| CSS framework | **Tailwind CSS v4** (CSS-first config, `@theme`) | Custom properties follow Tailwind v4's exact naming convention: `--text-*`, `--text-*--line-height`, `--container-*`, `--breakpoint-*`, `--font-weight-*`, `--tracking-*`, `--leading-*`, `--ease-*`, `--blur-*`, plus the full `--tw-*` utility-internals namespace (ring, shadow, gradient, translate, etc.) |
| Component/design system | **shadcn/ui-style token architecture** on top of Tailwind, likely via a headless primitives lib (Radix-style `data-slot` attributes seen on `navigation-menu-popup`/`navigation-menu-viewport`) | Semantic CSS variables `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--accent`, `--muted`, `--card`, `--popover`, `--border`, `--input`, `--ring`, `--radius`, `--destructive` — the canonical shadcn/ui token set, values authored in **oklch** |
| Color model | oklch throughout theme tokens; a few raw hex fallbacks (`--input:#e4e4e7`, `--ring:#a1a1aa`, `--destructive:#ef4444`) | see Section 3 |
| Scoped component styles | Astro's built-in `data-astro-cid-[hash]` scoping | e.g. `.site-header[data-astro-cid-owm7sp2x]`, `.footer-link[data-astro-cid-r4f3bwe4]` |
| Font | **"NeueMontreal"** (Neue Montreal, PP Foundry), self-hosted, set as `--default-font-family`; monospace fallback `SFMono-Regular` | `--default-font-family:"NeueMontreal", sans-serif` |
| Icons | Not confirmed from static analysis (browser session dropped before DOM icon audit); site visuals suggest a small custom SVG icon set (lens/aperture brand glyph, service pillar icons) rather than a stock icon font — build with hand-authored inline SVGs |
| Analytics/telemetry stack | Microsoft Clarity (`scripts.clarity.ms`, `clarity.ms/tag/mfh699p391`), Plausible (`plausible.io/js/script.outbound-links.tagged-events.js`), Ahrefs Analytics (`analytics.ahrefs.com`), **PostHog** reverse-proxied through their own domain (`miso.bejamas.com/array/phc_...config.js`, plus PostHog's dead-clicks and exception autocapture extensions), Cloudflare Web Analytics beacon (`static.cloudflareinsights.com/beacon.min.js`) | multiple `<script src>` tags |
| Hosting/edge | Cloudflare (Insights beacon present) — site's own `/stack/hosting` content also recommends Vercel/Netlify/Cloudflare, but Bejamas' own site loads a Cloudflare beacon | — |
| State management | None needed/detected — this is a fully static content site; interactive widgets (salary calculator, ASCII generator, llms.txt generator, mega menu, mobile nav, contact form) are isolated Astro islands with local component state, no global store | — |
| Notable interaction libraries | No GSAP/Framer Motion/Swiper script tags were present in the loaded script list; animation is implemented via CSS transitions/custom properties plus small vanilla-JS Astro island scripts (`AnimatedText.astro`, `HeroLogoCarousel.astro`) — build animations with CSS transitions + IntersectionObserver, not a heavy animation library | scripts list, Section 5 |

---

### 3. Design System

#### 3.1 Color palette (resolved from live computed styles, oklch → hex)

| Token | oklch (as authored) | Hex | Usage |
|---|---|---|---|
| `--background` | `oklch(96.44% .0013 286.38)` | `#f3f3f4` | Page background (light, near-white warm gray) |
| `--foreground` | `oklch(18.72% .002 286.2)` | `#131314` | Primary text, near-black |
| `--primary` | `oklch(18.72% .002 286.2)` | `#131314` | Primary buttons/surfaces (dark) |
| `--primary-foreground` | `oklch(100% 0 0)` | `#ffffff` | Text on primary |
| `--secondary` | `oklch(100% 0 0)` | `#ffffff` | Secondary surface |
| `--secondary-foreground` | `oklch(18.72% .002 286.2)` | `#131314` | Text on secondary |
| `--accent` | `oklch(91.98% .1905 128.5)` | **`#befc65`** | Brand accent — lime/chartreuse green. Used for the hero light-beam effect and the "Talk to us" CTA button |
| `--accent-foreground` | `oklch(18.72% .002 286.2)` | `#131314` | Text on accent (dark text on lime button) |
| `--muted` | `oklch(94.31% 0 0)` | `#ececec` | Muted backgrounds (cards, subtle panels) |
| `--muted-foreground` | `oklch(50.81% .0143 296.07)` | `#66646d` | Secondary/caption text |
| `--card` | `oklch(100% 0 0)` | `#ffffff` | Card surfaces |
| `--card-foreground` | `oklch(18.72% .002 286.2)` | `#131314` | Card text |
| `--popover` / `--popover-foreground` | same as card | `#ffffff` / `#131314` | Dropdowns, popovers |
| `--border` | `oklch(91.36% .006 239.83)` | `#dfe3e6` | Hairline borders/dividers |
| `--input` | raw hex | `#e4e4e7` | Form field borders |
| `--ring` | raw hex | `#a1a1aa` | Focus ring |
| `--destructive` / `--destructive-foreground` | raw hex | `#ef4444` / `#fafafa` | Error states |
| Hero background | — | near-black `#0a0a0a`–`#131314` range | Dark hero section only (rest of site is light-mode) |

Note: the site is effectively a **single light theme with one dark hero section** for contrast, not a user-toggleable dark mode. `theme-color` meta is `#f4f4f4`, matching `--background`.

Tailwind v4's full default gray/blue/green/neutral/zinc/orange/red ramps are also present in the bundle (`--color-gray-100..950`, `--color-blue-*`, `--color-neutral-*`, `--color-zinc-*`, `--color-orange-*`, `--color-red-*`) — these are Tailwind v4 framework defaults left in the compiled CSS (tree-shaken utilities used somewhere on the site, e.g. status badges, syntax highlighting, or chart colors on stat callouts), not necessarily all visible.

#### 3.2 Typography

Font family: **`"NeueMontreal", sans-serif`** for all UI text; monospace fallback `SFMono-Regular, monospace` (used for stats/numbers or code snippets). Neue Montreal is a Pangram Pangram Foundry grotesk — geometric, tight, modern; license and self-host it (or substitute a close-match variable grotesk such as **General Sans**, **Inter Tight**, or **Aeonik** if the exact licensed font is unavailable).

Type scale (Tailwind v4 defaults, unmodified — confirmed present verbatim in the CSS bundle):

| Token | Size | Line-height |
|---|---|---|
| `text-xs` | 0.75rem / 12px | 1.333 |
| `text-sm` | 0.875rem / 14px | 1.429 |
| `text-base` | 1rem / 16px | 1.5 |
| `text-lg` | 1.125rem / 18px | 1.556 |
| `text-xl` | 1.25rem / 20px | 1.4 |
| `text-2xl` | 1.5rem / 24px | 1.333 |
| `text-3xl` | 1.875rem / 30px | 1.2 |
| `text-4xl` | 2.25rem / 36px | 1.111 |
| `text-5xl` | 3rem / 48px | 1.0 |
| `text-6xl` | 3.5rem / 56px | 1.2 |
| `text-7xl` | 4.5rem / 72px | 1.0 |
| `text-8xl` | 6rem / 96px | 1.0 |

Hero H1 ("Migrate to a website your team can run.") renders at roughly the `text-6xl`–`text-7xl` range at desktop width, tight tracking, white on the dark hero.

Font weights available: `400` (normal), `500` (medium), `600` (semibold), `700` (bold), `800` (extrabold). Headings generally use 500–700; body copy 400; nav/labels 500.

Letter-spacing tokens: `tracking-tight: -0.025em`, `tracking-tighter: -0.05em` (used on large display headings), `tracking-widest: 0.1em` (used on small uppercase labels/eyebrows like category tags).

#### 3.3 Spacing, radius, containers

- Base spacing unit: `--spacing: .25rem` (4px) — standard Tailwind 4px grid.
- Container/max-width tokens (Tailwind v4 defaults, confirmed present): `2xs`–`7xl` running from `20rem` (320px) to `80rem` (1280px), e.g. `--container-7xl: 80rem`, `--container-4xl: 56rem`. Page content likely maxes out around `7xl` (1280px) with generous side gutters.
- Border radius: base `--radius: .5rem` (8px), `--radius-xs: .125rem` (2px). Following shadcn convention, derive `--radius-sm = radius - 4px (4px)`, `--radius-md = radius - 2px (6px)`, `--radius-lg = radius (8px)`, `--radius-xl = radius + 4px (12px)`. One custom override: the mega-menu popup uses a much larger **`1.25rem` (20px)** radius. Primary CTA buttons ("Talk to us") render fully pill-shaped (`radius-full`) per the screenshot.
- Blur tokens available for glassmorphism effects: `--blur-sm 8px`, `--blur-md 12px`, `--blur-xl 24px`, `--blur-2xl 40px`, `--blur-3xl 64px` — the header mega-menu uses `blur(24px)`.

#### 3.4 Breakpoints

Tailwind v4 defaults; only `md` was directly confirmed in the served CSS (`--breakpoint-md: 48rem`), the rest are the unmodified framework defaults:
`sm 40rem (640px)` · `md 48rem (768px)` · `lg 64rem (1024px)` · `xl 80rem (1280px)` · `2xl 96rem (1536px)`.

#### 3.5 Shadows

No bespoke box-shadow custom properties were found beyond Tailwind's internal `--tw-shadow`/`--tw-ring-shadow` machinery, meaning shadows are applied via ordinary Tailwind utility classes (`shadow-sm`, `shadow-md`, etc.) rather than a custom shadow scale. Use Tailwind's default shadow scale: cards and popovers use soft, low-opacity shadows (`shadow-sm`/`shadow-md`); the mega-menu instead uses blur+opacity rather than a drop shadow.

---

### 4. Layout & Components (per page type)

#### 4.1 Global chrome

**Header** (`site-header`, sticky/fixed)
- Fixed to viewport top; on the dark hero it blends with `mix-blend-mode: exclusion` and white text/logo so it's always legible against any hero art; once the hero is scrolled past (`[data-menu-open=true]` or scroll-driven), it switches to solid `--foreground` color.
- **Progressive blur on scroll**: a `.progressive-header-blur__layer` applies `backdrop-filter: blur(var(--progressive-header-blur))` masked with a CSS gradient (`mask-image: var(--progressive-header-mask)`) so the blur intensity fades from strong at the very top edge to none a bit lower — a "frosted glass that fades out" effect, not a flat blur band.
- Nav items: Work, Services, Stack, About, Insights, plus a rounded "Talk to us" pill CTA button (background `--accent` #befc65, dark text, likely `radius-full`).
- Mobile: hamburger icon (3 horizontal lines) that animates into an X: line 1 → `translateY(4px) rotate(45deg)`, line 2 → `opacity:0`, line 3 → `translateY(-4px) rotate(-45deg)`, all `transition: opacity .3s, transform .3s`. Mobile panel itself transitions `opacity, transform, visibility` over `.3s` (visibility delayed on close so it's not interactive while fading out), sliding from `translateY(-2px)` to `translateY(0)`.

**Mega menu** (desktop dropdown for Services/Stack/Insights)
- Built on Radix/Base-UI-style primitives (`data-slot="navigation-menu-popup"`, `data-slot="navigation-menu-viewport"`).
- Panel styling: `border-radius: 1.25rem`, `background-color: color-mix(in oklab, var(--primary) 48%, transparent)`, `backdrop-filter: blur(24px)` — a dark, frosted-glass dropdown regardless of scroll position.
- Entry animation: scales in from `scale: .96` to `1` with opacity fade (no keyframe animation on the "starting style" state — driven by the `[data-starting-style]` transition pattern typical of Base UI/Radix presence animations).

**Footer**
- 4-column layout: Pages / Connect / Open Source / ISO 27001 badge, then a full-width bottom strip with large decorative lens-artwork image, Privacy Policy link, and `© 2026`.
- Footer link hover state: an animated underline **sweep**, not a static underline — implemented as a background-image gradient with `background-size: 0 1px` at rest, transitioning to `background-size: 100% 1px` on hover/focus, `transition: background-size .3s cubic-bezier(.25,.46,.45,.94)`. Reproduce with a `background: linear-gradient(currentColor, currentColor) no-repeat; background-size: 0% 1px; background-position: 0 100%;` pattern animated on hover.

#### 4.2 Home page (`/`) — section-by-section

1. **Hero** — full-viewport-height, dark background (#0a0a0a–#131314) with animated diagonal light-beam/streak graphic in the brand lime green fading to white/transparent, positioned right-of-center bleeding off-canvas. Left-aligned content: H1 "Migrate to a website your team can run." (large, tight tracking, white), small "Trusted by teams at" label, then a row of monochrome/white client wordmarks (Backlinko, Newfront, Routable, + Danone/Rippling/Deliverect referenced elsewhere) — likely the `HeroLogoCarousel.astro` island, auto-scrolling marquee.
2. **"Why teams come to us"** — smaller eyebrow/heading "The site got big. The platform didn't keep up." + intro line + inline link "Here's what we'd do about it →", followed by a 3-item numbered pain-point list (Every change waits on a developer / Every brand sits on a different CMS / Every year it costs more to run), each with a bold title + 1-2 sentence body.
3. **Services** — heading "Services", 4-item numbered grid (Audit / Design / Migrate / Run), each a short tagline; two CTAs ("Talk to us", "Services overview").
4. **Featured projects** — heading "Featured projects", 6-card grid of case studies (Rippling, Alpro, HanseYachts, Veezu, Bennetts, RudderStack), each card: client logo/name, one-line description, tech-stack tags (e.g. "Next.js, Contentful, Netlify"), and 0-2 stat call-outs in large numerals (e.g. "+127% Faster Page Loading").
5. **Testimonial** — large pull-quote (Ralph Urmel, Alpro) with a "Play video" affordance — likely opens a modal/lightbox video player.
6. **Results/stats strip** — two big stat call-outs ("+18% Better page performance", "+20% Better user engagement").
7. **Closing CTA band** — heading "Your website shouldn't be a black box.", sub "Let's move you off legacy.", "Talk to us" button, short descriptor line.
8. **Footer** as described in 4.1.

#### 4.3 Services index (`/services`)
Hero ("Your whole web team.") → 4 pillar sections (Audit, Design, Migrate, Run), each with a tagline and a bullet list of named sub-services (e.g. under Migrate: Headless CMS Migration & Replatforming, Multi-Brand & Multi-Market Platform, Website Redesign & Rebuild, Integrations, Custom Web Apps & Portals) → CTA bands → footer.

#### 4.4 Service detail page (e.g. `/services/website-migration`)
This is the richest, most reused template on the site (9 instances). Structure: Hero (heading + subheading + client logo row) → "What is X" definitional section → "What it includes" (numbered/lettered sub-topic breakdown) → "Platforms/technologies covered" list with short editorial blurb per item → process section ("Audit → Design → Migrate → Run") → testimonial block(s) interleaved between content sections (not all at the end) → pricing-philosophy section (no fixed price shown, always "priced after audit") → "How to choose a partner" advice section → "The Bejamas take" opinion section → related case studies (2-card mini version of the work-card component) → **FAQ accordion** (5-6 Q&As) → "At a glance" summary card/table (category, best-for, typical work, engagement model, pricing shape, one-line house POV) → CTA bands (top, middle, bottom) → footer.

#### 4.5 Work index (`/work`)
Hero ("Selected projects.") → filter bar with 3 facets (Service / Technology / Industry, each showing an active-filter count) → responsive card grid of all 34 case studies, each card: client name, 1-line outcome description, tech-stack tag chips, 0-2 large stat numerals. Grid is the same `work-card` component reused on the homepage's "Featured projects" (6-card subset) and on service/industry pages' "related work" sections (2-3 card subset).

#### 4.6 Case study detail (e.g. `/work/backlinko`)
Hero (project title, e.g. "Moving Backlinko to Headless WordPress and Next.js") → meta bar (Client, Industry, Services, Tech Stack, Timeline) → narrative sections with lettered/numbered sub-headings (challenge → solution → specific improvements) → large stat call-outs (e.g. "+64% Performance", "3X Faster Loading") → testimonial block → outcome summary → CTA row ("Start project" / "Check online" / "Get in touch") → footer. Layout implies a 2-column meta sidebar + main content column on desktop, collapsing to stacked on mobile.

#### 4.7 Stack hub (`/stack`, `/stack/[category]`, `/stack/[category]/[slug]`)
- **Hub index**: hero + 4 category cards (CMS, Framework, Hosting & Infrastructure, Integrations), each with a one-line defining question ("Where does content live, and can the team actually run it?"), 2-3 "recommended" picks called out, and a total-count badge (e.g. "19 total").
- **Category index**: same pattern, listing every technology in that category as a card/row.
- **Technology/leaf page** (e.g. `/stack/cms/storyblok`): hero (tech name + one-line positioning) → "What it is" section → differentiator section (e.g. "The European angle") → "Editor & developer experience" 2-column comparison → "Where it earns the shortlist" → **comparison table**: "Choose X when" vs "Look elsewhere when" (2-column pros/cons table) → pricing summary → "The Bejamas take" opinion box → "At a glance" summary table → CTA links (related service, category index, contact). Comparison pages like `astro-vs-next-js` instead render a **head-to-head feature comparison table** (Aspect | Option A | Option B rows: best-fit surface, JS payload, rendering model, UI layer, performance defaults, hosting, ecosystem, lock-in) plus "Choose A when / Choose B when" bullet lists and a migration-path section.

#### 4.8 Insights hub (`/insights`, `/insights/[category]`, `/insights/[category]/[slug]`)
- **Hub/category index**: hero + horizontal category tab bar (All Posts, Migration & Replatforming, Platform Decisions, Design Systems, Running the Website, Field Notes) → reverse-chronological article list/grid, each item showing title, category tag, author, publish date, and read-time estimate → "Load more" pagination (not infinite scroll, not numbered pages).
- **Article page**: title, byline with author avatar + name/role (e.g. "Thom Krupa, CTO"), date, read time → long-form body with inline cross-links to service/stack pages → author bio box at the end → social share row (Twitter/LinkedIn/copy-link) → related-content CTA band → FAQ block on how-to/guide articles → footer.

#### 4.9 Industry landing pages (`/industries/[slug]`)
Same template family as service detail pages: hero (industry-specific headline + subheading + relevant client logos) → "What we do for [industry]" → numbered "why teams pick us" reasons with embedded proof points/quotes → "what makes these estates different" → "what we build" → testimonial → partnerships/platform-badges row → process/"how it starts" → 4-5 case-study cards specific to that industry → FAQ (4 Q&As, phrased as buyer-search-intent questions) → "at a glance" summary → CTA band. This confirms industries pages are intentionally written for both human decision-makers and AI/LLM answer-engines (FAQ phrasing like "Which web agency has worked with data infrastructure and security SaaS?").

#### 4.10 About (`/about`)
Hero (mission statement heading + sub) → mission/body copy → 4-person leadership grid (name, title, photo) with a pull-quote from the CEO → 4-value grid (Transparency, Openness of Mind, Commitment, Empathy), each with a short explanatory paragraph → closing CTA band.

#### 4.11 Enterprise/trust (`/enterprise`)
The most component-dense page: hero → ISO 27001 callout → logo wall ("Trusted by teams that don't cut corners") → "Why procurement signs off" 7-item feature grid → 2-column "Security & Compliance" / "Governance & Quality" checklist section (6 items each, each with a 1-line description) → "Reliability & Support" 6-pillar grid → SLA section with a **3-tier priority table** (P1/P2/P3, each with response-time SLA and example scenario) → related work (3 cards) → **5-step procurement process timeline** (each step: name, duration, description) → "internal approvals" helper callout (2 sub-items) → certified-partner logo row (Webflow, Vercel, Contentful, Sanity, Storyblok, DatoCMS, Netlify) → FAQ organized into 5 sub-categories → testimonial → closing CTA → footer.

#### 4.12 Freelance hub (`/freelance-hub`)
Hero → "at a glance" 3-stat strip → clients section → "what you can earn" stat strip (avg hourly rate, avg engagement length, payment cycle) + 3 value props → "why join us" 6-benefit grid → featured-projects mini grid (4 cards) → **5-step "how it works" numbered process** → **open roles list** (job cards: title, level, location, requirements bullet list, nice-to-have tags, "Apply now" CTA — currently 4 listings) → **multi-field application form** (first/last name, email, LinkedIn URL, portfolio URL, CV upload with file-type/size constraints, country dropdown, tax-residence dropdown, position dropdown, availability dropdown, hours/month dropdown, 2 required checkboxes + 1 optional checkbox) → FAQ (7 Q&As) → direct-contact callout (hr@bejamas.com) → newsletter signup (email input + Subscribe button) → footer.

#### 4.13 Careers (`/careers`)
Hero ("We don't have a type. If we vibe, we vibe.") → global/remote-team blurb → **stat grid** (eNPS, retention %, work-life-balance rating /6, L&D rating /6) → "stable company" (no-VC positioning) copy block → 4-item "work rules" list (remote-only, flexible hours, async-first, 145h/month contractor baseline) → 4-value grid (same values component as About) → open positions list (currently 1: Engineering Manager) → footer. Job apply flow is multi-step: job detail → `/apply` form → **video-response step** (`/careers/apply/video`) → thank-you page.

#### 4.14 Contact (`/get-in-touch`)
Hero ("Tell us about your website.") + descriptive sub referencing the migration guide → **contact form**: Company (honeypot field labeled "Company fax" — a spam trap, not a real field to render visibly, or render it visually-hidden), Your name, Work email, Phone (optional), Tell us about your project (textarea), How did you hear about us? (optional) → submit button "Send it over" → alternate contact: sales@bejamas.com, RFP/procurement note → **"Working with an AI agent? Copy one prompt into Claude, Codex, or any agent."** (a copy-to-clipboard prompt snippet — notable modern feature, build as a code block with a copy button) → trusted-logo row → privacy notice line → footer.

#### 4.15 Interactive tools
- **`/salary-calculator`**: 4 required dropdowns (Job position, Country of residence [40+ countries], Seniority [Junior/Mid/Senior], Currency [PLN/USD/EUR]) → result panel showing computed salary range, disabled/placeholder state until all fields are filled ("Complete the fields to see the estimate") → methodology footnote (data sourced from Numbeo + economic indicators) → disclaimer.
- **`/tools/llms-txt-generator`**: single URL input ("Website or sitemap URL") + "Generate llms.txt" button → helper note ("Nothing is stored...") → 3-step explainer (Find/Choose/Publish) → output is presumably a generated Markdown text block with copy/download actions (crawls robots.txt + sitemap server-side).
- **`/tools/ai-ascii-art-generator`**: single text prompt input ("What should we draw?") + "Generate ASCII art" button → helper note ("One image request per generation...") → output presumably a monospace `<pre>` block with customize/copy/download actions. Explicitly excluded from the search sitemap.

---

### 5. Animations & Transitions (from computed CSS + component script names)

| Element | Trigger | Effect | Duration / Easing |
|---|---|---|---|
| Header background | Scroll | Progressive backdrop-blur that fades via a CSS mask gradient (stronger blur near the very top, none a bit further down) | CSS var-driven, no fixed duration (scroll-linked) |
| Header text color | Hero in view vs. scrolled/menu-open | `mix-blend-mode: exclusion` (white-on-anything) → solid `--foreground` | Instant/attribute-toggle, likely eased with the panel's own transition |
| Mobile hamburger icon | Click (menu toggle) | 3-line icon morphs to X: outer lines rotate ±45° and shift 4px vertically; middle line fades to `opacity:0` | `.3s`, default ease |
| Mobile nav panel | Menu open/close | Fades and slides from `translateY(-2px)` to `translateY(0)`, opacity 0→1, `visibility` toggled with a `0s` delay so it doesn't intercept clicks while hidden | `.3s` for opacity/transform; visibility delayed `.3s` on close |
| Desktop mega-menu | Hover/focus on nav item | Panel scales in from `.96` to `1` with opacity fade-in (Base UI/Radix "starting style" presence pattern — no animation on first paint to avoid flash) | short, likely `.15–.2s`, `ease-out` |
| Footer link underline | Hover / focus-visible | Underline "sweep" — a 1px background line grows from `background-size: 0% 1px` to `100% 1px`, anchored bottom | `.3s`, `cubic-bezier(.25,.46,.45,.94)` (custom "quad-out"-like curve) |
| Accordion (FAQ) | Click to expand/collapse | Height/opacity reveal, standard shadcn-style accordion keyframes (`accordion-down`/`accordion-up`) | `.5s` down / `.6s` up, `cubic-bezier(.77,0,.18,1)` (steep custom ease, snappier at the start) |
| Hero heading | Page load / scroll into view | Text reveal animation (component literally named `AnimatedText.astro`) — implement as a staggered word/line fade-up: each line `opacity 0→1`, `translateY(12–20px)→0`, staggered ~60-100ms per line, `.4–.6s ease-out` | On load for hero; on-scroll (`IntersectionObserver`) for repeated instances of the same component further down the page |
| "Trusted by" logo row | Load / continuous | Horizontal auto-scrolling marquee/carousel (component `HeroLogoCarousel.astro`) — infinite loop, linear timing, pause-on-hover is a reasonable default to add | Continuous linear loop, ~20-40s per cycle typical for this pattern |
| Buttons | Hover | Standard Tailwind-style transition on background/opacity/scale — treat as `transition: all .15s ease` (Tailwind's default transition duration is `.15s`, confirmed in `--default-transition-duration:.15s`) | `.15s`, `cubic-bezier(.4,0,.2,1)` |
| Cards (work/service cards) | Hover | Subtle lift/scale or border/shadow change consistent with the rest of the interaction language — implement as `transform: translateY(-2px)` + shadow increase, `.2s ease-out` | `.2s` |
| Focus states | Keyboard focus | Visible ring using `--ring` (`#a1a1aa`) via `box-shadow`/outline, consistent with shadcn's `--tw-ring-*` machinery | instant, no easing needed but keep it visible |
| Page transitions | Route change | No SPA transition framework detected (no View Transitions API markers observed, but Astro v7 supports `<ClientRouter>`/View Transitions natively) — treat as standard full navigation unless View Transitions are explicitly desired; if replicating a fade, use Astro's built-in `<ClientRouter />` with a simple crossfade | n/a unless added |

No GSAP, Framer Motion, Swiper, or Lottie script tags were present in the loaded resources — build all motion with CSS transitions/animations plus small vanilla JS (IntersectionObserver for reveal-on-scroll, a simple `requestAnimationFrame`/CSS-animation marquee for the logo carousel).

---

### 6. Functionality

- **Navigation**: mega-menu dropdowns for Services/Stack/Insights (desktop), full-screen or panel-style mobile menu with animated hamburger, sticky/progressive-blur header.
- **Forms**:
  - Contact form (`/get-in-touch`): name, work email, optional phone, project textarea, optional "how did you hear about us," honeypot field for spam. No client-side validation specifics observed — implement standard required-field + email-format validation, submit via API route/serverless function (Astro API route or a form service), success/thank-you state.
  - Freelance application form: 10+ fields including file upload (CV, PDF/DOC/DOCX, max 3.5MB) and multiple required checkboxes (B2B status confirmation, data-processing consent) plus one optional consent checkbox.
  - Job apply flow: multi-step (form → video recording/upload step → thank-you), i.e. a **wizard pattern** with route-based steps rather than a single-page multi-step form.
  - Newsletter signup (freelance hub footer-area): single email field + Subscribe.
- **Filtering**: `/work` index has 3 filter facets (Service, Technology, Industry) shown as counters, client-side filtering of the case-study grid (no page reload implied).
- **Interactive tools**: salary calculator (client-side or lightweight serverless computation from dropdown inputs against a lookup table), llms.txt generator (server-side crawl of robots.txt/sitemap, returns generated Markdown), ASCII art generator (server-side AI image/text generation call, returns art for copy/download) — both tools explicitly state "nothing is stored," implying stateless request/response with no persistence layer.
- **Modals/lightbox**: homepage testimonial has a "Play video" affordance — implement as a modal/lightbox video player (click-to-play, likely a Vimeo/YouTube embed or self-hosted video, closes on backdrop click/Escape).
- **Pagination**: Insights index uses "Load more" (incremental client-side fetch/append), not numbered pagination or infinite scroll.
- **Dark/light mode**: none — single light theme with an intentionally dark hero section for contrast; no toggle.
- **Third-party embeds/APIs**: Clarity, Plausible, Ahrefs Analytics, PostHog (self-proxied), Cloudflare Web Analytics — all analytics/telemetry, no user-facing API integrations beyond the tools above.
- **Authentication**: none — fully public marketing site, no login/account system anywhere in the sitemap.
- **Cookie/consent**: not confirmed from static analysis; given the EU-based company (Poland) and GDPR-focused privacy policy, include a cookie-consent banner as a safe default.

---

### 7. Content reference

Representative copy for hero, CTAs, nav, and footer was captured verbatim in Sections 4.2–4.15 above and is reused directly in the BUILD PROMPT's content blocks in Part 2. Key recurring copy fragments used across almost every page as CTA bands:
- "Your website shouldn't be a black box." / "Let's move you off legacy." / "Talk to us"
- "Your whole web team: auditing, migrating, and running your platform long after launch." (used as both a hero subhead and a footer tagline)
- Process shorthand used everywhere: **Audit → Design → Migrate → Run**

Images: no photography of people/offices was observed in the fetched content — the visual language leans on abstract dark-hero gradient/light-beam art, client wordmark logos (monochrome), a recurring "camera lens/aperture" artwork motif (footer, brand mark), and UI screenshots implied for case studies (not confirmed in text-only fetch, but standard for this page type — build case-study pages with a large hero screenshot/mockup image area even though exact assets couldn't be inspected). No video files were directly identified beyond the homepage testimonial's "Play video" trigger.

---

## PART 2 — BUILD PROMPT

Copy everything below this line into Claude Code as a single prompt.

---

You are building a pixel-faithful clone of the marketing website **bejamas.com** from scratch. Follow this specification exactly. Where an exact asset (font file, photo, logo SVG) isn't available, use the documented fallback and keep all structure, spacing, color, and copy exact.

### Tech stack (use exactly this)

- **Astro v7+** as the framework, static output, with Astro content collections for `services`, `work`, `stack` (nested by category), `insights` (nested by category), and `industries`.
- **Tailwind CSS v4**, configured CSS-first via `@theme` in a global stylesheet (no `tailwind.config.js`). Do not use Tailwind v3 syntax.
- Adopt a **shadcn/ui-style token layer**: define semantic CSS custom properties (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--accent`, `--accent-foreground`, `--muted`, `--muted-foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--border`, `--input`, `--ring`, `--radius`, `--destructive`, `--destructive-foreground`) in `:root`, then map them into Tailwind's `@theme inline` block as `--color-background: var(--background)` etc., exactly as shadcn/ui's Tailwind v4 setup does.
- Use **React or Astro islands with `client:load`/`client:visible`** only for interactive pieces: header nav + mega menu, mobile menu, work-index filters, salary calculator, llms.txt generator, ASCII art generator, contact/application forms, testimonial video modal, logo marquee, FAQ accordions, scroll-triggered text reveal. Everything else is static Astro markup — do not ship a client-side framework runtime for pages that don't need interactivity.
- No GSAP/Framer Motion/Swiper — implement all motion with CSS transitions/animations and a small amount of vanilla JS / IntersectionObserver.
- Add: Plausible-style analytics script tag placeholder, a cookie-consent banner (EU/GDPR site), sitemap.xml + robots.txt generation, and an `llms.txt` file at the root (the company's own tooling generates one — ship a real one for this clone too).

### Design tokens (implement exactly)

```css
:root {
  /* base spacing unit = 0.25rem (4px), Tailwind default scale */
  --background: oklch(96.44% .0013 286.38);   /* #f3f3f4 */
  --foreground: oklch(18.72% .002 286.2);     /* #131314 */
  --primary: oklch(18.72% .002 286.2);        /* #131314 */
  --primary-foreground: oklch(100% 0 0);      /* #ffffff */
  --secondary: oklch(100% 0 0);               /* #ffffff */
  --secondary-foreground: oklch(18.72% .002 286.2);
  --accent: oklch(91.98% .1905 128.5);        /* #befc65 — brand lime green */
  --accent-foreground: oklch(18.72% .002 286.2);
  --muted: oklch(94.31% 0 0);                 /* #ececec */
  --muted-foreground: oklch(50.81% .0143 296.07); /* #66646d */
  --card: oklch(100% 0 0);
  --card-foreground: oklch(18.72% .002 286.2);
  --popover: oklch(100% 0 0);
  --popover-foreground: oklch(18.72% .002 286.2);
  --border: oklch(91.36% .006 239.83);        /* #dfe3e6 */
  --input: #e4e4e7;
  --ring: #a1a1aa;
  --radius: 0.5rem;       /* 8px base */
  --radius-xs: 0.125rem;  /* 2px */
  --destructive: #ef4444;
  --destructive-foreground: #fafafa;

  --font-sans: "NeueMontreal", "General Sans", "Inter Tight", ui-sans-serif, sans-serif;
  --font-mono: "SFMono-Regular", ui-monospace, monospace;
}
```

Derive `--radius-sm: calc(var(--radius) - 4px)`, `--radius-md: calc(var(--radius) - 2px)`, `--radius-lg: var(--radius)`, `--radius-xl: calc(var(--radius) + 4px)`. Override the mega-menu panel to `border-radius: 1.25rem`. Make all primary CTA buttons ("Talk to us" etc.) fully pill-shaped (`border-radius: 9999px`).

Type scale — use Tailwind v4's unmodified default scale (`text-xs` 12px through `text-8xl` 96px, line-heights as documented in Part 1 §3.2). Font weights: 400/500/600/700/800. Tracking: `tracking-tight -0.025em`, `tracking-tighter -0.05em` on large display headings; `tracking-widest 0.1em` on small uppercase eyebrow labels.

Breakpoints: `sm 640px / md 768px / lg 1024px / xl 1280px / 2xl 1536px` (Tailwind v4 defaults, unmodified). Max content width `80rem` (1280px) with responsive side gutters (16px mobile, 24-48px tablet, 64-96px desktop).

Font: license and self-host **Neue Montreal** (PP Foundry) as woff2 with `font-display: swap`; if unavailable, substitute **General Sans** or **Inter Tight** and keep the same weight usage.

### Global components to build

1. **SiteHeader** — fixed/sticky, transparent over the hero with `mix-blend-mode: exclusion` white text, switching to solid `--foreground` text once scrolled past hero or when the mobile menu is open. Implement the "progressive blur": a `backdrop-filter: blur()` layer whose opacity/intensity is masked with a `mask-image: linear-gradient(...)` gradient so it fades out a short distance below the top edge, rather than a hard blur band. Nav items: Work, Services (mega menu), Stack (mega menu), About, Insights (mega menu), plus a pill "Talk to us" button styled with `--accent` background and `--accent-foreground` text.
2. **MegaMenu** — dropdown panel per top-level item with sub-taxonomy content (Services: the 4 pillars + all 9 service links; Stack: 4 categories with top picks + link to full list; Insights: 5 category links). Panel: `background: color-mix(in oklab, var(--primary) 48%, transparent)`, `backdrop-filter: blur(24px)`, `border-radius: 1.25rem`, entrance animation scale `0.96 → 1` + opacity fade, ~150-200ms ease-out, no animation flash on first paint.
3. **MobileMenu** — hamburger icon that morphs into an X (two outer lines rotate ±45° and translate 4px, middle line fades out, all `.3s`), full-panel or slide-down menu, `opacity/transform/visibility` transition `.3s` with the delayed-visibility trick on close so it isn't clickable while invisible.
4. **Footer** — 4 columns (Pages, Connect, Open Source, ISO 27001 badge) + bottom bar with a large decorative abstract "lens/aperture" artwork image, Privacy Policy link, © current-year. Footer links get the animated underline sweep: `background: linear-gradient(currentColor, currentColor) no-repeat; background-size: 0% 1px; background-position: 0 100%;` → on hover/focus `background-size: 100% 1px`, `transition: background-size .3s cubic-bezier(.25,.46,.45,.94)`.
5. **Button** — variants: `primary` (dark bg/white text), `accent` (lime bg/dark text, pill), `outline`, `ghost`, `link`. All: `transition: all .15s cubic-bezier(.4,0,.2,1)` on hover/active, visible focus ring using `--ring` via `box-shadow`.
6. **Card / WorkCard** — used on homepage "Featured projects," `/work` grid, and "related work" sections on service/industry pages. Props: client name/logo, one-line description, tech-stack tag chips, 0-2 large stat call-outs (big number + label). Hover: `transform: translateY(-2px)`, shadow increase, `.2s ease-out`.
7. **StatCallout** — big numeral (e.g. "+127%") + small label underneath, used throughout case studies, industry pages, and the homepage results strip.
8. **Testimonial** — pull-quote block with attribution (name, title, company) and an optional "Play video" trigger opening a modal/lightbox video player (click backdrop or Escape to close).
9. **FAQAccordion** — shadcn-style accordion, `accordion-down .5s cubic-bezier(.77,0,.18,1)` / `accordion-up .6s cubic-bezier(.77,0,.18,1)` keyframes animating height/opacity.
10. **AnimatedText** — headline/paragraph reveal: split into lines, each `opacity:0; transform: translateY(16px)` at rest, animating to `opacity:1; transform:none` on load (hero) or on scroll-into-view via `IntersectionObserver` (elsewhere further down pages), staggered ~60-100ms per line, `.4-.6s ease-out`.
11. **LogoMarquee** — infinite horizontal auto-scrolling row of client wordmarks, linear timing, ~20-40s per loop, duplicate the logo set for a seamless loop, pause on hover.
12. **CTASection** — full-width band component reused everywhere: heading, subheading, one primary button. Reuse the exact recurring copy: "Your website shouldn't be a black box." / "Let's move you off legacy." / "Talk to us".
13. **AtAGlanceTable** — small key/value summary card used at the bottom of service/stack/industry pages (Category, Best for, Typical work, Engagement, Pricing shape, House POV).
14. **ComparisonTable** — 2-column "Choose X when / Look elsewhere when" and head-to-head feature-comparison table variants (used on stack technology and stack comparison pages).

### Pages to build (with the Astro content-collection routing pattern below)

Build these as **Astro content collections** with a shared layout per collection, mirroring the routing in Part 1 §1.2:

```
src/pages/index.astro                          → Home
src/pages/about.astro
src/pages/enterprise.astro
src/pages/freelance-hub.astro
src/pages/get-in-touch.astro
src/pages/salary-calculator.astro
src/pages/legal/privacy-policy.astro
src/pages/careers/index.astro
src/pages/careers/[role]/index.astro
src/pages/careers/[role]/apply/index.astro
src/pages/careers/[role]/apply/thank-you.astro
src/pages/careers/apply/video/index.astro
src/pages/careers/apply/video/thank-you.astro
src/pages/services/index.astro
src/pages/services/[slug].astro                → 9 entries (content collection)
src/pages/work/index.astro
src/pages/work/[slug].astro                    → 34 entries
src/pages/industries/[slug].astro              → 7 entries, no index page
src/pages/stack/index.astro
src/pages/stack/[category]/index.astro         → cms | framework | hosting | integrations
src/pages/stack/[category]/[slug].astro        → ~45 entries total
src/pages/insights/index.astro
src/pages/insights/[category]/index.astro      → 5 categories
src/pages/insights/[category]/[slug].astro     → ~70 entries
src/pages/tools/llms-txt-generator.astro
src/pages/tools/ai-ascii-art-generator.astro
```

Build every page **template** in full per the Part 1 §4 breakdown (sections, order, and copy given verbatim there); for the high-volume collections (work, stack leaf pages, insights articles) build the **template once** correctly and seed it with a handful of realistic entries using the real copy captured in Part 1 rather than 100+ fabricated entries, unless told otherwise.

For each page template, implement the exact section order documented in Part 1 §4.2 through §4.15. Reuse copy verbatim where captured (hero headings, CTA bands, testimonial quotes, FAQ questions, footer content, nav labels) — do not paraphrase it.

### Forms — implement with real client + server validation

- **Contact form** (`/get-in-touch`): fields — Your name (required), Work email (required, email format), Phone (optional), Tell us about your project (required textarea), How did you hear about us? (optional select/text). Include a visually-hidden honeypot field named something like "company" to catch bots (labelled misleadingly as "Company fax" in the source — reproduce as a hidden anti-spam trap, not a real visible field). Submit via an Astro API route; show a success state inline (no separate thank-you page for this one) and a copy-to-clipboard "AI agent prompt" block above the form footer with the line "Working with an AI agent? Copy one prompt into Claude, Codex, or any agent."
- **Freelance application form** (`/freelance-hub`): first name, last name, email, LinkedIn URL, portfolio/GitHub URL (all required, URL-validated), CV upload (accept `.pdf,.doc,.docx`, max 3.5MB, client-side size check before upload), country-of-residence select, tax-residence-country select, position select (Frontend Developer / Web Designer / Webflow Developer / Freelancer Talent Pool), availability select, hours-per-month select, long-term-interest yes/no, two required checkboxes (B2B company confirmation, data-processing consent) + one optional checkbox (future recruitment consent). Submit button "Submit application".
- **Job application wizard** (`/careers/[role]/apply`): step 1 standard application form → step 2 video recording/upload at `/careers/apply/video` (implement as a `<video>`/`getUserMedia` recorder with an upload fallback) → step 3 thank-you confirmation page. Route-based steps, not a single-page stepper.
- **Salary calculator**: 4 required selects (Job position, Country [40+], Seniority [Junior/Mid/Senior], Currency [PLN/USD/EUR]); disable/placeholder the result panel until all 4 are chosen; compute from a static lookup table (position × seniority × country → base rate, currency-converted); footer disclaimer that final comp is set after the recruitment process.
- **Newsletter signup**: single email field + Subscribe button, freelance-hub only.

### Interactive tools

- **`/tools/llms-txt-generator`**: single URL input, "Generate llms.txt" button, helper text "Nothing is stored. Larger sites can take a few seconds." On submit, server-side: fetch `robots.txt`, discover and parse sitemap(s) (including nested/gzipped), select up to ~30 high-value shallow URLs, fetch titles/descriptions, and render a Markdown `llms.txt` following the "Find → Choose → Publish" 3-step model described in Part 1 §4.15; show the generated Markdown in an editable/copyable code block.
- **`/tools/ai-ascii-art-generator`**: single text prompt input ("What should we draw?"), "Generate ASCII art" button, helper text "One image request per generation. Results and share links are not stored." Output a monospace `<pre>` block with copy/download actions. Exclude this route from `sitemap.xml`.

### Animation implementation checklist

- Hero heading and section headings: line-by-line reveal on load/scroll, `translateY(16px)→0`, `opacity 0→1`, staggered 60-100ms, `.4-.6s ease-out`, via `IntersectionObserver` for anything below the fold.
- Header progressive blur on scroll (mask-gradient technique, not a flat blur).
- Hamburger → X icon morph, `.3s`.
- Mobile menu slide/fade, `.3s`, delayed-visibility-on-close.
- Mega menu scale+fade entrance, ~150-200ms ease-out.
- Footer link underline sweep, `.3s cubic-bezier(.25,.46,.45,.94)`.
- FAQ accordion expand/collapse, `.5s`/`.6s cubic-bezier(.77,0,.18,1)`.
- Buttons/cards hover transitions, `.15-.2s`, Tailwind default easing `cubic-bezier(.4,0,.2,1)`.
- Logo marquee: continuous linear-timing infinite scroll, duplicate content for seamless loop, pause on hover.
- No page-transition library required; if using Astro's `<ClientRouter />` View Transitions, keep it to a simple crossfade only.

### Content and copy

Use the verbatim copy captured throughout Part 1 (hero headings, service pillars, testimonials, FAQ Q&As, footer text, stat numbers, nav labels) for every page you build. Recurring CTA-band copy to reuse site-wide: "Your website shouldn't be a black box." / "Let's move you off legacy." / "Talk to us", and the process shorthand **Audit → Design → Migrate → Run**. Client roster to use for logo walls/case-study seeds: Danone/Alpro, Rippling, Deliverect, Newfront, Routable, HanseYachts, Veezu, Bennetts, RudderStack, Backlinko, Descope, Skyflow, Costa Coffee, VanRaam, Transcend, Delphix, Charm Industrial, Carbon Removal Alliance.

### Accessibility & SEO baseline

WCAG 2.1 AA color contrast (the palette here is high-contrast dark-on-light/light-on-dark by design, so this should hold naturally); visible focus rings using `--ring`; semantic heading hierarchy per page; alt text on all images/logos; a real `sitemap.xml` excluding the two `/tools/*` pages; per-page meta description and Open Graph tags matching the captured copy; an `llms.txt` file at the site root.

### Definition of done

Every route in the Part 1 §1.1 URL inventory resolves; global header/footer/mega-menu/mobile-menu behave and animate as specified; the 4 CSS custom-property groups (semantic tokens, type scale, spacing/radius, breakpoints) are implemented exactly as given; all forms validate and submit (even if the backend is a stub); both interactive tools function end-to-end; Lighthouse performance/accessibility scores are high given the JS-light Astro-islands approach (this is a stated design goal of the real site — "ships almost no JavaScript by default").
