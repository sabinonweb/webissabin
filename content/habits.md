---
title: "Habits for Becoming a Better (Computer) Engineer"
date: 2026-09-09
---

The core shift: producing code/answers is now cheap. Judgment — deciding, verifying,
debugging, owning outcomes — is the scarce skill. These habits build that.

## 1. Timebox struggle before asking for help (AI or human)
Pick a number (30-45 min) and sit in "I don't know" before looking anything up.
Feels inefficient. Isn't — the struggle is what builds debugging intuition.
Debugging skill isn't a lookup table, it's pattern-matching built from having
personally been confused and worked through it many times.

## 2. Keep a postmortem log
After every bug or decision: 2-3 sentences — what happened, what you first thought
was wrong, what was actually wrong, why you missed it. Reread it periodically.
Turns raw experience into named, reusable judgment instead of letting it pass through.

## 3. Read real code, small and traced, not skimmed
Don't start with huge codebases. Find something small (~300 lines, one file if
possible) adjacent to what you're working on. Trace ONE path through it end to end
(e.g. one message from send to receive), function by function, in plain English,
skipping edge cases on the first pass. Ask AI only about single lines you get stuck
on — not "explain this whole file." Goal: be able to redraw the path from memory.

## 4. Build the small thing before the big thing
Isolate subproblems into tiny toy programs you can finish in a day, before wiring
them into the full system. You build real intuition per-piece this way, and when
the integrated version breaks later, you already know which piece to suspect.

## 5. Get a human feedback loop, not just AI
Talk through designs out loud with an advisor/peer/mentor who'll push back. Explaining
out loud forces rigor a chat window doesn't — you can't hand-wave to a skeptical human
the way you can accidentally hand-wave past your own gaps typing to AI.

## 6. Read primary sources and real failure postmortems
RFCs/specs over tutorials. Real outage writeups (Cloudflare, AWS, Google SRE
postmortems) over blog summaries. These teach what goes wrong in practice that
theory doesn't predict — the actual raw material of engineering judgment.

## 7. Touch real hardware / real constraints, not just simulation
Simulators hide the friction (jitter, packet loss, power limits, interference) that
real systems fail on. That friction is a teacher nothing else substitutes for.

## The AI usage rule (applies to all of the above)
1. Attempt an answer yourself first, badly, in writing.
2. Ask AI for tradeoffs/reasons, not verdicts ("what are the tradeoffs" not "what should I do").
3. Argue with its answer — push on "why," "what if this constraint changes," "what's
   the counterargument."
4. Make the decision yourself, one sentence, in your own words.
5. Close the chat and re-explain it from memory. Can't? You don't own it yet — go
   back to step 3.

Use AI freely for: explaining established concepts, boilerplate/glue code, research
acceleration. Do it yourself for: novel design decisions on your own work, the hard/
core logic, anything you'll be asked "why" about later (thesis defense, code review,
production incident).
