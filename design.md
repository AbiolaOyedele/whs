# design.md

The design rules for WildHands. This is the authority. Where this document and a
component disagree, the component is wrong.

Read this before touching anything visual. If a rule here blocks something you
need to build, raise it and stop. Do not work around it quietly, and do not
invent a second way of doing a thing that already has one.

Everything below is what the site actually does today, with the reasoning
attached. The reasoning matters more than the number: a value you can justify
survives a redesign, a value you copied does not.

---

## 1. The two surfaces

There are two design systems in this repository. They share every token and both
typefaces, and they differ in density on purpose.

**The marketing site.** Everything a visitor sees. Generous, editorial, slow.
Large display type, wide gutters, unhurried motion. Its job is to be read once
and remembered.

**The working surfaces.** `/admin/*` and `/quote/*`. Dense, quiet, fast. Small
type, tight spacing, no decoration that does not carry information. Its job is
to be used for an hour without tiring anyone.

What they share, and must never diverge on:

- the colour tokens
- the radius ramp
- the two typefaces and their roles
- the 44px tap-target floor
- the writing rules in section 12
- the accessibility floor in section 15

What they may differ on: type size, spacing rhythm, how much motion is used.

`/quote/*` is the seam between them. It is a working document, so it is dense,
but a client reads it, so it carries the brand at full strength. When in doubt
on a quote page, choose the marketing answer.

---

## 2. Tokens

All tokens live in `src/styles/global.css`. Tailwind v4, CSS-first config. There
is no `tailwind.config.js` and there must not be one.

Two blocks matter. `:root` declares the raw values. `@theme inline` republishes
them as Tailwind utilities. **A token added to `:root` and not to `@theme inline`
generates no utility class**, which is how `rounded-2xl` and `rounded-3xl` once
fell through to Tailwind's defaults while everything around them was tokenised.
Add to both, always.

### Colour

| Token                                          | Role                                             |
| ---------------------------------------------- | ------------------------------------------------ |
| `--background` / `--foreground`                | Page ground and ink                              |
| `--primary` / `--primary-foreground`           | The near-black button and its label              |
| `--card` / `--card-foreground`                 | Raised surfaces on the light ground              |
| `--muted` / `--muted-foreground`               | Recessed fills and secondary text                |
| `--border`                                     | Every hairline. Applied to `*` in the base layer |
| `--accent` / `--accent-foreground`             | The lime, and the ink that sits on it            |
| `--destructive` / `--destructive-foreground`   | Errors and destructive actions                   |
| `--surface-dark` / `--surface-dark-foreground` | The near-black bands                             |

Rules:

- **Never write a hex value in a component.** Use the token. The one standing
  exception is decorative gradient stops inside a single visual effect (the hero
  beam, the work-card placeholder), where the colour is part of the artwork
  rather than part of the system.
- `#131314` is `--surface-dark`. Use `bg-surface-dark`, not the hex.
- The accent is editable at runtime through the website editor. Anything derived
  from it must be derived in CSS with `color-mix`, not hard-coded. See
  `src/components/admin/analytics/chart-tokens.ts` for the pattern.
- The lime is a brand colour, not a UI colour. It marks one thing per view: the
  primary action, the current nav item, the selected state. Two limes on a screen
  means neither is the point.
- The lime has a contrast problem and it is not negotiable around it. At
  `oklch(0.92 0.19 128)` it is about 1.3:1 on white. It is a **fill**, never a
  thin mark on a light surface: no lime hairlines, no lime 14px text, no lime
  1px chart lines. Mix it toward `--foreground` when you need a stroke.

### Radius

Four surface steps and one pill. Anything outside these needs a reason in a
comment.

| Token              | Value | Use                                                         |
| ------------------ | ----- | ----------------------------------------------------------- |
| `--radius-xl`      | 12px  | Small surfaces: table shells, banners, form status, inputs  |
| `--radius-2xl`     | 16px  | Cards in a grid                                             |
| `--radius-3xl`     | 24px  | Large panels: CTA bands, work cards, the form card, dialogs |
| `--radius-section` | 32px  | Full-bleed page bands: hero, footer, the dark closing band  |
| `rounded-full`     | pill  | Buttons, chips, avatars, nav items                          |

`--radius-mega` (20px) is the mega-menu panel and is used in exactly one place.

Do not write `rounded-[Npx]`. The two existing arbitrary values in
`Button.astro` are part of the flow interaction (a pill that squares off to 12px
on hover) and are the exception that proves the rule.

### Type

Two families with distinct jobs.

- `--font-display` is **Diagramm**. Headings and display type only.
- `--font-sans` is **IBM Plex Sans**. Body copy, UI labels, forms, buttons,
  everything else. Its larger x-height is why it wins at small sizes.
- `--font-mono` is the system mono stack. Money, counts, dates, codes, anything
  that should align in a column. Always with `tabular-nums` where it stacks.

`--font-weight-display: 500` sets the weight of every display heading in one
place. Change it there, never per-heading. Medium rather than SemiBold because
Diagramm has wide letterforms and the counters start to close at 64px and above.

`h1`–`h4` pick up the display face automatically from the base layer, along with
`text-wrap: balance`. Paragraphs get `text-wrap: pretty`. Neither needs
restating on the element.

### Easing

Four curves, each with one job. Do not invent a fifth.

| Token              | Curve                                  | Job                      |
| ------------------ | -------------------------------------- | ------------------------ |
| `--ease-sweep`     | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Link underline sweep     |
| `--ease-accordion` | `cubic-bezier(0.77, 0, 0.18, 1)`       | Accordion open and close |
| `--ease-mega`      | `cubic-bezier(0.22, 1, 0.36, 1)`       | Mega-menu panel          |
| `--ease-standard`  | `cubic-bezier(0.4, 0, 0.2, 1)`         | Everything else          |

### Spacing

Tailwind's `--spacing: 0.25rem` scale. Section rhythm is `.wh-section`
(40px mobile, 80px from `lg`) so the gap between every major section is set in
one place. Do not hand-set `my-20` on a section.

---

## 3. The type scale

Every heading uses one of these classes. **Do not write a one-off `text-[clamp()]`
on a heading.** Four different H2 sizes once ran across the site, and on the home
page the H2 rendered smaller than the H3s inside it, so a reader scanning by size
read the subordinate items as the section headings.

| Class            | Mobile                        | Desktop                    | Use                                                       |
| ---------------- | ----------------------------- | -------------------------- | --------------------------------------------------------- |
| `.wh-h1`         | `clamp(2.5rem, 11vw, 4.5rem)` | `clamp(4.5rem, 5vw, 6rem)` | The home hero headline. One per site                      |
| `.wh-h1-page`    | 2.25rem                       | 4.5rem                     | Inner-page titles. Full sentences, so smaller and tighter |
| `.wh-h2-display` | `clamp(2rem, 4vw, 3.25rem)`   | same                       | Statement section headings that carry a sentence          |
| `.wh-h2`         | 1.875rem                      | 2rem                       | Ordinary section headings                                 |
| `.wh-h3`         | 1.25rem                       | same                       | Card titles, sub-headings                                 |
| `.wh-h1-compact` | 1.5rem                        | 1.75rem                    | Page title on a working surface                           |
| `.wh-lede`       | 1.25rem                       | 1.5rem                     | Hero standfirst. Capped at 35rem                          |

The rule the scale exists to enforce: **every heading level must render larger
than every heading level below it, on every viewport.** Check this whenever you
add a heading. It is the defect that keeps coming back.

On a working surface the ladder is `.wh-h1-compact` for the page title, then
`font-display text-xl` for a panel title, then `font-display text-lg` for a
sub-heading. A `.wh-h3` page title with `text-xl` panel titles under it is flat
and reads as a list of equals.

Body copy is `text-base` (16px). `text-lg` for a lede or a document paragraph.
`text-sm` for secondary and helper text. **`text-xs` (12px) is for eyebrow labels
in uppercase with wide tracking, and for nothing else.** It is not a size to
reach for when something does not fit.

---

## 4. Layout

### The container

`.wh-container` is the one horizontal grid. Every page-level element sits on it,
so the left edge of the header, the hero, every section and the footer is the
same line at every breakpoint.

It steps rather than using a flat max-width: 40rem, 48rem, 64rem, 80rem, 96rem,
topping out at 104rem (1664px). Gutters are 20px, rising to 32px from `lg`.

**Do not indent a section by a percentage.** A hero at `10.35%` and a container
at a fixed gutter produce three different left edges on the same page, which is
what the site looked like before it was fixed.

Working surfaces use `mx-auto max-w-6xl` with the same 20px/32px gutters. That is
a deliberate second container for documents, not a licence for a third.

### Grids

- Featured work: an asymmetric 12-column rhythm. Cards 1, 4, 5 span 7; cards
  2, 3, 6 span 5. The alternation is what makes it read as editorial rather than
  as a card wall. Set once in `.wh-projects-grid`, shared by the home page and
  the work index.
- Row gap is deliberately much larger than column gap (7.5rem against 1rem).
  Each card carries a caption underneath, and without the separation a caption
  reads as a heading for the row below.
- Anything that must sit at the same height and be compared side by side (the
  quote packages, pricing cards) is a **grid**, never cards that size to their
  own content.

### Order

When mobile and desktop want different reading orders, place by explicit grid
coordinates (`lg:col-start-2 lg:row-start-1`), not by duplicating markup and
hiding one copy. Two copies drift and both get announced to screen readers.

---

## 5. Buttons

The site has exactly one primary interaction, and it is not subtle.

`Button.astro` (`primary`, `accent`, `outline`) is the **flow button**. On hover
the pill squares off to a 12px radius over 600ms, a circle expands from the
centre to flood the surface, and a pair of arrows slides across. It is pure CSS
`group-hover`, so it ships no JavaScript. `flow-button.tsx` is the React twin for
use inside islands and must stay behaviourally identical.

`ghost` and `link` stay plain. The flow treatment reads as a call to action and
is noise on an inline text link.

Rules:

- **Every call to action on the marketing site uses the flow button.** A pill
  with a colour swap is not the same thing and does not belong next to one.
- **Never fade a button on hover.** `hover:opacity-90` dims the label along with
  the fill, which lowers contrast at exactly the moment the user is committing to
  the action. Change the colour instead. This applies everywhere, admin included.
- Turn arrows off (`arrows={false}`) on wide buttons, where they travel far
  enough from the label to read as unrelated.
- Sizes are `sm` (44px), `md` (48px), `lg` (56px). Nothing shorter than 44px.
- A working-surface button is `min-h-11 rounded-full px-5 text-base` with a
  colour transition. Four tones only, defined in `src/components/admin/ui.tsx`:
  `primary`, `secondary`, `ghost`, `danger`. Import them. Do not hand-roll a
  fifth inline.

---

## 6. Forms and controls

- **No native `<select>`, ever.** A native select renders its popup through the
  operating system, so it ignores every token on the page and arrives as a grey
  system menu. Use `SelectField.tsx` (uncontrolled, public forms),
  `FilterSelect.astro` (zero-JS facets) or `admin/Select.tsx` (controlled).
  Replacing it means owning the keyboard behaviour it gives away free: arrows,
  Home/End, Enter/Space, Escape, Tab, click-outside, focus return, typeahead.
- **No `window.confirm`, `window.alert` or `window.prompt`.** Use
  `ConfirmDialog.tsx`. A native confirm is drawn by browser chrome, cannot say
  more than a line, and on some platforms offers a checkbox that silently
  disables every future guard.
- A checkbox or radio is a real `<input>`, visually replaced rather than removed,
  with the `<label>` as the hit target. That is what makes a 20px box clear 44px.
- Mark the **optional** fields, not the required ones. Required is carried by the
  control's own attribute, and a form where nearly everything is required reads
  as a wall of asterisks.
- Every data-driven component handles three states: loading, empty and error.
  Empty means a sentence explaining what would appear here, never a blank panel.
- Error messages are plain English with a next action. No codes, no jargon, and
  never "something went wrong".

---

## 7. Icons

**Inline SVG, always. No icon library, and no text glyphs.**

No icon package is installed and none should be. `lucide-react` was added once
for a single arrow and took every form on the site down with it, because Vite had
never pre-bundled it and the dynamic import 404'd, so the islands never hydrated
and the selects looked clickable and did nothing.

Text glyphs (`▾`, `✓`, `←`, `→`) are not icons. They resolve through the font
stack, so they render at a different size, weight and baseline on every platform,
and they fall out of the brand faces entirely. Use an SVG path.

The set lives in `src/components/ui/icon-paths.ts`, with two wrappers drawing
from it so they cannot disagree: `Icon.astro` for templates and `icons.tsx` for
React islands. Add a path there rather than inlining a new one.

House icon spec: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`,
`stroke-width="1.8"` to `2`, round caps and joins, `aria-hidden="true"`, sized
with `size-4` or `size-5`. Icons are decorative by default: an icon beside its
own label has nothing to add for a screen reader, and announcing it twice is
worse than not at all. Pass `label` only when the icon carries meaning alone.

`×` as a multiplication sign in `3 × £400` is typography, not an icon. That one
stays.

---

## 8. Motion

### How a page opens

There is no client-side router and no view transitions. Every navigation is a
full document load, and that is deliberate: the content pages ship zero framework
JavaScript, and a router would put a hydration cost on all of them to animate
something nobody asked for. **Do not add `ClientRouter` or `astro:transitions`.**

So a page "opens" like this:

1. The document paints. The hero headline is already visible in the HTML and is
   never faded in: it is usually the LCP element, and fading it in delays LCP for
   a decorative effect.
2. `AnimatedText` marks everything below the fold as hidden **only once its
   script has run**. A crawler, a no-JS visitor or a failed script all see fully
   visible text. The hidden start state is applied by JavaScript, never by CSS
   alone. This is the rule: **nothing important may be invisible in the static
   HTML.**
3. As each block scrolls into view (IntersectionObserver, 10% threshold, `-10%`
   bottom margin) its lines rise 16px and fade in over 500ms, staggered 80ms per
   line.

Content is revealed once and stays revealed. Nothing re-animates on scroll back.

### Hover

- Links: the 1px underline sweep, growing from 0% to 100% over 300ms on
  `--ease-sweep`. The animated layer is a child `<span>` so the sweep tracks the
  text box rather than the padded 44px tap target.
- Buttons: the flow interaction. Never opacity.
- Cards: border moves from `--border` to `--foreground`. Optionally a `1.03`
  scale on the image inside, never on the card itself.
- The services list dims its siblings to 0.4 on hover, and only under
  `@media (hover: hover)`.

### Rules

- **Nothing may depend on hover alone.** Every hover affordance has a focus and a
  touch equivalent. Captions are visible, not revealed: most clients read a quote
  on a phone, where a hover caption simply does not exist.
- Animate `transform` and `opacity`. Not `width`, `height`, `top` or `left`.
  The flow button's flood is a `scale` on a percentage-sized circle for exactly
  this reason.
- Under `prefers-reduced-motion: reduce` every animation and transition drops to
  0.01ms globally, smooth scrolling is off, and the marquee stops and wraps
  instead of translating. Decorative motion is removed; state changes still
  happen instantly.

---

## 9. The navbar

`src/components/layout/SiteHeader.astro`. This is the spec.

### Position and chrome

- **Fixed**, not sticky, not absolute. Pages run to several thousand pixels and
  the nav must be reachable from anywhere. Every hero pads itself clear of the
  header height, so taking it out of flow costs nothing.
- Height 80px, rising to 112px from `lg`.
- Behind it sits a **progressive blur**: five stacked `backdrop-filter` layers in
  a 10rem band, each blurring a little more and masked to a different slice, so
  the blur ramps out smoothly instead of ending on a hard edge. It is a child of
  the header so the two travel together. Fixed inside an absolute header it once
  stayed welded to the viewport after the nav had scrolled away, leaving a
  blurred band over the page with no nav in it.
- The whole stack scales in over the first 120px of scroll, driven by
  `--progressive-header-scale`, set on `:root` in a `requestAnimationFrame` from
  a passive scroll listener.
- Over a dark hero the chrome is white. Once the hero's bottom edge passes the
  header it flips to `--foreground`. Attribute-driven (`data-scrolled`), so there
  is no per-frame style thrash.

### Desktop, from `lg`

- Work, Services and Stack open mega menus. About and Insights are plain links.
- **A mega-menu trigger is a real link to the section index.** Clicking "Work"
  goes to `/work`. The panel is a shortcut into the section, never the only way
  in, and the destination stays crawlable. Each panel also carries its own index
  link ("All work", "All services").
- Opens on `pointerenter` **only where `(hover: hover)` matches**, and on click
  everywhere. Closes on a 120ms delay after `pointerleave`, on `focusout` to
  anything outside the item, on Escape (returning focus to the trigger), and on a
  pointerdown outside.
- One panel at a time. Opening one closes the other.
- The panel is `hidden` until opened, unhidden for one frame with the transition
  suppressed so it never flashes, then transitioned in on `--ease-mega`. On close
  it is re-hidden 350ms later, after the fade, so it leaves the accessibility
  tree only once it has actually gone.
- The panel is a dark surface at 92% opacity with `--radius-mega` corners. Its
  width is derived from the column count with a 30rem floor, so a two-column menu
  is not a wide panel with a hole in it.
- The index link is attached to the **last surviving column** after empty columns
  are filtered out. Pinned to a fixed index it was filtered away with its column,
  and the panel shipped with no link to `/work` at all.

### Mobile, below `lg`

- Logo mark on the left, a "Talk to us" pill from `sm`, and a three-bar toggle.
- The toggle is 44x44 and morphs into an X: the middle bar fades, the outer two
  translate 7px and rotate to 45 and -45 degrees over 300ms.
- The panel drops from the bottom edge of the header, full width, near-black at
  92% with a 24px backdrop blur. It fades and translates 2px over 300ms.
- Body scroll is locked while it is open.
- `visibility` is delayed by 300ms on close so the fade completes, and not
  delayed on open so it is interactive immediately.
- It closes on Escape and when the viewport grows past `lg`.
- Rows are `wh-tap` (44px) with hairline dividers. Two full-width buttons sit
  underneath, not squeezed into the row list.

### Never

- A hamburger on desktop.
- A nav item that is a button with no `href` and no destination.
- A mega menu that opens on hover on a touch device.
- A menu that hides the section you are currently in.

---

## 10. The footer

Dark surface, `rounded-t-section`, with the animated gradient behind a scrim.
The scrim is not decoration: it is what keeps the column headings at a stable
measured contrast while the gradient moves underneath them. It runs 0.80 to 0.94
top to bottom. Do not lower it.

Footer links use the sweep and `.wh-footer-link`, which is a 32px target for a
mouse and a full 44x44 under `@media (pointer: coarse)`. Ten 14px links each in a
44px box stacked to a 480px column of small type floating in space, which is why
the target is relaxed for pointers and kept for fingers.

---

## 11. Dark surfaces

Three bands are near-black: the hero, the closing CTA, the footer. On them:

- Body text is `text-white/70` to `text-white/85`. Never pure white for long
  copy, never below 70% for anything a user must read.
- Borders are `border-white/10` to `border-white/30`.
- The outline button takes `onDark`, which flips it to a white border and floods
  white on hover.
- **Never `mix-blend-difference` on text.** It puts the rendered colour beyond the
  reach of any contrast check, so nobody can tell you whether it passes.

---

## 12. Writing

The copy is part of the design. These rules are not stylistic preferences.

- **No em dashes. No en dashes.** Not in headings, body copy, buttons, form
  labels, hints, error messages, email subjects, PDF metadata, page titles, or
  anything else a person reads. Rewrite the sentence, or use a colon, a comma,
  brackets, or a full stop. A dash is almost always a sentence that has not been
  decided yet. For a range, write "10 to 12 January". For an empty table cell,
  write the word, or leave it blank.
  - The one exception is `×` as a multiplication sign in a quantity.
  - This applies to product surfaces. Internal documentation may use them.
- Sentence case for headings and buttons. Not Title Case, not ALL CAPS except in
  a `text-xs` tracked eyebrow label.
- Plain English, second person, contractions where they read naturally.
- No jargon in anything user-facing. No error codes, no stack traces, no
  "something went wrong". Say what happened and what to do.
- Placeholder copy is marked with a `TODO:` comment. Never shipped silently.

### Comments are not copy

An `<!-- -->` comment in an Astro **template** is shipped to the browser and is
readable in view-source. Design rationale, notes on what was wrong before, and
anything else written for the next developer belongs in a comment the build
strips: `{/* ... */}` in the template, or `/* ... */` in the frontmatter. Forty-six
of these once shipped on the marketing site, including sentences describing the
site's own past layout mistakes. Reserve `<!-- -->` for something a visitor is
meant to be able to read, which is almost never.

---

## 13. Responsive

Mobile-first, always. Start at the smallest viewport and scale up. Never
desktop-first with mobile patched on.

**Verify at 375px, 768px and 1280px before calling any UI work done.** This is a
gate, not an afterthought.

- No horizontal scroll at any breakpoint. `body` carries `overflow-x: hidden` as
  a backstop, not as a licence to overflow.
- Every interactive control clears 44x44. `.wh-tap` exists for this.
- Text stays legible without zoom.
- Content wraps and reflows. No fixed widths that break a narrow screen, no
  clipped text.
- Wide content (tables, code blocks, wide diagrams) scrolls inside its own
  `overflow-x: auto` container. The page body never scrolls sideways.
- A table with more than three columns becomes stacked rows below `sm`. A
  six-column table at 375px is unreadable however it is scrolled.
- Test touch as well as pointer. `@media (hover: hover)` guards every
  hover-driven behaviour.
- If a change cannot be made responsive cleanly, flag it and stop.

---

## 14. Numbers and money

- Money is stored and computed in integer minor units. It is never a float.
- Money, counts, dates and codes are set in `--font-mono` with `tabular-nums`.
- A figure that can grow by orders of magnitude steps its own size down. A
  seven-figure naira total at `text-3xl` runs past the edge of the card that
  holds it, so the card checks the magnitude and drops to `text-xl`.
- Percentages, currency and dates are formatted through `Intl`, never by hand.

---

## 15. Accessibility

The floor, not the ceiling.

- `:focus-visible` is a 2px `--ring` outline at 2px offset, globally. Never
  remove it. `outline-none` is only ever acceptable alongside a replacement
  `focus-visible:` treatment on the same element.
- Semantic elements first. A `<button>` for an action, an `<a href>` for a
  destination. Do not put a click handler on a `<div>`.
- Never nest a button inside a button. It is invalid, and every browser resolves
  it by dropping one of them, usually the one you needed. Row controls sit
  outside the disclosure button, not inside it.
- A disclosure that holds form controls **unmounts** its body when closed. A
  hidden-but-present control is still focusable, still submitted, and still
  counted by assistive tech.
- Every modal traps focus, closes on Escape, returns focus to whatever opened it,
  and locks body scroll. `BentoGallery` and `ConfirmDialog` are the reference
  implementations.
- Selection state is never carried by colour alone. Mark it at least twice:
  `aria-selected` plus a weight change, a dot, or a border.
- Status that changes without a navigation is announced (`role="status"`,
  `aria-live="polite"`). Errors use `role="alert"`.
- Every page has a skip link and one `<main>`.
- Images carry real alt text. Decorative elements carry `aria-hidden="true"`.

---

## 16. Banned

Non-negotiable, no exceptions, do not propose them.

1. **Status badge / availability pill / live indicator chip.** The rounded pill
   with a pulsing dot and a short label ("Open to work", "Available"). Do not
   build it, do not suggest it.
2. **Native `<select>`, `confirm`, `alert`, `prompt`.**
3. **Icon libraries.** Inline SVG only.
4. **Em dashes and en dashes in product copy.**
5. **`hover:opacity-*` on a button.**
6. **`mix-blend-difference` on text.**
7. **A client-side router or view transitions.**
8. **`tailwind.config.js`.**
9. **Percentage-based page indents.** Use `.wh-container`.
10. **Hover-only affordances.**

---

## 17. Definition of done

A visual change is not finished until all of this is true.

- [ ] Rendered at 375px, 768px and 1280px. No horizontal scroll at any of them.
- [ ] Every interactive target clears 44x44.
- [ ] Every heading uses a scale class, and each level is larger than the level
      below it at every breakpoint.
- [ ] Colours come from tokens. No new hex values.
- [ ] Radii come from the ramp.
- [ ] Icons are inline SVG. No text glyphs.
- [ ] Buttons use the flow component or the four admin tones. No opacity hovers.
- [ ] Loading, empty and error states all exist and all say something useful.
- [ ] Focus is visible on everything focusable, and tab order is sane.
- [ ] Motion is `transform` and `opacity`, and it is gone under
      `prefers-reduced-motion`.
- [ ] No em dashes anywhere a person will read.
- [ ] Nothing important is invisible in the static HTML.
- [ ] `npm run lint`, `npm run typecheck` and `npm test` all pass.
