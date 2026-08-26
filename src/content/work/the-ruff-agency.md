---
client: 'The Ruff Agency'
featured: true
order: 40
title: 'The Ruff Agency: one workspace instead of six tools'
description: 'A multi-tenant agency platform holding clients, contracts, invoices, tasks and a client-facing portal in a single workspace with role-based access.'
summary: 'Clients, contracts, invoices, tasks and a client portal in one shared workspace.'
industry: 'Agency operations'
services:
  - 'Apps'
  - 'Tools & Systems'
techStack:
  - 'Next.js'
  - 'Supabase'
  - 'Stripe'
  - 'Paystack'
timeline: 'April to August 2026, still shipping'
liveUrl: 'https://theruff.agency'
stats:
  - value: '88'
    label: 'Database migrations shipped'
  - value: '20+'
    label: 'Tables under row-level security'
sections:
  - title: 'The problem'
    body: 'Agencies run on scattered infrastructure. Clients live in a spreadsheet, invoices in a separate system, payment tracking in someone head, and project handoffs in email. Growing the business means buying another tool, and teams work in silos because there is nowhere central to see who is doing what.'
  - title: 'What we built'
    body: 'A workspace where contacts, contracts, invoices and tasks all sit together, and every member sees the same data gated by their role. Clients get their own portal on a workspace subdomain with independent credentials — the same records, a different view, read-only or collaborative depending on what they are given.'
  - title: 'The hard part: two access patterns, one database'
    body: 'Team access had to be added to a schema whose policies assumed a single owner, across more than twenty tables, without a single existing read path breaking. The answer was two SECURITY DEFINER functions that resolve workspace membership once, referenced from permissive policies everywhere else. Postgres ORs permissive policies together, so the original owner-only check and the new member check coexist: adding a teammate can only ever grant access, never revoke it.'
  - title: 'Getting paid'
    body: 'Invoices carry their own lifecycle from draft through sent to paid, with customisable templates, and settle through Stripe or Paystack depending on where the client is. Transactional email runs on Resend, and a WhatsApp bot pushes task updates to people who live in messaging rather than dashboards.'
outcome: 'A client goes from invited to working inside their own portal without manual setup, pending approvals or a single email thread.'
placeholder: false
---

The Ruff Agency is the platform an agency runs on, built because the alternative was renting five products that do not know about each other.

## Beyond the core

An admin-only playground generates marketing assets through DALL-E 3 and Gemini, with a reference-image workflow and prompt review before anything is produced. A separate vault holds legal, brand and finance documents with a visibility model that decides which portals can see what, so a contract shared with one client is not quietly readable by another.

## Not built yet

The image pipeline is still beta and admin-gated — the backend and types are done, the model picker for everyone else is not. There is no CRM automation, no SAML or SSO for team members, and no native mobile app. Onboarding is invite-only, by hand.
