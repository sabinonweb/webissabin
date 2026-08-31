---
title: "Don't Spill the Tea"
date: 2024-11-16
description: "A browser extension that grabs images off the screen and flags violent or NSFW content."
github: "https://github.com/Don-t-spill-the-Tea/tea_extension"
stack: ["javascript", "browser-extension", "ml"]
project: true
---

Don't Spill the Tea is a browser extension that watches the images on your
screen and **warns you before you see something you didn't ask for** —
violent or NSFW content gets flagged before it lands in your eyes. The
internet is full of ambushes; this is a small shield.

How it works, end to end:

- The extension observes images as pages load.
- Each image is passed through a **content classifier** that scores it for
  violent or explicit material.
- Anything over the threshold is blurred or badged until you consciously
  choose to reveal it.

It's a consent layer for your own attention — not a filter that decides for
you, but a speed bump that makes the decision *yours* again.

The project is a neat crossover of browser-extension engineering (content
scripts, permissions, page lifecycle) and running an ML model close to the
user, privately, without shipping their images anywhere.

[View on GitHub](https://github.com/Don-t-spill-the-Tea/tea_extension)
