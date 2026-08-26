---
title: 'Website migration'
description: 'We move marketing sites off legacy platforms onto a stack the in-house team can run without a developer on standby.'
placeholder: true
eyebrow: 'Migrate'
summary: 'Move off the platform that is slowing you down, without losing a decade of SEO on the way out.'
pillar: 'migrate'
order: 10
definition: 'A website migration moves an existing site onto a new platform while preserving its URLs, its search rankings, and its content history. The risky part is never the build — it is the redirect map, the content mapping, and the cutover plan.'
includes:
  - title: 'Content and URL audit'
    body: 'Every page, template and redirect gets inventoried before anything moves, so nothing is discovered missing after launch.'
  - title: 'Redirect mapping'
    body: 'A one-to-one redirect map is written and tested against the live crawl, not generated from a pattern and hoped for.'
  - title: 'Content modelling'
    body: 'The new content model is designed around how the marketing team actually publishes, not around how the old database happened to be shaped.'
  - title: 'Staged cutover'
    body: 'DNS moves last. Everything before it runs in parallel so a rollback is always one change away.'
platforms:
  - title: 'Legacy .NET and Java CMS estates'
    body: 'Long-lived enterprise installs where the licence renewal now costs more than the rebuild.'
  - title: 'WordPress multisite'
    body: 'Networks that grew past what a single plugin stack can sensibly hold.'
  - title: 'Bespoke in-house systems'
    body: 'Internal tools that became the public website by accident and never had a maintainer.'
pricingNote: 'Migrations are priced after the audit. Until the page count, template count and integration surface are known, any number would be invented.'
choosingAPartner:
  - title: 'Ask what happens to your redirects'
    body: 'If the answer is vague, the search traffic is at risk. A real answer names the tooling and the verification step.'
  - title: 'Ask who runs it afterwards'
    body: 'A migration that ends at launch leaves you with a new platform and no one who understands it.'
  - title: 'Ask to see a rollback plan'
    body: 'Cutovers go wrong. The question is whether the plan assumed they might.'
houseView: 'Most migrations fail on content operations, not engineering. If the marketing team cannot publish on day one without filing a ticket, the project did not succeed — it just moved.'
faqs:
  - question: 'How long does a website migration take?'
    answer: 'A typical marketing site of 100 to 300 pages takes eight to fourteen weeks from audit to cutover. Estates with multiple brands or languages take longer, and the audit is what tells us which one you have.'
  - question: 'Will a migration hurt our search rankings?'
    answer: 'A migration with a complete, tested redirect map and preserved page structure usually holds rankings within normal week-to-week variance. Rankings drop when redirects are approximated rather than mapped page by page.'
  - question: 'Can we keep publishing during the migration?'
    answer: 'Yes. The old platform stays live and editable until cutover, and content added during the build is synchronised across before DNS moves.'
  - question: 'What does a website migration cost?'
    answer: 'We price after the audit. The three things that move the number most are template count, integration count, and how clean the existing content model is.'
  - question: 'Do we need to redesign at the same time?'
    answer: 'Not necessarily, and often you should not. Migrating and redesigning at once makes it impossible to tell which change caused a metric to move.'
atAGlance:
  - label: 'Category'
    value: 'Platform migration and replatforming'
  - label: 'Best for'
    value: 'Teams on a legacy CMS whose publishing speed is limited by engineering availability'
  - label: 'Typical work'
    value: 'Content audit, content modelling, redirect mapping, rebuild, staged cutover'
  - label: 'Engagement'
    value: 'Fixed-scope project, optionally followed by an ongoing care retainer'
  - label: 'Pricing shape'
    value: 'Priced after a paid audit'
  - label: 'House view'
    value: 'If the marketing team still needs a developer to publish, the migration is not finished'
relatedWork:
  - 'northwind-retail'
  - 'aeon-logistics'
---

Migrations are mostly a content problem wearing an engineering costume. The build is predictable. What is not predictable is what the last decade left in the database.

## Where the time actually goes

The audit usually finds three things: pages nobody knew were still indexed, templates that exist for a single page, and integrations that were wired directly into the CMS rather than sitting behind an interface. Each one is cheap to handle once it is known and expensive to discover at cutover.

## How the cutover works

DNS is the last thing to change. Before that point the new site runs in parallel against production content, the redirect map is verified against a full crawl of the old site, and the team has already published on the new platform at least once.
