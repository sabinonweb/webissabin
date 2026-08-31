---
title: "Yuck Premium"
date: 2024-05-16
description: "A command-line app to download tracks, playlists and albums from Spotify."
github: "https://github.com/sabinonweb/yuck_premium"
stack: ["rust", "cli"]
project: true
---

Yuck Premium is a **command-line downloader for Spotify** — give it a track,
a playlist, or an album, and it fetches the audio and saves it locally, with
metadata (title, artist, cover art) written into the files so your music
library stays organized.

It's a CLI because a CLI is the right shape for this job: you're already in
the terminal, you want it scripted or batched, and you want it fast. Rust
makes the "fast" part easy — downloads run concurrently, and the binary
starts instantly with no runtime to warm up.

What makes it work:

- **One command, any input** — a track URL, a playlist link, or an album all
  work through the same interface.
- **Metadata-first output** — files land named and tagged correctly, not as
  `track01.mp3`.
- **Concurrent downloads** — a full playlist finishes in the time of its
  slowest item, not the sum of all of them.

The fun part of this project was API archaeology: reading what the web client
actually does and mirroring it faithfully in Rust types.

[View on GitHub](https://github.com/sabinonweb/yuck_premium)
