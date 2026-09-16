---
title: "Week #4 of Curiosity"
date: 2026-09-21
description: ""
tags: ["essays"]
curious: true
---

week: 2026-09-15 to 2025-09-21
----------------

![A high-agency person steers their path instead of drifting with it](/curiosity/week4-high-agency.png)

- Patriliny and virilocality aren't really natural or the culture. It keeps women isolated from their natal family keeping them dependent on their husband. If there has to be a divorce or she is widowed, she looses her place in the structure and is easy to exploit. [Changing Norms of the Hindu Family](https://oceanofpdf.com/?s=seeing+like+a+feminist) 

- There is an interesting error that I ran into. Lemme explain it down below.

- Piece 1 — what happened: I tried to install rtmlib onnxruntime to run on my fingerspellings clips. And I ran `.venv/bin/pip install rtmlib onnxruntime` and it showed:

```

zsh: .venv/bin/pip: bad interpreter: 
/Users/sabinonweb/Documents/Projects/nsl/.venv/bin/python3.13: 
no such file or directory

```

- Piece 2 — what I first thought was wrong: 
    - Hypothesis uno: Symlink pointing to underlying interpreter is broken.
    - Hypothesis duo: There is a mechanism in macOS which stores the files not used in a while to iCloud drive but shows in the Finder ls/. This was another of the Hypothesis.  

- Piece 3 — what actually was wrong:  Shebang is a line in the first line of the scripts that the OS sees and moves to that folder path to find the interpreter in order to understand the script written below. Due to me moving files, it was broken and shebang being static was not updated.

- Piece 4 - why did I miss it: We didn't check if folder was moved earlier. We went fancy instead of going basic first.

### Commands I ran:

- Checking for Hypothesis uno

```
ls -la .venv/bin/ | grep python — is the venv's own python3.13
```

```
ls -la /opt/homebrew/opt/python@3.13/bin/
```

```
ls -la .../Frameworks/Python.framework/Versions/3.13/bin/python3.13
```

- Checking for Hypothesis duo
```
ls -la .../Frameworks/Python.framework/Versions/3.13/bin/python3.13
```

- Explored a little bit of agency, thanks to [voidash dai](https://ash9.dev)

- Great thing about it? I always thought everything is learnable. Not saying I am great for thinking this but yes. I can change the situation I am in. How? By finding the people who are good at it, observe, learn from them. This is an experiment-based statement for me. It might sound like an anecdote, but for me it has happened. Use Neovim inspired from people who got taste, learn rust, write blogs, read books. There is lot more to explore on this part. [Agency > Intelligence](https://x.com/karpathy/status/1894099637218545984)

- Another great thing about Agency is it runs in it's own core principle i.e. everything is learnable and so is agency.
