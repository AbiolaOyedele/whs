# Product

## Register

brand

Site-wide default. WildHands is primarily a marketing and lead-generation site (52 public pages, structurally complete). The admin panel (`/admin/*`) and client quote pages (`/quote/*`) are product-register working surfaces layered on top — see `design.md` section 1, "The two surfaces". Any task scoped to `/admin` or the admin-facing parts of `/quote` should treat the surface in focus as **product** (dense, predictable, fast to use for an hour), not brand, regardless of this file's default.

## Users

- **Marketing site visitors**: prospective clients evaluating WildHands, arriving via search, AI answer engines, or referral. Read once, remembered — the site's job is to build confidence and generate a quote request.
- **Admin panel users**: WildHands staff running the business day to day — creating quotes, managing invoices, applying templates. Internal, expert users doing repetitive operational work at a desk, likely for extended sessions.
- **Quote page recipients**: clients reading and paying a quote WildHands sent them. A working document that still needs to carry the brand at full strength, since a client reads it.

## Product Purpose

Generate and convert leads for WildHands (a services business) through a static-first, SEO/AEO-optimized marketing site, and give staff an internal tool (`/admin`) to produce quotes, invoices, and templates without waiting on a database for the public site's uptime.

## Brand Personality

Confident, plain-spoken, precise. No jargon, no hedging ("something went wrong" is banned), sentence case not marketing-caps. The writing rules (design.md section 12) are the clearest signal: second person, contractions where natural, no em dashes anywhere user-facing. The admin surface trades warmth for speed and quiet density — "no decoration that does not carry information."

## Anti-references

Per design.md's banned list (section 16) and writing rules: no gradient-text, no decorative badges/status pills, no stock-photo warmth, no hedge-y support-ticket tone in copy, no em dashes, no ALL CAPS outside a tracked eyebrow label. The admin panel should never borrow marketing-site generosity (large display type, slow motion, wide gutters) — that reads as unfinished internal tooling, not polish.

## Design Principles

1. Two surfaces, one system: marketing and admin/quote share every token, both typefaces, the 44px tap-target floor, and the accessibility floor — they diverge only on density, type size, and motion.
2. Consistency is an affordance on product surfaces: predictable grids, familiar patterns, no fluid/asymmetric flourishes that belong to the marketing register.
3. Mobile-first, always, with 375/768/1280px as a hard verification gate, not an afterthought — no horizontal scroll, no fixed widths that break narrow screens.
4. Space and weight communicate hierarchy before color or decoration does.
5. If a change cannot be made responsive cleanly, flag it and stop rather than shipping a desktop-only screen.

## Accessibility & Inclusion

WCAG floor as documented in design.md section 15: global 2px `focus-visible` ring, semantic elements only (no click handlers on divs, no nested buttons), modals trap focus/close on Escape/return focus/lock scroll, selection state never carried by color alone, live-region announcements for async status changes, skip link and one `<main>` per page, real alt text on images.
