---
title: "BuzzGREP"
date: 2023-10-21
description: "A lightweight implementation of the Unix grep utility in Rust."
github: "https://github.com/sabinonweb/BuzzGREP"
stack: ["rust", "cli"]
project: true
---

BuzzGREP is a **small clone of the Unix `grep` utility, written in Rust**:
it searches text files for a pattern and prints every matching line to the
terminal. Run it with `cargo run -- <pattern> <file>`; search is
case-sensitive, just like the real thing.

It was built as a deliberate learning exercise — the goal wasn't to
out-grep grep, but to learn Rust by rebuilding a tool whose behavior
everybody already knows:

- file reading and line-by-line iteration
- parsing command-line arguments without a framework
- iterators and string handling the Rust way
- proper error handling instead of panics

Small scope, honest constraints — the best kind of practice project.

[View on GitHub](https://github.com/sabinonweb/BuzzGREP)
