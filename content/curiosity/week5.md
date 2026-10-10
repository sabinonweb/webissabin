---
title: "Week #5 of Curiosity"
date: 2026-09-28
description: "Agency and Rivers"
tags: ["essays"]
curious: true
---

## week: 2026-10-05 to 2026-10-12

## Setting up nvim from scratch

I have been trying to set up my nvim from scratch because last time I just copied my friend's config, and the kind of person that I am, it made me feel guilty.

### Tabs vs spaces

Something that amazed me is tabs vs spaces. It turns out TAB inserts just one `[TAB]` character but makes it look like it has moved a certain distance on the screen.

```lua

    vim.opt.expandtab = true -- TAB inserts spaces instead of one [TAB]
    vim.opt.tabstop = 4      -- the 4 spaces come from here
    vim.opt.shiftwidth = 4   -- auto indentation, >> and <<

```

### Why a plugin manager?

Why do I need one? That was the question I asked. Turns out without one, I have to `git clone` the plugin into a folder, tell nvim where it is, and `git pull` on each update, which gets tedious. Therefore, `lazy`.

### Language servers

Neovim doesn't understand any language on its own, but it needs something to show errors for the dev's convenience. For that reason, a language server runs in the background that looks for errors, types, definitions and autocorrect, and talks to nvim via LSP.

For other languages, I used `lspconfig` instead of writing this by hand:

```lua

    vim.lsp.config("rust_analyzer", {
      cmd = { "rust-analyzer" },
      filetypes = { "rust" },
      root_markers = { "Cargo.toml" },
    })

```

Mason installs the servers.

### `gd`

Default `gd` in nvim searches for the declaration. It moves to the top of the function, then a line above it, and starts searching down. I mapped it to jump to the declaration.

### The leader key bug

I was moving my keymaps to a `keymaps.lua` file and leader suddenly stopped working. It fell back to `\`. That's because `mapleader` is `\` by default, and my `init.lua` looked like this:

```lua

    require("config.keymaps")

    vim.g.mapleader = " "

```

## Symlinks

I stumbled upon something today that caught my attention. I was trying to create a dotfiles folder, but everything was linked to `~/.config`. That's how I learned about symlinks: files that just point to where the actual file lives.

To actually understand it, I ran 2 experiments.

### Experiment I

```sh

    mkdir ~/symtest && cd ~/symtest
    echo "hello" > note.txt
    ln -s note.txt link.txt
    ls -l
    echo link.txt

```

`echo link.txt` gives "hello". `link.txt` → `note.txt`. That's a symlink.

### Experiment II

```sh

    echo "world" >> link.txt   # goes to link.txt, sees note.txt, and edits it
    cat note.txt               # gives "world"
    echo "hello" >> link.txt
    echo "hello" >> link.txt   # "world\nhello"

```

If we remove `note.txt`, `cat link.txt` throws an error.

## Why did my 3-year-old codebase break without me touching it?

Spotify stopped sending the `popularity` field, but old rspotify required it. It broke because, while deserializing, serde requires every required field to have a value. It was fixed by upgrading rspotify, whose newer version made it an `Option`.

## Pagination

I needed to download 2688 songs from Spotify, but `client.playlist()` returned 100 songs and stopped. That's because Spotify only sends 100 songs at a time.

With `client.playlist_items()`, I was able to fetch all 2688, because rspotify runs a loop that keeps refilling the stream instead of stopping at 100. Each response has a `next` field:

```json

    "next": "https://api.spotify.com/v1/playlists/7fGZ.../items?offset=100&limit=100"

```

It checks whether `next` is null. If it isn't, it calculates the next offset. `yield` returns a value and pauses until `next()` is called again.

Try my Spotify downloader at [yuck_premium](https://github.com/sabinonweb/yuck_premium).

## Quote of the week

> "Follow your heart" is a marketing slogan, not life advice. Your heart wants tacos at midnight and drunk texts your ex. Try following your mind for once.
