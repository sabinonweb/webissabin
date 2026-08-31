---
title: "sabinnylol"
date: 2024-02-18
description: "A lightweight URL command shortener in Rust + Actix-web, inspired by Bunnylol."
github: "https://github.com/sabinonweb/sabinnylol"
stack: ["rust", "actix-web"]
project: true
---

sabinnylol is a **command shortener** — a tiny personal search-hub inspired
by Bunnylol. You set your browser's default search to your sabinnylol
instance, and then short commands in the address bar become instant
navigation:

- `gh` → your GitHub
- `tw` → Twitter/X
- `mail` → your inbox
- anything unknown → falls through to a real search engine

The magic is that it's *yours*: every shortcut is a key–value pair you
defined, living on a server you control, reached through the one input box
you already open a hundred times a day — the address bar.

Under the hood it's about a hundred lines of **Rust with Actix-web**: read
the query, look up the mapping, redirect (302, so the browser history stays
clean). Deployed, it idles at basically zero resources. A small project that
pays for itself every single day.

[View on GitHub](https://github.com/sabinonweb/sabinnylol)
