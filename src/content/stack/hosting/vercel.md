---
category: 'hosting'
name: 'Vercel'
recommended: true
order: 10
title: 'Vercel'
description: 'Vercel is a hosting platform for frontend frameworks, with preview deployments and edge delivery built in.'
positioning: 'Our default host, largely because preview deployments change how review conversations happen.'
definition: 'Vercel is a deployment platform for frontend applications. Every branch gets a preview URL, static assets are served from a global edge network, and server functions run without infrastructure configuration.'
chooseWhen:
  - 'You want a preview URL on every pull request without configuring it'
  - 'The framework is one Vercel supports first-class'
  - 'You do not want to own build infrastructure'
lookElsewhereWhen:
  - 'Your organisation requires hosting inside its own cloud account'
  - 'Egress-heavy workloads make usage pricing unpredictable'
pricingNote: 'Free for personal projects, per-seat for teams, usage-based above that. The variable most teams underestimate is bandwidth.'
houseView: 'Preview deployments are the feature that actually pays for the platform. Stakeholders reviewing a real URL give better feedback than stakeholders reviewing a screenshot.'
faqs:
  - question: 'What is Vercel used for?'
    answer: 'Vercel hosts frontend applications and static sites, providing global edge delivery, serverless functions and a preview deployment for every branch without additional configuration.'
  - question: 'Do you need Vercel to deploy Astro?'
    answer: 'No. Astro produces static output that any host can serve. Vercel adds preview deployments and a server runtime for API routes, which is why we default to it.'
atAGlance:
  - label: 'Category'
    value: 'Hosting'
  - label: 'Best for'
    value: 'Teams who want previews and edge delivery without configuring them'
  - label: 'Pricing shape'
    value: 'Seats plus usage'
  - label: 'House view'
    value: 'Preview deployments justify it on their own'
placeholder: true
---

Placeholder technology page. The assessment is written to exercise the template and should be reviewed before launch.
