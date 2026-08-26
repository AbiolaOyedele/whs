---
category: 'framework'
name: 'Astro vs Next.js'
recommended: false
order: 30
title: 'Astro vs Next.js'
description: 'A head-to-head comparison of Astro and Next.js for marketing sites, covering JavaScript payload, rendering model and lock-in.'
positioning: 'The short version: Astro for content, Next.js for applications. The long version is below.'
definition: 'Astro and Next.js solve overlapping problems from opposite defaults. Astro renders to HTML and adds JavaScript where you ask. Next.js renders React and removes JavaScript where you let it. For a content-heavy marketing site that difference decides most of the outcome.'
chooseWhen:
  - 'Choose Astro when the site is content-first and mostly static'
  - 'Choose Astro when Core Web Vitals or AI-crawler legibility are explicit goals'
lookElsewhereWhen:
  - 'Choose Next.js when the site shares a codebase with a React product'
  - 'Choose Next.js when pages are personalised per authenticated user'
chooseLabel: 'Choose Astro when'
headToHead:
  optionA: 'Astro'
  optionB: 'Next.js'
  rows:
    - aspect: 'Best-fit surface'
      a: 'Content sites, docs, marketing estates'
      b: 'Applications and product-adjacent marketing'
    - aspect: 'Default JS payload'
      a: 'Near zero; opt in per component'
      b: 'React runtime by default; opt out per route'
    - aspect: 'Rendering model'
      a: 'Static-first with islands'
      b: 'Server components with client boundaries'
    - aspect: 'UI layer'
      a: 'Any framework, or none'
      b: 'React'
    - aspect: 'Hosting'
      a: 'Any static host; adapters for server routes'
      b: 'Node runtime, or a platform that provides one'
    - aspect: 'Lock-in'
      a: 'Low; output is largely plain HTML'
      b: 'Moderate; tied to React and its conventions'
pricingNote: 'Both are open source. The cost difference is hosting: static delivery is cheaper than per-request rendering.'
houseView: 'The question is almost never which framework is better. It is whether your site is a document collection or an application. Answer that and the framework picks itself.'
faqs:
  - question: 'Is Astro faster than Next.js?'
    answer: 'For content-heavy static pages, usually yes, because Astro ships no JavaScript unless a component asks for it. For an application with pervasive client-side state the comparison stops being meaningful — they are solving different problems.'
  - question: 'Can you migrate from Next.js to Astro?'
    answer: 'Yes, and React components often move across unchanged since Astro can render them. The work is in the routing and data-fetching layer, not usually in the components.'
atAGlance:
  - label: 'Category'
    value: 'Framework comparison'
  - label: 'Short answer'
    value: 'Astro for content, Next.js for applications'
  - label: 'House view'
    value: 'Decide whether it is a document or an application first'
placeholder: true
---

Placeholder technology page. The assessment is written to exercise the template and should be reviewed before launch.
