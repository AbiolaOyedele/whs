---
client: 'Dumpty'
featured: true
order: 10
title: 'Dumpty: voice notes that arrive already organised'
description: 'A mobile-first PWA that records an idea by voice and returns a clean transcript, a title, tags, an action plan and optional AI peer review.'
summary: 'Talk through an idea and get back a clean transcript, tags and a checklist.'
industry: 'Consumer product'
services:
  - 'Apps'
  - 'Tools & Systems'
techStack:
  - 'Next.js'
  - 'Supabase'
  - 'Deepgram'
  - 'Claude API'
timeline: 'July 2026'
stats:
  - value: '15 min'
    label: 'Longest single capture'
  - value: 'Offline'
    label: 'Captured, queued, synced later'
sections:
  - title: 'The problem'
    body: 'Ideas turn up while you are walking, driving or between meetings. A voice memo captures the thought and then buries it: raw, untitled, unsearchable, needing exactly the cleanup work you did not have time for in the first place.'
  - title: 'What we built'
    body: 'One tap records. Deepgram transcribes. Claude then reads the raw transcript and returns a clean version with a one-line title, three to five tags, and content split by topic. The idea lands in the library already searchable, already labelled, with nothing left to file.'
  - title: 'Turning ideas into next steps'
    body: 'Every idea can be expanded into an interactive checklist of next steps, or sent to the Kingsmen Council, a panel of AI agents that critique the idea for feasibility and return a verdict with a confidence rating. Both sit behind a credit system, so the expensive work only runs when it is asked for.'
  - title: 'Reminders from plain speech'
    body: 'Saying “remind me tomorrow evening” has to become an exact instant in UTC. The model reads the intent, but the result is validated before anything is scheduled: it must parse as ISO-8601, it must be in the future, and it is resolved against the timezone and local date of the recording. Say “remind me at 3pm” after 3pm and it schedules for tomorrow.'
  - title: 'Offline first, not offline eventually'
    body: 'Ideas are captured to IndexedDB and synced when the connection returns, because the moment you have an idea is rarely the moment you have signal. Nothing is lost to a dead spot.'
outcome: 'Raw voice goes in. A titled, tagged, segmented idea with a set of next steps comes out, without anyone doing the filing.'
placeholder: false
---

Dumpty is built for the gap between having an idea and doing anything about it. That is the stretch where most ideas quietly die, because turning them into something usable is work.

## Where the data lives

Everything is indexed in Supabase with row-level security, so an idea is readable only by the person who recorded it. Audio goes to Cloudflare R2 and deletes itself after seven days; the transcript and the processed output are what persist.

## Still to come

Typing an idea instead of speaking it is scaffolded on the backend but has no interface yet. Idea validation and media upload are planned and unwritten.
