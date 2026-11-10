# WildHands website: complete site copy

This file holds every piece of text on the public WildHands marketing website (the v2 site), page by page, so the copy can be rewritten in one pass. It was generated on 10 November 2026 from the site source (`src/v2/content`, `src/content`, the v2 components) and from the server-rendered HTML of every public page on the local dev server. The copy is verbatim: nothing here has been rewritten, summarised or corrected, including any existing mistakes, dashes or Title Case headings.

## Rewrite constraints (read before changing anything)

- **Brand name:** always "WildHands" (one word, capital W and H). The studio byline on articles and case studies is "WildHands Studio". Do not add any person's name.
- **What WildHands is:** a Lagos-based studio building custom websites, web apps and internal tools for businesses in Nigeria and across Africa. Keep that positioning.
- **Facts are fixed.** Do not change numbers, prices, timelines, percentages, product names, client and case-study names, case-study facts and results, email addresses, phone numbers or URLs. Prices in naira are facts: Starter ₦150,000, Standard ₦250,000, half (₦75,000 / ₦125,000) paid to start, live in 72 hours after design approval, design approved within 24 hours, 2 rounds of edits on Starter and 3 on Standard, Standard up to 4 pages, apps and tools quoted after a discovery call.
- **Legal pages** (Privacy Policy, Terms of Service) can be tidied for tone, but their meaning, retention periods, processors, lawful bases and rights must not change.
- **Writing rules (from design.md section 12, which are rules, not preferences):**
  - No em dashes and no en dashes anywhere a person reads: headings, body, buttons, labels, hints, error messages, page titles, meta descriptions. Rewrite the sentence, or use a colon, comma, brackets or a full stop. For ranges write "10 to 12 January". The only exception is "×" as a multiplication sign in a quantity (for example "~3×").
  - Sentence case for headings and buttons. Not Title Case, not ALL CAPS.
  - Plain English, second person ("you"), contractions where they read naturally.
  - No jargon in anything user-facing. Error messages say what happened and what to do: no error codes, no "something went wrong".
- **Site-wide UI rules that affect copy:** no eyebrows, kickers or overlines (small labels above a heading); let each heading stand alone. Write headings and paragraphs that will not leave a single orphaned word on the last line. No "status pill" or availability badges.
- Keep each heading roughly the same length as it is now so layouts do not break. Hero titles, card titles, button labels and tab labels are the most length-sensitive.

## How to read this file

- Each `##` section is one page: its URL, meta title (the browser tab and search result title) and meta description (the search result snippet), then its text in reading order.
- `**H1:**` is the page's main heading. `###`, `####` and so on are the page's own section and card headings (one level below the page heading level they have in the HTML).
- `Button: label → /link` and `Link: label → /link` are clickable labels. `[Button: …] [Button: …]` on one line means a row of buttons. `Card link → /link` is a whole card that is clickable.
- `(screen-reader label: "…")` and "visually hidden heading" mark text that is not shown on screen but is read aloud by screen readers and indexed by search engines.
- `(visual: …)` and "Visual only, hidden from screen readers" mark decorative text people see but screen readers skip (animations, numbering, map labels).
- `_[Hidden on phones…]_` and `_[Phones only:]_` mark text that only appears at some screen sizes.
- `Image alt: "…"` is image alternative text. `field:` lines describe form inputs (name, placeholder, limits). `select` lines list dropdown options.
- `**FAQ, Q:**` / `**A:**` are question and answer pairs. On service pages and articles they are also published as FAQ structured data for search engines, word for word.
- Repeated blocks (header, footer, cookie banner, form messages, the "More we build" list, the case-study closing call to action) appear once below under "Global chrome" and "Shared blocks", and pages refer to them by name.

---

# Global chrome (on every page)

## Header (desktop and tablet)

- Logo link → `/` (aria-label: "WildHands home")
- Main navigation (aria-label: "Main"):
  - Button: Services (opens a dropdown)
    - Link: Websites → /use-cases/websites
    - Link: Apps → /use-cases/apps
    - Link: Tools & Systems → /use-cases/tools-and-systems
    - Button: See our work → /resources
  - Link: Work → /resources
  - Link: About → /about
  - Link: Insights → /blog
  - Icon button with screen-reader label "Open menu" (opens a small dropdown):
    - Link: Request a quote → /request-a-quote
    - Link: Get in touch → /contact
- Header buttons (hidden on phones): Button: Request a quote → /request-a-quote; Button: Get in touch → /contact

## Header and menu (phones)

- Button: Get in touch → /contact
- Button: Menu (reads "Close" while the menu is open)
- Mobile menu panel:
  - Services (accordion) → Websites, Apps, Tools & Systems, then Button: See our work → /resources
  - Link: Work → /resources
  - Link: About → /about
  - Link: Insights → /blog
  - Link: Get in touch → /contact
  - Buttons: Request a quote → /request-a-quote; See our work → /resources; Get in touch → /contact (the last only on very narrow phones, under 400px)

## Footer

### Services
- Link: Websites → /use-cases/websites
- Link: Apps → /use-cases/apps
- Link: Tools & Systems → /use-cases/tools-and-systems

### WildHands
- Link: Work → /resources
- Link: Insights → /blog
- Link: About us → /about
- Link: Careers → /careers
- Link: Freelance Hub → /freelance-hub
- Link: Request a quote → /request-a-quote
- Link: Get in touch → /contact

### Closing call to action
Tell us what is eating your hours. We will show you what a system built for it looks like.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

### Legal row
- Link: Brand assets → /brand-assets
- Link: Privacy policy → /privacy
- Link: Terms of service → /terms-of-service
- Button: Cookie preferences (reopens the cookie banner)
- 2026 © WildHands

## Cookie banner

Appears at the bottom of the screen on a first visit, and again from "Cookie preferences" in the footer.

**Heading:** Cookies on this site

We use the cookies the site needs to work. Analytics only run if you accept them. More in our [Link: Privacy Policy → /privacy].

[Button: Accept] [Button: Reject]

## Announcement banner

None on the site at the moment.

## Site-wide structured data (read by search engines, not shown)

- Organization: name "WildHands", description "WildHands builds custom websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa. Built around how you actually work, not a template.", email hello@whstd.com.
- WebSite: name "WildHands".
- On service and location pages, a LocalBusiness: WildHands, Lagos, Nigeria, email hello@whstd.com, phones +2347038553563 and +2348129796927, areas served Lagos, Nigeria, Africa.
- Articles carry Article structured data (headline = article title, description = meta description, author and publisher "WildHands Studio") and a breadcrumb: Home → Insights → category → article. Service pages carry a breadcrumb: Home → service (→ place).

---

# Shared blocks

## Shared block: forms (labels, placeholders, hints, messages)

Every form uses these exact strings. Required fields show a visual `*` and are announced as "(required)" to screen readers. Each form also has a hidden anti-spam field labelled "Company fax" that people never see.

### Field labels and placeholders
| Field | Label | Placeholder or hint |
| --- | --- | --- |
| First name | First name | Your first name |
| Last name | Last name | Your last name |
| Work email (contact, quote) | Work email | you@company.com |
| Email (job, freelance) | Email | you@example.com |
| Phone | Phone (optional) | With your country code |
| Company | Company (optional) | If you're representing one |
| Contact message | Tell us about your project | What is taking up your team’s time? |
| Referral | How did you hear about us? (optional) | Choose one |
| Project type | What are you building? | Choose what fits closest |
| Project summary | Tell us about it | Placeholder: What you're trying to build, who it's for, and anything about it that already exists. Hint: A sentence or two is enough. The more you can say now, the tighter the quote. |
| Budget | Budget (optional) | A range, a ceiling, or "no idea yet" |
| Timeline | Timeline (optional) | For example ready to start now, launch by December |
| LinkedIn (freelance) | LinkedIn URL | https://www.linkedin.com/in/you |
| LinkedIn (job) | LinkedIn URL (optional) | https://www.linkedin.com/in/you |
| Portfolio | Portfolio or GitHub URL | https:// |
| CV (freelance) | CV | Hint: PDF, DOC or DOCX, up to 3.5MB. |
| CV (job) | CV (optional) | Hint: PDF, DOC or DOCX, up to 3.5MB. |
| Cover note | Anything you want us to know (optional) | A line or two is plenty |
| Country | Country of residence | Choose a country |
| Tax country | Country of tax residence | Choose a country |
| Position | Position | Choose a position |
| Availability | Availability | Choose your availability |
| Hours | Hours per month | Choose your hours |
| Long-term | Interested in long-term work? | Choose an answer |
| Newsletter email | Email address | you@company.com |

File picker: button "Choose file" (reads "Change file" once a file is attached), status "No file chosen".

### Checkbox wording
- I agree to WildHands processing my data for this application.
- I can invoice as a registered business (B2B).
- Keep my details for future opportunities. (optional)

### Dropdown options (custom on-brand dropdowns)
- How did you hear about us?: Search / A referral / An article / Instagram / Somewhere else
- What are you building?: A website / An online store / A web app or platform / An internal tool or dashboard / A redesign of something we already have / Something else
- Country of residence and Country of tax residence: United Kingdom / Ireland / Poland / Germany / Spain / Portugal / Netherlands / France / Italy / United States / Canada / Nigeria / South Africa / India / Australia / Other
- Position: Frontend Developer / Web Designer / Webflow Developer / Talent Pool
- Availability: Immediately / Within 2 weeks / Within a month / Just exploring
- Hours per month: Up to 40 / 40-80 / 80-120 / 120+
- Interested in long-term work?: Yes / No

### Under the submit button
Read how we handle your details in our [Link: privacy policy → /privacy].

While sending, the submit button reads: Sending

### Field error messages (shown under a field)
- Enter your first name.
- Enter your last name.
- Enter your email address.
- Enter an email address like you@company.com.
- Enter a phone number with 10 to 15 digits, or leave it blank.
- Tell us a little about your project so we know how to help.
- Keep this under {limit} characters. (limit shown as 80, 200, 5,000, 4,000, 120 or 500 depending on the field)
- Choose what you are building.
- Tell us a little more: two or three sentences is enough.
- Enter your LinkedIn profile address, starting with https://
- Enter a full LinkedIn address starting with https://, or leave it blank.
- Enter a link to your portfolio or GitHub, starting with https://
- Attach your CV.
- That file is larger than 3.5MB. Attach a smaller one.
- Attach your CV as a PDF, DOC or DOCX file.
- Choose your country of residence.
- Choose your country of tax residence.
- Choose the position you are applying for.
- Choose when you could start.
- Choose how many hours a month you could give.
- Tell us whether you are interested in long-term work.
- Tick this box so we can process your application.
- Tick this box to confirm you can invoice as a business.

### Form-level error notice (above the submit button)
**That did not send.** {message} If it keeps happening, email hello@whstd.com.

{message} is one of:
- We could not reach our server. Check your connection and try again.
- Your message did not go through. Please try again, or email us instead.
- or a message from the server's own checks, which can be: Enter a valid email address so we can reply. / Enter a valid email address. / Enter a valid work email address. / Enter a valid LinkedIn URL. / Enter a valid portfolio or GitHub URL. / Pick what you are building / Tell us a little about the project — two or three sentences is enough. / That is longer than we need — trim it to a paragraph or two. / Please accept the data processing terms. / Please confirm you can invoice as a business. / We could not read that submission. / This submission could not be accepted. / Please check the form and try again. (Note: two of these server messages contain em dashes.)

### Success states (the form is replaced by this)
| Form | Title | Message | Button |
| --- | --- | --- | --- |
| Get in touch (/contact) | Message sent | Thanks, your message is with us. We will reply shortly. | Send another message |
| Request a quote | Request sent | Thanks. We have your request and will reply within a working day. | Back to WildHands → / |
| Job application | Application received | Thanks for taking the time. We read every application ourselves and reply either way, usually within a week. | Other open roles → /careers; Read our writing → /blog |
| Freelance application | Application received | Application received. We will be in touch. | Back to WildHands → / |
| Freelance newsletter | **You are on the list.** | You are on the list. Thanks for subscribing. | (none) |

### Contact form, AI assistant paste
If a visitor pastes a brief drafted by an AI assistant (see /agent/prompt.md at the end of this file), the contact form fills itself and shows: We filled the form in from your assistant’s draft. Check it over, then send it.

### Email sent to someone who requests a quote
Subject line: We got your request

## Shared block: More we build

At the foot of every "What we build" page, a navigation list (aria-label "More we build") headed **More we build**, listing the other eleven capability pages by name: Marketing sites, Full custom builds, CMS admin panel, Search and AI visibility, Simple website analytics, Quotes and invoices, Client management dashboard, Custom web apps, Internal-facing tools, Live dashboards, Workflow automation, Connecting the tools you use.

## Shared block: Case study closing call to action

At the end of every case study:

### Got a job like this one?

Tell us where it hurts and we will tell you what we would do about it.

Button: Talk to us → /contact

_[Hidden on phones:]_ Button: See all work → /resources

## Shared block: article and case-study header

Each article and case study opens with its title (H1), a short date (for example "7 Sept 2026"), its category tag links (articles only) and the byline "WildHands Studio". Articles end with Button: See all posts → /blog (hidden on phones) and a "Related posts" row (Button: See all → /blog) of three article cards. Case studies end with Button: See all work → /resources and a "More work" row (Button: See all → /resources) of three case-study cards. Cards show a title, a long date (for example "8 November 2026") and category tags, and the whole card is a link whose screen-reader label is the title.

## Shared block: carousels and sliders

Carousel arrow buttons are icons with screen-reader labels: "Previous slide" / "Next slide" (service pages), "Previous project" / "Next project" (home page "Recent work"). Each slide is announced as "1 of 9", "2 of 9" and so on. Pagination on index pages: screen-reader labels "Previous page", "Next page" and "Page 1", "Page 2".

---

# Pages

---

# Home

## Home

URL: `/`  
Meta title: WildHands | Website & Web App Development in Lagos, Nigeria  
Meta description: WildHands builds custom websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa. Built around how you actually work, not a template.

Note: the "Why WildHands" cards (from "Why WildHands" down to "You own all of it, and you meet who builds it.") are being redesigned while this file was made. Their text below was captured from the live page at the end of the run.

Hero interaction: on desktop the cursor shows "Click and hold"; while the hero is held, the words "Websites", "Apps" and "Tools" flicker in, in that order.

_(Visual only, hidden from screen readers:)_

Websites

Apps

Tools

_(end visual only)_

(visual: Click and hold)

**H1:** Custom solutions that give you your time back.

A Lagos-based studio building custom websites, web apps and internal tools for teams done doing repetitive work by hand. We work with businesses across Nigeria and the wider African market.

Button: Talk to Us → /contact

Button: See Our Work → /resources

_[Hidden on phones, shown from tablet width up:]_

Websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa.

Built around how you work, not a template

_[end hidden on phones]_

### Why WildHands _(visually hidden heading, read by screen readers and search engines)_

_[Phones only:]_

Built around how you work, not a template

_[end phones only]_

_[Hidden on phones, shown from tablet width up:]_

- Link: Priced up front → #priced-up-front
- Link: Design first → #design-first
- Link: Built from scratch → #built-from-scratch
- Link: Yours to keep → #yours-to-keep

_[end hidden on phones]_

Standard website

Written proposal, agreed before work starts

In scope

- Up to 4 pages
- Admin dashboard to edit text, images and prices
- Analytics in plain English
- Copywriting from a 15-minute call
- 3 rounds of edits

Out of scope

- Pages past 4, quoted separately

Term: Fixed price

Definition: ₦250,000

Term: Half to start

Definition: ₦125,000

#### One price, agreed before any work starts.

Every project starts with a written proposal: what is in scope, what is out, and one price worked out from it. Websites are a fixed ₦150,000 or ₦250,000, with half to start. If the scope changes, the change is written and priced before work starts on it.

Button: See the prices → /pricing

(screen-reader text: "72 hours from approved design to a live site.") (visual: 72 | hours) (visual: from approved design to a live site)

1. You approve the design

2. We build it

3. Live on your domain

#### You approve the design before any code is written.

You see the design and sign it off within 24 hours. Starter and Standard websites go live 72 hours after that, with 2 or 3 rounds of edits included. Apps and internal tools are quoted after a discovery call.

Image alt: "Tomori logo"

- E-commerce | A phone-first shop for hand-dyed clothes

Image alt: "Rayo logo"

- Business tools | Quotes your client accepts on the page

Image alt: "The Ruff Agency logo"

- Agency operations | Clients, contracts and invoices in one workspace

#### Built around your business, never a theme.

The structure, the content and the screens are designed for what your business actually does, which is why a clothes shop, a quoting tool and an agency workspace come out nothing alike. Accessibility is checked in CI as we build, not audited once at the end.

Button: See our work → /resources

- The site | Yours
- The domain | Yours
- The code | Yours
- Everything on it | Yours

Built by the people in your pitch

#### You own all of it, and you meet who builds it.

The site, the domain, the code and everything on it are yours. The people you meet in the pitch are the people who build your project. And if an off-the-shelf tool already does the job, we will tell you.

### Scope first, price second, then we build

[Button: Request a quote → /request-a-quote] [Button: Get in touch → /contact]

#### Discovery call

- We learn what is broken and what it is costing you in time.

#### Scoped proposal

- A written plan for your brief, with what is in scope and what is out.

#### Custom quote

- One price, worked out from that scope. The price follows the scope, not the other way around.

#### Honest about fit

- If an off-the-shelf tool already does the job, we will tell you. We will also tell you if we are not the right fit.

### Built by WildHands

[Button: Websites] [Button: Apps] [Button: Tools & Systems]

Image alt: "Tomori logo"

#### Tomori, a phone-first shop for hand-dyed Adire

- A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.

[Link: Read the case study → /resources/tomori (screen-reader label: "Tomori, a phone-first shop for hand-dyed Adire: Read the case study")]

Image alt: "Marque logo"

#### Marque, brand guidelines at one link

- Start from a logo, edit the guide in place, and publish it at one link.

[Link: Read the case study → /resources/marque (screen-reader label: "Marque, brand guidelines at one link: Read the case study")]

Image alt: "Rayo logo"

#### Rayo, quotes accepted on the page

- Send a quote with options, the client accepts one, and it becomes the invoice.

[Link: Read the case study → /resources/rayo (screen-reader label: "Rayo, quotes accepted on the page: Read the case study")]

Image alt: "Dory logo"

#### Dory, a budget that knows what is left

- Budget, shopping, loans and subscriptions in one place, with what is left always on top.

[Link: Read the case study → /resources/dory (screen-reader label: "Dory, a budget that knows what is left: Read the case study")]

Image alt: "Planes logo"

#### Planes, a to-do list you race friends on

- Swipe to land a task, fly one to a friend, and race your crew on the leaderboard.

[Link: Read the case study → /resources/planes (screen-reader label: "Planes, a to-do list you race friends on: Read the case study")]

Image alt: "Lazy Meet logo"

#### Lazy Meet, calls that join themselves

- Joins your calls at start time, muted and camera off, across three accounts.

[Link: Read the case study → /resources/lazy-meet (screen-reader label: "Lazy Meet, calls that join themselves: Read the case study")]

Image alt: "Auto Flow logo"

#### Auto Flow, video batches unattended

- Point it at a folder of images and it generates every video unattended, three at a time.

[Link: Read the case study → /resources/auto-flow (screen-reader label: "Auto Flow, video batches unattended: Read the case study")]

Image alt: "Marvy logo"

#### Marvy, course videos filed in one step

- Drop a video in and it lands in the right Drive folder, with the right people tagged.

[Link: Read the case study → /resources/marvy (screen-reader label: "Marvy, course videos filed in one step: Read the case study")]

### Recent work _(visually hidden heading, read by screen readers and search engines)_

Recent work, built from scratch around how each team works

Visual described to screen readers (aria-label): "Recent work"

_[Hidden on phones, shown from tablet width up:]_

[Button: icon only, aria-label: Previous project] [Button: icon only, aria-label: Next project]

_[end hidden on phones]_

Image alt: "Auto Flow logo"

#### A 24-image batch that took roughly two hours now runs in about half an hour, unattended.

Creative tooling

[Link: Read the case study → /resources/auto-flow (screen-reader label: "Auto Flow: Read the case study")]

Image alt: "Lazy Meet logo"

#### Meetings join themselves at the scheduled minute, muted, across up to three Google accounts.

Productivity

[Link: Read the case study → /resources/lazy-meet (screen-reader label: "Lazy Meet: Read the case study")]

Image alt: "The Ruff Agency logo"

#### A client goes from invited to working inside their own portal, without a single email thread.

Agency operations

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: Read the case study")]

Image alt: "Tomori logo"

#### The clothes are the loudest thing on every page, and the owner runs the shop from her phone.

E-commerce

[Link: Read the case study → /resources/tomori (screen-reader label: "Tomori: Read the case study")]

Image alt: "Marvy logo"

#### Nobody on the team has to think about where a video goes.

Internal tools

[Link: Read the case study → /resources/marvy (screen-reader label: "Marvy: Read the case study")]

Image alt: "Rayo logo"

#### A quote that answers itself, and an invoice nobody has to retype.

Business tools

[Link: Read the case study → /resources/rayo (screen-reader label: "Rayo: Read the case study")]

Image alt: "Dory logo"

#### You always know what is left without doing the maths.

Personal finance

[Link: Read the case study → /resources/dory (screen-reader label: "Dory: Read the case study")]

Image alt: "Planes logo"

#### Finishing a task feels like landing a plane.

Productivity

[Link: Read the case study → /resources/planes (screen-reader label: "Planes: Read the case study")]

Image alt: "Marque logo"

#### A brand guide that lives at a link, not in a PDF nobody can find.

Creative tooling

[Link: Read the case study → /resources/marque (screen-reader label: "Marque: Read the case study")]

### What we build

- Link: Marketing sites → /what-we-build/marketing-sites
- Link: Full custom builds → /what-we-build/full-custom-builds
- Link: CMS admin panel → /what-we-build/cms-admin-panel
- Link: Search and AI visibility → /what-we-build/search-visibility
- Link: Simple website analytics → /what-we-build/website-analytics
- Link: Quotes and invoices → /what-we-build/quotes-and-invoices
- Link: Client management dashboard → /what-we-build/client-management
- Link: Custom web apps → /what-we-build/custom-web-apps
- Link: Internal-facing tools → /what-we-build/internal-tools
- Link: Live dashboards → /what-we-build/live-dashboards
- Link: Workflow automation → /what-we-build/workflow-automation
- Link: Connecting the tools you use → /what-we-build/connected-tools

### Latest insights

Button: See all insights → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "Two colleagues working through something together on a laptop."

#### What Is an Internal Tool, and Does Your Business Need One?

- 5 November 2026
- Tools & Systems

Card link → /blog/what-is-an-internal-tool (screen-reader label: "What Is an Internal Tool, and Does Your Business Need One?")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

---

# Services (use cases)

## Service: Websites

URL: `/use-cases/websites`  
Meta title: Custom Website Design in Lagos, Nigeria | WildHands  
Meta description: Websites built from scratch around what you publish. Marketing sites that convert and full custom builds, designed in Lagos for businesses across Nigeria and Africa.

Note: the feature-card visuals on the service pages are being redesigned. Their text below was captured from the live page at the end of the run. The product carousel in "See what we have built" loops, so its four slides repeat. The hero has an animated sound-wave visual with no words.

**H1:** Websites built from scratch around your business

We build websites around your business, rather than fitting you into a theme. The structure, the content model and the page templates are designed for what you actually publish.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

_[Hidden on phones, shown from tablet width up:]_

Marketing sites that convert, and full custom builds for businesses that need the site to do more.

Why WildHands for websites?

_[end hidden on phones]_

### What you get _(visually hidden heading, read by screen readers and search engines)_

_[Phones only:]_

Why WildHands for websites?

_[end phones only]_

_[Hidden on phones, shown from tablet width up:]_

- Link: What ships with it → #ships-with
- Link: Built from scratch → #built-custom
- Link: Built for Nigeria → #local-realities
- Link: Our work → #our-work

_[end hidden on phones]_

Visual described to screen readers (aria-label): "A launch checklist for yourbusiness.ng with CMS admin panel, Crawl rules, XML sitemap, AI search visibility, Website analytics all ticked off, and the site published."

yourbusiness.ng | 5 of 5 in place

- CMS admin panel | Edit any page yourself
- Crawl rulesrobots.txt
- XML sitemapsitemap.xml
- AI search visibility | Set up for AI answers
- Website analytics | Visits and where they came from

Published

#### Everything a site needs, built in

Every site ships with a CMS admin panel, search engine crawl rules, an XML sitemap, AI search visibility setup and simple website analytics.

Visual described to screen readers (aria-label): "A restaurant's own editor changing a dish's price, saved and showing straight away on the menu page of its website."

Edit dish

Dish | Ofada rice and stew

Price | ₦5,500

On today's menu | Saved

yoursite.ng/menu

Today's menu

- Jollof rice and chicken | ₦4,500
- Ofada rice and stew | ₦5,500 | Updated just now
- Small chops | ₦3,000

#### Designed for what you publish

Nothing is adapted from a site built for someone else. Editing is part of the build, so routine changes never need a developer.

Visual described to screen readers (aria-label): "A checkout priced in naira, offering payment by card, bank transfer, ussd, on a page light enough for a slow connection."

Checkout | Delivery in Lagos

Adire two-piece set, with delivery | ₦48,500

- Card | Verve, Visa or Mastercard
- Bank transfer | To a one-time account number
- USSD | Dial a code, no data needed

Pay ₦48,500 | A light page that loads on a slow connection

#### Built for local realities

Every site accounts for local hosting, payment and connectivity realities, not just international defaults. We are based in Lagos and build for businesses across Nigeria and Africa.

Marque

Brand guidelines published at one link

Tomori

A shop for hand-dyed Adire, built for a phone

Rayo

Quotes the client accepts on the page

Planes

A to-do list you race your friends on

#### See what we have built

Every project is built around its own brief, so none of them look like each other. Marque publishes brand guidelines as a live website at one link.

### Start here

#### Request a quote

Send a short brief. We reply with a written plan and one price, worked out from that scope.

Button: Request a quote → /request-a-quote

#### The 72-hour website

Starter at ₦150,000 or Standard at ₦250,000. The design is approved before any code, and the site is live in 72 hours.

Button: See pricing → /pricing

#### Read our insights

Notes from the studio on websites, apps and the tools behind a business.

Button: Read insights → /blog

#### Book a discovery call

We learn what is broken and what it is costing you in time.

Button: Get in touch → /contact

#### Websites built by WildHands

_[Hidden on phones, shown from tablet width up:]_

[Button: icon only, aria-label: Previous slide] [Button: icon only, aria-label: Next slide]

_[end hidden on phones]_

Visual described to screen readers (aria-label): "Websites built by WildHands"

Image alt: "Tomori logo"

#### Tomori: a shop for hand-dyed Adire, built for a phone

E-commerce · Websites

[Link: Read the case study → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")]

Image alt: "Marque logo"

#### Marque: brand guidelines, made easy

Creative tooling · Websites

[Link: Read the case study → /resources/marque (screen-reader label: "Marque: brand guidelines, made easy")]

Image alt: "The Ruff Agency logo"

#### The Ruff Agency: one workspace instead of six tools

Agency operations · Websites

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")]

### Common questions

**FAQ, Q:** How much does a custom website cost?

**A:** Starter is ₦150,000 and Standard is ₦250,000, one-off, with half paid to start. A larger build with more pages or functionality is quoted after a short discovery call, once the scope is clear.

**FAQ, Q:** How long does a custom website take to build?

**A:** Starter and Standard sites are live in 72 hours once you approve the design. A full custom build takes longer, depending on how much functionality sits behind it, which the discovery call establishes.

**FAQ, Q:** Why not just use a template?

**A:** A template is faster to launch and then constrains every decision afterwards. If your site only needs to represent you, a template can be enough. If it needs to do anything specific to your business, custom is cheaper over time.

**FAQ, Q:** Can we update the site ourselves after launch?

**A:** Yes. Every site ships with a CMS admin panel, so routine changes never need a developer.

**FAQ, Q:** Do you build websites for businesses outside Lagos?

**A:** We are based in Lagos and build for businesses across Nigeria and Africa. Most of the process runs over calls, so location is not a barrier.

## Service: Apps

URL: `/use-cases/apps`  
Meta title: Custom web apps and internal tools | WildHands  
Meta description: Custom web apps and internal tools built around how your team actually works, rather than how off-the-shelf software assumes you do.

Hero visual (drawn in the browser, not in the page HTML): a letter grid that spells out the words WORKFLOW, SOFTWARE, CUSTOM, PORTAL, TOOLS, APPS and TEAM in turn (on phones only TOOLS, APPS, TEAM). The product carousel in "No two apps alike" loops, so its four slides repeat.

**H1:** Software built around how you actually work

An app is worth building when the way you work is specific enough that generic software makes it harder. We build around your real workflow, so the software fits the process.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

_[Hidden on phones, shown from tablet width up:]_

Custom web apps and internal tools, for teams whose workflow does not fit off-the-shelf software.

Why WildHands for apps?

_[end hidden on phones]_

### What you get _(visually hidden heading, read by screen readers and search engines)_

_[Phones only:]_

Why WildHands for apps?

_[end phones only]_

_[Hidden on phones, shown from tablet width up:]_

- Link: Your workflow → #your-workflow
- Link: Shaped by the problem → #shaped-by-the-problem
- Link: How the work runs → #how-the-work-runs
- Link: Where we work → #where-we-work

_[end hidden on phones]_

Visual described to screen readers (aria-label): "An order form and an accounting tool, with the step of copying between them by hand replaced by a custom app that the team and customers sign in to."

Order form | A tool you already use

Copied across by hand | Every order, every day

Your app | Your team and your customers sign in here

Accounting | Another tool you already use

#### Built around the real process

Software your team or your customers log into, built for a job off-the-shelf tools do not quite do. Often it is the piece between the tools you already have, where the manual work lives.

Lazy Meet

Joins your calls muted, camera off

Rayo

Quotes the client accepts on the page

Dory

A budget that always knows what is left

Planes

A to-do list you race your friends on

#### No two apps alike

Every app here started as a workflow someone was doing by hand. Lazy Meet replaced the five clicks before every call.

Visual described to screen readers (aria-label): "Three steps in order: discovery call, then written proposal, then one price, ending on one price to accept."

1. 1. Discovery call | What is costing you time

2. 2. Written proposal | Scoped around your brief

3. 3. One price | For the work in front of us | Accepted

#### Discovery, proposal, quote

A discovery call first, to find out what is actually costing you time. Then a scoped proposal written around that brief. Then one price for the work in front of us.

Visual described to screen readers (aria-label): "Map of Nigeria marking Lagos, Kano, Abuja, Port Harcourt, Maiduguri, Ibadan, Kaduna, Enugu, Calabar, Yola, Sokoto, Ilorin, Bauchi, Benin City, Makurdi"

(visual: Lagos) (visual: Kano) (visual: Abuja) (visual: Port Harcourt) (visual: Maiduguri)

#### Built in Lagos, used anywhere

We are based in Lagos and build for businesses across Nigeria and Africa. Most of the process runs over calls, so location is not a barrier.

### Start here

Button: See all → /blog

#### Request a quote

Send a short brief. We reply with a written plan and one price, worked out from that scope.

Button: Request a quote → /request-a-quote

#### Read a case study

Lazy Meet joins your Google Meet calls at start time, muted and camera off, across three accounts.

Button: Read the case study → /resources/lazy-meet

#### Read our insights

Notes from the studio on websites, apps and the tools behind a business.

Button: Read insights → /blog

#### Book a discovery call

We learn what is broken and what it is costing you in time.

Button: Get in touch → /contact

#### Apps built by WildHands

_[Hidden on phones, shown from tablet width up:]_

[Button: icon only, aria-label: Previous slide] [Button: icon only, aria-label: Next slide]

_[end hidden on phones]_

Visual described to screen readers (aria-label): "Apps built by WildHands"

Image alt: "Lazy Meet logo"

#### Lazy Meet: joining the call so you do not have to

Productivity · Apps

[Link: Read the case study → /resources/lazy-meet (screen-reader label: "Lazy Meet: joining the call so you do not have to")]

Image alt: "Rayo logo"

#### Rayo: quotes your client accepts on the page

Business tools · Apps

[Link: Read the case study → /resources/rayo (screen-reader label: "Rayo: quotes your client accepts on the page")]

### Common questions

**FAQ, Q:** When is a custom app worth building?

**A:** When the way you work is specific enough that generic software makes it harder, or when the workaround has become a spreadsheet several people maintain by hand. If an off-the-shelf tool fits, we will tell you.

**FAQ, Q:** How much does a custom app cost?

**A:** It is quoted after a discovery call. The main driver is how many distinct workflows the app supports, not the number of screens.

**FAQ, Q:** Do you replace software we already pay for?

**A:** Sometimes. More often we build the piece that sits between the tools you already have, because that gap is usually where the manual work lives.

**FAQ, Q:** Do you build apps for businesses outside Lagos?

**A:** We are based in Lagos and build for businesses across Nigeria and Africa. Most of the process runs over calls, so location is not a barrier.

## Service: Tools & Systems

URL: `/use-cases/tools-and-systems`  
Meta title: Dashboards and workflow automation | WildHands  
Meta description: Dashboards that show what is actually happening, and automation that removes the manual steps between the tools you already use.

The automation card plays two runs in turn. Only the Marvy run is in the page HTML below; the Auto Flow run reads: "Auto Flow", steps "Folder of 24 images picked", "A prompt written for each image", "Each image uploaded to Flow", "Three videos generating at once", "Every finished video downloaded", ending "Whole batch done in about half an hour". Both runs are also in the card's screen-reader description.

**H1:** Dashboards and automation that give you your time back

Dashboards that put the numbers in one place, and automation that connects the tools you already pay for, so nobody re-keys data between them.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

_[Hidden on phones, shown from tablet width up:]_

For teams rebuilding the same report, or re-keying the same data, every week.

Why WildHands for tools and systems?

_[end hidden on phones]_

### What you get _(visually hidden heading, read by screen readers and search engines)_

_[Phones only:]_

Why WildHands for tools and systems?

_[end phones only]_

_[Hidden on phones, shown from tablet width up:]_

- Link: Dashboards → #dashboards
- Link: Automation → #automation
- Link: Hours returned → #hours-returned
- Link: Where we work → #where-we-work

_[end hidden on phones]_

Visual described to screen readers (aria-label): "A dashboard pulling orders, money paid in and ad spend from three separate tools (shop, bank, ads) into one live view."

This week | Updated live

Shop | Orders | 128

Bank | Paid in | ₦1.86m

Ads | Ad spend | ₦252k

M | T | W | T | F | S | S

#### The numbers in one place

Most teams already produce the data and lose it across several tools. The work is pulling it into one live view, instead of rebuilding the same report every week.

Visual described to screen readers (aria-label): "Marvy: New video: BIO101 week 3, Course and week read from the file name, Filed in Drive: BIO101, Week 3, Video and its audio uploaded, Reviewers tagged in a comment. Filed and tagged, nobody clicked a thing Auto Flow: Folder of 24 images picked, A prompt written for each image, Each image uploaded to Flow, Three videos generating at once, Every finished video downloaded. Whole batch done in about half an hour"

Marvy | Nobody at the keyboard

1. New video: BIO101 week 3

2. Course and week read from the file name

3. Filed in Drive: BIO101, Week 3

4. Video and its audio uploaded

5. Reviewers tagged in a comment

Filed and tagged, nobody clicked a thing

#### Manual steps, removed for good

Auto Flow turned a supervised afternoon of clicking into an unattended half-hour. Marvy files each course video in the right Drive folder and tags the right reviewers.

Visual described to screen readers (aria-label): "Auto Flow, one 24-image batch: by hand, about 2 hours, supervised; with auto flow, about 30 minutes, unattended. About 90 minutes back, every batch."

Auto Flow | One 24-image batch

By hand | About 2 hours, supervised

With Auto Flow | About 30 minutes, unattended

0 | 1 hr | 2 hr | About 90 minutes back, every batch

#### Judged on the time it gives back

During discovery we work out how many hours the current process costs, and the finished build is measured against that number. If we cannot answer how much time it saves, it was not worth building.

Visual described to screen readers (aria-label): "Map of Nigeria marking Lagos, Kano, Abuja, Port Harcourt, Maiduguri, Ibadan, Kaduna, Enugu, Calabar, Yola, Sokoto, Ilorin, Bauchi, Benin City, Makurdi"

(visual: Lagos) (visual: Kano) (visual: Abuja) (visual: Port Harcourt) (visual: Maiduguri)

#### Built in Lagos, used anywhere

We are based in Lagos and build for businesses across Nigeria and Africa. Most of the process runs over calls, so location is not a barrier.

### Start here

#### Book a discovery call

We learn what is broken and what it is costing you in time.

Button: Get in touch → /contact

#### Systems built by WildHands

_[Hidden on phones, shown from tablet width up:]_

[Button: icon only, aria-label: Previous slide] [Button: icon only, aria-label: Next slide]

_[end hidden on phones]_

Visual described to screen readers (aria-label): "Systems built by WildHands"

Image alt: "Auto Flow logo"

#### Auto Flow: bulk video generation without the manual loop

Creative tooling · Tools & Systems

[Link: Read the case study → /resources/auto-flow (screen-reader label: "Auto Flow: bulk video generation without the manual loop")]

Image alt: "The Ruff Agency logo"

#### The Ruff Agency: one workspace instead of six tools

Agency operations · Tools & Systems

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")]

Image alt: "Marvy logo"

#### Marvy: course videos filed in one step

Internal tools · Tools & Systems

[Link: Read the case study → /resources/marvy (screen-reader label: "Marvy: course videos filed in one step")]

### Common questions

**FAQ, Q:** What is workflow automation?

**A:** Connecting the tools you already use so data moves between them without anyone re-keying it. The goal is removing manual steps permanently rather than making them faster.

**FAQ, Q:** How do you measure whether a system was worth it?

**A:** By hours returned. We establish what the current process costs in time during discovery, and that number is what the finished build is measured against.

**FAQ, Q:** Can you build a dashboard from data we already have?

**A:** Usually yes. Most teams already produce the data and lose it across several tools. The work is pulling it into one live view rather than generating anything new.

**FAQ, Q:** Do you build tools for businesses outside Lagos?

**A:** We are based in Lagos and build for businesses across Nigeria and Africa. Most of the process runs over calls, so location is not a barrier.

## Service location pages (87 pages)

URL pattern: `/use-cases/<service>/<place>`, for the 3 services above (websites, apps, tools-and-systems) and the 29 places below. Each page is its service page with four changes, built from templates. Everything else on the page is identical to the service page above.

- Meta title: `Custom {service} in {long place name} | WildHands`, where {service} is "websites", "apps" or "tools & systems". Example: "Custom websites in Lagos, Nigeria | WildHands".
- Meta description: `WildHands builds custom {service} for businesses in {long place name}. {service lede}`.
- H1: `{Service} in {long place name}` (the place name is highlighted). Example: "Websites in Lagos, Nigeria".
- Hero paragraph: the place's FAQ answer with its opening "Yes." removed, followed by the service lede.
- FAQ: a first question `Do you build {service} for businesses in {short place name}?` answered with the place's FAQ answer; the service page's general "Do you build … for businesses outside Lagos?" question is removed.
- Structured data only (not shown on the page): the Service description is the meta description followed by the place's "local context" paragraph below. These paragraphs are read by search engines and AI assistants.

Service ledes used in the templates:

- Websites: Marketing sites that convert, and full custom builds for businesses that need the site to do more.
- Apps: Custom web apps and internal tools, for teams whose workflow does not fit off-the-shelf software.
- Tools & Systems: For teams rebuilding the same report, or re-keying the same data, every week.

Example, `/use-cases/websites/lagos`: meta title "Custom websites in Lagos, Nigeria | WildHands"; meta description "WildHands builds custom websites for businesses in Lagos, Nigeria. Marketing sites that convert, and full custom builds for businesses that need the site to do more."; H1 "Websites in Lagos, Nigeria"; hero "We are based in Lagos. Most of our discovery calls happen from here and we work with businesses across Lagos, Nigeria and the wider region. Marketing sites that convert, and full custom builds for businesses that need the site to do more."

### The 29 places

#### Lagos, Nigeria (`lagos`, short name "Lagos")

FAQ answer (shown on the page): Yes. We are based in Lagos. Most of our discovery calls happen from here and we work with businesses across Lagos, Nigeria and the wider region.

Local context (structured data only): Lagos is where most of our clients are, so we build with the realities in mind: Paystack for card payments, mobile-first for users who read on the go over patchy connections, and a checkout that survives an intermittent 4G handoff without losing the cart. We are based here, so scoping calls happen over Zoom or in person, and delivery does not carry a ten-hour timezone gap.

#### Lekki, Lagos (`lekki`, short name "Lekki")

FAQ answer (shown on the page): Yes. A lot of our clients are on the Lekki-Ajah corridor. We meet in person around Admiralty Way, or over a call if that is easier.

Local context (structured data only): Lekki has become the corridor for founders and product teams, and most of the businesses we build for here are on their second or third iteration of something and want it right this time. Payment rails are Paystack and Flutterwave; connectivity is better than the average for the city but still mobile-first for most users. We meet clients in Admiralty Way or over a call and can be on-site inside the day when that helps.

#### Lagos Mainland (`mainland`, short name "Lagos Mainland")

FAQ answer (shown on the page): Yes. A large share of our audience research is Mainland-based even when the client is not, and we regularly build directly for Mainland businesses.

Local context (structured data only): Yaba, Ikeja, Surulere; the Mainland is where the customer bases of most of the businesses we work with actually live and buy. Sites we build for Mainland brands lean harder into speed and small payloads: users on modest phones, mixed networks, and a checkout that has to finish on the first attempt because a second one might not happen. Bank transfer is often the payment method a client would choose over card, and we support both by default.

#### Victoria Island, Lagos (`victoria-island`, short name "Victoria Island")

FAQ answer (shown on the page): Yes. We work with a number of Victoria Island businesses; mostly financial services and consulting, including with their internal IT and procurement processes.

Local context (structured data only): Victoria Island is head-office country: banks, insurers, oil and consulting. Work here often means talking to a procurement team as well as a product owner, and integrating with existing enterprise systems that were bought a decade ago. We build the front the customer sees and the internal tool the operations desk uses, and we sign the paperwork that lets us do both.

#### Ikoyi, Lagos (`ikoyi`, short name "Ikoyi")

FAQ answer (shown on the page): Yes. A lot of our smaller, more considered builds are for Ikoyi-based businesses. We can meet in person or over a call.

Local context (structured data only): Ikoyi is where we do a lot of our high-touch work: private practices, boutique services, founders whose brand is the business. The pages tend to be smaller and more considered than a Mainland retail build, with a focus on how the site looks and reads to a specific audience rather than how many people it reaches. Discovery calls often start over coffee near Awolowo Road.

#### Canada (`canada`, short name "Canada")

FAQ answer (shown on the page): Yes. We work with Canadian clients across the country, in either timezone. Bilingual (EN/FR) is supported when needed.

Local context (structured data only): For Canadian clients we work in the timezone that suits: our calls flex to Pacific or Eastern depending on where the team sits. Payments run through Stripe with Interac for local bank transfers when a customer prefers that, and PIPEDA compliance is planned in from the start rather than retrofitted at launch. Bilingual (EN/FR) is supported when the audience needs it, and we set the content model up to make that a switch rather than a rewrite.

#### Toronto, Ontario (`toronto`, short name "Toronto")

FAQ answer (shown on the page): Yes. We work with Toronto-based businesses regularly, including on procurement-heavy integrations. Calls happen on Eastern time.

Local context (structured data only): Toronto is a fintech and enterprise city, and most of the briefs that reach us from there involve integrations: with a CRM already in place, with a legacy back-office system, with a compliance team that has strong views. We work with those constraints rather than around them. Stripe is the default payment rail; PIPEDA and Ontario-specific consumer law shape the checkout copy from day one.

#### Vancouver, British Columbia (`vancouver`, short name "Vancouver")

FAQ answer (shown on the page): Yes. We work with Vancouver-based clients, including on dual-market builds that serve both Canada and the US Pacific Northwest.

Local context (structured data only): Vancouver clients are frequently building for both Canadian and adjacent US audiences; the border is short and the customer base overlaps. That shapes what a site does out of the box: dual-currency where it matters, taxes worked out per region rather than assumed, and analytics that separate the two audiences instead of averaging them. Calls happen on Pacific time, which suits our early afternoons.

#### Montreal, Quebec (`montreal`, short name "Montreal")

FAQ answer (shown on the page): Yes. We build for Montreal businesses, French-first where appropriate, and we plan Bill 25 compliance in from the start.

Local context (structured data only): Montreal work is French-first for most public-facing surfaces; Quebec's Charter of the French Language shapes what appears on a landing page before anything else does. We set the content model up so that switching, mirroring, or fully separating the two locales is a configuration decision, not a rebuild. Bill 25 and its consent requirements are treated as a starting point, not a launch-week discovery.

#### the United Kingdom (`uk`, short name "United Kingdom")

FAQ answer (shown on the page): Yes. We work with UK-based businesses across the country. Calls happen during UK hours, and everything we build ships GDPR-compliant.

Local context (structured data only): UK builds default to Stripe for cards, GoCardless when Direct Debit fits the business, and GDPR + PECR compliance handled properly rather than papered over with a banner. We work in GMT/BST, and our afternoons are UK mornings, so the working day overlaps naturally. Domain, hosting and analytics choices assume UK data-residency preferences where those matter.

#### London (`london`, short name "London")

FAQ answer (shown on the page): Yes. A number of our clients are London-based, including agencies and marketing teams looking for a build partner.

Local context (structured data only): London briefs tend to be more considered; a marketing team, a design partner already involved, a brand book we are asked to work inside. We fit into that stack: build the thing, hand it off in a form the marketing team can update, and stay available for the changes the brief did not anticipate. Enterprise clients get the procurement paperwork they need without us needing to be asked.

#### Manchester (`manchester`, short name "Manchester")

FAQ answer (shown on the page): Yes. We work with a lot of Manchester businesses. Scope is kept tight so a first build does not become a barrier to a second.

Local context (structured data only): Manchester's tech scene is one of the fastest-growing in the country, and the businesses we hear from there are usually value-conscious in the same breath as they are ambitious. We keep scope honest; the shortest build that gets the job done, priced so a growing business can afford it and grow into the next phase without a rebuild. Calls fit the UK working day.

#### Edinburgh (`edinburgh`, short name "Edinburgh")

FAQ answer (shown on the page): Yes. Edinburgh clients often bring data-handling or accessibility requirements up-front, which suits how we build by default.

Local context (structured data only): Edinburgh work often has a public-sector, fintech, or higher-education tilt; organisations for whom "how you handle data" is the first question, not the last. We take that as the point: pick tooling that is auditable, keep the data model boring on purpose, and document what the site actually does with a request. Scottish accessibility guidance is baked in from the start.

#### the United States (`usa`, short name "the United States")

FAQ answer (shown on the page): Yes. We work with US-based businesses across the country. Sales tax, ACH and Stripe are set up as defaults, not add-ons.

Local context (structured data only): US builds run on Stripe by default, with ACH added when repeat billing lands better in that channel. State-level sales tax is handled via TaxJar or Stripe Tax so a client is not manually reconciling forty-plus jurisdictions. We work across US timezones; most of our US calls sit in the afternoon UK / morning Eastern overlap, but we adjust when a Pacific client needs it.

#### New York, NY (`new-york`, short name "New York")

FAQ answer (shown on the page): Yes. NYC-based clients; often financial services, media or DTC brands; regularly work with us. Calls happen Eastern time.

Local context (structured data only): New York work usually means a brand with an audience already in place and a bar that is set by whatever agency built the site before. We build to that bar, on a schedule an in-house marketing team can plan around, with a content model designed for a copy team that ships new stories weekly rather than quarterly. Financial-services clients get SOC 2-adjacent hosting choices without needing to ask.

#### San Francisco, CA (`san-francisco`, short name "San Francisco")

FAQ answer (shown on the page): Yes. Startup and product clients in the Bay Area work with us regularly. We are available on Pacific time when needed.

Local context (structured data only): San Francisco briefs are usually product-shaped; a founder who knows exactly what they want to see next, a marketing site that has to keep up with a product changing week to week. We build with that cadence in mind: preview URLs on every branch, a content model the product team can adjust without a code change, and a delivery rhythm that assumes a launch is not the finish line.

#### Austin, TX (`austin`, short name "Austin")

FAQ answer (shown on the page): Yes. We work with Austin-based teams, including distributed startups serving audiences across and beyond the US.

Local context (structured data only): Austin has become the address for distributed teams and no-state-income-tax founders, and the sites we build there reflect that mix; often serving a US-wide audience, sometimes with international customers already showing up on day one. We set analytics and payment rails up for that reality: multi-region caching, Stripe with international cards, and a checkout that does not assume US billing.

#### Rwanda (`rwanda`, short name "Rwanda")

FAQ answer (shown on the page): Yes. We work with Rwandan clients, with Mobile Money and modest-device performance built in from the start.

Local context (structured data only): Rwanda's digital push is real, and the businesses we hear from there; from ambitious independents to government-adjacent projects; expect a site that works cleanly on modest devices, integrates with MTN Mobile Money or Airtel Money as the primary payment channel, and reads correctly in English (with Kinyarwanda where the audience calls for it). We build for the actual mix of hardware and networks rather than assuming a fibre-and-flagship-phone baseline.

#### Kigali, Rwanda (`kigali`, short name "Kigali")

FAQ answer (shown on the page): Yes. Kigali is our main Rwandan point of contact; we work with fintech, education and government-adjacent projects there.

Local context (structured data only): Kigali is where most of the country's digital work concentrates; the fintech scene around Norrsken, the government-led ID and payments initiatives, the education-adjacent tech coming out of the university corridor. We work with those environments: build to expected accessibility and language standards, integrate cleanly with existing government-issued digital identity where it makes sense, and treat Mobile Money as the default.

#### Butare (Huye), Rwanda (`butare`, short name "Butare")

FAQ answer (shown on the page): Yes. We work with Butare-based research, education and civic-sector clients, and price accordingly.

Local context (structured data only): Butare; administratively Huye; is Rwanda's university town, and the briefs we get from there lean towards research groups, small institutions and NGOs. That shapes what we build: content-heavy sites with genuine multilingual support, small budgets treated as constraints rather than excuses, and hosting picked so it survives an unreliable connection on the admin side.

#### Gisenyi (Rubavu), Rwanda (`gisenyi`, short name "Gisenyi")

FAQ answer (shown on the page): Yes. We work with Gisenyi-based clients; mostly tourism and cross-border businesses; and build with a bilingual audience in mind.

Local context (structured data only): Gisenyi; Rubavu on newer maps; sits on the DRC border and its business surface tends to be tourism, hospitality and cross-border trade. Sites we build here are frequently bilingual (English and French) with content aimed at travellers, and payment surfaces that accept both Rwandan Mobile Money and international cards without making the visitor guess which will work.

#### Ghana (`ghana`, short name "Ghana")

FAQ answer (shown on the page): Yes. We work with Ghanaian businesses, with MoMo and card both handled as first-class payment channels.

Local context (structured data only): Ghana is mobile-money-first for most transactions; MTN MoMo, Vodafone Cash, AirtelTigo; with card as the second channel. We build both in from day one, along with a checkout that copes with the Cedi's day-to-day volatility by pricing in a stable base currency where the business prefers that. Data-residency preferences shaped by Ghana's DPA are planned in rather than papered over.

#### Accra, Ghana (`accra`, short name "Accra")

FAQ answer (shown on the page): Yes. Accra-based startups and small teams work with us regularly, on scoped, phased builds that keep costs in check.

Local context (structured data only): Accra's startup scene has thickened fast, and most of the Accra briefs that reach us are from small teams building something on a considered budget with an ambitious product roadmap. We keep scope honest; ship a first release that earns the second; and default to payment integrations that Ghanaian customers actually reach for, not the ones a US-shaped SaaS assumes.

#### Kumasi, Ghana (`kumasi`, short name "Kumasi")

FAQ answer (shown on the page): Yes. We work with Kumasi retail and service businesses. Mobile performance and MoMo checkout are non-negotiable defaults.

Local context (structured data only): Kumasi work leans commercial: retail, trading, service businesses whose customers browse and buy on modest Android phones over mixed networks. The site has to load quickly with a small budget, handle a MoMo checkout without a redirect that loses the sale, and read plainly in English or Twi where that matters. We build to that reality rather than to a lighthouse score on desktop.

#### Takoradi, Ghana (`takoradi`, short name "Takoradi")

FAQ answer (shown on the page): Yes. We work with Takoradi-based industrial and B2B businesses, including those tied to the port and oil sectors.

Local context (structured data only): Takoradi's economy leans on the port and the oil sector, and the sites we build there are frequently B2B; logistics, engineering services, industrial supply. That means a content model that carries technical detail cleanly, a lead-capture flow set up for long-cycle enquiries, and language that reads correctly to a specification manager as well as to a marketing director.

#### South Africa (`south-africa`, short name "South Africa")

FAQ answer (shown on the page): Yes. We work with South African clients across the country. Load-shedding and PoPIA are treated as build-time inputs, not launch-day surprises.

Local context (structured data only): South African builds have to survive load-shedding on the operator side as well as the customer side; background workers idempotent, admin sessions that come back cleanly after a two-hour outage, notifications queued rather than fired-and-lost. PoPIA compliance is scoped in from day one; payment rails default to Peach, PayFast or Stripe depending on which fits the client's existing setup.

#### Johannesburg, South Africa (`johannesburg`, short name "Johannesburg")

FAQ answer (shown on the page): Yes. Johannesburg-based enterprise and financial-services clients work with us on integration-heavy builds.

Local context (structured data only): Johannesburg work tilts towards financial services, insurance and the enterprise side of retail; organisations with existing systems, procurement teams, and an internal IT function that already has strong views on hosting. We work with that reality: integrations rather than replacements, security review baked into delivery, and documentation the internal team can read without our help six months later.

#### Cape Town, South Africa (`cape-town`, short name "Cape Town")

FAQ answer (shown on the page): Yes. We work with Cape Town startups, tourism operators and creative agencies. Multi-audience, multi-network builds are standard.

Local context (structured data only): Cape Town's mix; startups, tourism, creative agencies; shapes what a good build looks like there. Sites need to work for an international audience as often as a domestic one, run cleanly on modest mobile networks in Khayelitsha as reliably as they do on fibre in Sea Point, and handle both local and international payment methods without making the visitor pick between them.

#### Durban, South Africa (`durban`, short name "Durban")

FAQ answer (shown on the page): Yes. Durban-based logistics, retail and port-adjacent clients work with us on both public sites and internal tooling.

Local context (structured data only): Durban work often has a port, logistics or retail tilt; businesses whose operations are the point and whose website is the calmer face of a much noisier back office. We build the site the customer sees and, where it helps, the internal tool the operations team uses, treating them as one system so a change in one is not a surprise in the other.

---

# What we build (capability pages)

## What we build: Marketing sites

URL: `/what-we-build/marketing-sites`  
Meta title: Marketing Websites in Lagos, Nigeria | WildHands  
Meta description: A focused website built from scratch to represent your business and turn visitors into enquiries. Starter and Standard sites are live in 72 hours.

**H1:** A site built to convert visitors

A focused site that represents you and gives visitors a clear path to contact. Designed from scratch around what your business publishes, not adapted from a theme.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "The Marque website’s homepage."

Caption: The Marque website, designed and built by WildHands.

### What it is

A strong, simple presence and a clear path to contact.

A marketing site is the right fit when people need to understand what you do and get in touch. We design the structure, the content model and the page templates around what you actually publish, and every site accounts for local hosting, payment and connectivity realities, not just international defaults.

### Who it is for

- You need a strong public presence
- The goal is to turn visitors into enquiries
- Your content changes now and then, not every hour

### What you get

#### A custom responsive site

- Designed for your business and built to work on every screen, phones first.

#### A CMS admin panel

- Change words and pictures yourself. Routine changes never need a developer.

#### Search and AI visibility

- Search engine crawl rules, an XML sitemap and AI search visibility setup, from day one.

#### Simple website analytics

- How many people came, where from, and what they looked at.

#### Live in 72 hours

- Starter (one page, ₦150,000) and Standard (up to 4 pages, ₦250,000) are live 72 hours after you approve the design.

### How we build it

1. 01

#### Discovery call

We learn what is broken and what it is costing you in time.

2. 02

#### Design first

You see the design and approve it before any code is written. Starter includes 2 rounds of edits and Standard includes 3.

3. 03

#### Build

Pay the deposit, half the price, to start. We build the site from scratch, with editing set up so you can make routine changes yourself.

4. 04

#### Live

Starter and Standard sites go live in 72 hours. A bigger site is quoted after the discovery call.

### Built by WildHands

#### Marque: brand guidelines, made easy

Start from a logo, edit the guide in place, and publish it at one link.

[Link: Read the case study → /resources/marque (screen-reader label: "Marque: brand guidelines, made easy")]

#### Tomori: a shop for hand-dyed Adire, built for a phone

A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.

[Link: Read the case study → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")]

#### The Ruff Agency: one workspace instead of six tools

Clients, contracts, invoices, tasks and a client portal in one shared workspace.

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")]

### Let’s talk about your marketing site

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Full custom builds

URL: `/what-we-build/full-custom-builds`  
Meta title: Custom Website Builds in Lagos, Nigeria | WildHands  
Meta description: More pages and more functionality, for businesses whose website has to sell, take payments or run a back office. Built from scratch in Lagos.

**H1:** A website that does more than represent you

More pages and more functionality, for a business that needs the site to do real work: take orders and payments, run a catalogue, or carry a back office behind it.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "The Tomori shop’s homepage, with its collections."

Caption: The Tomori shop, designed and built by WildHands.

### What it is

Built for what you publish, and for what the site has to do.

A full custom build starts from your content and your workflow, not a theme. Tomori is one: a phone-first shop for hand-dyed Adire with a Paystack checkout that takes card, transfer or USSD, delivery fees shown before anyone pays, and a back office the owner runs from her own phone.

### Who it is for

- The site needs to take orders or payments
- What you publish does not fit a template
- Your team will run it day to day, without a developer

### What you get

#### Pages designed for your content

- Templates and a content model built around what you publish, not adapted from someone else’s site.

#### Payments that work in Nigeria

- A Paystack checkout that takes card, transfer or USSD, with every price in naira.

#### A back office for your team

- An admin written for the person running the business, not for a developer.

#### Everything a site ships with

- A CMS admin panel, crawl rules, an XML sitemap, AI search visibility setup and simple website analytics.

#### Built for local realities

- Local hosting, payment and connectivity are planned for, not just international defaults.

### How we build it

1. 01

#### Discovery call

We learn what is broken and what it is costing you in time.

2. 02

#### Scoped proposal

A written plan for your brief, with what is in scope and what is out.

3. 03

#### Custom quote

One price, worked out from that scope. The price follows the scope, not the other way around.

4. 04

#### Build and hand over

Editing is part of the build, not an add-on, so routine changes never need a developer.

### Built by WildHands

#### Tomori: a shop for hand-dyed Adire, built for a phone

A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.

[Link: Read the case study → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")]

#### The Ruff Agency: one workspace instead of six tools

Clients, contracts, invoices, tasks and a client portal in one shared workspace.

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")]

#### Marque: brand guidelines, made easy

Start from a logo, edit the guide in place, and publish it at one link.

[Link: Read the case study → /resources/marque (screen-reader label: "Marque: brand guidelines, made easy")]

### Let’s talk about your custom build

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: CMS admin panel

URL: `/what-we-build/cms-admin-panel`  
Meta title: CMS Admin Panels for Business Websites | WildHands  
Meta description: Every WildHands site ships with an admin panel written for the person running the business: change words and pictures, preview them, then publish.

**H1:** Change your site without a developer

Every site we build ships with an admin panel written for the person running the business. Change any words or pictures, see them in a live preview, and publish when you are ready.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "A sample shop’s admin panel: the home page heading is rewritten beside a live preview, saved, published, then a product’s stock is changed."

Caption: A sample shop on example data, in WildHands colours. It follows the admin panels we have built for real shops.

### What it is

Editing is part of the build, not an add-on.

We set up the content model so routine changes never need a developer. Each section says what it is for in a few words, every empty screen says what will show up there, and your changes stay private until you choose to publish them.

### Who it is for

- You update prices, photos or wording yourself
- You want to check a change before customers see it
- You would rather not file a ticket for every edit

### What you get

#### Words and pictures

- Headings, paragraphs, buttons and photos, edited in plain-language fields beside a live preview.

#### Save, then publish

- Save keeps changes private. Publish is the only thing that changes the live site.

#### Products, pages and posts

- Products and stock, policy pages such as shipping and returns, and a blog where the site needs one.

#### Links checked first

- A button that points nowhere is flagged before it goes live, so nobody lands on a missing page.

#### Runs from a phone

- The Tomori owner runs her whole shop, admin included, from her own phone.

### How we build it

1. 01

#### Map what changes

We list everything on the site that changes, and who changes it.

2. 02

#### Name things in your words

Fields are labelled the way your business talks, so the admin reads like your shop, not a database.

3. 03

#### Build it with the site

The admin is built alongside the site, so its preview shows the real pages, not an approximation.

4. 04

#### Hand over

We walk you through it. Times read “3 hours ago”, and nothing needs a manual.

### Built by WildHands

#### Tomori: a shop for hand-dyed Adire, built for a phone

A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.

[Link: Read the case study → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")]

#### Marque: brand guidelines, made easy

Start from a logo, edit the guide in place, and publish it at one link.

[Link: Read the case study → /resources/marque (screen-reader label: "Marque: brand guidelines, made easy")]

#### The Ruff Agency: one workspace instead of six tools

Clients, contracts, invoices, tasks and a client portal in one shared workspace.

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")]

### Let’s talk about your admin panel

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Search and AI visibility

URL: `/what-we-build/search-visibility`  
Meta title: Search and AI Visibility Setup | WildHands  
Meta description: Crawl rules, an XML sitemap and AI search visibility setup on every WildHands site, so search engines and AI assistants can read what your business does.

**H1:** Set up to be found from day one

Every site we build ships with search engine crawl rules, an XML sitemap and AI search visibility setup, so search engines and AI assistants can read what your business does.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "A sample shop’s search settings: the page title and description are rewritten with a live search preview, then the sitemap, robots.txt, llms.txt and business details files."

Caption: A sample shop on example data, in WildHands colours. It follows the admin panels we have built for real shops.

### What it is

The groundwork search engines and AI assistants read first.

Crawl rules tell search engines which pages to read and which to skip, such as the admin. The XML sitemap lists every public page. AI search visibility setup gives AI assistants a plain summary of the business. Page titles and descriptions are fields you can edit yourself. None of it guarantees a ranking, and we will not promise you one.

### Who it is for

- You are launching a new site
- Your current site has no sitemap or crawl rules
- You want AI assistants to be able to read what you do

### What you get

#### An XML sitemap

- Every public page listed, built from the site itself so new pages are included.

#### Crawl rules

- A robots.txt that keeps private areas such as the admin out of search and points crawlers to the sitemap.

#### AI search visibility setup

- A plain-text summary of the business, in the llms.txt format, for AI assistants to read.

#### Titles and descriptions

- Edited in the admin panel, with a preview of how the page shows in search and in shared links.

#### Business details

- Your name, location and contact details marked up so search engines can read them.

### How we build it

1. 01

#### Part of every build

Crawl rules, the sitemap and the AI summary ship with the site. They are not an add-on.

2. 02

#### Kept current

The sitemap is generated from the site’s own pages, so nobody has to remember to update it.

3. 03

#### Yours to edit

Titles and descriptions sit in the admin panel, next to the rest of your content.

4. 04

#### Honest about results

We set up what search engines and AI assistants need to read the site. We do not promise rankings.

### Built by WildHands

#### Tomori: a shop for hand-dyed Adire, built for a phone

A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.

[Link: Read the case study → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")]

#### Marque: brand guidelines, made easy

Start from a logo, edit the guide in place, and publish it at one link.

[Link: Read the case study → /resources/marque (screen-reader label: "Marque: brand guidelines, made easy")]

#### The Ruff Agency: one workspace instead of six tools

Clients, contracts, invoices, tasks and a client portal in one shared workspace.

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")]

### Let’s talk about your search setup

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Simple website analytics

URL: `/what-we-build/website-analytics`  
Meta title: Simple Website Analytics, No Ad Trackers | WildHands  
Meta description: Visitors counted on your own site with no ad trackers: who is browsing now, where they came from, what they looked at, and when the site is busiest.

**H1:** Know who visits, without ad trackers

Visitors are counted on your own site, with no ad trackers. See who is browsing now, where they came from, what they looked at and when the site is busiest.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "A sample shop’s visitors page: visitors each day, where they came from, devices, cities, busiest hours and visit to sale."

Caption: A sample shop on example data, in WildHands colours. It follows the admin panels we have built for real shops.

### What it is

The few numbers that matter, in plain words.

Simple website analytics ships with every site we build. It answers the questions a business owner actually asks: how many people came, where from, on what device, and what they did once they arrived. Times are shown in Lagos time, and it sits in the same admin panel as everything else.

### Who it is for

- You want to know whether the site is working
- You would rather not put ad trackers on your customers
- You do not have time to learn a big analytics tool

### What you get

#### Browsing now

- How many people are on the site at this moment.

#### Where visitors came from

- Instagram, WhatsApp, Google, or typed in directly.

#### Devices and cities

- Phone or computer, and which cities your visitors are in.

#### Busiest times

- The days and hours the site is busiest, in Lagos time.

#### From visit to sale

- On a shop: how many looked at a piece, added it to the bag, and paid.

#### QR code scans

- Codes printed on delivery bags report every scan, and can be pointed somewhere new after printing.

### How we build it

1. 01

#### Counted on your site

Visits are recorded by the site itself, with no ad trackers.

2. 02

#### In the admin

The numbers sit in the same admin panel you already use for the site.

3. 03

#### Labelled as answers

Each view reads as an answer, such as “Browsing now”, not as a metric name.

4. 04

#### Only what you use

We add the views your business needs and leave out the rest.

### Built by WildHands

#### Tomori: a shop for hand-dyed Adire, built for a phone

A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.

[Link: Read the case study → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")]

### Let’s talk about your analytics

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Quotes and invoices

URL: `/what-we-build/quotes-and-invoices`  
Meta title: Quote and Invoice Generator | WildHands  
Meta description: Quotes your client accepts on the page, and an invoice that fills itself from the accepted option. Built by WildHands in Lagos.

**H1:** Quotes your client accepts on the page

Send a quote with options. The client picks one, watches the total update and accepts it, and the accepted option becomes the invoice, with nothing retyped.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "Rayo’s welcome tour, then its quotes, a client’s quote, invoices and clients."

Caption: Rayo, designed and built by WildHands, on sample data.

### What it is

One set of numbers, from quote to paid.

Most freelancers and small studios write a quote in one document, then rebuild the same numbers in an invoice once the client agrees. We build quoting and invoicing that carries the numbers through: your logo, bank details and terms already on the invoice, a ledger of what is paid, part paid and overdue, and PDFs when you need them.

### Who it is for

- Freelancers and small studios
- Businesses that send quotes with options
- Anyone retyping a quote into an invoice

### What you get

#### Quotes with options

- The client picks an option and watches the total update.

#### Accepted on the page

- No PDF to sign and no email to reply to. Designed for a phone first, because most clients open their quote on one.

#### Invoices that fill themselves

- The accepted option becomes the invoice, with your logo, bank details and terms on it.

#### A ledger that follows the money

- Paid, part paid and overdue, and what is still owed on each invoice, deposits included.

#### PDFs and email

- Documents export as PDFs, and the mail goes out on your behalf.

#### Paystack or Stripe

- Invoices can settle through Paystack or Stripe, depending on where the client is.

### How we build it

1. 01

#### Start from your documents

We look at the quotes and invoices you send today, and at what gets retyped between them.

2. 02

#### Two questions first

The overview answers where each quote stands and what money is in or owed, before anything else.

3. 03

#### Phone first for clients

The page your client opens is designed for a phone first.

4. 04

#### Connected to how you get paid

Payment, PDFs and email are wired in, so a quote can go all the way to paid.

### Built by WildHands

#### Rayo: quotes your client accepts on the page

Send a quote with options, the client accepts one, and it becomes the invoice.

[Link: Read the case study → /resources/rayo (screen-reader label: "Rayo: quotes your client accepts on the page")]

#### The Ruff Agency: one workspace instead of six tools

Clients, contracts, invoices, tasks and a client portal in one shared workspace.

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")]

### Let’s talk about your quotes and invoices

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Client management dashboard

URL: `/what-we-build/client-management`  
Meta title: Client Management Dashboards | WildHands  
Meta description: Contacts, contracts, invoices and tasks in one workspace your team shares, with a portal where each client sees their own records.

**H1:** Every client, in one workspace

Contacts, contracts, invoices and tasks in one place your whole team can see, with a portal where each client sees their own records.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "The Fey workspace: the dashboard, the CRM and the Playground."

Caption: The Ruff Agency’s workspace, designed and built by WildHands.

### What it is

One workspace instead of six tools that do not know about each other.

Clients in a spreadsheet, invoices in another system and handoffs in email means nobody can see who is doing what. For The Ruff Agency we built one workspace where contacts, contracts, invoices and tasks sit together, every member sees the same data gated by their role, and each client gets a portal on its own address with its own sign-in.

### Who it is for

- Agencies and service businesses
- Teams that track clients in a spreadsheet
- Businesses whose clients chase progress over email

### What you get

#### Clients and contacts

- Everyone you work with, and everything about them, in one place.

#### Contracts and documents

- A vault that decides which client portals can see which document.

#### Invoices and payments

- From draft to sent to paid, settled through Stripe or Paystack.

#### Tasks

- Who is doing what, with updates sent to WhatsApp for people who live in messaging.

#### A client portal

- The same records, a different view: read-only or collaborative, depending on what each client is given.

#### Access by role

- Each member sees what their role allows, enforced in the database itself.

### How we build it

1. 01

#### Discovery call

We learn what is broken and what it is costing you in time.

2. 02

#### One database, two views

Your team and your clients read the same records through different doors, so nothing is copied between them.

3. 03

#### Access in the database

Who sees what is enforced with row-level security, not just hidden in the interface.

4. 04

#### Shipped in stages

The Ruff Agency has shipped 88 database migrations and is still shipping.

### Built by WildHands

#### The Ruff Agency: one workspace instead of six tools

Clients, contracts, invoices, tasks and a client portal in one shared workspace.

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")]

#### Rayo: quotes your client accepts on the page

Send a quote with options, the client accepts one, and it becomes the invoice.

[Link: Read the case study → /resources/rayo (screen-reader label: "Rayo: quotes your client accepts on the page")]

### Let’s talk about your client workspace

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Custom web apps

URL: `/what-we-build/custom-web-apps`  
Meta title: Custom Web App Development in Lagos, Nigeria | WildHands  
Meta description: Software your team or your customers log into, built around how you work, for a job off-the-shelf tools do not quite do.

**H1:** Software built around how you work

Software your team or your customers log into, built for a job that off-the-shelf tools do not quite do.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "Planes ticking a task off for 10 XP, then showing progress and the friends leaderboard."

Caption: Planes, designed and built by WildHands.

### What it is

Worth building when generic software makes the work harder.

We build web apps around your real workflow, so the software fits the process instead of the process bending to the software. The best sign an app is worth building is a spreadsheet that three people maintain and everybody is slightly afraid of. If an off-the-shelf tool fits, we will tell you.

### Who it is for

- Your team needs something to log into to do the work
- The process is specific to how your business runs
- Off-the-shelf software almost fits, but not quite

### What you get

#### Built around your workflow

- Every app here started as a workflow someone was doing by hand.

#### Web, desktop or phone

- Planes runs from one codebase on the web and as a desktop app, with an Android app alongside.

#### Private by default

- Data sits under row-level security, so each person reads only what is theirs.

### How we build it

1. 01

#### Discovery call

We learn what is broken and what it is costing you in time.

2. 02

#### Scoped proposal

A written plan for your brief, with what is in scope and what is out.

3. 03

#### Custom quote

What moves the number is how many distinct workflows the app supports, not how many screens it has.

4. 04

#### Build

The shape of the build follows the shape of the problem, which is why none of our apps look like each other.

### Built by WildHands

#### Rayo: quotes your client accepts on the page

Send a quote with options, the client accepts one, and it becomes the invoice.

[Link: Read the case study → /resources/rayo (screen-reader label: "Rayo: quotes your client accepts on the page")]

#### Planes: a to-do list you race your friends on

Swipe to land a task, fly one to a friend, and race your crew on the leaderboard.

[Link: Read the case study → /resources/planes (screen-reader label: "Planes: a to-do list you race your friends on")]

#### Dory: a budget app that always knows what is left

Budget, shopping, loans and subscriptions in one place, with what is left always on top.

[Link: Read the case study → /resources/dory (screen-reader label: "Dory: a budget app that always knows what is left")]

### Let’s talk about your web app

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Internal-facing tools

URL: `/what-we-build/internal-tools`  
Meta title: Internal Tools for Business Teams | WildHands  
Meta description: Tools built for one specific workflow and the people who live with it every day, so the routine runs itself and only asks when something looks wrong.

**H1:** Tools for the job your team does all day

Built for one specific workflow and the people who have to live with it every day, so the routine runs itself.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "Marvy’s board of course videos, a video’s details, and its version history."

Caption: Marvy, designed and built by WildHands.

### What it is

The same routine, twenty times a sitting, done in one step.

A course-production team was finding a Google Drive folder by hand for every video, dragging the file in and pasting four comments to tag reviewers. Marvy reads the course and week from the file name, finds the folder, uploads the video with its audio and tags the right people. That is what an internal tool is for: one routine your team repeats, done properly.

### Who it is for

- A task your team repeats many times a day
- A routine that lives in one person’s head
- Work that runs between tools you already pay for

### What you get

#### Quiet by default

- The usual case asks nothing. The tool speaks up only when something looks wrong, and then asks one clear question.

#### Safe by design

- Nothing Marvy does can delete anything in Drive. A near match is shown, never accepted.

#### Runs where your team works

- Marvy runs on the team’s own computers, with no server and no tracking, from 375 pixels wide to full screen.

#### Clear about who did what

- Comments post as whoever is signed in.

### How we build it

1. 01

#### Watch the routine

We learn it step by step, and what it costs in time.

2. 02

#### Remove steps

The goal is removing manual steps for good, not making them faster.

3. 03

#### Fail safe

When the tool cannot be sure, it stops and asks rather than guessing.

4. 04

#### Measured in hours

We judge the tool by how much time it gives back.

### Built by WildHands

#### Marvy: course videos filed in one step

Drop a video in and it lands in the right Drive folder, with the right people tagged.

[Link: Read the case study → /resources/marvy (screen-reader label: "Marvy: course videos filed in one step")]

#### Lazy Meet: joining the call so you do not have to

Joins your calls at start time, muted and camera off, across three accounts.

[Link: Read the case study → /resources/lazy-meet (screen-reader label: "Lazy Meet: joining the call so you do not have to")]

#### Auto Flow: bulk video generation without the manual loop

Point it at a folder of images and it generates every video unattended, three at a time.

[Link: Read the case study → /resources/auto-flow (screen-reader label: "Auto Flow: bulk video generation without the manual loop")]

### Let’s talk about your internal tool

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Live dashboards

URL: `/what-we-build/live-dashboards`  
Meta title: Live Business Dashboards | WildHands  
Meta description: The numbers that matter in one live view instead of rebuilt every week, pulled from data your business already produces.

**H1:** The numbers that matter, in one place

Data visibility and live tracking, so the numbers that matter are in one place instead of rebuilt every week.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "A sample shop’s dashboard: a new order lifts the week’s takings, then the best sellers, finance and the daily report."

Caption: A sample shop on example data, in WildHands colours. It follows the admin panels we have built for real shops.

### What it is

How is it going, and what do I do next?

Most teams already produce the data and lose it across several tools. The work is pulling it into one live view rather than generating anything new. A good dashboard answers how the business is doing first, then what needs doing next.

### Who it is for

- The same report gets rebuilt from scratch every week
- Nobody can see what is happening without digging
- Your numbers sit in tools that do not talk to each other

### What you get

#### Live totals

- Today’s and this week’s figures, updated as orders come in.

#### What needs doing

- Orders to pack, unread messages and overdue debts, in one list.

#### Money in and out

- Takings, costs and profit in the same place.

#### Reports to print

- A daily report, one day at a time, to print or download.

#### From data you already have

- Pulled from the tools and records you already keep, not typed in again.

### How we build it

1. 01

#### Count the hours

We start by working out how many hours the current reporting costs, because that is what the build is measured against.

2. 02

#### Find the data

We trace where each number lives today and pull it into one view.

3. 03

#### Answer two questions first

How it is going, then what to do next. Everything else is one tap away.

4. 04

#### Judged on hours returned

If we cannot say how much time it saves you, it was not worth building.

### Built by WildHands

#### The Ruff Agency: one workspace instead of six tools

Clients, contracts, invoices, tasks and a client portal in one shared workspace.

[Link: Read the case study → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")]

#### Dory: a budget app that always knows what is left

Budget, shopping, loans and subscriptions in one place, with what is left always on top.

[Link: Read the case study → /resources/dory (screen-reader label: "Dory: a budget app that always knows what is left")]

#### Tomori: a shop for hand-dyed Adire, built for a phone

A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.

[Link: Read the case study → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")]

### Let’s talk about your dashboard

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Workflow automation

URL: `/what-we-build/workflow-automation`  
Meta title: Workflow Automation for Businesses | WildHands  
Meta description: Automation that removes the manual steps between your tools for good. Judged by the hours it gives back.

**H1:** Remove the manual steps for good

Automation that removes the manual steps in your day permanently. The goal is removing the step, not doing it faster.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "Auto Flow working through a folder of images, three videos at a time."

Caption: Auto Flow, designed and built by WildHands.

### What it is

The same clicks, done for you, unattended.

Auto Flow drives Google Flow through a whole folder of images: upload, generate, download, with nobody at the keyboard. A 24-image batch that took roughly two hours of supervised clicking now runs in about half an hour, unattended. That is the test for every automation we build: the hours it gives back.

### Who it is for

- Someone repeats the same clicks all day
- Data is re-keyed by hand between tools
- The process is stable enough to automate

### What you get

#### Runs unattended

- Start it and walk away. Auto Flow keeps up to three generations in flight at once.

#### Picks up where it stopped

- Progress is saved as it goes, so an interrupted run resumes instead of starting again.

#### Checks its own work

- A step counts as done only when it can be confirmed two ways. Failures are caught and retried once.

#### Within the rules

- We will not build automation that breaks a platform’s terms of service.

#### Measured in hours

- We find out what the process costs in time first, and measure the build against it.

### How we build it

1. 01

#### Discovery call

We learn what is broken and what it is costing you in time.

2. 02

#### Map every step

We write down the routine exactly as it runs today, including the steps people forget they do.

3. 03

#### Build and verify

Each step is checked as it runs, so a hiccup reads as a failure, never as a success.

4. 04

#### Measure

The finished build is measured against the hours the old process cost.

### Built by WildHands

#### Auto Flow: bulk video generation without the manual loop

Point it at a folder of images and it generates every video unattended, three at a time.

[Link: Read the case study → /resources/auto-flow (screen-reader label: "Auto Flow: bulk video generation without the manual loop")]

#### Marvy: course videos filed in one step

Drop a video in and it lands in the right Drive folder, with the right people tagged.

[Link: Read the case study → /resources/marvy (screen-reader label: "Marvy: course videos filed in one step")]

#### Lazy Meet: joining the call so you do not have to

Joins your calls at start time, muted and camera off, across three accounts.

[Link: Read the case study → /resources/lazy-meet (screen-reader label: "Lazy Meet: joining the call so you do not have to")]

### Let’s talk about your automation

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

## What we build: Connecting the tools you use

URL: `/what-we-build/connected-tools`  
Meta title: Connecting the Tools Your Business Uses | WildHands  
Meta description: Paystack, Stripe, Google, WhatsApp, email and more, connected so data moves between them without anyone re-keying it.

**H1:** Your tools, talking to each other

We connect the tools you already pay for, so data moves between them without anyone re-keying it.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

Visual described to screen readers (aria-label): "Lazy Meet listing the day’s meetings across three Google accounts."

Caption: Lazy Meet, designed and built by WildHands. It reads up to three Google calendars.

### What it is

The gap between your tools is where the manual work lives.

Often we do not replace the software you already pay for. We build the piece that sits between those tools, because that gap is usually where someone is copying data by hand. Lazy Meet reads three Google calendars and joins each call on time, muted, without anyone opening a link.

### Who it is for

- Data is copied by hand from one tool to another
- You pay for tools that do not know about each other
- Your team lives in WhatsApp more than in dashboards

### What you get

#### Payments

- Paystack and Stripe, for clients at home and abroad.

#### Google

- Calendar and Drive: Lazy Meet reads calendars, and Marvy files videos into the right Drive folder.

#### Banking

- Dory shows a Kuda balance and makes transfers from it, beside the budget.

#### Email and WhatsApp

- Transactional email through Resend, and a WhatsApp bot that sends task updates.

#### AI models

- Claude, Gemini and Deepgram, used where they remove real work.

#### Only the access needed

- Lazy Meet asks for read-only calendar access and nothing more, and keeps its keys encrypted in the system keychain.

### How we build it

1. 01

#### List the tools

Everything you use today, and where data moves between them by hand.

2. 02

#### Find the gap

We build the missing piece rather than replacing what already works.

3. 03

#### Ask for least access

Each connection asks only for what it needs to do its job.

4. 04

#### Fail safe

When a connection cannot confirm what it is doing, it stops before acting.

### Built by WildHands

#### Lazy Meet: joining the call so you do not have to

Joins your calls at start time, muted and camera off, across three accounts.

[Link: Read the case study → /resources/lazy-meet (screen-reader label: "Lazy Meet: joining the call so you do not have to")]

#### Marvy: course videos filed in one step

Drop a video in and it lands in the right Drive folder, with the right people tagged.

[Link: Read the case study → /resources/marvy (screen-reader label: "Marvy: course videos filed in one step")]

#### Dory: a budget app that always knows what is left

Budget, shopping, loans and subscriptions in one place, with what is left always on top.

[Link: Read the case study → /resources/dory (screen-reader label: "Dory: a budget app that always knows what is left")]

### Let’s talk about connecting your tools

Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from that scope. If an off-the-shelf tool already does the job, we will tell you.

[Button: Get in touch → /contact] [Button: Request a quote → /request-a-quote]

_(Screen-reader label for this nav: "More we build")_

_(Shared block: More we build. See Shared blocks.)_

---

# Work (case studies)

## Work index

URL: `/resources`  
Meta title: Work | WildHands  
Meta description: Case studies from WildHands: the apps, websites, tools and internal systems we designed and built end to end.

**H1:** Work

### Auto Flow: bulk video generation without the manual loop

- 2 November 2026

Card link → /resources/auto-flow (screen-reader label: "Auto Flow: bulk video generation without the manual loop")

### Lazy Meet: joining the call so you do not have to

- 2 November 2026

Card link → /resources/lazy-meet (screen-reader label: "Lazy Meet: joining the call so you do not have to")

### The Ruff Agency: one workspace instead of six tools

- 2 November 2026

Card link → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")

### Tomori: a shop for hand-dyed Adire, built for a phone

- 2 November 2026

Card link → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")

### Marvy: course videos filed in one step

- 2 November 2026

Card link → /resources/marvy (screen-reader label: "Marvy: course videos filed in one step")

### Rayo: quotes your client accepts on the page

- 2 November 2026

Card link → /resources/rayo (screen-reader label: "Rayo: quotes your client accepts on the page")

### Dory: a budget app that always knows what is left

- 2 November 2026

Card link → /resources/dory (screen-reader label: "Dory: a budget app that always knows what is left")

### Planes: a to-do list you race your friends on

- 2 November 2026

Card link → /resources/planes (screen-reader label: "Planes: a to-do list you race your friends on")

### Marque: brand guidelines, made easy

- 2 November 2026

Card link → /resources/marque (screen-reader label: "Marque: brand guidelines, made easy")

_(Screen-reader label for this nav: "Pages")_

Button (icon only, screen-reader label: "Previous page")

- Link: (screen-reader text: "Page") 1 → /resources

Button (icon only, screen-reader label: "Next page")

## Case study: Auto Flow

URL: `/resources/auto-flow`  
Meta title: Auto Flow: bulk video generation without the manual loop | WildHands  
Meta description: Point it at a folder of images and it generates every video unattended, three at a time.

**H1:** Auto Flow: bulk video generation without the manual loop

- 2 Nov 2026

WildHands Studio

Point it at a folder of images and it generates every video unattended, three at a time.

Caption: The app

Visual described to screen readers (aria-label): "Auto Flow working through a folder of images, three videos at a time."

### The problem

Google Flow asks for the same six steps on every single image: upload, configure, prompt, generate, wait, download. At a dozen images that is tedious. At a hundred it is a full working day of clicking, and one missed step means starting that image again.

### What we built

A cross-platform desktop app that drives the Flow interface directly. It takes a folder of images, a prompt template (or per-image prompts written by Gemini from the image itself), and runs the whole batch. Progress is written to CSV as it goes, so an interrupted run picks up where it stopped instead of reprocessing everything.

### Pipelining, not queueing

The obvious build runs one image at a time and spends most of its life waiting. This one starts uploading the next image once the current generation passes 20%, keeping up to three in flight, and parallelises every download at the end. That is where the time saving actually comes from.

### Knowing when a generation is done

Flow shows a live percentage overlay that simply vanishes on completion. Polling for the absence of an element is fragile: a network stall or a UI flicker reads as success. Completion is confirmed two ways instead: the overlay has to disappear and the finished video has to appear in the media picker with a valid ID. Failed generations are caught and retried once.

### By the numbers

- **~3×**: Faster per batch
- **3**: Generations in flight at once

### Outcome

A 24-image batch that took roughly two hours of supervised clicking now runs in about half an hour, unattended.

Auto Flow exists because the interesting part of generating video from images is choosing the images. Everything after that is the same six interactions repeated until the folder is empty.

### Two frontends, one automation core

The same automation logic is wired to two interfaces (a PyWebView app for the Python build and an Electron app for the Node build), so the tool can be packaged for macOS and Windows without maintaining two behaviours. A second mode downloads every video from an existing Flow project link, which turned out to be the feature people reached for most after the first batch.

### The part we chose not to build

The Electron build contains a half-finished engine pointing at Higgsfield, another video platform. It does not work, and it is staying that way. Higgsfield actively detects browser automation and refuses authenticated access; the standard workaround is to strip the automation flag with stealth launch flags, which would breach their terms of service. The selectors were written. The bypass was not.

_(Shared block: Case study closing call to action.)_

### More work

Button: See all → /resources

#### Lazy Meet: joining the call so you do not have to

- 2 November 2026

Card link → /resources/lazy-meet (screen-reader label: "Lazy Meet: joining the call so you do not have to")

#### The Ruff Agency: one workspace instead of six tools

- 2 November 2026

Card link → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")

#### Tomori: a shop for hand-dyed Adire, built for a phone

- 2 November 2026

Card link → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")

## Case study: Lazy Meet

URL: `/resources/lazy-meet`  
Meta title: Lazy Meet: joining the call so you do not have to | WildHands  
Meta description: Joins your calls at start time, muted and camera off, across three accounts.

**H1:** Lazy Meet: joining the call so you do not have to

- 2 Nov 2026

WildHands Studio

Joins your calls at start time, muted and camera off, across three accounts.

Caption: The app

Visual described to screen readers (aria-label): "Lazy Meet listing the day’s meetings across three Google accounts."

### The problem

Running several Google accounts turns every meeting into a small sequence of chores: find the right session, open the link, mute, turn the camera off, join. Repeat it four times a day and eventually you join a call live and unmuted, or you stay chained to your desk so you do not.

### What we built

A desktop app that connects up to three Google accounts over OAuth, stores each refresh token encrypted in the system keychain, and checks every connected calendar every five minutes for meetings with a Meet link. Each account gets its own isolated browser session, so signing in to one never disturbs another.

### The join sequence

At join time it opens the meeting in that account session, confirms the microphone toggle reads as off, confirms the camera toggle reads as off, clicks Join, then verifies the in-call interface actually appeared. A native notification follows, with a button to bring the window forward.

### Failing safe

Google changes the Meet interface without notice, so every selector lives in one file. If either toggle state cannot be confirmed, the join is abandoned before the button is clicked. The app will occasionally skip a meeting after a Google redesign. It will never join one with your microphone live.

### By the numbers

- **3**: Google accounts, kept separate
- **5 min**: Calendar poll interval

### Outcome

Meetings join themselves at the scheduled minute, muted, whether the window is focused, minimised or behind everything else.

The core idea is small: a calendar already knows when your meetings are and where they live. Nothing else should need your attention.

### Beyond the calendar

Not every meeting arrives as a calendar invite, so links can be pasted in directly and either scheduled once or repeated weekly. Out-of-office days are respected, the join lead time is configurable (a minute early or exactly on the hour), and optional reminders fire beforehand for the calls you do want to prepare for.

### Read-only, by design

The Google integration requests calendar.readonly and nothing more. The app never writes to a calendar, never creates events, and never touches anything outside the meeting links it needs to open.

_(Shared block: Case study closing call to action.)_

### More work

Button: See all → /resources

#### The Ruff Agency: one workspace instead of six tools

- 2 November 2026

Card link → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")

#### Tomori: a shop for hand-dyed Adire, built for a phone

- 2 November 2026

Card link → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")

#### Marvy: course videos filed in one step

- 2 November 2026

Card link → /resources/marvy (screen-reader label: "Marvy: course videos filed in one step")

## Case study: The Ruff Agency

URL: `/resources/the-ruff-agency`  
Meta title: The Ruff Agency: one workspace instead of six tools | WildHands  
Meta description: Clients, contracts, invoices, tasks and a client portal in one shared workspace.

**H1:** The Ruff Agency: one workspace instead of six tools

- 2 Nov 2026

WildHands Studio

Clients, contracts, invoices, tasks and a client portal in one shared workspace.

Caption: The workspace

Visual described to screen readers (aria-label): "The Fey workspace: the dashboard, the CRM and the Playground."

### The problem

Agencies run on scattered infrastructure. Clients live in a spreadsheet, invoices in a separate system, payment tracking in someone head, and project handoffs in email. Growing the business means buying another tool, and teams work in silos because there is nowhere central to see who is doing what.

### What we built

A workspace where contacts, contracts, invoices and tasks all sit together, and every member sees the same data gated by their role. Clients get their own portal on a workspace subdomain with independent credentials: the same records, a different view, read-only or collaborative depending on what they are given.

### The hard part: two access patterns, one database

Team access had to be added to a schema whose policies assumed a single owner, across more than twenty tables, without a single existing read path breaking. The answer was two SECURITY DEFINER functions that resolve workspace membership once, referenced from permissive policies everywhere else. Postgres ORs permissive policies together, so the original owner-only check and the new member check coexist: adding a teammate can only ever grant access, never revoke it.

### Getting paid

Invoices carry their own lifecycle from draft through sent to paid, with customisable templates, and settle through Stripe or Paystack depending on where the client is. Transactional email runs on Resend, and a WhatsApp bot pushes task updates to people who live in messaging rather than dashboards.

### By the numbers

- **88**: Database migrations shipped
- **20+**: Tables under row-level security

### Outcome

A client goes from invited to working inside their own portal without manual setup, pending approvals or a single email thread.

The Ruff Agency is the platform an agency runs on, built because the alternative was renting five products that do not know about each other.

### Beyond the core

An admin-only playground generates marketing assets through DALL-E 3 and Gemini, with a reference-image workflow and prompt review before anything is produced. A separate vault holds legal, brand and finance documents with a visibility model that decides which portals can see what, so a contract shared with one client is not quietly readable by another.

_(Shared block: Case study closing call to action.)_

### More work

Button: See all → /resources

#### Tomori: a shop for hand-dyed Adire, built for a phone

- 2 November 2026

Card link → /resources/tomori (screen-reader label: "Tomori: a shop for hand-dyed Adire, built for a phone")

#### Marvy: course videos filed in one step

- 2 November 2026

Card link → /resources/marvy (screen-reader label: "Marvy: course videos filed in one step")

#### Rayo: quotes your client accepts on the page

- 2 November 2026

Card link → /resources/rayo (screen-reader label: "Rayo: quotes your client accepts on the page")

## Case study: Tomori

URL: `/resources/tomori`  
Meta title: Tomori: a shop for hand-dyed Adire, built for a phone | WildHands  
Meta description: A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.

**H1:** Tomori: a shop for hand-dyed Adire, built for a phone

- 2 Nov 2026

WildHands Studio

A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.

Caption: The shop

Visual described to screen readers (aria-label): "The Tomori shop’s homepage, with its collections."

### The problem

TOMORI makes hand-dyed Adire and Ankara bubu dresses, pants and two-piece sets. Most shoppers find a piece on Instagram or WhatsApp, on a phone, on mobile data. Marketplaces bury the clothes between phone cases, stock themes cover them in badges and countdowns, and selling through DMs leaves orders, payments and stock in one person’s head.

### What we built

A storefront that opens on a full-width photo of each collection, with every piece priced in naira. Paystack takes card, transfer or USSD, every step is sized for a thumb, and delivery fees are set by the owner and shown before anyone pays. A WhatsApp button sits on every page for shoppers who would rather ask first.

### A back office for one person

The owner runs the shop alone, between packing orders and answering messages, so the admin is written for a shop owner rather than a developer. Every section says what it is for in a few words, times read “3 hours ago”, and every empty screen says what will show up there.

### The parts most shop admins do not have

At a market she picks a piece by its code and the shop makes a QR code the customer pays through on their own phone. Bags left unpaid for twenty minutes are listed so she can follow up. Visitors are counted on the shop itself, with no ad trackers. QR codes printed on delivery bags report every scan and can be pointed somewhere new after printing. Takings, costs and discount codes live in the same place.

### The rule behind it

The interface keeps to deep navy, white and one soft lilac for the main button, so the brightest thing on screen is always the fabric. No countdowns and no “only 2 left”.

### Outcome

The clothes are the loudest thing on every page, and the owner runs the whole shop from her phone.

_(Shared block: Case study closing call to action.)_

### More work

Button: See all → /resources

#### Marvy: course videos filed in one step

- 2 November 2026

Card link → /resources/marvy (screen-reader label: "Marvy: course videos filed in one step")

#### Rayo: quotes your client accepts on the page

- 2 November 2026

Card link → /resources/rayo (screen-reader label: "Rayo: quotes your client accepts on the page")

#### Dory: a budget app that always knows what is left

- 2 November 2026

Card link → /resources/dory (screen-reader label: "Dory: a budget app that always knows what is left")

## Case study: Marvy

URL: `/resources/marvy`  
Meta title: Marvy: course videos filed in one step | WildHands  
Meta description: Drop a video in and it lands in the right Drive folder, with the right people tagged.

**H1:** Marvy: course videos filed in one step

- 2 Nov 2026

WildHands Studio

Drop a video in and it lands in the right Drive folder, with the right people tagged.

Caption: The app

Visual described to screen readers (aria-label): "Marvy’s board of course videos, a video’s details, and its version history."

### The problem

A course-production team uploads videos to shared Google Drive folders all day. For every video someone found the folder by hand, dragged the file in, opened the tag sheet, copied four groups of email addresses and pasted four comments. Twenty videos in a sitting meant the same routine twenty times.

### What we built

Marvy reads the course code and week from the filename, finds the folder, checks the person has access and that the video is not already there, then uploads the video with its matching audio. The @mention comments come from the tag sheet and post as whoever is signed in, so it is always clear who did what. Every video then sits on one board with the team’s own statuses, through to final render.

### Quiet by default

The happy path asks nothing. Marvy only speaks up when something looks wrong, and then asks one clear question. A near match is shown, never accepted, and nothing it does can delete anything in Drive.

### Built for the team’s own machines

It runs entirely on the computer it is installed on, with no server and no tracking; the only thing it talks to is Google. The window works from 375 pixels wide to full screen, because people keep it docked beside After Effects between renders.

### Outcome

Nobody on the team has to think about where a video goes.

_(Shared block: Case study closing call to action.)_

### More work

Button: See all → /resources

#### Rayo: quotes your client accepts on the page

- 2 November 2026

Card link → /resources/rayo (screen-reader label: "Rayo: quotes your client accepts on the page")

#### Dory: a budget app that always knows what is left

- 2 November 2026

Card link → /resources/dory (screen-reader label: "Dory: a budget app that always knows what is left")

#### Planes: a to-do list you race your friends on

- 2 November 2026

Card link → /resources/planes (screen-reader label: "Planes: a to-do list you race your friends on")

## Case study: Rayo

URL: `/resources/rayo`  
Meta title: Rayo: quotes your client accepts on the page | WildHands  
Meta description: Send a quote with options, the client accepts one, and it becomes the invoice.

**H1:** Rayo: quotes your client accepts on the page

- 2 Nov 2026

WildHands Studio

Send a quote with options, the client accepts one, and it becomes the invoice.

Caption: The app

Visual described to screen readers (aria-label): "Rayo’s welcome tour, then its quotes, a client’s quote, invoices and clients."

### The problem

Freelancers and small studios write a quote in one document, then rebuild the same numbers in an invoice once the client agrees. The client usually gets a PDF with three options and replies by email to say which one.

### What we built

Rayo puts the choice on the page. You build a quote with options and send a link. The client picks one, watches the total update, and accepts it without a PDF to sign or an email to reply to. The accepted option becomes an invoice with your logo, bank details and terms already on it, and nothing is retyped.

### Money, followed through

The ledger shows paid, part paid and overdue, and what is still owed on each invoice, deposits included. Documents export as PDFs, and the mail Rayo sends goes out on your behalf.

### Two questions first

The overview answers where each quote stands and what money is in or owed before anything else. Most clients open their quote on a phone, so the quote page was designed for one first.

### Outcome

A quote that answers itself, and an invoice nobody has to retype.

_(Shared block: Case study closing call to action.)_

### More work

Button: See all → /resources

#### Dory: a budget app that always knows what is left

- 2 November 2026

Card link → /resources/dory (screen-reader label: "Dory: a budget app that always knows what is left")

#### Planes: a to-do list you race your friends on

- 2 November 2026

Card link → /resources/planes (screen-reader label: "Planes: a to-do list you race your friends on")

#### Marque: brand guidelines, made easy

- 2 November 2026

Card link → /resources/marque (screen-reader label: "Marque: brand guidelines, made easy")

## Case study: Dory

URL: `/resources/dory`  
Meta title: Dory: a budget app that always knows what is left | WildHands  
Meta description: Budget, shopping, loans and subscriptions in one place, with what is left always on top.

**H1:** Dory: a budget app that always knows what is left

- 2 Nov 2026

WildHands Studio

Budget, shopping, loans and subscriptions in one place, with what is left always on top.

Caption: The app

Visual described to screen readers (aria-label): "Dory moving through the dashboard, budget, shopping, loans and subscriptions."

### The problem

Money in Lagos moves in naira and gets typed in shorthand: 5k, 1.2m. It also lives in too many places: a bank app, a shopping list in notes, a mental tally of who borrowed what, and subscriptions that renew before anyone remembers them.

### What we built

Dory pulls all of it into one place. The money left for the month sits at the top of every screen. Food, rent, transport and data each get a bar for how much is spent. Shopping lists remember what things cost, and receipt scanning fills them in. Loans show who owes you and who you owe, right beside the budget, and subscriptions due this week are flagged.

### A bank, built in

Dory shows the Kuda balance and can make transfers from it, so checking what is left and paying for something happen in the same app.

### Playful frame, serious figures

Shapes and colour carry the personality, while amounts stay calm and exact. The common action on each screen is large and in reach of one thumb, and every press, save and error answers, briefly.

### Outcome

You always know what is left without doing the maths.

_(Shared block: Case study closing call to action.)_

### More work

Button: See all → /resources

#### Planes: a to-do list you race your friends on

- 2 November 2026

Card link → /resources/planes (screen-reader label: "Planes: a to-do list you race your friends on")

#### Marque: brand guidelines, made easy

- 2 November 2026

Card link → /resources/marque (screen-reader label: "Marque: brand guidelines, made easy")

#### Auto Flow: bulk video generation without the manual loop

- 2 November 2026

Card link → /resources/auto-flow (screen-reader label: "Auto Flow: bulk video generation without the manual loop")

## Case study: Planes

URL: `/resources/planes`  
Meta title: Planes: a to-do list you race your friends on | WildHands  
Meta description: Swipe to land a task, fly one to a friend, and race your crew on the leaderboard.

**H1:** Planes: a to-do list you race your friends on

- 2 Nov 2026

WildHands Studio

Swipe to land a task, fly one to a friend, and race your crew on the leaderboard.

Caption: The app

Visual described to screen readers (aria-label): "Planes ticking a task off for 10 XP, then showing progress and the friends leaderboard."

### The problem

Most to-do apps are good at collecting tasks and bad at getting them done. The list grows, nobody else knows either way, and adding a task means stopping to type, which is enough friction that half of them never go in.

### What we built

Planes plans tasks by the day. Swipe right to land one, swipe left to push it to tomorrow, time it, or send it to a friend like a paper plane. Tasks go in by voice, or get pulled out of a screenshot or a note. XP, streaks and badges keep score, and a live leaderboard has only your crew on it.

### One codebase, three places

One Next.js codebase runs Planes on the web and as a desktop app, with an Android app alongside.

### Fast hands, quick feedback

Gestures follow the finger, every action answers in under 250 milliseconds, and celebrations finish in about a second. Anything you can swipe you can also tap, colour is never the only signal, and movement steps aside for anyone who asks for less of it.

### Outcome

Finishing a task feels like landing a plane.

_(Shared block: Case study closing call to action.)_

### More work

Button: See all → /resources

#### Marque: brand guidelines, made easy

- 2 November 2026

Card link → /resources/marque (screen-reader label: "Marque: brand guidelines, made easy")

#### Auto Flow: bulk video generation without the manual loop

- 2 November 2026

Card link → /resources/auto-flow (screen-reader label: "Auto Flow: bulk video generation without the manual loop")

#### Lazy Meet: joining the call so you do not have to

- 2 November 2026

Card link → /resources/lazy-meet (screen-reader label: "Lazy Meet: joining the call so you do not have to")

## Case study: Marque

URL: `/resources/marque`  
Meta title: Marque: brand guidelines, made easy | WildHands  
Meta description: Start from a logo, edit the guide in place, and publish it at one link.

**H1:** Marque: brand guidelines, made easy

- 2 Nov 2026

WildHands Studio

Start from a logo, edit the guide in place, and publish it at one link.

Caption: The app

Visual described to screen readers (aria-label): "The Marque editor working on a sample brand guide."

### Starting from a logo

Name the brand and add its website, and Marque reads its logo, colours and description. Pick a palette, and AI can write the first draft of the copy.

### An editor, not a form

Every guide starts from a twelve-section template with 29 block types, edited right where they sit, with undo and redo, an asset library and a Brand panel for the logo, palette, type, motion, icons and cover.

### Published at one link

A finished guide goes live at its own address, with sidebar navigation, search, one section per page and a Markdown export.

### Works before you sign up

Marque runs signed out, saving in the browser. Signing in saves to an account, syncs across tabs and devices, and offers to move the brands already made into it.

### Outcome

A brand guide that lives at a link, not in a PDF nobody can find.

Caption: The website

Visual described to screen readers (aria-label): "The Marque website’s homepage."

_(Shared block: Case study closing call to action.)_

### More work

Button: See all → /resources

#### Auto Flow: bulk video generation without the manual loop

- 2 November 2026

Card link → /resources/auto-flow (screen-reader label: "Auto Flow: bulk video generation without the manual loop")

#### Lazy Meet: joining the call so you do not have to

- 2 November 2026

Card link → /resources/lazy-meet (screen-reader label: "Lazy Meet: joining the call so you do not have to")

#### The Ruff Agency: one workspace instead of six tools

- 2 November 2026

Card link → /resources/the-ruff-agency (screen-reader label: "The Ruff Agency: one workspace instead of six tools")

---

# Pricing

## Pricing

URL: `/pricing`  
Meta title: Pricing | WildHands  
Meta description: A website live in 72 hours: Starter ₦150,000 or Standard ₦250,000, one-off, with half paid to start. Apps and internal tools are quoted after a discovery call.

Interactive states not in the default view: the price table has two tabs, "Full price" and "Deposit". On "Deposit", each price shows the deposit with the unit " to start" (₦75,000 to start, ₦125,000 to start) instead of " one-off", and the footnote reads "*Half the price, paid to start the work. You approve the design within 24 hours, before any code is written". The calculator's "How you pay" dropdown offers "Full price" / "Deposit to start" (placeholder "Choose how to pay"); the "Plan" dropdown offers Starter / Standard / Apps / Tools (placeholder "Choose a plan"). The pages slider runs from 1 to 10 and reads "1 page" / "4 pages"; the budget slider runs from ₦75,000 to ₦1,000,000. The calculator lines are "{Plan} full price", "Deposit to start (50%)", "Budget left after full price", "Pay now", and "Best fit for these pages: {plan}, {price}", which reads "quoted after a discovery call" when the pages need Apps. In the comparison table, ticks and crosses are announced as "Included" and "Not included".

**H1:** Pricing _(visually hidden heading, read by screen readers and search engines)_

Live in 72 hours, priced up front

A website for your business for one fixed price, with half paid to start. You approve the design within 24 hours, before any code is written. Apps, internal tools and larger builds are quoted after a discovery call.

Button: Get in touch → /contact

Button: Request a quote → /request-a-quote

### Prices

#### Plan

Price

- Starter | ₦150,000 one-off
- Standard | ₦250,000 one-off
- Apps | Quoted
- Tools | Quoted

*One price for the whole build. Starter and Standard go live in 72 hours

#### Deposit to start

Deposit

- Starter | 50% of the price
- Standard | 50% of the price
- Apps | Quoted
- Tools | Quoted

*Paying from outside Nigeria? Ask for USD pricing on WhatsApp: 0812 979 6927

[Button: Full price] [Button: Deposit]

#### Starter

One page, live in 72 hours

₦150,000 one-off

- One page, mobile-ready
- WhatsApp and contact buttons that work
- Your logo, photos and text laid out professionally
- Hosted and connected to your domain
- 2 rounds of edits

Button: Start with Starter → /contact

Most popular

#### Standard

Up to 4 pages you can edit yourself

₦250,000 one-off

- Everything in Starter, up to 4 pages
- Admin dashboard to edit text, images, prices and announcements
- Analytics in plain English: visitors, top pages, where they came from
- Copywriting from a 15-minute call
- 3 rounds of edits

Button: Start with Standard → /contact

#### Apps

Web apps and larger builds

Quoted

- Custom web apps
- Larger websites, past 4 pages
- Built around how you actually work
- Quoted after a discovery call
- Written scope before work starts

Button: Talk to us → /contact

#### Tools

Dashboards and automation

Quoted

- Dashboards that put the numbers in one place
- Automation between the tools you already use
- Judged on hours returned
- Quoted after a discovery call
- Written scope before work starts

Button: Talk to us → /contact

### Compare the plans

_(Desktop: one table. Phones: the same rows, one plan at a time, chosen with tabs "Starter", "Standard", "Apps", "Tools"; each phone panel opens with the row "Price" and ends with that plan's button.)_

| | Starter | Standard | Apps | Tools |
| --- | --- | --- | --- | --- |
| --- | --- | --- | --- | --- |
| **Price** | ₦150,000 | ₦250,000 | Quoted | Quoted |
| **The website** | | | | |
| Pages | 1 | Up to 4 | Per scope | Per scope |
| Mobile-ready | Included (tick) | Included (tick) | Per scope | Per scope |
| WhatsApp and contact buttons | Included (tick) | Included (tick) | Per scope | Per scope |
| Hosted and connected to your domain | Included (tick) | Included (tick) | Per scope | Per scope |
| **Running it yourself** | | | | |
| Admin dashboard to edit it yourself | Not included (cross) | Included (tick) | Per scope | Per scope |
| Analytics in plain English | Not included (cross) | Included (tick) | Per scope | Per scope |
| Copywriting from a 15-minute call | Not included (cross) | Included (tick) | Per scope | Per scope |
| **Timeline and payment** | | | | |
| Live in | 72 hours | 72 hours | Per scope | Per scope |
| Rounds of edits | 2 | 3 | Per scope | Per scope |
| Deposit to start | ₦75,000 | ₦125,000 | Quoted | Quoted |

Buttons under the desktop table: Get Starter → /contact; Get Standard → /contact; Talk to us → /contact; Talk to us → /contact. Buttons on the phone panels: Start with Starter, Start with Standard, Talk to us, Talk to us (all → /contact).

### What you would pay

Choose a plan and how you want to pay, then set how many pages you need and your budget.

#### What you pay now

₦150,000

Against a budget of ₦150,000

Details | Amount

Starter full price | ₦150,000

Deposit to start (50%) | ₦75,000

Budget left after full price | ₦0

Pay now | ₦150,000

Best fit for these pages: **Starter**, ₦150,000

*Live in 72 hours on Starter and Standard. Apps and tools are quoted after a discovery call.

Label: Pages you need

*Starter is one page, Standard up to 4

`field: type=text`

`field: type=range`

Label: How you pay

Button: Full price

Label: Plan

Button: Starter

Label: Your budget

Roughly what you have set aside

₦150,000

`field: type=range`

### Pricing questions

**FAQ, Q:** What do I need to send you?

**A:** Your logo, your photos and the text you want on the site. On Standard we can write the copy for you from a 15-minute call.

**FAQ, Q:** What if I do not like the design?

**A:** You see the design first and approve it within 24 hours, before any code is written. Starter includes 2 rounds of edits and Standard includes 3.

**FAQ, Q:** Do I own the website?

**A:** Yes. You own the site, the domain and everything on it.

**FAQ, Q:** What about my domain?

**A:** If you already have one, we connect it. If not, we register one for you and add the cost to the invoice.

**FAQ, Q:** What happens after the edit rounds?

**A:** Further changes are billed by the hour, and we quote them before we start.

**FAQ, Q:** How do I start?

**A:** Pay the deposit, half the price, to start. Starter and Standard sites are live in 72 hours.

**FAQ, Q:** I am paying from outside Nigeria. Can I pay in dollars?

**A:** Yes. Ask us for USD pricing on WhatsApp: 0812 979 6927.

---

# About

## About

URL: `/about`  
Meta title: About | WildHands  
Meta description: WildHands is a Lagos-based studio building custom websites, apps and internal tools for businesses across Nigeria and Africa.

The hero animates between "Our mission", the line "To build systems that give people their time back." and the site description. When the email card is clicked, "Copied to clipboard" shows and screen readers hear "Email address copied".

### To build systems that give people their time back.

**H1:** Our mission

_(Visual only, hidden from screen readers:)_

To build systems that give people their time back.

_(end visual only)_

_(Visual only, hidden from screen readers:)_

Our mission

_(end visual only)_

WildHands builds custom websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa. Built around how you actually work, not a template.

### We started small, solving one team's repetitive work. Today we build the systems that run behind businesses, driven by the same idea.

We judge every system we build by how much time it saves you. You can see that in the work we ship and in how we scope a project, from first call to launch.

Every engagement starts with a discovery call, to learn what is broken and what it is costing you in time. Then a written plan for your brief, with what is in scope and what is out, and one price worked out from that scope.

We're based in Lagos, working with businesses across Nigeria and the wider African market.

Image alt: "Colleagues talking through an idea in an office."

Image alt: "Four men working through a project around a laptop."

Image alt: "A team meeting around a table in an office in Lagos."

### Why we built WildHands

WildHands exists because most teams lose hours every week to work a system could do in seconds.

We would rather build the system once than watch anyone rebuild the same report again. Your hours should go into the work only you can do.

Button: Talk to us → /contact

- hello@whstd.com

[Button (icon only, screen-reader label: "Copy email address to clipboard")] (visual: Copy to clipboard) (visual: Copied to clipboard)

- See what we ship

Card link → /resources (screen-reader label: "See what we ship")

- Logo and colours

Card link → /brand-assets (screen-reader label: "Logo and colours")

---

# Careers

## Careers

URL: `/careers`  
Meta title: Careers | WildHands  
Meta description: Open roles at WildHands. Remote-only, async-first, and honest about what the work actually is.

If no roles are open, the list is replaced by: "Nothing open right now. We still read speculative applications." Each role card shows a "View role" label.

**H1:** Small team, unglamorous problems, real ownership.

We are remote-only and async-first, and we would rather tell you what the work is than sell you on it.

### How we work

#### Remote only

- No office, no hybrid expectation, no core-hours theatre.

#### Flexible hours

- Overlap for the meetings that need it. The rest is yours to arrange.

#### Async by default

- Written first. A meeting has to earn itself.

#### Contractor baseline

- A monthly hours baseline agreed up front rather than negotiated each month.

### Open positions

#### Senior Frontend Engineer

- Build and migrate marketing platforms for clients whose in-house teams will run them afterwards.

_(Screen-reader label for this ul: "Role details")_

- Senior
- Remote

(visual: View role)

#### Product Designer

- Design systems and page templates that a client team can extend for years without us.

_(Screen-reader label for this ul: "Role details")_

- Mid to senior
- Remote

(visual: View role)

### Not a fit today?

Tell us what you do and we will keep it on file. Freelancers can also join the pool through the Freelance Hub.

[Button: Get in touch → /contact] [Button: Freelance Hub → /freelance-hub]

## Role: Senior Frontend Engineer

URL: `/careers/senior-frontend-engineer`  
Meta title: Senior Frontend Engineer | WildHands  
Meta description: Build and migrate marketing platforms for clients whose in-house teams will run them afterwards.

Back link on role pages: "All open roles" → /careers.

Link: All open roles → /careers

**H1:** Senior Frontend Engineer

Build and migrate marketing platforms for clients whose in-house teams will run them afterwards.

_(Screen-reader label for this ul: "Role details")_

- Senior
- Remote

Button: Apply now → /careers/senior-frontend-engineer/apply

### What we need

- Substantial production experience with a modern component framework
- Comfortable owning performance and accessibility, not treating them as a later pass
- Has migrated a real site off a legacy platform and can describe what went wrong

### Nice to have

- Astro
- Headless CMS modelling
- Design systems work

Button: Apply for this role → /careers/senior-frontend-engineer/apply

## Role: Product Designer

URL: `/careers/product-designer`  
Meta title: Product Designer | WildHands  
Meta description: Design systems and page templates that a client team can extend for years without us.

Link: All open roles → /careers

**H1:** Product Designer

Design systems and page templates that a client team can extend for years without us.

_(Screen-reader label for this ul: "Role details")_

- Mid to senior
- Remote

Button: Apply now → /careers/product-designer/apply

### What we need

- Portfolio of shipped marketing or product work, not concept pieces
- Designs in a system rather than page by page
- Can hand off to engineers without a translation layer

### Nice to have

- Figma variables and tokens
- Motion design
- Front-end familiarity

Button: Apply for this role → /careers/product-designer/apply

## Apply: Senior Frontend Engineer

URL: `/careers/senior-frontend-engineer/apply`  
Meta title: Apply for Senior Frontend Engineer | WildHands  
Meta description: Apply for the Senior Frontend Engineer role at WildHands.

Form messages: see Shared block: forms.

**H1:** Apply for Senior Frontend Engineer

A few details and, if you like, your CV. We read every application ourselves and reply either way, usually within a week. Questions first? Email us at [Link: hello@whstd.com → mailto:hello@whstd.com].

(Hidden anti-spam field, never shown to people: "Company fax")

Label: First name *

`field: type=text, name='firstName', placeholder='Your first name', maxlength='80'`

Label: Last name *

`field: type=text, name='lastName', placeholder='Your last name', maxlength='80'`

Label: Email *

`field: type=email, name='email', placeholder='you@example.com', maxlength='200'`

Label: LinkedIn URL (optional)

`field: type=url, name='linkedinUrl', placeholder='https://www.linkedin.com/in/you', maxlength='500'`

CV (optional)

PDF, DOC or DOCX, up to 3.5MB.

Label: `field: type=file, name='cv', accept='.pdf,.doc,.docx'` (visual: Choose file) No file chosen

Label: Anything you want us to know (optional)

`field: type=textarea, name='coverNote', placeholder='A line or two is plenty', maxlength='5000'`

Label: `field: type=checkbox, name='consentsToProcessing'` I agree to WildHands processing my data for this application. *

Button: Send application

Read how we handle your details in our [Link: privacy policy → /privacy].

## Apply: Product Designer

URL: `/careers/product-designer/apply`  
Meta title: Apply for Product Designer | WildHands  
Meta description: Apply for the Product Designer role at WildHands.

Identical to the Senior Frontend Engineer application page above, with "Product Designer" in place of "Senior Frontend Engineer" (H1: "Apply for Product Designer").

---

# Freelance Hub

## Freelance Hub

URL: `/freelance-hub`  
Meta title: Freelance Hub | WildHands  
Meta description: Freelance with WildHands. Scoped briefs, direct client contact, no unpaid pitching, thirty-day payment terms.

Form messages and dropdown options: see Shared block: forms.

**H1:** Work with us, not for us.

Scoped briefs, direct client contact, and no unpaid pitching. Here is exactly how it runs.

Button: Apply to the pool → #apply

### Why people stay in the pool

1. (visual: 01)

#### Paid on time

Thirty-day terms, and we chase our clients so you do not have to chase us.

2. (visual: 02)

#### Scoped work

You get a written brief with an agreed definition of done, not a standing Slack channel.

3. (visual: 03)

#### No unpaid pitching

We do not ask freelancers to produce speculative work to win a project.

4. (visual: 04)

#### Direct client contact

You talk to the client. We do not put an account manager between you and the decision.

5. (visual: 05)

#### Repeat engagements

Most of our freelancers work with us across several projects rather than one.

6. (visual: 06)

#### Your own tools

We care that it is maintainable. Use whatever editor you like.

### How it works

1. (visual: 01)

#### Apply

Send the form below with a portfolio we can actually look at.

2. (visual: 02)

#### Short call

Thirty minutes on what you like working on and what you avoid.

3. (visual: 03)

#### Into the pool

We match you against briefs as they come in.

4. (visual: 04)

#### First engagement

A written scope, an agreed rate, and a named point of contact.

### Apply

One form. We read every one and reply either way.

(Hidden anti-spam field, never shown to people: "Company fax")

Label: First name *

`field: type=text, name='firstName', placeholder='Your first name', maxlength='80'`

Label: Last name *

`field: type=text, name='lastName', placeholder='Your last name', maxlength='80'`

Label: Email *

`field: type=email, name='email', placeholder='you@example.com', maxlength='200'`

Label: LinkedIn URL *

`field: type=url, name='linkedinUrl', placeholder='https://www.linkedin.com/in/you', maxlength='500'`

Label: Portfolio or GitHub URL *

`field: type=url, name='portfolioUrl', placeholder='https://', maxlength='500'`

CV *

PDF, DOC or DOCX, up to 3.5MB.

Label: `field: type=file, name='cv', accept='.pdf,.doc,.docx'` (visual: Choose file) No file chosen

Label: Country of residence * (screen-reader text: "(required)")

Button: Choose a country

Label: Country of tax residence * (screen-reader text: "(required)")

Button: Choose a country

Label: Position * (screen-reader text: "(required)")

Button: Choose a position

Label: Availability * (screen-reader text: "(required)")

Button: Choose your availability

Label: Hours per month * (screen-reader text: "(required)")

Button: Choose your hours

Label: Interested in long-term work? * (screen-reader text: "(required)")

Button: Choose an answer

Legend: Confirmations

Label: `field: type=checkbox, name='confirmsB2B'` I can invoice as a registered business (B2B). *

Label: `field: type=checkbox, name='consentsToProcessing'` I agree to WildHands processing my data for this application. *

Label: `field: type=checkbox, name='consentsToFutureContact'` Keep my details for future opportunities. (optional)

Button: Submit application

Read how we handle your details in our [Link: privacy policy → /privacy].

### Freelance questions

**FAQ, Q:** How are freelance rates set?

**A:** You tell us your rate. We do not run reverse auctions and we do not ask people to undercut each other for a brief.

**FAQ, Q:** How much work can I expect?

**A:** It varies with the project pipeline and we will not pretend otherwise. Most people in the pool work with us in blocks rather than continuously.

**FAQ, Q:** Can I work with you part-time alongside other clients?

**A:** Yes. Most of our freelancers do. We agree an hours-per-month baseline up front so both sides can plan.

**FAQ, Q:** What time zones do you work across?

**A:** We are async-first, so the overlap requirement is usually a couple of hours rather than a full working day.

**FAQ, Q:** How long does the application take to review?

**A:** We aim to reply within a week either way.

### Prefer to just email?

Send a portfolio link and a line about what you do.

Link: hr@whstd.com → mailto:hr@whstd.com

### Not ready to apply?

We email when new briefs open up. No more than monthly.

(Hidden anti-spam field, never shown to people: "Company fax")

Label: Email address

`field: type=email, name='email', placeholder='you@company.com', maxlength='200'`

Button: Subscribe

---

# Insights (blog)

## Insights index

URL: `/blog`  
Meta title: Insights | WildHands  
Meta description: WildHands Insights: what a website costs in Nigeria, how to choose an agency, and what a business website needs.

When a category has no posts, the grid shows: "No posts in this category yet."

**H1:** Insights _(visually hidden heading, read by screen readers and search engines)_

### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Image alt: "A woman in a bright print top working on her laptop."

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

_[Hidden on phones, shown from tablet width up:]_

Image alt: "Two colleagues working through something together on a laptop."

### What Is an Internal Tool, and Does Your Business Need One?

- 5 Nov 2026
- Tools & Systems

Card link → /blog/what-is-an-internal-tool (screen-reader label: "What Is an Internal Tool, and Does Your Business Need One?")

Image alt: "A trader in traditional dress checking his phone among his goods."

### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 Nov 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A woman in a blazer working at her laptop in an open-plan office."

### When Should You Replace Spreadsheets With a Custom Tool?

- 27 Oct 2026
- Tools & Systems

Card link → /blog/replace-spreadsheets-with-custom-tool (screen-reader label: "When Should You Replace Spreadsheets With a Custom Tool?")

Image alt: "A man using his phone on a busy street in Ikeja, Lagos."

### Web App or Mobile App: Which Should You Build First?

- 20 Oct 2026
- Apps

Card link → /blog/web-app-vs-mobile-app (screen-reader label: "Web App or Mobile App: Which Should You Build First?")

_[end hidden on phones]_

_(Screen-reader label for this nav: "Filter by category")_

- Link: All posts → /blog
- Link: Websites → /blog/category/websites
- Link: Apps → /blog/category/apps
- Link: Tools & Systems → /blog/category/tools-and-systems
- Link: Pricing → /blog/category/pricing

Image alt: "A woman in a bright print top working on her laptop."

### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "Two colleagues working through something together on a laptop."

### What Is an Internal Tool, and Does Your Business Need One?

- 5 November 2026
- Tools & Systems

Card link → /blog/what-is-an-internal-tool (screen-reader label: "What Is an Internal Tool, and Does Your Business Need One?")

Image alt: "A trader in traditional dress checking his phone among his goods."

### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A woman in a blazer working at her laptop in an open-plan office."

### When Should You Replace Spreadsheets With a Custom Tool?

- 27 October 2026
- Tools & Systems

Card link → /blog/replace-spreadsheets-with-custom-tool (screen-reader label: "When Should You Replace Spreadsheets With a Custom Tool?")

Image alt: "A man using his phone on a busy street in Ikeja, Lagos."

### Web App or Mobile App: Which Should You Build First?

- 20 October 2026
- Apps

Card link → /blog/web-app-vs-mobile-app (screen-reader label: "Web App or Mobile App: Which Should You Build First?")

Image alt: "Four women gathered around a laptop in an office."

### How Much Does It Cost to Build an App in Nigeria?

- 13 October 2026
- Apps
- Pricing

Card link → /blog/how-much-does-it-cost-to-build-an-app-in-nigeria (screen-reader label: "How Much Does It Cost to Build an App in Nigeria?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

Image alt: "A woman working on her laptop with her phone beside her."

### How to Accept Payments on Your Website in Nigeria

- 29 September 2026
- Websites
- Pricing

Card link → /blog/accept-payments-website-nigeria (screen-reader label: "How to Accept Payments on Your Website in Nigeria")

Image alt: "A man working on his laptop on a sofa."

### How Much Are Domain, Hosting and Maintenance in Nigeria?

- 22 September 2026
- Websites
- Pricing

Card link → /blog/domain-hosting-maintenance-cost-nigeria (screen-reader label: "How Much Are Domain, Hosting and Maintenance in Nigeria?")

Image alt: "A woman smiling at her desk with a laptop open in front of her."

### How Long Does It Take to Build a Website?

- 15 September 2026
- Websites

Card link → /blog/how-long-does-it-take-to-build-a-website (screen-reader label: "How Long Does It Take to Build a Website?")

Image alt: "A small team talking in an office in Lagos."

### How to Choose a Web Development Agency in Lagos

- 7 September 2026
- Websites

Card link → /blog/choose-web-development-agency-lagos (screen-reader label: "How to Choose a Web Development Agency in Lagos")

Image alt: "A business owner on a tablet, surrounded by packed orders."

### How Much Does E-commerce Development Cost in Nigeria?

- 7 September 2026
- Websites

Card link → /blog/ecommerce-development-cost-nigeria (screen-reader label: "How Much Does E-commerce Development Cost in Nigeria?")

Image alt: "A man smiling as he types on his laptop."

### What Should a Nigerian Business Website Include?

- 7 September 2026
- Websites

Card link → /blog/nigerian-business-website-checklist (screen-reader label: "What Should a Nigerian Business Website Include?")

Image alt: "A woman writing notes beside her laptop."

### How Much Does a Website Cost in Nigeria?

- 7 September 2026
- Websites

Card link → /blog/website-cost-nigeria (screen-reader label: "How Much Does a Website Cost in Nigeria?")

Image alt: "A man planning with sticky notes on a board."

### Best Website Structure for Nigerian Businesses

- 7 September 2026
- Websites

Card link → /blog/website-structure-nigerian-businesses (screen-reader label: "Best Website Structure for Nigerian Businesses")

_(Screen-reader label for this nav: "Pages")_

Button (icon only, screen-reader label: "Previous page")

- Link: (screen-reader text: "Page") 1 → /blog
- Link: (screen-reader text: "Page") 2 → /blog/page/2

Button: (screen-reader text: "Next page") → /blog/page/2

## Insights index, page 2

URL: `/blog/page/2`  
Meta title: Insights, page 2 | WildHands  
Meta description: WildHands builds custom websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa. Built around how you actually work, not a template.

Same layout and featured posts as the Insights index, with this category tab selected. The grid lists these posts (titles exactly as on the index):

- Website vs Web App: What Does Your Business Need?

## Insights category: Websites

URL: `/blog/category/websites`  
Meta title: Websites | Insights | WildHands  
Meta description: Websites articles from WildHands Insights.

Same layout and featured posts as the Insights index, with this category tab selected. The grid lists these posts (titles exactly as on the index):

- How to Get Your Business on Google in Nigeria (Free)
- Do You Need a Website If You Sell on Instagram and WhatsApp?
- Shopify vs a Custom Website in Nigeria: Which Is Better?
- How to Accept Payments on Your Website in Nigeria
- How Much Are Domain, Hosting and Maintenance in Nigeria?
- How Long Does It Take to Build a Website?
- How to Choose a Web Development Agency in Lagos
- How Much Does E-commerce Development Cost in Nigeria?
- What Should a Nigerian Business Website Include?
- How Much Does a Website Cost in Nigeria?
- Best Website Structure for Nigerian Businesses
- Website vs Web App: What Does Your Business Need?

## Insights category: Apps

URL: `/blog/category/apps`  
Meta title: Apps | Insights | WildHands  
Meta description: Apps articles from WildHands Insights.

Same layout and featured posts as the Insights index, with this category tab selected. The grid lists these posts (titles exactly as on the index):

- Web App or Mobile App: Which Should You Build First?
- How Much Does It Cost to Build an App in Nigeria?

## Insights category: Tools & Systems

URL: `/blog/category/tools-and-systems`  
Meta title: Tools & Systems | Insights | WildHands  
Meta description: Tools & Systems articles from WildHands Insights.

Same layout and featured posts as the Insights index, with this category tab selected. The grid lists these posts (titles exactly as on the index):

- What Is an Internal Tool, and Does Your Business Need One?
- When Should You Replace Spreadsheets With a Custom Tool?

## Insights category: Pricing

URL: `/blog/category/pricing`  
Meta title: Pricing | Insights | WildHands  
Meta description: Pricing articles from WildHands Insights.

Same layout and featured posts as the Insights index, with this category tab selected. The grid lists these posts (titles exactly as on the index):

- How Much Does It Cost to Build an App in Nigeria?
- Shopify vs a Custom Website in Nigeria: Which Is Better?
- How to Accept Payments on Your Website in Nigeria
- How Much Are Domain, Hosting and Maintenance in Nigeria?

## Article: How to Get Your Business on Google in Nigeria (Free)

URL: `/blog/how-to-get-your-business-on-google`  
Meta title: How to Get Your Business on Google in Nigeria (Free) | WildHands  
Meta description: Create a free Google Business Profile, verify it, and give Google a website it can read. Here are the steps, and what helps a small business rank higher.

**H1:** How to Get Your Business on Google in Nigeria (Free)

- 8 Nov 2026
- Link: Websites → /blog/category/websites

WildHands Studio

Image alt: "A woman in a bright print top working on her laptop."

There are two free steps. First, create and verify a Google Business Profile, which puts your business on Google Maps and in local search results. Second, give Google a website it can read and tell it where your pages are through Google Search Console. Neither costs anything, and Google does not sell higher places in its normal search results.

### Is it free to put your business on Google?

Yes. Google says you can [Link: add or claim your business at no charge → https://support.google.com/business/answer/2911778]. It also says that it [Link: never accepts money to include or rank sites → https://developers.google.com/search/docs/fundamentals/do-i-need-seo] in its search results. Paid ads are a separate product and are labelled as ads.

### How do you add your business to Google Maps?

1. Go to [Link: business.google.com/add → https://business.google.com/add] and choose to add your business.

2. Enter your business name, category, phone number and website, following the steps on screen.

3. Make sure your address is correct, or set a service area if customers do not visit you.

4. Choose a verification method and complete it.

5. Once verified, add your opening hours, photos, products or services, and a short description.

If your business already appears on Google Maps, search for it, open the listing and choose the option to claim it. If you do not serve customers at your address, such as a mobile business or one run from home, [Link: Google’s advice → https://support.google.com/business/answer/9157481] is to remove the address from your profile and set the areas you serve instead, up to 20 of them.

### How do you get your website to show up on Google?

1. Make sure the site can be crawled: no setting that hides it from search engines, and a sitemap listing every page.

2. Add the site to Google Search Console and verify that you own it.

3. Submit your sitemap in the Sitemaps report. Google notes that [Link: a sitemap is only a hint → https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap], but it helps Google find your pages.

4. Link your website from your Google Business Profile, and your profile from your website.

Every WildHands website ships with an XML sitemap and crawl rules set up correctly, so this part is ready on launch day.

### How long does it take to appear on Google?

Google says [Link: crawling can take anywhere from a few days to a few weeks → https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl]. Appearing for your business name usually comes first. Ranking for what you sell, such as “bakery in Lekki”, takes longer and depends on your competition. Be wary of anyone who promises a top spot: Google itself says no one can guarantee a number one ranking.

### What helps a small business rank higher?

- **A page for each main service.** One page about “event catering in Abuja” beats one page that lists twelve services in a line each.
- **Words your customers actually search.** Write how they talk: “how much is”, “near me”, the area names they use.
- **The same name, address and phone number everywhere.** On your website, your Google Business Profile and your social media.
- **Reviews from real customers.** Ask happy customers and reply to every review, good or bad.
- **A fast site that works on a phone.** Most of your customers will find you on mobile data.
- **Real photos.** Of your work, your team and your premises, on both your profile and your site.

For how to lay those pages out, see [Link: Best Website Structure for Nigerian Businesses → /blog/website-structure-nigerian-businesses].

### Can you be on Google without a website?

Yes, a Google Business Profile works on its own and is worth having either way. But a profile is one listing. A website gives Google pages to show for every service you offer and every question your customers ask, and gives people somewhere to go when they want more than a phone number. If you sell mostly on social media, read [Link: Do You Need a Website If You Sell on Instagram and WhatsApp? → /blog/do-i-need-a-website-instagram-whatsapp]

Need a website Google can read? Our [Link: websites → /use-cases/websites] start at ₦150,000 and go live 72 hours after you approve the design. [Link: See the prices → /pricing].

### Frequently asked questions

#### Do I need a physical shop to be on Google Maps?

No. If you serve customers at their location or online, remove your address from your Business Profile and set the areas you serve instead.

#### Does it cost money to verify my business on Google?

No. Adding, claiming and verifying a Google Business Profile is free.

#### Should I pay someone who guarantees first page on Google?

No. Google says no one can guarantee a number one ranking, and it never accepts money to rank sites in its normal results. Good SEO help explains what it will do and what results to expect, without guarantees.

#### Can I offer a discount for Google reviews?

No. Google’s Maps content policy does not allow offering incentives, such as payment, discounts or free goods, in exchange for reviews. Ask happy customers and make it easy with the review link from your profile.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

Image alt: "A woman working on her laptop with her phone beside her."

#### How to Accept Payments on Your Website in Nigeria

- 29 September 2026
- Websites
- Pricing

Card link → /blog/accept-payments-website-nigeria (screen-reader label: "How to Accept Payments on Your Website in Nigeria")

## Article: What Is an Internal Tool, and Does Your Business Need One?

URL: `/blog/what-is-an-internal-tool`  
Meta title: What Is an Internal Tool, and Does Your Business Need One? | WildHands  
Meta description: An internal tool is software your team uses to run the business, like an admin panel or dashboard. Here are real examples and how to tell if you need one.

**H1:** What Is an Internal Tool, and Does Your Business Need One?

- 5 Nov 2026
- Link: Tools & Systems → /blog/category/tools-and-systems

WildHands Studio

Image alt: "Two colleagues working through something together on a laptop."

An internal tool is software your own team uses to run the business, rather than something your customers see. Admin panels, dashboards, order trackers, approval flows and automations that move information between your other tools are all internal tools. You need one when a job your team does every week is slow, error-prone or stuck in spreadsheets and WhatsApp chats, and the time lost is worth more than the tool would cost.

### What are examples of internal tools?

- **Admin panel.** Where staff update products, prices, orders, bookings or website content without a developer.
- **Dashboard.** Sales, stock, cash and the few other numbers that matter, in one place and always up to date.
- **Order or job tracker.** Every order or job, its status, who owns it and what happens next.
- **Approval flow.** Expenses, discounts, leave or purchase requests that need a yes from the right person.
- **Client portal.** A login where clients see their own invoices, quotes or project progress. Clients use it, but your team runs it.
- **Automation.** Work that happens by itself, such as filing files, sending reminders or copying a paid order into your records.

### What is an admin panel, and does every website need one?

An admin panel is the private side of a website or app where you manage what the public sees. Not every website needs one, but any site where prices, products or announcements change often does, because otherwise every small change means paying a developer. Our Standard websites include an admin dashboard for editing text, images, prices and announcements for this reason.

A good admin panel is written for the person who uses it, not for a developer. The back office we built for [Link: TOMORI → /resources/tomori] says in a few words what each section is for, shows times as “3 hours ago”, and says on every empty screen what will appear there.

### What makes a good business dashboard?

- It shows a handful of numbers that lead to decisions, not every number you have.
- It updates itself from the systems where the work happens, so nobody copies figures into it.
- Labels are plain English: “Unpaid invoices”, not a code from the accounts system.
- It works on a phone, because that is where most owners check it.
- Every number can be traced back to the orders or payments behind it.

### Should you buy software or build a custom tool?

Buy when the job is the same in every business, such as payroll, accounting or email. Those products are mature and cheaper than anything built from scratch. Build when the job is how your business is different, or when off-the-shelf software forces your team into workarounds and double entry. Often the best answer is in between: keep the tools you already use and connect them, so information moves between them without anyone retyping it.

For a business still running on spreadsheets, our guide to [Link: when to replace spreadsheets with a custom tool → /blog/replace-spreadsheets-with-custom-tool] walks through the options from cheapest up.

### What do internal tools look like in practice?

- [Link: The Ruff Agency → /resources/the-ruff-agency]: clients, contracts, invoices, tasks and a client portal in one shared workspace, instead of six separate tools.
- [Link: Marvy → /resources/marvy]: course videos filed into the right Google Drive folder, with the right people tagged, in one step.
- [Link: Auto Flow → /resources/auto-flow]: point it at a folder of images and it generates every video unattended, three at a time.

### How much does an internal tool cost?

It depends on how many screens, user roles and connections it needs, so we quote [Link: tools and systems → /use-cases/tools-and-systems] after a discovery call, with a written scope before work starts. The useful test is hours returned: if a tool gives your team back ten hours a week, put a value on those hours and compare it with the price.

### How do you get started?

1. Pick the one weekly job that wastes the most time or causes the most mistakes.

2. Write down who does it, where the information comes from and where it ends up.

3. Note the decision it feeds, such as what to restock, who to chase or what to pay.

4. Bring that to a [Link: discovery call → /request-a-quote], and we will tell you what the smallest useful tool looks like.

### Frequently asked questions

#### Is an internal tool the same as an app?

It is an app built for your team rather than your customers. It usually runs in the browser, so staff can use it on a laptop or a phone without installing anything.

#### Can my staff use it on their phones?

Yes. We build every tool to work on a phone first, because that is where most people in the field, on the shop floor or on the road will use it.

#### Who can see what?

Each person logs in, and their role decides what they can see and change. Sales staff can see orders without seeing salaries, for example. Ask any developer how access, backups and logins are handled before you agree a build.

#### Can it connect to Paystack, WhatsApp or Google Sheets?

Usually, yes. Most services your business already uses have a way for other software to connect to them. Some, like the WhatsApp Business Platform, charge per message, so that cost belongs in the plan.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a blazer working at her laptop in an open-plan office."

#### When Should You Replace Spreadsheets With a Custom Tool?

- 27 October 2026
- Tools & Systems

Card link → /blog/replace-spreadsheets-with-custom-tool (screen-reader label: "When Should You Replace Spreadsheets With a Custom Tool?")

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

## Article: Do You Need a Website If You Sell on Instagram and WhatsApp?

URL: `/blog/do-i-need-a-website-instagram-whatsapp`  
Meta title: Do You Need a Website If You Sell on Instagram and WhatsApp? | WildHands  
Meta description: You can sell on Instagram and WhatsApp without a website, but you own neither. A simple site gives you an address on Google that no platform can switch off.

**H1:** Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 Nov 2026
- Link: Websites → /blog/category/websites

WildHands Studio

Image alt: "A trader in traditional dress checking his phone among his goods."

No, you can start selling without one, and many Nigerian businesses do. But you do not own your Instagram account or the rules WhatsApp sets for businesses, and neither puts you in front of people searching Google for what you sell. A website is the one place online that is entirely yours. Most growing businesses use all three: Instagram to be discovered, WhatsApp to talk to customers, and a website to be found and trusted.

### Can you sell on Instagram without a website?

Yes. Plenty of businesses take orders entirely through Instagram posts, direct messages and WhatsApp chats. It costs nothing to start and it is where many customers already spend their time. For testing an idea or selling to people who already know you, it is often the right place to begin.

### What are the risks of relying only on Instagram and WhatsApp?

- **You do not control the account.** A hacked, restricted or reported account can take your whole shop offline overnight, with no one to call.
- **The platform’s future is not your decision.** In May 2025, [Link: Meta threatened to suspend its platforms in Nigeria → https://nairametrics.com/2025/05/03/fccpc-reacts-to-metas-threat-of-exiting-nigeria-over-220-million-fine/] after a tribunal upheld a US$220 million fine from the Federal Competition and Consumer Protection Commission. Whatever comes of that dispute, it showed how much of a business can rest on one company’s decisions.
- **The prices and rules can change.** From 1 October 2026, [Link: Meta started charging → https://developers.facebook.com/docs/whatsapp/pricing] businesses on the WhatsApp Business Platform for service replies beyond a free monthly allowance. The free WhatsApp Business app and personal chats are [Link: not affected → https://dubawa.org/misleading-whatsapp-not-set-to-charge-nigerians-n14-per-message/], but it is a reminder that someone else sets the terms.
- **Google cannot send you customers.** When someone searches for what you sell in your area, a website and a Google Business Profile are what show up, not your Instagram posts.
- **Customers have to ask for everything.** Prices, sizes, delivery areas and opening hours get answered one chat at a time, every day.

### What does a website do that social media cannot?

- Gives you an address you own, such as yourbusiness.com.ng, that you can print, share and keep for years.
- Shows up when people search Google for what you sell.
- Puts your products, prices, delivery areas and policies in one place customers can check without messaging you.
- Takes payments through a proper checkout, so you are not checking transfer alerts by hand.
- Shows customers you are an established business, which matters to someone paying a seller they have never met.
- Tells you how many people visited and where they came from.

### Will customers still message you on WhatsApp?

Yes, and they should. A good website sends people to WhatsApp rather than replacing it. The difference is that they arrive already knowing your prices and what they want. On [Link: TOMORI → /resources/tomori], a fashion shop we built, shoppers find pieces on Instagram and WhatsApp, buy on the website with Paystack, and a WhatsApp button sits on every page for anyone who would rather ask first.

### When is social media enough on its own?

If you are testing whether people will buy, sell to a small circle who already know you, or get all your customers through referrals, social media can carry you for a while. These are signs it is time for a website:

- You answer the same questions about prices, location and delivery every day.
- Customers ask whether you have a website, or say they could not find you on Google.
- You want to run ads and need somewhere better than a profile to send people.
- You want to take payments without checking every transfer by hand.
- You want to approach bigger clients who will look you up before they reply.

### What is the smallest website worth having?

One good page: who you are, what you sell, your prices or a price guide, where you deliver, and buttons to WhatsApp and call you. That is our Starter plan: ₦150,000, one mobile-ready page with working WhatsApp and contact buttons, hosted on your own domain and live 72 hours after you approve the design. [Link: See the plans → /pricing], or read [Link: what a Nigerian business website should include → /blog/nigerian-business-website-checklist].

### Frequently asked questions

#### Is a link-in-bio page the same as a website?

No. It sits on someone else’s domain, follows their rules and does little for Google. It is a useful signpost, and the best thing to point it at is your own website.

#### Will Meta’s new WhatsApp charges affect my small business?

Not if you use the free WhatsApp Business app. The per-message charges apply to businesses using the WhatsApp Business Platform, the API used by banks, fintechs and large online stores to message customers at scale.

#### How will customers find my website?

Through Google, especially once you have a Google Business Profile linked to it, and through everywhere you already are: your Instagram bio, WhatsApp status, receipts, packaging and flyers.

#### Can my website show my Instagram posts?

It can link to your profile, and some sites embed recent posts, though every embed adds weight and slows the page on mobile data. We usually link out and keep the page fast.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

Image alt: "A woman working on her laptop with her phone beside her."

#### How to Accept Payments on Your Website in Nigeria

- 29 September 2026
- Websites
- Pricing

Card link → /blog/accept-payments-website-nigeria (screen-reader label: "How to Accept Payments on Your Website in Nigeria")

## Article: When Should You Replace Spreadsheets With a Custom Tool?

URL: `/blog/replace-spreadsheets-with-custom-tool`  
Meta title: When Should You Replace Spreadsheets With a Custom Tool? | WildHands  
Meta description: Replace a spreadsheet when several people edit it, mistakes cost money, or data is copied between files. Here are the signs, and your options from cheapest up.

**H1:** When Should You Replace Spreadsheets With a Custom Tool?

- 27 Oct 2026
- Link: Tools & Systems → /blog/category/tools-and-systems

WildHands Studio

Image alt: "A woman in a blazer working at her laptop in an open-plan office."

Replace a spreadsheet when it has stopped being a tool for one person and become the system the business runs on: several people edit it, mistakes in it cost money, and the same information is copied between files by hand. Before that point, a tidier spreadsheet is often enough. After it, a simple custom tool with a proper database, logins and screens shaped around your work usually pays for itself in hours saved.

### Why do spreadsheets stop working as a business grows?

Size is rarely the problem. Excel allows [Link: 1,048,576 rows per sheet → https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3] and Google Sheets allows [Link: up to 20 million cells → https://support.google.com/docs/answer/37603], far more than most small businesses use. The problems are about people:

- Everyone who can open the file can change anything in it, including the formulas.
- Copies multiply: “Orders final”, “Orders final v2”, and the one on someone’s laptop.
- The same customer or order is typed into three sheets, and they slowly stop agreeing.
- Nobody can see who changed a number, or why.
- It is hard to use on a phone, so staff in the field send updates on WhatsApp and someone types them in later.
- How it all fits together lives in one person’s head.

### What are the signs it is time to move on?

1. More than one person edits the same sheet every day.

2. You have lost money, an order or a customer because of a spreadsheet mistake.

3. Someone spends hours each week copying data between sheets or from WhatsApp into a sheet.

4. Different staff should see different things, such as sales staff not seeing salaries, and the sheet cannot do that.

5. You need a report every week and it takes someone half a day to build it.

6. Customers or partners need to see their part of the data, and you send them screenshots.

One or two of these can be fixed inside the spreadsheet. Three or more usually means the business has outgrown it.

### What can replace a spreadsheet?

There are four options, from the cheapest up. Start with the first one that solves the problem.

1. **Tidy the spreadsheet.** One tab per kind of thing, dropdowns instead of free typing, protected formulas, and one shared file instead of copies.

2. **Automate around it.** A form that feeds the sheet, so nobody types the same order twice, and reports that build themselves.

3. **Use a no-code app builder.** Good for a quick internal tool, as long as your rules are simple and you accept the platform’s limits and monthly pricing.

4. **Build a custom internal tool.** A proper database, logins for each person, screens that match how your team works, a record of who changed what, and dashboards that are always up to date.

### How do you turn a spreadsheet into an app?

1. List what each column means and which columns belong together, such as customers, orders and payments.

2. Write down who adds, edits and only views each kind of information.

3. Map what happens when something changes: an order moves from paid to packed to delivered, and who is told.

4. List the reports and numbers people actually read each week.

5. Import your existing data into the new tool, and run both side by side for a short time before you switch over.

Most of this is thinking, not building. It is also the work a good discovery call does with you.

### What does a custom tool look like in practice?

- [Link: The Ruff Agency → /resources/the-ruff-agency]: clients lived in a spreadsheet, invoices in a separate system and payment tracking in someone’s head. Now clients, contracts, invoices, tasks and a client portal sit in one shared workspace.
- [Link: Marvy → /resources/marvy]: drop a course video in, and it lands in the right Google Drive folder with the right people tagged, instead of someone filing each one by hand.
- [Link: TOMORI → /resources/tomori]: a shop owner who works alone runs orders, stock, takings, costs and discount codes from one back office on her phone.

### Is a custom tool worth the cost?

Judge it on hours returned. Count the hours your team spends each week on copying, checking and fixing spreadsheet work, and what an error costs you when it happens. If three people each lose four hours a week to it, that is 12 hours a week, or more than 600 hours a year. Put a value on those hours and compare it with the price of the tool.

That is how we scope [Link: tools and systems → /use-cases/tools-and-systems] at WildHands: quoted after a discovery call, with a written scope before work starts, and judged on the hours it gives back. [Link: Request a quote → /request-a-quote] and tell us which spreadsheet is causing the most trouble.

### Frequently asked questions

#### Which app can replace Excel?

For calculations and one-off analysis, Excel is still hard to beat. For shared records that several people update, such as orders, stock or clients, a tool built on a database is the better replacement, whether off the shelf or custom.

#### Can I keep using Google Sheets alongside a custom tool?

Yes. A custom tool can export to a spreadsheet, or keep one in sync, so anyone who prefers working in Sheets can still do their analysis there.

#### What happens to the data already in my spreadsheets?

It is cleaned up and imported into the new tool before you switch over, so you start with your full history.

#### How long does it take to build an internal tool?

It depends on how many screens, roles and connections it needs. A focused tool that replaces one spreadsheet is much quicker than a system that replaces five. We agree the timeline in the written scope.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "Two colleagues working through something together on a laptop."

#### What Is an Internal Tool, and Does Your Business Need One?

- 5 November 2026
- Tools & Systems

Card link → /blog/what-is-an-internal-tool (screen-reader label: "What Is an Internal Tool, and Does Your Business Need One?")

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

## Article: Web App or Mobile App: Which Should You Build First?

URL: `/blog/web-app-vs-mobile-app`  
Meta title: Web App or Mobile App: Which Should You Build First? | WildHands  
Meta description: For most businesses a web app is the better first build: one version for every phone, no app store fees, no store reviews. Here is when to go native instead.

**H1:** Web App or Mobile App: Which Should You Build First?

- 20 Oct 2026
- Link: Apps → /blog/category/apps

WildHands Studio

Image alt: "A man using his phone on a busy street in Ikeja, Lagos."

For most businesses, a web app is the better first build. It works on every phone, tablet and laptop from a single link, there are no app store fees or reviews, and customers can use it without downloading anything. A native mobile app is worth building when your app needs deep access to the phone, such as tracking a rider’s location in the background, or when people will open it every day and expect it on their home screen.

### What is the difference between a web app and a mobile app?

A web app runs in the browser. You open it from a link, log in, and use it on any device. A native mobile app is downloaded from Google Play or the App Store and installed on the phone. Both can have accounts, payments, dashboards and notifications. The differences are in how people get it, what it can do on the phone, and what it costs to build and run.

If you are still deciding between a plain website and a web app, start with [Link: Website vs Web App: What Does Your Business Need? → /blog/website-vs-web-app]

### Why do most businesses start with a web app?

- **No download.** A link shared on WhatsApp opens straight away. Every extra step between a customer and your app loses some of them.
- **One build for every device.** Android, iPhone, tablet and laptop all use the same app.
- **No app store fees or reviews.** Native apps need an [Link: Apple Developer Program → https://developer.apple.com/support/enrollment/] membership at US$99 a year and a [Link: Google Play → https://support.google.com/googleplay/android-developer/answer/6112435] account with a one-time US$25 fee, and every update goes through store review.
- **Faster changes.** Fix a problem or change a price and everyone has it the next time they open the app.
- **Found on Google.** The public pages of a web app can show up in search results. An app inside an app store cannot.

### Can a web app be installed on a phone like a normal app?

Yes. A progressive web app, or PWA, is a web app that can be added to the home screen and opened in its own window like any other app. [Link: Google’s guide to PWAs → https://web.dev/articles/what-are-pwas] explains that they can also keep working without a connection, showing the most recent content when the network drops. Since iOS 16.4, [Link: iPhones support notifications → https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/] from web apps added to the home screen, and Android has supported them for longer.

### When do you actually need a mobile app?

- The app needs features a browser cannot reach reliably, such as tracking location in the background, Bluetooth printers or card readers.
- People will use it many times a day, such as a rider app or a staff app, and expect it to open instantly from the home screen.
- It must work for long stretches with no connection and sync later.
- Being listed in Google Play or the App Store is part of how customers will find you.

Many businesses need both: a web app for customers, who come and go, and a native app for staff or riders, who use it all day. Both can share the same back end, so the second one is not a rebuild.

### Why are PWAs not more popular?

Mostly because they are less visible. There is no app store listing to point people to, installing one from the browser menu is less familiar than tapping Install in a store, and iPhone support for features like notifications arrived years after Android. For a business, those are reasons to explain the install step to your customers, not reasons to avoid web apps.

### Can you turn a web app into a mobile app later?

Yes. If the web app is built with its data and logic on the server, a native app can use the same back end later, so you only build the new screens. Starting with a web app lets you learn what customers actually use before you pay for two more versions of it.

### Which one costs less?

Usually the web app, because it is one build with no store fees. Our guide to [Link: what an app costs to build in Nigeria → /blog/how-much-does-it-cost-to-build-an-app-in-nigeria] covers the full list of costs, including the ones that come after launch.

Not sure which you need? [Link: Tell us what the app has to do → /request-a-quote] and we will recommend the simplest version that does the job. See the kinds of [Link: apps we build → /use-cases/apps].

### Frequently asked questions

#### Is it better to have a website or an app?

Start with a website if people only need to find you, learn about you and contact you. You need an app, usually a web app first, when people log in to do something again and again, such as book, order, track or pay.

#### Can a web app send notifications?

Yes. Web apps can send push notifications on Android, and on iPhones running iOS 16.4 or later when the app has been added to the home screen. Email, SMS and WhatsApp messages are other ways to reach people.

#### Will customers download my app?

Some will, but every download is an extra step. A link that opens straight away usually reaches more people at the start. Ask for the download once customers already value what the app does.

#### Which should I build for a delivery business?

Often both: a web app or website for customers to order and track, and a native app for riders if it needs background location and must run all day. The two can share one back end.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "Four women gathered around a laptop in an office."

#### How Much Does It Cost to Build an App in Nigeria?

- 13 October 2026
- Apps
- Pricing

Card link → /blog/how-much-does-it-cost-to-build-an-app-in-nigeria (screen-reader label: "How Much Does It Cost to Build an App in Nigeria?")

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "Two colleagues working through something together on a laptop."

#### What Is an Internal Tool, and Does Your Business Need One?

- 5 November 2026
- Tools & Systems

Card link → /blog/what-is-an-internal-tool (screen-reader label: "What Is an Internal Tool, and Does Your Business Need One?")

## Article: How Much Does It Cost to Build an App in Nigeria?

URL: `/blog/how-much-does-it-cost-to-build-an-app-in-nigeria`  
Meta title: How Much Does It Cost to Build an App in Nigeria? | WildHands  
Meta description: App prices in Nigeria vary widely: one app is a booking tool, another a fintech platform. Here is what drives the cost and how to get a quote you can trust.

**H1:** How Much Does It Cost to Build an App in Nigeria?

- 13 Oct 2026
- Link: Apps → /blog/category/apps
- Link: Pricing → /blog/category/pricing

WildHands Studio

Image alt: "Four women gathered around a laptop in an office."

There is no single honest price for an app, because “an app” can mean a simple booking tool or a platform that moves money for thousands of people. What sets the cost is how many types of user it has, what each of them can do, which other services it connects to, and whether it runs in the browser, on Android, on iPhone, or all three. The fastest way to a reliable price is a short, clear description of the one job the app must do.

### What makes an app expensive?

- **Types of user.** Customers, staff and admins each need their own screens and permissions. Every extra role adds work.
- **Features.** Payments, notifications, chat, maps, file uploads and offline use each add design, build and testing.
- **Integrations.** Connecting to Paystack, WhatsApp, SMS, Google Sheets or your accounting software means working with someone else’s system and its rules.
- **Platforms.** A web app works on any phone with a browser. Separate Android and iPhone apps add their own builds, testing and store reviews.
- **The admin side.** Every app needs a back office to manage users, content and problems. It is the part most often left out of early quotes.
- **Security and data.** Apps that hold money, health or personal information need more care, and more testing, to build properly.

### Does the platform change the cost: web, Android or iPhone?

Yes. A web app is one build that works on every phone, tablet and laptop, and you can update it without waiting for an app store review. Native apps for Android and iPhone add their own work and their own fees: [Link: Apple’s Developer Program → https://developer.apple.com/support/enrollment/] costs US$99 a year, and [Link: Google Play → https://support.google.com/googleplay/android-developer/answer/6112435] charges a one-time US$25 registration fee. Our guide to [Link: web apps versus mobile apps → /blog/web-app-vs-mobile-app] explains when each one makes sense.

### What costs come after the app is launched?

- Hosting and a database, which grow with the number of users.
- Third-party services, such as SMS, email and payment gateway fees.
- WhatsApp messages, if the app sends them through the WhatsApp Business Platform: [Link: Meta charges per message → https://developers.facebook.com/docs/whatsapp/pricing], and from 1 October 2026 that includes service replies beyond a free monthly allowance.
- App store fees, if you publish native apps.
- Updates when phones, browsers and the services you rely on change, plus fixes and support.

### How can you reduce the cost of building an app?

1. Start with the one job that matters most, and leave the nice-to-haves for a second phase.

2. Build a web app first, and add native apps once people are using it and you know they need one.

3. Use proven services for payments, email and messaging instead of building your own.

4. Plan the admin side from the start, so it is not a surprise later.

5. Agree a written scope before work starts, so everyone is pricing the same thing.

### How do you get an accurate quote?

Whoever you ask, you will get a better price if you can answer these questions:

- Who will use the app, and what is the one thing each of them needs to do?
- How does that work today: on paper, in spreadsheets, over WhatsApp?
- What must be there on launch day, and what can wait?
- Which services must it connect to, such as Paystack or your existing website?
- Is there a date it has to be ready by, and why?

At WildHands, [Link: apps → /use-cases/apps] are quoted after a discovery call, and you get a written scope before any work starts. To see the range of what we build, look at [Link: Dory → /resources/dory], a budgeting app, or [Link: The Ruff Agency → /resources/the-ruff-agency], a workspace that replaced six separate tools.

### How long does it take to build an app?

Usually weeks or months rather than days, depending on the scope. A focused first version with one main job is much faster than an app that tries to do everything at launch. For website timelines, see [Link: How Long Does It Take to Build a Website? → /blog/how-long-does-it-take-to-build-a-website]

Ready to price yours? [Link: Request a quote → /request-a-quote] and tell us what the app needs to do.

### Frequently asked questions

#### Is a web app cheaper than a mobile app?

Usually, because one web app works on every device and needs no app store fees or reviews. Separate Android and iPhone apps mean more building and testing.

#### Can I build an app with no-code tools?

Yes, for a prototype or a simple internal tool. No-code tools get harder to work with as your rules, users and data grow, and you depend on the tool’s pricing and limits.

#### What should I budget for after launch?

Hosting, third-party services such as SMS or WhatsApp messages, app store fees if you publish native apps, and ongoing updates and support.

#### Who owns the app once it is built?

Agree this in writing before you start: who owns the code, the design files, the app store accounts and the hosting accounts. You should be able to take the app to another developer if you ever need to.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A man using his phone on a busy street in Ikeja, Lagos."

#### Web App or Mobile App: Which Should You Build First?

- 20 October 2026
- Apps

Card link → /blog/web-app-vs-mobile-app (screen-reader label: "Web App or Mobile App: Which Should You Build First?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

Image alt: "A woman working on her laptop with her phone beside her."

#### How to Accept Payments on Your Website in Nigeria

- 29 September 2026
- Websites
- Pricing

Card link → /blog/accept-payments-website-nigeria (screen-reader label: "How to Accept Payments on Your Website in Nigeria")

## Article: Shopify vs a Custom Website in Nigeria: Which Is Better?

URL: `/blog/shopify-vs-custom-website-nigeria`  
Meta title: Shopify vs a Custom Website in Nigeria: Which Is Better? | WildHands  
Meta description: Shopify works in Nigeria, but you pay a monthly fee in dollars plus an extra cut of each sale made through Paystack. Here is when that is worth paying.

**H1:** Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 Oct 2026
- Link: Websites → /blog/category/websites
- Link: Pricing → /blog/category/pricing

WildHands Studio

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

Shopify is available in Nigeria and works with Paystack, so you can run a real online shop on it. The catch is cost. You pay a monthly subscription in US dollars, and because Shopify’s own payment service is not offered in Nigeria, Shopify adds its own fee on every sale you take through a gateway like Paystack, on top of Paystack’s fee. A custom website costs more up front but has no platform subscription and no platform cut of each sale, and it is built around how you actually sell.

### Is Shopify available in Nigeria?

Yes. You can sign up from Nigeria, and [Link: Shopify’s Nigerian pricing page → https://www.shopify.com/ng/pricing] lists its plans in US dollars. Shopify Payments, its built-in payment service, is [Link: not available in Nigeria → https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries], so Nigerian stores take payments through a third-party provider such as Paystack.

### How much does Shopify cost in Nigeria?

Visual described to screen readers (aria-label): "Shopify plans per month, in US dollars, as listed on shopify.com/ng/pricing at the time of writing. The last column is the extra fee Shopify adds when you use a third-party gateway such as Paystack."

| Plan | Billed yearly | Billed monthly | Extra fee per sale |
| --- | --- | --- | --- |
| Basic | US$19 | US$27 | 2% |
| Grow | US$54 | US$72 | 1% |
| Advanced | US$299 | US$399 | 0.6% |

On top of that come the payment gateway’s own fees, any paid theme, and any paid apps you add. Because the subscription is billed in dollars, what it costs you in naira moves with the exchange rate.

Here is one sale worked through. A ₦50,000 order on the Basic plan, paid through Paystack: Shopify’s 2% third-party fee is ₦1,000, and [Link: Paystack’s 1.5% + ₦100 → https://support.paystack.com/hc/en-us/articles/360009881920-What-are-Paystack-s-transaction-charges] is ₦850. That is ₦1,850 in fees on that order, before the monthly subscription.

### How do you connect Paystack to Shopify?

[Link: Paystack’s guide → https://support.paystack.com/hc/en-us/articles/360009881240] sets it out: in your Shopify admin, go to Settings, then Payments, and add a payment method. Search for Paystack, connect it and install the app, paste in your Paystack API keys, then activate Paystack. Shopify then updates orders automatically when a Paystack payment succeeds.

### When is Shopify the better choice?

- You have a large catalogue with many sizes, colours and variants, and you want to manage it all yourself.
- You want to launch quickly on a small up-front budget and can carry a monthly fee.
- Your needs are standard: products, cart, checkout and delivery, with nothing unusual about how you sell.
- You are comfortable paying a dollar subscription from a card that works for international payments.

### When is a custom website the better choice?

- You sell in ways a standard store does not handle well: WhatsApp orders, deposits, custom quotes, market stalls or delivery fees that change by area.
- You sell a small range, or you sell services, and do not need a full store platform.
- Your margins are thin enough that a platform fee on every sale really adds up.
- You want the brand, not a theme, to set how the shop looks and feels.
- You want an admin that does exactly what your business needs and nothing more.

That is the case for [Link: TOMORI → /resources/tomori], a hand-dyed fashion label we built a shop for. Shoppers find the pieces on Instagram and WhatsApp, so the site is built for a phone on mobile data, with a WhatsApp button on every page. At a market the owner picks a piece by its code and the shop creates a QR code the customer pays through on their own phone. Bags left unpaid for twenty minutes are listed so she can follow up. None of that comes in a standard store.

### Which costs less over three years?

Add up the whole cost for each option, not just the first month. For Shopify, that is the subscription for 36 months, plus paid apps and theme, plus the extra per-sale fee on your expected sales. For a custom site, it is the build, plus hosting, plus the changes you expect to pay for.

The per-sale fee is the part people forget. On the Basic plan, a shop selling ₦1,000,000 a month through Paystack pays Shopify ₦20,000 a month in third-party fees, which is ₦720,000 over three years, before the subscription and before Paystack’s own fees. Use your own sales figures and today’s exchange rate to work out where your break-even point is.

For what a custom shop costs to build, read [Link: How Much Does E-commerce Development Cost in Nigeria? → /blog/ecommerce-development-cost-nigeria] Or [Link: tell us what you sell → /request-a-quote] and we will scope it.

### Frequently asked questions

#### Can Nigerians use Shopify?

Yes. You can open a Shopify store from Nigeria and take payments through Paystack. Shopify Payments, Shopify’s own payment service, is not available in Nigeria.

#### Does Shopify charge in naira?

At the time of writing, Shopify’s Nigerian pricing page lists its plans in US dollars, from US$19 a month on the Basic plan billed yearly.

#### Can I move from Shopify to a custom website later?

Yes. Products, customers and orders can be exported from Shopify and brought into a new site. Plan redirects from your old product addresses so customers and Google can still find them.

#### Do I need a developer to use Shopify?

Not to start: you can set up a store with a theme yourself. You need a developer when you want something the themes and apps do not do, which is often the point at which a custom site is worth comparing.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "Four women gathered around a laptop in an office."

#### How Much Does It Cost to Build an App in Nigeria?

- 13 October 2026
- Apps
- Pricing

Card link → /blog/how-much-does-it-cost-to-build-an-app-in-nigeria (screen-reader label: "How Much Does It Cost to Build an App in Nigeria?")

## Article: How to Accept Payments on Your Website in Nigeria

URL: `/blog/accept-payments-website-nigeria`  
Meta title: How to Accept Payments on Your Website in Nigeria | WildHands  
Meta description: To take payments on a Nigerian website, open a Paystack or Flutterwave account, verify it and add their checkout. Here is how it works and what it costs.

**H1:** How to Accept Payments on Your Website in Nigeria

- 29 Sept 2026
- Link: Websites → /blog/category/websites
- Link: Pricing → /blog/category/pricing

WildHands Studio

Image alt: "A woman working on her laptop with her phone beside her."

To accept payments on a website in Nigeria, you use a payment gateway. The two most Nigerian businesses compare are Paystack and Flutterwave. You open an account, verify your identity or business, and add the gateway’s checkout to your site. Customers pay by card, bank transfer or USSD on the gateway’s secure checkout, the gateway takes a fee on each payment, and the rest is paid into your bank account.

### What do you need before you can accept payments online?

- A payment gateway account, such as Paystack or Flutterwave.
- Proof of identity, and business registration documents if you are signing up as a registered business.
- A bank account for the money to be paid into.
- A website, or at least a page, where customers can see what they are paying for.

You do not always need CAC registration to start. Paystack offers a [Link: Starter Business account → https://support.paystack.com/hc/en-us/articles/360009972719-What-is-a-Paystack-Starter-Business] for businesses that are not yet registered. It verifies the owner’s identity and address instead, but it has a lifetime limit on how much you can collect and leaves out some features, such as Transfers. Upgrading to a registered business lifts those limits.

### How much does Paystack charge per transaction?

At the time of writing, [Link: Paystack’s published charges → https://support.paystack.com/hc/en-us/articles/360009881920-What-are-Paystack-s-transaction-charges] for Nigerian businesses are 1.5% + ₦100 on local payments. The ₦100 is waived on payments under ₦2,500, and the fee on any local payment is capped at ₦2,000. International cards cost 3.9% + ₦100, or 4.5% for American Express. Here is what that means on a few order sizes:

Visual described to screen readers (aria-label): "Paystack fees on local payments, worked out from its published rates"

| Order | Rate | Fee | You receive |
| --- | --- | --- | --- |
| ₦2,000 | 1.5% only | ₦30 | ₦1,970 |
| ₦10,000 | 1.5% + ₦100 | ₦250 | ₦9,750 |
| ₦50,000 | 1.5% + ₦100 | ₦850 | ₦49,150 |
| ₦200,000 | Capped | ₦2,000 | ₦198,000 |

The ₦2,000 order is under ₦2,500, so only the 1.5% applies. On the ₦200,000 order, 1.5% + ₦100 would come to ₦3,100, so the ₦2,000 cap applies instead. Rates change, so check the current figures before you set your prices or decide who absorbs the fee.

### Paystack or Flutterwave: which is better?

Both are established and both work well on a business website. At the time of writing, [Link: Flutterwave’s Nigerian pricing page → https://flutterwave.com/ng/pricing] lists a 2% fee on local transactions, so the cheaper option depends on your typical order size. Rather than asking which is better in general, ask which fits you:

- **Where are your customers?** If you sell mostly in Nigeria, either works. If you sell across several African countries, compare which countries and currencies each one supports for your business.
- **What is your usual order size?** Work out the fee on your typical basket with each gateway’s current rates. A cap on fees matters most if your orders are large.
- **How do your customers like to pay?** Card, bank transfer, USSD or mobile money. Check that the methods your customers use are switched on for your account.
- **Which dashboard can you live with?** You will use it every week to check payments and settlements. Open a test account with both and look around.

Some businesses use both. That adds a little build and admin work, so it is usually something to do later, not on day one.

### How does a website payment work, step by step?

1. The customer chooses what to buy and taps Pay.

2. The gateway’s checkout opens, and the customer pays by card, transfer or USSD. Card details go to the gateway, not to your website.

3. The gateway confirms the result to your website.

4. Your website checks the payment with the gateway, from the server, before it marks the order as paid.

5. You and the customer get a confirmation, and the gateway pays the money into your bank account on its settlement schedule.

Step 4 is the one that matters most. A screenshot of a transfer alert, or a browser that says “payment successful”, is not proof of payment. A properly built site confirms every payment directly with the gateway before it releases an order, which also protects you from fake payment alerts.

### Can you take payments without a full online store?

Yes. Both gateways offer payment links you can send in a chat, which suits a business that takes orders on WhatsApp. On a website, a service business might only need a Pay button on each service, or quotes that turn into invoices the client pays online, which is what we built for [Link: Rayo → /resources/rayo]. A shop with many products needs a cart and checkout; our guide to [Link: e-commerce costs in Nigeria → /blog/ecommerce-development-cost-nigeria] covers that.

### Why not just ask customers to transfer to your account?

Direct transfers have no gateway fee, which is why many businesses start there. The cost is time and risk: someone has to check every alert by hand, match it to an order and spot fake ones. Paying by transfer through a gateway gives the customer the same familiar method, while the gateway confirms the payment and records it against the order for you.

### What does it cost to add payments to a website?

It depends on what the payment does. A single Pay button on a service page is a small job. A shop with a cart, delivery fees and stock that updates itself is a larger one. [Link: TOMORI → /resources/tomori], a fashion shop we built, takes card, transfer or USSD through Paystack, shows delivery fees before anyone pays, and lets the owner create a QR code at a market stall for a customer to pay on their own phone. Tell us what you sell and how you take orders, and we will scope it: [Link: request a quote → /request-a-quote].

### Frequently asked questions

#### Do I need CAC registration to use Paystack?

Not to start. A Paystack Starter Business account is for businesses that are not yet registered. It has a lifetime limit on collections and fewer features, and upgrading to a registered business lifts the limits.

#### Can customers outside Nigeria pay on my website?

Yes, with an international card. Paystack charges 3.9% + ₦100 on international Visa, Mastercard and Verve payments, and 4.5% on American Express, at the time of writing.

#### Is it safe to take card payments on my website?

Yes, when the card details are entered on the gateway’s checkout rather than stored by your site, and every payment is confirmed with the gateway before an order is released. That is how we build every payment flow.

#### When does the money reach my bank account?

Each gateway pays out on its own settlement schedule, which can depend on your account type. Your gateway dashboard shows the schedule for your account.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "Four women gathered around a laptop in an office."

#### How Much Does It Cost to Build an App in Nigeria?

- 13 October 2026
- Apps
- Pricing

Card link → /blog/how-much-does-it-cost-to-build-an-app-in-nigeria (screen-reader label: "How Much Does It Cost to Build an App in Nigeria?")

## Article: How Much Are Domain, Hosting and Maintenance in Nigeria?

URL: `/blog/domain-hosting-maintenance-cost-nigeria`  
Meta title: How Much Are Domain, Hosting and Maintenance in Nigeria? | WildHands  
Meta description: After launch, a website needs its domain renewed yearly, hosting, and changes now and then. Here is what each cost covers in Nigeria and how to budget for it.

**H1:** How Much Are Domain, Hosting and Maintenance in Nigeria?

- 22 Sept 2026
- Link: Websites → /blog/category/websites
- Link: Pricing → /blog/category/pricing

WildHands Studio

Image alt: "A man working on his laptop on a sofa."

A website has three running costs: the domain name, renewed every year; hosting, which keeps the site online; and maintenance, which covers updates, fixes and changes. The security certificate that puts the padlock in the address bar can be free. Prices vary from one registrar and host to the next, so the most useful thing to know is what each cost is, who should own each account, and what to check before you pay.

### What is the difference between a domain and hosting?

The domain is your address, such as yourbusiness.com.ng. Hosting is the computer that stores the website and sends it to visitors when they type that address. You rent the domain from a registrar, year by year, and you pay for hosting to keep the site online. They can come from the same company or from different ones.

### How do you register a .ng or .com.ng domain?

.ng domains are run by the [Link: Nigeria Internet Registration Association (NiRA) → https://nira.org.ng/], but NiRA does not sell them directly. [Link: According to NiRA → https://nira.org.ng/?p=948], all registrations, renewals and transfers go through its accredited registrars. The steps are:

1. Check the name is free at [Link: register.ng → https://register.ng].

2. Pick a registrar from NiRA’s list of accredited registrars.

3. Register the name through that registrar, in your business’s name and with an email address you control.

Which ending should you choose? Pick the one your customers will remember and type. Google treats country-code domains such as .ng as [Link: a strong signal that a site is meant for a certain country → https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites], which suits a business that mainly serves Nigeria. A .com can make more sense if you sell abroad.

### How much is a domain name in Nigeria?

Each registrar sets its own price, and first-year discounts are common. The figure that matters is the renewal price, because you pay it every year for as long as you keep the site. Before you buy, check the renewal price, whether the domain is registered in your name, and whether you can move it to another registrar later.

If you build with WildHands and already have a domain, we connect it. If you do not, we register one for you and add the cost to the invoice.

### How much does hosting cost, and what kind do you need?

Hosting ranges from cheap shared plans, where many sites share one server, to cloud servers sized for busy web apps. A small business website needs very little: it should load quickly on mobile data, stay online and be backed up. Paying for a large hosting plan for a four-page site is money better spent elsewhere. A web app with logins and a database needs more, and that should be part of its quote.

Starter and Standard websites from WildHands are hosted and connected to your domain as part of the build. See [Link: what each plan includes → /pricing].

### Do you need to pay for an SSL certificate?

Usually not. The SSL certificate is what puts https and the padlock on your site, and browsers warn visitors about pages without one. [Link: Let's Encrypt → https://letsencrypt.org/about/] gives anyone who owns a domain a trusted certificate at no cost, and most good hosts set it up and renew it automatically. Paid certificates exist, but a small business website rarely needs one.

### What does website maintenance include?

- **Renewals.** The domain every year, and hosting on whatever cycle you pay for it.
- **Updates and security.** Sites built on plugins and themes, such as many WordPress sites, need regular updates to stay secure.
- **Backups.** A copy of the site you can restore if something breaks.
- **Content changes.** New prices, new photos, a new service page.
- **Fixes when other services change.** Payment gateways, maps and booking tools update their systems, and the site sometimes needs to follow.

### How much should you budget for maintenance?

It depends on how the site is built. A site with many plugins needs regular attention whether or not you change anything. A simpler site with fewer moving parts needs less. The biggest saving is being able to make everyday changes yourself, so you are not paying a developer every time a price changes.

That is why our Standard plan includes an admin dashboard where you edit text, images, prices and announcements yourself. Starter includes 2 rounds of edits and Standard includes 3. After that, changes are billed by the hour, and we quote them before we start, so there are no surprise invoices.

### Who should own the domain and hosting accounts?

You should. Register the domain in your business’s name, with your own email address, and keep the logins somewhere safe. A common problem is a developer who registered the domain in their own name and then became hard to reach, leaving the business unable to move or renew it. With WildHands you own the site, the domain and everything on it. Our guide to [Link: choosing a web development agency in Lagos → /blog/choose-web-development-agency-lagos] covers the other questions to ask before you sign.

For the cost of building the site in the first place, read [Link: How Much Does a Website Cost in Nigeria? → /blog/website-cost-nigeria]

### Frequently asked questions

#### What happens if I forget to renew my domain?

Your website and any email on that domain stop working. Once any grace period your registrar offers has passed, someone else may be able to register the name. Turn on auto-renew and keep the payment card on the account up to date.

#### Can I get a free domain and hosting?

Some website builders offer a free address on their own domain, such as yourname.builder.com, usually with their branding on your site. A domain of your own, such as yourbusiness.com.ng, always costs money.

#### Is .com.ng better than .com for Google?

Google treats country-code domains as a strong signal that a site is meant for that country, which helps a business serving Nigeria. A .com can still rank in Nigeria. Choose the one your customers will remember.

#### Do I need a business email address?

It is not required, but an address on your own domain looks more professional than a free email account. Email hosting is usually a separate cost from website hosting, so ask whether it is included.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "Four women gathered around a laptop in an office."

#### How Much Does It Cost to Build an App in Nigeria?

- 13 October 2026
- Apps
- Pricing

Card link → /blog/how-much-does-it-cost-to-build-an-app-in-nigeria (screen-reader label: "How Much Does It Cost to Build an App in Nigeria?")

## Article: How Long Does It Take to Build a Website?

URL: `/blog/how-long-does-it-take-to-build-a-website`  
Meta title: How Long Does It Take to Build a Website? | WildHands  
Meta description: A small business website can be live within days once the design is approved and the content is ready. Larger sites take weeks. Here is what sets the pace.

**H1:** How Long Does It Take to Build a Website?

- 15 Sept 2026
- Link: Websites → /blog/category/websites

WildHands Studio

Image alt: "A woman smiling at her desk with a laptop open in front of her."

A small business website of one to four pages can be live within a few days once the design is agreed and your content is ready. A larger site with many pages, a blog or online payments usually takes several weeks, and a custom web app takes longer again. At WildHands, Starter and Standard websites go live 72 hours after you approve the design.

The build itself is rarely the slow part. What decides the timeline is how much there is to build, how quickly decisions get made, and whether the words and photos are ready when the work starts.

### What decides how long a website takes?

- **The number of pages.** A one-page site with your services, prices and a WhatsApp button is a small job. Twenty service pages and a blog are a bigger one.
- **Whether your content is ready.** In our experience this is the single biggest delay. A site cannot launch while it waits for a logo, photos or the text for the About page.
- **How decisions get made.** One person approving the design keeps things moving. Five people giving feedback in turn can add weeks.
- **Features.** Online payments, bookings, a product catalogue or a members area each add design, build and testing time.
- **Accounts you need to set up.** Your domain, a payment gateway account and a Google Business Profile each have their own sign-up and verification steps, and some of those are outside anyone’s control.

### How long does each type of website take?

Visual described to screen readers (aria-label): "Typical timelines at WildHands, by type of build"

| Build | Includes | Timeline |
| --- | --- | --- |
| Starter website | One page, WhatsApp and contact buttons | 72 hours after design approval |
| Standard website | Up to 4 pages and an admin dashboard | 72 hours after design approval |
| Larger website | More pages, a blog, payments or bookings | Set in the written scope |
| Web app or tool | Logins, dashboards and workflows | Set in the written scope |

### Why can a website be built in 72 hours?

Because the scope is fixed and the slow decisions happen first. On Starter and Standard, you send your logo, photos and text, we design the site, and you approve the design within 24 hours, before any code is written. Once the design is approved there is nothing left to debate, so the build is a known quantity. Speed comes from a small, clear scope, not from cutting corners.

### What slows a website project down?

- Waiting for photos, prices or page text after the work has started.
- Feedback arriving in pieces from several people, sometimes contradicting each other.
- New pages or features added halfway through the build.
- A previous developer holding the login for your domain, so it cannot be connected to the new site.
- Payment gateway verification that has not been started, so checkout cannot go live with the rest of the site.

### How can you get your website live faster?

1. Gather your logo, your best photos and the text you want on each page before you start.

2. Choose one person who approves the design and the final site.

3. Find the login for your domain, or decide on a new domain name, before the build starts.

4. Split your wish list into what must be there at launch and what can come later.

5. If you want to take payments, open your payment gateway account early. Our guide to [Link: accepting payments on a website in Nigeria → /blog/accept-payments-website-nigeria] explains what you need.

### Is a website built in days lower quality?

Not if the scope is small and fixed. Quality comes from the process: an approved design, real content and proper testing on a phone. Whatever the timeline, a business website should still load quickly on mobile data, work on a small screen and have contact buttons that actually work. Our [Link: checklist for a Nigerian business website → /blog/nigerian-business-website-checklist] covers what every site should include.

### How long does a web app or internal tool take?

Longer than a website, because there is more to decide and test: who logs in, what each person can see and change, which payments or messages the system sends, and what happens when something goes wrong. We scope [Link: apps → /use-cases/apps] and [Link: tools and systems → /use-cases/tools-and-systems] after a discovery call and agree a written scope, with a timeline, before any work starts.

Want a date for your own site? See our [Link: fixed prices → /pricing] or [Link: request a quote → /request-a-quote] and we will tell you how long your build will take.

### Frequently asked questions

#### Can I get a website in 24 hours?

Some website builders let you publish a basic page the same day. A designed business site needs a design you have approved first. With WildHands you approve the design within 24 hours, and the site is live 72 hours after approval.

#### What do I need to send before you start?

Your logo, your photos and the text you want on the site. On Standard we can write the copy for you from a 15-minute call.

#### What if I need changes after launch?

Starter includes 2 rounds of edits and Standard includes 3. Further changes are billed by the hour, and we quote them before we start.

#### Does a faster build cost more?

No. Starter is ₦150,000 and Standard is ₦250,000, with half paid as a deposit to start. The 72-hour timeline is part of the price, not an extra.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

## Article: How to Choose a Web Development Agency in Lagos

URL: `/blog/choose-web-development-agency-lagos`  
Meta title: How to Choose a Web Development Agency in Lagos | WildHands  
Meta description: What to check before hiring a web development agency in Lagos, from portfolio and process to ownership and aftercare.

**H1:** How to Choose a Web Development Agency in Lagos

- 7 Sept 2026
- Link: Websites → /blog/category/websites

WildHands Studio

Image alt: "A small team talking in an office in Lagos."

Picking the wrong agency costs more than the invoice. It costs the months spent waiting for a launch that never quite happens, and the second project you need just to fix the first one. Here's what to check before you sign anything.

### Look at their actual portfolio

Ask for live sites, not mockups or screenshots. Open them on your own phone. Click around. A polished screenshot tells you almost nothing about how the finished site actually feels to use, or how fast it loads on a real connection.

### Ask about their process

Do they start by understanding your business and your customers, or do they open Figma on day one? An agency that jumps straight to design without asking what problem the site is actually solving tends to produce something that looks fine and does very little. A short discovery conversation before any design work starts is a good sign, not a delay.

### Check how they communicate

Ask directly: how will I get updates, and how often? A vague answer here usually means radio silence for weeks once the project is underway, followed by a rushed version right before the deadline. A clear cadence, even a simple weekly update, is worth more than a slicker pitch deck.

### Understand exactly what's included

Get this in writing before you pay anything:

- Is hosting setup included, or a separate cost?
- How many rounds of revisions are covered?
- Is there support after launch, and for how long?
- What happens if you need a small change three months from now: is that free, or billed separately?
- Does the site come with a CMS so you can edit it yourself, and is basic technical SEO (sitemap, crawl rules) included or a separate line item?

An agency that's vague about any of these is telling you something about how the rest of the project will go. We build all of this in by default: every WildHands project ships with a CMS, an XML sitemap, and crawl rules set up correctly, not sold back to you later.

### Local knowledge is a real advantage, not a nice-to-have

An agency based in Lagos, working with Nigerian businesses regularly, already knows things a foreign or inexperienced developer has to learn the hard way: which payment gateways actually work reliably here, how to build for real mobile data conditions rather than fast fibre, and what local customers expect to see before they trust a business online. Ask directly whether they've handled Paystack or Flutterwave integration before, and ask to see it live on a site they've shipped.

### Ask about ownership

Do you own the code and design files once the project is paid for, or are you locked into that agency for every future change? This should be a simple, direct answer. If it isn't, that's worth pressing on before you commit.

### Red flags worth taking seriously

- No written contract or scope document, just a verbal agreement.
- A quote with no detail behind it, just a single number.
- A timeline that sounds too fast for the scope described.
- No mention of what happens after launch, as if support ends the moment the site goes live.

None of these are automatically disqualifying on their own. Together, they're a pattern worth asking harder questions about.

### What a good process actually looks like

A conversation about your business before any design work starts. A clear, itemised quote. Regular updates you don't have to chase. A finished site that works properly on the phone in your own hand, not just in a demo. And a straight answer about what happens if something breaks six months from now.

At WildHands, that process runs in five stages: a scaffold you approve before we build anything further, the full site build, the CMS and admin panel once the site itself is signed off, a final round of security checks and fine-tuning, then handover. You know what's happening at every stage, because you've already approved the one before it.

That's the standard to hold any agency to, including us. [Link: Talk to WildHands → /contact] about your project and see how we handle it.

### Frequently asked questions

#### How long should a website project take in Lagos?

A simple site typically runs two to six weeks depending on scope. Anything quoted at a few days for a full business site is either very small in scope or cutting corners somewhere.

#### Should I choose a freelancer or an agency?

A freelancer can work well for a small, well-defined project and a tight budget. An agency generally offers more reliability for anything with real complexity, since the project isn't dependent on one person's availability, and there's usually a proper process behind it rather than an individual working solo.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

## Article: How Much Does E-commerce Development Cost in Nigeria?

URL: `/blog/ecommerce-development-cost-nigeria`  
Meta title: How Much Does E-commerce Development Cost in Nigeria? | WildHands  
Meta description: What actually drives the cost of an e-commerce site in Nigeria, from platform choice to payment integration and delivery logistics.

**H1:** How Much Does E-commerce Development Cost in Nigeria?

- 7 Sept 2026
- Link: Websites → /blog/category/websites

WildHands Studio

Image alt: "A business owner on a tablet, surrounded by packed orders."

E-commerce costs more to build than a standard business website, and the range between projects is wider too. A ten-product store and a full multi-vendor marketplace are both "online stores," but they're not close to the same job. Here's what actually moves the price.

### What drives e-commerce cost

**Platform choice.** An off-the-shelf platform like Shopify or WooCommerce gets you a working store faster, with built-in features you'd otherwise have to build. A fully custom platform costs more and takes longer, but gives you complete control over features and how the business scales.

**Catalog size and complexity.** Ten products in one category is simple. Five hundred products across variants, sizes, and colours needs a more thought-out admin system and product structure.

**Payment integration.** This isn't optional in Nigeria, and it isn't one gateway. Card payments, bank transfer, and USSD all need to work reliably, usually through Paystack or Flutterwave, and each payment method needs to be tested properly, not just switched on. On our own builds, this extends past checkout too: quotes and invoices that clients can pay directly through Paystack, so payment doesn't sit as a separate manual step outside the site.

**Inventory management.** Do you need stock levels tracked automatically, or are you updating manually? Automatic stock tracking that syncs with orders is more development work than a simple product list.

**Delivery and logistics.** Calculating delivery cost by zone, integrating a courier's API, or just listing flat delivery rates: each is a different level of complexity, and delivery in Nigeria rarely fits a single flat-rate assumption the way it might elsewhere.

**Admin dashboard.** How much do you need to see and control from the backend? Order status, customer messages, discount codes, reporting: the more control you want, the more there is to build.

**Mobile checkout.** Most online shopping in Nigeria happens on a phone. A checkout flow that's smooth on mobile, not just functional, takes real design attention, not a default template.

### Off-the-shelf vs custom

An off-the-shelf platform is the right call for most businesses starting out. It's faster to launch, cheaper up front, and covers the features most stores actually need.

Custom development becomes worth it once your business has specific needs a template genuinely can't handle: a particular checkout flow, a complex product configurator, tight integration with your own inventory or accounting system. Building custom before you've proven you need it usually means paying for flexibility you haven't used yet.

### What makes Nigerian e-commerce different

**Multiple payment methods, not one.** Cards alone will lose you customers. Bank transfer and USSD need to work just as reliably.

**Delivery zones matter more.** Flat-rate shipping that works in a smaller country often breaks down across Nigeria's actual delivery reality, where cost and time vary a lot by state and by courier coverage.

**Low-bandwidth performance.** A slow product page loses a sale before the customer even sees the price. Image optimisation and page speed matter more here than in markets with consistently fast connections.

**WhatsApp as a fallback channel.** A lot of Nigerian shoppers still want to confirm an order or ask a question over WhatsApp before or after checking out online. Building that into the flow, rather than fighting against it, tends to convert better than ignoring it.

### Costs that continue after launch

- **Transaction fees**, charged per sale by your payment provider.
- **Hosting**, scaled to your traffic and catalog size.
- **Maintenance**, for security and platform updates.
- **Catalog upkeep**, adding products, updating stock, running promotions.

### Questions to ask before committing

- Which payment methods are included, and has bank transfer specifically been tested?
- How is delivery cost calculated, and can it handle different zones?
- What happens to my store if the platform changes its pricing or shuts down a feature I depend on?
- Is the admin dashboard something I can actually use day to day, or does every change need a developer?

Every WildHands build includes a dashboard built for the person actually running the business day to day, not just the developer who built it, so managing orders, quotes, or invoices doesn't require calling us for routine work.

Building or fixing an online store? [Link: Talk to WildHands → /contact] about what your catalog and customers actually need.

### Frequently asked questions

#### Is Shopify good enough for Nigerian businesses?

For a lot of them, yes, especially once local payment gateways are integrated properly. It's a strong starting point for most stores under a few hundred products.

#### Do I need a custom e-commerce platform?

Only once you've hit a specific limitation an off-the-shelf platform can't solve, like a checkout flow or inventory system genuinely unique to how your business operates. Most stores don't need custom until they've outgrown the standard options.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

## Article: What Should a Nigerian Business Website Include?

URL: `/blog/nigerian-business-website-checklist`  
Meta title: What Should a Nigerian Business Website Include? | WildHands  
Meta description: A practical checklist of what every Nigerian business website needs, from essential pages to local payment and trust signals.

**H1:** What Should a Nigerian Business Website Include?

- 7 Sept 2026
- Link: Websites → /blog/category/websites

WildHands Studio

Image alt: "A man smiling as he types on his laptop."

Here's the checklist, then the reasoning behind each item.

### Essential pages

- **Home**, stating what you do and for whom, immediately.
- **About**, who's behind the business and why it exists.
- **Services or products**, specific enough that a visitor can act on it.
- **Contact**, with a real phone number and location, not just a form.
- **Testimonials or social proof**, from real clients wherever you can get permission to name them.
- **A CMS admin panel**, so you can add a project or update a page yourself without waiting on a developer. This should come as standard, not an upsell.

### Trust signals

- A physical address or clearly stated service area.
- A phone number that's actually answered.
- Real photos of your team, premises, or work, not stock imagery.
- A secure connection (https), which most hosting providers set up by default now but is still worth checking.
- Business registration details, if that's relevant to how your industry builds trust.

These matter more than they might seem to. A site with no address, no real photos, and a contact form as the only way to reach anyone reads as unreachable, even if the business behind it is completely legitimate.

### Local payment options

If you sell anything, Paystack or Flutterwave checkout should be visibly working, not buried behind an extra click. Bank transfer as an option matters too: plenty of Nigerian customers still prefer it over cards, and a store that only accepts cards is quietly losing sales it never sees.

### Mobile optimisation and speed

Most visits to a Nigerian business site come from a phone, often on mobile data rather than WiFi. Test your site on an actual phone, on an actual mobile connection, not just in a desktop browser's mobile preview. A page that looks fine in a preview can still load painfully slowly in the real conditions your customers are browsing under.

### SEO basics

- Your city or service area mentioned in page titles and content, not just implied.
- A Google Business Profile set up and linked, especially if you have a physical location or serve a specific area.
- LocalBusiness schema markup, which helps Google understand where you actually operate.
- An XML sitemap and correct crawl rules, so search engines can actually index the site properly.
- Basic setup for AI search visibility. More buyers now ask ChatGPT or Perplexity for recommendations before they open Google, and most business sites aren't structured to be picked up by either.

A site that never mentions where it's based struggles to rank for local searches, no matter how good the content is. Every WildHands build includes the technical items on this list by default, not as a separate line item.

### Clear calls to action

Every page should make the next step obvious: call, message, buy, book. A visitor who has to hunt for what to do next usually just leaves instead.

### Analytics

Set up basic analytics from day one, not after you've already wondered for six months whether the site is working. You can't improve what you're not measuring, and waiting to add tracking means losing months of data you'll never get back.

### What most sites are missing

The pattern we see most often isn't bad design. It's a site with no location mentioned anywhere, a contact form as the only way in, and no local payment method visible. Individually small, together they add up to a site that looks fine and quietly underperforms.

### Frequently asked questions

#### Do I need a blog on my business website?

Not essential, but useful. A blog gives you a reason to keep publishing, and each post is another way to be found in search. Skip it if you will not keep it updated; an abandoned blog looks worse than no blog at all.

#### Should I list prices on my site?

If your pricing is straightforward, yes, since it saves you and potential customers time. If pricing genuinely varies project to project, a clear "get a quote" path works better than vague, unhelpful ranges.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

## Article: How Much Does a Website Cost in Nigeria?

URL: `/blog/website-cost-nigeria`  
Meta title: How Much Does a Website Cost in Nigeria? | WildHands  
Meta description: A real answer to what drives website cost in Nigeria, the three main scope tiers, and what to check before you accept a quote.

**H1:** How Much Does a Website Cost in Nigeria?

- 7 Sept 2026
- Link: Websites → /blog/category/websites

WildHands Studio

Image alt: "A woman writing notes beside her laptop."

There's no single figure that answers this honestly. A five-page brochure site and a custom booking platform are both "websites," and pricing them the same way would be dishonest. What you can get is a clear picture of what actually drives the cost, so you can judge a quote when one lands in your inbox.

### What actually drives the price

**Number of pages and content.** A homepage, about page, and contact page is a small job. Ten service pages, a blog, and a portfolio gallery is a bigger one.

**Custom design vs a template.** A template gets you online faster and cheaper. A custom design is built around your brand, your content, and how your customers actually browse, which takes more design and build time.

**A content management system.** If you want to edit pages, add blog posts, or update prices yourself, the site needs a CMS built in. That's more development work than a static site nobody but the developer can touch.

**Payment and third-party integrations.** Paystack or Flutterwave checkout, a booking calendar, a newsletter signup, a CRM connection: each one adds scope.

**Copy and photography.** If you're supplying finished content, that's less work for the agency. If they're writing your copy and sourcing or shooting photography, that's a separate cost most quotes should show as its own line.

**Timeline.** A rushed launch usually costs more, because it means paying for concentrated hours instead of hours spread across a normal schedule.

### Three broad scope tiers

**A simple site.** A handful of pages, no CMS, no payment processing. Right for a business that needs a professional web presence and doesn't update it often.

**A full business site.** Multiple pages, a CMS so you can update content yourself, contact forms, maybe a blog. Right for most Nigerian businesses that want to keep the site current without calling a developer every time.

**A custom platform or web app.** User accounts, dashboards, e-commerce, or anything with real logic behind it. This is a different scale of project, closer to software development than website design. (More on that distinction in [Link: Website vs Web App: What Does Your Business Need? → /blog/website-vs-web-app].)

### Costs that don't end at launch

A website isn't a one-time purchase. Budget for:

- **Hosting**, paid monthly or annually.
- **Domain renewal**, usually annual.
- **Maintenance**, for security updates and fixing anything that breaks.
- **Content updates**, either your own time or a retainer with your developer.

An agency that only quotes the build and says nothing about what happens after launch hasn't given you the full picture.

### What to ask before you accept a quote

- Does this include hosting setup, or just the build?
- How many rounds of revisions are included?
- Is the site mobile-optimised, and has that been tested on an actual phone, not just a browser preview?
- Is basic SEO included, or is that a separate line item?
- What happens if I need a small content change six months from now?

A vague answer to any of these is worth pushing on before you sign anything.

### The Nigeria-specific factors

Two things push cost in ways that don't show up in a generic pricing guide written for a different market. First, performance: a site that loads fine on fast fibre in another country can be painfully slow on the mobile data most people in Nigeria are actually browsing on, and building for that from the start takes more care, not less. Second, payment: if you're selling anything, you need local gateways like Paystack or Flutterwave properly integrated, not bolted on as an afterthought.

### What comes as standard in a WildHands build

Every site we build is custom, not a template, with a CMS included so you can edit pages, add projects, or update content yourself without calling us for every small change. Technical SEO is built in from the start rather than sold as an add-on: an XML sitemap, proper crawl rules, and increasingly, setup for AI search visibility, so the site is positioned to be found whether someone's searching on Google or asking ChatGPT.

For businesses that need more than a marketing site, that same build can extend into a client dashboard, an invoice or quote generator with Paystack built in, and basic analytics, so the site does actual work for the business instead of just sitting there.

Want a quote built around your actual scope instead of a guess? [Link: Get in touch with WildHands → /contact] and tell us what you're trying to build.

### Frequently asked questions

#### Why do website prices vary so much between agencies?

Scope, not just skill. Two agencies quoting wildly different prices for "a website" are often quoting different amounts of actual work. Always compare what is included, not just the number.

#### Is a cheap website worth it?

Sometimes. A simple template site from a low-cost provider can be the right call if your needs are simple. It stops being worth it if it cannot be updated, breaks on mobile, or needs to be rebuilt within a year.

#### How long does a website take to build in Nigeria?

A simple site can take two to three weeks. A full business site with a CMS is closer to four to six weeks. A custom platform can run several months, depending on complexity.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

## Article: Best Website Structure for Nigerian Businesses

URL: `/blog/website-structure-nigerian-businesses`  
Meta title: Best Website Structure for Nigerian Businesses | WildHands  
Meta description: How to structure a business website for Nigerian customers: essential pages, mobile-first design, trust signals, and local payment integration.

**H1:** Best Website Structure for Nigerian Businesses

- 7 Sept 2026
- Link: Websites → /blog/category/websites

WildHands Studio

Image alt: "A man planning with sticky notes on a board."

A well-designed site with confusing structure still loses customers. People land on a page, can't find what they need in a few taps, and leave. Structure decides whether your design ever gets seen properly.

### The pages every business site needs

**Home.** States what you do and for whom, in the first few seconds. This is where most first-time visitors land, so it needs to work as a summary of the whole site, not just a hero image.

**About.** Who's behind the business and why it exists. This page matters more than it looks: it's also where Google checks for trust and location signals.

**Services or products.** Specific, not vague. "What we do" pages that list three abstract categories tell a visitor nothing they can act on.

**Contact.** A real phone number and physical location, not just a form. A form alone reads as a business that's hard to reach.

**Blog** (optional, but useful). Gives you a reason to keep publishing, and each post is a new way to be found in search.

Behind these pages, a proper build gives you a CMS admin panel, so you can add a new project or update a page yourself instead of emailing a developer every time something changes. Every site we build at WildHands includes this by default, along with an XML sitemap and crawl rules set up correctly so search engines can actually find and index the structure you've built.

### Navigation that doesn't make people think

Keep the main navigation to five or six items. If you're tempted to nest a submenu three levels deep, that's usually a sign the site needs fewer, better-organised sections rather than more structure to hold everything.

Every page should be reachable in three clicks or fewer from the homepage. If a customer has to hunt for your pricing or your contact details, they'll assume you're hard to reach and go elsewhere.

### Design for mobile first, not as an afterthought

Most traffic to a Nigerian business site comes from phones, often on mobile data rather than WiFi. That changes the priorities:

- Keep image file sizes small. A beautiful hero photo that takes six seconds to load on 3G costs you visitors before they see anything.
- Put the most important information first, since people scroll less on mobile than they think they do.
- Make buttons and links big enough to tap accurately with a thumb.

Design for the phone first, then adapt up to desktop. Doing it the other way around usually produces a mobile version that feels like an afterthought, because it is one.

### Trust signals that matter locally

- A real address or service area, not just "Nigeria."
- A phone number, ideally one that's actually answered.
- A WhatsApp link. For a lot of Nigerian customers, WhatsApp is the real contact channel, and a contact form is just the formality Google expects to see.
- Genuine photos of your team, premises, or product, not generic stock imagery.
- Testimonials from real, named clients where you can get permission to use them.

### Payment and contact, built in properly

If you sell online, Paystack or Flutterwave checkout should be visible and working, not an afterthought bolted onto a template. If most of your enquiries start on WhatsApp anyway, put a WhatsApp button somewhere persistent, not buried at the bottom of a contact page.

### Structural mistakes that quietly cost you customers

- No clear next step on the homepage. Every page should make it obvious what to do next: call, message, buy, book.
- Contact information hidden in a footer nobody scrolls to.
- Heavy, unoptimised images slowing every page down.
- No mention of location anywhere on the site, which makes it harder for Google to show you in local search results at all.

Want your site structured around how Nigerian customers actually browse? [Link: Talk to WildHands → /contact] about your project.

### Frequently asked questions

#### How many pages should a business website have?

Enough to cover what you actually do, and no more. Most small and mid-sized businesses need five to eight core pages. Adding pages for the sake of it dilutes the site rather than strengthening it.

#### Should WhatsApp replace a contact form?

Not replace, but sit alongside it. Some visitors prefer a form, especially for a formal enquiry. Offer both and let people choose.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

## Article: Website vs Web App: What Does Your Business Need?

URL: `/blog/website-vs-web-app`  
Meta title: Website vs Web App: What Does Your Business Need? | WildHands  
Meta description: A clear way to decide whether your business needs a website or a web app, with real examples and what each one costs to build and maintain.

**H1:** Website vs Web App: What Does Your Business Need?

- 7 Sept 2026
- Link: Websites → /blog/category/websites

WildHands Studio

Image alt: "A woman on a phone call while working on her laptop."

A website presents information. A web app lets someone do something. That's the real distinction, and most confusion about which one a business needs comes from skipping past it.

### What a website is

A website is mostly static content: pages that tell visitors who you are, what you offer, and how to reach you. Visitors browse anonymously. Content is the same for everyone who lands on it. A restaurant's menu page, a consultancy's services pages, a portfolio: these are websites, however polished they are.

### What a web app is

A web app is interactive. Users log in, the app stores and acts on their data, and it does something a static page can't: books an appointment, tracks an order, generates a report, manages inventory. Content and function often differ from one logged-in user to the next.

### The questions that settle it

- **Does a visitor need to log in to get value from it?** If yes, you're looking at a web app.
- **Does the business need to store data specific to each user?** Order history, saved preferences, account balances: all signs you need an app.
- **Is there a repeatable action a user performs, again and again?** Booking a table, tracking a delivery, reordering stock. A website can list your services; it can't let someone manage an ongoing relationship with your business.
- **Does the content change based on who's viewing it?** A dashboard showing one client their own invoices is fundamentally different from a page showing the same services list to everyone.

If you answered no to all of these, a website covers it. If you answered yes to any of them, you need a web app, or a website with an app-like feature built in.

### Real examples

A restaurant showcasing its menu and location needs a website. A logistics company letting customers track a delivery in real time needs a web app.

A real estate agency listing available properties can run on a website, possibly with a search filter. A property management company handling tenant payments and maintenance requests needs a web app, because tenants are logging in to manage something specific to their account.

A consultancy presenting its services and case studies needs a website. A fintech letting users check a balance and move money needs a web app, no question.

We've built this exact hybrid for a service agency: a public-facing website to show off their portfolio and bring in leads, plus a client dashboard behind a login where their own clients can view quotes, pay invoices through Paystack, and track project status. The public side stays a simple, fast website. The parts that need accounts and data get proper app treatment. That split, rather than forcing everything into one or the other, is usually the right call.

### Where e-commerce sits

E-commerce is the case that confuses people most, because it has features of both. Product pages are essentially a website: static content anyone can browse. But checkout, accounts, and order tracking are app-like functionality layered on top. Most e-commerce sites are built as websites with an app-like commerce layer built in, rather than as full custom apps from the ground up. For more on what that costs, see [Link: How Much Does E-commerce Development Cost in Nigeria? → /blog/ecommerce-development-cost-nigeria]

### What this means for cost and timeline

A website is usually the faster, cheaper build. Content, design, and launch, done. A web app takes longer, because it needs a database, user authentication, and testing across the actual logic of what users can do, not just how pages look.

Web apps also carry more ongoing cost. Bugs in logic need fixing, not just content updates. Security around user accounts and data needs regular attention. A website mostly needs content refreshes and the occasional design update; a web app needs real, ongoing development.

### Starting with a website doesn't box you in

Plenty of businesses launch with a website and add app-like functionality later, once they know exactly what their customers actually need. Starting simple and adding complexity when it's proven necessary is usually the smarter build order, not a compromise.

Not sure which one fits your business? [Link: Tell WildHands what you're trying to build → /contact] and we'll help you work out the right scope.

### Frequently asked questions

#### Can a website become a web app later?

Yes. It's common to launch a website first, prove the business need, then add accounts, dashboards, or other app functionality once you know exactly what's required.

#### Do I need a web app for e-commerce?

Not usually a full custom app. Most e-commerce runs well as a website built with commerce functionality (accounts, checkout, order tracking) added on top, rather than a ground-up app build.

_[Hidden on phones, shown from tablet width up:]_

Button: See all posts → /blog

_[end hidden on phones]_

### Related posts

Button: See all → /blog

Image alt: "A woman in a bright print top working on her laptop."

#### How to Get Your Business on Google in Nigeria (Free)

- 8 November 2026
- Websites

Card link → /blog/how-to-get-your-business-on-google (screen-reader label: "How to Get Your Business on Google in Nigeria (Free)")

Image alt: "A trader in traditional dress checking his phone among his goods."

#### Do You Need a Website If You Sell on Instagram and WhatsApp?

- 2 November 2026
- Websites

Card link → /blog/do-i-need-a-website-instagram-whatsapp (screen-reader label: "Do You Need a Website If You Sell on Instagram and WhatsApp?")

Image alt: "A fashion designer sewing patterned African fabric on a sewing machine."

#### Shopify vs a Custom Website in Nigeria: Which Is Better?

- 6 October 2026
- Websites
- Pricing

Card link → /blog/shopify-vs-custom-website-nigeria (screen-reader label: "Shopify vs a Custom Website in Nigeria: Which Is Better?")

---

# Contact and quotes

## Get in touch

URL: `/contact`  
Meta title: Get in touch | WildHands  
Meta description: Tell WildHands about your project. We reply to every enquiry, usually within one working day.

Form messages and dropdown options: see Shared block: forms.

**H1:** Get in touch

Tell us what is eating your hours: the report someone rebuilds every week, the spreadsheet three people maintain, the thing you keep meaning to automate. We read every enquiry and reply with a concrete next step, usually within one working day. You can also email us at [Link: hello@whstd.com → mailto:hello@whstd.com].

(Hidden anti-spam field, never shown to people: "Company fax")

Label: First name *

`field: type=text, name='firstName', placeholder='Your first name', maxlength='80'`

Label: Last name *

`field: type=text, name='lastName', placeholder='Your last name', maxlength='80'`

Label: Work email *

`field: type=email, name='email', placeholder='you@company.com', maxlength='200'`

Label: Phone (optional)

`field: type=tel, name='phone', placeholder='With your country code', maxlength='40'`

Label: Tell us about your project *

`field: type=textarea, name='message', placeholder='What is taking up your team’s time?', maxlength='5000'`

Label: How did you hear about us? (optional)

Button: Choose one

Button: Send message

Read how we handle your details in our [Link: privacy policy → /privacy].

## Request a quote

URL: `/request-a-quote`  
Meta title: Request a quote | WildHands  
Meta description: Tell us what you're building and we come back with a scoped quote within a working day. Nothing here is binding.

Form messages and dropdown options: see Shared block: forms.

**H1:** Request a quote

Tell us what you are building. We read every request and reply within one working day, with either a scoped quote or a couple of questions we need answered first. Nothing here is binding. You can also email us at [Link: hello@whstd.com → mailto:hello@whstd.com].

(Hidden anti-spam field, never shown to people: "Company fax")

Label: First name *

`field: type=text, name='firstName', placeholder='Your first name', maxlength='80'`

Label: Last name *

`field: type=text, name='lastName', placeholder='Your last name', maxlength='80'`

Label: Work email *

`field: type=email, name='email', placeholder='you@company.com', maxlength='200'`

Label: Phone (optional)

`field: type=tel, name='phone', placeholder='With your country code', maxlength='40'`

Label: Company (optional)

`field: type=text, name='company', placeholder="If you're representing one", maxlength='200'`

Label: What are you building? * (screen-reader text: "(required)")

Button: Choose what fits closest

Label: Tell us about it *

A sentence or two is enough. The more you can say now, the tighter the quote.

`field: type=textarea, name='projectSummary', placeholder="What you're trying to build, who it's for, and anything about it that already exists.", maxlength='4000'`

Label: Budget (optional)

`field: type=text, name='budgetRange', placeholder='A range, a ceiling, or "no idea yet"', maxlength='120'`

Label: Timeline (optional)

`field: type=text, name='timeline', placeholder='For example ready to start now, launch by December', maxlength='120'`

Label: How did you hear about us? (optional)

Button: Choose one

Button: Send request

Read how we handle your details in our [Link: privacy policy → /privacy].

### Prefer email?

- [Link: sales@whstd.com → mailto:sales@whstd.com] for new projects
- [Link: hello@whstd.com → mailto:hello@whstd.com] for anything else

Running a formal RFP or procurement process? Send it to the sales address and we will confirm receipt with a named contact.

### What happens next

1. (visual: 01) We read it. A real person, not an autoresponder.

2. (visual: 02) We reply. Within one working day, with a scoped quote or a couple of questions.

3. (visual: 03) You decide. Nothing here is binding: a quote is a starting point, not a signature.

---

# Brand assets

## Brand assets

URL: `/brand-assets`  
Meta title: Brand assets | WildHands  
Meta description: How to use the WildHands logo in articles, videos and marketing, and how to ask us for the files.

The button opens an email to hello@whstd.com with the subject "Brand files".

**H1:** Brand assets

Use the WildHands logo when you show us in an article, a video or your own marketing. Keep it as it is: no new colours, shadows or stretching.

Button: Ask for brand files → mailto:hello@whstd.com?subject=Brand%20files

---

# Legal

## Privacy Policy

URL: `/privacy`  
Meta title: Privacy Policy | WildHands  
Meta description: What WildHands collects, why, how long we keep it, and how to get it deleted.

**H1:** Privacy Policy

Last updated 27 August 2026

### The short version

- We collect what you type into our forms, and nothing else unless you accept analytics.
- We do not run a database of you. Submissions arrive as email; a CV is also filed privately so we can read it again.
- We do not sell your data, and we do not use it for advertising.
- The site sets no cookies at all until you make a choice in the banner.
- Email [Link: hello@whstd.com → mailto:hello@whstd.com] and we will delete everything we hold about you.

### Who we are

WildHands is the data controller for the personal data described on this page. That means we decide what is collected and why, and we are responsible for looking after it.

For anything about this policy, or to exercise any of the rights below, email [Link: hello@whstd.com → mailto:hello@whstd.com]. A person reads that address.

### What we collect

There are only four ways we end up with your personal data.

- **You contact us.** Your name, email address, your phone number if you give one, what you write about your project, and how you heard about us if you tell us.
- **You apply to work with us.** Your name and contact details, links to your professional profiles, your CV, and your answers to the application questions. Freelance applications also ask where you are resident for tax, what you are available for, and how many hours a month you want. Your CV is also stored as a private file so we can read it again during the process; everything else stays in the email.
- **You subscribe to the freelance newsletter.** Your email address.
- **You accept analytics.** Which pages you visited, roughly where in the world you are, and what browser you used. Analytics do not load unless you accept them.

We do not ask for anything sensitive, and we would rather you did not send it. Please do not put health information, financial details or identity documents into a form on this site.

### Why we collect it, and our lawful basis

Under the UK GDPR we have to have a lawful basis for each thing we do with your data. Here is ours, in full.

Visual described to screen readers (aria-label): "Our lawful basis for each use of your data"

| What we do | What that uses | Lawful basis | Why that one |
| --- | --- | --- | --- |
| Replying to an enquiry you send us | Name, email, phone, what you write | Legitimate interests | You contacted us about working together, and you expect a reply. |
| Assessing a job or freelance application | Name, contact details, profile links, CV, your answers | Steps prior to a contract | We cannot consider you for work without reading what you sent. |
| Keeping an application on file for future roles | The same application | Consent | Only if you tick the box. You can withdraw it at any time. |
| Sending the freelance newsletter | Email address | Consent | You asked for it, and you can tell us to stop at any time. |
| Understanding which pages are useful | Page views, browser and country | Consent | Analytics stay switched off unless you accept them. |

Where we rely on legitimate interests, we have weighed our interest in running the business against your privacy. Replying to an enquiry you chose to send us is not something we think you would object to. If you disagree, you can object. See your rights below.

### How long we keep it

Form submissions arrive as email rather than going into a database, so deletion means removing the message and its attachments from our mailbox, and, for an application, deleting the stored copy of the CV. These are the periods we work to.

Visual described to screen readers (aria-label): "How long we keep each kind of data"

| What | How long |
| --- | --- |
| Enquiries sent through the contact form | 24 months from your last message to us |
| Applications for a role we advertised | 12 months from the decision |
| Applications you asked us to keep on file | 24 months, then we ask again or delete |
| CVs, stored as private files | Deleted with the application they arrived with |
| Newsletter subscriptions | Until you unsubscribe |
| Analytics | 12 months, then aggregated |

If a project starts, the enquiry stops being an enquiry and becomes part of the client record, which we keep for as long as the law requires us to keep business records. Ask us and we will tell you exactly what we still hold.

### Who else touches it

Four companies process data on our behalf. Each is bound by a contract that limits them to acting on our instructions.

- **Resend** delivers every form submission to us by email, including any CV you attach. Without Resend, the form does not reach anyone.
- **Cloudinary** stores CVs sent with an application. They are kept as private files, not on a public address. Reaching one needs a signed link that we generate and that expires.
- **PostHog** processes analytics, and only if you accept them.
- **Vercel** hosts the site and serves every page. Its access logs record IP addresses for a short period as part of running the infrastructure.

Nobody else gets your data. We do not sell it, we do not trade it, and we do not hand it to advertisers. We would disclose it if a court or the law required us to, and we would tell you unless we were forbidden from doing so.

### Where it goes

Our providers operate internationally, so your data may be processed outside the UK and the EEA, in practice in the United States. Where that happens it is covered by the UK International Data Transfer Addendum and the EU Standard Contractual Clauses, which are the safeguards the law provides for exactly this. You can ask us for a copy of the relevant terms.

### Cookies, and what we store in your browser

**This site sets no cookies.** Nothing at all is stored in your browser until you choose Accept or Decline in the banner.

- **Your choice.** We save it in your browser’s local storage so we do not ask again on every page. Nothing about it is sent to us.
- **If you accept analytics,** PostHog stores an identifier in local storage so that a returning visitor is not counted as a new person. It is switched off entirely if you decline, and it never loads before you decide.

Analytics here are deliberately narrow. We record page views. We do not record clicks, keystrokes, form contents, or session replays.

To change your mind, clear this site’s data in your browser settings. The banner will appear again on your next visit and you can choose differently.

### Keeping it safe

The site is served only over HTTPS. Form endpoints are rate-limited to make abuse expensive, which involves holding your IP address briefly in memory. It is never written to disk and never sent anywhere. Uploaded CVs are checked by file type and size and renamed on our side, so a filename can never be used to attack our systems. A stored CV is uploaded as a private file, not a public one, so it has no address anyone can guess. Reaching it needs a signed link that expires. Access to the mailbox holding enquiries is limited to the people who need it, and protected by two-factor authentication.

No system is perfect. If we ever suffer a breach that puts you at risk, we will tell the Information Commissioner’s Office within 72 hours and tell you without undue delay.

### Your rights

You can ask us to do any of the following, free of charge.

- **See it.** Get a copy of everything we hold about you.
- **Fix it.** Correct anything that is wrong or incomplete.
- **Delete it.** Have it erased where we have no overriding reason to keep it.
- **Limit it.** Have us pause using it while a dispute is sorted out.
- **Object to it.** Tell us to stop, where we are relying on legitimate interests.
- **Move it.** Get it in a portable format, or have us send it somewhere else.
- **Withdraw consent.** Where consent is the basis, you can take it back at any time. That does not undo anything we did lawfully beforehand.

Email [Link: hello@whstd.com → mailto:hello@whstd.com]. We will reply within one month. We may ask you to confirm who you are first, so that we do not hand your data to somebody else.

### If you are unhappy

Please tell us first, because most things are quicker to fix directly. If we do not put it right, you have the right to complain to the UK’s data protection regulator, the [Link: Information Commissioner’s Office → https://ico.org.uk/make-a-complaint/]. Complaining to them does not affect your right to a legal remedy.

If you are in the EEA, you can also complain to the supervisory authority where you live or work.

### Children

This site is aimed at businesses and at people looking for professional work. It is not intended for anyone under 16, and we do not knowingly collect their data. If you believe a child has sent us something, email us and we will delete it.

### Changes to this policy

When we change how we handle data, we update this page and move the date at the top. If a change matters to you, such as a new processor or a new purpose, we will say so clearly here rather than burying it. See also our [Link: Terms of Service → /terms-of-service].

### Contact

Email [Link: hello@whstd.com → mailto:hello@whstd.com] for anything on this page: questions, corrections, deletions, or complaints.

## Terms of Service

URL: `/terms-of-service`  
Meta title: Terms of Service | WildHands  
Meta description: The standard terms that come with every WildHands quote: what is included, what counts as a revision, and what happens when something changes.

**H1:** Terms of Service

Last updated 3 September 2026

These are the standard terms that come with every WildHands quote. Where they say “above”, they mean the quote they arrive with: its breakdown, its timeline and its payment terms. Please read them with our [Link: Privacy Policy → /privacy].

### What is included

Everything listed in the breakdown above, built to the scope agreed at the start. Each phase includes two rounds of revisions, and 30 days of support after handover for anything that is not working as described.

### Revisions

A revision is a change to something we have already built, within the agreed scope: copy, layout, spacing, colour, wording, or fixing something that does not behave as specified. Revisions are included, two rounds per phase. Rounds are consolidated feedback, not individual requests, so gather your comments and send them together.

### Work beyond the agreed scope

Three things are not revisions, and each is quoted separately before any work starts:

A rebuild is replacing something already approved and built with a different approach. If a page or a screen is signed off and then needs to be built again a different way, that is new work.

A redesign is changing the visual direction after it has been approved. Exploring alternatives before sign-off is part of the design phase; changing direction afterwards is not.

A new feature is anything not in the breakdown above. If it is not listed, it has not been priced.

We will always tell you before work becomes chargeable, and you will have a written price before we start. Nothing gets built that you have not agreed.

### What we need from you

Timely feedback, and access to whatever the work depends on: accounts, test environments, content, and the people who can approve things. We work to the timeline above on the basis of feedback within five working days at each sign-off point. If that slips, the timeline moves with it.

### Third-party costs

Hosting, domains, API fees, licences and identity checks are billed to you directly at cost, or passed on without markup. We will tell you what these are before you commit to anything.

### Payment

As set out above. Work begins once the deposit clears. Invoices are payable within the terms stated on the invoice.

Unless your quote says otherwise: 50% to start, 50% on handover. Invoices are payable within 14 days. Work begins once the deposit clears.

### If something changes

Either side can pause or stop the work. You pay for what has been done up to that point, and you keep it: designs, code and content produced so far are yours.

---

# Error pages

## Page not found (404)

URL: any address that does not exist
Meta title: No page here | WildHands
Meta description: WildHands builds custom websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa. Built around how you actually work, not a template.

**H1:** Nothing here

There is no page at this address. The link may be old or mistyped.

Button: Go to the home page → /

Note: this is the v2 site's own not-found page (shown when navigating inside the site). The local dev server's direct 404 response showed Astro's default "404: Not found" instead, so check which one production serves.

## Page could not load (500)

URL: shown at whatever address failed
Meta title: Page unavailable

**H1:** This page could not load

The fault is on our side, not yours. Try again in a moment, or email us if it keeps happening.

[Button: Try again] [Button: Go to the homepage → /] [Button: Email us → mailto:hello@whstd.com]

---

# Tools

## llms.txt Generator

URL: `/tools/llms-txt-generator`  
Meta title: llms.txt Generator | WildHands  
Meta description: Generate an llms.txt index for any public website from its sitemap. Free, and nothing is stored.

This page is live but kept out of search results (noindex) and is not linked from the navigation. Messages: empty input "Enter the address of a website, such as https://example.com."; failure "We could not make a file for that address. Check it opens in your browser, then try again."; offline "We could not reach our server. Check your connection and try again."; server check "Enter a full website or sitemap URL, including https://" / "That does not look like a website address."; result line "Found {n} pages and included the {n} closest to the home page." above the generated Markdown, with a copy button labelled "Copy" (then "Copied" or "Failed"; screen-reader label "Copy code to clipboard").

**H1:** llms.txt Generator

Point it at a website and it builds a Markdown index of the pages an AI assistant should read first.

Label: Website or sitemap address *

Nothing is stored. Larger sites can take a few seconds.

`field: type=url, name='url', placeholder='https://example.com'`

Button: Generate llms.txt

### How it works

1. (visual: 01)

#### Find

We read your robots.txt, find your sitemaps, and follow any nested or zipped ones.

2. (visual: 02)

#### Choose

We take up to thirty of the pages closest to your home page, then read each one’s title and description.

3. (visual: 03)

#### Publish

Copy the Markdown and serve it at /llms.txt on your domain.

### What is llms.txt?

llms.txt is a plain Markdown file at the root of a website listing its most important pages, each with a one-line description. It helps AI assistants find and cite the right pages instead of guessing from a crawl. It is not a search ranking signal and does not replace a sitemap: it sits alongside one.

---

# Machine-readable files (read by search engines and AI assistants)

## /llms.txt

Generated automatically from the page titles and meta descriptions above, so it changes when they change. Only the "Key pages" one-line descriptions and the opening summary are written separately. Shown here as served (local URLs replaced by https://www.whstd.com):

```markdown
# WildHands

> WildHands builds custom websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa. Built around how you actually work, not a template.

## Key pages

- [Pricing](https://www.whstd.com/pricing): The 72-hour website: Starter and Standard, one-off, with half paid to start.
- [Work](https://www.whstd.com/resources): Case studies of the apps, websites and tools we designed and built.
- [Insights](https://www.whstd.com/blog): Answers to the questions businesses in Nigeria ask about websites, apps and tools.
- [About](https://www.whstd.com/about): Who we are and how we work.
- [Request a quote](https://www.whstd.com/request-a-quote): Send a brief and get a scoped quote within a working day.
- [Careers](https://www.whstd.com/careers): Open roles at the studio.
- [Freelance Hub](https://www.whstd.com/freelance-hub): How to freelance with us, and the application form.
- [Get in touch](https://www.whstd.com/contact): Contact form, email and WhatsApp.

## Services

- [Websites](https://www.whstd.com/use-cases/websites): Websites built from scratch around what you publish. Marketing sites that convert and full custom builds, designed in Lagos for businesses across Nigeria and Africa.
- [Apps](https://www.whstd.com/use-cases/apps): Custom web apps and internal tools built around how your team actually works, rather than how off-the-shelf software assumes you do.
- [Tools & Systems](https://www.whstd.com/use-cases/tools-and-systems): Dashboards that show what is actually happening, and automation that removes the manual steps between the tools you already use.

Each service also has a page for every place we serve, at /use-cases/<service>/<place>: Lagos, Nigeria; Lekki, Lagos; Lagos Mainland; Victoria Island, Lagos; Ikoyi, Lagos; Canada; Toronto, Ontario; Vancouver, British Columbia; Montreal, Quebec; the United Kingdom; London; Manchester; Edinburgh; the United States; New York, NY; San Francisco, CA; Austin, TX; Rwanda; Kigali, Rwanda; Butare (Huye), Rwanda; Gisenyi (Rubavu), Rwanda; Ghana; Accra, Ghana; Kumasi, Ghana; Takoradi, Ghana; South Africa; Johannesburg, South Africa; Cape Town, South Africa; Durban, South Africa.

## What we build

- [Marketing sites](https://www.whstd.com/what-we-build/marketing-sites): A focused website built from scratch to represent your business and turn visitors into enquiries. Starter and Standard sites are live in 72 hours.
- [Full custom builds](https://www.whstd.com/what-we-build/full-custom-builds): More pages and more functionality, for businesses whose website has to sell, take payments or run a back office. Built from scratch in Lagos.
- [CMS admin panel](https://www.whstd.com/what-we-build/cms-admin-panel): Every WildHands site ships with an admin panel written for the person running the business: change words and pictures, preview them, then publish.
- [Search and AI visibility](https://www.whstd.com/what-we-build/search-visibility): Crawl rules, an XML sitemap and AI search visibility setup on every WildHands site, so search engines and AI assistants can read what your business does.
- [Simple website analytics](https://www.whstd.com/what-we-build/website-analytics): Visitors counted on your own site with no ad trackers: who is browsing now, where they came from, what they looked at, and when the site is busiest.
- [Quotes and invoices](https://www.whstd.com/what-we-build/quotes-and-invoices): Quotes your client accepts on the page, and an invoice that fills itself from the accepted option. Built by WildHands in Lagos.
- [Client management dashboard](https://www.whstd.com/what-we-build/client-management): Contacts, contracts, invoices and tasks in one workspace your team shares, with a portal where each client sees their own records.
- [Custom web apps](https://www.whstd.com/what-we-build/custom-web-apps): Software your team or your customers log into, built around how you work, for a job off-the-shelf tools do not quite do.
- [Internal-facing tools](https://www.whstd.com/what-we-build/internal-tools): Tools built for one specific workflow and the people who live with it every day, so the routine runs itself and only asks when something looks wrong.
- [Live dashboards](https://www.whstd.com/what-we-build/live-dashboards): The numbers that matter in one live view instead of rebuilt every week, pulled from data your business already produces.
- [Workflow automation](https://www.whstd.com/what-we-build/workflow-automation): Automation that removes the manual steps between your tools for good. Judged by the hours it gives back.
- [Connecting the tools you use](https://www.whstd.com/what-we-build/connected-tools): Paystack, Stripe, Google, WhatsApp, email and more, connected so data moves between them without anyone re-keying it.

## Case studies

- [Auto Flow: bulk video generation without the manual loop](https://www.whstd.com/resources/auto-flow): Point it at a folder of images and it generates every video unattended, three at a time.
- [Lazy Meet: joining the call so you do not have to](https://www.whstd.com/resources/lazy-meet): Joins your calls at start time, muted and camera off, across three accounts.
- [The Ruff Agency: one workspace instead of six tools](https://www.whstd.com/resources/the-ruff-agency): Clients, contracts, invoices, tasks and a client portal in one shared workspace.
- [Tomori: a shop for hand-dyed Adire, built for a phone](https://www.whstd.com/resources/tomori): A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.
- [Marvy: course videos filed in one step](https://www.whstd.com/resources/marvy): Drop a video in and it lands in the right Drive folder, with the right people tagged.
- [Rayo: quotes your client accepts on the page](https://www.whstd.com/resources/rayo): Send a quote with options, the client accepts one, and it becomes the invoice.
- [Dory: a budget app that always knows what is left](https://www.whstd.com/resources/dory): Budget, shopping, loans and subscriptions in one place, with what is left always on top.
- [Planes: a to-do list you race your friends on](https://www.whstd.com/resources/planes): Swipe to land a task, fly one to a friend, and race your crew on the leaderboard.
- [Marque: brand guidelines, made easy](https://www.whstd.com/resources/marque): Start from a logo, edit the guide in place, and publish it at one link.

## Insights

- [How to Get Your Business on Google in Nigeria (Free)](https://www.whstd.com/blog/how-to-get-your-business-on-google): Create a free Google Business Profile, verify it, and give Google a website it can read. Here are the steps, and what helps a small business rank higher.
- [What Is an Internal Tool, and Does Your Business Need One?](https://www.whstd.com/blog/what-is-an-internal-tool): An internal tool is software your team uses to run the business, like an admin panel or dashboard. Here are real examples and how to tell if you need one.
- [Do You Need a Website If You Sell on Instagram and WhatsApp?](https://www.whstd.com/blog/do-i-need-a-website-instagram-whatsapp): You can sell on Instagram and WhatsApp without a website, but you own neither. A simple site gives you an address on Google that no platform can switch off.
- [When Should You Replace Spreadsheets With a Custom Tool?](https://www.whstd.com/blog/replace-spreadsheets-with-custom-tool): Replace a spreadsheet when several people edit it, mistakes cost money, or data is copied between files. Here are the signs, and your options from cheapest up.
- [Web App or Mobile App: Which Should You Build First?](https://www.whstd.com/blog/web-app-vs-mobile-app): For most businesses a web app is the better first build: one version for every phone, no app store fees, no store reviews. Here is when to go native instead.
- [How Much Does It Cost to Build an App in Nigeria?](https://www.whstd.com/blog/how-much-does-it-cost-to-build-an-app-in-nigeria): App prices in Nigeria vary widely: one app is a booking tool, another a fintech platform. Here is what drives the cost and how to get a quote you can trust.
- [Shopify vs a Custom Website in Nigeria: Which Is Better?](https://www.whstd.com/blog/shopify-vs-custom-website-nigeria): Shopify works in Nigeria, but you pay a monthly fee in dollars plus an extra cut of each sale made through Paystack. Here is when that is worth paying.
- [How to Accept Payments on Your Website in Nigeria](https://www.whstd.com/blog/accept-payments-website-nigeria): To take payments on a Nigerian website, open a Paystack or Flutterwave account, verify it and add their checkout. Here is how it works and what it costs.
- [How Much Are Domain, Hosting and Maintenance in Nigeria?](https://www.whstd.com/blog/domain-hosting-maintenance-cost-nigeria): After launch, a website needs its domain renewed yearly, hosting, and changes now and then. Here is what each cost covers in Nigeria and how to budget for it.
- [How Long Does It Take to Build a Website?](https://www.whstd.com/blog/how-long-does-it-take-to-build-a-website): A small business website can be live within days once the design is approved and the content is ready. Larger sites take weeks. Here is what sets the pace.
- [How to Choose a Web Development Agency in Lagos](https://www.whstd.com/blog/choose-web-development-agency-lagos): What to check before hiring a web development agency in Lagos, from portfolio and process to ownership and aftercare.
- [How Much Does E-commerce Development Cost in Nigeria?](https://www.whstd.com/blog/ecommerce-development-cost-nigeria): What actually drives the cost of an e-commerce site in Nigeria, from platform choice to payment integration and delivery logistics.
- [What Should a Nigerian Business Website Include?](https://www.whstd.com/blog/nigerian-business-website-checklist): A practical checklist of what every Nigerian business website needs, from essential pages to local payment and trust signals.
- [How Much Does a Website Cost in Nigeria?](https://www.whstd.com/blog/website-cost-nigeria): A real answer to what drives website cost in Nigeria, the three main scope tiers, and what to check before you accept a quote.
- [Best Website Structure for Nigerian Businesses](https://www.whstd.com/blog/website-structure-nigerian-businesses): How to structure a business website for Nigerian customers: essential pages, mobile-first design, trust signals, and local payment integration.
- [Website vs Web App: What Does Your Business Need?](https://www.whstd.com/blog/website-vs-web-app): A clear way to decide whether your business needs a website or a web app, with real examples and what each one costs to build and maintain.
```

## /agent/prompt.md

Instructions for an AI assistant that a visitor asks to contact WildHands. Public, plain text. Shown as served (local URLs replaced by https://www.whstd.com):

````markdown
<!-- wildhands-inquiry-instructions v2 -->

# Send a project enquiry to WildHands

You are helping your user contact WildHands (https://www.whstd.com), a studio
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

If you can browse, check https://www.whstd.com/ for what they take on
and https://www.whstd.com/resources for what they've built. Tell your user plainly
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

```markdown
<!-- wildhands-inquiry v1 -->

**Name:** Ada Iwu
**Email:** ada@company.com
**Company:** Northsight
**Phone:** +234 800 000 0000
**Website:** https://company.com
**Heard about:** Where the user first came across WildHands

## Brief

The approved brief, as plain text.
```

The comment line, the Name and Email lines, and the `## Brief` heading must
match this exactly, character for character. The page matches on that literal
text, so don't reword, reformat, or "clean up" those lines even if it seems
harmless. Company, Phone, Website, and Heard about are optional. Leave out any
line you don't have rather than inventing a value.

Never hand over the block on its own. Most people haven't seen this flow
before, so follow it with plain instructions:

1. Copy the whole block, including the comment line at the top.
2. Open https://www.whstd.com/contact
3. Click anywhere on that page and paste. The form fills itself in.
4. Read it over, then press "Send message."

If the form doesn't autofill for any reason, the same details can be typed in
by hand. Nothing is lost either way.

## 8. Afterwards

Tell your user WildHands replies to every enquiry, usually within one working
day of sending. Anything urgent in the meantime can go to the address on
https://www.whstd.com/contact
````

## /robots.txt and /sitemap.xml

No copy: crawl rules and the list of page addresses only.
