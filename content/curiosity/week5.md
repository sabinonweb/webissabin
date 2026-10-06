---
title: "Week #5 of Curiosity"
date: 2026-09-28
description: "Agency and Rivers"
tags: ["essays"]
curious: true
---

## week: 2026-10-05 to 2025-10-12

- I have been trying to setup my nvim from scratch because last time I just copied my friend's config and the kind of person that I am, it made me feel guilty. And something that amazed me is the tab vs space. It turns out TAB inserts just one [TAB] character but makes it look like it's moved a certain distance in the screen. So, in nvim `vim.opt.expandtab = true`, I added this in order to set TAB to insert 4 spaces rather than just one [TAB]. 4 spaces come from `vim.opt.tabstop = 4`. `vim.opt.shiftwidth = 4 ` is for nvim's auto indentation, >> and <<.

- Why use a plugin manager? Why do I need it was the question I asked. Turns out without one, I have to `git clone` a the plugin in a folder, tell nvim where it is, `git pull` on each update which gets tedious. Therefore, `lazy`.

- Okay so neovim doesn't understand any language on it's own. But it needs something to show the errors for dev's convenience. For that reason, a language server runs in the background that sees for errors, type, definitions, autocorrect and communicates to nvim via LSP.

- Default `gd` in nvim searches declaration. It moves to the top of the function, then a line above it and starts searching down. I mapped it to jump to the declaration.

- For other languages, I used `lspconfig` instead of

```
vim.lsp.config("rust_analyzer", {
  cmd = { "rust-analyzer" },
  filetypes = { "rust" },
  root_markers = { "Cargo.toml" },
})
```

Mason installs it.

- There was another interesting error. I was moving the keymaps to `keymaps.lua` file and leader suddenly stopped working and it fellback to `\`. It is because mapleader is set to `\` by default and my `init.lua` was mapped as:

```
require("config.keymaps")

vim.g.mapleader = " "

```

- ## Symlink
  I stummbled upon something today. It caught my attention. I was trying to create a dotfiles folder but everything was linked to `~/.config`. I got to know about symlinks. These are files that just point to the direction of where the actual file lives.

To actually understand it, I ran 2 experiments:

### Experiment I

1. `mkdir ~/symtest && cd ~/symtest`
2. `echo "hello" > note.txt`
3. `ln -s note.txt link.txt`
4. `ls -l`
   5 .`echo link.txt` gives "hello". `link.txt`: [note.txt]. That's simlink.

### Experiment II

1. `echo "world" >> link.txt` -> It goes to `link.txt`, sees `note.txt` and edits it.
2. `cat note.txt` -> It gives "world".
3. `echo "hello" >> link.txt`
4. `echo "hello" >> link.txt` -> "world\nhello"

If we remove the `note.txt`, `cat link.txt` throws an error.
