---
client: 'Lazy Meet'
featured: true
order: 30
title: 'Lazy Meet: joining the call so you do not have to'
description: 'A desktop app that joins your Google Meet calls at start time, muted and camera off, across up to three Google accounts.'
summary: 'Joins your calls at start time, muted and camera off, across three accounts.'
industry: 'Productivity'
services:
  - 'Apps'
techStack:
  - 'Electron'
  - 'TypeScript'
  - 'React'
  - 'Google Calendar API'
timeline: 'Feature-complete August 2026'
stats:
  - value: '3'
    label: 'Google accounts, kept separate'
  - value: '5 min'
    label: 'Calendar poll interval'
sections:
  - title: 'The problem'
    body: 'Running several Google accounts turns every meeting into a small sequence of chores: find the right session, open the link, mute, turn the camera off, join. Repeat it four times a day and eventually you join a call live and unmuted, or you stay chained to your desk so you do not.'
  - title: 'What we built'
    body: 'A desktop app that connects up to three Google accounts over OAuth, stores each refresh token encrypted in the system keychain, and checks every connected calendar every five minutes for meetings with a Meet link. Each account gets its own isolated browser session, so signing in to one never disturbs another.'
  - title: 'The join sequence'
    body: 'At join time it opens the meeting in that account session, confirms the microphone toggle reads as off, confirms the camera toggle reads as off, clicks Join, then verifies the in-call interface actually appeared. A native notification follows, with a button to bring the window forward.'
  - title: 'Failing safe'
    body: 'Google changes the Meet interface without notice, so every selector lives in one file. If either toggle state cannot be confirmed, the join is abandoned before the button is clicked. The app will occasionally skip a meeting after a Google redesign. It will never join one with your microphone live.'
outcome: 'Meetings join themselves at the scheduled minute, muted, whether the window is focused, minimised or behind everything else.'
placeholder: false
---

The core idea is small: a calendar already knows when your meetings are and where they live. Nothing else should need your attention.

## Beyond the calendar

Not every meeting arrives as a calendar invite, so links can be pasted in directly and either scheduled once or repeated weekly. Out-of-office days are respected, the join lead time is configurable (a minute early or exactly on the hour), and optional reminders fire beforehand for the calls you do want to prepare for.

## Read-only, by design

The Google integration requests `calendar.readonly` and nothing more. The app never writes to a calendar, never creates events, and never touches anything outside the meeting links it needs to open.
