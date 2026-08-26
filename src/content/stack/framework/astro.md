---
category: 'framework'
name: 'Astro'
recommended: true
order: 10
title: 'Astro'
description: 'Astro is a web framework that renders to static HTML by default and ships JavaScript only where you ask for it.'
positioning: 'Our default for content-heavy marketing sites, because the fast path is also the default path.'
definition: 'Astro is a web framework built around islands architecture: pages render to static HTML on the server, and interactive components hydrate individually rather than the whole page booting a framework runtime.'
chooseWhen:
  - 'The site is content-heavy and mostly static'
  - 'Core Web Vitals or AI-crawler legibility are explicit goals'
  - 'You want to use React, Svelte or Vue components without shipping the whole runtime'
lookElsewhereWhen:
  - 'The product is an application with pervasive client-side state'
  - 'You need a mature server-side rendering story for authenticated, per-user pages'
pricingNote: 'Open source. Cost is hosting only.'
houseView: 'Most marketing sites built on an application framework are paying a runtime tax for interactivity they use on two components. Astro inverts the default.'
faqs:
  - question: 'What is Astro best used for?'
    answer: 'Astro is best for content-heavy sites (marketing sites, documentation, blogs) where most pages are static and only a few components need interactivity. It renders to HTML by default and ships JavaScript only for components you explicitly hydrate.'
  - question: 'Can you use React with Astro?'
    answer: 'Yes. Astro supports React, Svelte, Vue and others as islands. The component runs on the server by default and only ships its framework runtime if you mark it for hydration.'
atAGlance:
  - label: 'Category'
    value: 'Web framework'
  - label: 'Best for'
    value: 'Content-heavy, mostly-static sites'
  - label: 'Pricing shape'
    value: 'Open source'
  - label: 'House view'
    value: 'The fast path is the default path'
placeholder: true
---

Placeholder technology page. The assessment is written to exercise the template and should be reviewed before launch.
