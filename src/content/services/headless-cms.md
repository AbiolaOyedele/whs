---
title: 'Headless CMS implementation'
description: 'We design content models and editor workflows in headless CMS platforms so publishing stops depending on developer availability.'
placeholder: true
eyebrow: 'Migrate'
summary: 'A content model your editors understand, in a CMS they do not need training to use twice.'
pillar: 'migrate'
order: 20
definition: 'A headless CMS stores content without dictating how it is displayed, delivering it over an API to whatever front end you choose. The benefit is not the architecture — it is that content becomes reusable across a website, an app and a campaign without being copied three times.'
includes:
  - title: 'Content modelling workshops'
    body: 'We model around editorial intent rather than page layout, so a change of design does not require a change of schema.'
  - title: 'Editor experience design'
    body: 'Preview, validation and sensible defaults, so the CMS guides the editor rather than waiting to be filled in wrongly.'
  - title: 'Migration of existing content'
    body: 'Scripted, repeatable imports that can be run more than once as the model settles.'
  - title: 'Role and permission setup'
    body: 'Who can publish what, defined before launch rather than discovered afterwards.'
platforms:
  - title: 'Sanity'
    body: 'Best where the content model is unusual and the editing experience needs to be shaped around it.'
  - title: 'Contentful'
    body: 'Best where governance, roles and multi-market workflows matter more than modelling flexibility.'
  - title: 'Storyblok'
    body: 'Best where marketers want visual editing without giving up a structured model underneath.'
pricingNote: 'Priced after a modelling workshop. The variable is the number of distinct content types, not the number of pages.'
choosingAPartner:
  - title: 'Ask to see a content model they designed'
    body: 'A good one is legible to a marketer. If it only makes sense to a developer, editors will route around it.'
  - title: 'Ask how preview works'
    body: 'Editors who cannot see their change before publishing will publish to check, and your production site becomes the staging environment.'
houseView: 'Choosing the CMS is the easy decision and the one everyone spends longest on. The modelling is what determines whether the team is still happy in two years.'
faqs:
  - question: 'What is a headless CMS?'
    answer: 'A headless CMS stores and manages content but does not render it. Content is delivered over an API to a separate front end, which means the same content can serve a website, an app, and an email campaign without duplication.'
  - question: 'Is a headless CMS harder for non-technical editors?'
    answer: 'It should not be. A well-modelled headless CMS with working preview is usually easier than a page-builder, because there are fewer ways to break a layout. Difficulty comes from poor modelling, not from being headless.'
  - question: 'Which headless CMS should we choose?'
    answer: 'It depends on whether your constraint is modelling flexibility, editorial governance, or visual editing. We run a short workshop to establish which before recommending one.'
  - question: 'Can we migrate our existing content automatically?'
    answer: 'Mostly. Structured content maps cleanly. Content stored as freeform HTML needs a parsing pass, and some of it always needs an editor to review.'
atAGlance:
  - label: 'Category'
    value: 'Content platform implementation'
  - label: 'Best for'
    value: 'Teams publishing across several channels or markets from one content set'
  - label: 'Typical work'
    value: 'Modelling workshops, CMS setup, editor experience, content import'
  - label: 'Engagement'
    value: 'Fixed-scope project'
  - label: 'Pricing shape'
    value: 'Priced after a modelling workshop'
  - label: 'House view'
    value: 'The model matters more than the vendor'
relatedWork:
  - 'harbor-and-finch'
---

Every headless CMS demo looks the same and none of them show you the part that matters: what the model looks like after two years of real editorial use.

## Modelling around intent

A content type should describe what something _is_, not where it appears. The moment a field is called `homepage_third_block_heading`, the model has started encoding a layout, and the next redesign will require a migration.
