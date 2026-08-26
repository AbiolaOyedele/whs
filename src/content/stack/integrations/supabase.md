---
category: 'integrations'
name: 'Supabase'
recommended: true
order: 10
title: 'Supabase'
description: 'Supabase provides a hosted Postgres database with authentication, storage and row-level security.'
positioning: 'What we reach for when a marketing site grows a feature that genuinely needs a database.'
definition: 'Supabase is a hosted platform built on Postgres, adding authentication, file storage, and an auto-generated API. Access control is enforced in the database itself through row-level security rather than in application code.'
chooseWhen:
  - 'A marketing site has grown a gated resource or an account area'
  - 'You want Postgres rather than a proprietary datastore'
  - 'Row-level security is a better fit than application-layer permission checks'
lookElsewhereWhen:
  - 'The site is genuinely stateless and does not need a database at all'
  - 'You already run Postgres and only need a client'
pricingNote: 'Free tier suitable for prototypes, then usage-based. Costs track database size and bandwidth.'
houseView: 'The most common mistake is adding a database to a marketing site before anything needs one. The second most common is enforcing permissions in application code when the database could do it.'
faqs:
  - question: 'What is Supabase used for?'
    answer: 'Supabase provides a hosted Postgres database with built-in authentication, file storage and row-level security, used when a site needs to store and control access to real data.'
  - question: 'Does a marketing site need a database?'
    answer: 'Usually not. A marketing site delivering content from a CMS is stateless. A database becomes necessary only when the site stores something: accounts, gated resources, submitted data it must retain.'
atAGlance:
  - label: 'Category'
    value: 'Backend platform'
  - label: 'Best for'
    value: 'Sites that have grown a genuine data requirement'
  - label: 'Pricing shape'
    value: 'Free tier plus usage'
  - label: 'House view'
    value: 'Add it only when something actually needs it'
placeholder: true
---

Placeholder technology page. The assessment is written to exercise the template and should be reviewed before launch.
