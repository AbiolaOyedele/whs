---
client: 'Marvy'
order: 60
title: 'Marvy: course videos filed in one step'
description: 'A desktop app for a course-production team that finds the right Google Drive folder, uploads each video and its audio, and tags the right reviewers.'
summary: 'Drop a video in and it lands in the right Drive folder, with the right people tagged.'
previews:
  - 'marvy'
industry: 'Internal tools'
services:
  - 'Apps'
  - 'Tools & Systems'
techStack:
  - 'Electron'
  - 'React'
  - 'Google Drive API'
  - 'SQLite'
timeline: 'September to October 2026'
sections:
  - title: 'The problem'
    body: 'A course-production team uploads videos to shared Google Drive folders all day. For every video someone found the folder by hand, dragged the file in, opened the tag sheet, copied four groups of email addresses and pasted four comments. Twenty videos in a sitting meant the same routine twenty times.'
  - title: 'What we built'
    body: 'Marvy reads the course code and week from the filename, finds the folder, checks the person has access and that the video is not already there, then uploads the video with its matching audio. The @mention comments come from the tag sheet and post as whoever is signed in, so it is always clear who did what. Every video then sits on one board with the team’s own statuses, through to final render.'
  - title: 'Quiet by default'
    body: 'The happy path asks nothing. Marvy only speaks up when something looks wrong, and then asks one clear question. A near match is shown, never accepted, and nothing it does can delete anything in Drive.'
  - title: 'Built for the team’s own machines'
    body: 'It runs entirely on the computer it is installed on, with no server and no tracking; the only thing it talks to is Google. The window works from 375 pixels wide to full screen, because people keep it docked beside After Effects between renders.'
outcome: 'Nobody on the team has to think about where a video goes.'
---
